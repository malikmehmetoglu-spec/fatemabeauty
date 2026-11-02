-- 0190: bookings made by STAFF are never blocked by room capacity or specialist overlap.
-- Public link (public_book_level, anon) and patient app (book_appointment_v2 as patient, pick_staff_m)
-- keep the strict rules. Patches the LIVE definitions in place (pg_get_functiondef + replace) and
-- asserts each replacement actually happened.
do $mig$
declare d text; n text;
begin
  -- 1) trigger: skip overlap/capacity check when the caller is active staff
  d := pg_get_functiondef('private.appointment_rules()'::regprocedure);
  n := replace(d, $a$coalesce(current_setting('app.vip_override', true), '') <> '1' and (tg_op = 'INSERT'$a$,
                  $a$coalesce(current_setting('app.vip_override', true), '') <> '1' and not private.is_staff() and (tg_op = 'INSERT'$a$);
  if n = d then raise exception 'patch appointment_rules failed'; end if;
  execute n;

  -- 2) book_appointment_v2: staff path never raises slot taken
  d := pg_get_functiondef('public.book_appointment_v2(text,timestamptz,uuid,uuid,uuid,text,text,text,boolean,uuid)'::regprocedure);
  n := replace(d, $a$  if st <> 'checked_in' and exists ($a$, $a$  if not is_staff and st <> 'checked_in' and exists ($a$);
  n := replace(n, $a$) or (st <> 'checked_in' and rm is not null$a$, $a$) or (not is_staff and st <> 'checked_in' and rm is not null$a$);
  if n = d or strpos(n, 'or (not is_staff and st') = 0 then raise exception 'patch book_appointment_v2 failed'; end if;
  execute n;

  -- 3) assign_visit (staff-only RPC): never blocked
  d := pg_get_functiondef('public.assign_visit(uuid,text,uuid,uuid,boolean)'::regprocedure);
  n := replace(d, $a$if not p_force and ($a$, $a$if not p_force and not private.is_staff() and ($a$);
  if n = d then raise exception 'patch assign_visit failed'; end if;
  execute n;

  -- 4) maraiti_decide reschedule (approved by staff): never blocked for staff
  d := pg_get_functiondef('public.maraiti_decide(uuid,text,jsonb)'::regprocedure);
  n := replace(d, $a$      if exists (select 1 from public.appointments x
                 where x.id <> ap.id$a$, $a$      if not private.is_staff() and (exists (select 1 from public.appointments x
                 where x.id <> ap.id$a$);
  n := replace(n, $a$private.room_has_space(ap.room_id, v_starts, v_ends, ap.id))
      then raise exception 'slot taken'; end if;$a$, $a$private.room_has_space(ap.room_id, v_starts, v_ends, ap.id)))
      then raise exception 'slot taken'; end if;$a$);
  if n = d or strpos(n, 'ap.id)))') = 0 then raise exception 'patch maraiti_decide failed'; end if;
  execute n;
end $mig$;
