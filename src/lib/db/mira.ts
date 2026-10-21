import { supabase } from "@/lib/supabase/client";
import { invalidate } from "./query";

/* «ميرا» — the clinic's AI assistant. Tables: mira_threads, mira_drafts, mira_kb; settings key «mira». */

// The new tables are not in the generated types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const must = <T,>(r: { data: T; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data; };

export type MiraConfig = { enabled: boolean; mode: "draft" | "auto"; model: string; address: string };
export type MiraThread = { patient_id: string; status: "mira" | "fatema"; urgent: boolean; reason: string | null; summary: string | null; handoff_at: string | null; resolved_at: string | null; updated_at: string };
export type MiraDraft = { id: string; patient_id: string; body: string; status: "pending" | "sent" | "discarded"; created_at: string };
export type MiraKb = { id: string; question: string; answer: string; active: boolean; sort: number };

const DEFAULT: MiraConfig = { enabled: true, mode: "draft", model: "claude-haiku-5-5", address: "" };

/** Patient app: ask Mira to answer the latest message. Fire-and-forget; her reply arrives through Realtime. */
export async function askMira(): Promise<{ handed?: boolean; skipped?: string; error?: string; mode?: string }> {
  const { data, error } = await supabase.functions.invoke("mira", { body: {} });
  if (error) return { error: error.message };
  return data ?? {};
}

/** Patient app: is my conversation with Mira, or with Fatema? */
export async function myThread(patientId: string): Promise<MiraThread | null> {
  return must(await db.from("mira_threads").select("*").eq("patient_id", patientId).maybeSingle());
}

export async function getMiraConfig(): Promise<MiraConfig> {
  const row = must(await supabase.from("settings").select("value").eq("key", "mira").maybeSingle()) as { value: Partial<MiraConfig> } | null;
  return { ...DEFAULT, ...(row?.value ?? {}) };
}
export async function saveMiraConfig(c: MiraConfig) {
  must(await supabase.from("settings").upsert({ key: "mira", value: c, updated_at: new Date().toISOString() }));
  invalidate("mira");
}

export async function listThreads(): Promise<MiraThread[]> {
  return must(await db.from("mira_threads").select("*").order("updated_at", { ascending: false }).limit(500)) ?? [];
}
export async function listPendingDrafts(): Promise<MiraDraft[]> {
  return must(await db.from("mira_drafts").select("*").eq("status", "pending").order("created_at")) ?? [];
}

/** Approve a draft (optionally edited): it becomes Mira's message in the patient's chat. */
export async function sendDraft(d: MiraDraft, body: string, staffId: string | null) {
  const text = body.trim();
  if (!text) throw new Error("الرد فارغ.");
  must(await db.from("mira_drafts").update({ status: "sent", body: text, decided_by: staffId, decided_at: new Date().toISOString() }).eq("id", d.id).eq("status", "pending"));
  // Staff are allowed to insert non-patient rows; the author column marks it as Mira's voice.
  must(await supabase.from("messages").insert({ patient_id: d.patient_id, from_patient: false, staff_id: staffId, body: text, author: "mira" } as never));
  invalidate("mira"); invalidate("inbox");
}
export async function discardDraft(id: string, staffId: string | null) {
  must(await db.from("mira_drafts").update({ status: "discarded", decided_by: staffId, decided_at: new Date().toISOString() }).eq("id", id));
  invalidate("mira");
}

/** Fatema finished with a handed-over conversation: Mira takes it back. */
export async function returnToMira(patientId: string) {
  must(await db.from("mira_threads").update({ status: "mira", urgent: false, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("patient_id", patientId));
  invalidate("mira");
}
/** Fatema takes a conversation over herself (Mira stops answering it). */
export async function takeOver(patientId: string) {
  const now = new Date().toISOString();
  must(await db.from("mira_threads").update({ status: "fatema", handoff_at: now, reason: "تولّته أ. فاطمة", updated_at: now }).eq("patient_id", patientId));
  invalidate("mira");
}

export async function listKb(): Promise<MiraKb[]> {
  return must(await db.from("mira_kb").select("*").order("sort").order("question")) ?? [];
}
export async function saveKb(k: Partial<MiraKb> & { question: string; answer: string }) {
  const row = { question: k.question.trim(), answer: k.answer.trim(), active: k.active ?? true, sort: k.sort ?? 0, updated_at: new Date().toISOString() };
  if (!row.question || !row.answer) throw new Error("اكتبي السؤال والجواب.");
  must(k.id ? await db.from("mira_kb").update(row).eq("id", k.id) : await db.from("mira_kb").insert(row));
  invalidate("mira");
}
export async function deleteKb(id: string) {
  must(await db.from("mira_kb").delete().eq("id", id));
  invalidate("mira");
}

/** Conversations needing a human: handed to Fatema + drafts waiting for approval (sidebar badge). */
export async function miraAttention(): Promise<number> {
  const [a, b] = await Promise.all([
    db.from("mira_threads").select("patient_id", { count: "exact", head: true }).eq("status", "fatema"),
    db.from("mira_drafts").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return (a.count ?? 0) + (b.count ?? 0);
}

export function subscribeMira(onChange: () => void) {
  const ch = supabase.channel("mira:staff")
    .on("postgres_changes", { event: "*", schema: "public", table: "mira_threads" }, () => onChange())
    .on("postgres_changes", { event: "*", schema: "public", table: "mira_drafts" }, () => onChange())
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}
