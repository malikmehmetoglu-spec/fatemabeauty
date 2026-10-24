-- «استشارة مكتوبة» — async written consultation (no appointment slot) + «يوم فاطمة» helpers.
--   Patient submits concern answers (same fields as consult_intake) + up to 4 face photos (only with a signed
--   photo consent, rule of 0160) → status awaiting_payment, price = service «online-consultation».
--   Admin/owner confirm payment (0175; originally reception too) (creates a paid invoice through public.create_invoice) → paid, due_at = paid_at + 48h.
--   Consultant (staff.is_consultant) / admin reply with text and/or a recorded voice note (private bucket consult-audio)
--   → answered + in-app notification. Patient closes it (or staff) → closed.
-- Access: patient = own rows; consultant/admin = all rows; reception = payment queue only via RPC (no table read);
-- accountant = nothing.

/* ---------------- who is a consultant ---------------- */
create or replace function private.is_consult_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.active
                 and (s.role in ('owner', 'admin') or s.is_consultant));
$$;
revoke all on function private.is_consult_staff() from public, anon;
grant execute on function private.is_consult_staff() to authenticated;

/* ---------------- table ---------------- */
create table if not exists public.written_consults (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  intake jsonb not null default '{}'::jsonb,
  photos text[] not null default '{}',
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment', 'paid', 'answered', 'closed')),
  price int not null default 0,
  invoice_id uuid references public.invoices(id),
  paid_at timestamptz,
  paid_by uuid references public.staff(id),
  due_at timestamptz,
  reply_text text,
  reply_audio_path text,
  answered_by uuid references public.staff(id),
  answered_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(photos) <= 4)
);
create index if not exists written_consults_patient_idx on public.written_consults (patient_id, created_at desc);
create index if not exists written_consults_queue_idx on public.written_consults (status, due_at);
alter table public.written_consults enable row level security;

create policy "own or consultant read" on public.written_consults for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.is_consult_staff()));
-- every write goes through the RPCs below (security definer); no direct insert/update policy.
grant select on public.written_consults to authenticated;
grant select, insert, update on public.written_consults to service_role;

/* ---------------- patient: submit ---------------- */
create or replace function public.written_consult_submit(p_intake jsonb, p_photos text[] default '{}')
returns public.written_consults language plpgsql security definer set search_path = '' as $$
declare pid uuid := private.my_patient_id(); rec public.written_consults; v_kind text; v_price int; p text;
begin
  if pid is null then raise exception 'no patient record'; end if;
  if p_intake is null or jsonb_typeof(p_intake) <> 'object' or coalesce(btrim(p_intake->>'concern'), '') = '' then
    raise exception 'concern_required';
  end if;
  if length(p_intake::text) > 8000 then raise exception 'too_long'; end if;
  p_photos := coalesce(p_photos, '{}');
  if cardinality(p_photos) > 4 then raise exception 'too_many_photos'; end if;
  foreach p in array p_photos loop
    if split_part(p, '/', 1) <> pid::text then raise exception 'bad_photo_path'; end if;
  end loop;
  if cardinality(p_photos) > 0 then
    select c.kind into v_kind from public.consents c
     where c.patient_id = pid and c.kind in ('photo', 'photo_declined') order by c.signed_at desc limit 1;
    if v_kind is distinct from 'photo' then raise exception 'photo_consent_required'; end if;
  end if;
  if (select count(*) from public.written_consults w where w.patient_id = pid and w.status in ('awaiting_payment', 'paid')) >= 2 then
    raise exception 'too_many_open';
  end if;
  v_price := coalesce(public.service_price_syp('online-consultation'), 0);
  insert into public.written_consults (patient_id, intake, photos, price)
  values (pid, p_intake, p_photos, v_price) returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (pid, 'written_consult', 'وصلنا سؤالكِ',
          'ادفعي رسوم الاستشارة في المركز أو عبر الاستقبال، وتصلكِ إجابة أ. فاطمة خلال 48 ساعة من تأكيد الدفع.',
          '/consult/written/?id=' || rec.id);
  return rec;
end $$;
revoke all on function public.written_consult_submit(jsonb, text[]) from public, anon;
grant execute on function public.written_consult_submit(jsonb, text[]) to authenticated;

/* ---------------- reception/admin: payment queue + confirm ---------------- */
create or replace function public.written_consult_payments()
returns table(id uuid, patient_id uuid, patient_name text, file_no int, phone text, status text, price int, created_at timestamptz,
              paid_at timestamptz, due_at timestamptz, invoice_no text)
language sql stable security definer set search_path = '' as $$
  select w.id, w.patient_id, p.name, p.file_no, p.phone, w.status, w.price, w.created_at, w.paid_at, w.due_at, i.no
    from public.written_consults w join public.patients p on p.id = w.patient_id
    left join public.invoices i on i.id = w.invoice_id
   where private.has_role('{admin,reception}')
     and (w.status = 'awaiting_payment' or w.paid_at > now() - interval '7 days')
   order by (w.status = 'awaiting_payment') desc, w.created_at desc
   limit 200;
$$;
revoke all on function public.written_consult_payments() from public, anon;
grant execute on function public.written_consult_payments() to authenticated;

