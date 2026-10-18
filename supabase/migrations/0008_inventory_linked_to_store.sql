-- Applied as «inventory_linked_to_store».

-- One inventory for the whole centre. Retail items appear in the store automatically unless hidden.
alter table public.products alter column key set default gen_random_uuid()::text;
alter table public.products rename column visible to show_in_store;
alter table public.products alter column stock type numeric(12,2);
alter table public.products
  add column kind text not null default 'retail' check (kind in ('retail', 'consumable')),
  add column unit text not null default 'قطعة',
  add column sku text unique,
  add column description text not null default '',
  add column usage text not null default '',
  add column cost int check (cost >= 0),
  add column min_stock numeric(12,2) not null default 0,
  add column image_path text,
  add column active boolean not null default true,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now();
alter table public.products alter column category set default '';
alter table public.order_items add column name text not null default '';

create table public.stock_batches (
  id uuid primary key default gen_random_uuid(),
  product_key text not null references public.products(key) on delete cascade,
  qty_received numeric(12,2) not null check (qty_received > 0),
  qty_left numeric(12,2) not null,
  expires_on date,
  unit_cost int,
  supplier text,
  received_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index stock_batches_fefo on public.stock_batches (product_key, expires_on nulls last, received_at);

create table public.stock_movements (
  id bigint generated always as identity primary key,
  product_key text not null references public.products(key) on delete cascade,
  delta numeric(12,2) not null,
  reason text not null check (reason in ('receive', 'sale', 'order', 'session', 'adjust', 'return', 'waste')),
  ref_id uuid,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function private.apply_stock_movement() returns trigger
language plpgsql security definer set search_path = '' as $$
declare need numeric := -new.delta; b record; take numeric;
begin
  update public.products set stock = stock + new.delta, updated_at = now() where key = new.product_key;
  if new.delta < 0 then
    for b in select id, qty_left from public.stock_batches
             where product_key = new.product_key and qty_left > 0
             order by expires_on nulls last, received_at loop
      exit when need <= 0;
      take := least(b.qty_left, need);
      update public.stock_batches set qty_left = qty_left - take where id = b.id;
      need := need - take;
    end loop;
  end if;
  return new;
end $$;
create trigger stock_movements_apply after insert on public.stock_movements
  for each row execute function private.apply_stock_movement();

-- ---------- RLS ----------
alter policy "catalogue readable" on public.products
  using ((active and kind = 'retail' and show_in_store) or (select private.is_staff()));
alter table public.stock_batches enable row level security;
alter table public.stock_movements enable row level security;
create policy "inventory staff" on public.stock_batches for select to authenticated using ((select private.is_staff()));
create policy "inventory staff read" on public.stock_movements for select to authenticated using ((select private.is_staff()));

-- ---------- functions ----------
create or replace function public.receive_stock(p_product text, p_qty numeric, p_expires date default null, p_unit_cost int default null, p_supplier text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare bid uuid;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  insert into public.stock_batches (product_key, qty_received, qty_left, expires_on, unit_cost, supplier, created_by)
  values (p_product, p_qty, p_qty, p_expires, p_unit_cost, nullif(p_supplier, ''), auth.uid()) returning id into bid;
  insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (p_product, p_qty, 'receive', bid, auth.uid());
end $$;

create or replace function public.adjust_stock(p_product text, p_counted numeric, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur numeric;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  select stock into cur from public.products where key = p_product for update;
  if cur is null then raise exception 'unknown product'; end if;
  if p_counted <> cur then
    insert into public.stock_movements (product_key, delta, reason, note, created_by) values (p_product, p_counted - cur, 'adjust', p_note, auth.uid());
  end if;
end $$;

create or replace function public.place_order(p_items jsonb, p_delivery boolean, p_address text default null)
returns public.orders language plpgsql security definer set search_path = '' as $$
declare pid uuid; o public.orders; it jsonb; p public.products; q int; sum_total int := 0;
begin
  select id into pid from public.patients where user_id = auth.uid();
  if pid is null then raise exception 'sign in first'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'empty order'; end if;
  insert into public.orders (patient_id, delivery, address) values (pid, coalesce(p_delivery, false), nullif(p_address, '')) returning * into o;
  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'qty')::int;
    select * into p from public.products where key = it->>'product_key' for update;
    if p.key is null or not p.active or p.kind <> 'retail' or not p.show_in_store or p.price is null then raise exception 'unavailable: %', coalesce(p.name, '?'); end if;
    if q is null or q <= 0 then raise exception 'bad quantity'; end if;
    if p.stock < q then raise exception 'out of stock: %', p.name; end if;
    insert into public.order_items (order_id, product_key, name, qty, unit_price) values (o.id, p.key, p.name, q, p.price);
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (p.key, -q, 'order', o.id, auth.uid());
    sum_total := sum_total + q * p.price;
  end loop;
  update public.orders set total = sum_total where id = o.id returning * into o;
  return o;
end $$;

create or replace function public.cancel_order(p_order uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare o public.orders; it record;
begin
  select * into o from public.orders where id = p_order for update;
  if o.id is null then raise exception 'unknown order'; end if;
  if not (private.is_staff() or (o.patient_id = private.my_patient_id() and o.status = 'new')) then raise exception 'not allowed'; end if;
  if o.status = 'cancelled' then return; end if;
  for it in select product_key, qty from public.order_items where order_id = o.id loop
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (it.product_key, it.qty, 'return', o.id, auth.uid());
  end loop;
  update public.orders set status = 'cancelled' where id = o.id;
end $$;

revoke execute on function public.receive_stock(text, numeric, date, int, text), public.adjust_stock(text, numeric, text),
  public.place_order(jsonb, boolean, text), public.cancel_order(uuid) from public, anon;
grant execute on function public.receive_stock(text, numeric, date, int, text), public.adjust_stock(text, numeric, text),
  public.place_order(jsonb, boolean, text), public.cancel_order(uuid) to authenticated;

insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
create policy "product images staff write" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and (select private.is_staff()));
create policy "product images staff update" on storage.objects for update to authenticated
  using (bucket_id = 'products' and (select private.is_staff()));
create policy "product images staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and (select private.is_staff()));
