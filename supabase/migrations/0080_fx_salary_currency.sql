-- Applied as «fx_salary_currency» (+ «fx_set_rate_refresh», «fx_set_rate_clock»: final set_usd_rate below).
-- Exchange rate (USD → SYP) with history, salary currency per member, payroll frozen in SYP.
-- Finance reports read paid payroll entries (amount_syp, frozen) as the «رواتب» line.

-- ---------- exchange rate ----------
create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  usd_to_syp integer not null check (usd_to_syp > 0),
  effective_at timestamptz not null default now(),
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists exchange_rates_effective_idx on public.exchange_rates (effective_at desc);
create index if not exists exchange_rates_created_by_idx on public.exchange_rates (created_by);
alter table public.exchange_rates enable row level security;
create policy "staff read" on public.exchange_rates for select to authenticated using ((select private.is_staff()));
create policy "accounts add" on public.exchange_rates for insert to authenticated with check ((select private.has_role('{admin,accountant}')));

create or replace function private.current_usd_rate() returns integer
language sql stable security definer set search_path = '' as $$
  select r.usd_to_syp from public.exchange_rates r order by r.effective_at desc, r.created_at desc limit 1;
$$;
revoke execute on function private.current_usd_rate() from public, anon;
grant execute on function private.current_usd_rate() to authenticated;

create or replace function public.set_usd_rate(p_rate integer, p_note text default '') returns public.exchange_rates
language plpgsql security invoker set search_path = '' as $$
declare rec public.exchange_rates;
begin
  if p_rate is null or p_rate <= 0 then raise exception 'سعر الصرف يجب أن يكون رقماً أكبر من صفر'; end if;
  insert into public.exchange_rates (usd_to_syp, note, effective_at, created_at) values (p_rate, coalesce(trim(p_note), ''), clock_timestamp(), clock_timestamp()) returning * into rec;
  -- unpaid dollar salaries follow the new rate (the payroll_fx trigger recomputes them); paid ones stay frozen
  update public.payroll_entries set fx_rate = p_rate where currency = 'USD' and paid_at is null;
  return rec;
end $$;
revoke execute on function public.set_usd_rate(integer, text) from public, anon;
grant execute on function public.set_usd_rate(integer, text) to authenticated;

-- ---------- salary per member (separate table: the staff table is readable by the whole team) ----------
create table if not exists public.staff_salaries (
  staff_id uuid primary key references public.staff(id) on delete cascade,
  base_salary integer not null default 0 check (base_salary >= 0),
  salary_currency text not null default 'SYP' check (salary_currency in ('SYP','USD')),
  updated_at timestamptz not null default now()
);
alter table public.staff_salaries enable row level security;
create policy "own or accounts read" on public.staff_salaries for select to authenticated
  using (staff_id = (select private.my_staff_id()) or (select private.has_role('{admin,accountant}')));
create policy "accounts manage" on public.staff_salaries for all to authenticated
  using ((select private.has_role('{admin,accountant}'))) with check ((select private.has_role('{admin,accountant}')));

-- ---------- payroll: currency, original amount, rate, frozen SYP ----------
alter table public.payroll_entries
  add column if not exists currency text not null default 'SYP' check (currency in ('SYP','USD')),
  add column if not exists amount_original integer check (amount_original >= 0),
  add column if not exists fx_rate integer check (fx_rate > 0);
alter table public.payroll_entries
  add column if not exists amount_syp integer generated always as (base_salary + commission + bonus - deductions) stored;

-- base_salary is always the SYP value of the base. For USD it is amount_original × fx_rate, where fx_rate is the
-- current rate while the entry is unpaid and stays frozen once it is paid.
create or replace function private.payroll_fx() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r integer;
begin
  if new.currency = 'USD' then
    if new.amount_original is null then raise exception 'اكتبي الراتب بالدولار'; end if;
    if tg_op = 'UPDATE' and old.paid_at is not null and new.paid_at is not null and old.currency = 'USD' then
      r := old.fx_rate;
    else
      r := private.current_usd_rate();
      if r is null then raise exception 'لم يُحدَّد سعر الصرف بعد — حدّديه من المالية ← سعر الصرف'; end if;
    end if;
    new.fx_rate := r;
    new.base_salary := new.amount_original * r;
  else
    new.fx_rate := null;
    if new.amount_original is null or (tg_op = 'UPDATE' and new.base_salary is distinct from old.base_salary and new.amount_original is not distinct from old.amount_original) then
      new.amount_original := new.base_salary;
    end if;
    new.base_salary := new.amount_original;
  end if;
  return new;
