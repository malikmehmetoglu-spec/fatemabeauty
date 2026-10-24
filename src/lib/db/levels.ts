"use client";

/**
 * Service levels («عادية / مكثّفة / علاجية مطوّلة»), the patient's level per service, the pay-before-start gate,
 * the session timer and prepaid session extensions. Server rules live in migration 0140.
 */
import { useEffect, useState } from "react";
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Level = Tables<"service_levels">;
export type Extension = Tables<"session_extensions">;
export type LevelFor = { id: string; level: number; name: string; minutes: number; price: number | null };

/** Readable Arabic for the new server errors (others fall through to the caller's mapper). */
export function levelError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  if (/^[؀-ۿ]/.test(m)) return m;
  if (/not allowed/.test(m)) return "لا تملكين صلاحية لهذا الإجراء.";
  if (/cash or card only/.test(m)) return "الدفع نقداً أو بالبطاقة فقط.";
  if (/unique|duplicate/i.test(m)) return "يوجد مستوى بهذا الرقم لهذه الخدمة.";
  if (/minutes/.test(m)) return "المدة غير صحيحة (من 1 إلى 600 دقيقة).";
  return "تعذّر الحفظ. حاولي مرة أخرى.";
}
const ok = <T,>(res: { data: T; error: { message: string } | null }) => {
  if (res.error) throw new Error(levelError(new Error(res.error.message)));
  return res.data;
};

/* ---------- levels catalogue ---------- */

/** All levels (staff see inactive ones too), ordered by service then level. */
export async function listLevels(): Promise<Level[]> {
  return must(await supabase.from("service_levels").select("*").order("service_key").order("level")) ?? [];
}
export const levelsOf = (all: Level[] | undefined, service: string | null | undefined, activeOnly = true) =>
  (all ?? []).filter((l) => l.service_key === service && (!activeOnly || l.active)).sort((a, b) => a.level - b.level);

export async function saveLevel(l: Pick<Level, "id" | "name" | "minutes" | "price" | "price_currency"> & { extension_price_30?: number | null }) {
  ok(await supabase.from("service_levels").update({
    name: l.name.trim(), minutes: l.minutes, price: l.price, price_currency: l.price_currency, extension_price_30: l.extension_price_30 ?? null,
  }).eq("id", l.id));
  invalidate("levels"); invalidate("catalog");
}
/** Hide a level (never deleted: old appointments keep pointing at it). Level 1 is the service's base and stays. */
export async function setLevelActive(id: string, active: boolean) {
  ok(await supabase.from("service_levels").update({ active }).eq("id", id));
  invalidate("levels");
}
/** Adds a level: reactivates a hidden one first, otherwise the next number. */
export async function addLevel(service: string, all: Level[], base: { minutes: number; price: number; price_currency: string }) {
  const mine = all.filter((l) => l.service_key === service);
  const hidden = mine.filter((l) => !l.active).sort((a, b) => a.level - b.level)[0];
  if (hidden) return setLevelActive(hidden.id, true);
  const next = Math.max(0, ...mine.map((l) => l.level)) + 1;
  if (next > 9) throw new Error("الحد الأقصى 9 مستويات للخدمة.");
  ok(await supabase.from("service_levels").insert({ service_key: service, level: next, name: `مستوى ${next}`, minutes: base.minutes, price: base.price, price_currency: base.price_currency, sort: next }));
  invalidate("levels");
}

/* ---------- extension price setting ---------- */

export const DEFAULT_EXTENSION_PRICE = 500;
export async function getExtensionPrice(): Promise<number> {
  const row = must(await supabase.from("settings").select("value").eq("key", "extension_price_30").maybeSingle());
  return typeof row?.value === "number" ? row.value : DEFAULT_EXTENSION_PRICE;
}
export async function saveExtensionPrice(n: number) {
  ok(await supabase.from("settings").upsert({ key: "extension_price_30", value: Math.max(0, Math.round(n)), updated_at: new Date().toISOString() }));
  invalidate("levels");
}

