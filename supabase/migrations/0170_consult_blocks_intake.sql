-- Protect the consultant's time (staff.is_consultant).
-- Step 1: weekly consultation template (consult_blocks), buffer between consultations and a daily cap.
--   * A consultant WITH active blocks is bookable for a consultation only inside the matching blocks:
--     in_person → «استشارة», online → services.is_online, review → «مراجعة» (falls back to in_person blocks
--     when she has no review blocks at all). 'admin' blocks are never bookable. Without blocks: her staff_hours (unchanged).
--   * settings.consult_buffer_min (default 10): free minutes required before/after another consultation of hers.
--   * settings.consult_daily_max (default 0 = unlimited): non-cancelled consultations per day; public/app slots disappear.
--   * Public + app paths enforce; staff get warnings via public.consult_warnings().
-- Step 2: pre-consultation intake (consult_intake) + patient photo upload for her own upcoming consultation.

/* ---------------- services: online flag + online consultation ---------------- */
alter table public.services add column if not exists is_online boolean not null default false;

insert into public.services (key, name, short_name, description, price, price_from, minutes, room_id, device_id,
                             bookable_online, active, sort, is_consultation, category_id, price_currency, is_online)
select 'online-consultation', 'استشارة أونلاين', 'استشارة أونلاين', '', 500, false, 30, null, null,
       true, true, 3, true, 'consult', 'SYP', true
where not exists (select 1 from public.services where key = 'online-consultation');

/* ---------------- consult_blocks ---------------- */
create table if not exists public.consult_blocks (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  starts time not null,
  ends time not null,
  kind text not null check (kind in ('in_person', 'online', 'review', 'admin')),
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends > starts)
);
create index if not exists consult_blocks_staff_idx on public.consult_blocks (staff_id, weekday) where active;
alter table public.consult_blocks enable row level security;
create policy "staff read" on public.consult_blocks for select to authenticated using ((select private.is_staff()));
create policy "admin inserts" on public.consult_blocks for insert to authenticated with check ((select private.has_role('{admin}')));
create policy "admin updates" on public.consult_blocks for update to authenticated
  using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));
grant select, insert, update on public.consult_blocks to authenticated;
grant select, insert, update on public.consult_blocks to service_role;

-- active blocks of the same consultant and weekday may not overlap
create or replace function private.consult_blocks_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.updated_at := now();
  if new.active and exists (select 1 from public.consult_blocks b
      where b.staff_id = new.staff_id and b.weekday = new.weekday and b.active and b.id <> new.id
        and b.starts < new.ends and b.ends > new.starts) then
    raise exception 'block_overlap: يتداخل هذا الوقت مع فترة أخرى في القالب' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function private.consult_blocks_guard() from public, anon, authenticated;
create or replace trigger consult_blocks_guard before insert or update on public.consult_blocks
  for each row execute function private.consult_blocks_guard();

insert into public.settings (key, value) values ('consult_buffer_min', '10'::jsonb) on conflict (key) do nothing;
insert into public.settings (key, value) values ('consult_daily_max', '0'::jsonb) on conflict (key) do nothing;

