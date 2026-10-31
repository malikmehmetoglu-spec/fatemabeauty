"use client";

/** Marketing, loyalty, reviews, surveys, gift requests, policies and the audit log (live, Supabase). */
import { supabase, type Tables } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { invalidate, must } from "./query";

export type Offer = Tables<"offers">;
export type Campaign = Tables<"campaigns">;
export type Review = Tables<"reviews">;
export type AuditRow = Tables<"audit_log">;

/* ---------- settings helpers ---------- */

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = must(await supabase.from("settings").select("value").eq("key", key).maybeSingle());
  return row ? ({ ...fallback, ...(row.value as object) } as T) : fallback;
}

export async function saveSetting(key: string, value: unknown) {
  must(await supabase.from("settings").upsert({ key, value: value as Json, updated_at: new Date().toISOString() }));
  invalidate("settings");
}

/* ---------- offers & codes ---------- */

export type OfferInput = Partial<Omit<Offer, "created_at" | "uses">> & { title: string; value: number };

export async function listOffers() {
  return must(await supabase.from("offers").select("*").order("created_at", { ascending: false }));
}

export async function saveOffer(input: OfferInput) {
  const { id, ...rest } = input;
  const row = { ...rest, code: rest.code ? rest.code.trim().toUpperCase() : null };
  if (id) must(await supabase.from("offers").update(row).eq("id", id));
  else must(await supabase.from("offers").insert(row));
  invalidate("offers");
}

export async function setOfferActive(id: string, active: boolean) {
  must(await supabase.from("offers").update({ active }).eq("id", id));
  invalidate("offers");
}

export function offerStatus(o: Offer): { label: string; kind: "green" | "gray" | "amber" | "pink" } {
  const today = new Date().toISOString().slice(0, 10);
  if (!o.active) return { label: "متوقف", kind: "amber" };
  if (o.max_uses && o.uses >= o.max_uses) return { label: "مكتمل", kind: "gray" };
  if (o.ends_on && o.ends_on < today) return { label: "منتهٍ", kind: "gray" };
  if (o.starts_on && o.starts_on > today) return { label: "مجدول", kind: "pink" };
  return { label: "فعّال", kind: "green" };
}

/* ---------- loyalty ---------- */

export type Tier = { name: string; min: number };
export type Loyalty = { points_per: number; points_value: number; tiers: Tier[] };
export const LOYALTY_DEFAULT: Loyalty = { points_per: 1000, points_value: 0, tiers: [] };

export const getLoyalty = () => getSetting<Loyalty>("loyalty", LOYALTY_DEFAULT);

export function tierOf(points: number, tiers: Tier[]) {
  return [...tiers].sort((a, b) => b.min - a.min).find((t) => points >= t.min) ?? null;
}

export async function listMembers() {
  return must(await supabase.from("patients").select("id, name, file_no, phone, points").gt("points", 0).order("points", { ascending: false }).limit(200));
}

/* ---------- campaigns (drafts; sending is not connected yet) ---------- */

export const AUDIENCES = [
  { value: "all", label: "كل العميلات" },
  { value: "new", label: "مراجعات جدد (آخر 30 يوماً)" },
  { value: "lapsed", label: "لم تزر المركز منذ 90 يوماً" },
  { value: "members", label: "لديها نقاط ولاء" },
] as const;
export type Audience = (typeof AUDIENCES)[number]["value"];

export async function audienceCounts(): Promise<Record<Audience, number>> {
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const since90 = new Date(Date.now() - 90 * 864e5).toISOString();
  const [all, fresh, members, recent] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("patients").select("id", { count: "exact", head: true }).gte("created_at", since30),
    supabase.from("patients").select("id", { count: "exact", head: true }).gt("points", 0),
    supabase.from("appointments").select("patient_id").not("patient_id", "is", null).gte("starts_at", since90).neq("status", "cancelled"),
  ]);
  for (const r of [all, fresh, members, recent]) if (r.error) throw new Error(r.error.message);
  const active = new Set((recent.data ?? []).map((a) => a.patient_id));
  const total = all.count ?? 0;
  return { all: total, new: fresh.count ?? 0, members: members.count ?? 0, lapsed: Math.max(0, total - active.size) };
}

export async function listCampaigns() {
  return must(await supabase.from("campaigns").select("*").order("updated_at", { ascending: false }));
}

export async function saveCampaign(c: { id?: string; title: string; body: string; audience: string; channel: string }) {
  const { id, ...rest } = c;
  if (id) must(await supabase.from("campaigns").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id));
  else must(await supabase.from("campaigns").insert(rest));
  invalidate("campaigns");
}

/* ---------- reviews ---------- */

export type ReviewRow = Review & {
  patients: { name: string; file_no: number } | null;
  appointments: { starts_at: string; services: { name: string } | null; staff: { name: string } | null } | null;
};

export async function listReviews() {
  const res = await supabase.from("reviews")
    .select("*, patients(name, file_no), appointments(starts_at, services(name), staff(name))")
    .order("created_at", { ascending: false }).limit(300);
  return must(res) as unknown as ReviewRow[];
}

/** Patient: the appointment she is reviewing (her own, via RLS). */
export async function getMyAppointment(id: string) {
  const res = await supabase.from("appointments").select("id, starts_at, status, services(name), staff(name, photo_url)").eq("id", id).maybeSingle();
  return must(res) as unknown as { id: string; starts_at: string; status: string; services: { name: string } | null; staff: { name: string; photo_url: string | null } | null } | null;
}

/** Patient: her latest finished session (used when no appointment id is given). */
export async function getMyLastDone(patientId: string) {
  const res = await supabase.from("appointments").select("id, starts_at, status, services(name), staff(name, photo_url)")
    .eq("patient_id", patientId).eq("status", "done").order("starts_at", { ascending: false }).limit(1).maybeSingle();
  return must(res) as unknown as Awaited<ReturnType<typeof getMyAppointment>>;
}

export async function submitReview(r: { patient_id: string; appointment_id: string | null; stars: number; tags: string[]; note: string }) {
  must(await supabase.from("reviews").insert({ ...r, note: r.note.trim() || null }));
  invalidate("reviews");
}

export async function submitSurvey(s: { patient_id: string; appointment_id: string | null; answers: Record<string, string | number>; note: string }) {
  must(await supabase.from("surveys").insert({ ...s, note: s.note.trim() || null }));
}

export async function submitGift(g: { patient_id: string; recipient_name: string; recipient_phone: string; amount: number | null; service_key: string | null; message: string }) {
  must(await supabase.from("gift_requests").insert({
    ...g, recipient_phone: g.recipient_phone.trim() || null, message: g.message.trim() || null,
  }));
}

/* ---------- policies ---------- */

export type Policies = {
  free_change_hours: number; reminders_hours: number[]; max_discount_without_approval: number;
  no_show_rule: number; deposit_required: boolean; waitlist: boolean; waitlist_reply_min: number; channels: string[];
};
export const POLICIES_DEFAULT: Policies = {
  free_change_hours: 6, reminders_hours: [24, 2], max_discount_without_approval: 10,
  no_show_rule: 0, deposit_required: false, waitlist: true, waitlist_reply_min: 30, channels: ["app"],
};
export const getPolicies = () => getSetting<Policies>("policies", POLICIES_DEFAULT);

/* ---------- audit ---------- */

export async function listAudit(limit = 300) {
  return must(await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(limit));
}

export async function staffByUser() {
  const rows = must(await supabase.from("staff").select("user_id, name")) ?? [];
  return new Map(rows.filter((r) => r.user_id).map((r) => [r.user_id as string, r.name]));
}
