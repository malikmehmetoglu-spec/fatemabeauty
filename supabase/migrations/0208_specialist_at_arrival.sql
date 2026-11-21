-- 0208: a specialist is chosen at arrival, not at booking; a specialist may take several clients at once.
-- Only room capacity (beds) limits sessions. Consultations keep their consultant (one at a time).
do $$ declare d text; begin
  -- pick_staff_m: a staff member's other appointments no longer block her, except for consultations
  d := pg_get_functiondef('private.pick_staff_m(text,timestamptz,uuid,boolean,integer)'::regprocedure);
  d := replace(d, 'and not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id', 'and (not svc.is_consultation or not exists (select 1 from public.appointments a
                    where a.specialist_id = s.id');
  d := replace(d, 'and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts)
  order by', 'and a.starts_at < ends and a.starts_at + make_interval(mins => a.minutes + a.extension_minutes) > p_starts))
  order by');
  execute d;

  -- public link: sessions are booked without a specialist (reception assigns her at arrival)
  d := pg_get_functiondef('public.public_book_level(text,timestamptz,uuid,text,text,text,uuid)'::regprocedure);
  d := replace(d, 'values (pid, svc.key, r.sp, svc.room_id', 'values (pid, svc.key, case when svc.is_consultation then r.sp end, svc.room_id');
  execute d;

  -- app booking: same, and a specialist overlap only matters for consultations
  d := pg_get_functiondef('public.book_appointment_v2(text,timestamptz,uuid,uuid,uuid,text,text,text,boolean,uuid)'::regprocedure);
  d := replace(d, '    sp := r.sp;
  end if;', '    sp := case when svc.is_consultation then r.sp end;
  end if;');
  d := replace(d, 'and sp is not null and a.specialist_id = sp
  ) or', 'and sp is not null and a.specialist_id = sp and svc.is_consultation
  ) or');
  execute d;

  -- row rule: same
  d := pg_get_functiondef('private.appointment_rules()'::regprocedure);
  d := replace(d, 'and new.specialist_id is not null and a.specialist_id = new.specialist_id
    )', 'and new.specialist_id is not null and a.specialist_id = new.specialist_id
        and exists (select 1 from public.services v where v.key = new.service_key and v.is_consultation)
    )');
  execute d;
end $$;
