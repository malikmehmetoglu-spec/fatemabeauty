# Supabase — Fatema Beauty

Project ref: `btcyrzvaexmgffeamlmg`. Migrations in `migrations/` were applied in order:

1. `0001_core_schema.sql` — tables, enums, queue-number trigger
2. `0002_security_policies.sql` — Row Level Security on every table
3. `0003_app_functions.sql` — `ensure_patient`, `track_app_open`, `today_queue`, `cancel_my_appointment`
4. `0004_seed_reference_data.sql` — rooms, devices, services & prices, packages, products, فاطمة طيبة, settings
5. `0005_tighten_function_access.sql` — RLS helpers moved to the non-exposed `private` schema

Who sees what:
- Anyone: services, packages, visible products, rooms, active team, settings, today's queue numbers (no names).
- A patient: only her own record, appointments, invoices, orders, prescriptions, consents, reviews.
- Staff (linked `staff.user_id`): everything needed by role — admin, specialist, reception, accountant.
