-- Temporary AI placeholder portraits («صورة مؤقتة»): flagged so the admin knows to replace them with real photos.
alter table public.staff add column if not exists photo_placeholder boolean not null default false;
comment on column public.staff.photo_placeholder is 'true = temporary AI placeholder portrait (صورة مؤقتة), to be replaced by a real photo';
