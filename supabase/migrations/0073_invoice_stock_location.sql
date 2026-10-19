-- 0073 — Cashier sales take products from a chosen stock location.
-- Each product item in p_items may carry "location" (uuid); without it the default centre location is used.
-- void_invoice is unchanged: its 'return' movements go back to the exact batches the sale took (stock_batch_takes).
create or replace function public.create_invoice(p_patient uuid, p_appointment uuid, p_items jsonb, p_discount integer, p_payments jsonb, p_patient_package uuid default null::uuid, p_note text default null::text, p_due_on date default null::date, p_walk_in_name text default null::text)
 returns public.invoices
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  inv public.invoices; it jsonb; q int; qn numeric; price int; lbl text; sub int := 0; v_paid int := 0; pay jsonb;
  s public.services; p public.products; pk public.packages; pp public.patient_packages;
  maxpct numeric; shift uuid := private.open_shift_id(); m public.pay_method; amt int; amtn numeric;
  appt public.appointments; approver uuid; appt_priced boolean := false;
  pkg_key text; pkg_covered boolean := false; pkg_wanted boolean := false; is_admin boolean := private.has_role('{admin}');
  best_m public.pay_method; best_amt int := -1; loc uuid;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'empty invoice'; end if;
  if p_payments is not null and jsonb_typeof(p_payments) <> 'array' then raise exception 'bad amount'; end if;

  if p_appointment is not null then
    select * into appt from public.appointments where id = p_appointment for update;
    if appt.id is null then raise exception 'unknown appointment'; end if;
    if appt.status in ('cancelled', 'no_show') then raise exception 'appointment not billable'; end if;
    p_patient := coalesce(appt.patient_id, p_patient);
    p_walk_in_name := coalesce(nullif(trim(p_walk_in_name), ''), appt.walk_in_name);
    if exists (select 1 from public.invoices where appointment_id = p_appointment and not void) then raise exception 'appointment already invoiced'; end if;
  end if;
  if p_patient is not null and not exists (select 1 from public.patients where id = p_patient) then raise exception 'unknown patient'; end if;

  for pay in select * from jsonb_array_elements(coalesce(p_payments, '[]'::jsonb)) loop
    if pay->>'method' = 'package' then
      if pkg_wanted then raise exception 'one package per invoice'; end if;
      pkg_wanted := true;
      select * into pp from public.patient_packages where id = p_patient_package for update;
      if pp.id is null or p_patient is null or pp.patient_id is distinct from p_patient then raise exception 'package not found for this patient'; end if;
      if pp.sessions_used >= pp.sessions_total then raise exception 'package has no sessions left'; end if;
      select service_key into pkg_key from public.packages where id = pp.package_id;
    end if;
  end loop;

  insert into public.invoices (patient_id, appointment_id, method, paid, created_by, note, due_on, walk_in_name, shift_id)
  values (p_patient, p_appointment, 'cash', false, auth.uid(), nullif(trim(p_note), ''), p_due_on, nullif(trim(p_walk_in_name), ''), shift)
  returning * into inv;

  for it in select * from jsonb_array_elements(p_items) loop
    begin qn := coalesce((it->>'qty')::numeric, 1); exception when others then raise exception 'bad quantity'; end;
    if qn <= 0 or qn <> trunc(qn) or qn > 1000 then raise exception 'bad quantity'; end if;
    q := qn::int;
    case it->>'kind'
      when 'service' then
        select * into s from public.services where key = it->>'ref';
        if s.key is null then raise exception 'unknown service'; end if;
        if appt.id is not null and not appt_priced and s.key = appt.service_key then
          price := coalesce(nullif(appt.price, 0), s.price); appt_priced := true;
        else
          if not coalesce(s.active, true) then raise exception 'unknown service'; end if;
          price := s.price;
        end if;
        lbl := s.name;
        if pkg_wanted and not pkg_covered and s.key = pkg_key then
          insert into public.invoice_items (invoice_id, label, qty, unit_price, kind, ref) values (inv.id, lbl || ' (من الباقة)', 1, 0, 'service', s.key);
          pkg_covered := true;
          q := q - 1;
          if q = 0 then continue; end if;
        end if;
      when 'product' then
        select * into p from public.products where key = it->>'ref' for update;
        if p.key is null or not p.active or p.kind <> 'retail' or p.price is null then raise exception 'unavailable: %', coalesce(p.name, '?'); end if;
        begin loc := nullif(it->>'location', '')::uuid; exception when others then raise exception 'unknown location'; end;
        loc := private.check_location(loc);
        if p.stock < q or private.location_qty(p.key, loc) < q then raise exception 'out of stock: %', p.name; end if;
        price := p.price; lbl := p.name;
        insert into public.stock_movements (product_key, delta, reason, ref_id, created_by, location_id) values (p.key, -q, 'sale', inv.id, auth.uid(), loc);
      when 'package' then
        if p_patient is null then raise exception 'a package needs a patient file'; end if;
        begin select * into pk from public.packages where id = (it->>'ref')::uuid; exception when others then raise exception 'unknown package'; end;
        if pk.id is null or not pk.active then raise exception 'unknown package'; end if;
        price := pk.price; lbl := pk.name;
        for i in 1..q loop
          insert into public.patient_packages (patient_id, package_id, sessions_total, price_paid, invoice_id) values (p_patient, pk.id, pk.sessions, pk.price, inv.id);
        end loop;
      when 'custom' then
        if not is_admin then raise exception 'custom lines need admin'; end if;
        begin price := coalesce((it->>'unit_price')::numeric, 0)::int; exception when others then raise exception 'bad price'; end;
        lbl := coalesce(nullif(trim(it->>'label'), ''), 'بند');
        if price < 0 then raise exception 'bad price'; end if;
      else
        raise exception 'bad item';
    end case;
    insert into public.invoice_items (invoice_id, label, qty, unit_price, kind, ref) values (inv.id, lbl, q, price, it->>'kind', it->>'ref');
    sub := sub + q * price;
  end loop;
  if pkg_wanted and not pkg_covered then raise exception 'package does not cover this service'; end if;

  p_discount := greatest(coalesce(p_discount, 0), 0);
  if p_discount > sub then raise exception 'discount larger than subtotal'; end if;
  select coalesce((value->>'max_discount_without_approval')::numeric, 0) into maxpct from public.settings where key = 'policies';
  if p_discount > round(sub * coalesce(maxpct, 0) / 100.0) then
    if not is_admin then raise exception 'discount needs approval'; end if;
    approver := auth.uid();
  end if;

  for pay in select * from jsonb_array_elements(coalesce(p_payments, '[]'::jsonb)) loop
    begin m := (pay->>'method')::public.pay_method; exception when others then raise exception 'bad payment method'; end;
    begin amtn := coalesce((pay->>'amount')::numeric, 0); exception when others then raise exception 'bad amount'; end;
    if amtn < 0 or amtn <> trunc(amtn) then raise exception 'bad amount'; end if;
    amt := amtn::int;
    if m = 'points' then raise exception 'points payment not supported'; end if;
    if m = 'package' then
      if amt <> 0 then raise exception 'bad amount'; end if;
      update public.patient_packages set sessions_used = sessions_used + 1 where id = pp.id;
      insert into public.invoice_payments (invoice_id, amount, method, shift_id, created_by) values (inv.id, 0, 'package', null, auth.uid());
      continue;
    end if;
    if amt = 0 then continue; end if;
    if m = 'cash' and shift is null then raise exception 'no open shift'; end if;
    insert into public.invoice_payments (invoice_id, amount, method, shift_id, created_by) values (inv.id, amt, m, case when m = 'cash' then shift end, auth.uid());
    v_paid := v_paid + amt;
    if amt > best_amt then best_amt := amt; best_m := m; end if;
  end loop;
  if v_paid > sub - p_discount then raise exception 'paid more than total'; end if;
  if v_paid < sub - p_discount and p_patient is null then raise exception 'deferred payment needs a patient file'; end if;

  update public.invoices set subtotal = sub, discount = p_discount, total = sub - p_discount, amount_paid = v_paid,
    paid = (v_paid >= sub - p_discount), discount_approved_by = approver,
    due_on = case when v_paid >= sub - p_discount then null else p_due_on end,
    patient_package_id = case when pkg_wanted then pp.id end,
    method = coalesce(best_m, case when pkg_wanted then 'package'::public.pay_method else 'cash'::public.pay_method end)
  where id = inv.id returning * into inv;

  if p_appointment is not null then
    update public.appointments set pay_method = inv.method, patient_package_id = coalesce(case when pkg_wanted then pp.id end, patient_package_id)
    where id = p_appointment;
  end if;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.create', inv.no, jsonb_build_object('total', inv.total, 'discount', inv.discount));
  return inv;
end $function$;
