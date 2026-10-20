"use client";

/**
 * Reception tablet + waiting-room TV — check-in, queue, calls, walk-ins, cashier, consents, photos, eligibility.
 * Queue numbers are assigned by the database trigger when an appointment becomes `checked_in`.
 */
import { useEffect, useRef, useState } from "react";
import { supabase, type Tables } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { atDamascus, clock, dayKey, dayRange } from "@/lib/format";
import { invalidate, must } from "./query";
import { bookingError } from "./appointments";

/** must() for responses that always carry data. */
function need<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(bookingError(new Error(res.error.message)));
  const d = res.data;
  if (d == null) throw new Error("لا توجد بيانات");
  return d as NonNullable<T>;
}
import type { TagKind } from "@/components/ui";

export type Status = Tables<"appointments">["status"];
export type QueueAppt = Tables<"appointments"> & {
  patients: Pick<Tables<"patients">, "id" | "name" | "phone" | "file_no" | "pregnant" | "breastfeeding"> | null;
  services: Pick<Tables<"services">, "key" | "name" | "short_name" | "price" | "minutes"> | null;
  rooms: Pick<Tables<"rooms">, "id" | "name"> | null;
  staff: Pick<Tables<"staff">, "id" | "name"> | null;
};
export type TvRow = { queue_no: number; room: string | null; status: Status; called_at: string | null; starts_at: string };

const SELECT = "*, patients(id,name,phone,file_no,pregnant,breastfeeding), services(key,name,short_name,price,minutes), rooms(id,name), staff:specialist_id(id,name)";

export const STATUS_AR: Record<Status, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكَّد", checked_in: "في الانتظار", in_session: "في الجلسة",
  done: "انتهت", no_show: "لم تحضر", cancelled: "ملغى",
};
export const STATUS_KIND: Record<Status, TagKind> = {
  pending: "amber", confirmed: "lilac", checked_in: "pink", in_session: "plum", done: "green", no_show: "gray", cancelled: "silver",
};

/** Display name of the person on an appointment (patient file or walk-in). */
export const personName = (a: Pick<QueueAppt, "patients" | "walk_in_name">) => a.patients?.name || a.walk_in_name || "مراجِعة";
export const serviceName = (a: Pick<QueueAppt, "services">) => a.services?.name ?? "";
export const endTime = (a: Pick<QueueAppt, "starts_at" | "started_at" | "minutes">) =>
  clock(new Date(new Date(a.started_at ?? a.starts_at).getTime() + a.minutes * 60000));

/** "+9639…" from what reception types (09…, 9639…, +9639…). */
export function normPhone(raw: string) {
  const d = raw.replace(/[^\d]/g, "");
  if (!d) return "";
  if (d.startsWith("00")) return "+" + d.slice(2);
  if (d.startsWith("963")) return "+" + d;
  if (d.startsWith("0")) return "+963" + d.slice(1);
  return "+963" + d;
}

/** must() with readable messages for database rule errors (null data allowed). */
function need2<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(bookingError(new Error(res.error.message)));
  return res.data;
}

/* ---------- reads ---------- */

/** Today's appointments (Damascus day), excluding cancelled. Staff only (RLS). */
export async function listToday() {
  const { from, to } = dayRange();
  const rows = need(await supabase.from("appointments").select(SELECT).gte("starts_at", from).lt("starts_at", to).neq("status", "cancelled").order("starts_at"));
  return rows as unknown as QueueAppt[];
}

export async function getAppointment(id: string) {
  const row = must(await supabase.from("appointments").select(SELECT).eq("id", id).maybeSingle());
  return row as unknown as QueueAppt | null;
}

/** Today's appointments for a patient found by file number or phone. */
export async function findToday(term: string) {
  const t = term.trim();
  if (!t) return [];
  const all = await listToday();
  const digits = t.replace(/[^\d]/g, "");
  const tail = digits.slice(-9);
  return all.filter((a) => {
    if (/^\d{3,6}$/.test(digits) && a.patients?.file_no === Number(digits)) return true;
    const ph = a.patients?.phone || a.walk_in_phone || "";
    return tail.length >= 7 && ph.replace(/[^\d]/g, "").endsWith(tail);
  });
}

