-- Which services each specialist / consultant provides.
-- A member WITH at least one row provides ONLY those services; a member with NO rows keeps the old rule
-- (specialists → every non-consultation service, consultants → consultation services).
create table if not exists public.staff_services (
  staff_id uuid not null references public.staff(id) on delete cascade,
  service_key text not null references public.services(key) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (staff_id, service_key)
);
create index if not exists staff_services_service_idx on public.staff_services (service_key);
alter table public.staff_services enable row level security;
revoke all on public.staff_services from anon;
grant select, insert, delete on public.staff_services to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'staff_services' and policyname = 'staff_services_read') then
    create policy staff_services_read on public.staff_services for select to authenticated using ((select private.is_staff()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'staff_services' and policyname = 'staff_services_insert') then
    create policy staff_services_insert on public.staff_services for insert to authenticated with check ((select private.has_role('{admin}')));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'staff_services' and policyname = 'staff_services_delete') then
    create policy staff_services_delete on public.staff_services for delete to authenticated using ((select private.has_role('{admin}')));
  end if;
end $$;

-- Does this member provide this service (assignments, else the old fallback rule)?
create or replace function private.staff_provides(p_staff uuid, p_service text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff s join public.services v on v.key = p_service
    where s.id = p_staff and s.active and
      case when exists (select 1 from public.staff_services x where x.staff_id = s.id)
           then exists (select 1 from public.staff_services x where x.staff_id = s.id and x.service_key = v.key)
           else case when v.is_consultation then s.is_consultant else s.role = 'specialist' and not s.is_consultant end end);
$$;
revoke all on function private.staff_provides(uuid, text) from public, anon;

-- Pool of members who can do a service. null = nobody of that kind exists yet (old "use default hours" behaviour);
-- '{}' = people exist but none provides it → no slots.
create or replace function private.service_pool(p_service text, p_specialist uuid)
returns uuid[] language sql stable security definer set search_path = '' as $$
  select case when p_specialist is not null then array[p_specialist] else (
    select case when pool is not null then pool
                when exists (select 1 from public.staff s join public.services v on v.key = p_service
                             where s.active and (exists (select 1 from public.staff_services x where x.staff_id = s.id)
                               or case when v.is_consultation then s.is_consultant else s.role = 'specialist' and not s.is_consultant end))
                then '{}'::uuid[] end
    from (select array_agg(s.id order by s.created_at) as pool from public.staff s
          where s.active and private.staff_provides(s.id, p_service)) q) end;
$$;

create or replace function private.pick_staff(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_strict boolean)
 returns table(ok boolean, sp uuid) language plpgsql stable security definer set search_path to '' as $function$
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

  if p_specialist is not null then
    if p_strict then
      if not private.staff_provides(p_specialist, p_service) then raise exception 'not_provider: هذه الأخصائية لا تقدّم هذه الخدمة'; end if;
    else
      if not exists (select 1 from public.staff s where s.id = p_specialist and s.active) then
        raise exception 'specialist not found';
      end if;
      if not private.staff_provides(p_specialist, p_service) then
        raise exception 'not_provider: هذه الأخصائية لا تقدّم هذه الخدمة';
      end if;
    end if;
    pool := array[p_specialist];
  else
    pool := private.service_pool(p_service, null);
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
end $function$;

-- Every bookable member → the service keys she provides (after fallback). Safe for anon: ids + keys only.
create or replace function public.service_providers()
returns table(staff_id uuid, service_key text, explicit boolean)
language sql stable security definer set search_path = '' as $$
  select s.id, v.key, exists (select 1 from public.staff_services x where x.staff_id = s.id)
  from public.staff s cross join public.services v
  where s.active and v.active and private.staff_provides(s.id, v.key)
  order by s.created_at, v.sort, v.name;
$$;
revoke all on function public.service_providers() from public;
grant execute on function public.service_providers() to anon, authenticated;

create or replace function public.public_booking_info()
 returns jsonb language sql stable security definer set search_path to '' as $function$
  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(jsonb_build_object('key', s.key, 'name', s.name, 'short_name', s.short_name,
        'description', s.description, 'price', public.to_syp(s.price, s.price_currency), 'price_from', s.price_from, 'minutes', s.minutes,
        'is_consultation', s.is_consultation, 'category_id', s.category_id) order by c.sort nulls last, s.sort, s.name)
      from public.services s left join public.service_categories c on c.key = s.category_id
      where s.active and s.bookable_online), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('key', c.key, 'name', c.name, 'short_description', c.short_description,
        'instructions', c.instructions, 'icon', c.icon, 'not_for_pregnant', c.not_for_pregnant) order by c.sort, c.name)
      from public.service_categories c where c.active), '[]'::jsonb),
    'specialists', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url,
        'services', coalesce((select jsonb_agg(v.key order by v.sort, v.name) from public.services v
                              where v.active and v.bookable_online and private.staff_provides(t.id, v.key)), '[]'::jsonb)) order by t.created_at)
      from public.staff t where t.active and t.role = 'specialist' and not t.is_consultant), '[]'::jsonb),
    'consultant', (select jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url,
        'services', coalesce((select jsonb_agg(v.key order by v.sort, v.name) from public.services v
                              where v.active and v.bookable_online and private.staff_provides(t.id, v.key)), '[]'::jsonb))
      from public.staff t where t.active and t.is_consultant order by t.created_at limit 1),
    'hours', coalesce((select value from public.settings where key = 'hours'), '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb),
    'centre', (select jsonb_build_object('phone', value->>'phone', 'whatsapp', value->>'whatsapp') from public.settings where key = 'centre'),
    'horizon_days', 30
  );
$function$;
