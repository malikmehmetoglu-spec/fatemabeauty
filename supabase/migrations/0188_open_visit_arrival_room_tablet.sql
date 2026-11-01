-- 0188: open bookings («تُحدَّد الجلسة عند الوصول»), guided arrival at reception, room tablet.
-- * service 'open-visit': 60 min in the skin room (one of its 3 beds), no specialist, no price, not bookable online.
--   It can never be paid/started as is: reception assigns the real service/level/specialist on arrival (assign_visit).
-- * permission 'room_tablet' (shared tablet in the treatment room): start/finish sessions.
-- * starting/finishing a session (checked_in→in_session, in_session→done/checked_in, done→in_session) needs
--   queue / room_tablet / kiosk_desk (owner/admin have all). Reception with calendar/patients/cashier only cannot.
-- Function bodies are patched from their LIVE definitions (pg_get_functiondef).

insert into public.services (key, name, short_name, description, price, price_from, minutes, room_id, bookable_online, active, sort, is_consultation, price_currency, is_online)
values ('open-visit', 'موعد — تُحدَّد الجلسة عند الوصول', 'جلسة غير محددة', 'حجز مكان في غرفة العناية بالبشرة؛ تُحدَّد الجلسة والأخصائية عند الوصول.',
        0, false, 60, '650a6348-0a2a-4741-8224-9407a55458fa', false, true, 999, false, 'SYP', false)
on conflict (key) do nothing;

-- pay gate: an open visit is never «paid» (its price is 0 until a session is assigned)
create or replace function private.appt_is_paid(a appointments)
 returns boolean
 language sql
 stable security definer
 set search_path to ''
as $function$
  select a.service_key <> 'open-visit' and (coalesce(a.price, 0) = 0 or a.patient_package_id is not null
      or exists (select 1 from public.invoices i where i.appointment_id = a.id and not i.void and i.paid));
$function$;

do $$
declare d text; o text; n text; k int;
begin
  -- catalogue + defaults: room_tablet
  d := pg_get_functiondef('public.set_staff_permissions(uuid,text[])'::regprocedure);
  o := '''package_requests''])) then';
  if position(o in d) = 0 then raise exception 'set_staff_permissions patch not found'; end if;
  execute replace(d, o, '''package_requests'',''room_tablet''])) then');

  d := pg_get_functiondef('private.role_default_perms(public.staff_role)'::regprocedure);
  o := '''kiosk_desk'',''written_consults_payments'',''package_requests'']';
  k := (length(d) - length(replace(d, o, ''))) / length(o);
  if k <> 2 then raise exception 'role_default_perms patch matched % times', k; end if;
  execute replace(d, o, '''kiosk_desk'',''written_consults_payments'',''package_requests'',''room_tablet'']');

  -- who may start / finish a session
  d := pg_get_functiondef('private.appointment_rules()'::regprocedure);
  o := E'    if not ok then raise exception ''bad status change % -> %'', old_st, new_st; end if;\n';
  k := (length(d) - length(replace(d, o, ''))) / length(o);
  if k <> 1 then raise exception 'appointment_rules patch matched % times', k; end if;
  n := o || E'    if ((old_st = ''checked_in'' and new_st = ''in_session'') or (old_st = ''in_session'' and new_st in (''done'', ''checked_in''))\n'
          || E'        or (old_st = ''done'' and new_st = ''in_session''))\n'
          || E'       and auth.uid() is not null\n'
          || E'       and not (private.has_perm(''queue'') or private.has_perm(''room_tablet'') or private.has_perm(''kiosk_desk'')) then\n'
          || E'      raise exception ''not allowed: session start/finish'';\n'
          || E'    end if;\n'
          || E'    if new_st = ''in_session'' and old_st = ''checked_in'' and new.service_key = ''open-visit'' then\n'
          || E'      raise exception ''حدّدي الجلسة قبل البدء'';\n'
          || E'    end if;\n';
  execute replace(d, o, n);
