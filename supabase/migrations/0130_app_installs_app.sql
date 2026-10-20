-- The store is its own installable web app (store.webmanifest). Record which app was installed:
-- 'patient' (the clients app, default for every existing row) or 'store'. Non-destructive.
alter table public.app_installs add column if not exists app text not null default 'patient';
do $$ begin
  alter table public.app_installs add constraint app_installs_app_check check (app in ('patient', 'store'));
exception when duplicate_object then null; end $$;

-- New 4-argument overload with a REQUIRED p_app (no default), so it never clashes with the
-- existing 3-argument track_app_open (kept for older builds; it records 'patient').
create or replace function public.track_app_open(p_device_id text, p_platform text, p_channel text, p_app text) returns void
language plpgsql security definer set search_path = '' as $$
declare pid uuid;
begin
  if p_device_id is null or length(p_device_id) < 8 or length(p_device_id) > 80 then return; end if;
  select id into pid from public.patients where user_id = auth.uid();
  insert into public.app_installs (device_id, patient_id, platform, channel, app)
  values (p_device_id, pid,
          case when p_platform in ('android','ios','desktop') then p_platform else 'other' end,
          case when p_channel in ('play_store','app_store') then p_channel else 'web' end,
          case when p_app = 'store' then 'store' else 'patient' end)
  on conflict (device_id) do update
    set last_open_at = now(),
        opens = public.app_installs.opens + 1,
        patient_id = coalesce(excluded.patient_id, public.app_installs.patient_id);
end $$;
grant execute on function public.track_app_open(text, text, text, text) to anon, authenticated;
