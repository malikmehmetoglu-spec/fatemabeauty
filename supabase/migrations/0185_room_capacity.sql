-- 0185: room capacity (beds). A room may host up to `capacity` overlapping
-- active appointments; a specialist still does one session at a time.
-- Function bodies are patched from their LIVE definitions (pg_get_functiondef)
-- so signatures and every other line stay identical.

alter table public.rooms add column if not exists capacity int not null default 1;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'rooms_capacity_range') then
    alter table public.rooms add constraint rooms_capacity_range check (capacity between 1 and 20);
  end if;
end $$;

-- Skin-care room: 3 beds. Lash/brow lifts happen there.
update public.rooms set capacity = 3 where id = '650a6348-0a2a-4741-8224-9407a55458fa';
update public.services set room_id = '650a6348-0a2a-4741-8224-9407a55458fa'
 where key in ('lash-lift', 'brow-lift') and room_id is distinct from '650a6348-0a2a-4741-8224-9407a55458fa';

-- True when [p_st, p_en) can fit one more appointment in p_room: at every
-- instant the number of active overlapping appointments (excluding p_ignore,
-- plus an optional hypothetical [p_x_from, p_x_to)) stays below capacity.
create or replace function private.room_has_space(p_room uuid, p_st timestamptz, p_en timestamptz,
  p_ignore uuid default null, p_x_from timestamptz default null, p_x_to timestamptz default null)
returns boolean language plpgsql stable security definer set search_path = '' as $f$
declare cap int;
begin
  if p_room is null then return true; end if;
  select coalesce(r.capacity, 1) into cap from public.rooms r where r.id = p_room;
  cap := coalesce(cap, 1);
  return not exists (
    with occ as (
      select a.starts_at s, a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) e
      from public.appointments a
      where a.room_id = p_room and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
        and (p_ignore is null or a.id <> p_ignore)
        and a.starts_at < p_en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_st
      union all
      select p_x_from, p_x_to where p_x_from is not null and p_x_to is not null and p_x_from < p_en and p_x_to > p_st
    ), pts as (
      select p_st t union select o.s from occ o where o.s > p_st
    )
    select 1 from pts where (select count(*) from occ o where o.s <= pts.t and o.e > pts.t) >= cap
  );
end $f$;
revoke all on function private.room_has_space(uuid, timestamptz, timestamptz, uuid, timestamptz, timestamptz) from public;

do $$
declare
  f regprocedure; d text; n text; k int;
  edits jsonb := jsonb_build_array(
    jsonb_build_object('f', 'private.appointment_rules()',
      'o', E'        and ((new.room_id is not null and a.room_id = new.room_id) or (new.specialist_id is not null and a.specialist_id = new.specialist_id))\n    ) then raise exception',
      'n', E'        and new.specialist_id is not null and a.specialist_id = new.specialist_id\n    ) or (new.room_id is not null and not private.room_has_space(new.room_id, new.starts_at, new.starts_at + make_interval(mins => new.minutes), new.id)) then raise exception'),
    jsonb_build_object('f', 'public.book_appointment_v2(text,timestamptz,uuid,uuid,uuid,text,text,text,boolean,uuid)',
      'o', E'      and ((rm is not null and a.room_id = rm) or (sp is not null and a.specialist_id = sp))\n  ) then raise',
      'n', E'      and sp is not null and a.specialist_id = sp\n  ) or (st <> ''checked_in'' and rm is not null and not private.room_has_space(rm, p_starts, ends)) then raise'),
    jsonb_build_object('f', 'public.maraiti_decide(uuid,text,jsonb)',
      'o', E'                   and ((ap.room_id is not null and x.room_id = ap.room_id) or (ap.specialist_id is not null and x.specialist_id = ap.specialist_id)))\n      then raise',
      'n', E'                   and ap.specialist_id is not null and x.specialist_id = ap.specialist_id)\n         or (ap.room_id is not null and not private.room_has_space(ap.room_id, v_starts, v_ends, ap.id))\n      then raise'),
    jsonb_build_object('f', 'private.pick_staff_m(text,timestamptz,uuid,boolean,integer)',
      'o', E'  if svc.room_id is not null and exists (select 1 from public.appointments a\n      where a.room_id = svc.room_id and a.status in (''pending'', ''confirmed'', ''checked_in'', ''in_session'')\n        and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts) then',
      'n', E'  if svc.room_id is not null and not private.room_has_space(svc.room_id, p_starts, ends) then'),
    jsonb_build_object('f', 'private.vip_find(text,integer,timestamptz,integer,uuid,uuid,timestamptz,timestamptz,uuid,uuid,integer)',
      'o', E'           and not (p_x_from is not null and p_x_room is not null and p_x_room = svc.room_id and st < p_x_to and en > p_x_from)\n           and (svc.room_id is null or not exists (\n                 select 1 from public.appointments a\n                 where a.room_id = svc.room_id and a.status in (''pending'', ''confirmed'', ''checked_in'', ''in_session'')\n                   and (p_ignore is null or a.id <> p_ignore)\n                   and a.starts_at < en and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > st)) then',
      'n', E'           and (svc.room_id is null or private.room_has_space(svc.room_id, st, en, p_ignore,\n                 case when p_x_room = svc.room_id then p_x_from end, case when p_x_room = svc.room_id then p_x_to end)) then'),
    jsonb_build_object('f', 'private.vip_override_plan(uuid,text,uuid,timestamptz,uuid,boolean,boolean)',
      'o', E'      and ((svc.room_id is not null and a.room_id = svc.room_id) or (sp is not null and a.specialist_id = sp))',
      'n', E'      and ((svc.room_id is not null and a.room_id = svc.room_id and not private.room_has_space(svc.room_id, p_starts, en)) or (sp is not null and a.specialist_id = sp))')
  );
  e jsonb;
begin
  for e in select * from jsonb_array_elements(edits) loop
    f := (e->>'f')::regprocedure;
    d := pg_get_functiondef(f);
    k := (length(d) - length(replace(d, e->>'o', ''))) / length(e->>'o');
    if k <> 1 then raise exception 'room capacity patch: % matched % times', e->>'f', k; end if;
    n := replace(d, e->>'o', e->>'n');
    execute n;
  end loop;
end $$;
