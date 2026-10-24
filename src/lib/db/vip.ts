"use client";

/**
 * VIP clients + the daily room reserve (staff-only time that the public link / patient app never offer).
 * Server rules: migration 0150_vip_reserve.sql (book_vip, vip_next_slots, vip_override*, reserve_status, set_patient_vip).
 */
import { supabase } from "@/lib/supabase/client";
import { arDate, clock, dayKey } from "@/lib/format";
import { invalidate, must } from "./query";
import { bookingError, dateOfKey } from "./appointments";
import type { Centre } from "./bookingRequests";

export const GOLD = "#C9A24B";
export const GOLD_DEEP = "#9A7526";
export const GOLD_SOFT = "#FBF4E2";
export const GOLD_LINE = "#EBD9A8";
export const VIP_FACTOR = 1.7;

export type VipSlot = { starts_at: string; ends_at: string; specialist_id: string | null; specialist_name: string | null; room_id: string | null; room_name: string | null; minutes: number; price: number; base_price: number; in_reserve: boolean };
export type ReserveRow = { room_id: string; room_name: string; capacity: number; booked: number; reserve: number; reserve_left: number; closes_at: number; walk_in_open: boolean };
export type Conflict = {
  id: string; name: string | null; phone: string | null; service: string | null; status: string; starts_at: string; minutes: number;
  specialist: string | null; movable: boolean; alt_starts_at: string | null; alt_specialist: string | null; moved: boolean;
};
export type OverridePlan = { appointment_id: string | null; starts_at: string; ends_at: string; minutes: number; price: number; specialist: string | null; blocked: boolean; conflicts: Conflict[] };
export type VipClient = { id: string; name: string; phone: string | null; file_no: number; vip: boolean };

/** Readable Arabic for the VIP functions' errors. */
export function vipError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  if (/no_vip_slot/.test(m)) return "لا يوجد وقت شاغر اليوم لهذه الخدمة — يمكن للإدارة الإدخال فوق موعد قائم.";
  if (/reserve_walk_in_closed/.test(m)) return "الاحتياطي متاح لأي حالة دون موعد في آخر ساعتين من الدوام فقط.";
  if (/vip_override_blocked/.test(m)) return "يوجد في هذا الوقت مراجِعة وصلت أو جلسة بدأت — لا يمكن نقلها. اختاري وقتاً آخر.";
  if (/not allowed: vip/.test(m)) return "تمييز VIP للمالكة والإدارة فقط.";
  return bookingError(e);
}
function ok<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new Error(vipError(new Error(res.error.message)));
  return res.data;
}

/** Nearest free times today for a service level (staff; reserve included). */
export async function vipNextSlots(service: string, level: string | null, specialist?: string | null, limit = 6): Promise<VipSlot[]> {
  return ok(await supabase.rpc("vip_next_slots", { p_service: service, p_level: level ?? undefined, p_specialist: specialist ?? undefined, p_limit: limit })) ?? [];
}

export async function bookVip(p: { patient: string; service: string; level: string | null; starts?: string | null; specialist?: string | null; checkIn: boolean }) {
  const row = ok(await supabase.rpc("book_vip", { p_patient: p.patient, p_service: p.service, p_level: p.level ?? undefined, p_starts: p.starts ?? undefined, p_specialist: p.specialist ?? undefined, p_check_in: p.checkIn }));
  invalidate("appointments"); invalidate("reserve"); invalidate("queue");
  return row;
}

/** Last N hours of the day: any walk-in may use the reserve at the normal price. */
export async function bookReserveWalkIn(p: { patient: string; service: string; level: string | null; starts?: string | null; specialist?: string | null; checkIn: boolean }) {
  const row = ok(await supabase.rpc("book_reserve_walk_in", { p_patient: p.patient, p_service: p.service, p_level: p.level ?? undefined, p_starts: p.starts ?? undefined, p_specialist: p.specialist ?? undefined, p_check_in: p.checkIn }));
  invalidate("appointments"); invalidate("reserve"); invalidate("queue");
  return row;
}

export async function overridePreview(p: { patient: string; service: string; level: string | null; starts: string }): Promise<OverridePlan> {
  return ok(await supabase.rpc("vip_override_preview", { p_patient: p.patient, p_service: p.service, p_level: p.level as string, p_starts: p.starts })) as unknown as OverridePlan;
}

