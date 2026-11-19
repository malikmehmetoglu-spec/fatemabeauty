-- 2026-11-19 fix: room_day counted the union of staff minutes once, ignoring beds. For the 3-bed skin room the
-- VIP reserve cap (90% of capacity) was hit after ~9 booked hours, so the public link showed every skin session as full.
-- Capacity is now, per minute, least(room beds, staff on duty at that minute). Single-bed rooms are unchanged.
create or replace function private.room_day(p_room uuid, p_day date)
 returns table(capacity integer, m_end integer)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
declare dow int := extract(dow from p_day)::int; ids uuid[]; beds int;
begin
  select greatest(coalesce(r.capacity, 1), 1) into beds from public.rooms r where r.id = p_room;
  beds := coalesce(beds, 1);
  select array_agg(s.id) into ids from public.staff s
  where s.active
    and exists (select 1 from public.services v where v.room_id = p_room and v.active and private.staff_provides(s.id, v.key))
    and not exists (select 1 from public.leave_requests l where l.staff_id = s.id and l.status = 'approved' and p_day between l.starts and l.ends);
  if ids is null then
    if exists (select 1 from public.services v where v.room_id = p_room and v.active and not v.is_consultation) then
      return query select (coalesce(count(distinct m), 0) * beds)::int, coalesce(max(d.m_to), 0)::int
        from private.default_hours_on(dow) d, generate_series(d.m_from, d.m_to - 1) m;
    else
      return query select 0, 0;
    end if;
    return;
  end if;
  return query
    with per_min as (
      select m, count(distinct x.id) n, max(r.m_to) e
      from unnest(ids) x(id), lateral private.staff_ranges(x.id, dow) r, generate_series(r.m_from, r.m_to - 1) m
      group by m)
    select coalesce(sum(least(n, beds)), 0)::int, coalesce(max(e), 0)::int from per_min;
end $function$;
