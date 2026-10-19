-- 0072 — Multi-location inventory (مستودع / محل / مركز).
-- Stock lives in batches; every batch now belongs to a location. products.stock stays the TOTAL of all
-- locations and still changes only through stock_movements (guard trigger unchanged).
-- The online store sells only from locations with sells_online = true; cashier sales and clinic use
-- default to the location flagged is_default_center.

-- ---------- locations ----------
create table if not exists public.stock_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 60),
  kind text not null default 'center' check (kind in ('warehouse', 'shop', 'center')),
  note text not null default '',
  sells_online boolean not null default false,
  is_default_center boolean not null default false,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists stock_locations_one_default on public.stock_locations (is_default_center) where is_default_center;
create unique index if not exists stock_locations_name_uq on public.stock_locations (lower(trim(name)));
alter table public.stock_locations enable row level security;
create policy "staff read locations" on public.stock_locations for select to authenticated using ((select private.is_staff()));
create policy "admin deletes empty locations" on public.stock_locations for delete to authenticated using ((select private.has_role('{admin}')) and not is_default_center);
grant select, delete on public.stock_locations to authenticated;
revoke insert, update on public.stock_locations from anon, authenticated;

insert into public.stock_locations (name, kind, sells_online, is_default_center, sort)
select 'المركز', 'center', true, true, 0
where not exists (select 1 from public.stock_locations where is_default_center);

create or replace function private.default_location() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.stock_locations where is_default_center limit 1
$$;
revoke all on function private.default_location() from public, anon;

-- ---------- batches & movements carry the location ----------
alter table public.stock_batches add column if not exists location_id uuid references public.stock_locations(id) on delete restrict;
alter table public.stock_movements add column if not exists location_id uuid references public.stock_locations(id) on delete restrict;
update public.stock_batches set location_id = private.default_location() where location_id is null;
update public.stock_movements set location_id = private.default_location() where location_id is null and reason not in ('order', 'return');
alter table public.stock_batches alter column location_id set not null;
create index if not exists stock_batches_loc_idx on public.stock_batches (location_id, product_key) where qty_left > 0;
create index if not exists stock_movements_loc_idx on public.stock_movements (location_id);

alter table public.stock_batches drop constraint if exists stock_batches_source_check;
alter table public.stock_batches add constraint stock_batches_source_check check (source in ('receive', 'adjust', 'return', 'transfer'));
alter table public.stock_movements drop constraint if exists stock_movements_reason_check;
alter table public.stock_movements add constraint stock_movements_reason_check
  check (reason in ('receive', 'sale', 'order', 'session', 'adjust', 'return', 'waste', 'transfer'));

-- Movements without a location act on the default centre location, except store orders (online pool)
-- and returns (they go back to the exact batches they came from).
create or replace function private.stock_movement_location() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.location_id is null and new.reason not in ('order', 'return') then
    new.location_id := private.default_location();
    if new.location_id is null then raise exception 'no default location'; end if;
  end if;
  return new;
end $$;
revoke all on function private.stock_movement_location() from public, anon, authenticated;
create trigger stock_movements_location before insert on public.stock_movements for each row execute function private.stock_movement_location();

-- The movement trigger: FEFO inside the movement's location (or the online pool for store orders).
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
    if new.reason = 'waste' and new.ref_id is not null then
      for b in select id, qty_left from public.stock_batches where id = new.ref_id and product_key = new.product_key and qty_left > 0
               and (new.location_id is null or location_id = new.location_id) for update loop
        take := least(b.qty_left, need);
        update public.stock_batches set qty_left = qty_left - take where id = b.id;
        insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, b.id, take);
        need := need - take;
      end loop;
    end if;
    for b in select sb.id, sb.qty_left from public.stock_batches sb
             where sb.product_key = new.product_key and sb.qty_left > 0
               and case when new.location_id is not null then sb.location_id = new.location_id
                        else sb.location_id in (select l.id from public.stock_locations l where l.sells_online and l.active) end
             order by sb.expires_on nulls last, sb.received_at for update of sb loop
      exit when need <= 0;
      take := least(b.qty_left, need);
      update public.stock_batches set qty_left = qty_left - take where id = b.id;
      insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, b.id, take)
        on conflict (movement_id, batch_id) do update set qty = public.stock_batch_takes.qty + excluded.qty;
      need := need - take;
    end loop;
    if need > 0 then raise exception 'out of stock: %', pname; end if;
  elsif new.delta > 0 and new.reason not in ('receive', 'transfer') then
    back := new.delta;
    if new.ref_id is not null then
      for t in select k.batch_id, sum(k.qty) as net, max(sb.expires_on) as exp
               from public.stock_batch_takes k
               join public.stock_movements m on m.id = k.movement_id
               join public.stock_batches sb on sb.id = k.batch_id
               where m.product_key = new.product_key and m.ref_id = new.ref_id and m.id <> new.id and m.reason <> 'transfer'
               group by k.batch_id having sum(k.qty) > 0
               order by max(sb.expires_on) desc nulls first loop
        exit when back <= 0;
        take := least(t.net, back);
        update public.stock_batches set qty_left = qty_left + take where id = t.batch_id;
        insert into public.stock_batch_takes (movement_id, batch_id, qty) values (new.id, t.batch_id, -take);
        back := back - take;
      end loop;
    end if;
    if back > 0 then
      insert into public.stock_batches (product_key, qty_received, qty_left, source, created_by, location_id)
      values (new.product_key, back, back, case when new.reason = 'return' then 'return' else 'adjust' end, new.created_by,
              coalesce(new.location_id, private.default_location()));
    end if;
  end if;
  return new;
