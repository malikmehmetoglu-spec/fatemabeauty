-- «طلب اشتراك بباقة» — the client asks for a package from the app, pays at the centre; owner/admin confirm the payment
-- (public.create_invoice with a 'package' line → patient_packages row exactly as the cashier does) → paid + notification.
-- Mirrors written_consults (0174/0175). Access: patient = own rows; owner/admin = all; reception/accountant = nothing.

create table if not exists public.package_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id),
  package_id uuid not null references public.packages(id),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  price int not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz,
  confirmed_by uuid references public.staff(id),
  invoice_id uuid references public.invoices(id),
  patient_package_id uuid references public.patient_packages(id)
);
create index if not exists package_requests_patient_idx on public.package_requests (patient_id, created_at desc);
create index if not exists package_requests_status_idx on public.package_requests (status, created_at desc);
create unique index if not exists package_requests_one_pending on public.package_requests (patient_id, package_id) where status = 'pending';
alter table public.package_requests enable row level security;

create policy "own or admin read" on public.package_requests for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.has_role('{admin}')));
-- all writes go through the security-definer RPCs below
grant select on public.package_requests to authenticated;
grant select, insert, update on public.package_requests to service_role;

/* ---------------- patient: submit ---------------- */
create or replace function public.package_request_submit(p_package uuid)
returns public.package_requests language plpgsql security definer set search_path = '' as $$
declare pid uuid := private.my_patient_id(); pk public.packages; rec public.package_requests;
begin
  if pid is null then raise exception 'no patient record'; end if;
  select * into pk from public.packages where id = p_package;
  if pk.id is null or not pk.active then raise exception 'unknown package'; end if;
  if exists (select 1 from public.package_requests r where r.patient_id = pid and r.package_id = pk.id and r.status = 'pending') then
    raise exception 'already_pending';
  end if;
  if (select count(*) from public.package_requests r where r.patient_id = pid and r.status = 'pending') >= 3 then
    raise exception 'too_many_pending';
  end if;
  insert into public.package_requests (patient_id, package_id, price) values (pid, pk.id, pk.price) returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (pid, 'package_request', 'وصلنا طلبكِ',
          'طلب اشتراككِ في «' || pk.name || '» قيد الانتظار. ادفعي في المركز لتفعيل الباقة.', '/packages/detail/?id=' || pk.id);
  return rec;
end $$;
revoke all on function public.package_request_submit(uuid) from public, anon;
grant execute on function public.package_request_submit(uuid) to authenticated;

/* ---------------- cancel: patient own pending, or owner/admin ---------------- */
create or replace function public.package_request_cancel(p_id uuid)
returns public.package_requests language plpgsql security definer set search_path = '' as $$
declare rec public.package_requests;
begin
  select * into rec from public.package_requests where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if not (private.has_role('{admin}') or rec.patient_id = private.my_patient_id()) then raise exception 'not allowed'; end if;
  if rec.status <> 'pending' then raise exception 'not_pending'; end if;
  update public.package_requests set status = 'cancelled', cancelled_at = now() where id = p_id returning * into rec;
  return rec;
end $$;
revoke all on function public.package_request_cancel(uuid) from public, anon;
grant execute on function public.package_request_cancel(uuid) to authenticated;

/* ---------------- owner/admin: list ---------------- */
create or replace function public.package_request_list()
returns table(id uuid, patient_id uuid, patient_name text, file_no int, phone text, package_id uuid, package_name text,
              sessions int, status text, price int, created_at timestamptz, paid_at timestamptz, invoice_no text)
language sql stable security definer set search_path = '' as $$
  select r.id, r.patient_id, p.name, p.file_no, p.phone, r.package_id, k.name, k.sessions, r.status, r.price, r.created_at, r.paid_at, i.no
    from public.package_requests r join public.patients p on p.id = r.patient_id join public.packages k on k.id = r.package_id
    left join public.invoices i on i.id = r.invoice_id
   where private.has_role('{admin}')
     and (r.status = 'pending' or r.paid_at > now() - interval '7 days')
   order by (r.status = 'pending') desc, r.created_at desc
   limit 200;
$$;
revoke all on function public.package_request_list() from public, anon;
grant execute on function public.package_request_list() to authenticated;

/* ---------------- owner/admin: confirm payment ---------------- */
create or replace function public.package_request_confirm_payment(p_id uuid, p_method public.pay_method default 'cash')
returns public.package_requests language plpgsql security definer set search_path = '' as $$
declare rec public.package_requests; inv public.invoices; me uuid; pk public.packages; ppid uuid;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  if p_method not in ('cash', 'card') then raise exception 'bad method'; end if;
  select * into rec from public.package_requests where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if rec.status <> 'pending' then raise exception 'not_pending'; end if;
  select * into pk from public.packages where id = rec.package_id;
  if pk.id is null or not pk.active then raise exception 'unknown package'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  inv := public.create_invoice(rec.patient_id, null,
           jsonb_build_array(jsonb_build_object('kind', 'package', 'ref', pk.id::text, 'qty', 1)), 0,
           jsonb_build_array(jsonb_build_object('method', p_method, 'amount', pk.price)),
           null, 'اشتراك باقة من التطبيق', null, null);
  select pp.id into ppid from public.patient_packages pp where pp.invoice_id = inv.id order by pp.purchased_at desc limit 1;
  update public.package_requests set status = 'paid', price = pk.price, invoice_id = inv.id, patient_package_id = ppid,
         paid_at = now(), confirmed_by = me
   where id = p_id returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (rec.patient_id, 'package_activated', 'تمّ تفعيل باقتكِ',
          'باقة «' || pk.name || '» صارت فعّالة: ' || pk.sessions || ' جلسات بانتظاركِ. احجزي جلستكِ الأولى متى شئتِ.', '/packages/');
  return rec;
end $$;
revoke all on function public.package_request_confirm_payment(uuid, public.pay_method) from public, anon;
grant execute on function public.package_request_confirm_payment(uuid, public.pay_method) to authenticated;
