-- Public booking link: patients registered from the link are tagged, staff approve requests, WhatsApp confirmation stamp.
alter table public.patients add column if not exists source text;
alter table public.appointments add column if not exists confirm_sent_at timestamptz;
create index if not exists appointments_pending_public_idx on public.appointments (starts_at) where status = 'pending';

create or replace function public.public_book(p_service text, p_starts timestamp with time zone, p_specialist uuid, p_name text, p_phone text, p_note text default null::text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; old_name text; r record;
        ends timestamptz; rec public.appointments; sp_name text; nt text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if char_length(nm) < 2 or char_length(nm) > 60 then raise exception 'bad_name'; end if;
  digits := regexp_replace(digits, '^(00963|963|0)', '');
  if digits !~ '^9[0-9]{8}$' then raise exception 'bad_phone'; end if;
  ph := '+963' || digits;
  if char_length(coalesce(p_note, '')) > 300 then raise exception 'bad_note'; end if;

  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  if p_starts is null or p_starts <= now() then raise exception 'past'; end if;
  if p_starts > now() + interval '31 days' then raise exception 'too_far'; end if;
  if not private.pub_in_hours(p_starts, svc.minutes) then raise exception 'closed'; end if;
  ends := p_starts + make_interval(mins => svc.minutes);

  perform pg_advisory_xact_lock(hashtext('book-appointments'));

  select id, name into pid, old_name from public.patients where phone = ph order by created_at limit 1;
  if pid is not null then
    if exists (select 1 from public.appointments a
               where a.patient_id = pid and a.status in ('pending', 'confirmed', 'checked_in', 'in_session')
                 and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes) > p_starts) then
      raise exception 'overlap';
    end if;
    if (select count(*) from public.appointments a
        where a.patient_id = pid and a.status in ('pending', 'confirmed') and a.starts_at > now()) >= 2 then
      raise exception 'limit';
    end if;
  end if;

  select * into r from private.pick_staff(p_service, p_starts, p_specialist, true);
  if not r.ok then
    if p_specialist is not null and not private.staff_available(p_specialist, p_starts, ends) then raise exception 'off_duty'; end if;
    raise exception 'taken';
  end if;

  if pid is null then
    insert into public.patients (name, phone, source) values (nm, ph, 'public') returning id into pid;
  elsif coalesce(btrim(old_name), '') = '' then
    update public.patients set name = nm where id = pid;
  elsif lower(btrim(old_name)) <> lower(nm) then
    -- keep the name on file; remember the one typed on the link
    nt := 'الاسم في رابط الحجز: ' || nm || coalesce(' — ' || nt, '');
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, svc.minutes, 'pending', coalesce(public.service_price_syp(svc.key), 0), 'public', nt)
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name, 'phone', ph);
end $function$;

-- Owner / admin / reception approve a pending request.
create or replace function public.approve_booking(p_id uuid)
 returns void language plpgsql security definer set search_path to '' as $$
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  update public.appointments set status = 'confirmed' where id = p_id and status = 'pending';
  if not found then raise exception 'not pending'; end if;
end $$;

create or replace function public.reject_booking(p_id uuid, p_reason text)
 returns void language plpgsql security definer set search_path to '' as $$
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  update public.appointments set status = 'cancelled', cancel_reason = nullif(btrim(coalesce(p_reason, '')), '')
   where id = p_id and status in ('pending', 'confirmed');
  if not found then raise exception 'not pending'; end if;
end $$;

create or replace function public.mark_confirm_sent(p_id uuid)
 returns void language plpgsql security definer set search_path to '' as $$
begin
  if not private.has_role('{admin,reception}') then raise exception 'not allowed'; end if;
  update public.appointments set confirm_sent_at = now() where id = p_id;
end $$;

revoke all on function public.approve_booking(uuid), public.reject_booking(uuid, text), public.mark_confirm_sent(uuid) from public, anon;
grant execute on function public.approve_booking(uuid), public.reject_booking(uuid, text), public.mark_confirm_sent(uuid) to authenticated;