/** Position in the queue: people checked-in before her and not yet in session (same room when known). */
export function queueInfo(a: QueueAppt, today: QueueAppt[]) {
  const ahead = today.filter((x) => x.id !== a.id && x.status === "checked_in" && x.queue_no != null && a.queue_no != null && x.queue_no < a.queue_no
    && (!a.room_id || !x.room_id || x.room_id === a.room_id));
  const inRoom = today.find((x) => x.status === "in_session" && (!a.room_id || x.room_id === a.room_id));
  let wait = ahead.reduce((s, x) => s + x.minutes, 0);
  if (inRoom) wait += Math.max(0, Math.round((new Date(inRoom.started_at ?? inRoom.starts_at).getTime() + inRoom.minutes * 60000 - Date.now()) / 60000));
  return { ahead: ahead.length, wait };
}

export const aheadText = (n: number) => (n === 0 ? "لا أحد" : n === 1 ? "مراجعة واحدة" : n === 2 ? "مراجعتان" : n <= 10 ? `${n} مراجعات` : `${n} مراجعة`);

/* ---------- writes ---------- */

/** Checks an appointment in; the queue number is assigned by the database. */
export async function checkIn(id: string) {
  const row = need2(await supabase.from("appointments").update({ status: "checked_in" }).eq("id", id).in("status", ["pending", "confirmed"]).select("id, queue_no").maybeSingle());
  if (!row) {
    const cur = await getAppointment(id);
    if (!cur) throw new Error("لم يُعثر على الموعد");
    if (cur.queue_no == null) throw new Error(`لا يمكن تسجيل الوصول — حالة الموعد: ${STATUS_AR[cur.status]}`);
  }
  invalidate("queue"); invalidate("appointments");
  return id;
}

/** Calls a waiting patient to the TV screen (sets called_at). */
export async function callPatient(id: string) {
  need(await supabase.from("appointments").update({ called_at: new Date().toISOString() }).eq("id", id));
  invalidate("queue"); invalidate("appointments");
}

export async function setStatus(id: string, status: Status) {
  const patch: Partial<Tables<"appointments">> = { status };
  if (status === "in_session") patch.started_at = new Date().toISOString();
  if (status === "done") patch.finished_at = new Date().toISOString();
  need(await supabase.from("appointments").update(patch).eq("id", id));
  invalidate("queue"); invalidate("appointments");
}

/** Finds the patient file by phone, or opens one. */
export async function ensurePatient(name: string, phoneRaw: string) {
  const phone = normPhone(phoneRaw);
  if (phone) {
    const found = must(await supabase.from("patients").select("id,name").eq("phone", phone).maybeSingle());
    if (found) {
      if (!found.name && name.trim()) await supabase.from("patients").update({ name: name.trim() }).eq("id", found.id);
      return found.id;
    }
  }
  const row = need(await supabase.from("patients").insert({ name: name.trim(), phone: phone || null, source: "kiosk" }).select("id").single());
  invalidate("patients");
  return row.id;
}

/** Walk-in: opens/uses the patient file, books "now" and checks in immediately (rpc book_appointment). Returns the appointment id. */
export async function createWalkIn(input: { name: string; phone: string; service: Tables<"services"> }) {
  const patient_id = await ensurePatient(input.name, input.phone);
  const row = need(await supabase.rpc("book_appointment", {
    p_service: input.service.key, p_starts: new Date().toISOString(), p_patient: patient_id,
    p_source: "walk_in", p_check_in: true,
  }));
  invalidate("queue"); invalidate("appointments");
  return row.id;
}

export type PatientHit = Pick<Tables<"patients">, "id" | "name" | "phone" | "file_no">;

