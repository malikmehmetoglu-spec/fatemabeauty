-- 0189 — Room tablet / queue / reception-tablet users must see whether a visit is paid (pay gate), so they can read invoices.
alter policy "own or staff read" on public.invoices using (
  (patient_id = (select private.my_patient_id()))
  or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}'::public.staff_role[])))
  or (select private.has_perm('room_tablet')) or (select private.has_perm('queue')) or (select private.has_perm('kiosk_desk'))
);
