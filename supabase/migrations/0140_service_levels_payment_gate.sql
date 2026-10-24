-- 0140 — Service levels (3 per service), pay-before-start gate, session timer + prepaid extensions.
-- Non-destructive: create table / add column if not exists / create or replace only.

/* ---------------- 1. service levels ---------------- */
create table if not exists public.service_levels (
  id uuid primary key default gen_random_uuid(),
  service_key text not null references public.services(key) on update cascade,
  level smallint not null check (level between 1 and 9),
  name text not null,
  minutes integer not null check (minutes > 0 and minutes <= 600),
  price integer not null default 0 check (price >= 0),
  price_currency text not null default 'SYP' check (price_currency in ('SYP', 'USD')),
  extension_price_30 integer check (extension_price_30 is null or extension_price_30 >= 0),
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  unique (service_key, level)
);
alter table public.service_levels enable row level security;
create policy "levels readable" on public.service_levels for select using (active or (select private.is_staff()));
create policy "admin manages levels" on public.service_levels for all
  using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));
grant select on public.service_levels to anon;
grant select, insert, update on public.service_levels to authenticated;
grant all on public.service_levels to service_role;

-- price × factor, rounded up: nearest 5 SYP or whole dollars
create or replace function private.level_price(p integer, cur text, f numeric)
returns integer language sql immutable set search_path = '' as $$
  select case when coalesce(cur, 'SYP') = 'USD' then ceil(p * f)::int else (ceil(p * f / 5.0) * 5)::int end;
$$;

create or replace function private.seed_service_levels(p_key text)
returns void language plpgsql security definer set search_path = '' as $$
declare s public.services;
begin
  select * into s from public.services where key = p_key;
  if s.key is null then return; end if;
  insert into public.service_levels (service_key, level, name, minutes, price, price_currency, sort) values
    (s.key, 1, 'عادية', s.minutes, s.price, coalesce(s.price_currency, 'SYP'), 1),
    (s.key, 2, 'مكثّفة', least(s.minutes * 2, 600), private.level_price(s.price, s.price_currency, 1.6), coalesce(s.price_currency, 'SYP'), 2),
    (s.key, 3, 'علاجية مطوّلة', 180, private.level_price(s.price, s.price_currency, 2.2), coalesce(s.price_currency, 'SYP'), 3)
  on conflict (service_key, level) do nothing;
end $$;

select private.seed_service_levels(key) from public.services where active;

-- level 1 and the service row stay in sync (public link / catalogue read services.minutes & price)
create or replace function private.service_levels_sync()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'service_levels' then
    if new.level = 1 then
      update public.services set minutes = new.minutes, price = new.price, price_currency = new.price_currency
      where key = new.service_key
        and (minutes, price, price_currency) is distinct from (new.minutes, new.price, new.price_currency);
    end if;
  elsif tg_op = 'INSERT' then
    perform private.seed_service_levels(new.key);
  else
    update public.service_levels set minutes = new.minutes, price = new.price, price_currency = new.price_currency
    where service_key = new.key and level = 1
      and (minutes, price, price_currency) is distinct from (new.minutes, new.price, new.price_currency);
  end if;
  return null;
end $$;
create or replace trigger service_levels_sync after insert or update on public.service_levels
  for each row execute function private.service_levels_sync();
create or replace trigger services_levels_sync after insert or update of minutes, price, price_currency on public.services
  for each row execute function private.service_levels_sync();

/* ---------------- 2. patient's level per service ---------------- */
create table if not exists public.patient_service_levels (
  patient_id uuid not null references public.patients(id),
  service_key text not null references public.services(key) on update cascade,
  level_id uuid references public.service_levels(id),
  set_by uuid,
  set_at timestamptz not null default now(),
  primary key (patient_id, service_key)
);
alter table public.patient_service_levels enable row level security;
create policy "patient levels read" on public.patient_service_levels for select
  using ((select private.is_staff()) or patient_id = (select private.my_patient_id()));
grant select on public.patient_service_levels to authenticated;
grant all on public.patient_service_levels to service_role;