/** Patient files by name, phone or file number (staff). */
export async function searchPatients(term: string): Promise<PatientHit[]> {
  const t = term.trim();
  if (!t) return [];
  const digits = t.replace(/[^\d]/g, "");
  let q = supabase.from("patients").select("id,name,phone,file_no").limit(8);
  if (/^\d{3,6}$/.test(digits) && digits === t) q = q.eq("file_no", Number(digits));
  else if (digits.length >= 7) q = q.like("phone", `%${digits.slice(-9)}`);
  else q = q.ilike("name", `%${t.replace(/[%_,()]/g, "")}%`);
  return need(await q);
}

/** Quick booking at the desk (rpc book_appointment: refuses overlaps for the room and the specialist). */
export async function quickBook(input: { name: string; phone: string; patientId?: string; service: Tables<"services">; day: string; time: string; specialistId?: string | null }) {
  const patient_id = input.patientId ?? await ensurePatient(input.name, input.phone);
  const row = need(await supabase.rpc("book_appointment", {
    p_service: input.service.key, p_starts: atDamascus(input.day, input.time), p_patient: patient_id,
    p_specialist: input.specialistId || undefined, p_source: "reception",
  }));
  invalidate("queue"); invalidate("appointments");
  return row.id;
}

/** Start times already taken on a day (for the quick-book slot grid). */
export async function takenSlots(day: string, roomId: string | null) {
  const { from, to } = dayRange(day);
  let q = supabase.from("appointments").select("starts_at, minutes, room_id").gte("starts_at", from).lt("starts_at", to).not("status", "in", "(cancelled,no_show)");
  if (roomId) q = q.eq("room_id", roomId);
  return need(await q).map((r) => ({ start: clock(r.starts_at), minutes: r.minutes }));
}

/* cashier: invoices are created through @/lib/db/finance (createInvoice / listCashierQueue). */

/* ---------- consent, photos, eligibility ---------- */

