-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «tighten_function_access».

-- RLS helpers live in a schema that is not exposed through the API.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_staff() set schema private;
alter function public.has_role(public.staff_role[]) set schema private;
alter function public.my_patient_id() set schema private;
alter function public.assign_queue_no() set schema private;

revoke execute on function public.ensure_patient() from public, anon;
revoke execute on function public.cancel_my_appointment(uuid, text) from public, anon;
grant execute on function public.ensure_patient() to authenticated;
grant execute on function public.cancel_my_appointment(uuid, text) to authenticated;
