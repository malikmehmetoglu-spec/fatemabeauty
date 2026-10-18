"use client";

/** Appointments, queue and waitlist (live, Supabase). Booking always goes through rpc book_appointment (double-booking check). */
import { useEffect, useState } from "react";
import { supabase, type Tables, type Database } from "@/lib/supabase/client";
import { atDamascus, clock, dayKey, dayRange } from "@/lib/format";
import { invalidate, must } from "./query";

export type Status = Database["public"]["Enums"]["appointment_status"];
export type Appointment = Tables<"appointments"> & {
  service: { name: string; short_name: string; minutes: number } | null;
  room: { name: string } | null;
  specialist: { id: string; name: string; title: string; photo_url: string | null } | null;
  patient: { id: string; name: string; file_no: number; phone: string | null } | null;
};
export type WaitEntry = Tables<"waitlist"> & {
  service: { name: string } | null;
  specialist: { name: string } | null;
  patient: { name: string; file_no: number; phone: string | null } | null;
};
export type Hours = { days: number[]; from: string; to: string; slot: number };
export type MyQueue = Database["public"]["Functions"]["my_queue"]["Returns"][number];

const SEL = "*, service:services(name,short_name,minutes), room:rooms(name), specialist:staff(id,name,title,photo_url), patient:patients(id,name,file_no,phone)";

export const STATUS_LABEL: Record<Status, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكد", checked_in: "وصلت", in_session: "في الجلسة",
  done: "انتهت", no_show: "لم تحضر", cancelled: "ملغى",
};
export const STATUS_KIND: Record<Status, "pink" | "green" | "amber" | "gray" | "plum" | "silver" | "lilac"> = {
  pending: "amber", confirmed: "lilac", checked_in: "plum", in_session: "pink", done: "green", no_show: "gray", cancelled: "silver",
};
export const ACTIVE: Status[] = ["pending", "confirmed", "checked_in", "in_session"];

export const personName = (a: Pick<Appointment, "patient" | "walk_in_name">) => a.patient?.name || a.walk_in_name || "مراجِعة بدون اسم";
export const endsAt = (a: Pick<Appointment, "starts_at" | "minutes">) => new Date(new Date(a.starts_at).getTime() + a.minutes * 60000);

/** Readable Arabic message for errors raised by the booking functions. */
export function bookingError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  if (/^[\u0600-\u06FF]/.test(m)) return m; // already readable
  if (/slot taken/.test(m)) return "هذا الوقت حُجز للتو. اختاري وقتاً آخر.";
  if (/time in the past/.test(m)) return "هذا الوقت مضى. اختاري وقتاً لاحقاً.";
  if (/not bookable online/.test(m)) return "هذه الخدمة تُحجز عبر المركز فقط.";
  if (/patient required/.test(m)) return "اختاري المراجِعة أو اكتبي اسمها.";
  if (/cannot cancel/.test(m)) return "لا يمكن إلغاء هذا الموعد الآن.";
  if (/no patient record|not signed in/.test(m)) return "سجّلي الدخول أولاً.";
  if (/outside opening hours/.test(m)) return "هذا الوقت خارج ساعات الدوام. اختاري وقتاً من الأوقات المعروضة.";
  if (/already booked at this time/.test(m)) return "لديكِ موعد آخر في هذا الوقت.";
  if (/check-in only on the appointment day/.test(m)) return "يمكن تسجيل الوصول في يوم الموعد فقط.";
  if (/bad status change/.test(m)) return "لا يمكن نقل الموعد إلى هذه الحالة من حالته الحالية.";
  if (/only waiting patients can be called/.test(m)) return "يمكن النداء فقط على من سجّلت وصولها.";
  if (/service not found/.test(m)) return "هذه الخدمة غير متاحة الآن.";
  if (/specialist not found/.test(m)) return "الأخصائية غير متاحة.";
  if (/failed to fetch|network|load failed/i.test(m)) return "تعذّر الاتصال بالخادم. تحقّقي من الإنترنت ثم أعيدي المحاولة.";
  if (/row-level security|permission denied|not allowed/i.test(m)) return "لا تملكين صلاحية لهذا الإجراء.";
  if (/duplicate key.*phone|patients_phone_key/i.test(m)) return "يوجد ملف بهذا الرقم — ابحثي عنه بالاسم أو الرقم.";
  console.error("booking error:", m);
  return "تعذّر الحفظ. حاولي مرة أخرى.";
}