async function upload(bucket: "consents" | "photos", patientId: string, blob: Blob, ext: string) {
  const path = `${patientId}/${dayKey()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type || (ext === "png" ? "image/png" : "image/jpeg"), upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function saveConsent(a: QueueAppt, signature: Blob, answers: Record<string, Json>) {
  if (!a.patient_id) throw new Error("لا يوجد ملف مراجِعة لهذا الموعد");
  const path = await upload("consents", a.patient_id, signature, "png");
  need(await supabase.from("consents").insert({ patient_id: a.patient_id, appointment_id: a.id, service_key: a.service_key, answers, signature_path: path }));
  invalidate("consents");
}

export async function hasConsent(appointmentId: string) {
  const r = need(await supabase.from("consents").select("id").eq("appointment_id", appointmentId).limit(1));
  return r.length > 0;
}

export async function savePhoto(a: QueueAppt, image: Blob, angle: string, stage: "before" | "after" | "progress") {
  if (!a.patient_id) throw new Error("لا يوجد ملف مراجِعة لهذا الموعد");
  const path = await upload("photos", a.patient_id, image, "jpg");
  const row = need(await supabase.from("patient_photos").insert({ patient_id: a.patient_id, appointment_id: a.id, path, angle, stage }).select().single());
  invalidate("photos");
  return row;
}

export async function listPhotos(appointmentId: string) {
  const rows = need(await supabase.from("patient_photos").select("*").eq("appointment_id", appointmentId).order("created_at"));
  const urls = rows.length ? need(await supabase.storage.from("photos").createSignedUrls(rows.map((r) => r.path), 3600)) : [];
  return rows.map((r, i) => ({ ...r, url: urls[i]?.signedUrl ?? null }));
}

export async function saveEligibility(id: string, answers: Record<string, Json>) {
  need(await supabase.from("appointments").update({ eligibility: answers, eligibility_at: new Date().toISOString() }).eq("id", id));
  invalidate("queue"); invalidate("appointments");
}

/* ---------- settings (call + TV content) ---------- */

export type CallSettings = { voice: "female" | "male"; repeat: number; languages: ("ar" | "en")[]; by_number_only: boolean; chime?: boolean; volume?: number; rate?: number };
export type TvTip = { title: string; body: string; points?: string[] };
export type TvContent = { tips: TvTip[]; interval_s: number };
export const CALL_DEFAULT: CallSettings = { voice: "female", repeat: 2, languages: ["ar", "en"], by_number_only: true, chime: true, volume: 80 };
export const TV_DEFAULT: TvContent = { tips: [], interval_s: 12 };

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const r = must(await supabase.from("settings").select("value").eq("key", key).maybeSingle());
  return { ...fallback, ...((r?.value as object) ?? {}) } as T;
}

export async function saveSetting(key: string, value: unknown) {
  need(await supabase.from("settings").upsert({ key, value: value as Json, updated_at: new Date().toISOString() }));
  invalidate("settings");
}

/* ---------- TV (public) ---------- */

export async function todayQueue(): Promise<TvRow[]> {
  return need(await supabase.rpc("today_queue")) as TvRow[];
}

/** Live queue for the TV: polls every 5 s (anon cannot subscribe to appointment rows). */
export function useLiveQueue(intervalMs = 5000) {
  const [rows, setRows] = useState<TvRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = () => todayQueue().then((r) => { if (alive) { setRows(r); setError(null); } }).catch((e: Error) => alive && setError(e.message));
    tick();
    const t = setInterval(tick, intervalMs);
    return () => { alive = false; clearInterval(t); };
  }, [intervalMs]);
  return { rows, error };
}

/** The most recent call (called_at) among today's rows that are still waiting or in session (a finished visit is not shown as "please proceed"). */
export function lastCalled(rows: TvRow[] | null) {
  return (rows ?? []).filter((r) => r.called_at && r.status !== "done").sort((a, b) => b.called_at!.localeCompare(a.called_at!))[0] ?? null;
}

/** Live clock that re-renders every 15 s. */
export function useNow(ms = 15000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

const AR_NUM = (n: number) => String(n);
/** Speaks a call in Arabic then English using the Web Speech API. */
export function speakCall(no: number, room: string | null, s: CallSettings = CALL_DEFAULT) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const pick = (lang: string) => {
    const vs = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
    const fem = vs.find((v) => /female|zira|hoda|salma|laila|samantha|google/i.test(v.name));
    return (s.voice === "female" ? fem : vs.find((v) => v !== fem)) ?? vs[0] ?? null;
  };
  const roomEn = room ? room.replace(/غرفة\s*/, "room ") : "";
  const lines: [string, string][] = [];
  if (s.languages.includes("ar")) lines.push(["ar-SA", `الرقم ${AR_NUM(no)}${room ? `، تفضّلي إلى ${room}` : ""}`]);
  if (s.languages.includes("en")) lines.push(["en-US", `Number ${no}${room ? `, please proceed to ${roomEn}` : ""}`]);
  synth.cancel();
  if (s.chime !== false) {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx(), g = ctx.createGain();
      g.connect(ctx.destination);
      [880, 660].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(g);
        const t = ctx.currentTime + i * 0.35;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25 * ((s.volume ?? 80) / 100) + 0.001, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.start(t); o.stop(t + 0.34);
      });
    } catch { /* no audio */ }
  }
  for (let i = 0; i < Math.max(1, s.repeat); i++) {
    for (const [lang, text] of lines) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = s.rate ?? 0.9; u.volume = (s.volume ?? 80) / 100;
      const v = pick(lang.slice(0, 2)); if (v) u.voice = v;
      if (s.chime !== false) setTimeout(() => synth.speak(u), 750); else synth.speak(u);
    }
  }
}

/** Calls `onCall` whenever a newer called_at appears (not on first load). */
export function useOnNewCall(rows: TvRow[] | null, onCall: (r: TvRow) => void) {
  const last = useRef<string | null | undefined>(undefined);
  const cb = useRef(onCall); cb.current = onCall;
  useEffect(() => {
    if (!rows) return;
    // newest call of all rows (also finished ones), so a visit finishing never looks like a "new" call
    const top = rows.filter((r) => r.called_at).sort((a, b) => b.called_at!.localeCompare(a.called_at!))[0] ?? null;
    const at = top?.called_at ?? null;
    if (last.current === undefined) { last.current = at; return; }
    if (at && at > (last.current ?? "")) { last.current = at; if (top!.status !== "done") cb.current(top!); }
  }, [rows]);
}
