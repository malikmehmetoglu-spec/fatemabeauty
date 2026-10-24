"use client";

/** «يوم فاطمة» — dictation → Mira structures it → consultant approves → session_note + client notification (rpc fatema_day_send_note, 0174). */
import { supabase } from "@/lib/supabase/client";
import { invalidate } from "./query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type Structured = { findings: string; plan: string; levels: string[]; client_message: string };

/** The consultant whose day is shown: me if I am a consultant, else the first active consultant. */
export async function consultantStaff(me: { id: string; is_consultant: boolean }): Promise<{ id: string; name: string } | null> {
  if (me.is_consultant) {
    const { data } = await supabase.from("staff").select("id, name").eq("id", me.id).maybeSingle();
    return data;
  }
  const { data } = await supabase.from("staff").select("id, name").eq("is_consultant", true).eq("active", true).order("created_at").limit(1);
  return data?.[0] ?? null;
}

/** Ask Mira to structure a dictated transcript. Falls back to the raw transcript when Mira is unavailable. */
export async function structureWithMira(transcript: string): Promise<Structured & { fallback?: boolean }> {
  const t = transcript.trim();
  try {
    const { data, error } = await supabase.functions.invoke("mira", { body: { action: "structure_note", transcript: t } });
    if (error || !data || data.error || typeof data.findings !== "string") throw new Error("mira");
    return { findings: data.findings, plan: data.plan ?? "", levels: Array.isArray(data.levels) ? data.levels : [], client_message: data.client_message ?? "" };
  } catch {
    return { findings: t, plan: "", levels: [], client_message: "", fallback: true };
  }
}

export async function sendFatemaNote(appointmentId: string, s: Structured) {
  const levels = s.levels.map((x) => x.trim()).filter(Boolean);
  const fields = { exam: s.findings.trim(), plan: s.plan.trim(), levels };
  const body = [["الفحص", fields.exam], ["الخطة", fields.plan], ["المستويات الموصى بها", levels.join("، ")]]
    .filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
  const r = await db.rpc("fatema_day_send_note", { p_appointment: appointmentId, p_fields: fields, p_body: body, p_client_text: s.client_message });
  if (r.error) throw new Error(/not allowed/.test(r.error.message) ? "ليست لديكِ صلاحية لهذا الإجراء." : "تعذّر الحفظ. حاولي مرة أخرى.");
  invalidate("clinical");
}
