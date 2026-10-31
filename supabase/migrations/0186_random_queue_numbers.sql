-- Random queue numbers from a 50-number pool (each has /calls/<n>.mp3). A number is held only while the visit is
-- active (checked_in / in_session); leaving those statuses clears queue_day so the number returns to the pool
-- (the unique (queue_day, queue_no) key ignores rows with a null queue_day). No position/ahead info is exposed.
insert into public.settings (key, value, updated_at)
values ('queue_pool', '[256,504,971,173,357,130,487,293,523,216,958,693,587,865,126,915,623,270,319,625,734,862,468,249,730,586,312,274,197,792,796,781,214,670,501,512,132,896,726,513,852,783,532,819,981,678,489,425,691,946]'::jsonb, now())
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.settings (key, value, updated_at) values ('ticket_promo', '{"text": ""}'::jsonb, now())
on conflict (key) do nothing;

create or replace function private.assign_queue_no()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_pool int[];
  v_used int[];
begin
  if new.status = 'checked_in' and new.queue_no is not null and new.queue_day is null then
    new.queue_no := null; -- re-checked-in after leaving the queue: draw a fresh number
  end if;
  if new.status = 'checked_in' and new.queue_no is null then
    new.checked_in_at := coalesce(new.checked_in_at, now());
    new.queue_day := (now() at time zone 'Asia/Damascus')::date;
    perform pg_advisory_xact_lock(hashtext('queue' || new.queue_day::text));
    select coalesce(array_agg(queue_no), '{}') into v_used
      from public.appointments where queue_day = new.queue_day and queue_no is not null and id <> new.id;
    select coalesce(array_agg((x)::int), '{}') into v_pool
      from jsonb_array_elements_text(coalesce((select value from public.settings where key = 'queue_pool'), '[]'::jsonb)) x;
    select p into new.queue_no from unnest(v_pool) p where p <> all (v_used) order by random() limit 1;
    if new.queue_no is null then
      select n into new.queue_no from generate_series(100, 999) n
        where n <> all (v_used) and n <> all (v_pool) order by random() limit 1;
    end if;
  elsif new.status not in ('checked_in', 'in_session') and new.queue_day is not null then
    -- visit left the queue: free the number (keep queue_no on the row as history)
    new.queue_day := null;
    if new.status in ('pending', 'confirmed') then new.queue_no := null; end if;
  end if;
  return new;
end $function$;

-- free numbers of visits already finished today
update public.appointments set queue_day = null
 where queue_day is not null and status not in ('checked_in', 'in_session');

create or replace function public.today_queue()
 returns table(queue_no integer, room text, status appointment_status, called_at timestamp with time zone, starts_at timestamp with time zone)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select a.queue_no, r.name, a.status, a.called_at, a.starts_at
  from public.appointments a left join public.rooms r on r.id = a.room_id
  where a.queue_day = (now() at time zone 'Asia/Damascus')::date
    and a.queue_no is not null
    and a.status in ('checked_in', 'in_session')
  order by a.called_at desc nulls last, a.checked_in_at;
$function$;

-- ahead / now_serving are kept in the signature but always null (no ordering hints for clients)
create or replace function public.my_queue()
 returns table(appointment_id uuid, queue_no integer, room text, status appointment_status, starts_at timestamp with time zone, called_at timestamp with time zone, ahead integer, now_serving integer)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select a.id, a.queue_no, r.name, a.status, a.starts_at, a.called_at, null::int, null::int
  from public.appointments a left join public.rooms r on r.id = a.room_id
  where a.patient_id = private.my_patient_id()
    and a.queue_day = (now() at time zone 'Asia/Damascus')::date
    and a.queue_no is not null and a.status in ('checked_in', 'in_session')
  order by a.checked_in_at limit 1;
$function$;
