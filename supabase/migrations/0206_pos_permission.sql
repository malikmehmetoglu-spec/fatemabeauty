-- 2026-11-20: «نقطة البيع» (pos) permission — sell in-stock retail products only (no services, packages,
-- appointments, discounts or deferred payment). Holder sees only the invoices she issued.

-- 1) permission catalogue
create or replace function private.role_default_perms(r staff_role)
 returns text[] language sql immutable set search_path to ''
as $function$
  select case r::text
    when 'owner' then array['dashboard','calendar','queue','patients','patients_medical','cashier','pos','finance','inventory','devices','store','staff','marketing','reports','settings','mira','kiosk_desk','written_consults_payments','package_requests','room_tablet']
    when 'admin' then array['dashboard','calendar','queue','patients','patients_medical','cashier','pos','finance','inventory','devices','store','staff','marketing','reports','settings','mira','kiosk_desk','written_consults_payments','package_requests','room_tablet']
    when 'specialist' then array['calendar','queue','patients','patients_medical','devices','kiosk_desk']
    when 'reception' then array['calendar','patients']
    when 'accountant' then array['dashboard','cashier','finance','staff','reports','kiosk_desk']
    else array[]::text[] end;
$function$;

do $$ declare d text; begin
  d := pg_get_functiondef('public.set_staff_permissions'::regproc);
  d := replace(d, 'array[''dashboard'',''calendar'',''queue'',''patients'',''patients_medical'',''cashier'',', 'array[''dashboard'',''calendar'',''queue'',''patients'',''patients_medical'',''cashier'',''pos'',');
  execute d;
end $$;

-- 2) server-side guard for a pos-only seller
create or replace function private.pos_guard(p_appointment uuid, p_items jsonb, p_discount integer, p_payments jsonb, p_patient_package uuid)
 returns void language plpgsql stable security definer set search_path to ''
as $function$
declare it jsonb; pay jsonb; need bigint := 0; got bigint := 0; pr int;
begin
  if p_appointment is not null or p_patient_package is not null then raise exception 'نقطة البيع لبيع المنتجات فقط'; end if;
  if coalesce(p_discount, 0) <> 0 then raise exception 'نقطة البيع بدون خصم'; end if;
  for it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    if it->>'kind' is distinct from 'product' then raise exception 'نقطة البيع لبيع المنتجات فقط'; end if;
    select price into pr from public.products where key = it->>'ref';
    need := need + coalesce(pr, 0)::bigint * coalesce((it->>'qty')::numeric, 1)::bigint;
  end loop;
  for pay in select * from jsonb_array_elements(coalesce(p_payments, '[]'::jsonb)) loop
    if pay->>'method' not in ('cash', 'card') then raise exception 'نقطة البيع: الدفع نقداً أو بالبطاقة فقط'; end if;
    got := got + coalesce((pay->>'amount')::numeric, 0)::bigint;
  end loop;
  if got <> need then raise exception 'نقطة البيع: يجب دفع كامل المبلغ'; end if;
end $function$;

do $$ declare d text; old text := 'if not coalesce(private.perm_override(''cashier''), private.has_role(''{admin,accountant}'')) then raise exception ''not allowed''; end if;';
begin
  d := pg_get_functiondef('public.create_invoice(uuid,uuid,jsonb,integer,jsonb,uuid,text,date,text)'::regprocedure);
  if position(old in d) = 0 then raise exception 'create_invoice gate not found'; end if;
  d := replace(d, old, 'if not coalesce(private.perm_override(''cashier''), private.has_role(''{admin,accountant}'')) then
    if not private.has_perm(''pos'') then raise exception ''not allowed''; end if;
    perform private.pos_guard(p_appointment, p_items, p_discount, p_payments, p_patient_package);
  end if;');
  execute d;
end $$;

-- 3) reads needed by the pos page
drop policy if exists "catalogue readable" on public.products;
create policy "catalogue readable" on public.products for select to anon, authenticated
  using (coalesce((select private.perm_override_any(array['store','inventory','cashier','pos'])), (select private.is_staff_full())));

drop policy if exists "inventory staff" on public.stock_batches;
create policy "inventory staff" on public.stock_batches for select to authenticated
  using (coalesce((select private.perm_override_any(array['inventory','store','pos'])), (select private.is_staff_full())));

drop policy if exists "staff read locations" on public.stock_locations;
create policy "staff read locations" on public.stock_locations for select to authenticated
  using ((select private.is_staff_full()) or (select private.has_perm('pos')));

drop policy if exists "own or staff read" on public.invoices;
create policy "own or staff read" on public.invoices for select to authenticated
  using ((patient_id = (select private.my_patient_id()))
    or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}')))
    or (select private.has_perm('room_tablet')) or (select private.has_perm('queue')) or (select private.has_perm('kiosk_desk'))
    or (created_by = (select auth.uid()) and (select private.has_perm('pos'))));

drop policy if exists "follows invoice" on public.invoice_items;
create policy "follows invoice" on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id and (
    i.patient_id = (select private.my_patient_id())
    or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}')))
    or (i.created_by = (select auth.uid()) and (select private.has_perm('pos'))))));

drop policy if exists "own or staff read" on public.invoice_payments;
create policy "own or staff read" on public.invoice_payments for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_payments.invoice_id and (
    i.patient_id = (select private.my_patient_id())
    or coalesce((select private.perm_override_any(array['cashier','finance'])), (select private.has_role('{admin,accountant}')))
    or (i.created_by = (select auth.uid()) and (select private.has_perm('pos'))))));
