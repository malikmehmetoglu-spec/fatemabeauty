-- Edit form: change the expiry date of a product's stock at one location (all its open batches there).
create or replace function public.set_batches_expiry(p_product text, p_location uuid, p_expires date)
 returns void language plpgsql security definer set search_path to '' as $f$
begin
  if not private.has_role('{admin}') then raise exception 'not allowed'; end if;
  update public.stock_batches set expires_on = p_expires
  where product_key = p_product and qty_left > 0
    and (location_id = p_location or (p_location is null and location_id is null));
end $f$;
revoke all on function public.set_batches_expiry(text, uuid, date) from public, anon;
grant execute on function public.set_batches_expiry(text, uuid, date) to authenticated;