/** Same as must(), but throws the readable Arabic message for database rule errors. */
function mustOk<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new Error(bookingError(new Error(res.error.message)));
  return res.data;
}

/* ---------- opening hours ---------- */

export const DEFAULT_HOURS: Hours = { days: [0, 1, 2, 3, 4, 6], from: "10:00", to: "18:00", slot: 15 };

export async function getHours(): Promise<Hours> {
  const row = must(await supabase.from("settings").select("value").eq("key", "hours").maybeSingle());
  const v = (row?.value ?? {}) as Partial<Hours>;
  return { ...DEFAULT_HOURS, ...v };
}

export async function saveHours(h: Hours) {
  must(await supabase.from("settings").upsert({ key: "hours", value: h, updated_at: new Date().toISOString() }));
  invalidate("appointments");
}

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };
const toHHMM = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Weekday (0 = Sunday) of a Damascus day key. */
export const weekday = (key: string) => new Date(`${key}T12:00:00+03:00`).getUTCDay();
export const isOpen = (h: Hours, key: string) => h.days.includes(weekday(key));

/** Next `n` open day keys starting today. */
export function openDays(h: Hours, n: number) {
  const out: string[] = [];
  const start = new Date(`${dayKey()}T12:00:00+03:00`).getTime();
  for (let i = 0; out.length < n && i < 60; i++) {
    const k = dayKey(new Date(start + i * 864e5));
    if (isOpen(h, k)) out.push(k);
  }
  return out;
}

export type Busy = { starts_at: string; ends_at: string; room_id: string | null; specialist_id: string | null };

export async function busyRanges(fromKey: string, toKey: string = fromKey): Promise<Busy[]> {
  return must(await supabase.rpc("booked_ranges", { p_from: dayRange(fromKey).from, p_to: dayRange(toKey).to })) ?? [];
}

/** Free start times ("HH:MM") on a day for a service length, avoiding the room's and the specialist's existing bookings. */
export function freeSlots(h: Hours, key: string, minutes: number, busy: Busy[], roomId: string | null, specialistId: string | null) {
  if (!isOpen(h, key)) return [];
  const now = Date.now();
  const out: string[] = [];
  for (let t = toMin(h.from); t + minutes <= toMin(h.to); t += Math.max(5, h.slot)) {
    const s = new Date(atDamascus(key, toHHMM(t))).getTime();
    const e = s + minutes * 60000;
    if (s <= now) continue;
    const clash = busy.some((b) => new Date(b.starts_at).getTime() < e && new Date(b.ends_at).getTime() > s &&
      ((roomId && b.room_id === roomId) || (specialistId && b.specialist_id === specialistId)));
    if (!clash) out.push(toHHMM(t));
  }
  return out;
}

/* ---------- booking ---------- */

export async function book(p: {
  service: string; day: string; time: string; specialist?: string | null; room?: string | null;
  patient?: string | null; walkInName?: string; walkInPhone?: string; source?: "reception" | "walk_in" | "admin"; checkIn?: boolean;
}) {
  const row = mustOk(await supabase.rpc("book_appointment", {
    p_service: p.service, p_starts: atDamascus(p.day, p.time),
    p_specialist: p.specialist ?? undefined, p_room: p.room ?? undefined, p_patient: p.patient ?? undefined,
    p_walk_in_name: p.walkInName || undefined, p_walk_in_phone: p.walkInPhone || undefined,
    p_source: p.source, p_check_in: p.checkIn ?? false,
  }));
  invalidate("appointments");
  return row;
}

/* ---------- patient ---------- */

export async function listMine(patientId: string) {
  return must(await supabase.from("appointments").select(SEL).eq("patient_id", patientId).order("starts_at", { ascending: false }).limit(200)) as unknown as Appointment[];
}

