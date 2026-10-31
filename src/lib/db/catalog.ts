"use client";

/** Catalogue — services, packages, rooms and devices (live, Supabase). */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

/** A service row as screens use it. `price` is the client price in SYP (USD prices converted with the current rate,
 * rounded up to 5 ل.س); `price_syp` null = no rate yet («السعر عند الاستفسار»). Admin rows (listAllServices) keep the
 * stored `price` + `price_currency` and carry `price_syp` as a hint. */
export type Service = Tables<"services"> & { price_syp: number | null };
export type Category = Tables<"service_categories">;
export type Package = Tables<"packages">;
export type Room = Tables<"rooms">;
export type Device = Tables<"devices">;
export type Specialist = Pick<Tables<"staff">, "id" | "name" | "title" | "photo_url" | "role">;

/** "1,500 ل.س" / "من 1,500 ل.س" / "مجانية". */
export const PRICE_ON_REQUEST = "السعر عند الاستفسار";
export function priceLabel(s: Pick<Service, "price" | "price_from"> & { price_syp?: number | null }) {
  if (s.price_syp === null) return PRICE_ON_REQUEST;
  if (s.price === 0) return "مجانية";
  return (s.price_from ? "من " : "") + s.price.toLocaleString("en-US") + " ل.س";
}

/** Icon for a service, picked from words in its name (no stored icon column). */
export function serviceIcon(name: string) {
  if (/ليزر/.test(name)) return "M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0";
  if (/تقشير/.test(name)) return "M12 4L4 8l8 4 8-4-8-4M4 12l8 4 8-4M4 16l8 4 8-4";
  if (/استشارة/.test(name)) return "M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z";
  if (/هيدرا|نضارة/.test(name)) return "M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6";
  return "M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z";
}

/* ---------- reads ---------- */

async function sypPrices() {
  const rows = must(await supabase.rpc("service_prices_syp")) ?? [];
  return new Map(rows.map((r) => [r.key, r.price_syp] as const));
}
/** Client view: price replaced by the SYP price (never dollars). */
function toClient(r: Tables<"services">, m: Map<string, number | null>): Service {
  const syp = m.has(r.key) ? (m.get(r.key) ?? null) : r.price_currency === "USD" ? null : r.price;
  return { ...r, price: syp ?? 0, price_currency: "SYP", price_syp: syp };
}
/** Sort by category order, then service order. */
function byCategory(rows: Tables<"services">[], cats: Category[]) {
  const o = new Map(cats.map((c) => [c.key, c.sort]));
  const k = (r: Tables<"services">) => (r.category_id && o.has(r.category_id) ? o.get(r.category_id)! : 999);
  return [...rows].sort((a, b) => k(a) - k(b) || a.sort - b.sort || a.name.localeCompare(b.name, "ar"));
}

/** Public: active services (RLS shows only active ones to visitors), prices in SYP, ordered by category. */
export async function listServices(): Promise<Service[]> {
  const [rows, m, cats] = await Promise.all([
    supabase.from("services").select("*").eq("active", true).order("sort").order("name").then(must), sypPrices(), listCategories(),
  ]);
  return byCategory(rows ?? [], cats).map((r) => toClient(r, m));
}

/** Admin: every service, active or not — stored price/currency kept, `price_syp` as hint. */
export async function listAllServices(): Promise<Service[]> {
  const [rows, m, cats] = await Promise.all([supabase.from("services").select("*").order("sort").order("name").then(must), sypPrices(), listCategories(true)]);
  return byCategory(rows ?? [], cats).map((r) => ({ ...r, price_syp: m.get(r.key) ?? (r.price_currency === "USD" ? null : r.price) }));
}

export async function getService(key: string): Promise<Service | null> {
  const [r, m] = await Promise.all([supabase.from("services").select("*").eq("key", key).eq("active", true).maybeSingle().then(must), sypPrices()]);
  return r ? toClient(r, m) : null;
}

export async function getCategory(key: string | null | undefined) {
  if (!key) return null;
  return must(await supabase.from("service_categories").select("*").eq("key", key).maybeSingle());
}

export async function listCategories(all = false): Promise<Category[]> {
  let q = supabase.from("service_categories").select("*");
  if (!all) q = q.eq("active", true);
  return must(await q.order("sort").order("name")) ?? [];
}

/** Today's USD → SYP rate (staff only; null when none). */
export async function usdRate(): Promise<number | null> {
  const r = must(await supabase.from("exchange_rates").select("usd_to_syp").order("effective_at", { ascending: false }).order("created_at", { ascending: false }).limit(1));
  return r?.[0]?.usd_to_syp ?? null;
}
/** Same rule as public.syp_ceil5: round UP to the nearest 5 ل.س. */
export const sypCeil5 = (n: number) => Math.ceil(n / 5) * 5;

export async function listPackages(all = false) {
  let q = supabase.from("packages").select("*");
  if (!all) q = q.eq("active", true);
  return must(await q.order("price"));
}

