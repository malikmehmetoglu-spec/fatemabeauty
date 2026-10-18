"use client";

/** Patients — the list, one record, her own profile/conditions/settings, loyalty tier, notifications. */
import { supabase, type Tables } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { invalidate, must, useQuery } from "./query";
import { useRequirePatient } from "@/lib/supabase/session";

export type Patient = Tables<"patients">;
export type Condition = Tables<"patient_conditions">;
export type Notification = Tables<"notifications">;
export type ConditionKind = "allergy" | "medication" | "concern";

export const SKIN_TYPES = ["دهنية", "جافة", "مختلطة", "عادية", "حساسة"];

/** Masked phone for lists: "+963 9•• ••• •44". */
export function maskPhone(p?: string | null) {
  if (!p) return "—";
  const d = p.replace(/\D/g, "");
  return `+963 9•• ••• •${d.slice(-2)}`;
}

export type PatientRow = Patient & {
  conditions: Pick<Condition, "kind" | "name">[];
  packages: { sessions_total: number; sessions_used: number; packages: { name: string } | null }[];
  lastVisit: string | null;
  due: number;
};

/** Every patient with what the list needs (staff only — RLS). */
export async function listPatients(): Promise<PatientRow[]> {
  const [pats, conds, pkgs, appts, inv] = await Promise.all([
    supabase.from("patients").select("*").order("created_at", { ascending: false }),
    supabase.from("patient_conditions").select("patient_id, kind, name"),
    supabase.from("patient_packages").select("patient_id, sessions_total, sessions_used, packages(name)"),
    supabase.from("appointments").select("patient_id, starts_at").eq("status", "done").not("patient_id", "is", null),
    supabase.from("invoices").select("patient_id, total").eq("paid", false).not("patient_id", "is", null),
  ]);
  const rows = must(pats) ?? [];
  const last = new Map<string, string>();
  for (const a of must(appts) ?? []) if (a.patient_id && (!last.has(a.patient_id) || a.starts_at > last.get(a.patient_id)!)) last.set(a.patient_id, a.starts_at);
  const due = new Map<string, number>();
  for (const i of must(inv) ?? []) if (i.patient_id) due.set(i.patient_id, (due.get(i.patient_id) ?? 0) + i.total);
  const cs = must(conds) ?? [], ps = must(pkgs) ?? [];
  return rows.map((p) => ({
    ...p,
    conditions: cs.filter((c) => c.patient_id === p.id),
    packages: ps.filter((x) => x.patient_id === p.id),
    lastVisit: last.get(p.id) ?? null,
    due: due.get(p.id) ?? 0,
  })).sort((a, b) => (b.lastVisit ?? b.created_at).localeCompare(a.lastVisit ?? a.created_at));
}

export async function getPatient(id: string) {
  return must(await supabase.from("patients").select("*").eq("id", id).maybeSingle());
}

/** Staff opens a file at reception. */
export async function createPatient(input: { name: string; phone: string | null; birth_date: string | null; skin_type: string | null; notes: string | null }) {
  const row = must(await supabase.from("patients").insert(input).select().single());
  invalidate("patients");
  return row;
}

export async function updatePatient(id: string, patch: Partial<Pick<Patient, "name" | "phone" | "birth_date" | "skin_type" | "pregnant" | "breastfeeding" | "notes" | "lang">> & { notify?: Json }) {
  const row = must(await supabase.from("patients").update(patch).eq("id", id).select().single());
  invalidate("patients"); invalidate("me");
  return row;
}

/* ---------- preferences (patients.notify jsonb) ---------- */

export type NotifyPrefs = { whatsapp: boolean; sms: boolean; app: boolean; offers: boolean; photos_marketing: boolean };
const PREF_DEFAULTS: NotifyPrefs = { whatsapp: true, sms: true, app: true, offers: false, photos_marketing: false };
export function prefsOf(v: unknown): NotifyPrefs {
  const o = (v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Record<string, unknown>;
  const out = { ...PREF_DEFAULTS };
  for (const k of Object.keys(out) as (keyof NotifyPrefs)[]) if (typeof o[k] === "boolean") out[k] = o[k] as boolean;
  return out;
}

/* ---------- conditions ---------- */

export async function listConditions(patientId: string) {
  return must(await supabase.from("patient_conditions").select("*").eq("patient_id", patientId).order("created_at"));
}

export async function addCondition(patientId: string, kind: ConditionKind, name: string) {
  must(await supabase.from("patient_conditions").insert({ patient_id: patientId, kind, name: name.trim() }));
  invalidate("conditions"); invalidate("patients");
}

/** Removing is done by the patient or staff; RLS allows the delete on her own rows. */
export async function removeCondition(id: string) {
  must(await supabase.from("patient_conditions").delete().eq("id", id));
  invalidate("conditions"); invalidate("patients");
}

/* ---------- loyalty ---------- */

export type Tier = { name: string; min: number };

/** Tiers from the settings row "loyalty" ({ tiers: [{ name, min }] }); none → no tier shown. */
export async function getTiers(): Promise<Tier[]> {
  const row = must(await supabase.from("settings").select("value").eq("key", "loyalty").maybeSingle());
  const v = row?.value as { tiers?: { name?: string; min?: number; points?: number }[] } | null;
  return (v?.tiers ?? []).filter((t) => t.name).map((t) => ({ name: String(t.name), min: Number(t.min ?? t.points ?? 0) })).sort((a, b) => a.min - b.min);
}

export function tierFor(points: number, tiers: Tier[]) {
  let cur: Tier | null = null;
  for (const t of tiers) if (points >= t.min) cur = t;
  return cur;
}

/* ---------- notifications ---------- */

export async function listMyNotifications(patientId: string) {
  return must(await supabase.from("notifications").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(100));
}

export async function markNotificationsRead(patientId: string) {
  must(await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("patient_id", patientId).is("read_at", null));
  invalidate("notifications");
}

export async function signOut() {
  await supabase.auth.signOut();
}

/* ---------- the signed-in patient ---------- */

/** Patient pages: redirects to login when signed out; `me` is her fresh row (reloads after updatePatient). */
export function useMe() {
  const s = useRequirePatient();
  const id = s.patient?.id ?? "";
  const q = useQuery(["me", id], () => getPatient(id), { enabled: !!id });
  return { me: q.data ?? null, loading: s.loading || (!!id && q.loading), error: q.error, signedOut: !s.loading && !s.patient };
}
