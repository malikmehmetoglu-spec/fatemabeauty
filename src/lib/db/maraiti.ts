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
export type MaraitiMessage = { id: string; role: "user" | "assistant"; body: string; created_at: string };
export type MaraitiAction = {
  id: string; kind: "book_appointment" | "send_client_message" | "reschedule" | "remind_me"; title: string;
  payload: Record<string, string>; status: "pending" | "approved" | "dismissed" | "failed"; result: string | null; created_at: string;
};

export async function maraitiTasks(): Promise<MaraitiTask[]> {
  return must(await db.rpc("maraiti_tasks")) ?? [];
}
export async function maraitiMessages(): Promise<MaraitiMessage[]> {
  const rows: MaraitiMessage[] = must(await db.from("maraiti_messages").select("id, role, body, created_at").order("created_at", { ascending: false }).limit(60)) ?? [];
  return rows.reverse();
}
export async function maraitiActions(): Promise<MaraitiAction[]> {
  const since = new Date(Date.now() - 2 * 864e5).toISOString();
  return must(await db.from("maraiti_actions").select("id, kind, title, payload, status, result, created_at")
    .or(`status.eq.pending,decided_at.gte.${since}`).order("created_at", { ascending: false }).limit(30)) ?? [];
}

/** Sends her message to Maraiti. Returns "offline" when the assistant is not deployed / configured yet. */
export async function askMaraiti(text: string): Promise<"ok" | "offline" | "error"> {
  try {
    const { data, error } = await supabase.functions.invoke("super-function" /* deployed slug of «maraiti» */, { body: { text } });
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
  [/not allowed/, "ليست لديكِ صلاحية لهذا الإجراء."],
];
export const friendlyError = (m: string | null) => (m ? ERR.find(([r]) => r.test(m))?.[1] ?? "تعذّر التنفيذ. جرّبي مرة ثانية." : "");

export async function decideAction(id: string, decision: "approve" | "dismiss", payload?: Record<string, string>) {
  const row = must(await db.rpc("maraiti_decide", { p_id: id, p_decision: decision, p_payload: payload ?? null })) as MaraitiAction;
  revalidate("maraiti"); revalidate("appointments");
  return row;
}
export async function reminderDone(id: string) {
  must(await db.rpc("maraiti_reminder_done", { p_id: id }));
  revalidate("maraiti");
}
