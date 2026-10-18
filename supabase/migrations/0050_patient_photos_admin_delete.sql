-- Patient before/after photos (bucket «photos») could be uploaded and read by staff but never removed:
-- there was no DELETE policy, so a wrong/duplicate upload stayed in storage forever. Admins (owner passes) may delete.
create policy "patient photos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (select private.has_role('{admin}'::staff_role[])));
