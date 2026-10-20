-- 0100 — Delete a stock location (move or write off what it holds) + bulk transfer between locations.
-- Non-destructive: adds stock_locations.deleted_at, create-or-replace functions only.
-- A deleted location that still has history (batches / movements reference it) is archived:
-- active = false, deleted_at set, hidden from the app's lists; its name stays for the history views.

alter table public.stock_locations add column if not exists deleted_at timestamptz;

-- Deleted locations can no longer be used anywhere.
create or replace function private.check_location(p_location uuid, p_need_active boolean default true) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare l public.stock_locations;
begin
  if p_location is null then p_location := private.default_location(); end if;
  select * into l from public.stock_locations where id = p_location;
  if l.id is null or l.deleted_at is not null then raise exception 'unknown location'; end if;
  if p_need_active and not l.active then raise exception 'location inactive'; end if;
  return l.id;
end $$;
revoke all on function private.check_location(uuid, boolean) from public, anon;

/* Internal: moves p_qty of a product from src to dst (FEFO; expiry / cost / supplier / received date travel with
   the units). Logs the two 'transfer' movements. Callers check roles, locations and quantities. */
create or replace function private.move_stock(p_product text, p_qty numeric, p_src uuid, p_dst uuid, p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare tid uuid := gen_random_uuid(); mid bigint; k record; sb public.stock_batches; n text := nullif(trim(p_note), '');
begin
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by, location_id)
  values (p_product, -p_qty, 'transfer', tid, n, auth.uid(), p_src) returning id into mid;
  for k in select batch_id, qty from public.stock_batch_takes where movement_id = mid loop
    select * into sb from public.stock_batches where id = k.batch_id;
    insert into public.stock_batches (product_key, qty_received, qty_left, expires_on, unit_cost, supplier, received_at, created_by, source, location_id)
    values (p_product, k.qty, k.qty, sb.expires_on, sb.unit_cost, sb.supplier, sb.received_at, auth.uid(), 'transfer', p_dst);
  end loop;
  insert into public.stock_movements (product_key, delta, reason, ref_id, note, created_by, location_id)
  values (p_product, p_qty, 'transfer', tid, n, auth.uid(), p_dst);
end $$;
revoke all on function private.move_stock(text, numeric, uuid, uuid, text) from public, anon, authenticated;

create or replace function public.transfer_stock(p_product text, p_qty numeric, p_from uuid, p_to uuid, p_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare src uuid; dst uuid;
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
  perform private.move_stock(p_product, p_qty, src, dst, p_note);
end $$;
revoke all on function public.transfer_stock(text, numeric, uuid, uuid, text) from public, anon;
grant execute on function public.transfer_stock(text, numeric, uuid, uuid, text) to authenticated;

/* Bulk transfer: p_items = [{"product_key": "...", "qty": 3}, …] or null = everything at p_from. All or nothing. */
create or replace function public.transfer_location_stock(p_from uuid, p_to uuid, p_items jsonb default null, p_note text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare src uuid; dst uuid; it record; have numeric; n_products int := 0; n_units numeric := 0;
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  if p_from is null or p_to is null then raise exception 'unknown location'; end if;
  src := private.check_location(p_from, false);
  dst := private.check_location(p_to, true);
  if src = dst then raise exception 'same location'; end if;
  if p_items is not null and (jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 500) then raise exception 'bad items'; end if;
  if p_items is not null and jsonb_array_length(p_items) = 0 then raise exception 'nothing to transfer'; end if;

  for it in
    select x.k, x.q from (
      select b.product_key as k, sum(b.qty_left) as q from public.stock_batches b
      where p_items is null and b.location_id = src and b.qty_left > 0 group by b.product_key
      union all
      select e->>'product_key',
             sum(case when (e->>'qty') ~ '^[0-9]{1,6}(\.[0-9]{1,2})?$' then (e->>'qty')::numeric else -1 end)
      from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) e where p_items is not null group by 1
    ) x order by x.k
  loop
    if it.q is null or it.q <= 0 then raise exception 'quantity must be positive'; end if;
    perform 1 from public.products where key = it.k for update;
    if not found then raise exception 'unknown product'; end if;
    have := private.location_qty(it.k, src);
    if have < it.q then raise exception 'out of stock at location'; end if;
    perform private.move_stock(it.k, it.q, src, dst, p_note);
    n_products := n_products + 1; n_units := n_units + it.q;
  end loop;
  if n_products = 0 then raise exception 'nothing to transfer'; end if;
  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), 'location.transfer', (select name from public.stock_locations where id = src),
          jsonb_build_object('to', (select name from public.stock_locations where id = dst), 'products', n_products, 'units', n_units));
  return jsonb_build_object('products', n_products, 'units', n_units);