/* ---------------- 3. appointment columns ---------------- */
alter table public.appointments add column if not exists level_id uuid references public.service_levels(id);
alter table public.appointments add column if not exists extension_minutes integer not null default 0;
alter table public.appointments add column if not exists start_override_by uuid;
alter table public.appointments add column if not exists start_override_reason text;
alter table public.appointments add column if not exists start_override_at timestamptz;
create index if not exists appointments_level_idx on public.appointments (level_id);

/* ---------------- 4. extensions ---------------- */
create table if not exists public.session_extensions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  minutes integer not null check (minutes in (30, 60)),
  price integer not null default 0 check (price >= 0),
  status text not null default 'requested' check (status in ('requested', 'paid', 'declined')),
  requested_by uuid,
  decided_by uuid,
  decided_at timestamptz,
  invoice_id uuid references public.invoices(id),
  created_at timestamptz not null default now()
);
create index if not exists session_extensions_appt_idx on public.session_extensions (appointment_id);
create index if not exists session_extensions_invoice_idx on public.session_extensions (invoice_id);
alter table public.session_extensions enable row level security;
create policy "staff reads extensions" on public.session_extensions for select using ((select private.is_staff()));
grant select on public.session_extensions to authenticated;
grant all on public.session_extensions to service_role;

insert into public.settings (key, value) values ('extension_price_30', '500'::jsonb) on conflict (key) do nothing;

/* ---------------- 5. level resolution ---------------- */
-- p_level given → that level (patients may only use level 1 or their assigned one); else assigned level; else lowest active level.
create or replace function private.resolve_level(p_service text, p_level uuid, p_patient uuid, p_staff boolean)
returns public.service_levels language plpgsql stable security definer set search_path = '' as $$
declare l public.service_levels; a public.service_levels; base public.service_levels;
begin
  select l2.* into a from public.patient_service_levels psl join public.service_levels l2 on l2.id = psl.level_id
   where p_patient is not null and psl.patient_id = p_patient and psl.service_key = p_service and l2.active;
  select * into base from public.service_levels where service_key = p_service and active order by level limit 1;
  if p_level is not null then
    select * into l from public.service_levels where id = p_level and service_key = p_service and active;
    if l.id is null then raise exception 'مستوى الجلسة غير متاح لهذه الخدمة'; end if;
    if p_staff or l.id = a.id or (a.id is null and l.id = base.id) then return l; end if;
    raise exception 'مستوى الجلسة غير متاح لهذه الخدمة';
  end if;
  if a.id is not null then return a; end if;
  return base;
end $$;

