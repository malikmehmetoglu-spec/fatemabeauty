-- Applied as «finance_cashier». Cashier, payments (split / instalments), cash shifts, expenses paid from the till.

-- ---------- invoices ----------
alter table public.invoices
  add column if not exists amount_paid int not null default 0,
  add column if not exists due_on date,
  add column if not exists note text,
  add column if not exists patient_package_id uuid references public.patient_packages(id),
  add column if not exists walk_in_name text,
  add column if not exists discount_approved_by uuid references auth.users(id),
  add column if not exists shift_id uuid,
  add column if not exists void boolean not null default false;
create index if not exists invoices_created_at_idx on public.invoices (created_at);
create index if not exists invoices_patient_idx on public.invoices (patient_id);

alter table public.invoice_items
  add column if not exists kind text not null default 'custom' check (kind in ('service', 'product', 'package', 'custom')),
  add column if not exists ref text;

-- Every money movement against an invoice (split payment = several rows; instalments = later rows).
create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount int not null check (amount >= 0),
  method public.pay_method not null,
  shift_id uuid,
  paid_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index if not exists invoice_payments_invoice_idx on public.invoice_payments (invoice_id);
create index if not exists invoice_payments_paid_at_idx on public.invoice_payments (paid_at);

-- ---------- cash box shifts ----------
create table if not exists public.cash_shifts (
  id uuid primary key default gen_random_uuid(),
  opened_at timestamptz not null default now(),
  opened_by uuid references auth.users(id),
  opening_cash int not null default 0 check (opening_cash >= 0),
  closed_at timestamptz,
  closed_by uuid references auth.users(id),
  expected_cash int,
  counted_cash int,
  note text
);
create unique index if not exists cash_shifts_one_open on public.cash_shifts ((true)) where closed_at is null;
alter table public.invoices add constraint invoices_shift_fk foreign key (shift_id) references public.cash_shifts(id);
alter table public.invoice_payments add constraint invoice_payments_shift_fk foreign key (shift_id) references public.cash_shifts(id);

-- ---------- expenses ----------
alter table public.expenses
  add column if not exists note text,
  add column if not exists from_cash_box boolean not null default false,
  add column if not exists shift_id uuid references public.cash_shifts(id);

-- ---------- RLS ----------
alter table public.invoice_payments enable row level security;
alter table public.cash_shifts enable row level security;
create policy "own or staff read" on public.invoice_payments for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id and (i.patient_id = (select private.my_patient_id()) or (select private.is_staff()))));
create policy "cashier reads" on public.cash_shifts for select to authenticated
  using ((select private.has_role('{admin,reception,accountant}')));

-- ---------- helpers ----------
create or replace function private.open_shift_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.cash_shifts where closed_at is null limit 1
$$;

create or replace function private.shift_expected(p_shift uuid) returns int
language sql stable security definer set search_path = '' as $$
  select s.opening_cash
       + coalesce((select sum(p.amount) from public.invoice_payments p where p.shift_id = s.id and p.method = 'cash'), 0)::int
       - coalesce((select sum(e.amount) from public.expenses e where e.shift_id = s.id and e.from_cash_box), 0)::int
  from public.cash_shifts s where s.id = p_shift
$$;

-- Expenses paid from the till are attached to the open shift.
create or replace function private.expense_shift() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.from_cash_box and new.shift_id is null then new.shift_id := private.open_shift_id(); end if;
  if not new.from_cash_box then new.shift_id := null; end if;
  return new;
end $$;
create trigger expenses_shift before insert or update on public.expenses for each row execute function private.expense_shift();