/* ---------------- helpers ---------------- */
create or replace function private.consult_setting(p_key text, p_def int)
returns int language sql stable security definer set search_path = '' as $$
  select coalesce((select case when jsonb_typeof(s.value) = 'number' then (s.value #>> '{}')::numeric::int
                               when jsonb_typeof(s.value) = 'string' and (s.value #>> '{}') ~ '^\d+$' then (s.value #>> '{}')::int end
                   from public.settings s where s.key = p_key), p_def);
$$;

/** 'in_person' | 'online' | 'review' for consultation services, null otherwise. */
create or replace function private.consult_kind(p_service text)
returns text language sql stable security definer set search_path = '' as $$
  select case when not v.is_consultation then null
              when v.is_online then 'online'
              when v.key ~* '(follow|review)' or v.name like '%مراجعة%' then 'review'
              else 'in_person' end
  from public.services v where v.key = p_service;
$$;

/** Bookable minute ranges of a staff member on a weekday for a given service (consult template aware). */
create or replace function private.svc_ranges(p_staff uuid, p_dow int, p_service text)
returns table(m_from int, m_to int) language plpgsql stable security definer set search_path = '' as $$
declare k text := private.consult_kind(p_service); use_kind text;
begin
  if k is null or not exists (select 1 from public.consult_blocks b where b.staff_id = p_staff and b.active) then
    return query select * from private.staff_ranges(p_staff, p_dow);
    return;
  end if;
  use_kind := k;
  if k = 'review' and not exists (select 1 from public.consult_blocks b where b.staff_id = p_staff and b.active and b.kind = 'review') then
    use_kind := 'in_person';
  end if;
  return query select (extract(epoch from b.starts) / 60)::int, (extract(epoch from b.ends) / 60)::int
    from public.consult_blocks b where b.staff_id = p_staff and b.weekday = p_dow and b.active and b.kind = use_kind;
end $$;

/** Approved leave + inside svc_ranges for the whole visit. */
create or replace function private.staff_on_template(p_staff uuid, p_service text, p_starts timestamptz, p_ends timestamptz)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare ls timestamp; m_s int; m_e int;
begin
  if p_staff is null or p_starts is null or p_ends is null or p_ends <= p_starts then return false; end if;
  ls := p_starts at time zone 'Asia/Damascus';
  m_s := extract(hour from ls)::int * 60 + extract(minute from ls)::int;
  m_e := m_s + ceil(extract(epoch from (p_ends - p_starts)) / 60)::int;
  if exists (select 1 from public.leave_requests l where l.staff_id = p_staff and l.status = 'approved'
             and ls::date between l.starts and l.ends) then return false; end if;
  return exists (select 1 from private.svc_ranges(p_staff, extract(dow from ls)::int, p_service) r where r.m_from <= m_s and r.m_to >= m_e);
end $$;

/** Daily cap reached for this consultant on that Damascus day? */
create or replace function private.consult_capped(p_staff uuid, p_day date)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.consult_setting('consult_daily_max', 0) > 0 and (
    select count(*) from public.appointments a join public.services v on v.key = a.service_key
    where a.specialist_id = p_staff and v.is_consultation and a.status <> 'cancelled'
      and (a.starts_at at time zone 'Asia/Damascus')::date = p_day) >= private.consult_setting('consult_daily_max', 0);
$$;

/** Another consultation of hers within the buffer (or overlapping)? Only for consultation services. */
create or replace function private.consult_buffer_clash(p_staff uuid, p_service text, p_starts timestamptz, p_ends timestamptz, p_ignore uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare buf int := greatest(private.consult_setting('consult_buffer_min', 10), 0);
begin
  if p_staff is null or private.consult_kind(p_service) is null or buf = 0 then return false; end if;
  return exists (select 1 from public.appointments a join public.services v on v.key = a.service_key
    where a.specialist_id = p_staff and v.is_consultation and a.id is distinct from p_ignore
      and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
      and a.starts_at < p_ends + make_interval(mins => buf)
      and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes + buf) > p_starts);
end $$;

/** Can this staff member take this service at this time (public/app rule: template, buffer, cap)? */
create or replace function private.staff_fits(p_staff uuid, p_service text, p_starts timestamptz, p_ends timestamptz)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.staff_on_template(p_staff, p_service, p_starts, p_ends)
     and (private.consult_kind(p_service) is null or (
          not private.consult_buffer_clash(p_staff, p_service, p_starts, p_ends, null)
          and not private.consult_capped(p_staff, (p_starts at time zone 'Asia/Damascus')::date)));
$$;

revoke all on function private.consult_setting(text, int) from public, anon;
revoke all on function private.consult_kind(text) from public, anon;
revoke all on function private.svc_ranges(uuid, int, text) from public, anon;
revoke all on function private.staff_on_template(uuid, text, timestamptz, timestamptz) from public, anon;
revoke all on function private.consult_capped(uuid, date) from public, anon;
revoke all on function private.consult_buffer_clash(uuid, text, timestamptz, timestamptz, uuid) from public, anon;
revoke all on function private.staff_fits(uuid, text, timestamptz, timestamptz) from public, anon;

/** Staff: warnings for booking a consultation (codes: outside_template, buffer, cap). Never blocks. */
create or replace function public.consult_warnings(p_service text, p_starts timestamptz, p_specialist uuid,
                                                   p_minutes int default null, p_ignore uuid default null)
returns text[] language plpgsql stable security definer set search_path = '' as $$
declare v_min int; ends timestamptz; w text[] := '{}';
begin
  if not private.is_staff() then raise exception 'staff only'; end if;
  if p_specialist is null or p_starts is null or private.consult_kind(p_service) is null then return w; end if;
  select coalesce(p_minutes, v.minutes) into v_min from public.services v where v.key = p_service;
  ends := p_starts + make_interval(mins => v_min);
  if exists (select 1 from public.consult_blocks b where b.staff_id = p_specialist and b.active)
     and not private.staff_on_template(p_specialist, p_service, p_starts, ends) then w := w || 'outside_template'::text; end if;
  if private.consult_buffer_clash(p_specialist, p_service, p_starts, ends, p_ignore) then w := w || 'buffer'::text; end if;
  if private.consult_capped(p_specialist, (p_starts at time zone 'Asia/Damascus')::date) then w := w || 'cap'::text; end if;
  return w;
end $$;
revoke all on function public.consult_warnings(text, timestamptz, uuid, int, uuid) from public, anon;
grant execute on function public.consult_warnings(text, timestamptz, uuid, int, uuid) to authenticated;

/* ---------------- booking paths (same signatures, create or replace) ---------------- */
create or replace function private.pick_staff_m(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_strict boolean, p_minutes integer)
returns table(ok boolean, sp uuid) language plpgsql stable security definer set search_path to '' as $function$
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
    and private.staff_fits(s.id, p_service, p_starts, ends)
    and not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts)
  order by (select count(*) from public.appointments a
            where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
              and (a.starts_at at time zone 'Asia/Damascus')::date = (p_starts at time zone 'Asia/Damascus')::date), s.created_at
  limit 1;
  return query select pick is not null, pick;
end $function$;

create or replace function private.slot_grid_m(p_day date, p_service text, p_specialist uuid, p_strict boolean, p_minutes integer)
returns table(starts_at timestamp with time zone, available boolean) language plpgsql stable security definer set search_path to '' as $function$
declare svc public.services; slot int; t int; st timestamptz; r record; dow int; pool uuid[]; fa int[]; ta int[]; v_min int;
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  v_min := coalesce(p_minutes, svc.minutes);
  if p_day < (now() at time zone 'Asia/Damascus')::date or p_day > (now() at time zone 'Asia/Damascus')::date + 30 then return; end if;
  slot := private.slot_minutes();
  dow := extract(dow from p_day)::int;
  pool := private.service_pool(p_service, p_specialist);
  if pool is null then
    select array_agg(d.m_from), array_agg(d.m_to) into fa, ta from private.default_hours_on(dow) d;
  else
    -- consultants who reached the daily cap disappear for that day
    if svc.is_consultation then
      select array_agg(p.id) into pool from unnest(pool) p(id) where not private.consult_capped(p.id, p_day);
      if pool is null then return; end if;
    end if;
    select array_agg(x.m_from), array_agg(x.m_to) into fa, ta from unnest(pool) p(id), lateral private.svc_ranges(p.id, dow, p_service) x;
  end if;
  if fa is null then return; end if;
  t := 0;
  while t + v_min <= 1440 loop
    if exists (select 1 from unnest(fa, ta) x(f, e) where x.f <= t and x.e >= t + v_min) then
      st := (p_day + make_interval(mins => t)) at time zone 'Asia/Damascus';
      if st <= now() then
        starts_at := st; available := false; return next;
      else
        select * into r from private.pick_staff_m(p_service, st, p_specialist, p_strict, v_min);
        starts_at := st; available := r.ok; return next;
      end if;
    end if;
    t := t + slot;
  end loop;
end $function$;

create or replace function public.booking_weekdays(p_service text, p_specialist uuid default null::uuid)
returns integer[] language sql stable security definer set search_path to '' as $function$
  with pool as (select private.service_pool(p_service, p_specialist) as ids)
  select coalesce(array_agg(d order by d), '{}') from generate_series(0, 6) d, pool
  where case when pool.ids is null then exists (select 1 from private.default_hours_on(d))
             else exists (select 1 from unnest(pool.ids) p(id), lateral private.svc_ranges(p.id, d, p_service)) end;
$function$;

create or replace function public.book_appointment_v2(p_service text, p_starts timestamp with time zone, p_specialist uuid default null::uuid, p_room uuid default null::uuid, p_patient uuid default null::uuid, p_walk_in_name text default null::text, p_walk_in_phone text default null::text, p_source text default null::text, p_check_in boolean default false, p_level uuid default null::uuid)
returns appointments language plpgsql security definer set search_path to '' as $function$
declare
  is_staff boolean := private.is_staff();
  pid uuid; src text; st public.appointment_status := 'confirmed';
  svc public.services; lvl public.service_levels; v_min int; v_price int;
  rm uuid; sp uuid := p_specialist; ends timestamptz; rec public.appointments; r record;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;
  if p_starts is null then raise exception 'time required'; end if;

  if is_staff then
    pid := p_patient;
    src := coalesce(p_source, 'reception');
    if src not in ('reception', 'walk_in', 'admin') then raise exception 'bad source'; end if;
    if pid is null and coalesce(trim(p_walk_in_name), '') = '' then raise exception 'patient required'; end if;
    if p_check_in then st := 'checked_in'; end if;
  else
    pid := private.my_patient_id();
    if pid is null then raise exception 'no patient record'; end if;
    if not svc.bookable_online then raise exception 'service not bookable online'; end if;
    if p_starts <= now() then raise exception 'time in the past'; end if;
    src := 'app';
  end if;

  lvl := private.resolve_level(svc.key, p_level, pid, is_staff);
  v_min := coalesce(lvl.minutes, svc.minutes);
  v_price := coalesce(public.to_syp(lvl.price, lvl.price_currency), public.service_price_syp(svc.key), 0);
  if not is_staff and not private.pub_in_hours(p_starts, v_min) then raise exception 'outside opening hours'; end if;

  if sp is not null and not exists (select 1 from public.staff where id = sp and active) then
    raise exception 'specialist not found';
  end if;
  rm := coalesce(p_room, svc.room_id);
  ends := p_starts + make_interval(mins => v_min);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  if not is_staff then
    if exists (select 1 from public.appointments a
               where a.patient_id = pid and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                 and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts) then
      raise exception 'already booked at this time';
    end if;
    if sp is not null and not private.staff_on_template(sp, svc.key, p_starts, ends) then
      raise exception 'specialist off duty';
    end if;
    perform set_config('app.reserve_cap', '1', true);
    select * into r from private.pick_staff_m(p_service, p_starts, sp, false, v_min);
    perform set_config('app.reserve_cap', '', true);
    if not r.ok then raise exception 'slot taken'; end if;
    sp := r.sp;
  end if;

  if st <> 'checked_in' and exists (
    select 1 from public.appointments a
    where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts
      and ((rm is not null and a.room_id = rm) or (sp is not null and a.specialist_id = sp))
  ) then raise exception 'slot taken'; end if;

  insert into public.appointments (patient_id, walk_in_name, walk_in_phone, service_key, specialist_id, room_id,
                                   starts_at, minutes, status, price, source, created_by, level_id)
  values (pid, case when pid is null then trim(p_walk_in_name) end, case when pid is null then nullif(trim(p_walk_in_phone), '') end,
          svc.key, sp, rm, p_starts, v_min, st, v_price, src, auth.uid(), lvl.id)
  returning * into rec;
  return rec;
end $function$;

create or replace function public.public_book(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_name text, p_phone text, p_note text default null::text)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; old_name text; r record;
        ends timestamptz; rec public.appointments; sp_name text; nt text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if char_length(nm) < 2 or char_length(nm) > 60 then raise exception 'bad_name'; end if;
  digits := regexp_replace(digits, '^(00963|963|0)', '');
  if digits !~ '^9[0-9]{8}$' then raise exception 'bad_phone'; end if;
  ph := '+963' || digits;
  if char_length(coalesce(p_note, '')) > 300 then raise exception 'bad_note'; end if;

  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  if p_starts is null or p_starts <= now() then raise exception 'past'; end if;
  if p_starts > now() + interval '31 days' then raise exception 'too_far'; end if;
  if not private.pub_in_hours(p_starts, svc.minutes) then raise exception 'closed'; end if;
  ends := p_starts + make_interval(mins => svc.minutes);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  select id, name into pid, old_name from public.patients where phone = ph order by created_at limit 1;
  if pid is not null then
    if exists (select 1 from public.appointments a
               where a.patient_id = pid and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                 and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts) then
      raise exception 'overlap';
    end if;
    if (select count(*) from public.appointments a
        where a.patient_id = pid and a.status in ('pending', 'confirmed') and a.starts_at > now()) >= 2 then
      raise exception 'limit';
    end if;
  end if;

  perform set_config('app.reserve_cap', '1', true);
  select * into r from private.pick_staff(p_service, p_starts, p_specialist, true);
  perform set_config('app.reserve_cap', '', true);
  if not r.ok then
    if p_specialist is not null and not private.staff_on_template(p_specialist, svc.key, p_starts, ends) then raise exception 'off_duty'; end if;
    raise exception 'taken';
  end if;

  if pid is null then
    insert into public.patients (name, phone, source) values (nm, ph, 'public') returning id into pid;
  elsif coalesce(btrim(old_name), '') = '' then
    update public.patients set name = nm where id = pid;
  elsif lower(btrim(old_name)) <> lower(nm) then
    nt := 'الاسم في رابط الحجز: ' || nm || coalesce(' — ' || nt, '');
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, svc.minutes, 'pending', coalesce(public.service_price_syp(svc.key), 0), 'public', nt)
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name, 'phone', ph,
                            'consult', svc.is_consultation);
