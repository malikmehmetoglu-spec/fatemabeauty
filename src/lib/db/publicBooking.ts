"use client";

/**
 * Public booking link (fatema.beauty/book, book.fatema.beauty). Anonymous visitors only reach three RPCs:
 * public_booking_info (catalogue + hours), public_slots (availability, no names) and public_book.
 */
import { supabase } from "@/lib/supabase/client";
import { clock, dayKey } from "@/lib/format";
import type { Hours } from "./appointments";
import { priceLabel } from "./catalog";
import { staffPhoto } from "./staff";

/** `price` is already in SYP (dollar prices converted server-side); null = «السعر عند الاستفسار». */
/** A session level («عادية / مكثّفة / علاجية مطوّلة»); `price` in SYP (server-converted). */
export type PubLevel = { id: string; level: number; name: string; minutes: number; price: number };
export type PubService = { key: string; name: string; short_name: string; description: string; price: number | null; price_from: boolean; minutes: number; is_consultation: boolean; category_id: string | null; levels?: PubLevel[] };
/** Levels the client chooses from (consultations never have levels). */
export const levelsOfService = (x: PubService | null | undefined): PubLevel[] => (x && !x.is_consultation ? x.levels ?? [] : []);
/** 45 → «45 دقيقة», 60 → «ساعة», 90 → «ساعة ونصف», 120 → «ساعتان», 180 → «3 ساعات». */
export function durationLabel(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${min} دقيقة`;
  const hours = h === 1 ? "ساعة" : h === 2 ? "ساعتان" : h <= 10 ? `${h} ساعات` : `${h} ساعة`;
  if (m === 0) return hours;
  if (m === 30) return `${hours} ونصف`;
  if (m === 15) return `${hours} وربع`;
  return `${hours} و${m} دقيقة`;
}
/** One-line explanation per level number. */
export const LEVEL_BLURB: Record<number, string> = {
  1: "للعناية الدورية والبشرة المستقرة",
  2: "للبشرة التي تحتاج عناية أعمق",
  3: "للحالات التي تحتاج وقتاً وعلاجاً أطول",
};
export type PubCategory = { key: string; name: string; short_description: string; instructions: string; icon: string; not_for_pregnant: boolean };
/** Price label for a public service (SYP only). */
export const pubPrice = (x: PubService) => priceLabel({ price: x.price ?? 0, price_from: x.price_from, price_syp: x.price });
/** `services` = keys of the bookable services she provides (server applies the «all services» fallback). */
export type PubPerson = { id: string; name: string; title: string; photo_url: string | null; services?: string[] };
export type PubInfo = {
  services: PubService[]; categories?: PubCategory[]; specialists: PubPerson[]; consultant: PubPerson | null; hours: Hours;
  centre: { phone: string | null; whatsapp: string | null } | null; horizon_days: number;
};
export type PubSlot = { starts_at: string; available: boolean };
export type PubResult = { starts_at: string; minutes: number; service: string; specialist: string | null; phone?: string | null; level?: string | null; price?: number | null; consult?: boolean };

/** "+963991234567" → "0991 234 567" (shown on the success screen). */
export function localPhone(p?: string | null) {
  const d = (p ?? "").replace(/\D/g, "").replace(/^(00963|963|0)/, "");
  return d.length === 9 ? `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : (p ?? "");
}

export async function getPublicInfo(): Promise<PubInfo> {
  const { data, error } = await supabase.rpc("public_booking_info");
  if (error) throw new Error(error.message);
  const info = data as unknown as PubInfo;
  // photo_url is a path in the «staff» bucket (same rule as staffPhoto) → public URL.
  const fix = (p: PubPerson | null) => p && ({ ...p, photo_url: staffPhoto(p) });
  return { ...info, specialists: (info.specialists ?? []).map((p) => fix(p)!), consultant: fix(info.consultant) };
}

/** Weekdays (0 = Sunday) on which the service can be booked (someone who does it works that day). rpc booking_weekdays. */
export async function getBookingWeekdays(service: string, specialist: string | null): Promise<number[]> {
  const { data, error } = await supabase.rpc("booking_weekdays", { p_service: service, p_specialist: specialist ?? undefined });
  if (error) throw new Error(error.message);
  return (data ?? []) as number[];
}

export async function getPublicSlots(day: string, service: string, specialist: string | null, level?: string | null): Promise<PubSlot[]> {
  const { data, error } = level
    ? await supabase.rpc("public_slots_level", { p_day: day, p_service: service, p_specialist: specialist ?? undefined, p_level: level })
    : await supabase.rpc("public_slots", { p_day: day, p_service: service, p_specialist: specialist ?? undefined });
  if (error) throw new Error(error.message);
  return (data ?? []) as PubSlot[];
}

export async function publicBook(p: { service: string; starts: string; specialist: string | null; name: string; phone: string; note: string; level?: string | null }): Promise<PubResult> {
  const args = { p_service: p.service, p_starts: p.starts, p_specialist: p.specialist as string, p_name: p.name, p_phone: p.phone, p_note: p.note || undefined };
  const { data, error } = p.level
    ? await supabase.rpc("public_book_level", { ...args, p_level: p.level })
    : await supabase.rpc("public_book", args);
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
  bad_level: "مدة الجلسة المختارة غير متاحة الآن. اختاري مدة أخرى.",
  bad_service: "هذه الخدمة غير متاحة للحجز الآن.",
  not_provider: "هذه الأخصائية لا تقدّم هذه الخدمة. اختاري أخصائية أخرى أو «أي أخصائية متاحة».",
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
    `DTSTART:${f(s)}`, `DTEND:${f(e)}`, `SUMMARY:${esc(`${r.service} — ${place} (بانتظار التأكيد)`)}`,
    `DESCRIPTION:${esc(`موعدكِ في ${place} الساعة ${clock(s)} (بتوقيت دمشق). الموعد بانتظار تأكيد المركز، وستصلكِ رسالة واتساب لتأكيده.`)}`,
    `LOCATION:${esc(place)}`, "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:تذكير بموعدكِ", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

