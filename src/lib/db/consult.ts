"use client";

/** Online consultation + patient/centre chat (live, Supabase). Video calls are not connected yet. */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must, revalidate } from "./query";

export type Message = Tables<"messages">;
export type Service = Tables<"services">;

/** The online-consultation service, if the centre has defined one (key or name mentions online). */
export async function getConsultService(): Promise<Service | null> {
  const rows = must(await supabase.from("services").select("*").eq("active", true).order("sort")) ?? [];
  return rows.find((s) => s.is_consultation && /online|remote|video|أونلاين|عن بعد|عن بُعد|فيديو/i.test(s.key + s.name))
    ?? rows.find((s) => /online|remote|video/i.test(s.key))
    ?? rows.find((s) => /أونلاين|اون لاين|أون لاين|عن بعد|عن بُعد|مرئي|فيديو/.test(s.name))
    ?? null;
}

export type ConsultAppt = {
  id: string; starts_at: string; minutes: number; status: string; walk_in_name?: string | null; walk_in_phone?: string | null;
  patients: { name: string; file_no: number; phone: string | null } | null;
  staff: { name: string } | null;
};

/** Staff: upcoming and recent online consultations. */
export async function listConsults(serviceKey: string) {
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const res = await supabase.from("appointments").select("id, starts_at, minutes, status, walk_in_name, walk_in_phone, patients(name, file_no, phone), staff(name)")
    .eq("service_key", serviceKey).gte("starts_at", since).neq("status", "cancelled").order("starts_at");
  return must(res) as unknown as ConsultAppt[];
}

/** Patient: her own online consultations (RLS limits rows to her). */
export async function myConsults(serviceKey: string) {
  const res = await supabase.from("appointments").select("id, starts_at, minutes, status, patients(name, file_no, phone), staff(name)")
    .eq("service_key", serviceKey).neq("status", "cancelled").order("starts_at", { ascending: false });
  return must(res) as unknown as ConsultAppt[];
}

export async function bookConsult(serviceKey: string, startsAt: string) {
  const row = must(await supabase.rpc("book_appointment", { p_service: serviceKey, p_starts: startsAt }));
  invalidate("consult"); invalidate("appointments");
  return row;
}

export async function bookedRanges(from: string, to: string) {
  return must(await supabase.rpc("booked_ranges", { p_from: from, p_to: to }));
}

/* ---------- chat ---------- */

export async function listMessages(patientId: string) {
  return must(await supabase.from("messages").select("*").eq("patient_id", patientId).order("created_at").limit(500));
}

export async function sendMessage(patientId: string, body: string) {
  must(await supabase.from("messages").insert({ patient_id: patientId, from_patient: true, body: body.trim() }));
}

/** Live updates for one conversation. Returns an unsubscribe function. */
export function subscribeMessages(patientId: string, onRow: (m: Message) => void) {
  const ch = supabase.channel(`messages:${patientId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `patient_id=eq.${patientId}` },
      (p) => onRow(p.new as Message))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

/* ---------- opening hours & summary ---------- */

export type Hours = { from: string; to: string; days: number[]; slot: number };
export async function getHours(): Promise<Hours> {
  const row = must(await supabase.from("settings").select("value").eq("key", "hours").maybeSingle());
  return { from: "10:00", to: "18:00", days: [0, 1, 2, 3, 4, 6], slot: 15, ...((row?.value as object) ?? {}) };
}

/** Prescriptions written for the signed-in patient on a given Damascus day (RLS: own rows only). */
export async function myPrescriptionsBetween(from: string, to: string) {
  const res = await supabase.from("prescriptions").select("id, items, created_at").gte("created_at", from).lt("created_at", to).order("created_at");
  return must(res);
}

/* ---------- staff side of the chat ---------- */

export type InboxMsg = Message & { patients: { name: string; file_no: number } | null };

/** Latest messages across all patients (staff only via RLS). */
export async function listInbox() {
  const res = await supabase.from("messages").select("*, patients(name, file_no)").order("created_at", { ascending: false }).limit(500);
  return (must(res) ?? []) as unknown as InboxMsg[];
}

export async function staffReply(patientId: string, staffId: string, body: string) {
  must(await supabase.from("messages").insert({ patient_id: patientId, from_patient: false, staff_id: staffId, body: body.trim() }));
  revalidate("inbox");
}

export async function markRead(patientId: string) {
  must(await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("patient_id", patientId).eq("from_patient", true).is("read_at", null));
}

/** Live updates for every conversation (staff). */
export function subscribeInbox(onChange: () => void) {
  const ch = supabase.channel("messages:inbox")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => onChange())
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
