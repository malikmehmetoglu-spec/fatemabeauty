-- 0184 — No appointment without a phone number (owner rule).
-- BEFORE INSERT on appointments, after appointments_link_patient (trigger names fire alphabetically):
-- the client's file must have a phone, or a valid Syrian walk-in phone must be given (it is then saved to her file if empty).
create or replace function private.appointments_require_phone() returns trigger
language plpgsql security definer set search_path = '' as $$
declare ph text := private.norm_phone_sy(new.walk_in_phone); file_phone text;
begin
  if new.patient_id is not null then
    select phone into file_phone from public.patients where id = new.patient_id;
    if file_phone is null and ph is not null then
      begin
        update public.patients set phone = ph where id = new.patient_id and phone is null;
      exception when others then null; -- e.g. the number already belongs to another file: still a valid contact
      end;
      file_phone := ph;
    end if;
  end if;
  if coalesce(file_phone, ph) is null then
    raise exception 'رقم هاتف العميلة إلزامي للحجز. أضيفي رقماً صحيحاً (09…) ثم أعيدي المحاولة.';
  end if;
  return new;
end $$;
create or replace trigger appointments_require_phone before insert on public.appointments
  for each row execute function private.appointments_require_phone();
