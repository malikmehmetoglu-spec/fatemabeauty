-- 0181 — «مرايتي» runs everything from the chat.
--  * maraiti_messages gains kind / ref_id / payload / seen_at: proactive cards (client brief before an appointment,
--    morning digest, Mira hand-off + new client messages, written consult paid, intake submitted, due reminder),
--    deduplicated by a unique index on (staff_id, kind, ref_id).
--  * Cards are composed in SQL (no AI call): private.maraiti_brief(), triggers + pg_cron sweep every 5 min.
--  * maraiti_decide executes the new draft kinds (cancel_appointment, add_patient, write_session_note,
--    reply_written_consult, reply_mira_thread, mark_intake_reviewed). The kind CHECK constraint must be widened by
--    the owner first: supabase/pending/maraiti_kinds.sql. Execution still ONLY happens on «موافقة».

alter table public.maraiti_messages add column if not exists kind text;
alter table public.maraiti_messages add column if not exists ref_id text;
alter table public.maraiti_messages add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.maraiti_messages add column if not exists seen_at timestamptz;
create unique index if not exists maraiti_messages_dedupe on public.maraiti_messages (staff_id, kind, ref_id) where ref_id is not null;
create index if not exists maraiti_messages_unseen on public.maraiti_messages (staff_id) where seen_at is null and role = 'assistant';

/** She opened the chat: everything so far is seen (drives the nav badge). */
create or replace function public.maraiti_seen()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_maraiti_user() then return; end if;
  update public.maraiti_messages set seen_at = now() where staff_id = private.my_staff_id() and seen_at is null;
end $$;
revoke all on function public.maraiti_seen() from public, anon;
grant execute on function public.maraiti_seen() to authenticated;

/* ---------------- posting ---------------- */
/** Posts one assistant card to every active consultant, once per (kind, ref). Returns nothing, never raises. */
create or replace function private.maraiti_post(p_kind text, p_ref text, p_body text, p_payload jsonb default '{}'::jsonb, p_staff uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.maraiti_messages (staff_id, role, body, kind, ref_id, payload)
  select s.id, 'assistant', p_body, p_kind, p_ref, coalesce(p_payload, '{}'::jsonb)
    from public.staff s where s.active and s.is_consultant and (p_staff is null or s.id = p_staff)
  on conflict (staff_id, kind, ref_id) where ref_id is not null do nothing;
exception when others then
  raise warning 'maraiti_post % %: %', p_kind, p_ref, sqlerrm;
end $$;
revoke all on function private.maraiti_post(text, text, text, jsonb, uuid) from public, anon, authenticated;

/** The client's last chat messages, oldest first, as [{from, body, at}]. */
create or replace function private.maraiti_last_msgs(p_patient uuid, p_n int default 5)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('from', x.author, 'body', left(x.body, 400), 'at', x.created_at) order by x.created_at), '[]'::jsonb)
    from (select m.author, m.body, m.created_at from public.messages m where m.patient_id = p_patient order by m.created_at desc limit p_n) x;
$$;
revoke all on function private.maraiti_last_msgs(uuid, int) from public, anon, authenticated;