export async function getPackage(id: string) {
  return must(await supabase.from("packages").select("*").eq("id", id).eq("active", true).maybeSingle());
}

export async function listRooms(all = false) {
  let q = supabase.from("rooms").select("*");
  if (!all) q = q.eq("active", true);
  return must(await q.order("sort").order("name"));
}

/** Staff only (RLS). */
export async function listDevices() {
  return must(await supabase.from("devices").select("*").order("name"));
}

/** Specialists shown to patients (public team listing). */
export async function listSpecialists(): Promise<Specialist[]> {
  const rows = must(await supabase.from("staff").select("id,name,title,photo_url,role,is_consultant").eq("active", true).order("created_at")) ?? [];
  // the consultant first, then the specialists (reception/accounting/owner are not shown to clients)
  return rows.filter((s) => s.role === "specialist" || s.is_consultant).sort((a, b) => Number(b.is_consultant) - Number(a.is_consultant));
}

/** Saving vs. paying each session at the single-session price. */
export function packageSaving(p: Package, s?: Service | null) {
  return s ? Math.max(0, (s.price_syp ?? 0) * p.sessions - p.price) : 0;
}

/* ---------- writes ---------- */

function slug(name: string) {
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (ascii || "svc") + "-" + crypto.randomUUID().slice(0, 8);
}

export type ServiceInput = Omit<Tables<"services">, "key" | "sort"> & { key?: string; sort?: number; price_syp?: unknown };

export async function saveService(input: ServiceInput) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, price_syp, ...rest } = input;
  const row = key
    ? must(await supabase.from("services").update(rest).eq("key", key).select().single())
    : must(await supabase.from("services").insert({ ...rest, key: slug(rest.name) }).select().single());
  invalidate("catalog"); invalidate("levels"); // level 1 follows the service's minutes/price (and new services get 3 levels)
  return row;
}

export type CategoryInput = Partial<Category> & { name: string };
export async function saveCategory(input: CategoryInput, isNew: boolean) {
  const { key, created_at, ...rest } = input; void created_at;
  const row = !isNew && key
    ? must(await supabase.from("service_categories").update(rest).eq("key", key).select().single())
    : must(await supabase.from("service_categories").insert({ ...rest, key: key || slug(rest.name) }).select().single());
  invalidate("catalog");
  return row;
}

/** Swap a category with its neighbour (dir -1 = up, 1 = down). */
export async function moveCategory(cats: Category[], key: string, dir: -1 | 1) {
  const list = [...cats].sort((a, b) => a.sort - b.sort);
  const i = list.findIndex((c) => c.key === key), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((c, n) => c.sort === n + 1 ? null : supabase.from("service_categories").update({ sort: n + 1 }).eq("key", c.key).then(must)));
  invalidate("catalog");
}

export async function setServiceActive(key: string, active: boolean) {
  must(await supabase.from("services").update({ active }).eq("key", key));
  invalidate("catalog");
}

export async function savePackage(input: { id?: string; service_key: string; name: string; sessions: number; price: number; active?: boolean }) {
  const { id, ...rest } = input;
  const row = id
    ? must(await supabase.from("packages").update(rest).eq("id", id).select().single())
    : must(await supabase.from("packages").insert(rest).select().single());
  invalidate("catalog");
  return row;
}

export async function setPackageActive(id: string, active: boolean) {
  must(await supabase.from("packages").update({ active }).eq("id", id));
  invalidate("catalog");
}

export async function saveRoom(input: { id?: string; name: string; sort?: number; active?: boolean; capacity?: number }) {
  const { id, ...rest } = input;
  const row = id
    ? must(await supabase.from("rooms").update(rest).eq("id", id).select().single())
    : must(await supabase.from("rooms").insert(rest).select().single());
  invalidate("catalog");
  return row;
}

export async function saveDevice(input: { id?: string; name: string; room_id: string | null; in_maintenance?: boolean; next_service_at?: string | null }) {
  const { id, ...rest } = input;
  const row = id
    ? must(await supabase.from("devices").update(rest).eq("id", id).select().single())
    : must(await supabase.from("devices").insert(rest).select().single());
  invalidate("catalog");
  return row;
}

export async function setDeviceMaintenance(id: string, on: boolean) {
  must(await supabase.from("devices").update({ in_maintenance: on }).eq("id", id));
  invalidate("catalog");
}

/** Removes a device. Fails (readable error) while a service still points at it. */
export async function removeDevice(id: string) {
  must(await supabase.from("devices").delete().eq("id", id));
  invalidate("catalog");
}

/** The signed-in patient's packages (RLS limits to her own rows). */
export async function listMyPackages(patientId: string) {
  return must(await supabase.from("patient_packages").select("*, packages(name, service_key)").eq("patient_id", patientId).gt("sessions_total", 0).order("purchased_at", { ascending: false }));
}