export async function vipOverride(p: { patient: string; service: string; level: string | null; starts: string; checkIn: boolean }): Promise<OverridePlan> {
  const r = ok(await supabase.rpc("vip_override", { p_patient: p.patient, p_service: p.service, p_level: p.level as string, p_starts: p.starts, p_check_in: p.checkIn })) as unknown as OverridePlan;
  invalidate("appointments"); invalidate("reserve"); invalidate("queue");
  return r;
}

export async function reserveStatus(day: string = dayKey()): Promise<ReserveRow[]> {
  return must(await supabase.rpc("reserve_status", { p_day: day })) ?? [];
}

export async function setPatientVip(id: string, vip: boolean) {
  ok(await supabase.rpc("set_patient_vip", { p_id: id, p_vip: vip }));
  invalidate("patients"); invalidate("appointments");
}

/** Patient search for the VIP flow (includes the VIP flag). */
export async function searchClients(q: string): Promise<VipClient[]> {
  const s = q.trim().replace(/[,()%]/g, "");
  if (s.length < 2) return [];
  const digits = s.replace(/\D/g, "");
  const phoneQ = /^[+\d\s-]+$/.test(s) && digits.length >= 3 ? digits.replace(/^(00963|963|0)/, "") : s;
  const ors = [`name.ilike.%${s}%`, `phone.ilike.%${phoneQ}%`];
  if (/^\d+$/.test(s)) ors.push(`file_no.eq.${s}`);
  return must(await supabase.from("patients").select("id,name,phone,file_no,vip").or(ors.join(",")).order("vip", { ascending: false }).order("name").limit(8)) ?? [];
}

/* ---------- reserve settings ---------- */
export type ReserveSettings = { pct: number; lastHours: number };
export async function getReserveSettings(): Promise<ReserveSettings> {
  const rows = must(await supabase.from("settings").select("key,value").in("key", ["vip_reserve_pct", "vip_reserve_last_hours"])) ?? [];
  const num = (k: string, d: number) => { const v = rows.find((r) => r.key === k)?.value; const n = typeof v === "number" ? v : Number(v); return Number.isFinite(n) ? n : d; };
  return { pct: num("vip_reserve_pct", 10), lastHours: num("vip_reserve_last_hours", 2) };
}
export async function saveReserveSettings(s: ReserveSettings) {
  const now = new Date().toISOString();
  must(await supabase.from("settings").upsert([
    { key: "vip_reserve_pct", value: Math.max(0, Math.min(50, Math.round(s.pct))), updated_at: now },
    { key: "vip_reserve_last_hours", value: Math.max(0, Math.min(12, Math.round(s.lastHours))), updated_at: now },
  ]));
  invalidate("reserve"); invalidate("appointments");
}

/* ---------- WhatsApp text for a displaced client ---------- */
const whenText = (iso: string) => `${arDate(dateOfKey(dayKey(new Date(iso))), { year: true })} الساعة ${clock(iso)}`;
export function displacedText(c: Pick<Conflict, "name" | "service" | "starts_at" | "alt_starts_at">, centre: Centre) {
  const nm = (c.name ?? "").trim();
  const lines = [
    `مرحباً${nm ? " " + nm : ""}، معكِ ${centre.name_ar || centre.name || "مركز Fatema Beauty"}.`,
    `نعتذر منكِ بشدّة، اضطررنا لتعديل موعد ${c.service ?? "جلستكِ"} الذي كان ${whenText(c.starts_at)} لظرف طارئ في المركز.`,
    c.alt_starts_at ? `اقترحنا لكِ موعداً جديداً: ${whenText(c.alt_starts_at)}. إن لم يناسبكِ، ردّي على هذه الرسالة ونختار معاً الوقت الأنسب لكِ.` : "سنتواصل معكِ لاختيار موعد جديد يناسبكِ، أو ردّي على هذه الرسالة بالوقت الذي يناسبكِ.",
    "شكراً لتفهّمكِ، ونتطلّع لرؤيتكِ.",
  ];
  return lines.join("\n");
}

/** «بقي X من Y دقيقة» */
export const reserveChipText = (r: ReserveRow) => `الاحتياطي: بقي ${r.reserve_left} من ${r.reserve} دقيقة`;
