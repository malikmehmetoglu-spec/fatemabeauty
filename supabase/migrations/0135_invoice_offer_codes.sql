-- Offer codes at the cashier: invoices remember the code; the server validates it and recomputes the discount.
-- create_invoice keeps its signature (no overload); create_invoice_with_code wraps it. void_invoice gives the use back.
alter table public.invoices add column if not exists offer_id uuid references public.offers(id);
alter table public.invoices add column if not exists offer_code text;
create index if not exists invoices_offer_id_idx on public.invoices(offer_id);

create or replace function private.offer_problem(o public.offers) returns text
language sql stable set search_path to '' as $$
  select case
    when o.id is null then 'not found'
    when not o.active then 'inactive'
    when o.ends_on is not null and o.ends_on < (now() at time zone 'Asia/Damascus')::date then 'expired'
    when o.starts_on is not null and o.starts_on > (now() at time zone 'Asia/Damascus')::date then 'not started'
    when o.max_uses is not null and o.uses >= o.max_uses then 'used up'
    else null end
$$;

create or replace function private.offer_amount(o public.offers, eligible int) returns int
language sql immutable set search_path to '' as $$
  select greatest(0, least(eligible, case when o.kind = 'percent' then round(eligible * least(o.value, 100) / 100.0)::int else o.value end))
$$;

create or replace function public.check_offer_code(p_code text, p_subtotal int, p_items jsonb)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare o public.offers; prob text; elig int := 0; it jsonb;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  select * into o from public.offers where code = upper(trim(p_code));
  prob := private.offer_problem(o);
  if prob is null then
    if o.service_key is null then elig := greatest(coalesce(p_subtotal, 0), 0);
    else
      for it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
        if it->>'kind' = 'service' and it->>'ref' = o.service_key then
          elig := elig + coalesce((it->>'qty')::numeric, 1)::int * coalesce((it->>'unit_price')::numeric, 0)::int;
        end if;
      end loop;
      elig := least(elig, greatest(coalesce(p_subtotal, 0), 0));
      if elig <= 0 then prob := 'not applicable'; end if;
    end if;
  end if;
  if prob is not null then return jsonb_build_object('ok', false, 'reason', prob, 'code', upper(trim(p_code))); end if;
  return jsonb_build_object('ok', true, 'id', o.id, 'code', o.code, 'title', o.title, 'kind', o.kind, 'value', o.value,
    'service_key', o.service_key, 'discount', private.offer_amount(o, elig));
end $$;

create or replace function public.create_invoice_with_code(p_patient uuid, p_appointment uuid, p_items jsonb, p_payments jsonb, p_offer_code text,
  p_patient_package uuid default null, p_note text default null, p_due_on date default null, p_walk_in_name text default null)
returns public.invoices language plpgsql security definer set search_path to '' as $$
declare o public.offers; prob text; inv public.invoices; elig int; disc int; tot int;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  select * into o from public.offers where code = upper(trim(p_offer_code)) for update;
  prob := private.offer_problem(o);
  if prob is not null then raise exception 'offer code %', prob; end if;
  -- items, prices, stock, packages and payments go through the normal path with no manual discount
  inv := public.create_invoice(p_patient, p_appointment, p_items, 0, p_payments, p_patient_package, p_note, p_due_on, p_walk_in_name);
  -- recompute the code discount from the stored (DB-priced) lines
  if o.service_key is null then elig := inv.subtotal;
  else select coalesce(sum(qty * unit_price), 0)::int into elig from public.invoice_items where invoice_id = inv.id and kind = 'service' and ref = o.service_key;
  end if;
  if elig <= 0 then raise exception 'offer code not applicable'; end if;
  disc := private.offer_amount(o, elig);
  tot := inv.subtotal - disc;
  if inv.amount_paid > tot then raise exception 'paid more than total'; end if;
  if inv.amount_paid < tot and inv.patient_id is null then raise exception 'deferred payment needs a patient file'; end if;
  update public.invoices set discount = disc, total = tot, paid = (amount_paid >= tot),
    due_on = case when amount_paid >= tot then null else p_due_on end, offer_id = o.id, offer_code = o.code
  where id = inv.id returning * into inv;
  update public.offers set uses = uses + 1 where id = o.id;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.offer', inv.no, jsonb_build_object('code', o.code, 'discount', disc));
  return inv;
end $$;

revoke all on function public.check_offer_code(text, int, jsonb) from public, anon;
revoke all on function public.create_invoice_with_code(uuid, uuid, jsonb, jsonb, text, uuid, text, date, text) from public, anon;
grant execute on function public.check_offer_code(text, int, jsonb) to authenticated;
grant execute on function public.create_invoice_with_code(uuid, uuid, jsonb, jsonb, text, uuid, text, date, text) to authenticated;

-- void_invoice: unchanged except the offer use is given back
CREATE OR REPLACE FUNCTION public.void_invoice(p_invoice uuid, p_reason text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare inv public.invoices; it record; cash int; sid uuid := private.open_shift_id();
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'void reason required'; end if;
  select * into inv from public.invoices where id = p_invoice for update;
  if inv.id is null then raise exception 'unknown invoice'; end if;
  if inv.void then return; end if;

  if exists (select 1 from public.patient_packages pp where pp.invoice_id = inv.id
             and (pp.sessions_used > 0 or exists (select 1 from public.invoices i2 where i2.patient_package_id = pp.id and not i2.void and i2.id <> inv.id)
                  or exists (select 1 from public.appointments a where a.patient_package_id = pp.id and a.status not in ('cancelled', 'no_show')))) then
    raise exception 'sold package already used';
  end if;

  cash := coalesce((select sum(amount) from public.invoice_payments where invoice_id = inv.id and method = 'cash'), 0)::int;

  for it in select ref, qty from public.invoice_items where invoice_id = inv.id and kind = 'product' and ref is not null loop
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (it.ref, it.qty, 'return', inv.id, auth.uid());
  end loop;

  if inv.patient_package_id is not null then
    update public.patient_packages set sessions_used = greatest(sessions_used - 1, 0) where id = inv.patient_package_id;
    update public.appointments set patient_package_id = null where id = inv.appointment_id and patient_package_id = inv.patient_package_id;
  end if;
  update public.appointments set patient_package_id = null where patient_package_id in (select id from public.patient_packages where invoice_id = inv.id);
  update public.patient_packages set sessions_total = 0, sessions_used = 0, price_paid = 0 where invoice_id = inv.id;

  if inv.offer_id is not null then
    update public.offers set uses = greatest(uses - 1, 0) where id = inv.offer_id;
  end if;

  update public.invoices set void = true, void_at = now(), void_by = auth.uid(), paid = false,
    refund_cash = cash, refund_shift_id = case when cash > 0 then sid end,
    note = concat_ws(' · ', note, 'إلغاء: ' || trim(p_reason))
  where id = inv.id;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.void', inv.no, jsonb_build_object('reason', p_reason, 'refund_cash', cash));
end $function$;
