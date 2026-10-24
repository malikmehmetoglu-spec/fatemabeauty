-- 0180 — «مرايتي» can book a client who has no file yet: the draft carries name + phone and the
-- appointments trigger (0115) opens her file on insert.
create or replace function public.maraiti_decide(p_id uuid, p_decision text, p_payload jsonb default null)
returns public.maraiti_actions language plpgsql security definer set search_path = '' as $$
declare a public.maraiti_actions; me uuid := private.my_staff_id(); pl jsonb; ap public.appointments;
        v_starts timestamptz; v_ends timestamptz; v_text text; v_pid uuid; v_res text;
begin
  if not private.is_maraiti_user() then raise exception 'not allowed'; end if;
  select * into a from public.maraiti_actions where id = p_id and staff_id = me for update;
  if a.id is null then raise exception 'not found'; end if;
  if a.status <> 'pending' then raise exception 'already decided'; end if;
  if p_decision = 'dismiss' then
    update public.maraiti_actions set status = 'dismissed', decided_at = now() where id = p_id returning * into a;
    return a;
  end if;
  if p_decision <> 'approve' then raise exception 'bad decision'; end if;
  pl := coalesce(p_payload, a.payload);

  begin
    if a.kind = 'book_appointment' then
      select * into ap from public.book_appointment_v2(
        pl->>'service_key', (pl->>'starts_at')::timestamptz, nullif(pl->>'specialist_id', '')::uuid, null,
        nullif(pl->>'patient_id', '')::uuid, nullif(pl->>'client_name', ''), nullif(pl->>'client_phone', ''), 'admin', false, nullif(pl->>'level_id', '')::uuid);
      v_res := 'تم الحجز';
    elsif a.kind = 'reschedule' then
      select * into ap from public.appointments where id = (pl->>'appointment_id')::uuid for update;
      if ap.id is null or ap.status not in ('pending', 'confirmed') then raise exception 'appointment not movable'; end if;
      v_starts := (pl->>'starts_at')::timestamptz;
      if v_starts <= now() then raise exception 'time in the past'; end if;
      v_ends := v_starts + make_interval(mins => ap.minutes);
      perform pg_advisory_xact_lock(hashtext('book-appointments'));
      if exists (select 1 from public.appointments x
                 where x.id <> ap.id and x.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                   and x.starts_at < v_ends and x.starts_at + make_interval(mins => x.minutes + x.extension_minutes) > v_starts
                   and ((ap.room_id is not null and x.room_id = ap.room_id) or (ap.specialist_id is not null and x.specialist_id = ap.specialist_id)))
      then raise exception 'slot taken'; end if;
      update public.appointments set starts_at = v_starts, confirm_sent_at = null where id = ap.id;
      if ap.patient_id is not null then
        insert into public.notifications (patient_id, kind, title, body, link)
        values (ap.patient_id, 'appointment', 'تغيّر موعدكِ',
                'تم نقل موعدكِ إلى ' || to_char(v_starts at time zone 'Asia/Damascus', 'YYYY-MM-DD HH24:MI') || ' بتوقيت دمشق.', '/appointments/');
      end if;
      v_res := 'تم نقل الموعد';
    elsif a.kind = 'send_client_message' then
      v_pid := (pl->>'patient_id')::uuid;
      v_text := trim(coalesce(pl->>'text', ''));
      if v_pid is null or v_text = '' then raise exception 'empty message'; end if;
      insert into public.messages (patient_id, from_patient, staff_id, body, author) values (v_pid, false, me, v_text, 'staff');
      insert into public.notifications (patient_id, kind, title, body, link)
      values (v_pid, 'message', 'رسالة من أ. فاطمة', left(v_text, 140), '/chat/');
      v_res := 'تم الإرسال';
    elsif a.kind = 'remind_me' then
      update public.maraiti_actions set remind_at = coalesce((pl->>'at')::timestamptz, now()) where id = p_id;
      v_res := 'تم ضبط التذكير';
    end if;
  exception when others then
    update public.maraiti_actions set status = 'failed', result = sqlerrm, payload = pl, decided_at = now() where id = p_id returning * into a;
    return a;
  end;
  update public.maraiti_actions set status = 'approved', result = v_res, payload = pl, decided_at = now() where id = p_id returning * into a;
  return a;
end $$;
revoke all on function public.maraiti_decide(uuid, text, jsonb) from public, anon;
grant execute on function public.maraiti_decide(uuid, text, jsonb) to authenticated;

