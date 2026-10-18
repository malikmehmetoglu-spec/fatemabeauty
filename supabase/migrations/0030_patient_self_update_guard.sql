-- Applied as «patient_self_update_guard»: a patient may edit her profile but never points, file number, phone or account link.
create or replace function private.guard_patient_self_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_staff() or auth.uid() is null then return new; end if;
  if new.points is distinct from old.points or new.file_no is distinct from old.file_no
     or new.phone is distinct from old.phone or new.user_id is distinct from old.user_id then
    raise exception 'not allowed';
  end if;
  return new;
end $$;
create trigger patients_self_update_guard before update on public.patients
  for each row execute function private.guard_patient_self_update();