end $$;

-- ---------- helpers ----------
/* units of a product available to the online store */
create or replace function private.online_qty(p_product text) returns numeric
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(b.qty_left), 0) from public.stock_batches b
  join public.stock_locations l on l.id = b.location_id and l.sells_online and l.active
  where b.product_key = p_product
$$;
revoke all on function private.online_qty(text) from public, anon;

create or replace function private.location_qty(p_product text, p_location uuid) returns numeric
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(qty_left), 0) from public.stock_batches where product_key = p_product and location_id = p_location
$$;
revoke all on function private.location_qty(text, uuid) from public, anon;

create or replace function private.check_location(p_location uuid, p_need_active boolean default true) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare l public.stock_locations;
begin
  if p_location is null then p_location := private.default_location(); end if;
  select * into l from public.stock_locations where id = p_location;
  if l.id is null then raise exception 'unknown location'; end if;
  if p_need_active and not l.active then raise exception 'location inactive'; end if;
  return l.id;
end $$;
revoke all on function private.check_location(uuid, boolean) from public, anon;

-- ---------- locations management ----------
create or replace function public.save_stock_location(
  p_id uuid, p_name text, p_kind text, p_note text default '', p_sells_online boolean default false,
  p_is_default boolean default false, p_active boolean default true, p_sort integer default 0)
returns public.stock_locations
language plpgsql security definer set search_path = '' as $$
declare l public.stock_locations; old public.stock_locations;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'location name required'; end if;
  if p_kind not in ('warehouse', 'shop', 'center') then raise exception 'bad location kind'; end if;
  if exists (select 1 from public.stock_locations where lower(trim(name)) = lower(trim(p_name)) and id is distinct from p_id) then
    raise exception 'location name taken';
  end if;
  if p_id is not null then
    select * into old from public.stock_locations where id = p_id for update;
    if old.id is null then raise exception 'unknown location'; end if;
    if old.is_default_center and not coalesce(p_is_default, false) then raise exception 'choose another default first'; end if;
    if not coalesce(p_active, true) then
      if old.is_default_center or coalesce(p_is_default, false) then raise exception 'default location must stay active'; end if;
      if exists (select 1 from public.stock_batches where location_id = p_id and qty_left > 0) then raise exception 'location has stock'; end if;
    end if;
  elsif not coalesce(p_active, true) then
    raise exception 'bad location';
  end if;
  if coalesce(p_is_default, false) then
    update public.stock_locations set is_default_center = false where is_default_center and id is distinct from p_id;
  end if;
  if p_id is null then
    insert into public.stock_locations (name, kind, note, sells_online, is_default_center, active, sort)
    values (trim(p_name), p_kind, coalesce(trim(p_note), ''), coalesce(p_sells_online, false), coalesce(p_is_default, false), true, coalesce(p_sort, 0))
    returning * into l;
  else
    update public.stock_locations set name = trim(p_name), kind = p_kind, note = coalesce(trim(p_note), ''),
      sells_online = coalesce(p_sells_online, false), is_default_center = coalesce(p_is_default, false),
      active = coalesce(p_active, true), sort = coalesce(p_sort, sort)
    where id = p_id returning * into l;
  end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), case when p_id is null then 'location.create' else 'location.update' end, l.name,
          jsonb_build_object('kind', l.kind, 'sells_online', l.sells_online, 'default', l.is_default_center, 'active', l.active));
  return l;
