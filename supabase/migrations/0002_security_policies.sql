-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «security_policies».

-- ---------- helpers ----------
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.active);
$$;

create or replace function public.has_role(roles public.staff_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff s where s.user_id = auth.uid() and s.active and s.role = any(roles));
$$;

create or replace function public.my_patient_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.patients p where p.user_id = auth.uid();
$$;

revoke execute on function public.is_staff(), public.has_role(public.staff_role[]), public.my_patient_id() from anon;

-- ---------- enable RLS everywhere ----------
alter table public.staff enable row level security;
alter table public.patients enable row level security;
alter table public.patient_conditions enable row level security;
alter table public.rooms enable row level security;
alter table public.devices enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.patient_packages enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.expenses enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.session_notes enable row level security;
alter table public.prescriptions enable row level security;
alter table public.consents enable row level security;
alter table public.reviews enable row level security;
alter table public.app_installs enable row level security;
alter table public.settings enable row level security;
alter table public.audit_log enable row level security;

-- ---------- public catalogue ----------
create policy "catalogue readable" on public.rooms for select to anon, authenticated using (true);
create policy "catalogue readable" on public.services for select to anon, authenticated using (active or (select public.is_staff()));
create policy "catalogue readable" on public.packages for select to anon, authenticated using (active or (select public.is_staff()));
create policy "catalogue readable" on public.products for select to anon, authenticated using (visible or (select public.is_staff()));
create policy "team readable" on public.staff for select to anon, authenticated using (active or (select public.is_staff()));
create policy "settings readable" on public.settings for select to anon, authenticated using (true);
create policy "devices staff" on public.devices for select to authenticated using ((select public.is_staff()));

create policy "admin manages" on public.rooms for all to authenticated using ((select public.has_role('{admin}'))) with check ((select public.has_role('{admin}')));
create policy "admin manages" on public.services for all to authenticated using ((select public.has_role('{admin}'))) with check ((select public.has_role('{admin}')));
create policy "admin manages" on public.packages for all to authenticated using ((select public.has_role('{admin}'))) with check ((select public.has_role('{admin}')));
create policy "admin manages" on public.staff for all to authenticated using ((select public.has_role('{admin}'))) with check ((select public.has_role('{admin}')));
create policy "admin manages" on public.settings for all to authenticated using ((select public.has_role('{admin}'))) with check ((select public.has_role('{admin}')));
create policy "staff manages" on public.devices for all to authenticated using ((select public.has_role('{admin,specialist}'))) with check ((select public.has_role('{admin,specialist}')));
create policy "staff manages" on public.products for all to authenticated using ((select public.has_role('{admin,reception}'))) with check ((select public.has_role('{admin,reception}')));

-- ---------- patients ----------
create policy "own or staff" on public.patients for select to authenticated using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "own update" on public.patients for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "staff writes" on public.patients for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "own or staff" on public.patient_conditions for all to authenticated
  using (patient_id = (select public.my_patient_id()) or (select public.is_staff()))
  with check (patient_id = (select public.my_patient_id()) or (select public.is_staff()));

create policy "own or staff read" on public.patient_packages for select to authenticated using (patient_id = (select public.my_patient_id()) or (select public.is_staff()));
create policy "staff writes" on public.patient_packages for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- appointments ----------
create policy "own or staff read" on public.appointments for select to authenticated using (patient_id = (select public.my_patient_id()) or (select public.is_staff()));
create policy "patient books" on public.appointments for insert to authenticated
  with check (patient_id = (select public.my_patient_id()) and source = 'app' and status in ('pending', 'confirmed') and queue_no is null);
create policy "staff writes" on public.appointments for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- money ----------
create policy "own or staff read" on public.invoices for select to authenticated using (patient_id = (select public.my_patient_id()) or (select public.is_staff()));
create policy "cashier writes" on public.invoices for all to authenticated using ((select public.has_role('{admin,reception,accountant}'))) with check ((select public.has_role('{admin,reception,accountant}')));
create policy "follows invoice" on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id and (i.patient_id = (select public.my_patient_id()) or (select public.is_staff()))));
create policy "cashier writes" on public.invoice_items for all to authenticated using ((select public.has_role('{admin,reception,accountant}'))) with check ((select public.has_role('{admin,reception,accountant}')));
create policy "accounts" on public.expenses for all to authenticated using ((select public.has_role('{admin,accountant}'))) with check ((select public.has_role('{admin,accountant}')));

-- ---------- store ----------
create policy "own or staff read" on public.orders for select to authenticated using (patient_id = (select public.my_patient_id()) or (select public.is_staff()));
create policy "staff writes" on public.orders for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "follows order" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.patient_id = (select public.my_patient_id()) or (select public.is_staff()))));
create policy "staff writes" on public.order_items for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- ---------- clinical ----------
create policy "clinical staff" on public.session_notes for all to authenticated using ((select public.has_role('{admin,specialist}'))) with check ((select public.has_role('{admin,specialist}')));
create policy "own read" on public.prescriptions for select to authenticated using (patient_id = (select public.my_patient_id()));
create policy "clinical staff" on public.prescriptions for all to authenticated using ((select public.has_role('{admin,specialist}'))) with check ((select public.has_role('{admin,specialist}')));
create policy "own read" on public.consents for select to authenticated using (patient_id = (select public.my_patient_id()));
create policy "own signs" on public.consents for insert to authenticated with check (patient_id = (select public.my_patient_id()));
create policy "staff manages" on public.consents for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "own read" on public.reviews for select to authenticated using (patient_id = (select public.my_patient_id()) or (select public.is_staff()));
create policy "own writes" on public.reviews for insert to authenticated with check (patient_id = (select public.my_patient_id()));

-- ---------- installs & audit (staff read; writes through functions) ----------
create policy "staff read" on public.app_installs for select to authenticated using ((select public.is_staff()));
create policy "admin read" on public.audit_log for select to authenticated using ((select public.has_role('{admin}')));
