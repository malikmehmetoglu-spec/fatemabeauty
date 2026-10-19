-- 0070 Public booking link (fatema.beauty/book, book.fatema.beauty).
-- Anonymous visitors see slot availability and book through two SECURITY DEFINER functions only.
-- No table is opened to anon. Bookings land in public.appointments as normal «pending» rows, source 'public'.

alter table public.staff    add column if not exists is_consultant   boolean not null default false;
alter table public.services add column if not exists is_consultation boolean not null default false;
alter table public.appointments add column if not exists note text;

alter table public.appointments drop constraint if exists appointments_source_check;
alter table public.appointments add constraint appointments_source_check
  check (source = any (array['app', 'reception', 'walk_in', 'admin', 'public']));

-- Opening-hours check (same rule book_appointment applies to patient bookings).
create or replace function private.pub_in_hours(p_starts timestamptz, p_minutes int)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare h jsonb; loc timestamp; m_from int; m_to int; m_start int; slot int;
begin
  select value into h from public.settings where key = 'hours';
  h := coalesce(h, '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb);
  loc := p_starts at time zone 'Asia/Damascus';
  m_from := split_part(h->>'from', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'from', ':', 2), '')::int, 0);
  m_to := split_part(h->>'to', ':', 1)::int * 60 + coalesce(nullif(split_part(h->>'to', ':', 2), '')::int, 0);
  m_start := extract(hour from loc)::int * 60 + extract(minute from loc)::int;
  slot := greatest(5, coalesce((h->>'slot')::int, 15));
  return (h->'days') @> to_jsonb(extract(dow from loc)::int)
     and m_start >= m_from and m_start + p_minutes <= m_to
     and extract(second from loc) = 0 and (m_start - m_from) % slot = 0;
end $$;

-- Which staff member would take this slot (null + ok=false when none is free / the room is busy).
-- Pool: consultation services → active consultants; other services → active specialists who are not consultants.
-- An empty specialist pool for a normal session behaves like book_appointment (room-only check, specialist assigned later).
create or replace function private.pub_pick(p_service text, p_starts timestamptz, p_specialist uuid)
returns table (ok boolean, sp uuid) language plpgsql stable security definer set search_path = '' as $$
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
    if pool is null or not (p_specialist = any(pool)) then raise exception 'bad_specialist'; end if;
    pool := array[p_specialist];
  end if;
  if pool is null then
    return query select not svc.is_consultation, null::uuid; return;
  end if;

  select s.id into pick from public.staff s
  where s.id = any(pool)
    and not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                      and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts)
  order by (select count(*) from public.appointments a
            where a.specialist_id = s.id and a.status not in ('cancelled', 'no_show')
              and (a.starts_at at time zone 'Asia/Damascus')::date = (p_starts at time zone 'Asia/Damascus')::date), s.created_at
  limit 1;
  return query select pick is not null, pick;
end $$;

-- What the public page may show: bookable services, specialists, the consultant, hours. No private data.
create or replace function public.public_booking_info()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(jsonb_build_object('key', s.key, 'name', s.name, 'short_name', s.short_name,
        'description', s.description, 'price', s.price, 'price_from', s.price_from, 'minutes', s.minutes,
        'is_consultation', s.is_consultation) order by s.sort, s.name)
      from public.services s where s.active and s.bookable_online), '[]'::jsonb),
    'specialists', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url) order by t.created_at)
      from public.staff t where t.active and t.role = 'specialist' and not t.is_consultant), '[]'::jsonb),
    'consultant', (select jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url)
      from public.staff t where t.active and t.is_consultant order by t.created_at limit 1),
    'hours', coalesce((select value from public.settings where key = 'hours'), '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb),
    'centre', (select jsonb_build_object('phone', value->>'phone', 'whatsapp', value->>'whatsapp') from public.settings where key = 'centre'),
    'horizon_days', 30
  );
$$;

-- Every slot start of a Damascus day with availability (no names, no appointment details).
create or replace function public.public_slots(p_day date, p_service text, p_specialist uuid default null)
returns table (starts_at timestamptz, available boolean)
language plpgsql stable security definer set search_path = '' as $$
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
      select * into r from private.pub_pick(p_service, st, p_specialist);
      starts_at := st; available := r.ok; return next;
    end if;
    t := t + slot;
  end loop;
end $$;

-- Book from the public link. Errors are short codes the page maps to Arabic.
create or replace function public.public_book(p_service text, p_starts timestamptz, p_specialist uuid,
                                              p_name text, p_phone text, p_note text default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
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

  select * into r from private.pub_pick(p_service, p_starts, p_specialist);
  if not r.ok then raise exception 'taken'; end if;

  if pid is null then
    insert into public.patients (name, phone) values (nm, ph) returning id into pid;
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, svc.minutes, 'pending', svc.price, 'public', nullif(btrim(coalesce(p_note, '')), ''))
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name);
end $$;

revoke all on function private.pub_in_hours(timestamptz, int) from public, anon, authenticated;
revoke all on function private.pub_pick(text, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.public_booking_info() from public;
revoke all on function public.public_slots(date, text, uuid) from public;
revoke all on function public.public_book(text, timestamptz, uuid, text, text, text) from public;
grant execute on function public.public_booking_info() to anon, authenticated;
grant execute on function public.public_slots(date, text, uuid) to anon, authenticated;
grant execute on function public.public_book(text, timestamptz, uuid, text, text, text) to anon, authenticated;