end $$;
revoke all on function public.transfer_location_stock(uuid, uuid, jsonb, text) from public, anon;
grant execute on function public.transfer_location_stock(uuid, uuid, jsonb, text) to authenticated;

/* Deletes a location. Its stock is first moved to p_target (p_mode 'transfer') or written off (p_mode 'waste').
   Without history the row is removed; otherwise it is archived (deleted_at, inactive, hidden). */
create or replace function public.delete_stock_location(p_location uuid, p_mode text default null, p_target uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare l public.stock_locations; dst uuid; it record; n_products int := 0; n_units numeric := 0; removed boolean := false; note text;
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  select * into l from public.stock_locations where id = p_location for update;
  if l.id is null or l.deleted_at is not null then raise exception 'unknown location'; end if;
  if l.is_default_center then raise exception 'cannot delete default location'; end if;
  if not exists (select 1 from public.stock_locations where id <> l.id and active and deleted_at is null) then
    raise exception 'cannot delete only location';
  end if;
  note := 'حذف الموقع «' || l.name || '»';

  if exists (select 1 from public.stock_batches where location_id = l.id and qty_left > 0) then
    if p_mode = 'transfer' then
      dst := private.check_location(p_target, true);
      if dst = l.id then raise exception 'same location'; end if;
    elsif coalesce(p_mode, '') <> 'waste' then
      raise exception 'choose what to do with the stock';
    end if;
    for it in select product_key as k, sum(qty_left) as q from public.stock_batches
              where location_id = l.id and qty_left > 0 group by product_key order by product_key loop
      perform 1 from public.products where key = it.k for update;
      if p_mode = 'transfer' then
        perform private.move_stock(it.k, it.q, l.id, dst, note);
      else
        insert into public.stock_movements (product_key, delta, reason, note, created_by, location_id)
        values (it.k, -it.q, 'waste', note, auth.uid(), l.id);
      end if;
      n_products := n_products + 1; n_units := n_units + it.q;
    end loop;
  end if;

  begin
    delete from public.stock_locations where id = l.id;
    removed := true;
  exception when foreign_key_violation then
    update public.stock_locations set active = false, sells_online = false, is_default_center = false, deleted_at = now() where id = l.id;
  end;

  insert into public.audit_log (actor, action, target, details)
  values (auth.uid(), case when removed then 'location.delete' else 'location.archive' end, l.name,
          jsonb_build_object('mode', case when n_products > 0 then p_mode end, 'products', n_products, 'units', n_units,
                             'to', (select name from public.stock_locations where id = dst)));
  return jsonb_build_object('deleted', removed, 'archived', not removed, 'products', n_products, 'units', n_units);
end $$;
revoke all on function public.delete_stock_location(uuid, text, uuid) from public, anon;
grant execute on function public.delete_stock_location(uuid, text, uuid) to authenticated;

-- save_stock_location: deleted locations are gone; a deleted location never blocks reusing its name.
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
  if exists (select 1 from public.stock_locations where lower(trim(name)) = lower(trim(p_name)) and id is distinct from p_id and deleted_at is null) then
    raise exception 'location name taken';
  end if;
  -- free the name held by a deleted (archived) location
  update public.stock_locations set name = left(name, 40) || ' (محذوف ' || left(id::text, 4) || ')'
  where lower(trim(name)) = lower(trim(p_name)) and id is distinct from p_id and deleted_at is not null;
  if p_id is not null then
    select * into old from public.stock_locations where id = p_id for update;
    if old.id is null or old.deleted_at is not null then raise exception 'unknown location'; end if;
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