create or replace function public.written_consult_confirm_payment(p_id uuid, p_method public.pay_method default 'cash')
returns public.written_consults language plpgsql security definer set search_path = '' as $$
declare rec public.written_consults; inv public.invoices; me uuid;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_method not in ('cash', 'card') then raise exception 'bad method'; end if;
  select * into rec from public.written_consults where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if rec.status <> 'awaiting_payment' then raise exception 'already_paid'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  inv := public.create_invoice(rec.patient_id, null,
           jsonb_build_array(jsonb_build_object('kind', 'service', 'ref', 'online-consultation', 'qty', 1)), 0,
           jsonb_build_array(jsonb_build_object('method', p_method, 'amount', rec.price)),
           null, 'استشارة مكتوبة', null, null);
  update public.written_consults set status = 'paid', invoice_id = inv.id, paid_at = now(), paid_by = me,
         due_at = now() + interval '48 hours', updated_at = now()
   where id = p_id returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (rec.patient_id, 'written_consult', 'تأكّد الدفع',
          'استشارتكِ المكتوبة الآن عند أ. فاطمة، وتصلكِ الإجابة خلال 48 ساعة.', '/consult/written/?id=' || rec.id);
  return rec;
end $$;
revoke all on function public.written_consult_confirm_payment(uuid, public.pay_method) from public, anon;
grant execute on function public.written_consult_confirm_payment(uuid, public.pay_method) to authenticated;

/* ---------------- consultant: reply ---------------- */
create or replace function public.written_consult_reply(p_id uuid, p_text text, p_audio_path text default null)
returns public.written_consults language plpgsql security definer set search_path = '' as $$
declare rec public.written_consults; me uuid; t text := nullif(btrim(coalesce(p_text, '')), ''); a text := nullif(btrim(coalesce(p_audio_path, '')), '');
begin
  if not private.is_consult_staff() then raise exception 'not allowed'; end if;
  if t is null and a is null then raise exception 'empty_reply'; end if;
  select * into rec from public.written_consults where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if rec.status not in ('paid', 'answered') then raise exception 'not_paid'; end if;
  if a is not null and split_part(a, '/', 1) <> rec.patient_id::text then raise exception 'bad_audio_path'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  update public.written_consults set status = 'answered', reply_text = t, reply_audio_path = coalesce(a, rec.reply_audio_path),
         answered_by = me, answered_at = now(), updated_at = now()
   where id = p_id returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (rec.patient_id, 'written_consult', 'وصلكِ رد أ. فاطمة',
          'ردّت أ. فاطمة على استشارتكِ المكتوبة. افتحي الرسالة لقراءتها أو الاستماع إليها.', '/consult/written/?id=' || rec.id);
  return rec;
end $$;
revoke all on function public.written_consult_reply(uuid, text, text) from public, anon;
grant execute on function public.written_consult_reply(uuid, text, text) to authenticated;

/* ---------------- close (patient own answered one, or consultant) ---------------- */
create or replace function public.written_consult_close(p_id uuid)
returns public.written_consults language plpgsql security definer set search_path = '' as $$
declare rec public.written_consults;
begin
  select * into rec from public.written_consults where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if not (private.is_consult_staff() or (rec.patient_id = private.my_patient_id() and rec.status = 'answered')) then
    raise exception 'not allowed';
  end if;
  update public.written_consults set status = 'closed', closed_at = now(), updated_at = now() where id = p_id returning * into rec;
  return rec;
end $$;
revoke all on function public.written_consult_close(uuid) from public, anon;
grant execute on function public.written_consult_close(uuid) to authenticated;

/* ---------------- private audio bucket ---------------- */
insert into storage.buckets (id, name, public) values ('consult-audio', 'consult-audio', false) on conflict (id) do nothing;
create policy "consult audio consultant insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'consult-audio' and (select private.is_consult_staff()));
create policy "consult audio read" on storage.objects for select to authenticated
  using (bucket_id = 'consult-audio' and ((select private.is_consult_staff())
         or (storage.foldername(name))[1] = ((select private.my_patient_id()))::text));

/* ---------------- «يوم فاطمة»: approve a structured note and tell the client ---------------- */
create or replace function public.fatema_day_send_note(p_appointment uuid, p_fields jsonb, p_body text, p_client_text text)
returns public.session_notes language plpgsql security definer set search_path = '' as $$
declare appt public.appointments; me uuid; rec public.session_notes;
begin
  if not private.is_consult_staff() then raise exception 'not allowed'; end if;
  select * into appt from public.appointments where id = p_appointment;
  if appt.id is null or appt.patient_id is null then raise exception 'not found'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  insert into public.session_notes (appointment_id, patient_id, author_id, body, fields)
  values (appt.id, appt.patient_id, me, coalesce(p_body, ''), coalesce(p_fields, '{}'::jsonb)) returning * into rec;
  if nullif(btrim(coalesce(p_client_text, '')), '') is not null then
    insert into public.notifications (patient_id, kind, title, body, link)
    values (appt.patient_id, 'session_note', 'خطتكِ من أ. فاطمة', left(btrim(p_client_text), 600), '/appointments/detail/?id=' || appt.id);
  end if;
  return rec;
end $$;
revoke all on function public.fatema_day_send_note(uuid, jsonb, text, text) from public, anon;
grant execute on function public.fatema_day_send_note(uuid, jsonb, text, text) to authenticated;