-- ---------- create_invoice: one atomic call ----------
-- p_items:    [{kind:'service'|'product'|'package'|'custom', ref, qty, label?, unit_price? (custom only)}]
-- p_payments: [{method:'cash'|'card'|'package', amount}]  (sum may be < total → the rest stays receivable)
create or replace function public.create_invoice(
  p_patient uuid, p_appointment uuid, p_items jsonb, p_discount int, p_payments jsonb,
  p_patient_package uuid default null, p_note text default null, p_due_on date default null, p_walk_in_name text default null
) returns public.invoices language plpgsql security definer set search_path = '' as $$
declare
  inv public.invoices; it jsonb; q int; price int; lbl text; sub int := 0; v_paid int := 0; pay jsonb;
  s public.services; p public.products; pk public.packages; pp public.patient_packages;
  maxpct numeric; shift uuid := private.open_shift_id(); pkg_used boolean := false; m public.pay_method; amt int;
  appt public.appointments; approver uuid;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'empty invoice'; end if;
  if p_appointment is not null then
    select * into appt from public.appointments where id = p_appointment;
    if appt.id is null then raise exception 'unknown appointment'; end if;
    p_patient := coalesce(p_patient, appt.patient_id);
    p_walk_in_name := coalesce(p_walk_in_name, appt.walk_in_name);
    if exists (select 1 from public.invoices where appointment_id = p_appointment and not void) then raise exception 'appointment already invoiced'; end if;
  end if;

  insert into public.invoices (patient_id, appointment_id, method, paid, created_by, note, due_on, walk_in_name, shift_id)
  values (p_patient, p_appointment, 'cash', false, auth.uid(), nullif(p_note, ''), p_due_on, nullif(p_walk_in_name, ''), shift)
  returning * into inv;

  for it in select * from jsonb_array_elements(p_items) loop
    q := coalesce((it->>'qty')::int, 1);
    if q <= 0 then raise exception 'bad quantity'; end if;
    case it->>'kind'
      when 'service' then
        select * into s from public.services where key = it->>'ref';
        if s.key is null then raise exception 'unknown service'; end if;
        price := coalesce((it->>'unit_price')::int, s.price); lbl := s.name;
      when 'product' then
        select * into p from public.products where key = it->>'ref' for update;
        if p.key is null or not p.active or p.kind <> 'retail' or p.price is null then raise exception 'unavailable: %', coalesce(p.name, '?'); end if;
        if p.stock < q then raise exception 'out of stock: %', p.name; end if;
        price := p.price; lbl := p.name;
        insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (p.key, -q, 'sale', inv.id, auth.uid());
      when 'package' then
        if p_patient is null then raise exception 'a package needs a patient file'; end if;
        select * into pk from public.packages where id = (it->>'ref')::uuid;
        if pk.id is null or not pk.active then raise exception 'unknown package'; end if;
        price := pk.price; lbl := pk.name;
        for i in 1..q loop
          insert into public.patient_packages (patient_id, package_id, sessions_total, price_paid) values (p_patient, pk.id, pk.sessions, pk.price);
        end loop;
      else
        price := coalesce((it->>'unit_price')::int, 0); lbl := coalesce(nullif(it->>'label', ''), 'بند');
        if price < 0 then raise exception 'bad price'; end if;
    end case;
    insert into public.invoice_items (invoice_id, label, qty, unit_price, kind, ref) values (inv.id, lbl, q, price, coalesce(it->>'kind', 'custom'), it->>'ref');
    sub := sub + q * price;
  end loop;

  p_discount := greatest(coalesce(p_discount, 0), 0);
  if p_discount > sub then raise exception 'discount larger than subtotal'; end if;
  select coalesce((value->>'max_discount_without_approval')::numeric, 0) into maxpct from public.settings where key = 'policies';
  if sub > 0 and p_discount * 100.0 / sub > coalesce(maxpct, 0) + 0.0001 then
    if not private.has_role('{admin}') then raise exception 'discount needs approval'; end if;
    approver := auth.uid();
  end if;

  for pay in select * from jsonb_array_elements(coalesce(p_payments, '[]'::jsonb)) loop
    m := (pay->>'method')::public.pay_method; amt := coalesce((pay->>'amount')::int, 0);
    if amt < 0 then raise exception 'bad amount'; end if;
    if m = 'points' then raise exception 'points payment not supported'; end if;
    if m = 'package' then
      if pkg_used then raise exception 'one package per invoice'; end if;
      select * into pp from public.patient_packages where id = p_patient_package for update;
      if pp.id is null or pp.patient_id is distinct from p_patient then raise exception 'package not found for this patient'; end if;
      if pp.sessions_used >= pp.sessions_total then raise exception 'package has no sessions left'; end if;
      update public.patient_packages set sessions_used = sessions_used + 1 where id = pp.id;
      pkg_used := true;
    end if;
    if amt > 0 or m = 'package' then
      insert into public.invoice_payments (invoice_id, amount, method, shift_id, created_by) values (inv.id, amt, m, case when m = 'cash' then shift end, auth.uid());
    end if;
    v_paid := v_paid + amt;
  end loop;
  if v_paid > sub - p_discount then raise exception 'paid more than total'; end if;
  if v_paid < sub - p_discount and p_patient is null then raise exception 'deferred payment needs a patient file'; end if;

  update public.invoices set subtotal = sub, discount = p_discount, total = sub - p_discount, amount_paid = v_paid,
    paid = (v_paid >= sub - p_discount), discount_approved_by = approver,
    patient_package_id = case when pkg_used then p_patient_package end,
    method = coalesce((select (x->>'method')::public.pay_method from jsonb_array_elements(coalesce(p_payments, '[]'::jsonb)) x
                       order by (x->>'amount')::int desc nulls last limit 1), 'cash')
  where id = inv.id returning * into inv;

  if p_appointment is not null then
    update public.appointments set pay_method = inv.method, patient_package_id = coalesce(case when pkg_used then p_patient_package end, patient_package_id)
    where id = p_appointment;
  end if;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.create', inv.no, jsonb_build_object('total', inv.total, 'discount', inv.discount));
  return inv;
