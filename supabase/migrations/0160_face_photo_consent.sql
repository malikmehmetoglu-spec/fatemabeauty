-- Privacy policy: before/after photos only in consultations (services.is_consultation), face only,
-- and only after an explicit photo consent (consents.kind = 'photo'). A declined photo consent is
-- recorded as kind = 'photo_declined'. Existing photo rows are untouched (trigger runs on insert only).
alter table public.consents add column if not exists kind text not null default 'treatment';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'consents_kind_check') then
    alter table public.consents add constraint consents_kind_check check (kind in ('treatment','photo','photo_declined'));
  end if;
end $$;

create index if not exists consents_patient_kind_idx on public.consents (patient_id, kind, signed_at desc);

create or replace function private.photo_insert_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_consult boolean; v_kind text;
begin
  if new.appointment_id is null then
    raise exception 'لا يمكن حفظ الصور إلا ضمن موعد استشارة' using errcode = 'P0001';
  end if;
  select s.is_consultation into v_consult
    from public.appointments a join public.services s on s.key = a.service_key
   where a.id = new.appointment_id and a.patient_id = new.patient_id;
  if not coalesce(v_consult, false) then
    raise exception 'التصوير مسموح في الاستشارات فقط — جلسات العناية بلا صور' using errcode = 'P0001';
  end if;
  select c.kind into v_kind from public.consents c
   where c.patient_id = new.patient_id and c.kind in ('photo','photo_declined')
   order by c.signed_at desc limit 1;
  if v_kind is distinct from 'photo' then
    raise exception 'لا يمكن التصوير قبل توقيع موافقة التصوير' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function private.photo_insert_guard() from public, anon, authenticated;

create or replace trigger patient_photos_policy_guard before insert on public.patient_photos
  for each row execute function private.photo_insert_guard();