/** The level that applies to a booking (patients: their own file). */
create or replace function public.service_level_for(p_service text, p_patient uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare st boolean := private.is_staff(); pid uuid; l public.service_levels;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  pid := case when st then p_patient else private.my_patient_id() end;
  l := private.resolve_level(p_service, null, pid, st);
  if l.id is null then return null; end if;
  return jsonb_build_object('id', l.id, 'level', l.level, 'name', l.name, 'minutes', l.minutes,
    'price', public.to_syp(l.price, l.price_currency));
end $$;
revoke all on function public.service_level_for(text, uuid) from public, anon;
grant execute on function public.service_level_for(text, uuid) to authenticated;

/* ---------------- 6. slots with explicit minutes ---------------- */
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

create or replace function private.pick_staff(p_service text, p_starts timestamptz, p_specialist uuid, p_strict boolean)
returns table(ok boolean, sp uuid) language sql stable security definer set search_path = '' as $$
  select * from private.pick_staff_m(p_service, p_starts, p_specialist, p_strict, null);
$$;

create or replace function private.slot_grid_m(p_day date, p_service text, p_specialist uuid, p_strict boolean, p_minutes integer)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
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
    select array_agg(x.m_from), array_agg(x.m_to) into fa, ta from unnest(pool) p(id), lateral private.staff_ranges(p.id, dow) x;
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
end $$;

create or replace function private.slot_grid(p_day date, p_service text, p_specialist uuid, p_strict boolean)
returns table(starts_at timestamptz, available boolean) language sql stable security definer set search_path = '' as $$
  select * from private.slot_grid_m(p_day, p_service, p_specialist, p_strict, null);
$$;

/** Patient app / staff: slots for the level that applies (patient: own assigned level or level 1). */
create or replace function public.app_slots_v2(p_day date, p_service text, p_specialist uuid default null, p_level uuid default null, p_patient uuid default null)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
declare st boolean := private.is_staff(); l public.service_levels;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  l := private.resolve_level(p_service, p_level, case when st then p_patient else private.my_patient_id() end, st);
  return query select * from private.slot_grid_m(p_day, p_service, p_specialist, false, l.minutes);
end $$;
revoke all on function public.app_slots_v2(date, text, uuid, uuid, uuid) from public, anon;
grant execute on function public.app_slots_v2(date, text, uuid, uuid, uuid) to authenticated;

create or replace function public.booked_ranges(p_from timestamptz, p_to timestamptz)
returns table(starts_at timestamptz, ends_at timestamptz, room_id uuid, specialist_id uuid)
language sql stable security definer set search_path = '' as $$
  select a.starts_at, a.starts_at + make_interval(mins => a.minutes + a.extension_minutes), a.room_id, a.specialist_id
  from public.appointments a
  where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
    and a.starts_at < p_to and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_from
    and p_to - p_from <= interval '32 days';
$$;

/* ---------------- 7. booking with a level ---------------- */
create or replace function public.book_appointment_v2(p_service text, p_starts timestamptz, p_specialist uuid default null, p_room uuid default null,
  p_patient uuid default null, p_walk_in_name text default null, p_walk_in_phone text default null, p_source text default null,
  p_check_in boolean default false, p_level uuid default null)
returns public.appointments language plpgsql security definer set search_path = '' as $$
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
    if sp is not null and not private.staff_available(sp, p_starts, ends) then
      raise exception 'specialist off duty';
    end if;
    select * into r from private.pick_staff_m(p_service, p_starts, sp, false, v_min);
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
end $$;
revoke all on function public.book_appointment_v2(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean, uuid) from public, anon;
grant execute on function public.book_appointment_v2(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean, uuid) to authenticated;

-- the old entry point now books the patient's assigned level (or level 1)
create or replace function public.book_appointment(p_service text, p_starts timestamptz, p_specialist uuid default null, p_room uuid default null,
  p_patient uuid default null, p_walk_in_name text default null, p_walk_in_phone text default null, p_source text default null, p_check_in boolean default false)
returns public.appointments language sql security definer set search_path = '' as $$
  select * from public.book_appointment_v2(p_service, p_starts, p_specialist, p_room, p_patient, p_walk_in_name, p_walk_in_phone, p_source, p_check_in, null);
$$;

-- every appointment carries a level (public link and older paths → level 1)
create or replace function private.appointments_default_level()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.level_id is null then
    select id into new.level_id from public.service_levels where service_key = new.service_key and active order by level limit 1;
  end if;
  new.extension_minutes := 0;
  new.start_override_at := null; new.start_override_by := null; new.start_override_reason := null;
  return new;
end $$;
create or replace trigger appointments_level before insert on public.appointments
  for each row execute function private.appointments_default_level();

/* ---------------- 8. payment gate ---------------- */
create or replace function private.appt_is_paid(a public.appointments)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(a.price, 0) = 0 or a.patient_package_id is not null
      or exists (select 1 from public.invoices i where i.appointment_id = a.id and not i.void and i.paid);
$$;

create or replace function private.appointment_rules()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  old_st text := case when tg_op = 'UPDATE' then old.status::text end;
  new_st text := new.status::text;
  ok boolean;
begin
  if new.minutes is null or new.minutes <= 0 then raise exception 'bad minutes'; end if;

  -- override / extension columns change only through their functions
  if tg_op = 'UPDATE' then
    if (new.start_override_at, new.start_override_by, new.start_override_reason) is distinct from (old.start_override_at, old.start_override_by, old.start_override_reason)
       and coalesce(current_setting('app.override_ok', true), '') <> '1' then
      raise exception 'not allowed: start override';
    end if;
    if new.extension_minutes is distinct from old.extension_minutes and coalesce(current_setting('app.ext_ok', true), '') <> '1' then
      raise exception 'not allowed: extension';
    end if;
  end if;

  if tg_op = 'UPDATE' and new_st <> old_st then
    ok := case old_st
      when 'pending'    then new_st in ('confirmed', 'checked_in', 'cancelled', 'no_show')
      when 'confirmed'  then new_st in ('pending', 'checked_in', 'cancelled', 'no_show')
      when 'checked_in' then new_st in ('in_session', 'confirmed', 'cancelled', 'no_show')
      when 'in_session' then new_st in ('done', 'checked_in')
      when 'done'       then new_st in ('in_session')
      when 'no_show'    then new_st in ('confirmed', 'checked_in', 'cancelled')
      when 'cancelled'  then new_st in ('pending', 'confirmed')
      else false end;
    if not ok then raise exception 'bad status change % -> %', old_st, new_st; end if;
  end if;
  if tg_op = 'INSERT' and new_st not in ('pending', 'confirmed', 'checked_in') then
    raise exception 'bad status change -> %', new_st;
  end if;

  if new_st = 'checked_in' and (tg_op = 'INSERT' or old_st <> 'checked_in')
     and (new.starts_at at time zone 'Asia/Damascus')::date <> (now() at time zone 'Asia/Damascus')::date then
    raise exception 'check-in only on the appointment day';
  end if;

  if tg_op = 'UPDATE' and new_st = 'in_session' and old_st = 'checked_in' then
    -- pay before the session: paid invoice, package session, free, or an admin override
    if new.start_override_at is null and not private.appt_is_paid(new) then
      raise exception 'يجب دفع الجلسة قبل البدء';
    end if;
    new.started_at := now(); new.finished_at := null;
  end if;
  if tg_op = 'UPDATE' and new_st = 'in_session' and old_st = 'done' then new.finished_at := null; end if;
  if tg_op = 'UPDATE' and new_st = 'done' and old_st = 'in_session' then new.finished_at := now(); end if;
  if new_st in ('pending', 'confirmed', 'cancelled', 'no_show') and tg_op = 'UPDATE' and old_st in ('checked_in') then
    new.called_at := null;
  end if;

  if tg_op = 'UPDATE' and new.called_at is distinct from old.called_at and new.called_at is not null
     and new_st not in ('checked_in', 'in_session') then
    raise exception 'only waiting patients can be called';
  end if;

  if new_st in ('pending', 'confirmed') and (tg_op = 'INSERT'
       or new_st <> old_st or new.starts_at <> old.starts_at or new.minutes <> old.minutes
       or new.room_id is distinct from old.room_id or new.specialist_id is distinct from old.specialist_id) then
    perform pg_advisory_xact_lock(hashtext('book-appointments'));
    if exists (
      select 1 from public.appointments a
      where a.id <> new.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
        and a.starts_at < new.starts_at + make_interval(mins => new.minutes)
        and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > new.starts_at
        and ((new.room_id is not null and a.room_id = new.room_id) or (new.specialist_id is not null and a.specialist_id = new.specialist_id))
    ) then raise exception 'slot taken'; end if;
  end if;
  return new;
end $$;

/** Admin/owner: start a session that is not paid yet (reason is kept in the audit log). */
create or replace function public.override_start_without_payment(p_appt uuid, p_reason text)
returns public.appointments language plpgsql security definer set search_path = '' as $$
declare a public.appointments; rsn text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not private.has_role('{admin}') then raise exception 'لا تملكين صلاحية البدء دون دفع'; end if;
  if rsn is null or char_length(rsn) < 3 then raise exception 'اكتبي سبب البدء دون دفع'; end if;
  select * into a from public.appointments where id = p_appt for update;
  if a.id is null then raise exception 'unknown appointment'; end if;
  if a.status <> 'checked_in' then raise exception 'يمكن البدء فقط لمن سجّلت وصولها'; end if;
  perform set_config('app.override_ok', '1', true);
  update public.appointments set start_override_at = now(), start_override_by = auth.uid(), start_override_reason = left(rsn, 300),
    status = 'in_session', started_at = now()
  where id = p_appt returning * into a;
  perform set_config('app.override_ok', '', true);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), 'appointment.start_unpaid', a.id::text, jsonb_build_object('reason', rsn, 'price', a.price));
  return a;
