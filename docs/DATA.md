# Real data only — rules for wiring screens to Supabase

The owner asked for **zero mock data**. Every number, name, date and list on every screen must come from
Supabase (project `btcyrzvaexmgffeamlmg`) or be computed from it. When there is no data yet, the screen shows an
honest empty state. The database is currently empty except for the owner account (`malek`, role `owner`).

## What to delete from screens
- Imports of `@/lib/mock/*` and of mock values from `@/lib/data` (`APPOINTMENTS_TODAY`, `PERSONA*`, `NAMES`, `STAFF`,
  `SERVICES`, `PACKAGES`, `REVENUE_*`, `TODAY`, `NOW`, `aheadOf`, `STATUS_TAG`…). Calendar names (`AR_DAYS`, `AR_MONTHS`)
  and `initials()` may stay. At the end `src/lib/mock/` and the mock part of `data.ts` will be deleted — your screens must not need them.
- Hard-coded people (including فاطمة طيبة, FatemaAvatar, FATEMA_PHOTO), hard-coded prices, counts, KPIs, chart values, dates,
  file numbers, invoice numbers, product lists, sample messages, «مثال» rows. Specialists come from the `staff` table
  (`role in ('specialist','admin','owner')`, `photo_url`). If none exist, hide that block or show an empty state.
- "Today" is the real current date/time in Damascus: use `dayKey()`, `clock()`, `dayRange()`, `atDamascus()` from `@/lib/format`.

## Keep
- The design: layout, colours, depth, typography, icons, copy that describes the UI (titles, labels, help text).
- Interactivity, but now it reads/writes real rows.

## How to read & write
- `@/lib/supabase/client` → `supabase` (typed with `Database` from `database.types.ts`).
- `@/lib/db/query` → `useQuery(["domain", ...args], fetcher)`, `invalidate("domain")`, `must(res)`.
- Put all queries/mutations for your domain in **your own** file `src/lib/db/<domain>.ts` (listed in your brief). Pages call those functions.
  Reference implementation: `src/lib/db/products.ts` + `src/app/admin/inventory/{page,dialogs}.tsx`.
- UI states: `Loading`, `EmptyState` (say what will appear + the action that adds it), `ErrorNote`.
  Forms: `Modal`, `TextInput`, `NumberInput`, `TextArea`, `Select`, `Segment`, `SubmitButton`, `GhostButton`, `Toggle` (all in `@/components/ui`).
- Auth: `useSession()` → `{ loading, session, staff, patient }` from `@/lib/supabase/session`.
  Patient pages that show personal data: `useRequirePatient()` (redirects to /login/). Public pages (store browsing, services,
  site, splash, login) need no login. Admin pages are already guarded by `AdminShell`. Reception tablet: `useRequireStaff()`.
  TV screens are public and may only use `rpc("today_queue")` (numbers and rooms, never names).
- Roles: `owner` passes every check; `admin`, `specialist`, `reception`, `accountant` (see `private.has_role` in RLS).

## Schema changes
- Existing tables: see `supabase/migrations/*.sql` and `src/lib/supabase/database.types.ts`.
- If your screens need a table/column/function that does not exist, add it with the Supabase MCP tool
  `apply_migration` (project_id `btcyrzvaexmgffeamlmg`). Rules: non-destructive only (no DROP / TRUNCATE / DELETE — they are
  blocked), `enable row level security` on every new table with policies using `(select private.is_staff())`,
  `(select private.has_role('{admin,...}'))`, `(select private.my_patient_id())`; SECURITY DEFINER functions get
  `set search_path = ''`, `revoke ... from public, anon` unless they must be public. Prefix your table names sensibly, no clashes.
- Then save the SQL to `supabase/migrations/<next free number>_<name>.sql` and regenerate types with the MCP tool
  `generate_typescript_types`, writing the result to `src/lib/supabase/database.types.ts` (keep the 1-line header comment).
  Several agents may regenerate — always regenerate right before writing so you include everyone's tables.
- Run `get_advisors` (security) after your migrations and fix what you introduced.

## Checking
- `npx tsc --noEmit`, `npx eslint <your files>`. Dev server runs on http://localhost:3000 (do not start/stop it, do not run `next build`).
- Staff login for testing: username `malek`, password `homs.111` (owner). Do NOT leave test rows in the database: test inside
  SQL transactions that you roll back (`execute_sql` with `begin; set_config('request.jwt.claims', ...); set local role authenticated; ... rollback;`),
  or with UI flows only if you can remove what you created (DELETE is blocked for you — so prefer SQL rollback tests).
- Screenshot empty states with `tools/shot.py` and check they look intentional and on-brand.
- Finally grep your files for leftovers: sample names, `مثال`, fixed prices like 1,500 / 2,000 / 3,500, `13 تشرين`, `فاطمة`, `1024`, `12:30`.
