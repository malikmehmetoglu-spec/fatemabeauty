-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «core_schema».

create extension if not exists pgcrypto;

create type public.staff_role as enum ('admin', 'specialist', 'reception', 'accountant');
create type public.appointment_status as enum ('pending', 'confirmed', 'checked_in', 'in_session', 'done', 'no_show', 'cancelled');
create type public.pay_method as enum ('cash', 'card', 'package', 'points');
create type public.order_status as enum ('new', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  title text not null default '',
  role public.staff_role not null,
  phone text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence public.patient_file_no start 1001;
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  file_no int not null unique default nextval('public.patient_file_no'),
  name text not null default '',
  phone text unique,
  birth_date date,
  skin_type text,
  pregnant boolean not null default false,
  breastfeeding boolean not null default false,
  notes text,
  points int not null default 0,
  lang text not null default 'ar',
  created_at timestamptz not null default now()
);

create table public.patient_conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  kind text not null check (kind in ('allergy', 'medication', 'concern')),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort int not null default 0,
  active boolean not null default true
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  room_id uuid references public.rooms(id),
  in_maintenance boolean not null default false,
  sessions_count int not null default 0,
  next_service_at date
);

create table public.services (
  key text primary key,
  name text not null,
  short_name text not null,
  description text not null default '',
  price int not null check (price >= 0),
  price_from boolean not null default false,
  minutes int not null check (minutes > 0),
  room_id uuid references public.rooms(id),
  device_id uuid references public.devices(id),
  bookable_online boolean not null default true,
  active boolean not null default true,
  sort int not null default 0
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  service_key text not null references public.services(key),
  name text not null,
  sessions int not null check (sessions > 0),
  price int not null check (price >= 0),
  active boolean not null default true
);

create table public.patient_packages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  sessions_total int not null,
  sessions_used int not null default 0,
  price_paid int not null default 0,
  purchased_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  walk_in_name text,
  walk_in_phone text,
  service_key text not null references public.services(key),
  specialist_id uuid references public.staff(id),
  room_id uuid references public.rooms(id),
  starts_at timestamptz not null,
  minutes int not null,
  status public.appointment_status not null default 'confirmed',
  price int not null default 0,
  pay_method public.pay_method,
  patient_package_id uuid references public.patient_packages(id),
  queue_no int,
  queue_day date,
  checked_in_at timestamptz,
  called_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  cancel_reason text,
  source text not null default 'app' check (source in ('app', 'reception', 'walk_in', 'admin')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (queue_day, queue_no)
);
create index appointments_starts_at_idx on public.appointments (starts_at);
create index appointments_patient_idx on public.appointments (patient_id);

create or replace function public.assign_queue_no() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'checked_in' and new.queue_no is null then
    new.queue_day := (coalesce(new.checked_in_at, now()) at time zone 'Asia/Damascus')::date;
    new.checked_in_at := coalesce(new.checked_in_at, now());
    perform pg_advisory_xact_lock(hashtext('queue' || new.queue_day::text));
    select coalesce(max(queue_no), 0) + 1 into new.queue_no from public.appointments where queue_day = new.queue_day;
  end if;
  return new;
end $$;
create trigger appointments_queue before insert or update of status on public.appointments
  for each row execute function public.assign_queue_no();

create sequence public.invoice_seq;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  no text not null unique default ('INV-' || to_char(now() at time zone 'Asia/Damascus', 'MMDD') || '-' || lpad(nextval('public.invoice_seq')::text, 4, '0')),
  patient_id uuid references public.patients(id),
  appointment_id uuid references public.appointments(id),
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  method public.pay_method not null default 'cash',
  paid boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  label text not null,
  qty int not null default 1,
  unit_price int not null
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  label text not null,
  amount int not null,
  spent_on date not null default (now() at time zone 'Asia/Damascus')::date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.products (
  key text primary key,
  name text not null,
  size text not null default '',
  category text not null,
  price int check (price >= 0),
  stock int not null default 0,
  visible boolean not null default true,
  recommended boolean not null default false,
  sort int not null default 0
);

create sequence public.order_seq start 2001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  no int not null unique default nextval('public.order_seq'),
  patient_id uuid references public.patients(id),
  delivery boolean not null default false,
  address text,
  status public.order_status not null default 'new',
  total int not null default 0,
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_key text not null references public.products(key),
  qty int not null check (qty > 0),
  unit_price int not null
);

create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid references public.staff(id),
  body text not null,
  created_at timestamptz not null default now()
);
create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid references public.staff(id),
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  service_key text references public.services(key),
  answers jsonb not null default '{}',
  signature_path text,
  signed_at timestamptz not null default now()
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  stars int not null check (stars between 1 and 5),
  tags text[] not null default '{}',
  note text,
  created_at timestamptz not null default now()
);

create table public.app_installs (
  device_id text primary key,
  patient_id uuid references public.patients(id) on delete set null,
  platform text not null check (platform in ('android', 'ios', 'desktop', 'other')),
  channel text not null check (channel in ('web', 'play_store', 'app_store')),
  installed_at timestamptz not null default now(),
  last_open_at timestamptz not null default now(),
  opens int not null default 1
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid references auth.users(id),
  action text not null,
  target text,
  details jsonb,
  created_at timestamptz not null default now()
);
