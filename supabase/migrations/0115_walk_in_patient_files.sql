-- 0115 — Every client booked by staff gets a patient file (shows in «المراجعات»).
-- When an appointment or invoice is inserted with walk_in_name (+ optional walk_in_phone) and no patient_id,
-- a BEFORE INSERT trigger finds the patient by the normalised phone (+963 9XXXXXXXX, same rule as public_book)
-- or opens a new file (source 'reception'), and sets patient_id. walk_in_* columns are kept for history.
-- Existing patient with a different name: her name is kept, the typed name goes to the note («الاسم المُدخل: …»).
-- No phone (or an unusable one): a name-only file is opened.
-- Invoices for an appointment take that appointment's patient first.
-- Kiosk walk-in / quick-book open files client-side (ensurePatient) and now tag them source 'kiosk'.
-- Non-destructive: new functions + triggers, one-off backfill of rows with walk_in_name and no patient_id.

create or replace function private.norm_phone_sy(p text) returns text
language sql immutable set search_path = '' as $$
  select case when d ~ '^9[0-9]{8}$' then '+963' || d end
  from (select regexp_replace(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '^(00963|963|0)', '') as d) x
$$;

-- Returns the patient id and, when the file already had another name, the note prefix to add.
create or replace function private.walk_in_patient(p_name text, p_phone text, p_source text,
  out patient_id uuid, out name_note text)
language plpgsql security definer set search_path = '' as $$
declare nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        ph text := private.norm_phone_sy(p_phone); old_name text;
begin
  if nm = '' and ph is null then return; end if;
  if ph is not null then
    perform pg_advisory_xact_lock(hashtext('walk-in-patient:' || ph));
    select id, name into patient_id, old_name from public.patients where phone = ph order by created_at limit 1;
    if patient_id is not null then
      if coalesce(btrim(old_name), '') = '' and nm <> '' then
        update public.patients set name = nm where id = patient_id;
      elsif nm <> '' and lower(btrim(old_name)) <> lower(nm) then
        name_note := 'الاسم المُدخل: ' || nm;
      end if;
      return;
    end if;
  end if;
  insert into public.patients (name, phone, source) values (nm, ph, p_source) returning id into patient_id;
end $$;
revoke all on function private.walk_in_patient(text, text, text) from public, anon, authenticated;

create or replace function private.appointments_link_patient() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  if new.patient_id is null and (nullif(btrim(coalesce(new.walk_in_name, '')), '') is not null
                                 or private.norm_phone_sy(new.walk_in_phone) is not null) then
    select * into r from private.walk_in_patient(new.walk_in_name, new.walk_in_phone, 'reception');
    new.patient_id := r.patient_id;
    if r.name_note is not null then new.note := r.name_note || coalesce(' — ' || nullif(btrim(new.note), ''), ''); end if;
  end if;
  return new;
end $$;

create or replace function private.invoices_link_patient() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  if new.patient_id is null and new.appointment_id is not null then
    select a.patient_id into new.patient_id from public.appointments a where a.id = new.appointment_id;
  end if;
  if new.patient_id is null and nullif(btrim(coalesce(new.walk_in_name, '')), '') is not null then
    select * into r from private.walk_in_patient(new.walk_in_name, null, 'reception');
    new.patient_id := r.patient_id;
  end if;
  return new;
end $$;

create or replace trigger appointments_link_patient before insert on public.appointments
  for each row execute function private.appointments_link_patient();
create or replace trigger invoices_link_patient before insert on public.invoices
  for each row execute function private.invoices_link_patient();

-- Backfill (once).
do $$
declare a record; r record;
begin
  for a in select id, walk_in_name, walk_in_phone, note from public.appointments
           where patient_id is null and (nullif(btrim(coalesce(walk_in_name, '')), '') is not null
                                         or private.norm_phone_sy(walk_in_phone) is not null)
           order by created_at loop
    select * into r from private.walk_in_patient(a.walk_in_name, a.walk_in_phone, 'reception');
    update public.appointments set patient_id = r.patient_id,
      note = case when r.name_note is null then note else r.name_note || coalesce(' — ' || nullif(btrim(note), ''), '') end
    where id = a.id;
  end loop;
  update public.invoices i set patient_id = ap.patient_id from public.appointments ap
   where i.patient_id is null and i.appointment_id = ap.id and ap.patient_id is not null;
  for a in select id, walk_in_name from public.invoices
           where patient_id is null and nullif(btrim(coalesce(walk_in_name, '')), '') is not null order by created_at loop
    select * into r from private.walk_in_patient(a.walk_in_name, null, 'reception');
    update public.invoices set patient_id = r.patient_id where id = a.id;
  end loop;
end $$;