end $$;

-- room tablet account reads/updates today's appointments and the client names
alter policy "own or staff read" on public.appointments
  using ((patient_id = (select private.my_patient_id())) or ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','cashier','dashboard','kiosk_desk','reports','patients','room_tablet'])), true)));
alter policy "staff updates" on public.appointments
  using ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','kiosk_desk','cashier','room_tablet'])), true))
  with check ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','kiosk_desk','cashier','room_tablet'])), true));
alter policy "own or staff" on public.patients
  using ((user_id = (select auth.uid())) or ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','patients','patients_medical','cashier','kiosk_desk','marketing','dashboard','reports','finance','store','room_tablet'])), true)));

-- Arrival: set (or change) the session of a not-yet-started, not-yet-invoiced appointment.
-- Duration/price/room come from the service level. A conflict (specialist busy / room full) raises 'slot taken'
-- unless p_force: then it is saved anyway and the session simply starts once the specialist/bed is free.
create or replace function public.assign_visit(p_appt uuid, p_service text, p_level uuid default null, p_specialist uuid default null, p_force boolean default false)
returns public.appointments language plpgsql security definer set search_path = ''
as $$
declare
  a public.appointments; svc public.services; lvl public.service_levels; v_min int; v_price int; rm uuid; s timestamptz; e timestamptz;
begin
  if not (private.has_perm('calendar') or private.has_perm('kiosk_desk') or private.has_perm('queue')) then raise exception 'not allowed'; end if;
  select * into a from public.appointments where id = p_appt for update;
  if a.id is null then raise exception 'unknown appointment'; end if;
  if a.status not in ('pending', 'confirmed', 'checked_in') then raise exception 'لا يمكن تغيير جلسة بدأت أو انتهت'; end if;
  if exists (select 1 from public.invoices i where i.appointment_id = a.id and not i.void) then
    raise exception 'للموعد فاتورة صادرة — لا يمكن تغيير الجلسة';
  end if;
  select * into svc from public.services where key = p_service and active;
  if not found or svc.key = 'open-visit' then raise exception 'service not found'; end if;
  if p_specialist is not null and not exists (select 1 from public.staff where id = p_specialist and active) then raise exception 'specialist not found'; end if;

  lvl := private.resolve_level(svc.key, p_level, a.patient_id, true);
  v_min := coalesce(lvl.minutes, svc.minutes);
  v_price := coalesce(public.to_syp(lvl.price, lvl.price_currency), public.service_price_syp(svc.key), 0);
  if a.vip then v_price := round(v_price * 1.7); end if;
  rm := coalesce(svc.room_id, a.room_id);
  s := case when a.status = 'checked_in' then greatest(a.starts_at, now()) else a.starts_at end;
  e := s + make_interval(mins => v_min);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));
  if not p_force and (
       (p_specialist is not null and exists (
          select 1 from public.appointments x
          where x.id <> a.id and x.specialist_id = p_specialist and x.status in ('pending', 'confirmed', 'checked_in', 'in_session')
            and x.starts_at < e and x.starts_at + make_interval(mins => x.minutes + x.extension_minutes) > s))
    or (rm is not null and not private.room_has_space(rm, s, e, a.id))) then
    raise exception 'slot taken';
  end if;

  perform set_config('app.vip_override', '1', true);
  update public.appointments
     set service_key = svc.key, level_id = lvl.id, minutes = v_min, price = v_price, room_id = rm, specialist_id = p_specialist
   where id = a.id returning * into a;
  perform set_config('app.vip_override', '', true);
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), 'appointment.assign', a.id::text, jsonb_build_object('service', svc.key, 'level', lvl.id, 'specialist', p_specialist, 'forced', p_force));
  return a;
end $$;
revoke all on function public.assign_visit(uuid, text, uuid, uuid, boolean) from public, anon;
grant execute on function public.assign_visit(uuid, text, uuid, uuid, boolean) to authenticated;
