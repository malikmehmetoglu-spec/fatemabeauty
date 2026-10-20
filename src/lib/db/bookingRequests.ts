"use client";

/**
 * Booking requests from the public link (book.fatema.beauty): they arrive as status 'pending', source 'public'.
 * Owner / admin / reception approve or reject them (rpc approve_booking / reject_booking) and send the
 * confirmation on WhatsApp (wa.me link; rpc mark_confirm_sent stamps appointments.confirm_sent_at).
 */
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { arDate, clock, dayKey } from "@/lib/format";
import { dateOfKey, type Appointment } from "./appointments";
import { invalidate, must } from "./query";

const SEL = "*, service:services(name,short_name,minutes), room:rooms(name), specialist:staff(id,name,title,photo_url), patient:patients(id,name,file_no,phone)";

/** Roles that may approve / reject / send the confirmation. Specialists and the accountant only read. */
export const canConfirm = (staff: Pick<Tables<"staff">, "role"> | null | undefined) =>
  !!staff && (staff.role === "owner" || staff.role === "admin" || staff.role === "reception");

/** Every pending request that has not passed yet (oldest first by visit time). */
export async function listPending() {
  const since = new Date(Date.now() - 12 * 3600e3).toISOString();
  return must(await supabase.from("appointments").select(SEL).eq("status", "pending").gte("starts_at", since).order("starts_at")) as unknown as Appointment[];
}

export async function pendingCount() {
  const since = new Date(Date.now() - 12 * 3600e3).toISOString();
  const { count, error } = await supabase.from("appointments").select("id", { count: "exact", head: true }).eq("status", "pending").gte("starts_at", since);
  if (error) throw error;
  return count ?? 0;
}

/** Recently confirmed upcoming visits — to send / resend the WhatsApp confirmation. */
export async function listRecentConfirmed() {
  return must(await supabase.from("appointments").select(SEL).eq("status", "confirmed").gte("starts_at", new Date().toISOString())
    .order("starts_at").limit(40)) as unknown as Appointment[];
}

export async function approveBooking(id: string) {
  const { error } = await supabase.rpc("approve_booking", { p_id: id });
  if (error) throw error;
  invalidate("appointments"); invalidate("booking-requests");
}

export async function rejectBooking(id: string, reason: string) {
  const { error } = await supabase.rpc("reject_booking", { p_id: id, p_reason: reason });
  if (error) throw error;
  invalidate("appointments"); invalidate("booking-requests");
}

export async function markConfirmSent(id: string) {
  const { error } = await supabase.rpc("mark_confirm_sent", { p_id: id });
  if (error) console.warn("[mark_confirm_sent]", error);
  invalidate("appointments"); invalidate("booking-requests");
}

/* ---------- WhatsApp ---------- */

export type Centre = { name?: string; name_ar?: string; phone?: string | null; whatsapp?: string | null; address?: string | null; location?: string | null; map_url?: string | null };

export async function getCentre(): Promise<Centre> {
  const row = must(await supabase.from("settings").select("value").eq("key", "centre").maybeSingle());
  return (row?.value ?? {}) as Centre;
}

/** "+963 991 234 567" / "0991…" → "963991234567" for wa.me; null if there is no usable number. */
export function waNumber(phone?: string | null) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "963" + d.slice(1);
  else if (d.length === 9 && d.startsWith("9")) d = "963" + d;
  return d.length >= 10 ? d : null;
}

export function waLink(phone: string | null | undefined, text: string) {
  const n = waNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

const firstName = (n?: string | null) => (n ?? "").trim().replace(/\s+/g, " ");
const when = (iso: string) => `${arDate(dateOfKey(dayKey(new Date(iso))), { year: true })} الساعة ${clock(iso)}`;
const contactLines = (c: Centre) => {
  const out: string[] = [];
  const where = c.address || c.location;
  if (where) out.push(`العنوان: ${where}`);
  if (c.map_url) out.push(`الموقع على الخريطة: ${c.map_url}`);
  if (c.phone) out.push(`للتواصل: ${c.phone}`);
  return out;
};

/** Confirmation message (Damascus date/time, Arabic, feminine). */
export function confirmText(a: Appointment, c: Centre) {
  const nm = firstName(a.patient?.name || a.walk_in_name);
  return [
    `مرحباً ${nm}،`.replace(" ،", "،"),
    "يسعدنا تأكيد موعدكِ في مركز Fatema Beauty",
    "",
    `الخدمة: ${a.service?.name ?? ""}`,
    ...(a.specialist ? [`مع: ${a.specialist.name}`] : []),
    `الموعد: ${when(a.starts_at)} (بتوقيت دمشق)`,
    ...contactLines(c),
    "",
    "نرجو الحضور قبل الموعد بـ 10 دقائق.",
    "لتعديل الموعد أو إلغائه يكفي الرد على هذه الرسالة.",
    "بانتظاركِ",
  ].join("\n");
}

/** Apology when a request cannot be accepted. */
export function apologyText(a: Appointment, reason: string, c: Centre) {
  const nm = firstName(a.patient?.name || a.walk_in_name);
  return [
    `مرحباً ${nm}،`.replace(" ،", "،"),
    `شكراً لاختياركِ مركز Fatema Beauty. نعتذر، لم نتمكّن من تثبيت طلب حجزكِ لـ«${a.service?.name ?? "الخدمة"}» يوم ${when(a.starts_at)}${reason.trim() ? ` (${reason.trim()})` : ""}.`,
    "يسعدنا اقتراح موعد آخر يناسبكِ — ردّي على هذه الرسالة بالوقت الأنسب لكِ.",
    ...contactLines(c),
  ].join("\n");
}

export const greetText = (name?: string | null) => `مرحباً ${firstName(name)}، معكِ مركز Fatema Beauty`.replace("مرحباً ،", "مرحباً،");
