-- 0209: clearing a specialist (assigned at arrival) never re-checks the booking-time rules.
do $$ declare d text; begin
  d := pg_get_functiondef('private.appointments_booking_rules()'::regprocedure);
  d := replace(d, 'if tg_op = ''UPDATE'' and new.starts_at = old.starts_at and new.specialist_id is not distinct from old.specialist_id
     and new.service_key', 'if tg_op = ''UPDATE'' and new.starts_at = old.starts_at and (new.specialist_id is null or new.specialist_id is not distinct from old.specialist_id)
     and new.service_key');
  execute d;
end $$;
-- data (applied once): future non-consultation bookings (pending/confirmed) had specialist_id cleared.
