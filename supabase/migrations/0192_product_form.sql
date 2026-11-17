-- Product form overhaul: barcode, company (required in the form), optional supplier, Arabic description under the
-- English name, size unit ml/g (stock is always counted in pieces), and a managed category list.
alter table public.products
  add column if not exists barcode text,
  add column if not exists company text not null default '',
  add column if not exists supplier text,
  add column if not exists name_ar text not null default '',
  add column if not exists size_unit text not null default 'ml';
do $$ begin
  alter table public.products add constraint products_size_unit_chk check (size_unit in ('ml','g'));
exception when duplicate_object then null; end $$;
create unique index if not exists products_barcode_key on public.products (barcode) where barcode is not null and barcode <> '';
update public.products set size_unit = 'g' where size ~ '(غ|غرام|g)\s*$';

create table if not exists public.product_categories (
  name text primary key check (length(btrim(name)) > 0),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.product_categories enable row level security;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select on public.product_categories to anon;
drop policy if exists "categories readable" on public.product_categories;
create policy "categories readable" on public.product_categories for select to anon, authenticated
  using (coalesce((select private.perm_override_any(array['store','inventory','cashier'])), (select private.is_staff_full())));
drop policy if exists "categories managed" on public.product_categories;
create policy "categories managed" on public.product_categories for all to authenticated
  using (coalesce((select private.perm_override_any(array['store','inventory'])), (select private.has_role('{admin}'::staff_role[]))))
  with check (coalesce((select private.perm_override_any(array['store','inventory'])), (select private.has_role('{admin}'::staff_role[]))));

-- seed with the short category names already in use (long ones were descriptions typed in the category box)
insert into public.product_categories (name)
select distinct btrim(category) from public.products where btrim(category) <> '' and length(btrim(category)) <= 22
on conflict do nothing;
