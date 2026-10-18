# Porting a design screen to the app

Designs: `/home/claude/ds/project/<Name>.dc.html` (source of truth, mauve palette, 390×844 phone / 1194×834 tablet /
1920×1080 TV / 1440×900 admin). Rendered references: `/home/claude/ds/previews/<Name>.png` (2× scale).
Reference implementation already done: `src/app/home/page.tsx` (← Main.dc.html). Read it first.

## Where things go
- One page per screen: `src/app/<route>/page.tsx` where `<route>` comes from `src/lib/routes.ts` (`R.<Name>`).
  Start the file with `"use client";` and a doc comment naming the design file.
- Screen-only sub-components may live next to the page (e.g. `src/app/admin/queue/QueueTable.tsx`). Never name them `page.tsx`.
- Screen-specific sample data that is NOT in `src/lib/data.ts` goes in your batch file `src/lib/mock/<batch>.ts`
  (create it). Do NOT edit shared files: `src/lib/data.ts`, `src/lib/tokens.ts`, `src/lib/routes.ts`, `src/components/**`,
  `src/app/layout.tsx`, `globals.css`, `next.config.ts`. If you truly need a shared change, report it instead.
- Extra icons: pass the raw SVG path to `<Icon name="M4 4h16..." />` (24×24 viewBox, Tabler outline style).

## Building blocks (use them; don't re-implement)
- `@/components/shell`: `PhoneScreen` (phone frame, `tab=` for the 5 root screens: Main/P_Appointments/Journey/P_Store/Account),
  `TopBar` (back + title), `AdminShell` (sidebar + top bar; `active=` section label), `Stage` (fixed-size scaled canvas for
  tablet `width={1194} height={834}` and TV `width={1920} height={1080}`).
- `@/components/ui`: `Card, DarkCard, DarkGlow, SectionTitle, Circ, DoneDot, IconButton, PrimaryButton, SecondaryButton, Chip,
  Tag (kinds pink/green/amber/gray/plum/lilac/silver), ExampleTag, PersonName, Avatar, FatemaAvatar, Logo, Toggle, Progress,
  Kpi, DataTable, Icon`.
- `@/lib/tokens`: colours `C.*`, `SH, SHB, SH_SOFT, DARK, SELECTED, DONE_GRAD, ICON_FILL, SOFT_PANEL, CARD, GLASS, BG, BG_WIDE,
  FATEMA_PHOTO, LOGO, LOGO_LIGHT`. Map design hex values to these tokens wherever they match.
- `@/lib/data`: services & prices, staff, PERSONA, today's 26 appointments (`APPOINTMENTS_TODAY`, `PERSONA_TODAY`, `aheadOf`),
  revenue, `STATUS_TAG`. `@/lib/format`: `money(n)`, `arDate(date)`, `addDays`.
- Links: `import Link from "next/link"` + `href={R.Name}`. Never link to `.dc.html`.
- Photo of فاطمة طيبة: `FATEMA_PHOTO` (`/images/fatema.jpg`) — the designs use `/_blob/3b51…`; replace it.
- Logo: `<Logo height={..} />` (designs use `fatema-logo.svg`; light version on mauve: `<Logo light />`).

## Fidelity rules
- Match the design pixel-for-pixel at its design size: same spacing, radii, font sizes/weights, colours, shadows, icons, copy.
- Inline `style={{...}}` objects are fine (that is how the design is expressed). Convert CSS strings to React style objects.
- Port interactivity from the design's `class Component … renderVals()` to `useState` (chips, tabs, toggles, steppers, pickers…).
  `{{accent}}` = `C.accent`. `<sc-for>` → `.map`, `<sc-if>` → conditional.
- Phone screens must also look right from 360 to 480 px wide: avoid fixed widths wider than the column; let rows flex.
  Fixed-height designs become natural-height pages; long content may scroll (scrollbars are hidden globally).
  Primary action at the bottom: `marginTop: "auto"`.
- Admin screens: designed for 1440×900 inside `AdminShell`; keep content fluid (`flex: 1`, `minWidth: 0`).
- Tablet/TV: use `Stage` and reproduce the design exactly at its fixed size.

## Data rules (very important)
- No fake data. The only real person is فاطمة طيبة; every other person name must be followed by `<ExampleTag />`
  (or use `<PersonName name sample />`). Keep every مثال tag that the design shows.
- Use data from `@/lib/data` where it exists. Fixed inconsistencies you MUST apply even though the design shows otherwise:
  - The patient persona's visit today: queue number **12**, **غرفة 1**, 13:00, with فاطمة طيبة (designs show 25 / غرفة 2).
    Use `PERSONA.queueNo`, `PERSONA.room`, `PERSONA_TODAY`. People ahead = `aheadOf(PERSONA_TODAY)`.
  - The 14:15 session in غرفة 2 is «تنظيف عميق للبشرة», not هيدرافيشل.
  - File 1024 = the persona, sample name «ريم سالم» (`PERSONA.name`, `PERSONA.fileNo`).
  - Today's schedule (`APPOINTMENTS_TODAY`): slot 1 (10:00 غرفة 1) is now «روان قاسم», slot 12 (13:00 غرفة 1) is «ريم سالم» / file 1024.
- Weekday + date must be real: build with `arDate(new Date(...))`.
- Currency «ل.س», Western digits, `money()`.
- No emoji. No botox/filler/injections anywhere.
- Arabic, RTL, feminine address for patients. Fonts come from the layout (El Messiri; Latin via className="latin" → Rubik).

## Checking your work
- Dev server is already running on http://localhost:3000 (do NOT start another one, do NOT run `next build`).
- Type-check: `cd /home/claude/fatemabeauty && npx tsc --noEmit` (fix every error in your files).
- Lint your files: `npx eslint src/app/<your routes>`.
- Screenshots: `python3 tools/shot.py <out_dir> <phone|tablet|tv|admin> /route/ /route2/ …` → compare each PNG with
  `/home/claude/ds/previews/<Name>.png` using the Read tool. Fix differences until they match. Check phone pages also at
  360 px wide (edit the size in a copy of the script or pass through a quick playwright snippet).
- No console errors.
