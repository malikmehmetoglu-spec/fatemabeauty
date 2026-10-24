-- Intake reminder: kind 'appt' (shown under «المواعيد» with the calendar icon), no hard-coded name, links to the form.
create or replace function private.consult_intake_reminder()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.patient_id is not null and new.starts_at > now()
     and exists (select 1 from public.services v where v.key = new.service_key and v.is_consultation)
     and not exists (select 1 from public.consult_intake i where i.appointment_id = new.id) then
    insert into public.notifications (patient_id, kind, title, body, link)
    values (new.patient_id, 'appt', 'جهّزي استشارتكِ',
            'دقائق قليلة قبل موعدكِ تساعد المستشارة على التحضير لكِ: أخبرينا عن بشرتكِ وما جرّبتِه.',
            '/appointments/intake/?id=' || new.id);
  end if;
  return new;
end $$;
revoke all on function private.consult_intake_reminder() from public, anon, authenticated;