export async function getAppointment(id: string) {
  return must(await supabase.from("appointments").select(SEL).eq("id", id).maybeSingle()) as unknown as Appointment | null;
}

/** The patient's appointment today (for check-in QR), if any. */
export async function myToday(patientId: string) {
  const r = dayRange();
  const rows = must(await supabase.from("appointments").select(SEL).eq("patient_id", patientId).gte("starts_at", r.from).lt("starts_at", r.to)
    .in("status", ACTIVE).order("starts_at").limit(1)) as unknown as Appointment[];
  return rows[0] ?? null;
}

export async function cancelMine(id: string, reason: string) {
  mustOk(await supabase.rpc("cancel_my_appointment", { p_id: id, p_reason: reason }));
  invalidate("appointments");
}

export async function myQueue(): Promise<MyQueue | null> {
  const rows = must(await supabase.rpc("my_queue")) ?? [];
  return rows[0] ?? null;
}

/* ---------- staff ---------- */

export async function listRange(fromKey: string, toKey: string = fromKey) {
  return must(await supabase.from("appointments").select(SEL).gte("starts_at", dayRange(fromKey).from).lt("starts_at", dayRange(toKey).to)
    .order("starts_at")) as unknown as Appointment[];
}

/** Today's checked-in queue (and those in session / called). */
export async function listTodayQueue() {
  return must(await supabase.from("appointments").select(SEL).eq("queue_day", dayKey()).not("queue_no", "is", null).order("queue_no")) as unknown as Appointment[];
}

export async function setStatus(id: string, status: Status, extra: Partial<Tables<"appointments">> = {}) {
  const now = new Date().toISOString();
  const stamp: Partial<Tables<"appointments">> =
    status === "checked_in" ? { checked_in_at: now } : status === "in_session" ? { started_at: now } : status === "done" ? { finished_at: now } : {};
  mustOk(await supabase.from("appointments").update({ status, ...stamp, ...extra }).eq("id", id));
  invalidate("appointments");
}

export async function callPatient(id: string) {
  mustOk(await supabase.from("appointments").update({ called_at: new Date().toISOString() }).eq("id", id));
  invalidate("appointments");
}

/** Calls the lowest queue number that is waiting and not yet called. Returns it, or null when nobody waits. */
export async function callNext() {
  const rows = must(await supabase.from("appointments").select("id, queue_no").eq("queue_day", dayKey()).eq("status", "checked_in")
    .is("called_at", null).order("queue_no").limit(1)) ?? [];
  if (!rows.length) return null;
  await callPatient(rows[0].id);
  return rows[0].queue_no;
}

export type PatientHit = Pick<Tables<"patients">, "id" | "name" | "phone" | "file_no">;

export async function searchPatients(q: string): Promise<PatientHit[]> {
  const s = q.trim().replace(/[,()%]/g, "");
  if (s.length < 2) return [];
  // phones are stored as +963…; «0999…» / «963999…» typed at reception must still match
  const digits = s.replace(/\D/g, "");
  const phoneQ = /^[+\d\s-]+$/.test(s) && digits.length >= 3 ? digits.replace(/^(00963|963|0)/, "") : s;
  const ors = [`name.ilike.%${s}%`, `phone.ilike.%${phoneQ}%`];
  if (/^\d+$/.test(s)) ors.push(`file_no.eq.${s}`);
  return must(await supabase.from("patients").select("id,name,phone,file_no").or(ors.join(",")).order("name").limit(8)) ?? [];
}

/** Opens a patient record at reception (staff only). Phone is stored as +963… so the app login links to it. */
export async function createPatient(name: string, phone: string) {
  const digits = phone.replace(/\D/g, "");
  const ph = !digits ? null : "+" + (digits.startsWith("963") ? digits : "963" + digits.replace(/^0/, ""));
  const row = must(await supabase.from("patients").insert({ name: name.trim(), phone: ph }).select("id,name,phone,file_no").single());
  invalidate("patients");
  return row;
}

