-- 2026-11-17 (owner): no per-specialist service assignment. Every active specialist provides every session;
-- the consultant provides consultations. Table staff_services is kept (non-destructive) but ignored.
create or replace function private.staff_provides(p_staff uuid, p_service text)
 returns boolean language sql stable security definer set search_path to '' as $f$
  select exists (
    select 1 from public.staff s join public.services v on v.key = p_service
    where s.id = p_staff and s.active and
      case when v.is_consultation then s.is_consultant else s.role = 'specialist' and not s.is_consultant end);
$f$;

create or replace function private.service_pool(p_service text, p_specialist uuid)
 returns uuid[] language sql stable security definer set search_path to '' as $f$
  select case when p_specialist is not null then array[p_specialist] else (
    select array_agg(s.id order by s.created_at) from public.staff s
    where s.active and private.staff_provides(s.id, p_service)) end;
$f$;

create or replace function public.service_providers()
 returns table(staff_id uuid, service_key text, explicit boolean)
 language sql stable security definer set search_path to '' as $f$
  select s.id, v.key, false
  from public.staff s cross join public.services v
  where s.active and v.active and private.staff_provides(s.id, v.key)
  order by s.created_at, v.sort, v.name;
$f$;
