# Overnight QA rules (finance, inventory, appointments + responsive web app)

Goal from the owner: **zero problems** in Finance, Inventory and Appointments (the centre starts with these), and the whole
product (store, patient app, admin, reception tablet) must work as a web app on desktop AND mobile.

## Testing against the real database (it is production and currently empty)
1. Prefer database tests inside a transaction that is rolled back (Supabase MCP `execute_sql`):
   `begin; select set_config('request.jwt.claims', json_build_object('sub', <user uuid>, 'role','authenticated')::text, true); set local role authenticated; ...; rollback;`
   For a patient, create a temporary auth user + patient row inside the same transaction.
2. UI tests in the browser (Playwright, see tools/shot.py) may create real rows ONLY as the owner (username `malek`, password `homs.111`),
   and EVERY row you create must be named/tagged with the prefix `QA-` (names, notes, labels) and removed before you finish.
   Remove them through the app's own API with the owner session (supabase-js / REST `DELETE` allowed by RLS), e.g. a small
   Node/Python script that signs in as malek and deletes rows WHERE name/label LIKE 'QA-%' (and their children: invoice_items,
   invoice_payments, stock_batches, stock_movements, order_items, appointments of QA patients…). Archive is NOT enough — delete.
   SQL DELETE/TRUNCATE through MCP is blocked; never try to bypass that block in other ways.
3. Audit triggers are paused overnight by the lead; do not touch them. Do not reset sequences; the lead will do it.
4. At the end run a check query that every table has 0 rows except staff (1 owner), settings, and storage objects you did not create.

## Fixing
- Fix every bug you find (UI, logic, RLS, functions). Non-destructive migrations only (`create or replace`, `alter … add`, `alter policy`),
  saved to supabase/migrations/<next number>_<name>.sql; regenerate src/lib/supabase/database.types.ts after schema changes.
- Do not change files outside your area unless the bug is there; if you do, keep the change minimal and mention it in your report.
- Never run git, never run `next build`. The dev server runs on http://localhost:3000; if it is down (connection refused for >1 min), restart it with a background shell `cd /home/claude/fatemabeauty && exec npx next dev -p 3000` (only one instance).

## Responsive
- Admin frame (src/components/shell/AdminShell.tsx + admin.module.css) is already responsive: sidebar ≥1100px, drawer below.
  Pages must reflow inside it at 390, 768, 1024 and 1440 px: no horizontal page scroll, no clipped text, no overlapping.
  Rows of cards: use className="adm-row" (flex-wrap) or CSS grid with auto-fit/minmax; wide tables: wrap in a container with
  overflowX auto (scrollbars are hidden globally) or switch to a card list under 700px. Use a CSS module per page/area for media queries.
- Patient/store pages: PhoneScreen has `wide` for store-style pages (up to 1180px on desktop); grids should go 2 cols on phones → 3–4 on desktop.
- Screenshot every page you own at 390, 768 and 1440 (SHOT_W env with tools/shot.py, or a custom Playwright script that signs in as the owner first) and look at them.
