-- المنتجات وواجهة المتجر والمخزون: للإدارة والمدير العام فقط (إزالة الاستقبال)

-- المنتجات
drop policy if exists "staff manages" on public.products;
create policy "admin manages" on public.products for all to authenticated
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));

-- شرائح واجهة المتجر
drop policy if exists "slides public read active" on public.store_slides;
drop policy if exists "slides staff insert" on public.store_slides;
drop policy if exists "slides staff update" on public.store_slides;
drop policy if exists "slides staff delete" on public.store_slides;
create policy "slides public read active" on public.store_slides for select to anon, authenticated
  using (active or (select private.has_role('{admin}'::staff_role[])));
create policy "slides admin insert" on public.store_slides for insert to authenticated
  with check ((select private.has_role('{admin}'::staff_role[])));
create policy "slides admin update" on public.store_slides for update to authenticated
  using ((select private.has_role('{admin}'::staff_role[])))
  with check ((select private.has_role('{admin}'::staff_role[])));
create policy "slides admin delete" on public.store_slides for delete to authenticated
  using ((select private.has_role('{admin}'::staff_role[])));

-- دوال حركة المخزون (تعديل، استلام، نقل، إتلاف)
do $$
declare f record;
begin
  for f in
    select p.oid from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('adjust_stock','adjust_stock_at','receive_stock_at','transfer_location_stock','transfer_stock','waste_stock_at')
      and p.prosrc like '%{admin,reception}%'
  loop
    execute replace(pg_get_functiondef(f.oid), '''{admin,reception}''', '''{admin}''');
  end loop;
end $$;
