-- Owner decision (2026-10-24): reception («خدمة العملاء») only books appointments and adds patients.
-- Written-consult payment queue + confirmation become owner/admin only (has_role('{admin}') also passes for owner).

create or replace function public.written_consult_payments()
returns table(id uuid, patient_id uuid, patient_name text, file_no int, phone text, status text, price int, created_at timestamptz,
              paid_at timestamptz, due_at timestamptz, invoice_no text)
language sql stable security definer set search_path = '' as $$
  select w.id, w.patient_id, p.name, p.file_no, p.phone, w.status, w.price, w.created_at, w.paid_at, w.due_at, i.no
    from public.written_consults w join public.patients p on p.id = w.patient_id
    left join public.invoices i on i.id = w.invoice_id
   where private.has_role('{admin}')
     and (w.status = 'awaiting_payment' or w.paid_at > now() - interval '7 days')
   order by (w.status = 'awaiting_payment') desc, w.created_at desc
   limit 200;
$$;
revoke all on function public.written_consult_payments() from public, anon;
grant execute on function public.written_consult_payments() to authenticated;

create or replace function public.written_consult_confirm_payment(p_id uuid, p_method public.pay_method default 'cash')
returns public.written_consults language plpgsql security definer set search_path = '' as $$
declare rec public.written_consults; inv public.invoices; me uuid;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  if p_method not in ('cash', 'card') then raise exception 'bad method'; end if;
  select * into rec from public.written_consults where id = p_id for update;
  if rec.id is null then raise exception 'not found'; end if;
  if rec.status <> 'awaiting_payment' then raise exception 'already_paid'; end if;
  select s.id into me from public.staff s where s.user_id = auth.uid();
  inv := public.create_invoice(rec.patient_id, null,
           jsonb_build_array(jsonb_build_object('kind', 'service', 'ref', 'online-consultation', 'qty', 1)), 0,
           jsonb_build_array(jsonb_build_object('method', p_method, 'amount', rec.price)),
           null, 'استشارة مكتوبة', null, null);
  update public.written_consults set status = 'paid', invoice_id = inv.id, paid_at = now(), paid_by = me,
         due_at = now() + interval '48 hours', updated_at = now()
   where id = p_id returning * into rec;
  insert into public.notifications (patient_id, kind, title, body, link)
  values (rec.patient_id, 'written_consult', 'تأكّد الدفع',
          'استشارتكِ المكتوبة الآن عند أ. فاطمة، وتصلكِ الإجابة خلال 48 ساعة.', '/consult/written/?id=' || rec.id);
  return rec;
end $$;
revoke all on function public.written_consult_confirm_payment(uuid, public.pay_method) from public, anon;
grant execute on function public.written_consult_confirm_payment(uuid, public.pay_method) to authenticated;

