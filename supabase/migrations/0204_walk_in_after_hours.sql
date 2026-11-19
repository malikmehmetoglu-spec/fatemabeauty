-- 2026-11-19: arrivals (walk-ins and checked-in visits) may be booked after the last-start time (17:00 / per-service).
create or replace function private.appointments_booking_rules()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare b text; ls time; m int; arrival boolean;
begin
  if new.status in ('cancelled', 'no_show') then return new; end if;
  if tg_op = 'UPDATE' and new.starts_at = old.starts_at and new.specialist_id is not distinct from old.specialist_id
     and new.service_key is not distinct from old.service_key then return new; end if;
  arrival := new.source = 'walk_in' or new.status in ('checked_in', 'in_session', 'done');
  b := private.booking_rule_block(new.starts_at, new.specialist_id);
  if b = 'closed_day' then raise exception 'المركز مغلق يوم الجمعة — لا يمكن حجز موعد.'; end if;
  if b = 'after_last' and not arrival then raise exception 'آخر موعد يمكن حجزه الساعة 5:00 مساءً.'; end if;
  if b = 'consultant_off' then raise exception 'يوم الثلاثاء عطلة الاستشارية — اختاري يوماً آخر.'; end if;
  if arrival then return new; end if;
  select s.last_start into ls from public.services s where s.key = new.service_key;
  if ls is not null and (new.starts_at at time zone 'Asia/Damascus')::time > ls then
    m := extract(hour from ls)::int;
    raise exception 'آخر موعد لهذه الجلسة الساعة %:% مساءً.', case when m > 12 then m - 12 else m end, to_char(ls, 'MI');
  end if;
  return new;
end $function$;
