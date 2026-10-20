-- 0074 — Fixed weekly working hours per staff member («أوقات الدوام») and booking enforcement.
--
-- Semantics:
--   * A member with NO rows in staff_hours = "not set" → works whenever the clinic is open (fallback).
--   * Once any row exists, she works only inside those ranges; weekdays without a row are days off.
--   * Always clipped to the clinic opening hours (settings.hours) and to approved leave.
-- weekday follows the app / Postgres convention: 0 = Sunday … 6 = Saturday (Damascus local time).

create table if not exists public.staff_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts time not null,
  ends time not null,
  created_at timestamptz not null default now(),
  constraint staff_hours_range check (ends > starts),
  constraint staff_hours_unique unique (staff_id, weekday, starts)
);
create index if not exists staff_hours_staff_idx on public.staff_hours (staff_id, weekday);

alter table public.staff_hours enable row level security;
create policy "staff read" on public.staff_hours for select to authenticated using ((select private.is_staff()));
create policy "admin manages" on public.staff_hours for all to authenticated
  using ((select private.has_role('{admin}'::public.staff_role[])))
  with check ((select private.has_role('{admin}'::public.staff_role[])));
grant select, insert, update, delete on public.staff_hours to authenticated;

-- Is the member working (and not on approved leave) for the whole [p_starts, p_ends) range?
create or replace function private.staff_available(p_staff uuid, p_starts timestamptz, p_ends timestamptz)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare h jsonb; ls timestamp; m_from int; m_to int; m_s int; m_e int; dow int;
begin
  if p_staff is null or p_starts is null or p_ends is null or p_ends <= p_starts then return false; end if;
  select value into h from public.settings where key = 'hours';
  h := coalesce(h, '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb);
  ls := p_starts at time zone 'Asia/Damascus';
  dow := extract(dow from ls)::int;
  m_from := split_part(h->>'from', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'from', ':', 2), '')::int, 0);
  m_to := split_part(h->>'to', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'to', ':', 2), '')::int, 0);
  m_s := extract(hour from ls)::int * 60 + extract(minute from ls)::int;
  m_e := m_s + ceil(extract(epoch from (p_ends - p_starts)) / 60)::int;
  if not (h->'days') @> to_jsonb(dow) or m_s < m_from or m_e > m_to then return false; end if;
  if exists (select 1 from public.leave_requests l where l.staff_id = p_staff and l.status = 'approved'
             and ls::date between l.starts and l.ends) then return false; end if;
  if not exists (select 1 from public.staff_hours x where x.staff_id = p_staff) then return true; end if;
  return exists (select 1 from public.staff_hours x
                 where x.staff_id = p_staff and x.weekday = dow
                   and (extract(hour from x.starts)::int * 60 + extract(minute from x.starts)::int) <= m_s
                   and (extract(hour from x.ends)::int * 60 + extract(minute from x.ends)::int) >= m_e);
end $$;
revoke all on function private.staff_available(uuid, timestamptz, timestamptz) from public, anon, authenticated;

-- Pick a free, on-duty specialist (or check the chosen one). p_strict: the chosen one must belong to the public pool
-- (public link); otherwise any active staff member may be chosen (patient app lists admins with a photo too).
create or replace function private.pick_staff(p_service text, p_starts timestamptz, p_specialist uuid, p_strict boolean)
returns table(ok boolean, sp uuid) language plpgsql stable security definer set search_path = '' as $$
declare svc public.services; ends timestamptz; pool uuid[]; pick uuid;
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  ends := p_starts + make_interval(mins => svc.minutes);

  if svc.room_id is not null and exists (select 1 from public.appointments a
      where a.room_id = svc.room_id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
        and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts) then
    return query select false, null::uuid; return;
  end if;

  select array_agg(s.id) into pool from public.staff s
  where s.active and case when svc.is_consultation then s.is_consultant else s.role = 'specialist' and not s.is_consultant end;
  if p_specialist is not null then
    if p_strict then
      if pool is null or not (p_specialist = any(pool)) then raise exception 'bad_specialist'; end if;
    elsif not exists (select 1 from public.staff s where s.id = p_specialist and s.active) then
      raise exception 'specialist not found';
    end if;
    pool := array[p_specialist];
  end if;
  if pool is null then
    return query select not svc.is_consultation, null::uuid; return;
  end if;

  select s.id into pick from public.staff s
  where s.id = any(pool)
    and private.staff_available(s.id, p_starts, ends)
    and not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts)
  order by (select count(*) from public.appointments a
            where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
              and (a.starts_at at time zone 'Asia/Damascus')::date = (p_starts at time zone 'Asia/Damascus')::date), s.created_at
  limit 1;
  return query select pick is not null, pick;
end $$;
revoke all on function private.pick_staff(text, timestamptz, uuid, boolean) from public, anon, authenticated;

