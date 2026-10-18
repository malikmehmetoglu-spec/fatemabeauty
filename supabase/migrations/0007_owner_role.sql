-- Applied as «owner_role» and «owner_has_every_role_and_first_account».
alter type public.staff_role add value if not exists 'owner' before 'admin';
-- private.has_role(): the owner (المدير العام) passes every role check.
-- The first owner account (username «malek») was created directly; credentials are not stored in the repo.
