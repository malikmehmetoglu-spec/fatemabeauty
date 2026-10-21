-- «ميرا»: the clinic's AI assistant answers patient chat, books, and hands over to Fatema when needed.

-- Who wrote each message. Existing rows: patient or staff.
alter table public.messages add column if not exists author text;
update public.messages set author = case when from_patient then 'patient' else 'staff' end where author is null;
alter table public.messages alter column author set default 'patient';
alter table public.messages alter column author set not null;
alter table public.messages drop constraint if exists messages_author_check;
alter table public.messages add constraint messages_author_check check (author in ('patient','staff','mira'));
-- Staff inserts keep working unchanged: a non-patient row without an explicit author is a staff reply.
create or replace function private.message_author() returns trigger language plpgsql set search_path = '' as $$
begin
  if not new.from_patient and new.author = 'patient' then new.author := 'staff'; end if;
  if new.from_patient then new.author := 'patient'; end if;
  return new;
end $$;
drop trigger if exists messages_author on public.messages;
create trigger messages_author before insert on public.messages for each row execute function private.message_author();

-- One row per patient conversation: is Mira handling it, or has it been handed to Fatema?
create table if not exists public.mira_threads (
  patient_id uuid primary key references public.patients(id) on delete cascade,
  status text not null default 'mira' check (status in ('mira','fatema')),
  urgent boolean not null default false,
  reason text,
  summary text,
  handoff_at timestamptz,
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.mira_threads enable row level security;
create policy "own or staff read" on public.mira_threads for select to authenticated
  using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "staff updates" on public.mira_threads for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Replies Mira wrote while in «draft» mode, waiting for Fatema or reception to approve.
create table if not exists public.mira_drafts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending','sent','discarded')),
  decided_by uuid references public.staff(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mira_drafts_pending_idx on public.mira_drafts (status, created_at);
alter table public.mira_drafts enable row level security;
create policy "staff read" on public.mira_drafts for select to authenticated using ((select private.is_staff()));
create policy "staff decides" on public.mira_drafts for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Fatema's own answers to frequent questions, in her words. Mira quotes these instead of improvising.
create table if not exists public.mira_kb (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  active boolean not null default true,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.mira_kb enable row level security;
create policy "staff read" on public.mira_kb for select to authenticated using ((select private.is_staff()));
create policy "admin manages" on public.mira_kb for all to authenticated
  using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

insert into public.settings (key, value) values
  ('mira', '{"enabled": true, "mode": "draft", "model": "claude-haiku-5-5", "address": ""}')
on conflict (key) do nothing;

insert into public.mira_kb (question, answer, sort) values
  ('متى أستطيع وضع المكياج بعد الجلسة؟', 'يفضّل الانتظار 24 ساعة بعد جلسات التنظيف والتقشير قبل وضع المكياج، حتى ترتاح البشرة.', 1),
  ('هل يمكنني التعرّض للشمس بعد التقشير؟', 'تجنّبي الشمس المباشرة 48 ساعة على الأقل، واستعملي واقي الشمس يومياً.', 2),
  ('ما الفرق بين الاستشارة والمراجعة؟', 'الاستشارة هي أول جلسة تشخيص مع أ. فاطمة لوضع خطة لبشرتكِ، والمراجعة متابعة لاحقة لنرى التحسّن ونعدّل الروتين.', 3),
  ('هل يمكنني إلغاء أو تغيير موعدي؟', 'نعم، من التطبيق أو بطلب مني هنا. يُفضّل الإلغاء قبل 6 ساعات على الأقل من الموعد.', 4)
on conflict do nothing;

alter publication supabase_realtime add table public.mira_threads;
alter publication supabase_realtime add table public.mira_drafts;

-- New tables need explicit grants (docs/DATA.md). Applied as «mira_grants».
grant select, update on public.mira_threads to authenticated;
grant select, update on public.mira_drafts to authenticated;
grant select, insert, update, delete on public.mira_kb to authenticated;
grant all on public.mira_threads, public.mira_drafts, public.mira_kb to service_role;
