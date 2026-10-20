-- 0076 — Staff working hours («أوقات الدوام») are the source of truth for booking.
--
-- Owner decision: hours are set per specialist / consultant and drive the booking system.
--   * A member WITH rows in staff_hours is bookable exactly inside her own ranges, on any weekday (Friday included,
--     and outside the old clinic window) — no clipping to settings.hours any more.
--   * A member WITHOUT rows falls back to settings.hours («الدوام الافتراضي»: days / from / to).
--   * settings.hours.slot stays the slot length (grid step) for everyone.
--   * A day's candidate slots = union of the relevant staff ranges (or the default hours when no staff applies).
-- Rooms / overlap rules are unchanged. Staff-side bookings (calendar, kiosk) still may override hours (UI warns).
-- Non-destructive: create or replace only.

-- Default hours as minutes. Returns no row when that weekday is closed in the default hours.
create or replace function private.default_hours_on(p_dow int)
returns table(m_from int, m_to int) language plpgsql stable security definer set search_path = '' as $$
declare h jsonb;
begin
  select value into h from public.settings where key = 'hours';
  h := coalesce(h, '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb);
  if not coalesce(h->'days', '[]'::jsonb) @> to_jsonb(p_dow) then return; end if;
  m_from := split_part(h->>'from', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'from', ':', 2), '')::int, 0);
  m_to := split_part(h->>'to', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'to', ':', 2), '')::int, 0);
  if m_to > m_from then return next; end if;
end $$;
revoke all on function private.default_hours_on(int) from public, anon, authenticated;

create or replace function private.slot_minutes()
returns int language sql stable security definer set search_path = '' as $$
  select greatest(5, coalesce((select (value->>'slot')::int from public.settings where key = 'hours'), 15));
$$;
revoke all on function private.slot_minutes() from public, anon, authenticated;

-- A member's working ranges (minutes from midnight, Damascus) on a weekday: her own schedule if she has one,
-- otherwise the default hours. Ends may be 1440 (24:00).
create or replace function private.staff_ranges(p_staff uuid, p_dow int)
returns table(m_from int, m_to int) language plpgsql stable security definer set search_path = '' as $$
begin
  if exists (select 1 from public.staff_hours x where x.staff_id = p_staff) then
    return query
      select (extract(epoch from x.starts) / 60)::int, (extract(epoch from x.ends) / 60)::int
      from public.staff_hours x where x.staff_id = p_staff and x.weekday = p_dow;
  else
    return query select d.m_from, d.m_to from private.default_hours_on(p_dow) d;
  end if;
end $$;
revoke all on function private.staff_ranges(uuid, int) from public, anon, authenticated;

-- Is the member working (and not on approved leave) for the whole [p_starts, p_ends) range? (no clinic clipping)
create or replace function private.staff_available(p_staff uuid, p_starts timestamptz, p_ends timestamptz)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare ls timestamp; m_s int; m_e int; dow int;
begin
  if p_staff is null or p_starts is null or p_ends is null or p_ends <= p_starts then return false; end if;
  ls := p_starts at time zone 'Asia/Damascus';
  dow := extract(dow from ls)::int;
  m_s := extract(hour from ls)::int * 60 + extract(minute from ls)::int;
  m_e := m_s + ceil(extract(epoch from (p_ends - p_starts)) / 60)::int;
  if exists (select 1 from public.leave_requests l where l.staff_id = p_staff and l.status = 'approved'
             and ls::date between l.starts and l.ends) then return false; end if;
  return exists (select 1 from private.staff_ranges(p_staff, dow) r where r.m_from <= m_s and r.m_to >= m_e);
end $$;
revoke all on function private.staff_available(uuid, timestamptz, timestamptz) from public, anon, authenticated;

