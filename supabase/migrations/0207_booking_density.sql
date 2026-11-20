-- 2026-11-20: «كثافة الحجز» — when to post marketing stories.
-- booking_density(): per day × hour × section (skin / hair / consult) capacity minutes vs booked minutes for the coming days.
-- booking_pace(): new bookings per day (all + from the public link).  marketing_posts: «نشرتُ ستوري» markers.

create or replace function public.booking_density(p_days integer default 14)
 returns table(day date, hour integer, grp text, cap integer, booked integer)
 language plpgsql stable security definer set search_path to ''
as $function$
declare lastm int := 1440; d date; dow int; rm record; ids uuid[]; beds int; rules jsonb; today date := (now() at time zone 'Asia/Damascus')::date;
begin
  if not coalesce(private.perm_override_any(array['dashboard','marketing','reports']), private.has_role('{admin}')) then raise exception 'not allowed'; end if;
  select value into rules from public.settings where key = 'booking_rules';
  -- capacity only up to one hour after the last bookable start
  if rules ? 'last_start' then lastm := split_part(rules->>'last_start', ':', 1)::int * 60 + coalesce(nullif(split_part(rules->>'last_start', ':', 2), '')::int, 0) + 60; end if;
  for i in 0 .. least(greatest(coalesce(p_days, 14), 1), 31) - 1 loop
    d := today + i; dow := extract(dow from d)::int;
    if coalesce(rules->'closed_days', '[]'::jsonb) @> to_jsonb(dow) then continue; end if;
    for rm in
      select r.id, greatest(coalesce(r.capacity, 1), 1) beds,
             case when bool_and(v.is_consultation) then 'consult' when bool_or(v.category_id = 'hair') then 'hair' else 'skin' end g
      from public.rooms r join public.services v on v.room_id = r.id and v.active
      where r.active group by r.id, r.capacity
    loop
      select array_agg(s.id) into ids from public.staff s
      where s.active and exists (select 1 from public.services v where v.room_id = rm.id and v.active and private.staff_provides(s.id, v.key))
        and not exists (select 1 from public.leave_requests l where l.staff_id = s.id and l.status = 'approved' and d between l.starts and l.ends);
      return query
        with mins as (
          select m, least(count(distinct x.id), rm.beds)::int n
          from unnest(coalesce(ids, '{}'::uuid[])) x(id), lateral private.staff_ranges(x.id, dow) r, generate_series(r.m_from, least(r.m_to, lastm) - 1) m
          group by m),
        caps as (select (m / 60)::int h, sum(n)::int c from mins group by 1),
        appts as (
          select ((extract(epoch from (a.starts_at at time zone 'Asia/Damascus')::time) / 60)::int) s0,
                 a.minutes + a.extension_minutes len
          from public.appointments a
          where a.room_id = rm.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session', 'done')
            and (a.starts_at at time zone 'Asia/Damascus')::date = d),
        bk as (
          select h.h, sum(greatest(0, least(ap.s0 + ap.len, (h.h + 1) * 60) - greatest(ap.s0, h.h * 60)))::int b
          from caps h cross join appts ap group by h.h)
        select d, caps.h, rm.g, caps.c, least(coalesce(bk.b, 0), caps.c) from caps left join bk on bk.h = caps.h where caps.c > 0;
    end loop;
  end loop;
end $function$;

create or replace function public.booking_pace(p_days integer default 60)
 returns table(day date, total integer, public_link integer)
 language plpgsql stable security definer set search_path to ''
as $function$
begin
  if not coalesce(private.perm_override_any(array['dashboard','marketing','reports']), private.has_role('{admin}')) then raise exception 'not allowed'; end if;
  return query
    select g::date, count(a.id)::int, count(a.id) filter (where a.source = 'public')::int
    from generate_series((now() at time zone 'Asia/Damascus')::date - (least(greatest(coalesce(p_days, 60), 7), 180) - 1), (now() at time zone 'Asia/Damascus')::date, interval '1 day') g
    left join public.appointments a on (a.created_at at time zone 'Asia/Damascus')::date = g::date and a.status <> 'cancelled'
      and coalesce(a.service_key, '') <> 'open-visit' and coalesce(a.source, '') <> 'walk_in'
    group by g order by g;
end $function$;

create table if not exists public.marketing_posts (
  id uuid primary key default gen_random_uuid(),
  posted_on date not null default ((now() at time zone 'Asia/Damascus')::date),
  note text not null default '',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.marketing_posts enable row level security;
grant select, insert, delete on public.marketing_posts to authenticated;
create policy "marketing reads posts" on public.marketing_posts for select to authenticated
  using (coalesce((select private.perm_override_any(array['dashboard','marketing','reports'])), (select private.has_role('{admin}'))));
create policy "marketing adds posts" on public.marketing_posts for insert to authenticated
  with check (coalesce((select private.perm_override_any(array['dashboard','marketing'])), (select private.has_role('{admin}'))));
create policy "marketing removes posts" on public.marketing_posts for delete to authenticated
  using (coalesce((select private.perm_override_any(array['dashboard','marketing'])), (select private.has_role('{admin}'))));

revoke all on function public.booking_density(integer) from public, anon;
revoke all on function public.booking_pace(integer) from public, anon;
grant execute on function public.booking_density(integer) to authenticated;
grant execute on function public.booking_pace(integer) to authenticated;