end $function$;

create or replace function public.public_book_level(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_name text, p_phone text, p_note text default null::text, p_level uuid default null::uuid)
returns jsonb language plpgsql security definer set search_path to '' as $function$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; old_name text; r record;
        ends timestamptz; rec public.appointments; sp_name text; nt text := nullif(btrim(coalesce(p_note, '')), '');
        lvl public.service_levels; v_min int; v_price int;
begin
  if char_length(nm) < 2 or char_length(nm) > 60 then raise exception 'bad_name'; end if;
  digits := regexp_replace(digits, '^(00963|963|0)', '');
  if digits !~ '^9[0-9]{8}$' then raise exception 'bad_phone'; end if;
  ph := '+963' || digits;
  if char_length(coalesce(p_note, '')) > 300 then raise exception 'bad_note'; end if;

  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  lvl := private.pub_level(svc.key, p_level);
  v_min := coalesce(lvl.minutes, svc.minutes);
  v_price := case when lvl.id is null then coalesce(public.service_price_syp(svc.key), 0) else private.level_price_syp(lvl) end;
  if p_starts is null or p_starts <= now() then raise exception 'past'; end if;
  if p_starts > now() + interval '31 days' then raise exception 'too_far'; end if;
  if not private.pub_in_hours(p_starts, v_min) then raise exception 'closed'; end if;
  ends := p_starts + make_interval(mins => v_min);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  select id, name into pid, old_name from public.patients where phone = ph order by created_at limit 1;
  if pid is not null then
    if exists (select 1 from public.appointments a
               where a.patient_id = pid and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                 and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts) then
      raise exception 'overlap';
    end if;
    if (select count(*) from public.appointments a
        where a.patient_id = pid and a.status in ('pending', 'confirmed') and a.starts_at > now()) >= 2 then
      raise exception 'limit';
    end if;
  end if;

  perform set_config('app.reserve_cap', '1', true);
  select * into r from private.pick_staff_m(p_service, p_starts, p_specialist, true, v_min);
  perform set_config('app.reserve_cap', '', true);
  if not r.ok then
    if p_specialist is not null and not private.staff_on_template(p_specialist, svc.key, p_starts, ends) then raise exception 'off_duty'; end if;
    raise exception 'taken';
  end if;

  if pid is null then
    insert into public.patients (name, phone, source) values (nm, ph, 'public') returning id into pid;
  elsif coalesce(btrim(old_name), '') = '' then
    update public.patients set name = nm where id = pid;
  elsif lower(btrim(old_name)) <> lower(nm) then
    nt := 'الاسم في رابط الحجز: ' || nm || coalesce(' — ' || nt, '');
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note, level_id)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, v_min, 'pending', v_price, 'public', nt, lvl.id)
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name, 'phone', ph,
                            'level', lvl.name, 'price', rec.price, 'consult', svc.is_consultation);
