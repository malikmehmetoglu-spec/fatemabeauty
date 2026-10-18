"use client";

/** Clinical records — visits, packages, session notes, prescriptions, consents, before/after photos, care plans. */
import { supabase, type Tables } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { invalidate, must } from "./query";
import { dayRange } from "@/lib/format";

export type Note = Tables<"session_notes">;
export type Prescription = Tables<"prescriptions">;
export type Consent = Tables<"consents">;
export type Photo = Tables<"patient_photos">;

/** One product line of a prescription (generic types, no brands). */
export type RxItem = { name: string; how: string; when: "am" | "pm" | "both"; weeks?: number | null };
export const WHEN_LABEL: Record<RxItem["when"], string> = { am: "صباحاً", pm: "مساءً", both: "صباحاً ومساءً" };

export function rxItems(p: Pick<Prescription, "items"> | null | undefined): RxItem[] {
  const a = Array.isArray(p?.items) ? (p!.items as unknown[]) : [];
  return a.map((x) => x as Partial<RxItem>).filter((x) => x && x.name).map((x) => ({ name: String(x.name), how: String(x.how ?? ""), when: (x.when === "am" || x.when === "pm" ? x.when : "both"), weeks: x.weeks ?? null }));
}

export type NoteFields = { complaint?: string; exam?: string; procedure?: string; reaction?: string; plan?: string };

export const STATUS_LABEL: Record<string, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكد", checked_in: "حضرت", in_session: "في الجلسة", done: "تمت", no_show: "لم تحضر", cancelled: "ملغى",
};

const APPT = "id, starts_at, minutes, status, price, service_key, patient_id, patient_package_id, services(name, short_name), staff(name), rooms(name)";
export type Visit = { id: string; starts_at: string; minutes: number; status: string; price: number; service_key: string; patient_id: string | null; patient_package_id: string | null;
  services: { name: string; short_name: string } | null; staff: { name: string } | null; rooms: { name: string } | null };

export async function listVisits(patientId: string): Promise<Visit[]> {
  return must(await supabase.from("appointments").select(APPT).eq("patient_id", patientId).order("starts_at", { ascending: false })) as unknown as Visit[];
}

export async function getVisit(id: string): Promise<Visit | null> {
  return must(await supabase.from("appointments").select(APPT).eq("id", id).maybeSingle()) as unknown as Visit | null;
}

export type PatientPackage = Tables<"patient_packages"> & { packages: { name: string; service_key: string } | null };
export async function listPatientPackages(patientId: string): Promise<PatientPackage[]> {
  return must(await supabase.from("patient_packages").select("*, packages(name, service_key)").eq("patient_id", patientId).order("purchased_at", { ascending: false })) as PatientPackage[];
}

/* ---------- notes ---------- */

export type NoteRow = Note & { staff: { name: string } | null };
export async function listNotes(patientId: string): Promise<NoteRow[]> {
  return must(await supabase.from("session_notes").select("*, staff(name)").eq("patient_id", patientId).order("created_at", { ascending: false })) as NoteRow[];
}

export function noteText(f: NoteFields) {
  return [["الشكوى", f.complaint], ["الفحص", f.exam], ["الإجراء", f.procedure], ["استجابة البشرة", f.reaction], ["الخطة", f.plan]]
    .filter(([, v]) => v && v.trim()).map(([k, v]) => `${k}: ${v!.trim()}`).join("\n");
}

export async function saveNote(input: { patientId: string; appointmentId: string | null; authorId: string | null; fields: NoteFields }) {
  must(await supabase.from("session_notes").insert({
    patient_id: input.patientId, appointment_id: input.appointmentId, author_id: input.authorId,
    fields: input.fields as Json, body: noteText(input.fields),
  }));
  invalidate("clinical");
}

/* ---------- prescriptions ---------- */

export type RxRow = Prescription & { staff: { name: string } | null };
export async function listPrescriptions(patientId: string): Promise<RxRow[]> {
  return must(await supabase.from("prescriptions").select("*, staff(name)").eq("patient_id", patientId).order("created_at", { ascending: false })) as RxRow[];
}

export async function savePrescription(patientId: string, authorId: string | null, items: RxItem[]) {
  must(await supabase.from("prescriptions").insert({ patient_id: patientId, author_id: authorId, items: items as unknown as Json }));
  invalidate("clinical");
}

/* ---------- consents ---------- */

export type ConsentAnswers = { title?: string; questions?: Record<string, boolean>; signature?: string; signer?: string };
export type ConsentRow = Consent & { services: { name: string } | null; patients?: { name: string; file_no: number } | null };

export async function listConsents(patientId?: string): Promise<ConsentRow[]> {
  let q = supabase.from("consents").select("*, services(name), patients(name, file_no)").order("signed_at", { ascending: false }).limit(300);
  if (patientId) q = q.eq("patient_id", patientId);
  return must(await q) as ConsentRow[];
}

export async function signConsent(patientId: string, serviceKey: string | null, answers: ConsentAnswers) {
  must(await supabase.from("consents").insert({ patient_id: patientId, service_key: serviceKey, answers: answers as Json }));
  invalidate("clinical");
}

