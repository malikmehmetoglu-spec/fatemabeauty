-- 0150 — VIP clients + daily room reserve (10% of each room's bookable time, staff-only).
-- Non-destructive: add column if not exists / create or replace (same arguments) / new functions only.

/* ---------------- 1. columns + settings ---------------- */
alter table public.patients add column if not exists vip boolean not null default false;
alter table public.appointments add column if not exists vip boolean not null default false;
create index if not exists appointments_room_start_idx on public.appointments (room_id, starts_at);

insert into public.settings (key, value) values ('vip_reserve_pct', '10'::jsonb) on conflict (key) do nothing;
insert into public.settings (key, value) values ('vip_reserve_last_hours', '2'::jsonb) on conflict (key) do nothing;

create or replace function private.setting_num(p_key text, p_default numeric, p_min numeric, p_max numeric)
returns numeric language sql stable security definer set search_path = '' as $$
  select least(p_max, greatest(p_min, coalesce(
    (select case when jsonb_typeof(value) = 'number' then (value #>> '{}')::numeric
                 when jsonb_typeof(value) = 'string' and (value #>> '{}') ~ '^[0-9]+(\.[0-9]+)?$' then (value #>> '{}')::numeric end
     from public.settings where key = p_key), p_default)));
$$;
create or replace function private.reserve_pct() returns numeric language sql stable security definer set search_path = '' as $$
  select private.setting_num('vip_reserve_pct', 10, 0, 50);
$$;
create or replace function private.reserve_last_hours() returns numeric language sql stable security definer set search_path = '' as $$
  select private.setting_num('vip_reserve_last_hours', 2, 0, 12);
$$;

/* ---------------- 2. patients.vip: admin/owner only ---------------- */
create or replace function private.guard_patient_vip()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (tg_op = 'INSERT' and new.vip) or (tg_op = 'UPDATE' and new.vip is distinct from old.vip) then
    if coalesce(current_setting('app.vip_ok', true), '') <> '1' then raise exception 'not allowed: vip'; end if;
  end if;
  return new;
end $$;
create or replace trigger patients_vip_guard before insert or update on public.patients
  for each row execute function private.guard_patient_vip();

create or replace function public.set_patient_vip(p_id uuid, p_vip boolean)
returns public.patients language plpgsql security definer set search_path = '' as $$
declare p public.patients;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed: vip'; end if;
  perform set_config('app.vip_ok', '1', true);
  update public.patients set vip = coalesce(p_vip, false) where id = p_id returning * into p;
  perform set_config('app.vip_ok', '', true);
  if p.id is null then raise exception 'unknown patient'; end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), case when p.vip then 'patient.vip_on' else 'patient.vip_off' end, p.id::text, jsonb_build_object('name', p.name, 'file_no', p.file_no));
  return p;
end $$;
revoke all on function public.set_patient_vip(uuid, boolean) from public, anon;
grant execute on function public.set_patient_vip(uuid, boolean) to authenticated;

/* ---------------- 3. room capacity / reserve ---------------- */
-- A room's bookable minutes on a day: union of the hours of active staff (not on leave) who provide a service in that room;
-- with nobody configured → the centre's default hours. m_end = the room's closing minute that day.
create or replace function private.room_day(p_room uuid, p_day date)
returns table(capacity integer, m_end integer) language plpgsql stable security definer set search_path = '' as $$
declare dow int := extract(dow from p_day)::int; ids uuid[];
begin
  select array_agg(s.id) into ids from public.staff s
  where s.active
    and exists (select 1 from public.services v where v.room_id = p_room and v.active and private.staff_provides(s.id, v.key))
    and not exists (select 1 from public.leave_requests l where l.staff_id = s.id and l.status = 'approved' and p_day between l.starts and l.ends);
  if ids is null then
    -- nobody provides this room's services: default hours, unless the room only has consultations (need a consultant)
    if exists (select 1 from public.services v where v.room_id = p_room and v.active and not v.is_consultation) then
      return query select coalesce(count(distinct m), 0)::int, coalesce(max(d.m_to), 0)::int
        from private.default_hours_on(dow) d, generate_series(d.m_from, d.m_to - 1) m;
    else
      return query select 0, 0;
    end if;
    return;
  end if;
  return query select coalesce(count(distinct m), 0)::int, coalesce(max(r.m_to), 0)::int
    from unnest(ids) x(id), lateral private.staff_ranges(x.id, dow) r, generate_series(r.m_from, r.m_to - 1) m;
end $$;

create or replace function private.room_booked(p_room uuid, p_day date, p_ignore uuid default null)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(sum(a.minutes + a.extension_minutes), 0)::int from public.appointments a
  where a.room_id = p_room and a.status in ('pending', 'confirmed', 'checked_in', 'in_session', 'done')
    and a.starts_at >= (p_day::timestamp at time zone 'Asia/Damascus')
    and a.starts_at < ((p_day + 1)::timestamp at time zone 'Asia/Damascus')
    and (p_ignore is null or a.id <> p_ignore);
$$;

/** Public/app rule: may this booking go into the room without eating the staff-only reserve? */
create or replace function private.reserve_ok(p_room uuid, p_starts timestamptz, p_minutes integer)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare d date; cap int; pct numeric := private.reserve_pct();
begin
  if p_room is null or pct <= 0 then return true; end if;
  d := (p_starts at time zone 'Asia/Damascus')::date;
  select r.capacity into cap from private.room_day(p_room, d) r;
  return private.room_booked(p_room, d) + coalesce(p_minutes, 0) <= floor(coalesce(cap, 0) * (100 - pct) / 100.0);
end $$;

/** Staff: per room for a day — capacity, booked, reserve size and what is left of it; walk_in_open = last N hours (today). */
create or replace function public.reserve_status(p_day date default null)
returns table(room_id uuid, room_name text, capacity integer, booked integer, reserve integer, reserve_left integer,
              closes_at integer, walk_in_open boolean)
language plpgsql stable security definer set search_path = '' as $$
declare d date := coalesce(p_day, (now() at time zone 'Asia/Damascus')::date); pct numeric := private.reserve_pct();
        lh numeric := private.reserve_last_hours(); nowm int; today date := (now() at time zone 'Asia/Damascus')::date;
begin
  if not private.is_staff() then raise exception 'not allowed'; end if;
  nowm := extract(hour from now() at time zone 'Asia/Damascus')::int * 60 + extract(minute from now() at time zone 'Asia/Damascus')::int;
  return query
    select r.id, r.name, rd.capacity, b.bk,
           ceil(rd.capacity * pct / 100.0)::int,
           greatest(0, least(ceil(rd.capacity * pct / 100.0)::int, rd.capacity - b.bk))::int,
           rd.m_end,
           (d = today and rd.m_end > 0 and nowm >= rd.m_end - (lh * 60)::int and nowm < rd.m_end)
    from public.rooms r
    cross join lateral private.room_day(r.id, d) rd
    cross join lateral (select private.room_booked(r.id, d) bk) b
    where coalesce(r.active, true)
    order by r.name;
end $$;
revoke all on function public.reserve_status(date) from public, anon;
grant execute on function public.reserve_status(date) to authenticated;

/* ---------------- 4. public / patient paths respect the reserve ---------------- */
-- pick_staff_m: same body + the reserve check when the caller set app.reserve_cap = '1' (public link / patient app only).
create or replace function private.pick_staff_m(p_service text, p_starts timestamptz, p_specialist uuid, p_strict boolean, p_minutes integer)
returns table(ok boolean, sp uuid) language plpgsql stable security definer set search_path = '' as $$
declare svc public.services; ends timestamptz; pool uuid[]; pick uuid; ls timestamp; m_s int; v_min int;
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  v_min := coalesce(p_minutes, svc.minutes);
  ends := p_starts + make_interval(mins => v_min);

  if svc.room_id is not null and exists (select 1 from public.appointments a
      where a.room_id = svc.room_id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
        and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts) then
    return query select false, null::uuid; return;
  end if;

  -- staff-only reserve (VIP / urgent walk-ins): never offered on the public link or in the patient app
  if svc.room_id is not null and coalesce(current_setting('app.reserve_cap', true), '') = '1'
     and not private.reserve_ok(svc.room_id, p_starts, v_min) then
    return query select false, null::uuid; return;
  end if;

  if p_specialist is not null then
    if not p_strict and not exists (select 1 from public.staff s where s.id = p_specialist and s.active) then
      raise exception 'specialist not found';
    end if;
    if not private.staff_provides(p_specialist, p_service) then raise exception 'not_provider: هذه الأخصائية لا تقدّم هذه الخدمة'; end if;
    pool := array[p_specialist];
  else
    pool := private.service_pool(p_service, null);
  end if;
  if pool is null then
    ls := p_starts at time zone 'Asia/Damascus';
    m_s := extract(hour from ls)::int * 60 + extract(minute from ls)::int;
    return query select (not svc.is_consultation) and exists (
      select 1 from private.default_hours_on(extract(dow from ls)::int) d where d.m_from <= m_s and d.m_to >= m_s + v_min), null::uuid;
    return;
  end if;

  select s.id into pick from public.staff s
  where s.id = any(pool)
    and private.staff_available(s.id, p_starts, ends)
    and not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts)
  order by (select count(*) from public.appointments a
            where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
              and (a.starts_at at time zone 'Asia/Damascus')::date = (p_starts at time zone 'Asia/Damascus')::date), s.created_at
  limit 1;
  return query select pick is not null, pick;