end $$;
revoke all on function public.override_start_without_payment(uuid, text) from public, anon;
grant execute on function public.override_start_without_payment(uuid, text) to authenticated;

/* ---------------- 9. patient level ---------------- */
create or replace function public.set_patient_service_level(p_patient uuid, p_service text, p_level uuid)
returns public.patient_service_levels language plpgsql security definer set search_path = '' as $$
declare r public.patient_service_levels;
begin
  if not private.has_role('{admin,specialist,reception}') then raise exception 'not allowed'; end if;
  if not exists (select 1 from public.patients where id = p_patient) then raise exception 'unknown patient'; end if;
  if not exists (select 1 from public.services where key = p_service) then raise exception 'service not found'; end if;
  if p_level is not null and not exists (select 1 from public.service_levels where id = p_level and service_key = p_service and active) then
    raise exception 'مستوى الجلسة غير متاح لهذه الخدمة';
  end if;
  insert into public.patient_service_levels (patient_id, service_key, level_id, set_by, set_at)
  values (p_patient, p_service, p_level, auth.uid(), now())
  on conflict (patient_id, service_key) do update set level_id = excluded.level_id, set_by = excluded.set_by, set_at = excluded.set_at
  returning * into r;
  return r;
end $$;
revoke all on function public.set_patient_service_level(uuid, text, uuid) from public, anon;
grant execute on function public.set_patient_service_level(uuid, text, uuid) to authenticated;

