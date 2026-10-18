-- Applied as «staff_email_link»: staff.email + link_my_staff() (links a staff row to its login on first sign-in).
alter table public.staff add column email text unique;
