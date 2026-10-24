-- محادثات المراجِعات وميرا: للإدارة والمدير العام فقط
-- (المراجِعة تبقى ترى محادثتها وترسل فيها كما كانت)

-- رسائل المراجِعات
drop policy if exists "own or staff read" on public.messages;
drop policy if exists "staff marks read" on public.messages;
drop policy if exists "staff writes" on public.messages;
create policy "own or admin read" on public.messages for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.has_role('{admin}'::staff_role[])));
create policy "admin marks read" on public.messages for update to authenticated
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));
create policy "admin writes" on public.messages for insert to authenticated
  with check ((select private.has_role('{admin}'::staff_role[])) and not from_patient);

-- محادثات ميرا
drop policy if exists "own or staff read" on public.mira_threads;
drop policy if exists "staff updates" on public.mira_threads;
create policy "own or admin read" on public.mira_threads for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.has_role('{admin}'::staff_role[])));
create policy "admin updates" on public.mira_threads for update to authenticated
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));

-- مسودات ميرا
drop policy if exists "staff read" on public.mira_drafts;
drop policy if exists "staff decides" on public.mira_drafts;
create policy "admin read" on public.mira_drafts for select to authenticated
  using ((select private.has_role('{admin}'::staff_role[])));
create policy "admin decides" on public.mira_drafts for update to authenticated
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));

-- إجابات فاطمة (قاعدة معرفة ميرا)
drop policy if exists "staff read" on public.mira_kb;
