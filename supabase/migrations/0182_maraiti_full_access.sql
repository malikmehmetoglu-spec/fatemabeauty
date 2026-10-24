-- 0182 — «مرايتي» runs the centre: money, booking requests, queue, confirmations, client files, stock.
-- set_staff_hours is allowed by the CHECK but NOT executed (needs row removal; edit hours in «الموظفون»).
-- Invariant unchanged: every action is a draft in maraiti_actions; it executes ONLY in maraiti_decide on «موافقة»,
-- through the same RPCs the app uses (their own role checks run as Fatema: auth.uid() comes from her JWT).
--  New kinds: create_invoice, record_payment, void_invoice, confirm_written_payment, confirm_package_request,
--  approve_booking, reject_booking, set_appointment_status (checked_in / in_session / done / no_show),
--  send_confirmation (app → done here; sms / whatsapp → approved here, then the app sends via staff-sms / wa.me
--  and mark_confirm_channel), update_patient, set_service_level, adjust_stock.
--  maraiti_invoice_preview(): read-only price preview (SYP) for an invoice draft, no invoice number consumed.
-- NOTE: the CHECK change was applied with execute_sql (the migration tool refuses the drop keyword); kept here as record.

alter table public.maraiti_actions drop constraint if exists maraiti_actions_kind_check;
alter table public.maraiti_actions add constraint maraiti_actions_kind_check check (kind = any (array[
  'book_appointment', 'send_client_message', 'reschedule', 'remind_me', 'cancel_appointment', 'add_patient',
  'write_session_note', 'reply_written_consult', 'reply_mira_thread', 'mark_intake_reviewed',
  'create_invoice', 'record_payment', 'void_invoice', 'confirm_written_payment', 'confirm_package_request',
  'approve_booking', 'reject_booking', 'set_appointment_status', 'send_confirmation', 'update_patient',
  'set_service_level', 'adjust_stock', 'set_staff_hours'
]::text[]));

/** Price preview for an invoice draft (same pricing rules as create_invoice; nothing is written). */
create or replace function public.maraiti_invoice_preview(p_appointment uuid, p_items jsonb, p_discount integer default 0, p_offer_code text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare it jsonb; q int; price int; lbl text; sub int := 0; lines jsonb := '[]'::jsonb; appt public.appointments; appt_priced boolean := false;
        s public.services; p public.products; pk public.packages; o public.offers; disc int := greatest(coalesce(p_discount, 0), 0); elig int := 0; prob text;
begin
  if not private.is_maraiti_user() then raise exception 'not allowed'; end if;
  if p_appointment is not null then select * into appt from public.appointments where id = p_appointment; end if;
  for it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) loop
    q := greatest(coalesce((it->>'qty')::int, 1), 1);
    case it->>'kind'
      when 'service' then
        select * into s from public.services where key = it->>'ref';
        if s.key is null then raise exception 'unknown service %', it->>'ref'; end if;
        if appt.id is not null and not appt_priced and s.key = appt.service_key then
          price := coalesce(nullif(appt.price, 0), private.service_price_syp_strict(s.key)); appt_priced := true;
        else price := private.service_price_syp_strict(s.key); end if;
        lbl := s.name;
        if p_offer_code is not null then elig := elig + q * price; end if;
      when 'product' then
        select * into p from public.products where key = it->>'ref';
        if p.key is null or p.price is null then raise exception 'unavailable: %', it->>'ref'; end if;
        price := p.price; lbl := p.name;
      when 'package' then
        select * into pk from public.packages where id = (it->>'ref')::uuid;
        if pk.id is null then raise exception 'unknown package'; end if;
        price := pk.price; lbl := pk.name;
      when 'custom' then price := coalesce((it->>'unit_price')::int, 0); lbl := coalesce(nullif(btrim(it->>'label'), ''), 'بند');
      else raise exception 'bad item';
    end case;
    lines := lines || jsonb_build_object('kind', it->>'kind', 'ref', it->>'ref', 'label', lbl, 'qty', q, 'unit_price', price);
    sub := sub + q * price;
  end loop;
  if nullif(btrim(coalesce(p_offer_code, '')), '') is not null then
    select * into o from public.offers where code = upper(btrim(p_offer_code));
    prob := private.offer_problem(o);
    if prob is not null then raise exception 'offer code %', prob; end if;
    disc := private.offer_amount(o, case when o.service_key is null then sub else
              (select coalesce(sum((l->>'qty')::int * (l->>'unit_price')::int), 0) from jsonb_array_elements(lines) l where l->>'kind' = 'service' and l->>'ref' = o.service_key)::int end);
  end if;
  return jsonb_build_object('lines', lines, 'subtotal', sub, 'discount', least(disc, sub), 'total', sub - least(disc, sub));