/* ---------------- 10. extensions ---------------- */
create or replace function public.extension_price(p_appt uuid, p_minutes integer)
returns integer language sql stable security definer set search_path = '' as $$
  select (coalesce(l.extension_price_30,
                   (select case when jsonb_typeof(value) = 'number' then (value #>> '{}')::int end from public.settings where key = 'extension_price_30'),
                   500) * p_minutes / 30)::int
  from public.appointments a left join public.service_levels l on l.id = a.level_id where a.id = p_appt;
$$;
revoke all on function public.extension_price(uuid, integer) from public, anon;
grant execute on function public.extension_price(uuid, integer) to authenticated;

create or replace function public.request_session_extension(p_appt uuid, p_minutes integer)
returns public.session_extensions language plpgsql security definer set search_path = '' as $$
declare a public.appointments; e public.session_extensions;
begin
  if not private.is_staff() then raise exception 'not allowed'; end if;
  if p_minutes not in (30, 60) then raise exception 'bad minutes'; end if;
  select * into a from public.appointments where id = p_appt for update;
  if a.id is null or a.status <> 'in_session' then raise exception 'يمكن طلب التمديد أثناء الجلسة فقط'; end if;
  if exists (select 1 from public.session_extensions where appointment_id = p_appt and status = 'requested') then
    raise exception 'يوجد طلب تمديد بانتظار الدفع لهذه الجلسة';
  end if;
  insert into public.session_extensions (appointment_id, minutes, price, requested_by)
  values (p_appt, p_minutes, coalesce(public.extension_price(p_appt, p_minutes), 0), auth.uid()) returning * into e;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'extension.request', p_appt::text, jsonb_build_object('minutes', p_minutes, 'price', e.price));
  return e;
end $$;
revoke all on function public.request_session_extension(uuid, integer) from public, anon;
grant execute on function public.request_session_extension(uuid, integer) to authenticated;

create or replace function public.charge_session_extension(p_ext uuid, p_method public.pay_method default 'cash')
returns public.session_extensions language plpgsql security definer set search_path = '' as $$
declare e public.session_extensions; a public.appointments; inv public.invoices; shift uuid := private.open_shift_id(); svc text;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if p_method not in ('cash', 'card') then raise exception 'cash or card only'; end if;
  select * into e from public.session_extensions where id = p_ext for update;
  if e.id is null then raise exception 'unknown extension'; end if;
  if e.status <> 'requested' then raise exception 'تمت معالجة طلب التمديد مسبقاً'; end if;
  select * into a from public.appointments where id = e.appointment_id for update;
  if a.status not in ('in_session', 'done') then raise exception 'الجلسة لم تعد جارية'; end if;
  select name into svc from public.services where key = a.service_key;
  if e.price > 0 then
    insert into public.invoices (patient_id, method, paid, created_by, note, walk_in_name, shift_id, subtotal, discount, total, amount_paid)
    values (a.patient_id, p_method, true, auth.uid(), 'تمديد جلسة', case when a.patient_id is null then a.walk_in_name end,
            shift, e.price, 0, e.price, e.price)
    returning * into inv;
    insert into public.invoice_items (invoice_id, label, qty, unit_price, kind, ref)
    values (inv.id, 'تمديد جلسة ' || e.minutes || ' دقيقة' || coalesce(' — ' || svc, ''), 1, e.price, 'custom', 'extension:' || e.id);
    insert into public.invoice_payments (invoice_id, amount, method, shift_id, created_by)
    values (inv.id, e.price, p_method, case when p_method = 'cash' then shift end, auth.uid());
    insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.create', inv.no, jsonb_build_object('total', inv.total, 'extension', e.id));
  end if;
  update public.session_extensions set status = 'paid', decided_by = auth.uid(), decided_at = now(), invoice_id = inv.id
  where id = e.id returning * into e;
  perform set_config('app.ext_ok', '1', true);
  update public.appointments set extension_minutes = extension_minutes + e.minutes where id = a.id;
  perform set_config('app.ext_ok', '', true);
  return e;
end $$;
revoke all on function public.charge_session_extension(uuid, public.pay_method) from public, anon;
grant execute on function public.charge_session_extension(uuid, public.pay_method) to authenticated;

create or replace function public.decline_session_extension(p_ext uuid)
returns public.session_extensions language plpgsql security definer set search_path = '' as $$
declare e public.session_extensions;
begin
  if not private.is_staff() then raise exception 'not allowed'; end if;
  update public.session_extensions set status = 'declined', decided_by = auth.uid(), decided_at = now()
  where id = p_ext and status = 'requested' returning * into e;
  if e.id is null then raise exception 'تمت معالجة طلب التمديد مسبقاً'; end if;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'extension.decline', e.appointment_id::text, jsonb_build_object('minutes', e.minutes));
  return e;
