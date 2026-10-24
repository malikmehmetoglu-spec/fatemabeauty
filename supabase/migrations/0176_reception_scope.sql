-- «خدمة العملاء» (role = reception): الحجز + إضافة المراجِعات وبيانات التواصل فقط.
-- لا فواتير ولا دفعات ولا متجر ولا مخزون ولا بيانات طبية ولا إشعارات.
-- السلوك لبقية الأدوار (owner/admin/specialist/accountant) دون تغيير.

-- 1) كل الطاقم ما عدا خدمة العملاء
create or replace function private.is_staff_full()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.staff s
                 where s.user_id = auth.uid() and s.active and s.role <> 'reception');
$$;
grant execute on function private.is_staff_full() to authenticated;

create or replace function private.is_reception()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.staff s
                 where s.user_id = auth.uid() and s.active and s.role = 'reception');
$$;
grant execute on function private.is_reception() to authenticated;

-- 2) سياسات is_staff خارج نطاق الحجز ← is_staff_full
do $$
declare r record; q text; c text; stmt text;
begin
  for r in
    select * from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'app_installs','consents','consult_intake','devices','exchange_rates',
        'gift_requests','notifications','order_items','orders','patient_conditions',
        'patient_packages','patient_photos','products','reviews','session_extensions',
        'sms_log','stock_batch_takes','stock_batches','stock_locations','stock_movements',
        'surveys','waitlist'])
      and (coalesce(qual,'') || coalesce(with_check,'')) like '%private.is_staff()%'
  loop
    q := replace(r.qual, 'private.is_staff()', 'private.is_staff_full()');
    c := replace(r.with_check, 'private.is_staff()', 'private.is_staff_full()');
    stmt := format('alter policy %I on public.%I', r.policyname, r.tablename);
    if q is not null then stmt := stmt || format(' using (%s)', q); end if;
    if c is not null then stmt := stmt || format(' with check (%s)', c); end if;
    execute stmt;
  end loop;
end $$;

-- 3) إزالة reception من سياسات المالية والمتجر
alter policy "cashier reads" on public.cash_shifts
  using ((select private.has_role('{admin,accountant}'::staff_role[])));
alter policy "own or staff read" on public.invoices
  using ((patient_id = (select private.my_patient_id())) or (select private.has_role('{admin,accountant}'::staff_role[])));
alter policy "follows invoice" on public.invoice_items
  using (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id
    and ((i.patient_id = (select private.my_patient_id())) or (select private.has_role('{admin,accountant}'::staff_role[])))));
alter policy "own or staff read" on public.invoice_payments
  using (exists (select 1 from public.invoices i where i.id = invoice_payments.invoice_id
    and ((i.patient_id = (select private.my_patient_id())) or (select private.has_role('{admin,accountant}'::staff_role[])))));
alter policy "staff writes" on public.orders
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));

-- 4) دوال SECURITY DEFINER: إزالة reception من المالية/المتجر، و is_staff ← is_staff_full خارج الحجز
do $$
declare f text; def text;
begin
  foreach f in array array[
    'public.cash_shift_expected(uuid)',
    'public.charge_session_extension(uuid, pay_method)',
    'public.check_offer_code(text, integer, jsonb)',
    'public.close_cash_shift(integer, text)',
    'public.open_cash_shift(integer)',
    'public.pay_invoice(uuid, integer, pay_method)',
    'public.create_invoice(uuid, uuid, jsonb, integer, jsonb, uuid, text, date, text)',
    'public.create_invoice_with_code(uuid, uuid, jsonb, jsonb, text, uuid, text, date, text)',
    'public.cancel_order(uuid)',
    'public.request_session_extension(uuid, integer)',
    'public.decline_session_extension(uuid)',
    'public.consult_intake_review(uuid, boolean)']
  loop
    def := pg_get_functiondef(f::regprocedure);
    def := replace(def, '''{admin,reception,accountant}''', '''{admin,accountant}''');
    def := replace(def, '''{admin,reception}''', '''{admin}''');
    def := replace(def, 'private.is_staff()', 'private.is_staff_full()');
    execute def;
  end loop;
end $$;

-- 5) خدمة العملاء تعدّل بيانات التواصل فقط في ملف المراجِعة
create or replace function private.guard_reception_patient_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if private.is_reception() and (
       new.birth_date    is distinct from old.birth_date
    or new.skin_type     is distinct from old.skin_type
    or new.pregnant      is distinct from old.pregnant
    or new.breastfeeding is distinct from old.breastfeeding
    or new.notes         is distinct from old.notes
    or new.points        is distinct from old.points
    or new.vip           is distinct from old.vip
    or new.user_id       is distinct from old.user_id
    or new.file_no       is distinct from old.file_no) then
    raise exception 'خدمة العملاء تعدّل بيانات التواصل فقط';
  end if;
  return new;
end $$;

create or replace trigger guard_reception_patient_update
  before update on public.patients
  for each row execute function private.guard_reception_patient_update();
