"use client";

/**
 * Consultant time protection (migration 0170_consult_blocks_intake.sql).
 *  - «قالب الاستشارات»: weekly blocks per consultant (table consult_blocks). Kinds: in_person / online / review / admin.
 *    With active blocks, public + app booking of a consultation only offers the matching blocks; without blocks her
 *    «أوقات الدوام» apply. Delete = deactivate (active=false).
 *  - settings consult_buffer_min (default 10) and consult_daily_max (default 0 = unlimited).
 *  - Staff booking: consultWarnings() → confirm() texts (never blocks).
 */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type ConsultBlock = Tables<"consult_blocks">;
export type BlockKind = "in_person" | "online" | "review" | "admin";

export const KIND_META: Record<BlockKind, { label: string; short: string; bg: string; line: string; ink: string }> = {
  in_person: { label: "استشارات حضورية", short: "حضوري", bg: "#F1E4F5", line: "#C9A2D8", ink: "#6A3577" },
  online: { label: "استشارات أونلاين", short: "أونلاين", bg: "#E4EEF8", line: "#9DBEE0", ink: "#2F5F8F" },
  review: { label: "مراجعات", short: "مراجعات", bg: "#E5F3EA", line: "#9BCDAE", ink: "#2E6B47" },
  admin: { label: "وقت إداري — بلا حجز", short: "إداري", bg: "#F3EFEA", line: "#D2C6B6", ink: "#6B5A45" },
};
export const KINDS: BlockKind[] = ["in_person", "online", "review", "admin"];

export async function listBlocks(staffId: string): Promise<ConsultBlock[]> {
  return must(await supabase.from("consult_blocks").select("*").eq("staff_id", staffId).eq("active", true).order("weekday").order("starts")) ?? [];
}

export type BlockInput = { id?: string; staff_id: string; weekday: number; starts: string; ends: string; kind: BlockKind; note?: string | null };

function blockError(e: { message: string } | null) {
  if (!e) return;
  if (/block_overlap/.test(e.message)) throw new Error("يتداخل هذا الوقت مع فترة أخرى في نفس اليوم — عدّلي البداية أو النهاية.");
  if (/check constraint/.test(e.message)) throw new Error("وقت النهاية يجب أن يكون بعد البداية.");
  throw new Error(e.message);
}

export async function saveBlock(b: BlockInput) {
  const row = { staff_id: b.staff_id, weekday: b.weekday, starts: b.starts, ends: b.ends, kind: b.kind, note: b.note ?? null, active: true };
  const res = b.id ? await supabase.from("consult_blocks").update(row).eq("id", b.id) : await supabase.from("consult_blocks").insert(row);
  blockError(res.error);
  invalidate("consult_blocks");
}

/** Remove from the template (kept in the table as inactive). */
export async function deactivateBlock(id: string) {
  blockError((await supabase.from("consult_blocks").update({ active: false }).eq("id", id)).error);
  invalidate("consult_blocks");
}

export type ConsultLimits = { bufferMin: number; dailyMax: number };

export async function getConsultLimits(): Promise<ConsultLimits> {
  const rows = must(await supabase.from("settings").select("key, value").in("key", ["consult_buffer_min", "consult_daily_max"])) ?? [];
  const n = (k: string, d: number) => { const v = Number(rows.find((r) => r.key === k)?.value); return Number.isFinite(v) && v >= 0 ? v : d; };
  return { bufferMin: n("consult_buffer_min", 10), dailyMax: n("consult_daily_max", 0) };
}

export async function saveConsultLimits(v: ConsultLimits) {
  must(await supabase.from("settings").upsert([
    { key: "consult_buffer_min", value: Math.max(0, Math.round(v.bufferMin)) },
    { key: "consult_daily_max", value: Math.max(0, Math.round(v.dailyMax)) },
  ]));
  invalidate("consult_limits");
}

/** Staff booking: Arabic warnings for a consultation with this consultant at this time (empty = fine). */
export async function consultWarnings(service: string, startsAt: string, specialistId: string | null, minutes?: number | null, ignore?: string | null): Promise<string[]> {
  if (!specialistId) return [];
  const { data, error } = await supabase.rpc("consult_warnings", { p_service: service, p_starts: startsAt, p_specialist: specialistId, p_minutes: minutes ?? undefined, p_ignore: ignore ?? undefined });
  if (error) return [];
  const limits = await getConsultLimits().catch(() => ({ bufferMin: 10, dailyMax: 0 }));
  return (data ?? []).map((c) =>
    c === "outside_template" ? "هذا الوقت خارج «قالب الاستشارات» للمستشارة (ليس ضمن فترات هذا النوع من الاستشارات)."
      : c === "buffer" ? `أقل من ${limits.bufferMin} دقائق راحة بين هذه الاستشارة واستشارة أخرى لها.`
        : c === "cap" ? `بلغت المستشارة الحد اليومي للاستشارات (${limits.dailyMax}) في هذا اليوم.` : c);
}