-- Old 3-argument helper kept for compatibility (public link semantics).
create or replace function private.pub_pick(p_service text, p_starts timestamptz, p_specialist uuid)
returns table(ok boolean, sp uuid) language sql stable security definer set search_path = '' as $$
  select * from private.pick_staff(p_service, p_starts, p_specialist, true);
$$;

-- Shared slot grid (clinic hours, slot step, Damascus time).
create or replace function private.slot_grid(p_day date, p_service text, p_specialist uuid, p_strict boolean)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
declare svc public.services; h jsonb; m_from int; m_to int; slot int; t int; st timestamptz; r record;
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  if p_day < (now() at time zone 'Asia/Damascus')::date or p_day > (now() at time zone 'Asia/Damascus')::date + 30 then return; end if;
  select value into h from public.settings where key = 'hours';
  h := coalesce(h, '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb);
  if not (h->'days') @> to_jsonb(extract(dow from p_day)::int) then return; end if;
  m_from := split_part(h->>'from', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'from', ':', 2), '')::int, 0);
  m_to := split_part(h->>'to', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'to', ':', 2), '')::int, 0);
  slot := greatest(5, coalesce((h->>'slot')::int, 15));
  t := m_from;
  while t + svc.minutes <= m_to loop
    st := (p_day + make_interval(mins => t)) at time zone 'Asia/Damascus';
    if st <= now() then
      starts_at := st; available := false; return next;
    else
      select * into r from private.pick_staff(p_service, st, p_specialist, p_strict);
      starts_at := st; available := r.ok; return next;
    end if;
    t := t + slot;
  end loop;
end $$;
revoke all on function private.slot_grid(date, text, uuid, boolean) from public, anon, authenticated;

create or replace function public.public_slots(p_day date, p_service text, p_specialist uuid default null)
returns table(starts_at timestamptz, available boolean) language sql stable security definer set search_path = '' as $$
  select * from private.slot_grid(p_day, p_service, p_specialist, true);
$$;

-- Patient app (signed in): same grid, the chosen person may be any active staff member.
create or replace function public.app_slots(p_day date, p_service text, p_specialist uuid default null)
returns table(starts_at timestamptz, available boolean) language sql stable security definer set search_path = '' as $$
  select * from private.slot_grid(p_day, p_service, p_specialist, false);
$$;
revoke all on function public.app_slots(date, text, uuid) from public, anon;
grant execute on function public.app_slots(date, text, uuid) to authenticated;

create or replace function public.public_book(p_service text, p_starts timestamptz, p_specialist uuid, p_name text, p_phone text, p_note text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; r record;
        ends timestamptz; rec public.appointments; sp_name text;
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

  select id into pid from public.patients where phone = ph;
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

  select * into r from private.pick_staff(p_service, p_starts, p_specialist, true);
  if not r.ok then
    if p_specialist is not null and not private.staff_available(p_specialist, p_starts, ends) then raise exception 'off_duty'; end if;
    raise exception 'taken';
  end if;

  if pid is null then
    insert into public.patients (name, phone) values (nm, ph) returning id into pid;
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, svc.minutes, 'pending', svc.price, 'public', nullif(btrim(coalesce(p_note, '')), ''))
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name);
end $$;

-- Patient-app path now respects working hours; staff path (calendar / kiosk) is unchanged (overrides allowed, UI warns).
create or replace function public.book_appointment(p_service text, p_starts timestamptz, p_specialist uuid default null, p_room uuid default null,
  p_patient uuid default null, p_walk_in_name text default null, p_walk_in_phone text default null, p_source text default null, p_check_in boolean default false)
returns public.appointments language plpgsql security definer set search_path = '' as $$
declare
  is_staff boolean := private.is_staff();
  pid uuid; src text; st public.appointment_status := 'confirmed';
  svc public.services; rm uuid; sp uuid := p_specialist; ends timestamptz; rec public.appointments; r record;
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
    if not private.pub_in_hours(p_starts, svc.minutes) then raise exception 'outside opening hours'; end if;
  end if;

  if sp is not null and not exists (select 1 from public.staff where id = sp and active) then
    raise exception 'specialist not found';
  end if;
  rm := coalesce(p_room, svc.room_id);
  ends := p_starts + make_interval(mins => svc.minutes);

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
    select * into r from private.pick_staff(p_service, p_starts, sp, false);
    if not r.ok then raise exception 'slot taken'; end if;
    sp := r.sp;
  end if;

  if st <> 'checked_in' and exists (
    select 1 from public.appointments a
    where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts
      and ((rm is not null and a.room_id = rm) or (sp is not null and a.specialist_id = sp))
  ) then raise exception 'slot taken'; end if;

  insert into public.appointments (patient_id, walk_in_name, walk_in_phone, service_key, specialist_id, room_id,
                                   starts_at, minutes, status, price, source, created_by)
  values (pid, case when pid is null then trim(p_walk_in_name) end, case when pid is null then nullif(trim(p_walk_in_phone), '') end,
          svc.key, sp, rm, p_starts, svc.minutes, st, svc.price, src, auth.uid())
  returning * into rec;
  return rec;
end $$;
