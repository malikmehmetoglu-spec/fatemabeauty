"use client";

/** «مرايتي» — the consultant's personal assistant (migration 0179, edge function «maraiti»). Consultant only. */
import { supabase } from "@/lib/supabase/client";
import { must, revalidate } from "./query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type MaraitiTask = {
  kind: "consult_today" | "written" | "mira" | "note_missing" | "intake_review" | "reminder";
  ref_id: string; patient_id: string | null; title: string; detail: string | null; at: string | null; urgent: boolean; sort_key: number;
};
/** Proactive cards (migration 0181) carry a kind; plain chat messages have kind = null. */
export type MaraitiCardKind = "digest" | "pre_appt" | "client_chat" | "written_paid" | "intake" | "reminder";
export type ChatLine = { from: "patient" | "staff" | "mira"; body: string; at: string };
export type MaraitiMessage = {
  id: string; role: "user" | "assistant"; body: string; created_at: string;
  kind: MaraitiCardKind | null; ref_id: string | null; seen_at: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: { patient_id?: string; patient_name?: string; written_consult_id?: string; appointment_id?: string; messages?: ChatLine[]; brief?: string; urgent?: boolean; intake?: any; photos?: number; action_id?: string };
};
export type ActionKind = "book_appointment" | "send_client_message" | "reschedule" | "remind_me" | "cancel_appointment" | "add_patient"
  | "write_session_note" | "reply_written_consult" | "reply_mira_thread" | "mark_intake_reviewed";
export type MaraitiAction = {
  id: string; kind: ActionKind; title: string;
  payload: Record<string, string>; status: "pending" | "approved" | "dismissed" | "failed"; result: string | null; created_at: string;
};

export async function maraitiTasks(): Promise<MaraitiTask[]> {
  return must(await db.rpc("maraiti_tasks")) ?? [];
}
export async function maraitiMessages(): Promise<MaraitiMessage[]> {
  const rows: MaraitiMessage[] = must(await db.from("maraiti_messages").select("id, role, body, created_at, kind, ref_id, payload, seen_at").order("created_at", { ascending: false }).limit(60)) ?? [];
  return rows.reverse();
}
export async function maraitiActions(): Promise<MaraitiAction[]> {
  const since = new Date(Date.now() - 2 * 864e5).toISOString();
  return must(await db.from("maraiti_actions").select("id, kind, title, payload, status, result, created_at")
    .or(`status.eq.pending,decided_at.gte.${since}`).order("created_at", { ascending: false }).limit(30)) ?? [];
}

/** Sends her message to Maraiti. Returns "offline" when the assistant is not deployed / configured yet. */
/** Unread proactive / assistant messages (nav badge). */
export async function maraitiUnseen(): Promise<number> {
  const { count } = await db.from("maraiti_messages").select("id", { count: "exact", head: true }).eq("role", "assistant").is("seen_at", null);
  return count ?? 0;
}
export async function maraitiSeen() {
  await db.rpc("maraiti_seen");
  revalidate("maraiti");
}

type ReplyTo = { kind: MaraitiCardKind; payload: MaraitiMessage["payload"] };
/** Sends her message to Maraiti. `replyTo` turns it directly into a reply draft for that card's client. */
export async function askMaraiti(text: string, opts: { replyTo?: ReplyTo | null; context?: Pick<MaraitiMessage, "kind" | "body" | "payload">[] } = {}): Promise<"ok" | "offline" | "error"> {
  try {
    const context = (opts.context ?? []).map((c) => ({ kind: c.kind, body: c.body, payload: { ...c.payload, messages: undefined, intake: undefined } }));
    const { data, error } = await supabase.functions.invoke("maraiti", { body: { text, reply_to: opts.replyTo ?? undefined, context } });
    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      return !status || status === 404 || status === 503 ? "offline" : "error";
    }
    return data?.ok ? "ok" : "error";
  } catch { return "offline"; }
  finally { revalidate("maraiti"); }
}

const ERR: [RegExp, string][] = [
  [/slot taken/, "هذا الوقت محجوز. اختاري وقتاً آخر."],
  [/past/, "الوقت المختار مضى."],
  [/not movable/, "لا يمكن نقل هذا الموعد الآن."],
  [/not allowed|staff only/, "ليست لديكِ صلاحية لهذا الإجراء."],
  [/cannot cancel/, "لا يمكن إلغاء هذا الموعد الآن."],
  [/not_paid/, "الاستشارة غير مدفوعة بعد."],
  [/no_intake/, "لا يوجد نموذج لهذا الموعد."],
  [/patients_phone|duplicate key/, "هذا الرقم مسجّل لعميلة أخرى."],
  [/empty/, "النص فارغ."],
];
export const friendlyError = (m: string | null) => (m ? ERR.find(([r]) => r.test(m))?.[1] ?? "تعذّر التنفيذ. جرّبي مرة ثانية." : "");

export async function decideAction(id: string, decision: "approve" | "dismiss", payload?: Record<string, string>) {
  const row = must(await db.rpc("maraiti_decide", { p_id: id, p_decision: decision, p_payload: payload ?? null })) as MaraitiAction;
  revalidate("maraiti"); revalidate("appointments"); revalidate("mira"); revalidate("clinical");
  return row;
}
export async function reminderDone(id: string) {
  must(await db.rpc("maraiti_reminder_done", { p_id: id }));
  revalidate("maraiti");
}