end $$;

create or replace function public.public_slots(p_day date, p_service text, p_specialist uuid default null)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
begin
  perform set_config('app.reserve_cap', '1', true);
  return query select * from private.slot_grid(p_day, p_service, p_specialist, true);
  perform set_config('app.reserve_cap', '', true);
end $$;

create or replace function public.app_slots(p_day date, p_service text, p_specialist uuid default null)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_staff() then perform set_config('app.reserve_cap', '1', true); end if;
  return query select * from private.slot_grid(p_day, p_service, p_specialist, false);
  perform set_config('app.reserve_cap', '', true);
end $$;

create or replace function public.app_slots_v2(p_day date, p_service text, p_specialist uuid default null, p_level uuid default null, p_patient uuid default null)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
declare st boolean := private.is_staff(); l public.service_levels;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  l := private.resolve_level(p_service, p_level, case when st then p_patient else private.my_patient_id() end, st);
  if not st then perform set_config('app.reserve_cap', '1', true); end if;
  return query select * from private.slot_grid_m(p_day, p_service, p_specialist, false, l.minutes);
  perform set_config('app.reserve_cap', '', true);
end $$;

-- public_book / book_appointment_v2 (patient path): patch the existing bodies so the pick runs with the reserve cap.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.public_book(text,timestamptz,uuid,text,text,text)'::regprocedure);
  if position('app.reserve_cap' in d) = 0 then
    n := replace(d, 'select * into r from private.pick_staff(p_service, p_starts, p_specialist, true);',
      'perform set_config(''app.reserve_cap'', ''1'', true);
  select * into r from private.pick_staff(p_service, p_starts, p_specialist, true);
  perform set_config(''app.reserve_cap'', '''', true);');
    if n = d then raise exception 'public_book patch did not apply'; end if;
    execute n;
  end if;

  d := pg_get_functiondef('public.book_appointment_v2(text,timestamptz,uuid,uuid,uuid,text,text,text,boolean,uuid)'::regprocedure);
  if position('app.reserve_cap' in d) = 0 then
    n := replace(d, 'select * into r from private.pick_staff_m(p_service, p_starts, sp, false, v_min);',
      'perform set_config(''app.reserve_cap'', ''1'', true);
    select * into r from private.pick_staff_m(p_service, p_starts, sp, false, v_min);
    perform set_config(''app.reserve_cap'', '''', true);');
    if n = d then raise exception 'book_appointment_v2 patch did not apply'; end if;
    execute n;
  end if;

  -- appointment_rules: the VIP override may insert on top of an appointment it could not move (left for manual handling)
  d := pg_get_functiondef('private.appointment_rules()'::regprocedure);
  if position('app.vip_override' in d) = 0 then
    n := replace(d, 'if new_st in (''pending'', ''confirmed'') and (tg_op = ''INSERT''',
                    'if new_st in (''pending'', ''confirmed'') and coalesce(current_setting(''app.vip_override'', true), '''') <> ''1'' and (tg_op = ''INSERT''');
    if n = d then raise exception 'appointment_rules patch did not apply'; end if;
    execute n;
  end if;

  -- invoice line of a VIP appointment says «VIP» (price is already the appointment's ×1.7 snapshot)
  d := pg_get_functiondef('public.create_invoice(uuid,uuid,jsonb,integer,jsonb,uuid,text,date,text)'::regprocedure);
  if position('appt.vip' in d) = 0 then
    n := replace(d, 'select '' — '' || l.name into lvl_name from public.service_levels l where l.id = appt.level_id and l.level > 1;',
      'select '' — '' || l.name into lvl_name from public.service_levels l where l.id = appt.level_id and l.level > 1;
          if appt.vip then lvl_name := coalesce(lvl_name, '''') || '' — VIP''; end if;');
    if n = d then raise exception 'create_invoice patch did not apply'; end if;
    execute n;
  end if;
end $mig$;

/* ---------------- 5. VIP price + free-time finder (staff paths) ---------------- */
create or replace function private.vip_factor() returns numeric language sql immutable set search_path = '' as $$ select 1.7::numeric $$;

/** Level price in SYP × 1.7, rounded up to the nearest 5 ل.س. */
create or replace function private.vip_price(l public.service_levels)
returns integer language sql stable security definer set search_path = '' as $$
  select (ceil(coalesce(public.to_syp(l.price, l.price_currency), public.service_price_syp(l.service_key), 0) * private.vip_factor() / 5.0) * 5)::int;
$$;

create or replace function private.level_price_syp(l public.service_levels)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce(public.to_syp(l.price, l.price_currency), public.service_price_syp(l.service_key), 0)::int;
$$;

/**
 * Free start times for a service from p_from, over p_days days (staff hours, staff_services, room + specialist overlaps,
 * no reserve cap). Optional: ignore one appointment (the one being moved) and treat an extra window as busy
 * (the VIP being placed, for the room p_x_room and the specialist p_x_sp).
 */
create or replace function private.vip_find(p_service text, p_minutes integer, p_from timestamptz, p_days integer, p_specialist uuid,
  p_ignore uuid, p_x_from timestamptz, p_x_to timestamptz, p_x_room uuid, p_x_sp uuid, p_limit integer)
returns table(starts_at timestamptz, specialist_id uuid) language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare svc public.services; slot int; d0 date; d date; dow int; t int; st timestamptz; en timestamptz;
        pool uuid[]; fa int[]; ta int[]; pick uuid; n int := 0;
begin
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;
  slot := private.slot_minutes();
  d0 := (p_from at time zone 'Asia/Damascus')::date;
  pool := private.service_pool(p_service, p_specialist);
  if p_specialist is not null and not private.staff_provides(p_specialist, p_service) then
    raise exception 'not_provider: هذه الأخصائية لا تقدّم هذه الخدمة';
  end if;
  for i in 0 .. greatest(coalesce(p_days, 1), 1) - 1 loop
    d := d0 + i; dow := extract(dow from d)::int; fa := null; ta := null;
    if pool is null then
      if svc.is_consultation then return; end if;
      select array_agg(x.m_from), array_agg(x.m_to) into fa, ta from private.default_hours_on(dow) x;
    else
      select array_agg(x.m_from), array_agg(x.m_to) into fa, ta from unnest(pool) p(id), lateral private.staff_ranges(p.id, dow) x;
    end if;
    continue when fa is null;
    t := 0;
    while t + p_minutes <= 1440 loop
      if exists (select 1 from unnest(fa, ta) x(f, e) where x.f <= t and x.e >= t + p_minutes) then
        st := (d + make_interval(mins => t)) at time zone 'Asia/Damascus';
        en := st + make_interval(mins => p_minutes);
        if st >= p_from
           and not (p_x_from is not null and p_x_room is not null and p_x_room = svc.room_id and st < p_x_to and en > p_x_from)
           and (svc.room_id is null or not exists (
                 select 1 from public.appointments a
                 where a.room_id = svc.room_id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                   and (p_ignore is null or a.id <> p_ignore)
                   and a.starts_at < en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > st)) then
          if pool is null then
            starts_at := st; specialist_id := null; return next; n := n + 1;
          else
            select s.id into pick from public.staff s
            where s.id = any(pool) and s.active
              and private.staff_available(s.id, st, en)
              and not (p_x_from is not null and s.id = p_x_sp and st < p_x_to and en > p_x_from)
              and not exists (select 1 from public.appointments a
                              where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                                and (p_ignore is null or a.id <> p_ignore)
                                and a.starts_at < en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > st)
            order by (select count(*) from public.appointments a
                      where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
                        and (a.starts_at at time zone 'Asia/Damascus')::date = d), s.created_at
            limit 1;
            if pick is not null then starts_at := st; specialist_id := pick; return next; n := n + 1; end if;
          end if;
          if n >= coalesce(p_limit, 1) then return; end if;
        end if;
      end if;
      t := t + slot;
    end loop;
  end loop;
end $$;

/** Staff: the next free times today for a VIP / urgent walk-in (reserve included). */
create or replace function public.vip_next_slots(p_service text, p_level uuid default null, p_specialist uuid default null, p_limit integer default 6)
returns table(starts_at timestamptz, ends_at timestamptz, specialist_id uuid, specialist_name text, room_id uuid, room_name text,
              minutes integer, price integer, base_price integer, in_reserve boolean)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare svc public.services; l public.service_levels; today date := (now() at time zone 'Asia/Damascus')::date;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;
  l := private.resolve_level(p_service, p_level, null, true);
  return query
    select f.starts_at, f.starts_at + make_interval(mins => l.minutes), f.specialist_id, s.name, svc.room_id, r.name,
           l.minutes, private.vip_price(l), private.level_price_syp(l),
           not private.reserve_ok(svc.room_id, f.starts_at, l.minutes)
    from private.vip_find(p_service, l.minutes, now() - interval '5 minutes', 1, p_specialist, null, null, null, null, null, least(greatest(coalesce(p_limit, 6), 1), 12)) f
    left join public.staff s on s.id = f.specialist_id
    left join public.rooms r on r.id = svc.room_id
    where (f.starts_at at time zone 'Asia/Damascus')::date = today;
end $$;
revoke all on function public.vip_next_slots(text, uuid, uuid, integer) from public, anon;
grant execute on function public.vip_next_slots(text, uuid, uuid, integer) to authenticated;

/* ---------------- 6. booking into the reserve ---------------- */
create or replace function private.book_reserved(p_patient uuid, p_service text, p_level uuid, p_starts timestamptz,
  p_specialist uuid, p_check_in boolean, p_vip boolean)
returns public.appointments language plpgsql security definer set search_path = '' as $$
declare svc public.services; l public.service_levels; f_st timestamptz; f_sp uuid; rec public.appointments; v_price int; r_end int; nowm int;
        today date := (now() at time zone 'Asia/Damascus')::date;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_patient is null or not exists (select 1 from public.patients where id = p_patient) then raise exception 'patient required'; end if;
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;
  l := private.resolve_level(p_service, p_level, p_patient, true);
  if l.id is null then raise exception 'service not found'; end if;

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  if p_starts is null then
    select x.starts_at, x.specialist_id into f_st, f_sp from private.vip_find(p_service, l.minutes, now() - interval '5 minutes', 1, p_specialist, null, null, null, null, null, 1) x;
    if f_st is null or (f_st at time zone 'Asia/Damascus')::date <> today then raise exception 'no_vip_slot'; end if;
  else
    select x.starts_at, x.specialist_id into f_st, f_sp from private.vip_find(p_service, l.minutes, p_starts, 1, p_specialist, null, null, null, null, null, 1) x;
    if f_st is distinct from p_starts then raise exception 'slot taken'; end if;
  end if;

  if not p_vip then
    -- any walk-in may use the reserve only in the room's last N hours, today
    nowm := extract(hour from now() at time zone 'Asia/Damascus')::int * 60 + extract(minute from now() at time zone 'Asia/Damascus')::int;
    select r.m_end into r_end from private.room_day(svc.room_id, today) r;
    if (f_st at time zone 'Asia/Damascus')::date <> today or svc.room_id is null
       or nowm < coalesce(r_end, 0) - (private.reserve_last_hours() * 60)::int then
      raise exception 'reserve_walk_in_closed';
    end if;
    v_price := private.level_price_syp(l);
  else
    v_price := private.vip_price(l);
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, created_by, level_id, vip, note)
  values (p_patient, svc.key, f_sp, svc.room_id, f_st, l.minutes,
          case when p_check_in then 'checked_in'::public.appointment_status else 'confirmed'::public.appointment_status end,
          v_price, case when p_check_in then 'walk_in' else 'reception' end, auth.uid(), l.id, p_vip,
          case when not p_vip then 'حالة دون موعد من الاحتياطي' end)
  returning * into rec;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), case when p_vip then 'appointment.vip_book' else 'appointment.reserve_walk_in' end, rec.id::text,
          jsonb_build_object('patient', p_patient, 'service', svc.key, 'level', l.level, 'starts_at', rec.starts_at, 'price', v_price));
  return rec;
end $$;
revoke all on function private.book_reserved(uuid, text, uuid, timestamptz, uuid, boolean, boolean) from public, anon;

/** Reception/admin/owner: book a VIP at the nearest free time today (or p_starts), price = level × 1.7 (ceil 5). */
create or replace function public.book_vip(p_patient uuid, p_service text, p_level uuid default null, p_starts timestamptz default null,
  p_specialist uuid default null, p_check_in boolean default false)
returns public.appointments language sql security definer set search_path = '' as $$
  select * from private.book_reserved(p_patient, p_service, p_level, p_starts, p_specialist, p_check_in, true);
$$;
revoke all on function public.book_vip(uuid, text, uuid, timestamptz, uuid, boolean) from public, anon;
grant execute on function public.book_vip(uuid, text, uuid, timestamptz, uuid, boolean) to authenticated;

/** Reception: in the last N hours of the day, any walk-in may use the reserve (normal price). */
create or replace function public.book_reserve_walk_in(p_patient uuid, p_service text, p_level uuid default null, p_starts timestamptz default null,
  p_specialist uuid default null, p_check_in boolean default false)
returns public.appointments language sql security definer set search_path = '' as $$
  select * from private.book_reserved(p_patient, p_service, p_level, p_starts, p_specialist, p_check_in, false);
$$;
revoke all on function public.book_reserve_walk_in(uuid, text, uuid, timestamptz, uuid, boolean) from public, anon;
grant execute on function public.book_reserve_walk_in(uuid, text, uuid, timestamptz, uuid, boolean) to authenticated;

/* ---------------- 7. override: VIP on top of an existing appointment ---------------- */
create or replace function private.vip_override_plan(p_patient uuid, p_service text, p_level uuid, p_starts timestamptz,
  p_specialist uuid, p_check_in boolean, p_apply boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare svc public.services; l public.service_levels; en timestamptz; sp uuid; pool uuid[]; c record; a_st timestamptz; a_sp uuid;
        out_c jsonb := '[]'::jsonb; rec public.appointments; v_price int; blocked boolean := false; moved boolean; item jsonb;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  if p_starts is null then raise exception 'time required'; end if;
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;
  l := private.resolve_level(p_service, p_level, p_patient, true);
  en := p_starts + make_interval(mins => l.minutes);
  v_price := private.vip_price(l);

  if p_apply then perform pg_advisory_xact_lock(hashtext('book-appointments')); end if;

  -- specialist: the one asked for, else the on-duty provider with the fewest clashes in that window
  if p_specialist is not null then
    if not private.staff_provides(p_specialist, p_service) then raise exception 'not_provider: هذه الأخصائية لا تقدّم هذه الخدمة'; end if;
    sp := p_specialist;
  else
    pool := private.service_pool(p_service, null);
    if pool is not null then
      select s.id into sp from public.staff s
      where s.id = any(pool) and s.active and private.staff_available(s.id, p_starts, en)
      order by (select count(*) from public.appointments a where a.specialist_id = s.id
                  and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                  and a.starts_at < en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts), s.created_at
      limit 1;
      if sp is null then raise exception 'specialist off duty'; end if;
    end if;
  end if;

  for c in
    select a.*, coalesce(p.name, a.walk_in_name) nm, coalesce(p.phone, a.walk_in_phone) ph, v.name svc_name, st.name sp_name
    from public.appointments a
    left join public.patients p on p.id = a.patient_id
    left join public.services v on v.key = a.service_key
    left join public.staff st on st.id = a.specialist_id
    where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
      and a.starts_at < en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts
      and ((svc.room_id is not null and a.room_id = svc.room_id) or (sp is not null and a.specialist_id = sp))
    order by a.starts_at
  loop
    a_st := null; a_sp := null; moved := false;
    if c.status in ('pending', 'confirmed') then
      -- same specialist first, then anyone who provides the service; from now on, up to 14 days
      if c.specialist_id is not null and private.staff_provides(c.specialist_id, c.service_key) then
        select x.starts_at, x.specialist_id into a_st, a_sp from private.vip_find(c.service_key, c.minutes, greatest(now(), p_starts), 14, c.specialist_id, c.id, p_starts, en, svc.room_id, sp, 1) x;
      end if;
      if a_st is null then
        select x.starts_at, x.specialist_id into a_st, a_sp from private.vip_find(c.service_key, c.minutes, greatest(now(), p_starts), 14, null, c.id, p_starts, en, svc.room_id, sp, 1) x;
      end if;
      if p_apply and a_st is not null then
        update public.appointments set starts_at = a_st, specialist_id = coalesce(a_sp, specialist_id) where id = c.id;
        moved := true;
        insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'appointment.vip_displaced', c.id::text,
          jsonb_build_object('from', c.starts_at, 'to', a_st, 'specialist', a_sp));
      end if;
    else
      blocked := true;
    end if;
    item := jsonb_build_object('id', c.id, 'name', c.nm, 'phone', c.ph, 'service', c.svc_name, 'status', c.status,
      'starts_at', c.starts_at, 'minutes', c.minutes, 'specialist', c.sp_name,
      'movable', c.status in ('pending', 'confirmed'),
      'alt_starts_at', a_st, 'alt_specialist', (select name from public.staff where id = a_sp), 'moved', moved);
    out_c := out_c || jsonb_build_array(item);
  end loop;

  if p_apply then
    if blocked then raise exception 'vip_override_blocked: يوجد موعد بدأ أو مراجِعة وصلت في هذا الوقت'; end if;
    perform set_config('app.vip_override', '1', true);
    insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, created_by, level_id, vip)
    values (p_patient, svc.key, sp, svc.room_id, p_starts, l.minutes,
            case when p_check_in then 'checked_in'::public.appointment_status else 'confirmed'::public.appointment_status end,
            v_price, case when p_check_in then 'walk_in' else 'reception' end, auth.uid(), l.id, true)
    returning * into rec;
    perform set_config('app.vip_override', '', true);
    insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'appointment.vip_override', rec.id::text,
      jsonb_build_object('patient', p_patient, 'service', svc.key, 'starts_at', p_starts, 'price', v_price, 'conflicts', out_c));
  end if;

  return jsonb_build_object('appointment_id', rec.id, 'starts_at', p_starts, 'ends_at', en, 'minutes', l.minutes, 'price', v_price,
    'specialist_id', sp, 'specialist', (select name from public.staff where id = sp), 'blocked', blocked, 'conflicts', out_c);
end $$;
revoke all on function private.vip_override_plan(uuid, text, uuid, timestamptz, uuid, boolean, boolean) from public, anon;

/** Admin/owner: what an override at p_starts would displace, with the proposed new time for each (read-only). */
create or replace function public.vip_override_preview(p_patient uuid, p_service text, p_level uuid, p_starts timestamptz, p_specialist uuid default null)
returns jsonb language sql security definer set search_path = '' as $$
  select private.vip_override_plan(p_patient, p_service, p_level, p_starts, p_specialist, false, false);
$$;
revoke all on function public.vip_override_preview(uuid, text, uuid, timestamptz, uuid) from public, anon;
grant execute on function public.vip_override_preview(uuid, text, uuid, timestamptz, uuid) to authenticated;

/** Admin/owner: book the VIP at p_starts; conflicting appointments move to their proposed time (or stay for manual handling). */
create or replace function public.vip_override(p_patient uuid, p_service text, p_level uuid, p_starts timestamptz,
  p_specialist uuid default null, p_check_in boolean default false)
returns jsonb language sql security definer set search_path = '' as $$
  select private.vip_override_plan(p_patient, p_service, p_level, p_starts, p_specialist, p_check_in, true);
$$;
revoke all on function public.vip_override(uuid, text, uuid, timestamptz, uuid, boolean) from public, anon;
grant execute on function public.vip_override(uuid, text, uuid, timestamptz, uuid, boolean) to authenticated;

revoke all on function private.room_day(uuid, date) from public, anon;
revoke all on function private.room_booked(uuid, date, uuid) from public, anon;
revoke all on function private.reserve_ok(uuid, timestamptz, integer) from public, anon;
revoke all on function private.vip_find(text, integer, timestamptz, integer, uuid, uuid, timestamptz, timestamptz, uuid, uuid, integer) from public, anon;
