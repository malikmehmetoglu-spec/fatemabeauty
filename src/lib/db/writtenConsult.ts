"use client";

/**
 * «استشارة مكتوبة» — async written consultation (table written_consults, migration 0174).
 * Patient: submit concern answers (consult_intake fields) + up to 4 face photos (only after the photo consent),
 * then pays at the centre; reception confirms (rpc written_consult_confirm_payment → paid invoice, due in 48h).
 * Consultant/admin: queue by due time, reply with text and/or a recorded voice note (private bucket consult-audio).
 */
import { supabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { invalidate } from "./query";
import type { IntakeFields } from "./intake";

// The new table/RPCs are not in the generated types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const must = <T,>(r: { data: T; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data; };

export type WcStatus = "awaiting_payment" | "paid" | "answered" | "closed";
export type WrittenConsult = {
  id: string; patient_id: string; intake: Partial<IntakeFields>; photos: string[]; status: WcStatus; price: number;
  invoice_id: string | null; paid_at: string | null; due_at: string | null; reply_text: string | null; reply_audio_path: string | null;
  answered_by: string | null; answered_at: string | null; closed_at: string | null; created_at: string;
};
export type WcRow = WrittenConsult & { patients?: { name: string; file_no: number } | null; staff?: { name: string } | null };

export const WC_STATUS: Record<WcStatus, string> = {
  awaiting_payment: "بانتظار الدفع", paid: "عند أ. فاطمة", answered: "تمّ الرد", closed: "مغلقة",
};
export const WC_KIND: Record<WcStatus, "amber" | "lilac" | "green" | "gray"> = { awaiting_payment: "amber", paid: "lilac", answered: "green", closed: "gray" };

/** Patient-friendly error text. */
export function wcError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/concern_required/.test(m)) return "اكتبي باختصار ما الذي يزعجكِ.";
  if (/photo_consent_required/.test(m)) return "لإرسال الصور يلزم توقيع موافقة التصوير أولاً.";
  if (/too_many_photos/.test(m)) return "يمكنكِ إرسال 4 صور كحد أقصى.";
  if (/too_many_open/.test(m)) return "لديكِ استشارتان مفتوحتان؛ انتظري الرد عليهما أولاً.";
  if (/already_paid/.test(m)) return "تمّ تأكيد دفع هذه الاستشارة من قبل.";
  if (/not_paid/.test(m)) return "لا يمكن الرد قبل تأكيد الدفع.";
  if (/empty_reply/.test(m)) return "اكتبي الرد أو سجّلي رسالة صوتية.";
  if (/not allowed|row-level/.test(m)) return "ليست لديكِ صلاحية لهذا الإجراء.";
  if (/shift/i.test(m)) return "افتحي وردية الصندوق أولاً ثم أعيدي المحاولة.";
  return "حدث خطأ غير متوقع. حاولي مرة أخرى.";
}

/* ---------- patient ---------- */

export async function myWrittenConsults(): Promise<WcRow[]> {
  return must(await db.from("written_consults").select("*").order("created_at", { ascending: false }).limit(50)) ?? [];
}
export async function getWrittenConsult(id: string): Promise<WcRow | null> {
  return must(await db.from("written_consults").select("*, patients(name, file_no), staff:answered_by(name)").eq("id", id).maybeSingle());
}

export async function uploadWcPhoto(patientId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("اختاري صورة.");
  if (file.size > 12 * 1024 * 1024) throw new Error("الصورة كبيرة جداً (الحد 12 ميغابايت).");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${patientId}/wc-${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("photos").upload(path, file, { contentType: file.type, upsert: false });
  if (up.error) throw new Error("تعذّر رفع الصورة. تحقّقي من الاتصال وحاولي مرة أخرى.");
  return path;
}

export async function submitWrittenConsult(f: IntakeFields, photos: string[]): Promise<WrittenConsult> {
  const t = (s: string) => s.trim() || null;
  const intake = { concern: t(f.concern), since: t(f.since), tried: t(f.tried), medications: t(f.medications), allergies: t(f.allergies), pregnant: f.pregnant, goals: t(f.goals) };
  const row = must(await db.rpc("written_consult_submit", { p_intake: intake as Json, p_photos: photos })) as WrittenConsult;
  invalidate("wc"); invalidate("notifications");
  return row;
}

export async function closeWrittenConsult(id: string) {
  must(await db.rpc("written_consult_close", { p_id: id }));
  invalidate("wc");
}

/** Signed URLs for photos (bucket photos) and the reply audio (bucket consult-audio). */
export async function signedPhotos(paths: string[]): Promise<{ path: string; url: string | null }[]> {
  if (!paths.length) return [];
  const { data } = await supabase.storage.from("photos").createSignedUrls(paths, 3600);
  return paths.map((p) => ({ path: p, url: data?.find((d) => d.path === p)?.signedUrl ?? null }));
}
export async function audioUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from("consult-audio").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/* ---------- consultant ---------- */

/** Open queue (paid, not answered) sorted by due time, then the latest answered ones. */
export async function consultQueue(): Promise<WcRow[]> {
  return must(await db.from("written_consults").select("*, patients(name, file_no), staff:answered_by(name)")
    .in("status", ["paid", "answered", "awaiting_payment"]).order("due_at", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false }).limit(200)) ?? [];
}
export async function dueCount(): Promise<number> {
  const r = await db.from("written_consults").select("id", { count: "exact", head: true }).eq("status", "paid");
  return r.count ?? 0;
}

export async function uploadReplyAudio(patientId: string, blob: Blob): Promise<string> {
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  const path = `${patientId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("consult-audio").upload(path, blob, { contentType: blob.type || "audio/webm", upsert: false });
  if (up.error) throw new Error(up.error.message);
  return path;
}

export async function replyWrittenConsult(id: string, text: string, audioPath: string | null) {
  must(await db.rpc("written_consult_reply", { p_id: id, p_text: text, p_audio_path: audioPath }));
  invalidate("wc");
}

export function subscribeWc(onChange: () => void) {
  const ch = supabase.channel("wc:staff").on("postgres_changes", { event: "*", schema: "public", table: "written_consults" }, () => onChange()).subscribe();
  return () => { supabase.removeChannel(ch); };
}

/* ---------- reception ---------- */

export type WcPayment = { id: string; patient_id: string; patient_name: string; file_no: number; phone: string | null; status: WcStatus; price: number; created_at: string; paid_at: string | null; due_at: string | null; invoice_no: string | null };
export async function wcPayments(): Promise<WcPayment[]> {
  return must(await db.rpc("written_consult_payments")) ?? [];
}
export async function confirmWcPayment(id: string, method: "cash" | "card") {
  must(await db.rpc("written_consult_confirm_payment", { p_id: id, p_method: method }));
  invalidate("wc");
}

/** "يتبقى 31 س 05 د" / "متأخرة 2 س" from a due time. */
export function dueLabel(due: string | null, now = Date.now()): { text: string; late: boolean; soon: boolean } {
  if (!due) return { text: "—", late: false, soon: false };
  const ms = new Date(due).getTime() - now;
  const abs = Math.abs(ms), h = Math.floor(abs / 36e5), m = Math.floor((abs % 36e5) / 6e4);
  const t = `${h} س ${String(m).padStart(2, "0")} د`;
  return ms < 0 ? { text: `متأخرة ${t}`, late: true, soon: false } : { text: `يتبقى ${t}`, late: false, soon: ms < 6 * 36e5 };
}
