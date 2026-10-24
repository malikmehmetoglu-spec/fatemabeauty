-- منع الحذف النهائي للمواعيد والمراجِعات إلا للإدارة والمدير العام
-- (الاستقبال والأخصائيات يحتفظن بالإنشاء والتعديل والإلغاء)

drop policy if exists "staff writes" on public.appointments;
create policy "staff inserts" on public.appointments for insert to authenticated
  with check ((select private.is_staff()));
create policy "staff updates" on public.appointments for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "admin deletes" on public.appointments for delete to authenticated
  using ((select private.has_role('{admin}'::staff_role[])));

drop policy if exists "staff writes" on public.patients;
create policy "staff inserts" on public.patients for insert to authenticated
  with check ((select private.is_staff()));
create policy "staff updates" on public.patients for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "admin deletes" on public.patients for delete to authenticated
  using ((select private.has_role('{admin}'::staff_role[])));