export type PendingConsent = { id: string; starts_at: string; patient_id: string; service_key: string; services: { name: string } | null; patients: { name: string; file_no: number } | null };

/** Today's booked visits of patients who have no consent for that visit/service yet. */
export async function pendingConsentsToday() {
  const { from, to } = dayRange();
  const appts = must(await supabase.from("appointments").select("id, starts_at, patient_id, service_key, services(name), patients(name, file_no)")
    .gte("starts_at", from).lt("starts_at", to).in("status", ["pending", "confirmed", "checked_in"]).not("patient_id", "is", null).order("starts_at")) as unknown as PendingConsent[];
  if (!appts.length) return [];
  const signed = must(await supabase.from("consents").select("patient_id, service_key, appointment_id").in("patient_id", appts.map((a) => a.patient_id)));
  return appts.filter((a) => !signed.some((s) => s.appointment_id === a.id || (s.patient_id === a.patient_id && s.service_key === a.service_key)));
}

/** Consent forms = one per active service. */
export async function consentForms() {
  return must(await supabase.from("services").select("key, name").eq("active", true).order("sort"));
}

/* ---------- photos (private bucket "photos", path "<patient_id>/<uuid>.<ext>") ---------- */

export const ANGLES: { key: string; label: string }[] = [
  { key: "front", label: "أمامي" }, { key: "right", label: "جانب أيمن" }, { key: "left", label: "جانب أيسر" }, { key: "close", label: "عن قرب" },
];
export const angleLabel = (k: string) => ANGLES.find((a) => a.key === k)?.label ?? k;
export const STAGE_LABEL: Record<string, string> = { before: "قبل", after: "بعد", progress: "متابعة" };
export type PhotoRow = Photo & { url: string | null };

export async function listPhotos(patientId: string): Promise<PhotoRow[]> {
  const rows = must(await supabase.from("patient_photos").select("*").eq("patient_id", patientId).order("created_at"));
  if (!rows.length) return [];
  const { data } = await supabase.storage.from("photos").createSignedUrls(rows.map((r) => r.path), 3600);
  return rows.map((r) => ({ ...r, url: data?.find((d) => d.path === r.path)?.signedUrl ?? null }));
}

export async function uploadPhoto(patientId: string, file: File, angle: string, stage: "before" | "after" | "progress", appointmentId: string | null) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${patientId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  must(await supabase.from("patient_photos").insert({ patient_id: patientId, path, angle, stage, appointment_id: appointmentId }));
  invalidate("clinical");
}

/* ---------- care plans ---------- */

export type CarePlanPackage = PatientPackage & { patients: { id: string; name: string; file_no: number; phone: string | null } | null; next: string | null; last: string | null };
/** Packages with sessions left, with each patient's next booked and last completed visit. */
export async function listActivePackages(): Promise<CarePlanPackage[]> {
  const rows = (must(await supabase.from("patient_packages").select("*, packages(name, service_key), patients(id, name, file_no, phone)").order("purchased_at", { ascending: false })) as PatientPackage[])
    .filter((r) => r.sessions_used < r.sessions_total) as CarePlanPackage[];
  if (!rows.length) return [];
  const appts = must(await supabase.from("appointments").select("patient_id, starts_at, status").in("patient_id", [...new Set(rows.map((r) => r.patient_id))]).in("status", ["pending", "confirmed", "checked_in", "in_session", "done"]).order("starts_at"));
  const now = new Date().toISOString();
  return rows.map((r) => {
    const mine = appts.filter((a) => a.patient_id === r.patient_id);
    return { ...r, next: mine.find((a) => a.status !== "done" && a.starts_at >= now)?.starts_at ?? null, last: [...mine].reverse().find((a) => a.status === "done")?.starts_at ?? null };
  });
}

export type Lapsed = { id: string; name: string; file_no: number; phone: string | null; last: string; days: number; service: string | null; hasUpcoming: boolean };
/** Patients whose last completed visit is at least `days` days ago and who have nothing booked. */
export async function listLapsed(days: number): Promise<Lapsed[]> {
  const rows = must(await supabase.from("appointments").select("patient_id, starts_at, status, services(name), patients(id, name, file_no, phone)").not("patient_id", "is", null).in("status", ["done", "pending", "confirmed"]).order("starts_at", { ascending: false }));
  const now = Date.now();
  const seen = new Map<string, Lapsed>();
  const upcoming = new Set<string>();
  for (const r of rows as unknown as { patient_id: string; starts_at: string; status: string; services: { name: string } | null; patients: { id: string; name: string; file_no: number; phone: string | null } | null }[]) {
    if (r.status !== "done") { if (new Date(r.starts_at).getTime() > now) upcoming.add(r.patient_id); continue; }
    if (seen.has(r.patient_id) || !r.patients) continue;
    const d = Math.floor((now - new Date(r.starts_at).getTime()) / 864e5);
    seen.set(r.patient_id, { ...r.patients, last: r.starts_at, days: d, service: r.services?.name ?? null, hasUpcoming: false });
  }
  return [...seen.values()].map((l) => ({ ...l, hasUpcoming: upcoming.has(l.id) })).filter((l) => l.days >= days && !l.hasUpcoming).sort((a, b) => b.days - a.days);
}
