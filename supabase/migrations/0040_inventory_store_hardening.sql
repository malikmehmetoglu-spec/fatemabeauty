-- Applied as «inventory_store_hardening» (+ «inventory_cancel_order_idempotent» for the final cancel_order below).
-- Inventory + store: stock only through movements, never negative, batches always match stock (FEFO with
-- returns going back to the batch they came from), order status guard, store catalogue without cost/min_stock.

-- ---------- columns / constraints ----------
alter table public.stock_batches add column if not exists source text not null default 'receive'
  check (source in ('receive', 'adjust', 'return'));
alter table public.stock_batches add constraint stock_batches_qty_left_range check (qty_left >= 0 and qty_left <= qty_received);
alter table public.stock_batches add constraint stock_batches_unit_cost_check check (unit_cost is null or unit_cost >= 0);
alter table public.products add constraint products_stock_nonneg check (stock >= 0);
alter table public.products add constraint products_min_stock_nonneg check (min_stock >= 0);
alter table public.orders add column if not exists updated_at timestamptz not null default now();

-- Which batch each outgoing movement was taken from (positive qty) or given back to (negative qty).
create table if not exists public.stock_batch_takes (
  movement_id bigint not null references public.stock_movements(id) on delete cascade,
  batch_id uuid not null references public.stock_batches(id) on delete cascade,
  qty numeric(12,2) not null check (qty <> 0),
  primary key (movement_id, batch_id)
);
create index if not exists stock_batch_takes_batch on public.stock_batch_takes (batch_id);
alter table public.stock_batch_takes enable row level security;
create policy "inventory staff read" on public.stock_batch_takes for select to authenticated using ((select private.is_staff()));
revoke insert, update, delete, truncate on public.stock_batch_takes from anon, authenticated;

-- ---------- stock only changes through stock_movements ----------
create or replace function private.guard_product_stock() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce(current_setting('fb.stock_move', true), '') = '1' then return new; end if;
  if tg_op = 'INSERT' and coalesce(new.stock, 0) <> 0 then raise exception 'stock changes only through stock movements'; end if;
  if tg_op = 'UPDATE' and new.stock is distinct from old.stock then raise exception 'stock changes only through stock movements'; end if;
  return new;
end $$;
create or replace trigger products_stock_guard before insert or update of stock on public.products
  for each row execute function private.guard_product_stock();

-- An item with sales/orders/session use cannot be deleted (archive it instead): the history would be lost.
create or replace function private.guard_product_delete() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.stock_movements m where m.product_key = old.key and m.reason in ('sale', 'order', 'session'))
     or exists (select 1 from public.order_items i where i.product_key = old.key) then
    raise exception 'item has sales history; archive it instead';
  end if;
  return old;
end $$;
create or replace trigger products_delete_guard before delete on public.products
  for each row execute function private.guard_product_delete();

create or replace function private.apply_stock_movement() returns trigger
language plpgsql security definer set search_path = '' as $$
declare need numeric; back numeric; b record; t record; take numeric; cur numeric; pname text;
begin
  perform set_config('fb.stock_move', '1', true);
  update public.products set stock = stock + new.delta, updated_at = now() where key = new.product_key returning stock, name into cur, pname;
  perform set_config('fb.stock_move', '', true);
  if cur is null then raise exception 'unknown product'; end if;
  if cur < 0 then raise exception 'out of stock: %', pname; end if;

  if new.delta < 0 then
    need := -new.delta;
    -- writing off a specific batch (expired / damaged) takes from that batch first
    if new.reason = 'waste' and new.ref_id is not null then
      for b in select id, qty_left from public.stock_batches where id = new.ref_id and product_key = new.product_key and qty_left > 0 for update loop
        take := least(b.qty_left, need);
        update public.stock_batches set qty_left = qty_left - take where id = b.id;
        insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, b.id, take);
        need := need - take;
      end loop;
    end if;
    -- FEFO: nearest expiry first, then oldest receipt
    for b in select id, qty_left from public.stock_batches
             where product_key = new.product_key and qty_left > 0
             order by expires_on nulls last, received_at for update loop
      exit when need <= 0;
      take := least(b.qty_left, need);
      update public.stock_batches set qty_left = qty_left - take where id = b.id;
      insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, b.id, take)
        on conflict (movement_id, batch_id) do update set qty = public.stock_batch_takes.qty + excluded.qty;
      need := need - take;
    end loop;
  elsif new.delta > 0 and new.reason <> 'receive' then
    back := new.delta;
    -- a return goes back to the batches the same order/invoice took from
    if new.ref_id is not null then
      for t in select k.batch_id, sum(k.qty) as net, max(sb.expires_on) as exp
               from public.stock_batch_takes k
               join public.stock_movements m on m.id = k.movement_id
               join public.stock_batches sb on sb.id = k.batch_id
               where m.product_key = new.product_key and m.ref_id = new.ref_id and m.id <> new.id
               group by k.batch_id having sum(k.qty) > 0
               order by max(sb.expires_on) desc nulls first loop
        exit when back <= 0;
        take := least(t.net, back);
        update public.stock_batches set qty_left = qty_left + take where id = t.batch_id;
        insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, t.batch_id, -take);
        back := back - take;
      end loop;
    end if;
    -- anything else (stocktake found more) becomes a batch without expiry, so batches always add up to the stock
    if back > 0 then
      insert into public.stock_batches (product_key, qty_received, qty_left, source, created_by)
      values (new.product_key, back, back, case when new.reason = 'return' then 'return' else 'adjust' end, new.created_by);
    end if;
  end if;
  return new;