-- Coarse "could anyone be bookable then?" guard used by public_book / book_appointment (patient path):
-- whole minute on the slot grid, and inside the default hours or some active member's own schedule.
-- The exact per-person check is pick_staff → staff_available.
create or replace function private.pub_in_hours(p_starts timestamptz, p_minutes integer)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare loc timestamp; m_s int; m_e int; dow int;
begin
  loc := p_starts at time zone 'Asia/Damascus';
  dow := extract(dow from loc)::int;
  m_s := extract(hour from loc)::int * 60 + extract(minute from loc)::int;
  m_e := m_s + p_minutes;
  if extract(second from loc) <> 0 or m_s % private.slot_minutes() <> 0 then return false; end if;
  return exists (select 1 from private.default_hours_on(dow) d where d.m_from <= m_s and d.m_to >= m_e)
      or exists (select 1 from public.staff_hours x join public.staff s on s.id = x.staff_id
                 where s.active and x.weekday = dow
                   and (extract(epoch from x.starts) / 60)::int <= m_s and (extract(epoch from x.ends) / 60)::int >= m_e);
end $$;
revoke all on function private.pub_in_hours(timestamptz, integer) from public, anon, authenticated;

-- The staff pool for a service (same rule as pick_staff). Null = nobody applies (default hours, no assignment).
create or replace function private.service_pool(p_service text, p_specialist uuid)
returns uuid[] language sql stable security definer set search_path = '' as $$
  select case when p_specialist is not null then array[p_specialist] else
    (select array_agg(s.id) from public.staff s join public.services v on v.key = p_service
     where s.active and case when v.is_consultation then s.is_consultant else s.role = 'specialist' and not s.is_consultant end) end;
$$;
revoke all on function private.service_pool(text, uuid) from public, anon, authenticated;

-- Pick a free, on-duty specialist (or check the chosen one). Unchanged except: with no pool at all the time must be
-- inside the default hours (it used to rely on the clinic-hours clip).
create or replace function private.pick_staff(p_service text, p_starts timestamptz, p_specialist uuid, p_strict boolean)
returns table(ok boolean, sp uuid) language plpgsql stable security definer set search_path = '' as $$
declare svc public.services; ends timestamptz; pool uuid[]; pick uuid; ls timestamp; m_s int;
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
    ls := p_starts at time zone 'Asia/Damascus';
    m_s := extract(hour from ls)::int * 60 + extract(minute from ls)::int;
    return query select (not svc.is_consultation) and exists (
      select 1 from private.default_hours_on(extract(dow from ls)::int) d where d.m_from <= m_s and d.m_to >= m_s + svc.minutes), null::uuid;
    return;
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

-- Slot grid of a day: every slot-step start (aligned to midnight) that fits inside at least one relevant range
-- (each pool member's own hours or the default hours; default hours when the pool is empty).
create or replace function private.slot_grid(p_day date, p_service text, p_specialist uuid, p_strict boolean)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
declare svc public.services; slot int; t int; st timestamptz; r record; dow int; pool uuid[]; fa int[]; ta int[];
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
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
  while t + svc.minutes <= 1440 loop
    if exists (select 1 from unnest(fa, ta) x(f, e) where x.f <= t and x.e >= t + svc.minutes) then
      st := (p_day + make_interval(mins => t)) at time zone 'Asia/Damascus';
      if st <= now() then
        starts_at := st; available := false; return next;
      else
        select * into r from private.pick_staff(p_service, st, p_specialist, p_strict);
        starts_at := st; available := r.ok; return next;
      end if;
    end if;
    t := t + slot;
  end loop;
end $$;
revoke all on function private.slot_grid(date, text, uuid, boolean) from public, anon, authenticated;

-- Weekdays (0 = Sunday … 6 = Saturday) on which a service can be booked at all (someone in the pool works,
-- or the default hours are open when nobody applies). Used by /book and the patient app to grey out closed days.
create or replace function public.booking_weekdays(p_service text, p_specialist uuid default null)
returns int[] language sql stable security definer set search_path = '' as $$
  with pool as (select private.service_pool(p_service, p_specialist) as ids)
  select coalesce(array_agg(d order by d), '{}') from generate_series(0, 6) d, pool
  where case when pool.ids is null then exists (select 1 from private.default_hours_on(d))
             else exists (select 1 from unnest(pool.ids) p(id), lateral private.staff_ranges(p.id, d)) end;
$$;
revoke all on function public.booking_weekdays(text, uuid) from public;
grant execute on function public.booking_weekdays(text, uuid) to anon, authenticated;