/* ---------- patient's level per service ---------- */

export async function patientLevels(patientId: string) {
  return must(await supabase.from("patient_service_levels").select("*").eq("patient_id", patientId)) ?? [];
}
export async function setPatientLevel(patientId: string, service: string, levelId: string | null) {
  ok(await supabase.rpc("set_patient_service_level", { p_patient: patientId, p_service: service, p_level: levelId as string }));
  invalidate("levels");
}
/** The level a booking gets (patient: own file; staff: the given patient's assigned level, else level 1). */
export async function levelFor(service: string, patientId?: string | null): Promise<LevelFor | null> {
  return ok(await supabase.rpc("service_level_for", { p_service: service, p_patient: patientId ?? undefined })) as unknown as LevelFor | null;
}

/* ---------- payment gate ---------- */

type PayFields = { price: number | null; patient_package_id: string | null; start_override_at?: string | null; invoices?: { paid: boolean; void: boolean }[] | null };
/** Paid = a non-void linked invoice fully paid, a package session, a free session, or an admin override. */
export const isPaid = (a: PayFields) =>
  !a.price || !!a.patient_package_id || !!a.start_override_at || (a.invoices ?? []).some((i) => i.paid && !i.void);

export async function overrideStart(appt: string, reason: string) {
  ok(await supabase.rpc("override_start_without_payment", { p_appt: appt, p_reason: reason }));
  invalidate("appointments"); invalidate("queue");
}

/* ---------- extensions ---------- */

export type PendingExtension = Extension & {
  appointment: { id: string; patient_id: string | null; walk_in_name: string | null; service_key: string; room_id: string | null;
    patient: { name: string; file_no: number } | null; service: { name: string } | null; room: { name: string } | null; specialist: { name: string } | null } | null;
};
export async function listPendingExtensions(): Promise<PendingExtension[]> {
  return must(await supabase.from("session_extensions")
    .select("*, appointment:appointments(id,patient_id,walk_in_name,service_key,room_id, patient:patients(name,file_no), service:services(name), room:rooms(name), specialist:staff(name))")
    .eq("status", "requested").order("created_at")) as unknown as PendingExtension[];
}
export async function requestExtension(appt: string, minutes: 30 | 60) {
  ok(await supabase.rpc("request_session_extension", { p_appt: appt, p_minutes: minutes }));
  invalidate("extensions");
}
export async function chargeExtension(id: string, method: "cash" | "card") {
  ok(await supabase.rpc("charge_session_extension", { p_ext: id, p_method: method }));
  invalidate("extensions"); invalidate("appointments"); invalidate("invoices");
}
export async function declineExtension(id: string) {
  ok(await supabase.rpc("decline_session_extension", { p_ext: id }));
  invalidate("extensions");
}

/** Pending extension requests, live (realtime + 20 s fallback). */
export function useLiveExtensions(channel: string) {
  useEffect(() => {
    const ch = supabase.channel(channel).on("postgres_changes", { event: "*", schema: "public", table: "session_extensions" }, () => invalidate("extensions")).subscribe();
    const t = setInterval(() => invalidate("extensions"), 20000);
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [channel]);
}

/* ---------- timer ---------- */

/** Re-renders every second. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}
/** Seconds left of an in-session appointment (negative = overtime). */
export function secondsLeft(a: { started_at: string | null; starts_at: string; minutes: number; extension_minutes?: number | null }, now: number) {
  const start = new Date(a.started_at ?? a.starts_at).getTime();
  return Math.round((start + (a.minutes + (a.extension_minutes ?? 0)) * 60000 - now) / 1000);
}
export const mmss = (s: number) => {
  const v = Math.abs(s); const h = Math.floor(v / 3600); const m = Math.floor((v % 3600) / 60); const x = v % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : String(m).padStart(2, "0")) + `:${String(x).padStart(2, "0")}`;
};
