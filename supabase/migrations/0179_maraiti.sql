-- «مرايتي» — the consultant's (staff.is_consultant) personal assistant. Consultant ONLY: owner/admin without
-- is_consultant are excluded on purpose (private.is_maraiti_user, unlike private.is_consult_staff).
-- Maraiti proposes, Fatema approves: the edge function «maraiti» only writes drafts into maraiti_actions;
-- public.maraiti_decide() executes an approved draft with Fatema's own session.

create or replace function private.is_maraiti_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.active and s.is_consultant);
$$;
revoke all on function private.is_maraiti_user() from public, anon;
grant execute on function private.is_maraiti_user() to authenticated;

/* ---------------- chat ---------------- */
create table if not exists public.maraiti_messages (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id),
  role text not null check (role in ('user', 'assistant')),
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists maraiti_messages_staff_idx on public.maraiti_messages (staff_id, created_at desc);
alter table public.maraiti_messages enable row level security;
create policy "consultant reads own" on public.maraiti_messages for select to authenticated
  using ((select private.is_maraiti_user()) and staff_id = (select private.my_staff_id()));
create policy "consultant writes own" on public.maraiti_messages for insert to authenticated
  with check ((select private.is_maraiti_user()) and staff_id = (select private.my_staff_id()) and role = 'user');
grant select, insert on public.maraiti_messages to authenticated;
grant select, insert, update on public.maraiti_messages to service_role;

/* ---------------- draft actions ---------------- */
create table if not exists public.maraiti_actions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id),
  kind text not null check (kind in ('book_appointment', 'send_client_message', 'reschedule', 'remind_me')),
  title text not null default '',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'dismissed', 'failed')),
  result text,
  remind_at timestamptz,
  remind_done boolean not null default false,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists maraiti_actions_staff_idx on public.maraiti_actions (staff_id, status, created_at desc);
alter table public.maraiti_actions enable row level security;
create policy "consultant reads own" on public.maraiti_actions for select to authenticated
  using ((select private.is_maraiti_user()) and staff_id = (select private.my_staff_id()));
-- writes: drafts by the edge function (service role); decisions only via public.maraiti_decide()
grant select on public.maraiti_actions to authenticated;
grant select, insert, update on public.maraiti_actions to service_role;

/* ---------------- approve / edit / dismiss ---------------- */
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
        (pl->>'patient_id')::uuid, null, null, 'admin', false, nullif(pl->>'level_id', '')::uuid);
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

/** Mark a reminder as done (it leaves the task list). */
create or replace function public.maraiti_reminder_done(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_maraiti_user() then raise exception 'not allowed'; end if;
  update public.maraiti_actions set remind_done = true where id = p_id and staff_id = private.my_staff_id() and kind = 'remind_me';
end $$;
revoke all on function public.maraiti_reminder_done(uuid) from public, anon;
grant execute on function public.maraiti_reminder_done(uuid) to authenticated;

/* ---------------- «مهامكِ الآن» ---------------- */
create or replace function public.maraiti_tasks()
returns table(kind text, ref_id uuid, patient_id uuid, title text, detail text, at timestamptz, urgent boolean, sort_key int)
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := private.my_staff_id();
        d0 timestamptz := ((now() at time zone 'Asia/Damascus')::date)::timestamp at time zone 'Asia/Damascus';
begin
  if not private.is_maraiti_user() then raise exception 'not allowed'; end if;
  return query
  -- today's consultations still ahead
  select 'consult_today'::text, a.id, a.patient_id, coalesce(p.name, a.walk_in_name, 'عميلة'),
         case when ci.submitted_at is not null then 'intake_done' else 'intake_missing' end, a.starts_at, false, 20
    from public.appointments a join public.services s on s.key = a.service_key and s.is_consultation
    left join public.patients p on p.id = a.patient_id
    left join public.consult_intake ci on ci.appointment_id = a.id
   where a.specialist_id = me and a.starts_at >= d0 and a.starts_at < d0 + interval '1 day'
     and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
  union all
  -- written consultations waiting for her reply
  select 'written', w.id, w.patient_id, p.name, null, w.due_at, coalesce(w.due_at < now() + interval '6 hours', false), 10
    from public.written_consults w join public.patients p on p.id = w.patient_id where w.status = 'paid'
  union all
  -- Mira handed the conversation to Fatema
  select 'mira', t.patient_id, t.patient_id, p.name, coalesce(t.reason, t.summary), t.handoff_at, t.urgent, case when t.urgent then 0 else 15 end
    from public.mira_threads t join public.patients p on p.id = t.patient_id where t.status = 'fatema'
  union all
  -- her finished consultations (last 14 days) without a session note
  select 'note_missing', a.id, a.patient_id, coalesce(p.name, a.walk_in_name, 'عميلة'), null, coalesce(a.finished_at, a.starts_at), false, 30
    from public.appointments a join public.services s on s.key = a.service_key and s.is_consultation
    left join public.patients p on p.id = a.patient_id
   where a.specialist_id = me and a.status = 'done' and a.starts_at > now() - interval '14 days' and a.patient_id is not null
     and not exists (select 1 from public.session_notes n where n.appointment_id = a.id)
  union all
  -- intake forms submitted but not reviewed (upcoming / recent consultations)
  select 'intake_review', ci.appointment_id, ci.patient_id, p.name, null, a.starts_at, false, 25
    from public.consult_intake ci join public.appointments a on a.id = ci.appointment_id join public.patients p on p.id = ci.patient_id
   where ci.submitted_at is not null and ci.reviewed_at is null and a.specialist_id = me
     and a.starts_at > now() - interval '2 days' and a.status not in ('cancelled', 'no_show')
  union all
  -- her approved reminders that are due
  select 'reminder', m.id, null::uuid, m.title, m.payload->>'text', m.remind_at, false, 5
    from public.maraiti_actions m
   where m.staff_id = me and m.kind = 'remind_me' and m.status = 'approved' and not m.remind_done and m.remind_at <= now()
  order by 8, 6 nulls last;
end $$;
revoke all on function public.maraiti_tasks() from public, anon;
grant execute on function public.maraiti_tasks() to authenticated;
