-- 0110 — Delete a patient file (only when she has no history) or archive / restore it.
-- Non-destructive: adds patients.archived_at, create-or-replace functions only.
-- History = any row in appointments, invoices, orders, session_notes, prescriptions, patient_photos, consents,
-- patient_packages, reviews, surveys, gift_requests, messages, waitlist. Health conditions, app_installs and
-- notifications are not history: conditions/notifications go with the file, app_installs are unlinked.
-- The linked auth user (if any) is never deleted; deleting the row only removes the link.

alter table public.patients add column if not exists archived_at timestamptz;

create or replace function public.delete_patient(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare p public.patients; has_history boolean;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  select * into p from public.patients where id = p_id for update;
  if p.id is null then raise exception 'لم يُعثر على هذا الملف'; end if;
  has_history :=
       exists (select 1 from public.appointments where patient_id = p_id)
    or exists (select 1 from public.invoices where patient_id = p_id)
    or exists (select 1 from public.orders where patient_id = p_id)
    or exists (select 1 from public.session_notes where patient_id = p_id)
    or exists (select 1 from public.prescriptions where patient_id = p_id)
    or exists (select 1 from public.patient_photos where patient_id = p_id)
    or exists (select 1 from public.consents where patient_id = p_id)
    or exists (select 1 from public.patient_packages where patient_id = p_id)
    or exists (select 1 from public.reviews where patient_id = p_id)
    or exists (select 1 from public.surveys where patient_id = p_id)
    or exists (select 1 from public.gift_requests where patient_id = p_id)
    or exists (select 1 from public.messages where patient_id = p_id)
    or exists (select 1 from public.waitlist where patient_id = p_id);
  if has_history then
    return jsonb_build_object('deleted', false, 'reason', 'لهذه المراجِعة سجلّ في المركز، لذلك لا يمكن حذفها');
  end if;
  update public.app_installs set patient_id = null where patient_id = p_id;
  delete from public.notifications where patient_id = p_id;
  delete from public.patient_conditions where patient_id = p_id;
  delete from public.patients where id = p_id;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), 'patient.delete', p.file_no::text, jsonb_build_object('name', p.name, 'phone', p.phone, 'had_login', p.user_id is not null));
  return jsonb_build_object('deleted', true);
end $$;
revoke all on function public.delete_patient(uuid) from public, anon;
grant execute on function public.delete_patient(uuid) to authenticated;

create or replace function public.set_patient_archived(p_id uuid, p_archived boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare p public.patients;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  update public.patients set archived_at = case when p_archived then coalesce(archived_at, now()) else null end
  where id = p_id returning * into p;
  if p.id is null then raise exception 'لم يُعثر على هذا الملف'; end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), case when p_archived then 'patient.archive' else 'patient.restore' end, p.file_no::text, jsonb_build_object('name', p.name));
end $$;
revoke all on function public.set_patient_archived(uuid, boolean) from public, anon;
grant execute on function public.set_patient_archived(uuid, boolean) to authenticated;
