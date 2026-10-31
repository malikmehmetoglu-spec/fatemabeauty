-- صلاحيات يدوية لكل موظفة (staff.permissions). null = افتراضيات الدور (السلوك السابق دون تغيير).
-- الكتالوج (يطابق src/lib/permissions.ts):
--   dashboard, calendar, queue, patients, patients_medical, cashier, finance, inventory, devices, store,
--   staff, marketing, reports, settings, mira, kiosk_desk, written_consults_payments, package_requests
-- البوابات في القاعدة تستخدم coalesce(private.perm_override(..), <الفحص القديم>):
--   عند عدم التخصيص يبقى الفحص القديم حرفياً؛ عند التخصيص تحكم القائمة.

alter table public.staff add column if not exists permissions text[];

-- قيمة التخصيص: true/false إن كانت للموظفة قائمة مخصّصة (المدير العام دائماً true)، و null إن لم تكن.
create or replace function private.perm_override_any(p text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select case when s.role = 'owner' then true
              when s.permissions is null then null
              else s.permissions && p end
  from public.staff s where s.user_id = auth.uid() and s.active
  limit 1;
$$;
create or replace function private.perm_override(p text)
returns boolean language sql stable security definer set search_path = ''
as $$ select private.perm_override_any(array[p]); $$;

create or replace function private.role_default_perms(r public.staff_role)
returns text[] language sql immutable set search_path = ''
as $$
  select case r::text
    when 'owner' then array['dashboard','calendar','queue','patients','patients_medical','cashier','finance','inventory','devices','store','staff','marketing','reports','settings','mira','kiosk_desk','written_consults_payments','package_requests']
    when 'admin' then array['dashboard','calendar','queue','patients','patients_medical','cashier','finance','inventory','devices','store','staff','marketing','reports','settings','mira','kiosk_desk','written_consults_payments','package_requests']
    when 'specialist' then array['calendar','queue','patients','patients_medical','devices','kiosk_desk']
    when 'reception' then array['calendar','patients']
    when 'accountant' then array['dashboard','cashier','finance','staff','reports','kiosk_desk']
    else array[]::text[] end;
$$;

create or replace function private.has_perm(p text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select coalesce((select case when s.role = 'owner' then true
                               else p = any(coalesce(s.permissions, private.role_default_perms(s.role))) end
                   from public.staff s where s.user_id = auth.uid() and s.active limit 1), false);
$$;

grant execute on function private.perm_override_any(text[]) to authenticated;
grant execute on function private.perm_override(text) to authenticated;
grant execute on function private.role_default_perms(public.staff_role) to authenticated;
grant execute on function private.has_perm(text) to authenticated;

-- المال: الكاشير/الفواتير/الدفعات/الصندوق
alter policy "cashier reads" on public.cash_shifts
  using (coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}'::staff_role[]))));
alter policy "own or staff read" on public.invoices
  using ((patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}'::staff_role[]))));
alter policy "follows invoice" on public.invoice_items
  using (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id
    and ((i.patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}'::staff_role[]))))));
alter policy "own or staff read" on public.invoice_payments
  using (exists (select 1 from public.invoices i where i.id = invoice_payments.invoice_id
    and ((i.patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}'::staff_role[]))))));

do $$
declare f text; def text;
begin
  foreach f in array array[
    'public.cash_shift_expected(uuid)',
    'public.close_cash_shift(integer, text)',
    'public.open_cash_shift(integer)',
    'public.pay_invoice(uuid, integer, pay_method)',
    'public.create_invoice(uuid, uuid, jsonb, integer, jsonb, uuid, text, date, text)',
    'public.create_invoice_with_code(uuid, uuid, jsonb, jsonb, text, uuid, text, date, text)']
  loop
    def := pg_get_functiondef(f::regprocedure);
    def := replace(def, 'if not private.has_role(''{admin,accountant}'')',
                        'if not coalesce(private.perm_override(''cashier''), private.has_role(''{admin,accountant}''))');
    execute def;
  end loop;
  foreach f in array array['public.approve_booking(uuid)', 'public.reject_booking(uuid, text)']
  loop
    def := pg_get_functiondef(f::regprocedure);
    def := replace(def, 'if not private.has_role(''{admin,reception}'')',
                        'if not coalesce(private.perm_override(''calendar''), private.has_role(''{admin,reception}''))');
    execute def;
  end loop;
  def := pg_get_functiondef('public.book_appointment_v2(text, timestamp with time zone, uuid, uuid, uuid, text, text, text, boolean, uuid)'::regprocedure);
  def := replace(def, 'is_staff boolean := private.is_staff();',
                      'is_staff boolean := private.is_staff() and coalesce(private.perm_override_any(array[''calendar'',''queue'',''kiosk_desk'']), true);');
  execute def;
end $$;

-- المواعيد
alter policy "own or staff read" on public.appointments
  using ((patient_id = (select private.my_patient_id())) or ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','cashier','dashboard','kiosk_desk','reports','patients'])), true)));
alter policy "staff inserts" on public.appointments
  with check ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','kiosk_desk'])), true));
alter policy "staff updates" on public.appointments
  using ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','kiosk_desk','cashier'])), true))
  with check ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','kiosk_desk','cashier'])), true));

-- المراجِعات (القراءة الأساسية لازمة للحجز والكاشير)
alter policy "own or staff" on public.patients
  using ((user_id = (select auth.uid())) or ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','queue','patients','patients_medical','cashier','kiosk_desk','marketing','dashboard','reports','finance','store'])), true)));
alter policy "staff inserts" on public.patients
  with check ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','patients','cashier','kiosk_desk'])), true));
alter policy "staff updates" on public.patients
  using ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','patients','patients_medical','kiosk_desk'])), true))
  with check ((select private.is_staff()) and coalesce((select private.perm_override_any(array['calendar','patients','patients_medical','kiosk_desk'])), true));

-- البيانات الطبية
alter policy "own or staff" on public.patient_conditions
  using ((patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override('patients_medical')), (select private.is_staff_full())))
  with check ((patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override('patients_medical')), (select private.is_staff_full())));
alter policy "staff manages photos" on public.patient_photos
  using (coalesce((select private.perm_override('patients_medical')), (select private.is_staff_full())))
  with check (coalesce((select private.perm_override('patients_medical')), (select private.is_staff_full())));
alter policy "clinical staff" on public.session_notes
  using (coalesce((select private.perm_override('patients_medical')), (select private.has_role('{admin,specialist}'::staff_role[]))))
  with check (coalesce((select private.perm_override('patients_medical')), (select private.has_role('{admin,specialist}'::staff_role[]))));

create or replace function private.guard_reception_patient_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if not coalesce(private.perm_override('patients_medical'), not private.is_reception()) and (
       new.birth_date    is distinct from old.birth_date
    or new.skin_type     is distinct from old.skin_type
    or new.pregnant      is distinct from old.pregnant
    or new.breastfeeding is distinct from old.breastfeeding
    or new.notes         is distinct from old.notes
    or new.points        is distinct from old.points
    or new.vip           is distinct from old.vip
    or new.user_id       is distinct from old.user_id
    or new.file_no       is distinct from old.file_no) then
    raise exception 'صلاحياتكِ تسمح بتعديل بيانات التواصل فقط';
  end if;
  return new;
end $$;

-- المتجر والمخزون
alter policy "catalogue readable" on public.products
  using (coalesce((select private.perm_override_any(array['store','inventory','cashier'])), (select private.is_staff_full())));
alter policy "inventory staff" on public.stock_batches
  using (coalesce((select private.perm_override_any(array['inventory','store'])), (select private.is_staff_full())));
alter policy "own or staff read" on public.orders
  using ((patient_id = (select private.my_patient_id())) or coalesce((select private.perm_override('store')), (select private.is_staff_full())));

-- تعديل الصلاحيات: المدير العام والإدارة فقط (والإدارة لا تعدّل المدير العام)
create or replace function public.set_staff_permissions(p_staff uuid, p_perms text[])
returns void language plpgsql security definer set search_path = ''
as $$
declare tgt public.staff; old_p text[];
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  select * into tgt from public.staff where id = p_staff;
  if not found then raise exception 'staff not found'; end if;
  if tgt.role = 'owner' then raise exception 'المدير العام يملك كل الصلاحيات'; end if;
  if tgt.role = 'admin' and not private.has_role('{}') then raise exception 'not allowed'; end if;
  if p_perms is not null and exists (select 1 from unnest(p_perms) x where x <> all (array['dashboard','calendar','queue','patients','patients_medical','cashier','finance','inventory','devices','store','staff','marketing','reports','settings','mira','kiosk_desk','written_consults_payments','package_requests'])) then
    raise exception 'unknown permission';
  end if;
  old_p := tgt.permissions;
  update public.staff set permissions = (select array_agg(distinct x order by x) from unnest(p_perms) x) where id = p_staff;
  if p_perms is not null and cardinality(p_perms) = 0 then update public.staff set permissions = '{}' where id = p_staff; end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), 'staff.permissions', 'staff:' || p_staff::text, jsonb_build_object('before', old_p, 'after', p_perms));
end $$;
revoke all on function public.set_staff_permissions(uuid, text[]) from public, anon;
grant execute on function public.set_staff_permissions(uuid, text[]) to authenticated;