end $$;

-- Later payment against an unpaid invoice (receivables / instalments).
create or replace function public.pay_invoice(p_invoice uuid, p_amount int, p_method public.pay_method)
returns public.invoices language plpgsql security definer set search_path = '' as $$
declare inv public.invoices;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if p_method not in ('cash', 'card') then raise exception 'cash or card only'; end if;
  select * into inv from public.invoices where id = p_invoice for update;
  if inv.id is null or inv.void then raise exception 'unknown invoice'; end if;
  if p_amount is null or p_amount <= 0 or p_amount > inv.total - inv.amount_paid then raise exception 'bad amount'; end if;
  insert into public.invoice_payments (invoice_id, amount, method, shift_id, created_by)
  values (inv.id, p_amount, p_method, case when p_method = 'cash' then private.open_shift_id() end, auth.uid());
  update public.invoices set amount_paid = amount_paid + p_amount, paid = (amount_paid + p_amount >= total) where id = inv.id returning * into inv;
  return inv;
end $$;

-- Cancels an invoice: products go back to stock, a package session is given back.
create or replace function public.void_invoice(p_invoice uuid, p_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare inv public.invoices; it record;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  select * into inv from public.invoices where id = p_invoice for update;
  if inv.id is null or inv.void then return; end if;
  for it in select ref, qty from public.invoice_items where invoice_id = inv.id and kind = 'product' loop
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (it.ref, it.qty, 'return', inv.id, auth.uid());
  end loop;
  if inv.patient_package_id is not null then
    update public.patient_packages set sessions_used = greatest(sessions_used - 1, 0) where id = inv.patient_package_id;
  end if;
  update public.invoices set void = true, note = concat_ws(' · ', note, nullif(p_reason, '')) where id = inv.id;
  insert into public.audit_log (actor, action, target, details) values (auth.uid(), 'invoice.void', inv.no, jsonb_build_object('reason', p_reason));
end $$;

create or replace function public.open_cash_shift(p_opening int)
returns public.cash_shifts language plpgsql security definer set search_path = '' as $$
declare s public.cash_shifts;
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if private.open_shift_id() is not null then raise exception 'a shift is already open'; end if;
  insert into public.cash_shifts (opened_by, opening_cash) values (auth.uid(), greatest(coalesce(p_opening, 0), 0)) returning * into s;
  return s;
end $$;

create or replace function public.close_cash_shift(p_counted int, p_note text default null)
returns public.cash_shifts language plpgsql security definer set search_path = '' as $$
declare s public.cash_shifts; sid uuid := private.open_shift_id();
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  if sid is null then raise exception 'no open shift'; end if;
  update public.cash_shifts set closed_at = now(), closed_by = auth.uid(), counted_cash = greatest(coalesce(p_counted, 0), 0),
    expected_cash = private.shift_expected(sid), note = nullif(p_note, '')
  where id = sid returning * into s;
  return s;
end $$;

-- Live figure for the open shift.
create or replace function public.cash_shift_expected(p_shift uuid)
returns int language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.has_role('{admin,reception,accountant}') then raise exception 'not allowed'; end if;
  return private.shift_expected(p_shift);
end $$;

revoke execute on function public.create_invoice(uuid, uuid, jsonb, int, jsonb, uuid, text, date, text), public.pay_invoice(uuid, int, public.pay_method),
  public.void_invoice(uuid, text), public.open_cash_shift(int), public.close_cash_shift(int, text), public.cash_shift_expected(uuid) from public, anon;
grant execute on function public.create_invoice(uuid, uuid, jsonb, int, jsonb, uuid, text, date, text), public.pay_invoice(uuid, int, public.pay_method),
  public.void_invoice(uuid, text), public.open_cash_shift(int), public.close_cash_shift(int, text), public.cash_shift_expected(uuid) to authenticated;
revoke execute on function private.open_shift_id(), private.shift_expected(uuid), private.expense_shift() from public, anon;
