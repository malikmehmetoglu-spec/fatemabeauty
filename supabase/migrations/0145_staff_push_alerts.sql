-- Staff-only push alerts for Mira: hand-offs and urgent cases reach chosen staff phones (admin app only).

-- Devices that opted in from the admin app, one row per browser push subscription.
create table if not exists public.staff_push_subs (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  endpoint text not null unique,
  sub jsonb not null,
  device text,
  created_at timestamptz not null default now(),
  last_ok_at timestamptz
);
alter table public.staff_push_subs enable row level security;
create policy "staff own devices" on public.staff_push_subs for all to authenticated
  using (staff_id = (select private.my_staff_id())) with check (staff_id = (select private.my_staff_id()));
grant select, insert, update, delete on public.staff_push_subs to authenticated;
grant all on public.staff_push_subs to service_role;

-- The server's VAPID key pair, created on first use by the «staff-push» function. Never exposed through the API.
create table if not exists private.vapid (
  id int primary key default 1 check (id = 1),
  keys jsonb not null,
  public_key text not null,
  created_at timestamptz not null default now()
);
grant all on private.vapid to service_role;
grant usage on schema private to service_role;

-- Reminder bookkeeping for handed-over conversations.
alter table public.mira_threads add column if not exists notified_at timestamptz;
alter table public.mira_threads add column if not exists notify_count int not null default 0;
alter table public.mira_threads add column if not exists escalated boolean not null default false;

-- Who gets alerts: Fatema (the consultant) by default; escalation list empty until chosen.
update public.settings set value = value
  || jsonb_build_object('alert_staff', coalesce((select jsonb_agg(id) from public.staff where is_consultant and active), '[]'::jsonb))
  || jsonb_build_object('escalate_staff', '[]'::jsonb)
  where key = 'mira' and not (value ? 'alert_staff');

-- Every 5 minutes: remind about urgent cases still waiting, escalate after an hour.
select cron.schedule('mira-alerts-sweep', '*/5 * * * *',
  $$ select net.http_post(url := 'https://btcyrzvaexmgffeamlmg.supabase.co/functions/v1/staff-push', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{"action":"sweep"}'::jsonb); $$);

-- Applied as «vapid_rpc»: the private schema is not exposed, so the function reads/writes the keys through these.
create or replace function public.vapid_get() returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('keys', keys, 'public_key', public_key) from private.vapid where id = 1;
$$;
create or replace function public.vapid_set(p_keys jsonb, p_public text) returns void language sql security definer set search_path = '' as $$
  insert into private.vapid (id, keys, public_key) values (1, p_keys, p_public) on conflict (id) do nothing;
$$;
revoke all on function public.vapid_get() from public, anon, authenticated;
revoke all on function public.vapid_set(jsonb, text) from public, anon, authenticated;
grant execute on function public.vapid_get() to service_role;
grant execute on function public.vapid_set(jsonb, text) to service_role;
