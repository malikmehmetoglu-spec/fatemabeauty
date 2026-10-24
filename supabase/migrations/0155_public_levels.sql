-- Public booking link + patient app: clients see and choose among all active levels of a service.
-- New: private.pub_level, public.public_slots_level, public.public_book_level. Changed in place:
-- public.public_booking_info (adds services[].levels), private.resolve_level (patient may pick any active level).

create or replace function private.pub_level(p_service text, p_level uuid)
returns public.service_levels language plpgsql stable security definer set search_path = '' as $$
declare l public.service_levels;
begin
  if p_level is not null then
    select * into l from public.service_levels where id = p_level and service_key = p_service and active;
    if l.id is null then raise exception 'bad_level'; end if;
    return l;
  end if;
  select * into l from public.service_levels where service_key = p_service and active order by level limit 1;
  return l;
end $$;
revoke all on function private.pub_level(text, uuid) from public, anon;

create or replace function private.resolve_level(p_service text, p_level uuid, p_patient uuid, p_staff boolean)
returns public.service_levels language plpgsql stable security definer set search_path = '' as $$
declare l public.service_levels; a public.service_levels; base public.service_levels;
begin
  select l2.* into a from public.patient_service_levels psl join public.service_levels l2 on l2.id = psl.level_id
   where p_patient is not null and psl.patient_id = p_patient and psl.service_key = p_service and l2.active;
  select * into base from public.service_levels where service_key = p_service and active order by level limit 1;
  if p_level is not null then
    select * into l from public.service_levels where id = p_level and service_key = p_service and active;
    if l.id is null then raise exception 'مستوى الجلسة غير متاح لهذه الخدمة'; end if;
    return l; -- staff and clients may choose any active level (owner decision 2026-10)
  end if;
  if a.id is not null then return a; end if;
  return base;
end $$;

create or replace function public.public_booking_info()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(jsonb_build_object('key', s.key, 'name', s.name, 'short_name', s.short_name,
        'description', s.description, 'price', public.to_syp(s.price, s.price_currency), 'price_from', s.price_from, 'minutes', s.minutes,
        'is_consultation', s.is_consultation, 'category_id', s.category_id,
        'levels', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'level', l.level, 'name', l.name, 'minutes', l.minutes,
            'price', private.level_price_syp(l)) order by l.level)
          from public.service_levels l where l.service_key = s.key and l.active), '[]'::jsonb)) order by c.sort nulls last, s.sort, s.name)
      from public.services s left join public.service_categories c on c.key = s.category_id
      where s.active and s.bookable_online), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('key', c.key, 'name', c.name, 'short_description', c.short_description,
        'instructions', c.instructions, 'icon', c.icon, 'not_for_pregnant', c.not_for_pregnant) order by c.sort, c.name)
      from public.service_categories c where c.active), '[]'::jsonb),
    'specialists', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url,
        'services', coalesce((select jsonb_agg(v.key order by v.sort, v.name) from public.services v
                              where v.active and v.bookable_online and private.staff_provides(t.id, v.key)), '[]'::jsonb)) order by t.created_at)
      from public.staff t where t.active and t.role = 'specialist' and not t.is_consultant), '[]'::jsonb),
    'consultant', (select jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url,
        'services', coalesce((select jsonb_agg(v.key order by v.sort, v.name) from public.services v
                              where v.active and v.bookable_online and private.staff_provides(t.id, v.key)), '[]'::jsonb))
      from public.staff t where t.active and t.is_consultant order by t.created_at limit 1),
    'hours', coalesce((select value from public.settings where key = 'hours'), '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb),
    'centre', (select jsonb_build_object('phone', value->>'phone', 'whatsapp', value->>'whatsapp') from public.settings where key = 'centre'),
    'horizon_days', 30
  );
$$;

create or replace function public.public_slots_level(p_day date, p_service text, p_specialist uuid default null, p_level uuid default null)
returns table(starts_at timestamptz, available boolean) language plpgsql stable security definer set search_path = '' as $$
declare l public.service_levels;
begin
  l := private.pub_level(p_service, p_level);
  perform set_config('app.reserve_cap', '1', true);
  return query select * from private.slot_grid_m(p_day, p_service, p_specialist, true, l.minutes);
  perform set_config('app.reserve_cap', '', true);
end $$;
grant execute on function public.public_slots_level(date, text, uuid, uuid) to anon, authenticated;

create or replace function public.public_book_level(p_service text, p_starts timestamptz, p_specialist uuid, p_name text, p_phone text,
                                                    p_note text default null, p_level uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare svc public.services; nm text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        digits text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); ph text; pid uuid; old_name text; r record;
        ends timestamptz; rec public.appointments; sp_name text; nt text := nullif(btrim(coalesce(p_note, '')), '');
        lvl public.service_levels; v_min int; v_price int;
begin
  if char_length(nm) < 2 or char_length(nm) > 60 then raise exception 'bad_name'; end if;
  digits := regexp_replace(digits, '^(00963|963|0)', '');
  if digits !~ '^9[0-9]{8}$' then raise exception 'bad_phone'; end if;
  ph := '+963' || digits;
  if char_length(coalesce(p_note, '')) > 300 then raise exception 'bad_note'; end if;

  select * into svc from public.services where key = p_service and active and bookable_online;
  if not found then raise exception 'bad_service'; end if;
  lvl := private.pub_level(svc.key, p_level);
  v_min := coalesce(lvl.minutes, svc.minutes);
  v_price := case when lvl.id is null then coalesce(public.service_price_syp(svc.key), 0) else private.level_price_syp(lvl) end;
  if p_starts is null or p_starts <= now() then raise exception 'past'; end if;
  if p_starts > now() + interval '31 days' then raise exception 'too_far'; end if;
  if not private.pub_in_hours(p_starts, v_min) then raise exception 'closed'; end if;
  ends := p_starts + make_interval(mins => v_min);

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

  perform set_config('app.reserve_cap', '1', true);
  select * into r from private.pick_staff_m(p_service, p_starts, p_specialist, true, v_min);
  perform set_config('app.reserve_cap', '', true);
  if not r.ok then
    if p_specialist is not null and not private.staff_available(p_specialist, p_starts, ends) then raise exception 'off_duty'; end if;
    raise exception 'taken';
  end if;

  if pid is null then
    insert into public.patients (name, phone, source) values (nm, ph, 'public') returning id into pid;
  elsif coalesce(btrim(old_name), '') = '' then
    update public.patients set name = nm where id = pid;
  elsif lower(btrim(old_name)) <> lower(nm) then
    nt := 'الاسم في رابط الحجز: ' || nm || coalesce(' — ' || nt, '');
  end if;

  insert into public.appointments (patient_id, service_key, specialist_id, room_id, starts_at, minutes, status, price, source, note, level_id)
  values (pid, svc.key, r.sp, svc.room_id, p_starts, v_min, 'pending', v_price, 'public', nt, lvl.id)
  returning * into rec;

  select name into sp_name from public.staff where id = rec.specialist_id;
  return jsonb_build_object('starts_at', rec.starts_at, 'minutes', rec.minutes, 'service', svc.name, 'specialist', sp_name, 'phone', ph,
                            'level', lvl.name, 'price', rec.price);
end $$;
grant execute on function public.public_book_level(text, timestamptz, uuid, text, text, text, uuid) to anon, authenticated;
