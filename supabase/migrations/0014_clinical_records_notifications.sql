-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «clinical_records_notifications».
alter table public.patients add column if not exists notify jsonb not null default '{"reminders":true,"offers":true,"results":true}';
alter table public.session_notes add column if not exists fields jsonb not null default '{}';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  kind text not null default 'info',
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_patient_idx on public.notifications (patient_id, created_at desc);
alter table public.notifications enable row level security;
create policy "own read" on public.notifications for select to authenticated using (patient_id = (select private.my_patient_id()));
create policy "own marks read" on public.notifications for update to authenticated using (patient_id = (select private.my_patient_id())) with check (patient_id = (select private.my_patient_id()));
create policy "staff manages" on public.notifications for all to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create index if not exists session_notes_patient_idx on public.session_notes (patient_id);
create index if not exists prescriptions_patient_idx on public.prescriptions (patient_id);
create index if not exists consents_patient_idx on public.consents (patient_id);

insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict (id) do nothing;