/** The staff record's appointments today (My day). */
export async function listMyDay(staffId: string) {
  const r = dayRange();
  return must(await supabase.from("appointments").select(SEL).eq("specialist_id", staffId).gte("starts_at", r.from).lt("starts_at", r.to)
    .neq("status", "cancelled").order("starts_at")) as unknown as Appointment[];
}

/** Sum of (non-void) invoices created today (Damascus). */
export async function revenueToday() {
  const r = dayRange();
  const rows = must(await supabase.from("invoices").select("total").eq("void", false).gte("created_at", r.from).lt("created_at", r.to)) ?? [];
  return rows.reduce((s, x) => s + (x.total ?? 0), 0);
}

export const timeOf = (a: Pick<Appointment, "starts_at">) => clock(a.starts_at);

/* ---------- waitlist ---------- */

const WSEL = "*, service:services(name), specialist:staff(name), patient:patients(name,file_no,phone)";

export async function joinWaitlist(p: { patient_id: string; service_key: string | null; specialist_id: string | null; preferred_day: string | null; part: "any" | "morning" | "evening"; note?: string }) {
  const row = must(await supabase.from("waitlist").insert({ ...p, status: "waiting" }).select().single());
  invalidate("waitlist");
  return row;
}

export async function addToWaitlist(p: { patient_id?: string | null; name?: string | null; phone?: string | null; service_key: string | null; specialist_id: string | null; preferred_day: string | null; part: "any" | "morning" | "evening"; note?: string }) {
  must(await supabase.from("waitlist").insert({ ...p, status: "waiting" }));
  invalidate("waitlist");
}

export async function myWaitlist(patientId: string) {
  return must(await supabase.from("waitlist").select(WSEL).eq("patient_id", patientId).in("status", ["waiting", "offered"]).order("created_at")) as unknown as WaitEntry[];
}

/** Everyone waiting (staff). */
export async function listWaitlist() {
  return must(await supabase.from("waitlist").select(WSEL).in("status", ["waiting", "offered"]).order("created_at")) as unknown as WaitEntry[];
}

/** Patient leaves (closed) or staff updates an entry. */
export async function setWaitStatus(id: string, status: "waiting" | "offered" | "booked" | "closed", appointment_id?: string) {
  must(await supabase.from("waitlist").update({ status, ...(appointment_id ? { appointment_id } : {}) }).eq("id", id));
  invalidate("waitlist");
}

/* ---------- small helpers for pages ---------- */


/** Reads the page's query string after mount (static export friendly; no Suspense needed). */
export function useSearch() {
  const [q, setQ] = useState<URLSearchParams | null>(null);
  useEffect(() => { setQ(new URLSearchParams(window.location.search)); }, []);
  return q;
}

/** Free change/cancel window in hours (settings «policies»). */
export async function freeChangeHours() {
  const row = must(await supabase.from("settings").select("value").eq("key", "policies").maybeSingle());
  const v = (row?.value ?? {}) as { free_change_hours?: number };
  return typeof v.free_change_hours === "number" ? v.free_change_hours : null;
}

/** Packages of a patient that still have sessions for a service. */
export async function myPackagesFor(patientId: string, serviceKey: string) {
  const rows = must(await supabase.from("patient_packages").select("id, sessions_total, sessions_used, package:packages(name, service_key)").eq("patient_id", patientId).gt("sessions_total", 0)) ?? [];
  return (rows as unknown as { id: string; sessions_total: number; sessions_used: number; package: { name: string; service_key: string } | null }[])
    .filter((p) => p.package?.service_key === serviceKey && p.sessions_used < p.sessions_total);
}

/** "YYYY-MM-DD" → Date at Damascus noon (safe for getDate()/getDay() in any browser time zone near +03). */
export const dateOfKey = (k: string) => new Date(`${k}T12:00:00+03:00`);

/** Keeps today's queue fresh: realtime + 30 s fallback. */
export function useLiveAppointments(channel: string) {
  const [, tick] = useState(0);
  useEffect(() => {
    const ch = supabase.channel(channel).on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => invalidate("appointments")).subscribe();
    const t = setInterval(() => { invalidate("appointments"); tick((n) => n + 1); }, 30000);
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [channel]);
}

