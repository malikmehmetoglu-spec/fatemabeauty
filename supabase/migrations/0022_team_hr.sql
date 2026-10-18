-- Applied as «team_hr».
-- Team: owner protection, shifts, attendance, leave, payroll, commissions, staff photos.

-- Only the owner may create/promote admins or owners; nobody but the owner touches the owner row.
create or replace function private.guard_staff() returns trigger
language plpgsql security definer set search_path = '' as $$
declare me_owner boolean;
begin
  if coalesce(auth.role(), '') = 'service_role' or auth.uid() is null then return coalesce(new, old); end if;
  me_owner := exists (select 1 from public.staff s where s.user_id = auth.uid() and s.active and s.role = 'owner');
  if me_owner then return coalesce(new, old); end if;
  if tg_op in ('UPDATE','DELETE') and old.role = 'owner' then raise exception 'only the owner can modify the owner'; end if;
  if tg_op = 'INSERT' and new.role in ('owner','admin') then raise exception 'only the owner can create admins'; end if;
  if tg_op = 'UPDATE' and new.role in ('owner','admin') and old.role <> new.role then raise exception 'only the owner can grant admin'; end if;
  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then raise exception 'login links are managed by the staff-admin function'; end if;
  return coalesce(new, old);
end $$;
revoke execute on function private.guard_staff() from public, anon, authenticated;
create trigger staff_guard before insert or update or delete on public.staff for each row execute function private.guard_staff();

alter table public.staff add column if not exists username text unique;

create or replace function private.my_staff_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select s.id from public.staff s where s.user_id = auth.uid() and s.active limit 1;
$$;
revoke execute on function private.my_staff_id() from public, anon;
grant execute on function private.my_staff_id() to authenticated;

create table public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  day date not null,
  starts time not null,
  ends time not null,
  room_id uuid references public.rooms(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now(),
  check (ends > starts)
);
create index on public.staff_shifts (day);
create index on public.staff_shifts (staff_id);
create index on public.staff_shifts (room_id);
alter table public.staff_shifts enable row level security;
create policy "staff read" on public.staff_shifts for select to authenticated using ((select private.is_staff()));
create policy "admin manages" on public.staff_shifts for all to authenticated using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

create table public.staff_attendance (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  day date not null default (now() at time zone 'Asia/Damascus')::date,
  check_in timestamptz,
  check_out timestamptz,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (staff_id, day)
);
create index on public.staff_attendance (day);
alter table public.staff_attendance enable row level security;
create policy "own or managers read" on public.staff_attendance for select to authenticated
  using (staff_id = (select private.my_staff_id()) or (select private.has_role('{admin,accountant}')));
create policy "admin manages" on public.staff_attendance for all to authenticated using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

-- Self check-in / check-out for the signed-in staff member (Damascus day).
create or replace function public.attendance_punch(p_kind text) returns public.staff_attendance
language plpgsql security definer set search_path = '' as $$
declare sid uuid := private.my_staff_id(); d date := (now() at time zone 'Asia/Damascus')::date; rec public.staff_attendance;
begin
  if sid is null then raise exception 'not staff'; end if;
  if p_kind = 'in' then
    insert into public.staff_attendance (staff_id, day, check_in) values (sid, d, now())
      on conflict (staff_id, day) do update set check_in = coalesce(public.staff_attendance.check_in, excluded.check_in)
      returning * into rec;
  elsif p_kind = 'out' then
    update public.staff_attendance set check_out = now() where staff_id = sid and day = d and check_in is not null returning * into rec;
    if not found then raise exception 'no check-in today'; end if;
  else raise exception 'bad kind'; end if;
  return rec;
end $$;
revoke execute on function public.attendance_punch(text) from public, anon;
grant execute on function public.attendance_punch(text) to authenticated;

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  starts date not null,
  ends date not null,
  kind text not null default 'annual' check (kind in ('annual','sick','unpaid','other')),
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by uuid references public.staff(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends >= starts)
);
create index on public.leave_requests (staff_id);
create index on public.leave_requests (decided_by);
alter table public.leave_requests enable row level security;
create policy "own or admin read" on public.leave_requests for select to authenticated
  using (staff_id = (select private.my_staff_id()) or (select private.has_role('{admin,accountant}')));
create policy "own request" on public.leave_requests for insert to authenticated
  with check (staff_id = (select private.my_staff_id()) and status = 'pending' and decided_by is null);
create policy "admin manages" on public.leave_requests for all to authenticated using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

create table public.payroll_entries (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  period text not null check (period ~ '^\d{4}-\d{2}$'),
  base_salary integer not null default 0 check (base_salary >= 0),
  commission integer not null default 0 check (commission >= 0),
  bonus integer not null default 0 check (bonus >= 0),
  deductions integer not null default 0 check (deductions >= 0),
  paid_at timestamptz,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (staff_id, period)
);
alter table public.payroll_entries enable row level security;
create policy "own or accounts read" on public.payroll_entries for select to authenticated
  using (staff_id = (select private.my_staff_id()) or (select private.has_role('{admin,accountant}')));
create policy "accounts manage" on public.payroll_entries for all to authenticated using ((select private.has_role('{admin,accountant}'))) with check ((select private.has_role('{admin,accountant}')));

create table public.commission_rules (
  staff_id uuid primary key references public.staff(id) on delete cascade,
  percent numeric(5,2) not null check (percent >= 0 and percent <= 100),
  note text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.commission_rules enable row level security;
create policy "own or accounts read" on public.commission_rules for select to authenticated
  using (staff_id = (select private.my_staff_id()) or (select private.has_role('{admin,accountant}')));
create policy "accounts manage" on public.commission_rules for all to authenticated using ((select private.has_role('{admin,accountant}'))) with check ((select private.has_role('{admin,accountant}')));

-- Public bucket for staff photos (admins upload).
insert into storage.buckets (id, name, public) values ('staff', 'staff', true) on conflict (id) do nothing;
create policy "staff photos admin write" on storage.objects for insert to authenticated with check (bucket_id = 'staff' and (select private.has_role('{admin}')));
create policy "staff photos admin update" on storage.objects for update to authenticated using (bucket_id = 'staff' and (select private.has_role('{admin}')));
create policy "staff photos admin delete" on storage.objects for delete to authenticated using (bucket_id = 'staff' and (select private.has_role('{admin}')));