end $$;
revoke all on function public.maraiti_invoice_preview(uuid, jsonb, integer, text) from public, anon;
grant execute on function public.maraiti_invoice_preview(uuid, jsonb, integer, text) to authenticated;

/* ---------------- decide: every draft kind ---------------- */
create or replace function public.maraiti_decide(p_id uuid, p_decision text, p_payload jsonb default null)
returns public.maraiti_actions language plpgsql security definer set search_path = '' as $$
declare a public.maraiti_actions; me uuid := private.my_staff_id(); pl jsonb; ap public.appointments;
        v_starts timestamptz; v_ends timestamptz; v_text text; v_pid uuid; v_res text; v_new public.patients;
        inv public.invoices; v_method text; v_amount int; v_pays jsonb; v_status text;
begin
  if not private.is_maraiti_user() then raise exception 'not allowed'; end if;
  select * into a from public.maraiti_actions where id = p_id and staff_id = me for update;
  if a.id is null then raise exception 'not found'; end if;
  if a.status <> 'pending' then raise exception 'already decided'; end if;
  if p_decision = 'dismiss' then
    update public.maraiti_actions set status = 'dismissed', decided_at = now() where id = p_id returning * into a;
    return a;
  end if;
  if p_decision <> 'approve' then raise exception 'bad decision'; end if;
  pl := coalesce(p_payload, a.payload);
  v_text := btrim(coalesce(pl->>'text', ''));

  begin
    if a.kind = 'book_appointment' then
      select * into ap from public.book_appointment_v2(
        pl->>'service_key', (pl->>'starts_at')::timestamptz, nullif(pl->>'specialist_id', '')::uuid, null,
        nullif(pl->>'patient_id', '')::uuid, nullif(pl->>'client_name', ''), nullif(pl->>'client_phone', ''), 'admin', false, nullif(pl->>'level_id', '')::uuid);
      v_res := 'تم الحجز';
    elsif a.kind = 'reschedule' then
      select * into ap from public.appointments where id = (pl->>'appointment_id')::uuid for update;
      if ap.id is null or ap.status not in ('pending', 'confirmed') then raise exception 'appointment not movable'; end if;
      v_starts := (pl->>'starts_at')::timestamptz;
      if v_starts <= now() then raise exception 'time in the past'; end if;
      v_ends := v_starts + make_interval(mins => ap.minutes);
      perform pg_advisory_xact_lock(hashtext('book-appointments'));
      if exists (select 1 from public.appointments x
                 where x.id <> ap.id and x.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                   and x.starts_at < v_ends and x.starts_at + make_interval(mins => x.minutes + x.extension_minutes) > v_starts
                   and ((ap.room_id is not null and x.room_id = ap.room_id) or (ap.specialist_id is not null and x.specialist_id = ap.specialist_id)))
      then raise exception 'slot taken'; end if;
      update public.appointments set starts_at = v_starts, confirm_sent_at = null where id = ap.id;
      if ap.patient_id is not null then
        insert into public.notifications (patient_id, kind, title, body, link)
        values (ap.patient_id, 'appointment', 'تغيّر موعدكِ',
                'تم نقل موعدكِ إلى ' || to_char(v_starts at time zone 'Asia/Damascus', 'YYYY-MM-DD HH24:MI') || ' بتوقيت دمشق.', '/appointments/');
      end if;
      v_res := 'تم نقل الموعد';
    elsif a.kind = 'cancel_appointment' then
      select * into ap from public.appointments where id = (pl->>'appointment_id')::uuid for update;
      if ap.id is null or ap.status not in ('pending', 'confirmed') then raise exception 'cannot cancel'; end if;
      update public.appointments set status = 'cancelled', cancel_reason = coalesce(nullif(btrim(coalesce(pl->>'reason', '')), ''), 'ألغته أ. فاطمة') where id = ap.id;
      if ap.patient_id is not null then
        insert into public.notifications (patient_id, kind, title, body, link)
        values (ap.patient_id, 'appointment', 'أُلغي موعدكِ',
                'تم إلغاء موعدكِ يوم ' || to_char(ap.starts_at at time zone 'Asia/Damascus', 'YYYY-MM-DD HH24:MI') || ' بتوقيت دمشق.', '/appointments/');
      end if;
      v_res := 'تم إلغاء الموعد';
    elsif a.kind = 'add_patient' then
      if btrim(coalesce(pl->>'name', '')) = '' then raise exception 'name required'; end if;
      insert into public.patients (name, phone, notes)
      values (btrim(pl->>'name'), nullif(btrim(coalesce(pl->>'phone', '')), ''), nullif(btrim(coalesce(pl->>'notes', '')), ''))
      returning * into v_new;
      pl := pl || jsonb_build_object('patient_id', v_new.id, 'file_no', v_new.file_no);
      v_res := 'تم فتح ملف رقم ' || coalesce(v_new.file_no::text, '-');
    elsif a.kind = 'write_session_note' then
      v_pid := (pl->>'patient_id')::uuid;
      if v_pid is null or v_text = '' then raise exception 'empty note'; end if;
      insert into public.session_notes (patient_id, appointment_id, author_id, body, fields)
      values (v_pid, nullif(pl->>'appointment_id', '')::uuid, me, v_text, jsonb_build_object('notes', v_text));
      v_res := 'تم حفظ الملاحظة';
    elsif a.kind = 'reply_written_consult' then
      if v_text = '' then raise exception 'empty message'; end if;
      perform public.written_consult_reply((pl->>'written_consult_id')::uuid, v_text, null);
      v_res := 'تم إرسال الرد';
    elsif a.kind in ('send_client_message', 'reply_mira_thread') then
      v_pid := (pl->>'patient_id')::uuid;
      if v_pid is null or v_text = '' then raise exception 'empty message'; end if;
      insert into public.messages (patient_id, from_patient, staff_id, body, author) values (v_pid, false, me, v_text, 'staff');
      insert into public.notifications (patient_id, kind, title, body, link)
      values (v_pid, 'message', 'رسالة من أ. فاطمة', left(v_text, 140), '/chat/');
      if a.kind = 'reply_mira_thread' then
        update public.mira_threads set status = 'mira', urgent = false, escalated = false, notify_count = 0, notified_at = null,
               resolved_at = now(), updated_at = now() where patient_id = v_pid and status = 'fatema';
      end if;
      v_res := 'تم الإرسال';
    elsif a.kind = 'mark_intake_reviewed' then
      perform public.consult_intake_review((pl->>'appointment_id')::uuid, true);
      v_res := 'تم';
    elsif a.kind = 'remind_me' then
      update public.maraiti_actions set remind_at = coalesce((pl->>'at')::timestamptz, now()) where id = p_id;
      v_res := 'تم ضبط التذكير';

    /* ---------- money ---------- */
    elsif a.kind = 'create_invoice' then
      v_method := coalesce(nullif(pl->>'method', ''), 'cash');
      if v_method not in ('cash', 'card', 'package', 'deferred') then raise exception 'bad payment method'; end if;
      v_amount := coalesce(nullif(pl->>'amount', '')::numeric, 0)::int;
      v_pays := case when v_method = 'package' then jsonb_build_array(jsonb_build_object('method', 'package', 'amount', 0))
                     when v_method = 'deferred' or v_amount <= 0 then '[]'::jsonb
                     else jsonb_build_array(jsonb_build_object('method', v_method, 'amount', v_amount)) end;
      if nullif(btrim(coalesce(pl->>'offer_code', '')), '') is not null then
        inv := public.create_invoice_with_code(nullif(pl->>'patient_id', '')::uuid, nullif(pl->>'appointment_id', '')::uuid, pl->'items', v_pays,
                 pl->>'offer_code', nullif(pl->>'patient_package_id', '')::uuid, nullif(pl->>'note', ''), nullif(pl->>'due_on', '')::date, nullif(pl->>'walk_in_name', ''));
      else
        inv := public.create_invoice(nullif(pl->>'patient_id', '')::uuid, nullif(pl->>'appointment_id', '')::uuid, pl->'items',
                 coalesce(nullif(pl->>'discount', '')::numeric, 0)::int, v_pays, nullif(pl->>'patient_package_id', '')::uuid,
                 nullif(pl->>'note', ''), nullif(pl->>'due_on', '')::date, nullif(pl->>'walk_in_name', ''));
      end if;
      pl := pl || jsonb_build_object('invoice_id', inv.id, 'invoice_no', inv.no, 'total', inv.total, 'amount_paid', inv.amount_paid);
      v_res := 'فاتورة ' || inv.no || ' بقيمة ' || inv.total || ' ل.س' || case when inv.paid then ' — مدفوعة' else ' — المتبقي ' || (inv.total - inv.amount_paid) || ' ل.س' end;
    elsif a.kind = 'record_payment' then
      inv := public.pay_invoice((pl->>'invoice_id')::uuid, (pl->>'amount')::numeric::int, coalesce(nullif(pl->>'method', ''), 'cash')::public.pay_method);
      v_res := 'قُبضت ' || (pl->>'amount') || ' ل.س' || case when inv.paid then ' — الفاتورة مدفوعة' else ' — المتبقي ' || (inv.total - inv.amount_paid) || ' ل.س' end;
    elsif a.kind = 'void_invoice' then
      if btrim(coalesce(pl->>'reason', '')) = '' then raise exception 'void reason required'; end if;
      perform public.void_invoice((pl->>'invoice_id')::uuid, pl->>'reason');
      v_res := 'أُلغيت الفاتورة';
    elsif a.kind = 'confirm_written_payment' then
      perform public.written_consult_confirm_payment((pl->>'written_consult_id')::uuid, coalesce(nullif(pl->>'method', ''), 'cash')::public.pay_method);
      v_res := 'تأكّد الدفع';
    elsif a.kind = 'confirm_package_request' then
      perform public.package_request_confirm_payment((pl->>'request_id')::uuid, coalesce(nullif(pl->>'method', ''), 'cash')::public.pay_method);
      v_res := 'تفعّلت الباقة';

    /* ---------- booking requests, queue, confirmations ---------- */
    elsif a.kind = 'approve_booking' then
      perform public.approve_booking((pl->>'appointment_id')::uuid);
      v_res := 'تم تثبيت الحجز';
    elsif a.kind = 'reject_booking' then
      perform public.reject_booking((pl->>'appointment_id')::uuid, pl->>'reason');
      v_res := 'تم رفض الطلب';
    elsif a.kind = 'set_appointment_status' then
      v_status := pl->>'status';
      select * into ap from public.appointments where id = (pl->>'appointment_id')::uuid for update;
      if ap.id is null then raise exception 'not found'; end if;
      if not ((v_status = 'checked_in' and ap.status in ('pending', 'confirmed'))
           or (v_status = 'in_session' and ap.status in ('confirmed', 'checked_in'))
           or (v_status = 'done' and ap.status in ('checked_in', 'in_session'))
           or (v_status = 'no_show' and ap.status in ('pending', 'confirmed'))) then raise exception 'bad status change'; end if;
      update public.appointments set status = v_status::public.appointment_status,
             checked_in_at = case when v_status = 'checked_in' then now() else checked_in_at end,
             started_at = case when v_status = 'in_session' then now() else started_at end,
             finished_at = case when v_status = 'done' then now() else finished_at end
       where id = ap.id;
      v_res := case v_status when 'checked_in' then 'سُجّل الوصول' when 'in_session' then 'بدأت الجلسة' when 'done' then 'انتهت الجلسة' else 'سُجّلت لم تحضر' end;
    elsif a.kind = 'send_confirmation' then
      if coalesce(pl->>'channel', 'app') = 'app' then
        perform public.send_app_confirmation((pl->>'appointment_id')::uuid, coalesce(nullif(pl->>'confirm_kind', ''), 'confirm'), nullif(v_text, ''));
        v_res := 'أُرسل التأكيد عبر التطبيق';
      else
        -- SMS (edge function staff-sms) / WhatsApp (wa.me) are sent by the app right after this approval.
        if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
        if v_text = '' then raise exception 'empty message'; end if;
        pl := pl || jsonb_build_object('client_send', true);
        v_res := case when pl->>'channel' = 'sms' then 'جارٍ إرسال الرسالة النصية' else 'افتحي واتساب للإرسال' end;
      end if;

    /* ---------- client file, stock, staff ---------- */
    elsif a.kind = 'update_patient' then
      if not private.has_role('{admin,reception,specialist}') then raise exception 'not allowed'; end if;
      v_pid := (pl->>'patient_id')::uuid;
      update public.patients set
        name = case when pl->'fields' ? 'name' and btrim(pl->'fields'->>'name') <> '' then btrim(pl->'fields'->>'name') else name end,
        phone = case when pl->'fields' ? 'phone' then nullif(btrim(pl->'fields'->>'phone'), '') else phone end,
        birth_date = case when pl->'fields' ? 'birth_date' then nullif(pl->'fields'->>'birth_date', '')::date else birth_date end,
        skin_type = case when pl->'fields' ? 'skin_type' then nullif(btrim(pl->'fields'->>'skin_type'), '') else skin_type end,
        pregnant = case when pl->'fields' ? 'pregnant' then (pl->'fields'->>'pregnant')::boolean else pregnant end,
        breastfeeding = case when pl->'fields' ? 'breastfeeding' then (pl->'fields'->>'breastfeeding')::boolean else breastfeeding end,
        notes = case when pl->'fields' ? 'notes' then nullif(btrim(pl->'fields'->>'notes'), '') else notes end,
        vip = case when pl->'fields' ? 'vip' then (pl->'fields'->>'vip')::boolean else vip end
       where id = v_pid;
      if not found then raise exception 'unknown patient'; end if;
      v_res := 'تم تحديث الملف';
    elsif a.kind = 'set_service_level' then
      perform public.set_patient_service_level((pl->>'patient_id')::uuid, pl->>'service_key', nullif(pl->>'level_id', '')::uuid);
      v_res := 'تم ضبط المستوى';
    elsif a.kind = 'adjust_stock' then
      perform public.adjust_stock(pl->>'product_key', (pl->>'counted')::numeric, coalesce(nullif(pl->>'note', ''), 'جرد عبر مرايتي'));
      v_res := 'تم تعديل المخزون';
    else
      raise exception 'unknown kind';
    end if;
  exception when others then
    update public.maraiti_actions set status = 'failed', result = sqlerrm, payload = pl, decided_at = now() where id = p_id returning * into a;
    return a;
  end;
  update public.maraiti_actions set status = 'approved', result = v_res, payload = pl, decided_at = now() where id = p_id returning * into a;
  return a;
end $$;
revoke all on function public.maraiti_decide(uuid, text, jsonb) from public, anon;
grant execute on function public.maraiti_decide(uuid, text, jsonb) to authenticated;
