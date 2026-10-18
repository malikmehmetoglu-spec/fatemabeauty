-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «app_functions».

-- Creates (or returns) the patient record of the signed-in user. Called right after phone sign-in.
create or replace function public.ensure_patient() returns public.patients
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  ph text;
  rec public.patients;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into rec from public.patients where user_id = uid;
  if found then return rec; end if;
  select u.phone into ph from auth.users u where u.id = uid;
  if ph is not null and ph <> '' then
    ph := '+' || ltrim(ph, '+');
    update public.patients set user_id = uid where phone = ph and user_id is null returning * into rec;  -- record opened at reception
    if found then return rec; end if;
  end if;
  insert into public.patients (user_id, phone) values (uid, nullif(ph, '')) returning * into rec;
  return rec;
end $$;
revoke execute on function public.ensure_patient() from anon;

-- Records that the installed app was opened (web install, Play Store or App Store build).
create or replace function public.track_app_open(p_device_id text, p_platform text, p_channel text) returns void
language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin
  if p_device_id is null or length(p_device_id) < 8 or length(p_device_id) > 80 then return; end if;
  select id into pid from public.patients where user_id = auth.uid();
  insert into public.app_installs (device_id, patient_id, platform, channel)
  values (p_device_id, pid,
          case when p_platform in ('android','ios','desktop') then p_platform else 'other' end,
          case when p_channel in ('play_store','app_store') then p_channel else 'web' end)
  on conflict (device_id) do update
    set last_open_at = now(),
        opens = public.app_installs.opens + 1,
        patient_id = coalesce(excluded.patient_id, public.app_installs.patient_id);
end $$;
grant execute on function public.track_app_open(text, text, text) to anon, authenticated;

-- Today's queue for the waiting-room screen: numbers and rooms only, never names.
create or replace function public.today_queue()
returns table (queue_no int, room text, status public.appointment_status, called_at timestamptz, starts_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select a.queue_no, r.name, a.status, a.called_at, a.starts_at
  from public.appointments a left join public.rooms r on r.id = a.room_id
  where a.queue_day = (now() at time zone 'Asia/Damascus')::date
    and a.queue_no is not null
    and a.status in ('checked_in', 'in_session', 'done')
  order by a.queue_no;
$$;
grant execute on function public.today_queue() to anon, authenticated;

-- Patient cancels her own upcoming appointment.
create or replace function public.cancel_my_appointment(p_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.appointments
     set status = 'cancelled', cancel_reason = left(p_reason, 200)
   where id = p_id
     and patient_id = (select id from public.patients where user_id = auth.uid())
     and status in ('pending', 'confirmed')
     and starts_at > now();
  if not found then raise exception 'cannot cancel'; end if;
end $$;
revoke execute on function public.cancel_my_appointment(uuid, text) from anon;

alter publication supabase_realtime add table public.appointments;
