-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «appointments_booking».

-- Opening hours (admin-editable). days = open weekdays (0 = Sunday … 6 = Saturday), slot = minutes between start times.
insert into public.settings (key, value)
values ('hours', '{"days": [0, 1, 2, 3, 4, 6], "from": "10:00", "to": "18:00", "slot": 15}')
on conflict (key) do nothing;

-- ---------- waitlist ----------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  name text,
  phone text,
  service_key text references public.services(key),
  specialist_id uuid references public.staff(id),
  preferred_day date,
  part text not null default 'any' check (part in ('any', 'morning', 'evening')),
  note text,
  status text not null default 'waiting' check (status in ('waiting', 'offered', 'booked', 'closed')),
  appointment_id uuid references public.appointments(id) on delete set null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check (patient_id is not null or name is not null)
);
create index if not exists waitlist_patient_idx on public.waitlist (patient_id);
create index if not exists waitlist_status_idx on public.waitlist (status, created_at);
alter table public.waitlist enable row level security;

create policy "own or staff read" on public.waitlist for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "patient joins" on public.waitlist for insert to authenticated
  with check (patient_id = (select private.my_patient_id()) and status = 'waiting' and appointment_id is null);
create policy "patient leaves" on public.waitlist for update to authenticated
  using (patient_id = (select private.my_patient_id()))
  with check (patient_id = (select private.my_patient_id()) and status in ('waiting', 'closed') and appointment_id is null);
create policy "staff writes" on public.waitlist for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- ---------- booking with a double-booking check ----------
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
  pid uuid;
  src text;
  st public.appointment_status := 'confirmed';
  svc public.services;
  rm uuid;
  ends timestamptz;
  rec public.appointments;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into svc from public.services where key = p_service and active;
  if not found then raise exception 'service not found'; end if;

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
  end if;

  if p_specialist is not null and not exists (select 1 from public.staff where id = p_specialist and active) then
    raise exception 'specialist not found';
  end if;
  rm := coalesce(p_room, svc.room_id);
  ends := p_starts + make_interval(mins => svc.minutes);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));
  if exists (
    select 1 from public.appointments a
    where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
      and a.starts_at < ends
      and a.starts_at + make_interval(mins => a.minutes) > p_starts
      and ((rm is not null and a.room_id = rm) or (p_specialist is not null and a.specialist_id = p_specialist))
  ) then
    raise exception 'slot taken';
  end if;

  insert into public.appointments (patient_id, walk_in_name, walk_in_phone, service_key, specialist_id, room_id,
                                   starts_at, minutes, status, price, source, created_by)
  values (pid, case when pid is null then trim(p_walk_in_name) end, case when pid is null then nullif(trim(p_walk_in_phone), '') end,
          svc.key, p_specialist, rm, p_starts, svc.minutes, st, svc.price, src, auth.uid())
  returning * into rec;
  return rec;
end $$;
revoke execute on function public.book_appointment(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean) from public, anon;
grant execute on function public.book_appointment(text, timestamptz, uuid, uuid, uuid, text, text, text, boolean) to authenticated;

-- Busy time ranges (no names, no patients) so the booking screen can show free slots.
create or replace function public.booked_ranges(p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz, room_id uuid, specialist_id uuid)
language sql stable security definer set search_path = '' as $$
  select a.starts_at, a.starts_at + make_interval(mins => a.minutes), a.room_id, a.specialist_id
  from public.appointments a
  where a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
    and a.starts_at < p_to and a.starts_at + make_interval(mins => a.minutes) > p_from
    and p_to - p_from <= interval '32 days';
$$;
revoke execute on function public.booked_ranges(timestamptz, timestamptz) from public, anon;
grant execute on function public.booked_ranges(timestamptz, timestamptz) to authenticated;

-- The signed-in patient's place in today's queue: only her own number + counts.
create or replace function public.my_queue()
returns table (appointment_id uuid, queue_no int, room text, status public.appointment_status, starts_at timestamptz,
               called_at timestamptz, ahead int, now_serving int)
language sql stable security definer set search_path = '' as $$
  with me as (
    select a.* from public.appointments a
    where a.patient_id = private.my_patient_id()
      and a.queue_day = (now() at time zone 'Asia/Damascus')::date
      and a.queue_no is not null
      and a.status in ('checked_in', 'in_session')
    order by a.queue_no limit 1
  )
  select me.id, me.queue_no, r.name, me.status, me.starts_at, me.called_at,
    (select count(*)::int from public.appointments o
      where o.queue_day = me.queue_day and o.status = 'checked_in' and o.called_at is null and o.queue_no < me.queue_no),
    (select max(o.queue_no) from public.appointments o
      where o.queue_day = me.queue_day and (o.status = 'in_session' or (o.status = 'checked_in' and o.called_at is not null)))
  from me left join public.rooms r on r.id = me.room_id;
$$;
revoke execute on function public.my_queue() from public, anon;
grant execute on function public.my_queue() to authenticated;