end $$;
revoke execute on function private.payroll_fx() from public, anon, authenticated;
create or replace trigger payroll_fx before insert or update on public.payroll_entries for each row execute function private.payroll_fx();

-- ---------- «fx_numeric_source»: new Syrian pound → rate with 2 decimals (e.g. 141.75), source for the auto feed ----------
-- The hourly sp-today feed (Edge Function, service role) calls:
--   select public.set_exchange_rate(<sell rate>, 'sp-today', 'sp-today');
-- A manual entry from the app uses source 'manual'; the latest row (any source) is the current rate.
alter table public.exchange_rates alter column usd_to_syp type numeric(12,2);
alter table public.exchange_rates add column if not exists source text not null default 'manual' check (source in ('manual','sp-today'));
alter table public.payroll_entries alter column fx_rate type numeric(12,2);

create or replace function private.usd_rate() returns numeric
language sql stable security definer set search_path = '' as $$
  select r.usd_to_syp from public.exchange_rates r order by r.effective_at desc, r.created_at desc limit 1;
$$;
revoke execute on function private.usd_rate() from public, anon;
grant execute on function private.usd_rate() to authenticated, service_role;

create or replace function private.payroll_fx() returns trigger
language plpgsql security definer set search_path = '' as $$
declare r numeric;
begin
  if new.currency = 'USD' then
    if new.amount_original is null then raise exception 'اكتبي الراتب بالدولار'; end if;
    if tg_op = 'UPDATE' and old.paid_at is not null and new.paid_at is not null and old.currency = 'USD' then
      r := old.fx_rate;
    else
      r := private.usd_rate();
      if r is null then raise exception 'لم يُحدَّد سعر الصرف بعد — حدّديه من المالية ← سعر الصرف'; end if;
    end if;
    new.fx_rate := r;
    new.base_salary := round(new.amount_original * r)::integer;
  else
    new.fx_rate := null;
    if new.amount_original is null or (tg_op = 'UPDATE' and new.base_salary is distinct from old.base_salary and new.amount_original is not distinct from old.amount_original) then
      new.amount_original := new.base_salary;
    end if;
    new.base_salary := new.amount_original;
  end if;
  return new;
end $$;

create or replace function public.set_exchange_rate(p_rate numeric, p_note text default '', p_source text default 'manual') returns public.exchange_rates
language plpgsql security invoker set search_path = '' as $$
declare rec public.exchange_rates;
begin
  if p_rate is null or p_rate <= 0 then raise exception 'سعر الصرف يجب أن يكون رقماً أكبر من صفر'; end if;
  insert into public.exchange_rates (usd_to_syp, note, source, effective_at, created_at)
    values (round(p_rate, 2), coalesce(trim(p_note), ''), coalesce(p_source, 'manual'), clock_timestamp(), clock_timestamp()) returning * into rec;
  update public.payroll_entries set fx_rate = rec.usd_to_syp where currency = 'USD' and paid_at is null;
  return rec;
end $$;
revoke execute on function public.set_exchange_rate(numeric, text, text) from public, anon;
grant execute on function public.set_exchange_rate(numeric, text, text) to authenticated, service_role;

-- legacy integer versions (kept; DROP needs owner confirmation) delegate to the numeric ones
create or replace function private.current_usd_rate() returns integer
language sql stable security definer set search_path = '' as $$ select round(private.usd_rate())::integer $$;
create or replace function public.set_usd_rate(p_rate integer, p_note text default '') returns public.exchange_rates
language sql security invoker set search_path = '' as $$ select public.set_exchange_rate(p_rate::numeric, p_note, 'manual') $$;
