-- Appointments go-live hardening (overnight QA).
-- 1. book_appointment: patients may book only inside opening hours (open weekday, start ≥ from, end ≤ to, on the slot grid),
--    not twice at the same time; "any specialist" from the app is assigned a free specialist when one exists;
--    staff walk-ins that are checked in immediately join the queue without a room/specialist overlap check.
-- 2. Trigger appointments_rules: overlap check for every pending/confirmed row however it is written (direct inserts,
--    reschedules, restoring a cancelled booking), allowed status transitions, check-in only on the appointment's own
--    Damascus day, started_at/finished_at stamps, calls only for checked-in/in-session rows.

create or replace function public.book_appointment(
  p_service text,
  p_starts timestamptz,
  p_specialist uuid default null,
  p_room uuid default null,
  p_patient uuid default null,
  p_walk_in_name text default null,
  p_walk_in_phone text default null,
  p_source text default null,
  p_check_in boolean default false
) returns public.appointments
language plpgsql security definer set search_path = '' as $$
declare
  is_staff boolean := private.is_staff();
  pid uuid; src text; st public.appointment_status := 'confirmed';
  svc public.services; rm uuid; sp uuid := p_specialist; ends timestamptz; rec public.appointments;
  h jsonb; loc timestamp; m_from int; m_to int; m_start int; slot int;
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
    -- opening hours (settings «hours»; weekday 0 = Sunday)
    select value into h from public.settings where key = 'hours';
    h := coalesce(h, '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb);
    loc := p_starts at time zone 'Asia/Damascus';
    m_from := split_part(h->>'from', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'from', ':', 2), '')::int, 0);
    m_to := split_part(h->>'to', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'to', ':', 2), '')::int, 0);
    m_start := extract(hour from loc)::int * 60 + extract(minute from loc)::int;
    slot := greatest(5, coalesce((h->>'slot')::int, 15));
    if not (h->'days') @> to_jsonb(extract(dow from loc)::int)
       or m_start < m_from or m_start + svc.minutes > m_to
       or extract(second from loc) <> 0 or (m_start - m_from) % slot <> 0 then
      raise exception 'outside opening hours';
    end if;
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
    -- "any specialist": assign the free active specialist with the fewest bookings that day (none → stays unassigned)
    if sp is null then
      select s.id into sp from public.staff s
      where s.active and s.role = 'specialist'
        and not exists (select 1 from public.appointments a
                        where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                          and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts)
      order by (select count(*) from public.appointments a
                where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
                  and (a.starts_at at time zone 'Asia/Damascus')::date = (p_starts at time zone 'Asia/Damascus')::date), s.created_at
      limit 1;
    end if;
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
revoke execute on function public.book_appointment(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean) from public, anon;
grant execute on function public.book_appointment(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean) to authenticated;

create or replace function private.appointment_rules()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  old_st text := case when tg_op = 'UPDATE' then old.status::text end;
  new_st text := new.status::text;
  ok boolean;
begin
  if new.minutes is null or new.minutes <= 0 then raise exception 'bad minutes'; end if;

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

  -- check-in only on the appointment's own day (Damascus)
  if new_st = 'checked_in' and (tg_op = 'INSERT' or old_st <> 'checked_in')
     and (new.starts_at at time zone 'Asia/Damascus')::date <> (now() at time zone 'Asia/Damascus')::date then
    raise exception 'check-in only on the appointment day';
  end if;

  if tg_op = 'UPDATE' and new_st = 'in_session' and old_st = 'checked_in' then
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

  -- overlapping room / specialist (future bookings only; checked-in walk-ins just queue)
  if new_st in ('pending', 'confirmed') and (tg_op = 'INSERT'
       or new_st <> old_st or new.starts_at <> old.starts_at or new.minutes <> old.minutes
       or new.room_id is distinct from old.room_id or new.specialist_id is distinct from old.specialist_id) then
    perform pg_advisory_xact_lock(hashtext('book-appointments'));
    if exists (
      select 1 from public.appointments a
      where a.id <> new.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
        and a.starts_at < new.starts_at + make_interval(mins => new.minutes)
        and a.starts_at + make_interval(mins => a.minutes) > new.starts_at
        and ((new.room_id is not null and a.room_id = new.room_id) or (new.specialist_id is not null and a.specialist_id = new.specialist_id))
    ) then raise exception 'slot taken'; end if;
  end if;
  return new;
end $$;
revoke execute on function private.appointment_rules() from public, anon, authenticated;

create trigger appointments_rules before insert or update on public.appointments
  for each row execute function private.appointment_rules();