end $$;

-- ---------- functions ----------
create or replace function public.receive_stock(p_product text, p_qty numeric, p_expires date default null, p_unit_cost int default null, p_supplier text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare bid uuid; p public.products;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  if p_unit_cost is not null and p_unit_cost < 0 then raise exception 'cost must not be negative'; end if;
  if p_expires is not null and p_expires < (now() at time zone 'Asia/Damascus')::date then raise exception 'batch already expired'; end if;
  select * into p from public.products where key = p_product for update;
  if p.key is null or not p.active then raise exception 'unknown product'; end if;
  insert into public.stock_batches (product_key, qty_received, qty_left, expires_on, unit_cost, supplier, created_by, source)
  values (p_product, p_qty, p_qty, p_expires, p_unit_cost, nullif(trim(p_supplier), ''), auth.uid(), 'receive') returning id into bid;
  insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (p_product, p_qty, 'receive', bid, auth.uid());
  if p_unit_cost is not null then update public.products set cost = p_unit_cost where key = p_product; end if;
end $$;

create or replace function public.adjust_stock(p_product text, p_counted numeric, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur numeric;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_counted is null or p_counted < 0 then raise exception 'counted quantity must not be negative'; end if;
  select stock into cur from public.products where key = p_product for update;
  if cur is null then raise exception 'unknown product'; end if;
  if p_counted <> cur then
    insert into public.stock_movements (product_key, delta, reason, note, created_by) values (p_product, p_counted - cur, 'adjust', nullif(trim(p_note), ''), auth.uid());
  end if;
end $$;

-- Write off a quantity (expired / damaged). With p_batch it is taken from that batch first.
create or replace function public.waste_stock(p_product text, p_qty numeric, p_batch uuid default null, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur numeric;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  select stock into cur from public.products where key = p_product for update;
  if cur is null then raise exception 'unknown product'; end if;
  if p_batch is not null and not exists (select 1 from public.stock_batches where id = p_batch and product_key = p_product) then raise exception 'unknown batch'; end if;
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by) values (p_product, -p_qty, 'waste', p_batch, nullif(trim(p_note), ''), auth.uid());
end $$;

create or replace function public.place_order(p_items jsonb, p_delivery boolean, p_address text default null)
returns public.orders language plpgsql security definer set search_path = '' as $$
declare pid uuid; o public.orders; it record; p public.products; q int; sum_total int := 0;
begin
  select id into pid from public.patients where user_id = auth.uid();
  if pid is null then raise exception 'sign in first'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'empty order'; end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'too many items'; end if;
  if coalesce(p_delivery, false) and coalesce(trim(p_address), '') = '' then raise exception 'address required'; end if;
  perform set_config('fb.order_fn', '1', true);
  insert into public.orders (patient_id, delivery, address)
  values (pid, coalesce(p_delivery, false), case when coalesce(p_delivery, false) then trim(p_address) end) returning * into o;
  -- same product twice is merged; rows are locked in key order so two orders never deadlock
  for it in select e->>'product_key' as k, sum(case when (e->>'qty') ~ '^[0-9]{1,4}$' then (e->>'qty')::int else -1 end) as qty,
                   bool_or(not coalesce((e->>'qty') ~ '^[0-9]{1,4}$', false)) as bad
            from jsonb_array_elements(p_items) e group by 1 order by 1 loop
    if it.bad or it.qty <= 0 then raise exception 'bad quantity'; end if;
    q := it.qty;
    select * into p from public.products where key = it.k for update;
    if p.key is null or not p.active or p.kind <> 'retail' or not p.show_in_store or p.price is null then raise exception 'unavailable: %', coalesce(p.name, '?'); end if;
    if p.stock < q then raise exception 'out of stock: %', p.name; end if;
    insert into public.order_items (order_id, product_key, name, qty, unit_price) values (o.id, p.key, p.name, q, p.price);
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (p.key, -q, 'order', o.id, auth.uid());
    sum_total := sum_total + q * p.price;
  end loop;
  update public.orders set total = sum_total where id = o.id returning * into o;
  perform set_config('fb.order_fn', '', true);
  return o;
end $$;

create or replace function public.cancel_order(p_order uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare o public.orders; it record;
begin
  select * into o from public.orders where id = p_order for update;
  if o.id is null then raise exception 'unknown order'; end if;
  if o.status = 'cancelled' and (private.has_role('{admin,reception}') or o.patient_id = private.my_patient_id()) then return; end if;
  if not (private.has_role('{admin,reception}') or (o.patient_id = private.my_patient_id() and o.status = 'new')) then raise exception 'not allowed'; end if;
  if o.status = 'delivered' then raise exception 'order already delivered'; end if;
  for it in select product_key, sum(qty) as qty from public.order_items where order_id = o.id group by product_key order by product_key loop
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by) values (it.product_key, it.qty, 'return', o.id, auth.uid());
  end loop;
  perform set_config('fb.order_fn', '1', true);
  update public.orders set status = 'cancelled' where id = o.id;
  perform set_config('fb.order_fn', '', true);
end $$;

-- Staff move orders forward on the board; cancelling (stock return) and totals only through the functions.
create or replace function private.guard_order_update() returns trigger
language plpgsql set search_path = '' as $$
declare fn boolean := coalesce(current_setting('fb.order_fn', true), '') = '1';
begin
  if not fn and (new.total is distinct from old.total or new.patient_id is distinct from old.patient_id
                 or new.no is distinct from old.no or new.created_at is distinct from old.created_at or new.delivery is distinct from old.delivery) then
    raise exception 'order totals and owner cannot be edited';
  end if;
  if new.status is distinct from old.status then
    if old.status in ('cancelled', 'delivered') then raise exception 'order is closed'; end if;
    if new.status = 'cancelled' and not fn then raise exception 'use cancel_order'; end if;
    if new.status = 'new' then raise exception 'bad status'; end if;
    if (new.status = 'ready' and old.delivery) or (new.status = 'out_for_delivery' and not old.delivery) then raise exception 'bad status'; end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
create or replace trigger orders_guard before update on public.orders for each row execute function private.guard_order_update();

-- Orders: written only through place_order / cancel_order (+ status by staff); items never edited directly.
revoke insert, delete, truncate on public.orders from anon, authenticated;
revoke insert, update, delete, truncate on public.order_items from anon, authenticated;
alter policy "staff writes" on public.orders using ((select private.has_role('{admin,reception}'))) with check ((select private.has_role('{admin,reception}')));
-- stock tables: no direct writes at all
revoke insert, update, delete, truncate on public.stock_batches, public.stock_movements from anon, authenticated;

-- ---------- store catalogue: the products table is staff-only, visitors read this function ----------
alter policy "catalogue readable" on public.products using ((select private.is_staff()));

create or replace function public.store_products(p_keys text[] default null)
returns setof public.products language plpgsql stable security definer set search_path = '' as $$
declare p public.products;
begin
  for p in select * from public.products
           where active and kind = 'retail' and show_in_store and (p_keys is null or key = any(p_keys))
           order by sort, name loop
    p.cost := null; p.min_stock := 0; p.sku := null;
    return next p;
  end loop;
end $$;
revoke execute on function public.store_products(text[]) from public;
grant execute on function public.store_products(text[]) to anon, authenticated;

revoke execute on function public.waste_stock(text, numeric, uuid, text) from public, anon;
grant execute on function public.waste_stock(text, numeric, uuid, text) to authenticated;
revoke execute on function public.receive_stock(text, numeric, date, int, text), public.adjust_stock(text, numeric, text),
  public.place_order(jsonb, boolean, text), public.cancel_order(uuid) from public, anon;
grant execute on function public.receive_stock(text, numeric, date, int, text), public.adjust_stock(text, numeric, text),
  public.place_order(jsonb, boolean, text), public.cancel_order(uuid) to authenticated;

-- ---------- product images: only roles that manage products, images only, 5 MB ----------
update storage.buckets set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'], file_size_limit = 5242880
  where id = 'products';
alter policy "product images staff write" on storage.objects
  with check (bucket_id = 'products' and (select private.has_role('{admin,reception}')));
alter policy "product images staff update" on storage.objects
  using (bucket_id = 'products' and (select private.has_role('{admin,reception}')));
alter policy "product images staff delete" on storage.objects
  using (bucket_id = 'products' and (select private.has_role('{admin,reception}')));
create policy "product images staff read" on storage.objects for select to authenticated
  using (bucket_id = 'products' and (select private.is_staff()));