end $$;
revoke all on function public.decline_session_extension(uuid) from public, anon;
grant execute on function public.decline_session_extension(uuid) to authenticated;

revoke all on function private.resolve_level(text, uuid, uuid, boolean) from public, anon;
revoke all on function private.appt_is_paid(public.appointments) from public, anon;

/* ---------------- 11. invoice line shows the level name (price already = appointment's level price) ---------------- */
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.create_invoice(uuid,uuid,jsonb,integer,jsonb,uuid,text,date,text)'::regprocedure);
  if position('lvl_name' in d) > 0 then return; end if;
  n := replace(d, 'best_m public.pay_method; best_amt int := -1; loc uuid;', 'best_m public.pay_method; best_amt int := -1; loc uuid; lvl_name text;');
  n := replace(n, 'price := coalesce(nullif(appt.price, 0), private.service_price_syp_strict(s.key)); appt_priced := true;',
                  'price := coalesce(nullif(appt.price, 0), private.service_price_syp_strict(s.key)); appt_priced := true;
          select '' — '' || l.name into lvl_name from public.service_levels l where l.id = appt.level_id and l.level > 1;');
  n := replace(n, 'lbl := s.name;', 'lbl := s.name || coalesce(lvl_name, ''''); lvl_name := null;');
  if n = d or position('lvl_name := null' in n) = 0 or position('appt.level_id' in n) = 0 then raise exception 'create_invoice patch did not apply'; end if;
  execute n;
end $mig$;