end $function$;

/* ---------------- Step 2: consult_intake ---------------- */
create table if not exists public.consult_intake (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  concern text,
  since text,
  tried text,
  medications text,
  allergies text,
  pregnant boolean,
  goals text,
  extra jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.staff(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists consult_intake_patient_idx on public.consult_intake (patient_id, submitted_at desc);
alter table public.consult_intake enable row level security;

/** Own, non-cancelled, not yet started consultation appointment of the signed-in patient? */
create or replace function private.my_open_consult(p_appt uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.appointments a join public.services v on v.key = a.service_key
    where a.id = p_appt and a.patient_id = private.my_patient_id() and v.is_consultation
      and a.status in ('pending', 'confirmed') and a.starts_at > now());
$$;
revoke all on function private.my_open_consult(uuid) from public, anon;
grant execute on function private.my_open_consult(uuid) to authenticated;

create policy "own or staff read" on public.consult_intake for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "own inserts before visit" on public.consult_intake for insert to authenticated
  with check (patient_id = (select private.my_patient_id()) and private.my_open_consult(appointment_id));
create policy "own updates before visit" on public.consult_intake for update to authenticated
  using (patient_id = (select private.my_patient_id()) and private.my_open_consult(appointment_id))
  with check (patient_id = (select private.my_patient_id()) and private.my_open_consult(appointment_id));
grant select, insert, update on public.consult_intake to authenticated;
grant select, insert, update on public.consult_intake to service_role;

-- patients cannot set review fields; the row's appointment/patient never change
create or replace function private.consult_intake_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.appointment_id := old.appointment_id; new.patient_id := old.patient_id;
  end if;
  if coalesce(current_setting('app.intake_review', true), '') <> '1' then
    new.reviewed_at := case when tg_op = 'UPDATE' then old.reviewed_at end;
    new.reviewed_by := case when tg_op = 'UPDATE' then old.reviewed_by end;
    new.submitted_at := now();
  end if;
  return new;
end $$;
revoke all on function private.consult_intake_guard() from public, anon, authenticated;
create or replace trigger consult_intake_guard before insert or update on public.consult_intake
  for each row execute function private.consult_intake_guard();

/** Staff: mark an intake as reviewed (or clear it). */
create or replace function public.consult_intake_review(p_appointment uuid, p_reviewed boolean default true)
returns public.consult_intake language plpgsql security definer set search_path = '' as $$
declare rec public.consult_intake; me uuid;
begin
  if not private.is_staff() then raise exception 'staff only'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  perform set_config('app.intake_review', '1', true);
  update public.consult_intake set reviewed_at = case when p_reviewed then now() end, reviewed_by = case when p_reviewed then me end
   where appointment_id = p_appointment returning * into rec;
  perform set_config('app.intake_review', '', true);
  if rec.id is null then raise exception 'no_intake'; end if;
  return rec;
end $$;
revoke all on function public.consult_intake_review(uuid, boolean) from public, anon;
grant execute on function public.consult_intake_review(uuid, boolean) to authenticated;

-- reminder notification when a consultation is booked for a patient without an intake
create or replace function private.consult_intake_reminder()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.patient_id is not null and new.starts_at > now()
     and exists (select 1 from public.services v where v.key = new.service_key and v.is_consultation)
     and not exists (select 1 from public.consult_intake i where i.appointment_id = new.id) then
    insert into public.notifications (patient_id, kind, title, body, link)
    values (new.patient_id, 'intake', 'جهّزي استشارتكِ',
            'خمس دقائق قبل موعدكِ تساعد فاطمة طيبة على التحضير لكِ: أخبرينا عن بشرتكِ وما جرّبتِه.',
            '/appointments/detail/?id=' || new.id);
  end if;
  return new;
end $$;
revoke all on function private.consult_intake_reminder() from public, anon, authenticated;
create or replace trigger appointments_intake_reminder after insert on public.appointments
  for each row execute function private.consult_intake_reminder();

/* ---------------- patient photos for her own upcoming consultation ---------------- */
create policy "own intake photos insert" on public.patient_photos for insert to authenticated
  with check (patient_id = (select private.my_patient_id()) and appointment_id is not null and private.my_open_consult(appointment_id));
create policy "patient files own insert" on storage.objects for insert to authenticated
  with check (bucket_id = any (array['consents', 'photos']) and (storage.foldername(name))[1] = ((select private.my_patient_id()))::text);
