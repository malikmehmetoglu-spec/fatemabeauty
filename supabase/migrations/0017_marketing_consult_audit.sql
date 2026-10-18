-- Applied as «marketing_consult_audit»: offers, campaign drafts, surveys, gift requests, chat messages,
-- loyalty settings defaults, and audit triggers on appointments/invoices/products/staff/patients.

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  title text not null,
  kind text not null default 'percent' check (kind in ('percent','amount')),
  value int not null check (value >= 0),
  service_key text references public.services(key),
  max_uses int check (max_uses > 0),
  uses int not null default 0,
  starts_on date,
  ends_on date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.offers enable row level security;
create policy "active readable" on public.offers for select to authenticated using (active or (select private.is_staff()));
create policy "admin manages" on public.offers for all to authenticated using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  audience text not null default 'all',
  channel text not null default 'app',
  status text not null default 'draft' check (status in ('draft')),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create policy "admin manages" on public.campaigns for all to authenticated using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  answers jsonb not null default '{}',
  note text,
  created_at timestamptz not null default now()
);
alter table public.surveys enable row level security;
create policy "own or staff read" on public.surveys for select to authenticated using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "own writes" on public.surveys for insert to authenticated with check (patient_id = (select private.my_patient_id()));

create table public.gift_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recipient_name text not null,
  recipient_phone text,
  amount int check (amount > 0),
  service_key text references public.services(key),
  message text,
  status text not null default 'requested' check (status in ('requested','paid','delivered','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.gift_requests enable row level security;
create policy "own or staff read" on public.gift_requests for select to authenticated using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "own requests" on public.gift_requests for insert to authenticated with check (patient_id = (select private.my_patient_id()) and status = 'requested');
create policy "staff updates" on public.gift_requests for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  from_patient boolean not null,
  staff_id uuid references public.staff(id),
  body text not null check (length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_patient_idx on public.messages (patient_id, created_at);
alter table public.messages enable row level security;
create policy "own or staff read" on public.messages for select to authenticated using (patient_id = (select private.my_patient_id()) or (select private.is_staff()));
create policy "patient sends" on public.messages for insert to authenticated with check (patient_id = (select private.my_patient_id()) and from_patient and staff_id is null);
create policy "staff writes" on public.messages for insert to authenticated with check ((select private.is_staff()) and not from_patient);
create policy "staff marks read" on public.messages for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
alter publication supabase_realtime add table public.messages;

insert into public.settings (key, value) values
  ('loyalty', '{"points_per": 1000, "points_value": 0, "tiers": [{"name":"فضية","min":0},{"name":"ذهبية","min":500},{"name":"ماسية","min":1500}]}')
on conflict (key) do nothing;

create or replace function private.audit_row() returns trigger
language plpgsql security definer set search_path = '' as $$
declare rid text; changed text[];
begin
  if tg_op = 'DELETE' then rid := to_jsonb(old)->>(case when tg_table_name = 'products' then 'key' else 'id' end);
  else rid := to_jsonb(new)->>(case when tg_table_name = 'products' then 'key' else 'id' end); end if;
  if tg_op = 'UPDATE' then
    select array_agg(n.key) into changed from jsonb_each(to_jsonb(new)) n
      where n.value is distinct from (to_jsonb(old) -> n.key) and n.key not in ('updated_at');
    if changed is null then return new; end if;
  end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), lower(tg_op), tg_table_name || ':' || coalesce(rid, ''),
          case when tg_op = 'UPDATE' then jsonb_build_object('changed', changed) else null end);
  return coalesce(new, old);
end $$;
revoke execute on function private.audit_row() from public, anon, authenticated;

create trigger audit_appointments after insert or update or delete on public.appointments for each row execute function private.audit_row();
create trigger audit_invoices after insert or update or delete on public.invoices for each row execute function private.audit_row();
create trigger audit_products after insert or update or delete on public.products for each row execute function private.audit_row();
create trigger audit_staff after insert or update or delete on public.staff for each row execute function private.audit_row();
create trigger audit_patients after insert or update or delete on public.patients for each row execute function private.audit_row();
