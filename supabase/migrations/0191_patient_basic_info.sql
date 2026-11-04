-- Basic (non-medical) patient info: gender, marital status, city/address, occupation, referral, emergency phone.
-- Reception with 'patients' may edit these and birth_date; medical fields (skin_type, pregnant, breastfeeding, notes) stay patients_medical.
alter table public.patients
  add column if not exists gender text not null default 'female' check (gender in ('female','male')),
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists occupation text,
  add column if not exists referral text,
  add column if not exists emergency_phone text,
  add column if not exists marital_status text check (marital_status in ('single','married','divorced','widowed'));

create or replace function private.guard_reception_patient_update()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if not coalesce(private.perm_override('patients_medical'), not private.is_reception()) and (
       new.skin_type     is distinct from old.skin_type
    or new.pregnant      is distinct from old.pregnant
    or new.breastfeeding is distinct from old.breastfeeding
    or new.notes         is distinct from old.notes
    or new.points        is distinct from old.points
    or new.vip           is distinct from old.vip
    or new.user_id       is distinct from old.user_id
    or new.file_no       is distinct from old.file_no) then
    raise exception 'صلاحياتكِ تسمح بتعديل البيانات الأساسية فقط';
  end if;
  return new;
end $function$;