/** A short client brief composed from her file (alerts first). p_appt adds that consultation's intake answers. */
create or replace function private.maraiti_brief(p_patient uuid, p_appt uuid default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare p public.patients; ci public.consult_intake; v_alerts text[] := '{}'; v_lines text[] := '{}';
        v_visits int; v_last text; v_notes text; v_pk text; v_bal int; v_cond text;
begin
  select * into p from public.patients where id = p_patient;
  if p.id is null then return ''; end if;
  if p_appt is not null then select * into ci from public.consult_intake where appointment_id = p_appt; end if;
  if ci.id is null then
    select * into ci from public.consult_intake where patient_id = p_patient and submitted_at is not null order by submitted_at desc limit 1;
  end if;

  if p.pregnant or coalesce(ci.pregnant, false) then v_alerts := v_alerts || 'حامل'::text; end if;
  if p.breastfeeding then v_alerts := v_alerts || 'مرضعة'::text; end if;
  if nullif(btrim(coalesce(ci.allergies, '')), '') is not null then v_alerts := v_alerts || ('تحسّس: ' || ci.allergies); end if;
  if nullif(btrim(coalesce(ci.medications, '')), '') is not null then v_alerts := v_alerts || ('أدوية: ' || ci.medications); end if;
  select string_agg(c.name, '، ') into v_cond from public.patient_conditions c where c.patient_id = p_patient;
  if v_cond is not null then v_alerts := v_alerts || ('حالات: ' || v_cond); end if;

  select count(*) filter (where a.status = 'done') into v_visits from public.appointments a where a.patient_id = p_patient;
  select to_char(a.starts_at at time zone 'Asia/Damascus', 'YYYY-MM-DD') || ' ' || coalesce(s.name, a.service_key) into v_last
    from public.appointments a left join public.services s on s.key = a.service_key
   where a.patient_id = p_patient and a.status = 'done' order by a.starts_at desc limit 1;
  select string_agg(left(n.body, 160), ' ‖ ' order by n.created_at desc) into v_notes
    from (select body, created_at from public.session_notes where patient_id = p_patient order by created_at desc limit 2) n;
  select string_agg(coalesce(k.name, 'باقة') || ' ' || (pp.sessions_total - pp.sessions_used) || ' متبقية', '، ') into v_pk
    from public.patient_packages pp left join public.packages k on k.id = pp.package_id
   where pp.patient_id = p_patient and pp.sessions_used < pp.sessions_total;
  select coalesce(sum(greatest(i.total - coalesce(i.amount_paid, 0), 0)), 0) into v_bal
    from public.invoices i where i.patient_id = p_patient and not coalesce(i.void, false) and not i.paid;

  if array_length(v_alerts, 1) > 0 then v_lines := v_lines || ('⚠️ ' || array_to_string(v_alerts, ' · ')); end if;
  v_lines := v_lines || (case when v_visits = 0 then 'زيارتها الأولى' else v_visits || ' زيارات، آخرها ' || coalesce(v_last, '-') end
                         || coalesce(' · بشرة ' || p.skin_type, '') || case when p.vip then ' · VIP' else '' end);
  if ci.id is not null and ci.submitted_at is not null then
    v_lines := v_lines || ('النموذج: ' || concat_ws(' · ', nullif('المشكلة: ' || coalesce(ci.concern, ''), 'المشكلة: '),
                                       nullif('منذ: ' || coalesce(ci.since, ''), 'منذ: '), nullif('جرّبت: ' || coalesce(ci.tried, ''), 'جرّبت: '),
                                       nullif('هدفها: ' || coalesce(ci.goals, ''), 'هدفها: ')));
  elsif p_appt is not null then
    v_lines := v_lines || 'لم تعبّئ نموذج ما قبل الاستشارة'::text;
  end if;
  if v_notes is not null then v_lines := v_lines || ('آخر ملاحظاتكِ: ' || v_notes); end if;
  if v_pk is not null then v_lines := v_lines || ('الباقات: ' || v_pk); end if;
  if v_bal > 0 then v_lines := v_lines || ('عليها رصيد ' || v_bal); end if;
  if nullif(btrim(coalesce(p.notes, '')), '') is not null then v_lines := v_lines || ('ملاحظات الملف: ' || left(p.notes, 200)); end if;
  return array_to_string(v_lines, E'\n');
end $$;
revoke all on function private.maraiti_brief(uuid, uuid) from public, anon, authenticated;

/* ---------------- triggers ---------------- */
-- (b) Mira handed the conversation to Fatema
create or replace function private.maraiti_on_thread() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  if new.status = 'fatema' and (tg_op = 'INSERT' or old.status is distinct from 'fatema') then
    select name into v_name from public.patients where id = new.patient_id;
    perform private.maraiti_post('client_chat', new.patient_id::text || ':' || extract(epoch from coalesce(new.handoff_at, now()))::bigint,
      case when new.urgent then '🔴 ' else '' end || 'ميرا حوّلتلكِ ' || coalesce(v_name, 'عميلة') || coalesce(' — ' || nullif(coalesce(new.reason, new.summary), ''), ''),
      jsonb_build_object('patient_id', new.patient_id, 'patient_name', v_name, 'urgent', new.urgent, 'messages', private.maraiti_last_msgs(new.patient_id)));
  end if;
  return new;
exception when others then raise warning 'maraiti_on_thread: %', sqlerrm; return new;
end $$;
create or replace trigger maraiti_thread after insert or update of status on public.mira_threads
  for each row execute function private.maraiti_on_thread();

-- (b) a client writes in a conversation that is with Fatema: refresh the unseen card, or post a new one
create or replace function private.maraiti_on_message() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text; v_n int;
begin
  if not new.from_patient then return new; end if;
  if not exists (select 1 from public.mira_threads t where t.patient_id = new.patient_id and t.status = 'fatema') then return new; end if;
  update public.maraiti_messages m set payload = m.payload || jsonb_build_object('messages', private.maraiti_last_msgs(new.patient_id))
   where m.kind = 'client_chat' and m.seen_at is null and m.payload->>'patient_id' = new.patient_id::text;
  get diagnostics v_n = row_count;
  if v_n = 0 then
    select name into v_name from public.patients where id = new.patient_id;
    perform private.maraiti_post('client_chat', new.id::text, coalesce(v_name, 'عميلة') || ' كتبتلكِ: ' || left(new.body, 160),
      jsonb_build_object('patient_id', new.patient_id, 'patient_name', v_name, 'messages', private.maraiti_last_msgs(new.patient_id)));
  end if;
  return new;
exception when others then raise warning 'maraiti_on_message: %', sqlerrm; return new;
end $$;
create or replace trigger maraiti_message after insert on public.messages
  for each row execute function private.maraiti_on_message();

-- (c) written consult paid
create or replace function private.maraiti_on_written() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    select name into v_name from public.patients where id = new.patient_id;
    perform private.maraiti_post('written_paid', new.id::text,
      'استشارة مكتوبة مدفوعة من ' || coalesce(v_name, 'عميلة') || coalesce(' — الرد قبل ' || to_char(new.due_at at time zone 'Asia/Damascus', 'MM-DD HH24:MI'), ''),
      jsonb_build_object('patient_id', new.patient_id, 'patient_name', v_name, 'written_consult_id', new.id, 'intake', new.intake,
                         'photos', coalesce(array_length(new.photos, 1), 0), 'brief', private.maraiti_brief(new.patient_id)));
  end if;
  return new;
exception when others then raise warning 'maraiti_on_written: %', sqlerrm; return new;
end $$;
create or replace trigger maraiti_written after insert or update of status on public.written_consults
  for each row execute function private.maraiti_on_written();

-- (d) intake form submitted
create or replace function private.maraiti_on_intake() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text; v_at timestamptz;
begin
  if new.submitted_at is not null and (tg_op = 'INSERT' or old.submitted_at is null) then
    select name into v_name from public.patients where id = new.patient_id;
    select starts_at into v_at from public.appointments where id = new.appointment_id;
    perform private.maraiti_post('intake', new.appointment_id::text,
      coalesce(v_name, 'عميلة') || ' عبّأت نموذج ما قبل الاستشارة' || coalesce(' (موعدها ' || to_char(v_at at time zone 'Asia/Damascus', 'MM-DD HH24:MI') || ')', ''),
      jsonb_build_object('patient_id', new.patient_id, 'patient_name', v_name, 'appointment_id', new.appointment_id,
                         'brief', private.maraiti_brief(new.patient_id, new.appointment_id)));
  end if;
  return new;
exception when others then raise warning 'maraiti_on_intake: %', sqlerrm; return new;
end $$;
create or replace trigger maraiti_intake after insert or update of submitted_at on public.consult_intake
  for each row execute function private.maraiti_on_intake();

/* ---------------- sweep (pg_cron, every 5 min) ---------------- */
create or replace function private.maraiti_sweep()
returns void language plpgsql security definer set search_path = '' as $$
declare s record; a record; r record; v_today date := (now() at time zone 'Asia/Damascus')::date;
        d0 timestamptz := (v_today::timestamp) at time zone 'Asia/Damascus'; v_list text; v_n int; v_w int; v_m int;
begin
  for s in select id from public.staff where active and is_consultant loop
    -- (a) morning digest, from 08:00 Damascus
    if extract(hour from now() at time zone 'Asia/Damascus') >= 8 then
      select count(*), string_agg(to_char(x.starts_at at time zone 'Asia/Damascus', 'HH24:MI') || ' ' || coalesce(p.name, x.walk_in_name, 'زائرة')
                                   || ' · ' || coalesce(sv.name, x.service_key), E'\n' order by x.starts_at)
        into v_n, v_list
        from public.appointments x left join public.patients p on p.id = x.patient_id left join public.services sv on sv.key = x.service_key
       where x.specialist_id = s.id and x.starts_at >= d0 and x.starts_at < d0 + interval '1 day' and x.status in ('pending', 'confirmed', 'checked_in', 'in_session');
      select count(*) into v_w from public.written_consults where status = 'paid';
      select count(*) into v_m from public.mira_threads where status = 'fatema';
      perform private.maraiti_post('digest', v_today::text,
        'صباح الخير 🌸 ' || case when v_n = 0 then 'ما عندكِ مواعيد اليوم.' else 'عندكِ اليوم ' || v_n || ' مواعيد:' || E'\n' || v_list end
        || case when v_w > 0 then E'\n' || v_w || ' استشارات مكتوبة بانتظار ردّكِ.' else '' end
        || case when v_m > 0 then E'\n' || v_m || ' محادثات حوّلتها ميرا لكِ.' else '' end,
        jsonb_build_object('day', v_today), s.id);
    end if;
    -- (a) brief ~30–45 min before each of her appointments
    for a in select x.id, x.patient_id, x.starts_at, coalesce(p.name, x.walk_in_name, 'زائرة') as who, coalesce(sv.name, x.service_key) as svc
               from public.appointments x left join public.patients p on p.id = x.patient_id left join public.services sv on sv.key = x.service_key
              where x.specialist_id = s.id and x.status in ('pending', 'confirmed', 'checked_in')
                and x.starts_at > now() + interval '20 minutes' and x.starts_at <= now() + interval '45 minutes' loop
      perform private.maraiti_post('pre_appt', a.id::text,
        a.who || ' الساعة ' || to_char(a.starts_at at time zone 'Asia/Damascus', 'HH24:MI') || ' · ' || a.svc
          || case when a.patient_id is not null then E'\n' || private.maraiti_brief(a.patient_id, a.id) else E'\nزائرة بلا ملف.' end,
        jsonb_build_object('patient_id', a.patient_id, 'patient_name', a.who, 'appointment_id', a.id, 'starts_at', a.starts_at), s.id);
    end loop;
    -- (e) due reminders
    for r in select m.id, m.title, m.payload->>'text' as t from public.maraiti_actions m
              where m.staff_id = s.id and m.kind = 'remind_me' and m.status = 'approved' and not m.remind_done and m.remind_at <= now() loop
      perform private.maraiti_post('reminder', r.id::text, '⏰ تذكير: ' || coalesce(r.t, r.title), jsonb_build_object('action_id', r.id), s.id);
    end loop;
  end loop;
end $$;
revoke all on function private.maraiti_sweep() from public, anon, authenticated;

select cron.schedule('maraiti-sweep', '*/5 * * * *', $$ select private.maraiti_sweep(); $$);

/* ---------------- decide: every draft kind ---------------- */
create or replace function public.maraiti_decide(p_id uuid, p_decision text, p_payload jsonb default null)
returns public.maraiti_actions language plpgsql security definer set search_path = '' as $$
declare a public.maraiti_actions; me uuid := private.my_staff_id(); pl jsonb; ap public.appointments;
        v_starts timestamptz; v_ends timestamptz; v_text text; v_pid uuid; v_res text; v_new public.patients;
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
  v_text := btrim(coalesce(pl->>'text', ''));

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
    elsif a.kind = 'cancel_appointment' then
      select * into ap from public.appointments where id = (pl->>'appointment_id')::uuid for update;
      if ap.id is null or ap.status not in ('pending', 'confirmed') then raise exception 'cannot cancel'; end if;
      update public.appointments set status = 'cancelled', cancel_reason = coalesce(nullif(btrim(coalesce(pl->>'reason', '')), ''), 'ألغته أ. فاطمة') where id = ap.id;
      if ap.patient_id is not null then
        insert into public.notifications (patient_id, kind, title, body, link)
        values (ap.patient_id, 'appointment', 'أُلغي موعدكِ',
                'تم إلغاء موعدكِ يوم ' || to_char(ap.starts_at at time zone 'Asia/Damascus', 'YYYY-MM-DD HH24:MI') || ' بتوقيت دمشق.', '/appointments/');
      end if;
      v_res := 'تم إلغاء الموعد';
    elsif a.kind = 'add_patient' then
      if btrim(coalesce(pl->>'name', '')) = '' then raise exception 'name required'; end if;
      insert into public.patients (name, phone, notes)
      values (btrim(pl->>'name'), nullif(btrim(coalesce(pl->>'phone', '')), ''), nullif(btrim(coalesce(pl->>'notes', '')), ''))
      returning * into v_new;
      pl := pl || jsonb_build_object('patient_id', v_new.id, 'file_no', v_new.file_no);
      v_res := 'تم فتح ملف رقم ' || coalesce(v_new.file_no::text, '-');
    elsif a.kind = 'write_session_note' then
      v_pid := (pl->>'patient_id')::uuid;
      if v_pid is null or v_text = '' then raise exception 'empty note'; end if;
      insert into public.session_notes (patient_id, appointment_id, author_id, body, fields)
      values (v_pid, nullif(pl->>'appointment_id', '')::uuid, me, v_text, jsonb_build_object('notes', v_text));
      v_res := 'تم حفظ الملاحظة';
    elsif a.kind = 'reply_written_consult' then
      if v_text = '' then raise exception 'empty message'; end if;
      perform public.written_consult_reply((pl->>'written_consult_id')::uuid, v_text, null);
      v_res := 'تم إرسال الرد';
    elsif a.kind in ('send_client_message', 'reply_mira_thread') then
      v_pid := (pl->>'patient_id')::uuid;
      if v_pid is null or v_text = '' then raise exception 'empty message'; end if;
      insert into public.messages (patient_id, from_patient, staff_id, body, author) values (v_pid, false, me, v_text, 'staff');
      insert into public.notifications (patient_id, kind, title, body, link)
      values (v_pid, 'message', 'رسالة من أ. فاطمة', left(v_text, 140), '/chat/');
      if a.kind = 'reply_mira_thread' then
        update public.mira_threads set status = 'mira', urgent = false, escalated = false, notify_count = 0, notified_at = null,
               resolved_at = now(), updated_at = now() where patient_id = v_pid and status = 'fatema';
      end if;
      v_res := 'تم الإرسال';
    elsif a.kind = 'mark_intake_reviewed' then
      perform public.consult_intake_review((pl->>'appointment_id')::uuid, true);
      v_res := 'تم';
    elsif a.kind = 'remind_me' then
      update public.maraiti_actions set remind_at = coalesce((pl->>'at')::timestamptz, now()) where id = p_id;
      v_res := 'تم ضبط التذكير';
    else
      raise exception 'unknown kind';
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
