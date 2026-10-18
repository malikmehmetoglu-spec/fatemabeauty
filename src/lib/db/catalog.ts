"use client";

/** Catalogue — services, packages, rooms and devices (live, Supabase). */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Service = Tables<"services">;
export type Package = Tables<"packages">;
export type Room = Tables<"rooms">;
export type Device = Tables<"devices">;
export type Specialist = Pick<Tables<"staff">, "id" | "name" | "title" | "photo_url" | "role">;

/** "1,500 ل.س" / "من 1,500 ل.س" / "مجانية". */
export function priceLabel(s: Pick<Service, "price" | "price_from">) {
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

/** Public: active services (RLS shows only active ones to visitors). */
export async function listServices() {
  return must(await supabase.from("services").select("*").eq("active", true).order("sort").order("name"));
}

/** Admin: every service, active or not. */
export async function listAllServices() {
  return must(await supabase.from("services").select("*").order("sort").order("name"));
}

export async function getService(key: string) {
  return must(await supabase.from("services").select("*").eq("key", key).eq("active", true).maybeSingle());
}

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
  const rows = must(await supabase.from("staff").select("id,name,title,photo_url,role").eq("active", true).in("role", ["specialist", "admin", "owner"]).order("created_at")) ?? [];
  return rows.filter((s) => s.role === "specialist" || !!s.photo_url);
}

/** Saving vs. paying each session at the single-session price. */
export function packageSaving(p: Package, s?: Service | null) {
  return s ? Math.max(0, s.price * p.sessions - p.price) : 0;
}

/* ---------- writes ---------- */

function slug(name: string) {
  const ascii = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (ascii || "svc") + "-" + crypto.randomUUID().slice(0, 8);
}

export type ServiceInput = Omit<Service, "key" | "sort"> & { key?: string; sort?: number };

export async function saveService(input: ServiceInput) {
  const { key, ...rest } = input;
  const row = key
    ? must(await supabase.from("services").update(rest).eq("key", key).select().single())
    : must(await supabase.from("services").insert({ ...rest, key: slug(rest.name) }).select().single());
  invalidate("catalog");
  return row;
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

export async function saveRoom(input: { id?: string; name: string; sort?: number; active?: boolean }) {
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
  return must(await supabase.from("patient_packages").select("*, packages(name, service_key)").eq("patient_id", patientId).order("purchased_at", { ascending: false }));
}
