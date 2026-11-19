-- Per-service latest start time (Damascus local). Overrides booking_rules.last_start when earlier.
-- 2026-11-19: glow sessions last start 16:30; everything else keeps the global 17:00.
alter table public.services add column if not exists last_start time;
update public.services set last_start = '16:30' where key = 'glow';

create or replace function private.appointments_booking_rules()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare b text; ls time; m int;
begin
  if new.status in ('cancelled', 'no_show') then return new; end if;
  if tg_op = 'UPDATE' and new.starts_at = old.starts_at and new.specialist_id is not distinct from old.specialist_id
     and new.service_key is not distinct from old.service_key then return new; end if;
  b := private.booking_rule_block(new.starts_at, new.specialist_id);
  if b = 'closed_day' then raise exception 'المركز مغلق يوم الجمعة — لا يمكن حجز موعد.'; end if;
  if b = 'after_last' then raise exception 'آخر موعد يمكن حجزه الساعة 5:00 مساءً.'; end if;
  if b = 'consultant_off' then raise exception 'يوم الثلاثاء عطلة الاستشارية — اختاري يوماً آخر.'; end if;
  select s.last_start into ls from public.services s where s.key = new.service_key;
  if ls is not null and (new.starts_at at time zone 'Asia/Damascus')::time > ls then
    m := extract(hour from ls)::int;
    raise exception 'آخر موعد لهذه الجلسة الساعة %:% مساءً.', case when m > 12 then m - 12 else m end, to_char(ls, 'MI');
  end if;
  return new;
end $function$;

create or replace function private.slot_grid_m(p_day date, p_service text, p_specialist uuid, p_strict boolean, p_minutes integer)
 returns table(starts_at timestamp with time zone, available boolean)
 language plpgsql
 stable security definer
 set search_path to ''
as $function$
declare svc public.services; slot int; t int; st timestamptz; r record; dow int; pool uuid[]; fa int[]; ta int[]; v_min int;
        rules jsonb; last int := 1440;
begin
  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  v_min := coalesce(p_minutes, svc.minutes);
  if p_day < (now() at time zone 'Asia/Damascus')::date or p_day > (now() at time zone 'Asia/Damascus')::date + 30 then return; end if;
  slot := private.slot_minutes();
  dow := extract(dow from p_day)::int;
  select value into rules from public.settings where key = 'booking_rules';
  if coalesce(rules->'closed_days', '[]'::jsonb) @> to_jsonb(dow) then return; end if;
  if rules ? 'last_start' then
    last := split_part(rules->>'last_start', ':', 1)::int * 60 + coalesce(nullif(split_part(rules->>'last_start', ':', 2), '')::int, 0);
  end if;
  if svc.last_start is not null then
    last := least(last, extract(hour from svc.last_start)::int * 60 + extract(minute from svc.last_start)::int);
  end if;
  pool := private.service_pool(p_service, p_specialist);
  if pool is null then
    select array_agg(d.m_from), array_agg(d.m_to) into fa, ta from private.default_hours_on(dow) d;
  else
    if svc.is_consultation then
      select array_agg(p.id) into pool from unnest(pool) p(id) where not private.consult_capped(p.id, p_day);
      if pool is null then return; end if;
    end if;
    select array_agg(x.m_from), array_agg(x.m_to) into fa, ta from unnest(pool) p(id), lateral private.svc_ranges(p.id, dow, p_service) x;
  end if;
  if fa is null then return; end if;
  t := 0;
  while t + v_min <= 1440 and t <= last loop
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
