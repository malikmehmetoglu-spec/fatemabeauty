-- Public booking link (book.fatema.beauty): sessions only, auto-assigned specialist, confirmed directly, SMS confirmation.
--  • consultations (is_consultation) and hair-consultation are rejected by every public RPC (bad_service)
--  • level 3 is rejected (bad_level): the link offers level 1 «العادية» and level 2 «المكثّفة» only (admin/app keep 3)
--  • p_specialist is ignored: private.pick_staff[_m] picks an available specialist who provides the service
--    (staff_services, staff_hours, room capacity, VIP reserve); reception can reassign later
--  • the appointment is created as 'confirmed' (source 'public'), then pg_net asks the «booking-sms» edge function
--    to text the Arabic confirmation. pg_net sends after COMMIT only; a failed SMS never undoes the booking.

create or replace function private.pub_session_service(p_service text) returns public.services
language plpgsql stable security definer set search_path to '' as $$
declare svc public.services;
begin
  select * into svc from public.services
   where key = p_service and active and bookable_online and not is_consultation and key <> 'hair-consultation';
  if not found then raise exception 'bad_service'; end if;
  return svc;
end $$;

create or replace function private.pub_link_level(p_service text, p_level uuid) returns public.service_levels
language plpgsql stable security definer set search_path to '' as $$
declare l public.service_levels;
begin
  l := private.pub_level(p_service, p_level);
  if l.id is not null and l.level > 2 then raise exception 'bad_level'; end if;
  return l;
end $$;

create or replace function private.pub_booking_sms(p_appointment uuid) returns void
language plpgsql security definer set search_path to '' as $$
begin
  perform net.http_post(
    url := 'https://btcyrzvaexmgffeamlmg.supabase.co/functions/v1/booking-sms',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('appointment_id', p_appointment));
exception when others then
  null; -- never block a booking because the SMS could not be queued
end $$;

CREATE OR REPLACE FUNCTION public.public_slots(p_day date, p_service text, p_specialist uuid DEFAULT NULL::uuid)
 RETURNS TABLE(starts_at timestamp with time zone, available boolean)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$
begin
  perform private.pub_session_service(p_service);
  perform set_config('app.reserve_cap', '1', true);
  return query select * from private.slot_grid(p_day, p_service, null, true);
  perform set_config('app.reserve_cap', '', true);
end $function$;

CREATE OR REPLACE FUNCTION public.public_slots_level(p_day date, p_service text, p_specialist uuid DEFAULT NULL::uuid, p_level uuid DEFAULT NULL::uuid)
 RETURNS TABLE(starts_at timestamp with time zone, available boolean)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO ''
AS $function$
declare l public.service_levels;
begin
  perform private.pub_session_service(p_service);
  l := private.pub_link_level(p_service, p_level);
  perform set_config('app.reserve_cap', '1', true);
  return query select * from private.slot_grid_m(p_day, p_service, null, true, l.minutes);
  perform set_config('app.reserve_cap', '', true);
end $function$;

CREATE OR REPLACE FUNCTION public.public_book_level(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_name text, p_phone text, p_note text DEFAULT NULL::text, p_level uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; old_name text; r record;
        ends timestamptz; rec public.appointments; sp_name text; nt text := nullif(btrim(coalesce(p_note, '')), '');
        lvl public.service_levels; v_min int; v_price int;
begin
  if char_length(nm) < 2 or char_length(nm) > 60 then raise exception 'bad_name'; end if;
  digits := regexp_replace(digits, '^(00963|963|0)', '');
  if digits !~ '^9[0-9]{8}$' then raise exception 'bad_phone'; end if;
  ph := '+963' || digits;
  if char_length(coalesce(p_note, '')) > 300 then raise exception 'bad_note'; end if;

  svc := private.pub_session_service(p_service);
  lvl := private.pub_link_level(svc.key, p_level);
  v_min := coalesce(lvl.minutes, svc.minutes);
  v_price := case when lvl.id is null then coalesce(public.service_price_syp(svc.key), 0) else private.level_price_syp(lvl) end;
  if p_starts is null or p_starts <= now() then raise exception 'past'; end if;
  if p_starts > now() + interval '31 days' then raise exception 'too_far'; end if;
  if not private.pub_in_hours(p_starts, v_min) then raise exception 'closed'; end if;
  ends := p_starts + make_interval(mins => v_min);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  select id, name into pid, old_name from public.patients where phone = ph order by created_at limit 1;
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

  -- the link no longer offers a specialist choice: always auto-assign
  perform set_config('app.reserve_cap', '1', true);
  select * into r from private.pick_staff_m(p_service, p_starts, null, true, v_min);
  perform set_config('app.reserve_cap', '', true);
  if not r.ok then raise exception 'taken'; end if;

  if pid is null then
    insert into public.patients (name, phone, source) values (nm, ph, 'public') returning id into pid;
  elsif coalesce(btrim(old_name), '') = '' then
    update public.patients set name = nm where id = pid;
  elsif lower(btrim(old_name)) <> lower(nm) then
    nt := 'الاسم في رابط الحجز: ' || nm || coalesce(' — ' || nt, '');
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note, level_id)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, v_min, 'confirmed', v_price, 'public', nt, lvl.id)
  returning * into rec;

  perform private.pub_booking_sms(rec.id);

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name, 'phone', ph,
                            'level', lvl.name, 'price', rec.price, 'consult', false, 'status', rec.status);
end $function$;

-- legacy entry point (no level): same rules, routed through the level version with the default level 1
CREATE OR REPLACE FUNCTION public.public_book(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_name text, p_phone text, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE sql SECURITY DEFINER SET search_path TO ''
AS $function$
  select public.public_book_level(p_service, p_starts, null, p_name, p_phone, p_note, null);
$function$;

revoke all on function private.pub_session_service(text), private.pub_link_level(text, uuid), private.pub_booking_sms(uuid) from public, anon, authenticated;
