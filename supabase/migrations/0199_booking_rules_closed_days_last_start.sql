-- 2026-11-19 (owner, applied via MCP): Friday = centre closed; Tuesday = consultant day off; 17:00 = last appointment start for everyone.
-- settings.booking_rules = {"closed_days":[5],"consultant_off_days":[2],"last_start":"17:00"}
-- private.booking_rule_block(starts, staff) → 'closed_day' | 'after_last' | 'consultant_off' | null
-- private.pick_staff_m: returns not-ok when the slot is blocked, and skips the consultant on her off day
-- private.slot_grid_m: no slots on closed days, none after last_start
-- trigger appointments_booking_rules (before insert / update of starts_at, specialist_id): hard guard on every booking path
-- Existing appointments are not touched. Full bodies: pg_get_functiondef in the database.
insert into public.settings (key, value) values ('booking_rules', '{"closed_days":[5],"consultant_off_days":[2],"last_start":"17:00"}'::jsonb)
on conflict (key) do update set value = excluded.value;
