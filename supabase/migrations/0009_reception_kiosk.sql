-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «reception_kiosk».
-- Reception tablet: eligibility answers, session photos, private storage for consents & photos.
alter table public.appointments add column if not exists eligibility jsonb;
alter table public.appointments add column if not exists eligibility_at timestamptz;

create table if not exists public.patient_photos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  path text not null,
  angle text not null default 'front',
  stage text not null default 'before' check (stage in ('before', 'after', 'progress')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists patient_photos_patient_idx on public.patient_photos (patient_id);
create index if not exists patient_photos_appointment_idx on public.patient_photos (appointment_id);
alter table public.patient_photos enable row level security;
create policy "staff manages photos" on public.patient_photos for all to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));
create policy "own photos read" on public.patient_photos for select to authenticated
  using (patient_id = (select private.my_patient_id()));

alter table public.consents add column if not exists appointment_id uuid references public.appointments(id) on delete set null;

insert into storage.buckets (id, name, public) values ('consents', 'consents', false), ('photos', 'photos', false)
  on conflict (id) do update set public = false;

create policy "kiosk files staff read" on storage.objects for select to authenticated
  using (bucket_id in ('consents', 'photos') and (select private.is_staff()));
create policy "kiosk files staff insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('consents', 'photos') and (select private.is_staff()));
create policy "kiosk files staff update" on storage.objects for update to authenticated
  using (bucket_id in ('consents', 'photos') and (select private.is_staff()));
-- files are stored as <patient_id>/<file>; a patient may read her own
create policy "kiosk files own read" on storage.objects for select to authenticated
  using (bucket_id in ('consents', 'photos') and (storage.foldername(name))[1] = (select private.my_patient_id())::text);

insert into public.settings (key, value) values ('tv_content', '{"tips": [], "interval_s": 12}') on conflict (key) do nothing;