end $$;
revoke all on function public.save_stock_location(uuid, text, text, text, boolean, boolean, boolean, integer) from public, anon;
grant execute on function public.save_stock_location(uuid, text, text, text, boolean, boolean, boolean, integer) to authenticated;

-- ---------- stock operations at a location ----------
create or replace function public.receive_stock_at(p_product text, p_qty numeric, p_location uuid default null,
  p_expires date default null, p_unit_cost integer default null, p_supplier text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare bid uuid; p public.products; loc uuid;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  if p_unit_cost is not null and p_unit_cost < 0 then raise exception 'cost must not be negative'; end if;
  if p_expires is not null and p_expires < (now() at time zone 'Asia/Damascus')::date then raise exception 'batch already expired'; end if;
  loc := private.check_location(p_location);
  select * into p from public.products where key = p_product for update;
  if p.key is null or not p.active then raise exception 'unknown product'; end if;
  insert into public.stock_batches (product_key, qty_received, qty_left, expires_on, unit_cost, supplier, created_by, source, location_id)
  values (p_product, p_qty, p_qty, p_expires, p_unit_cost, nullif(trim(p_supplier), ''), auth.uid(), 'receive', loc) returning id into bid;
  insert into public.stock_movements (product_key, delta, reason, ref_id, created_by, location_id) values (p_product, p_qty, 'receive', bid, auth.uid(), loc);
  if p_unit_cost is not null then update public.products set cost = p_unit_cost where key = p_product; end if;
end $$;

create or replace function public.receive_stock(p_product text, p_qty numeric, p_expires date default null,
  p_unit_cost integer default null, p_supplier text default null)
returns void language sql security definer set search_path = '' as $$
  select public.receive_stock_at(p_product, p_qty, null, p_expires, p_unit_cost, p_supplier)
$$;

/* stocktake at one location: sets that location's count; the difference is logged as «تعديل جرد» */
create or replace function public.adjust_stock_at(p_product text, p_location uuid, p_counted numeric, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur numeric; loc uuid;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_counted is null or p_counted < 0 then raise exception 'counted quantity must not be negative'; end if;
  loc := private.check_location(p_location, false);
  perform 1 from public.products where key = p_product for update;
  if not found then raise exception 'unknown product'; end if;
  cur := private.location_qty(p_product, loc);
  if p_counted <> cur then
    insert into public.stock_movements (product_key, delta, reason, note, created_by, location_id)
    values (p_product, p_counted - cur, 'adjust', nullif(trim(p_note), ''), auth.uid(), loc);
  end if;
end $$;

/* legacy: target TOTAL; the difference is applied at the default location */
create or replace function public.adjust_stock(p_product text, p_counted numeric, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare cur numeric; loc uuid := private.default_location();
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_counted is null or p_counted < 0 then raise exception 'counted quantity must not be negative'; end if;
  select stock into cur from public.products where key = p_product for update;
  if cur is null then raise exception 'unknown product'; end if;
  if p_counted <> cur then
    insert into public.stock_movements (product_key, delta, reason, note, created_by, location_id) values (p_product, p_counted - cur, 'adjust', nullif(trim(p_note), ''), auth.uid(), loc);
  end if;
end $$;

create or replace function public.waste_stock_at(p_product text, p_qty numeric, p_location uuid default null, p_batch uuid default null, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare loc uuid; bloc uuid;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  perform 1 from public.products where key = p_product for update;
  if not found then raise exception 'unknown product'; end if;
  if p_batch is not null then
    select location_id into bloc from public.stock_batches where id = p_batch and product_key = p_product;
    if bloc is null then raise exception 'unknown batch'; end if;
  end if;
  loc := private.check_location(coalesce(p_location, bloc), false);
  if bloc is not null and bloc <> loc then raise exception 'unknown batch'; end if;
  if private.location_qty(p_product, loc) < p_qty then raise exception 'out of stock at location'; end if;
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by, location_id)
  values (p_product, -p_qty, 'waste', p_batch, nullif(trim(p_note), ''), auth.uid(), loc);
end $$;

create or replace function public.waste_stock(p_product text, p_qty numeric, p_batch uuid default null, p_note text default null)
returns void language sql security definer set search_path = '' as $$
  select public.waste_stock_at(p_product, p_qty, null, p_batch, p_note)
$$;

/* move units between locations: FEFO batches are split, expiry / cost / supplier kept; total unchanged */
create or replace function public.transfer_stock(p_product text, p_qty numeric, p_from uuid, p_to uuid, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare src uuid; dst uuid; tid uuid := gen_random_uuid(); mid bigint; k record; sb public.stock_batches; n text;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  if p_from is null or p_to is null then raise exception 'unknown location'; end if;
  src := private.check_location(p_from, false);
  dst := private.check_location(p_to, true);
  if src = dst then raise exception 'same location'; end if;
  perform 1 from public.products where key = p_product and active for update;
  if not found then raise exception 'unknown product'; end if;
  if private.location_qty(p_product, src) < p_qty then raise exception 'out of stock at location'; end if;
  n := nullif(trim(p_note), '');
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by, location_id)
  values (p_product, -p_qty, 'transfer', tid, n, auth.uid(), src) returning id into mid;
  for k in select batch_id, qty from public.stock_batch_takes where movement_id = mid loop
    select * into sb from public.stock_batches where id = k.batch_id;
    insert into public.stock_batches (product_key, qty_received, qty_left, expires_on, unit_cost, supplier, received_at, created_by, source, location_id)
    values (p_product, k.qty, k.qty, sb.expires_on, sb.unit_cost, sb.supplier, sb.received_at, auth.uid(), 'transfer', dst);
  end loop;
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by, location_id)
  values (p_product, p_qty, 'transfer', tid, n, auth.uid(), dst);
end $$;

revoke all on function public.receive_stock_at(text, numeric, uuid, date, integer, text) from public, anon;
revoke all on function public.adjust_stock_at(text, uuid, numeric, text) from public, anon;
revoke all on function public.waste_stock_at(text, numeric, uuid, uuid, text) from public, anon;
revoke all on function public.transfer_stock(text, numeric, uuid, uuid, text) from public, anon;
grant execute on function public.receive_stock_at(text, numeric, uuid, date, integer, text) to authenticated;
grant execute on function public.adjust_stock_at(text, uuid, numeric, text) to authenticated;
grant execute on function public.waste_stock_at(text, numeric, uuid, uuid, text) to authenticated;
grant execute on function public.transfer_stock(text, numeric, uuid, uuid, text) to authenticated;
revoke all on function public.receive_stock(text, numeric, date, integer, text) from public, anon;
revoke all on function public.adjust_stock(text, numeric, text) from public, anon;
revoke all on function public.waste_stock(text, numeric, uuid, text) from public, anon;

-- ---------- online store: only sells_online locations ----------
create or replace function public.store_products(p_keys text[] default null)
returns setof public.products language plpgsql stable security definer set search_path = '' as $$
declare p public.products;
begin
  for p in select * from public.products
           where active and kind = 'retail' and show_in_store and (p_keys is null or key = any(p_keys))
           order by sort, name loop
    p.cost := null; p.min_stock := 0; p.sku := null;
    p.stock := private.online_qty(p.key);
    return next p;
  end loop;
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
  for it in select e->>'product_key' as k, sum(case when (e->>'qty') ~ '^[0-9]{1,4}$' then (e->>'qty')::int else -1 end) as qty,
                   bool_or(not coalesce((e->>'qty') ~ '^[0-9]{1,4}$', false)) as bad
            from jsonb_array_elements(p_items) e group by 1 order by 1 loop
    if it.bad or it.qty <= 0 then raise exception 'bad quantity'; end if;
    q := it.qty;
    select * into p from public.products where key = it.k for update;
    if p.key is null or not p.active or p.kind <> 'retail' or not p.show_in_store or p.price is null then raise exception 'unavailable: %', coalesce(p.name, '?'); end if;
    if private.online_qty(p.key) < q then raise exception 'out of stock: %', p.name; end if;
    insert into public.order_items (order_id, product_key, name, qty, unit_price) values (o.id, p.key, p.name, q, p.price);
    -- no location: the movement trigger takes FEFO from the locations that feed the online store
    insert into public.stock_movements (product_key, delta, reason, ref_id, created_by, location_id) values (p.key, -q, 'order', o.id, auth.uid(), null);
    sum_total := sum_total + q * p.price;
  end loop;
  update public.orders set total = sum_total where id = o.id returning * into o;
  perform set_config('fb.order_fn', '', true);
  return o;
end $$;
