-- خدمة العملاء: لا وصول لملفات الموافقات/الصور ولا صور المنتجات
alter policy "kiosk files staff insert" on storage.objects
  with check ((bucket_id = any (array['consents','photos'])) and (select private.is_staff_full()));
alter policy "kiosk files staff read" on storage.objects
  using ((bucket_id = any (array['consents','photos'])) and (select private.is_staff_full()));
alter policy "kiosk files staff update" on storage.objects
  using ((bucket_id = any (array['consents','photos'])) and (select private.is_staff_full()));
alter policy "product images staff read" on storage.objects
  using ((bucket_id = 'products') and (select private.is_staff_full()));
alter policy "product images staff update" on storage.objects
  using ((bucket_id = 'products') and (select private.has_role('{admin}'::staff_role[])));
alter policy "product images staff write" on storage.objects
  with check ((bucket_id = 'products') and (select private.has_role('{admin}'::staff_role[])));
