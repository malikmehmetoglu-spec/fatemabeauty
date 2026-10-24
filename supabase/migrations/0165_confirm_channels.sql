-- Booking confirmation / apology on three channels: WhatsApp (wa.me), SMS (Edge Function staff-sms), and the app
-- (notification + staff message in her chat). appointments.confirm_channels = {"confirm": {"whatsapp": ts, "sms": ts, "app": ts},
-- "apology": {...}} drives the «أُرسل» badges.
alter table public.appointments add column if not exists confirm_channels jsonb not null default '{}'::jsonb;

-- SMS sent by staff (written by the Edge Function with the service role).
create table if not exists public.sms_log (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  phone text not null,
  kind text not null default 'confirm' check (kind in ('confirm', 'apology', 'other')),
  body text not null,
  status text not null check (status in ('sent', 'failed', 'dry_run')),
  error text,
  sent_by uuid references public.staff(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists sms_log_appt_idx on public.sms_log (appointment_id, created_at desc);
create index if not exists sms_log_patient_idx on public.sms_log (patient_id);
create index if not exists sms_log_sent_by_idx on public.sms_log (sent_by);
alter table public.sms_log enable row level security;
create policy "staff read" on public.sms_log for select to authenticated using ((select private.is_staff()));
grant select on public.sms_log to authenticated;
grant select, insert, update, delete on public.sms_log to service_role;

-- Stamp one channel. Staff may stamp only WhatsApp themselves (it opens on their phone); SMS / app are stamped by
-- the function that actually sent them.
create or replace function public.mark_confirm_channel(p_id uuid, p_channel text, p_kind text default 'confirm')
 returns void language plpgsql security definer set search_path to '' as $$
declare svc boolean := coalesce(auth.role(), '') = 'service_role';
begin
  if p_channel not in ('whatsapp', 'sms', 'app') or p_kind not in ('confirm', 'apology') then raise exception 'bad channel'; end if;
  if not svc then
    if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
    if p_channel <> 'whatsapp' then raise exception 'not allowed'; end if;
  end if;
  update public.appointments
     set confirm_channels = jsonb_set(coalesce(confirm_channels, '{}'::jsonb), array[p_kind],
                                      coalesce(confirm_channels -> p_kind, '{}'::jsonb) || jsonb_build_object(p_channel, now()), true),
         confirm_sent_at = case when p_kind = 'confirm' and p_channel = 'whatsapp' then now() else confirm_sent_at end
   where id = p_id;
end $$;
revoke all on function public.mark_confirm_channel(uuid, text, text) from public, anon;
grant execute on function public.mark_confirm_channel(uuid, text, text) to authenticated, service_role;

-- WhatsApp stamp (kept for existing callers) now also records the channel.
create or replace function public.mark_confirm_sent(p_id uuid)
 returns void language plpgsql security definer set search_path to '' as $$
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  perform public.mark_confirm_channel(p_id, 'whatsapp', 'confirm');
end $$;

-- «إرسال عبر التطبيق»: a notification + a staff message in her chat with the centre.
-- p_body = the full message (the WhatsApp template text); null → a short text built here.
-- Returns {has_app: bool} so staff can be told she has not installed the app yet.
create or replace function public.send_app_confirmation(p_appt uuid, p_kind text, p_body text default null)
 returns jsonb language plpgsql security definer set search_path to '' as $$
declare a public.appointments; pt public.patients; svc text; me uuid; local timestamp; short text; msg text;
        days text[] := array['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_kind not in ('confirm', 'apology') then raise exception 'bad kind'; end if;
  select * into a from public.appointments where id = p_appt;
  if not found then raise exception 'not found'; end if;
  if a.patient_id is null then raise exception 'no patient'; end if;
  if p_kind = 'confirm' and a.status not in ('confirmed', 'checked_in') then raise exception 'not confirmed'; end if;
  if p_kind = 'apology' and a.status <> 'cancelled' then raise exception 'not cancelled'; end if;
  select * into pt from public.patients where id = a.patient_id;
  select name into svc from public.services where key = a.service_key;
  me := private.my_staff_id();
  local := a.starts_at at time zone 'Asia/Damascus';
  short := coalesce(svc, 'الجلسة') || ' · ' || days[extract(dow from local)::int + 1] || ' ' || to_char(local, 'FMDD/FMMM') || ' · ' || to_char(local, 'HH24:MI');
  msg := nullif(btrim(coalesce(p_body, '')), '');
  if msg is not null and char_length(msg) > 2000 then raise exception 'too long'; end if;
  if msg is null then
    msg := case when p_kind = 'confirm' then 'تم تأكيد موعدكِ في مركز Fatema Beauty: ' || short || '. نرجو الحضور قبل الموعد بـ 10 دقائق.'
                else 'نعتذر، لم نتمكّن من تثبيت طلب حجزكِ: ' || short || '. يسعدنا اقتراح موعد آخر يناسبكِ — ردّي هنا بالوقت الأنسب لكِ.' end;
  end if;

  insert into public.notifications (patient_id, kind, title, body, link)
  values (a.patient_id, 'appointment',
          case when p_kind = 'confirm' then 'تم تأكيد موعدكِ' else 'تعذّر تثبيت موعدكِ' end,
          case when p_kind = 'confirm' then short else short || ' — نقترح عليكِ موعداً آخر' end,
          '/appointments/detail/?id=' || a.id);
  insert into public.messages (patient_id, from_patient, staff_id, body, author)
  values (a.patient_id, false, me, msg, 'staff');

  update public.appointments
     set confirm_channels = jsonb_set(coalesce(confirm_channels, '{}'::jsonb), array[p_kind],
                                      coalesce(confirm_channels -> p_kind, '{}'::jsonb) || jsonb_build_object('app', now()), true)
   where id = a.id;
  return jsonb_build_object('has_app', pt.user_id is not null);
end $$;
revoke all on function public.send_app_confirmation(uuid, text, text) from public, anon;
grant execute on function public.send_app_confirmation(uuid, text, text) to authenticated;
