"use client";

/**
 * Public booking link (fatema.beauty/book, book.fatema.beauty). Anonymous visitors only reach three RPCs:
 * public_booking_info (catalogue + hours), public_slots (availability, no names) and public_book.
 */
import { supabase } from "@/lib/supabase/client";
import { clock, dayKey } from "@/lib/format";
import type { Hours } from "./appointments";

export type PubService = { key: string; name: string; short_name: string; description: string; price: number; price_from: boolean; minutes: number; is_consultation: boolean };
export type PubPerson = { id: string; name: string; title: string; photo_url: string | null };
export type PubInfo = {
  services: PubService[]; specialists: PubPerson[]; consultant: PubPerson | null; hours: Hours;
  centre: { phone: string | null; whatsapp: string | null } | null; horizon_days: number;
};
export type PubSlot = { starts_at: string; available: boolean };
export type PubResult = { starts_at: string; minutes: number; service: string; specialist: string | null };

export async function getPublicInfo(): Promise<PubInfo> {
  const { data, error } = await supabase.rpc("public_booking_info");
  if (error) throw new Error(error.message);
  return data as unknown as PubInfo;
}

/** Weekdays (0 = Sunday) on which the service can be booked (someone who does it works that day). rpc booking_weekdays. */
export async function getBookingWeekdays(service: string, specialist: string | null): Promise<number[]> {
  const { data, error } = await supabase.rpc("booking_weekdays", { p_service: service, p_specialist: specialist ?? undefined });
  if (error) throw new Error(error.message);
  return (data ?? []) as number[];
}

export async function getPublicSlots(day: string, service: string, specialist: string | null): Promise<PubSlot[]> {
  const { data, error } = await supabase.rpc("public_slots", { p_day: day, p_service: service, p_specialist: specialist ?? undefined });
  if (error) throw new Error(error.message);
  return (data ?? []) as PubSlot[];
}

export async function publicBook(p: { service: string; starts: string; specialist: string | null; name: string; phone: string; note: string }): Promise<PubResult> {
  const { data, error } = await supabase.rpc("public_book", {
    p_service: p.service, p_starts: p.starts, p_specialist: p.specialist as string, p_name: p.name, p_phone: p.phone, p_note: p.note || undefined,
  });
  if (error) throw new Error(error.message);
  return data as unknown as PubResult;
}

/** Syrian mobile → "+9639XXXXXXXX" (same as the rest of the app), or null when it is not a valid mobile number. */
export function normalisePhone(raw: string) {
  const d = raw.replace(/\D/g, "").replace(/^(00963|963|0)/, "");
  return /^9\d{8}$/.test(d) ? `+963${d}` : null;
}

const CODES: Record<string, string> = {
  bad_name: "اكتبي اسمكِ (حرفان على الأقل).",
  bad_phone: "اكتبي رقم موبايل سوري صحيحاً، مثل 0991 234 567.",
  bad_note: "الملاحظة طويلة، اختصريها قليلاً.",
  bad_service: "هذه الخدمة غير متاحة للحجز الآن.",
  bad_specialist: "الأخصائية المختارة غير متاحة. اختاري «أي أخصائية متاحة».",
  past: "هذا الوقت مضى. اختاري وقتاً لاحقاً.",
  too_far: "يمكن الحجز خلال الشهر القادم فقط.",
  off_duty: "الأخصائية لا تداوم في هذا الوقت. اختاري وقتاً آخر أو «أي أخصائية متاحة».",
  closed: "هذا الوقت خارج ساعات الدوام.",
  taken: "هذا الوقت حُجز للتو. اختاري وقتاً آخر.",
  "slot taken": "هذا الوقت حُجز للتو. اختاري وقتاً آخر.",
  overlap: "لديكِ موعد آخر بهذا الرقم في الوقت نفسه.",
  limit: "لديكِ موعدان قادمان بهذا الرقم. لحجز المزيد تواصلي معنا أو أديري مواعيدكِ من التطبيق.",
};

export function publicError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  for (const k of Object.keys(CODES)) if (m.includes(k)) return CODES[k];
  if (/failed to fetch|network|load failed/i.test(m)) return "تعذّر الاتصال. تحقّقي من الإنترنت ثم أعيدي المحاولة.";
  return "تعذّر إتمام الحجز. حاولي مرة أخرى.";
}

/** Next `n` Damascus day keys starting today. */
export function nextDays(n: number) {
  const start = new Date(`${dayKey()}T12:00:00+03:00`).getTime();
  return Array.from({ length: n }, (_, i) => dayKey(new Date(start + i * 864e5)));
}

/** .ics file content for the booked visit. */
export function icsFile(r: PubResult, place: string) {
  const s = new Date(r.starts_at), e = new Date(s.getTime() + r.minutes * 60000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/[\\,;]/g, (c) => "\\" + c);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fatema Beauty//Booking//AR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${f(s)}-${Math.random().toString(36).slice(2)}@fatema.beauty`, `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${esc(`${r.service} — ${place}`)}`,
    `DESCRIPTION:${esc(`موعدكِ في ${place} الساعة ${clock(s)} (بتوقيت دمشق). سنتواصل معكِ لتأكيده.`)}`,
    `LOCATION:${esc(place)}`, "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:تذكير بموعدكِ", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

