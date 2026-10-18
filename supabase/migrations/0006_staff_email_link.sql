-- Applied as «staff_email_link».

-- Staff accounts: the admin adds a staff row with an e-mail, creates the login in Supabase Auth,
-- and on first sign-in the account is linked automatically.
alter table public.staff add column email text unique;

create or replace function public.link_my_staff() returns public.staff
language plpgsql security definer set search_path = '' as $$
declare rec public.staff; em text;
begin
  if auth.uid() is null then return null; end if;
  select * into rec from public.staff where user_id = auth.uid() and active;
  if found then return rec; end if;
  select lower(u.email) into em from auth.users u where u.id = auth.uid();
  if em is null then return null; end if;
  update public.staff set user_id = auth.uid() where lower(email) = em and user_id is null and active returning * into rec;
  return rec;
end $$;
revoke execute on function public.link_my_staff() from public, anon;
grant execute on function public.link_my_staff() to authenticated;
