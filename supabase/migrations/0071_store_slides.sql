-- Store home hero slides (managed in admin «واجهة المتجر») + best-seller ranking for the store.
create table if not exists public.store_slides (
  id uuid primary key default gen_random_uuid(),
  image_path text,
  eyebrow text not null default '',
  title text not null,
  body text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  cta2_label text not null default '',
  cta2_href text not null default '',
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.store_slides enable row level security;

create policy "slides public read active" on public.store_slides for select to anon, authenticated
  using (active or (select private.has_role('{admin,reception}')));
create policy "slides staff insert" on public.store_slides for insert to authenticated
  with check ((select private.has_role('{admin,reception}')));
create policy "slides staff update" on public.store_slides for update to authenticated
  using ((select private.has_role('{admin,reception}'))) with check ((select private.has_role('{admin,reception}')));
create policy "slides staff delete" on public.store_slides for delete to authenticated
  using ((select private.has_role('{admin,reception}')));

grant select on public.store_slides to anon, authenticated;
grant insert, update, delete on public.store_slides to authenticated;

-- Product keys of visible store items ranked by units sold (no quantities exposed).
create or replace function public.store_bestsellers(p_limit integer default 8)
returns setof text
language sql stable security definer set search_path = ''
as $$
  select oi.product_key
  from public.order_items oi
  join public.orders o on o.id = oi.order_id and o.status <> 'cancelled'
  join public.products p on p.key = oi.product_key and p.active and p.kind = 'retail' and p.show_in_store
  group by oi.product_key
  order by sum(oi.qty) desc, oi.product_key
  limit least(greatest(coalesce(p_limit, 8), 1), 24);
$$;
revoke all on function public.store_bestsellers(integer) from public;
grant execute on function public.store_bestsellers(integer) to anon, authenticated;
