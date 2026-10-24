"use client";

/**
 * «جهّزي استشارتكِ» — pre-consultation intake (table consult_intake, migration 0170).
 * Patient: fills/edits her own intake until the consultation starts; optional face photos only after the
 * photo consent (consents.kind = 'photo', rule of migration 0160); photos are linked to the appointment.
 * Staff: «ملخص ما قبل الاستشارة» + mark reviewed (rpc consult_intake_review).
 */
import { supabase, type Tables } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/database.types";
import { invalidate, must } from "./query";
import { listNotes, photoConsentOf, type NoteFields } from "./clinical";

export type Intake = Tables<"consult_intake">;
export type IntakeFields = { concern: string; since: string; tried: string; medications: string; allergies: string; pregnant: boolean | null; goals: string };
export const EMPTY_INTAKE: IntakeFields = { concern: "", since: "", tried: "", medications: "", allergies: "", pregnant: null, goals: "" };

export type ConsultAppt = {
  id: string; patient_id: string | null; starts_at: string; minutes: number; status: string; service_key: string;
  services: { name: string; is_consultation: boolean; is_online: boolean } | null; staff: { name: string } | null;
};

/** Is this (her) appointment a consultation that can still be prepared? */
export const intakeOpen = (a: Pick<ConsultAppt, "starts_at" | "status"> & { services: { is_consultation: boolean } | null } | null | undefined) =>
  !!a?.services?.is_consultation && (a.status === "pending" || a.status === "confirmed") && new Date(a.starts_at).getTime() > Date.now();

export async function getConsultAppt(id: string): Promise<ConsultAppt | null> {
  return must(await supabase.from("appointments").select("id, patient_id, starts_at, minutes, status, service_key, services(name, is_consultation, is_online), staff(name)").eq("id", id).maybeSingle()) as unknown as ConsultAppt | null;
}

/** Her next prepared-able consultation (for the booking done page, which does not carry the new id). */
export async function myNextConsult(): Promise<ConsultAppt | null> {
  const rows = must(await supabase.from("appointments").select("id, patient_id, starts_at, minutes, status, service_key, services!inner(name, is_consultation, is_online), staff(name)")
    .eq("services.is_consultation", true).in("status", ["pending", "confirmed"]).gt("starts_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1)) ?? [];
  return (rows[0] as unknown as ConsultAppt) ?? null;
}

export async function getIntake(appointmentId: string): Promise<Intake | null> {
  return must(await supabase.from("consult_intake").select("*").eq("appointment_id", appointmentId).maybeSingle());
}

export const intakeFields = (i: Intake | null): IntakeFields => i ? {
  concern: i.concern ?? "", since: i.since ?? "", tried: i.tried ?? "", medications: i.medications ?? "",
  allergies: i.allergies ?? "", pregnant: i.pregnant, goals: i.goals ?? "",
} : { ...EMPTY_INTAKE };

export async function saveIntake(a: ConsultAppt, f: IntakeFields, extra: Record<string, Json> = {}) {
  if (!a.patient_id) throw new Error("لا يوجد ملف لهذا الموعد");
  const t = (s: string) => s.trim() || null;
  const row = { appointment_id: a.id, patient_id: a.patient_id, concern: t(f.concern), since: t(f.since), tried: t(f.tried),
    medications: t(f.medications), allergies: t(f.allergies), pregnant: f.pregnant, goals: t(f.goals), extra };
  const res = await supabase.from("consult_intake").upsert(row, { onConflict: "appointment_id" });
  if (res.error) throw new Error(/row-level security/.test(res.error.message) ? "لم يعد بالإمكان تعديل النموذج — بدأ موعد الاستشارة أو أُلغي." : res.error.message);
  invalidate("intake");
}

/* ---------- photos (after the photo consent) ---------- */

export const myPhotoConsent = photoConsentOf;

export const PHOTO_TERMS = [
  "تُلتقط صور الوجه فقط — لا تُصوَّر أي منطقة أخرى من الجسم.",
  "تُحفظ الصور في ملفكِ الخاص لمتابعة خطتكِ العلاجية ومقارنة النتائج فقط.",
  "لا تُشارَك ولا تُنشَر في أي مكان دون إذن خطّي منفصل منكِ.",
  "يحق لكِ طلب حذف صوركِ في أي وقت.",
];

/** Photo consent; `a.id` null = not tied to an appointment (e.g. a written consultation). */
export async function signPhotoConsent(a: { patient_id: string | null; id: string | null; service_key: string | null }, signature: Blob, signer: string) {
  if (!a.patient_id) throw new Error("لا يوجد ملف لهذا الموعد");
  const path = `${a.patient_id}/${crypto.randomUUID()}.png`;
  const up = await supabase.storage.from("consents").upload(path, signature, { contentType: "image/png", upsert: false });
  if (up.error) throw new Error(up.error.message);
  must(await supabase.from("consents").insert({
    patient_id: a.patient_id, appointment_id: a.id, service_key: a.service_key, signature_path: path, kind: "photo",
    answers: { accepted: true, scope: "face", terms: PHOTO_TERMS, signer, method: "app" },
  }));
  invalidate("clinical"); invalidate("intake");
}

export type IntakePhoto = Tables<"patient_photos"> & { url: string | null };

export async function listApptPhotos(appointmentId: string): Promise<IntakePhoto[]> {
  const rows = must(await supabase.from("patient_photos").select("*").eq("appointment_id", appointmentId).order("created_at")) ?? [];
  if (!rows.length) return [];
  const { data } = await supabase.storage.from("photos").createSignedUrls(rows.map((r) => r.path), 3600);
  return rows.map((r) => ({ ...r, url: data?.find((d) => d.path === r.path)?.signedUrl ?? null }));
}

export async function uploadIntakePhoto(a: ConsultAppt, file: File, angle: string) {
  if (!a.patient_id) throw new Error("لا يوجد ملف لهذا الموعد");
  if (!file.type.startsWith("image/")) throw new Error("اختاري صورة.");
  if (file.size > 12 * 1024 * 1024) throw new Error("الصورة كبيرة جداً (الحد 12 ميغابايت).");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${a.patient_id}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from("photos").upload(path, file, { contentType: file.type, upsert: false });
  if (up.error) throw new Error(up.error.message);
  const ins = await supabase.from("patient_photos").insert({ patient_id: a.patient_id, appointment_id: a.id, path, angle, stage: "before" });
  if (ins.error) throw new Error(/موافقة|consult|row-level/.test(ins.error.message) ? "لا يمكن رفع الصور قبل توقيع موافقة التصوير أو بعد بدء الموعد." : ins.error.message);
  invalidate("intake");
}

/* ---------- staff summary ---------- */

export type IntakeSummary = {
  appt: ConsultAppt; intake: Intake | null; photos: IntakePhoto[];
  patient: { id: string; name: string; file_no: number; pregnant: boolean | null; breastfeeding: boolean | null; skin_type: string | null; notes: string | null } | null;
  visits: { id: string; starts_at: string; status: string; services: { name: string } | null; service_levels: { name: string } | null }[];
  lastNote: { created_at: string; fields: NoteFields; body: string; staff: string | null } | null;
  levels: string[]; fileAllergies: string[]; photoConsent: { signed: boolean; at: string } | null; reviewer: string | null;
};

export async function getIntakeSummary(appointmentId: string): Promise<IntakeSummary | null> {
  const appt = await getConsultAppt(appointmentId);
  if (!appt) return null;
  const pid = appt.patient_id;
  const [intake, photos, patient, visits, notes, consent, conds] = await Promise.all([
    getIntake(appointmentId),
    listApptPhotos(appointmentId),
    pid ? supabase.from("patients").select("id, name, file_no, pregnant, breastfeeding, skin_type, notes").eq("id", pid).maybeSingle().then(must) : Promise.resolve(null),
    pid ? supabase.from("appointments").select("id, starts_at, status, services(name), service_levels(name)").eq("patient_id", pid).neq("id", appointmentId)
      .lt("starts_at", new Date().toISOString()).in("status", ["done", "checked_in", "in_session"]).order("starts_at", { ascending: false }).limit(4).then(must) : Promise.resolve([]),
    pid ? listNotes(pid) : Promise.resolve([]),
    pid ? photoConsentOf(pid) : Promise.resolve(null),
    pid ? supabase.from("patient_conditions").select("kind, name").eq("patient_id", pid).eq("kind", "allergy").then(must) : Promise.resolve([]),
  ]);
  const n = notes?.[0];
  let reviewer: string | null = null;
  if (intake?.reviewed_by) reviewer = (must(await supabase.from("staff").select("name").eq("id", intake.reviewed_by).maybeSingle()))?.name ?? null;
  const vs = (visits ?? []) as unknown as IntakeSummary["visits"];
  return {
    appt, intake, photos, patient: patient as IntakeSummary["patient"], visits: vs,
    lastNote: n ? { created_at: n.created_at, fields: (n.fields ?? {}) as NoteFields, body: n.body, staff: n.staff?.name ?? null } : null,
    levels: [...new Set(vs.map((v) => v.service_levels?.name).filter((x): x is string => !!x))],
    fileAllergies: (conds ?? []).map((c) => c.name), photoConsent: consent, reviewer,
  };
}

export async function markIntakeReviewed(appointmentId: string, reviewed = true) {
  must(await supabase.rpc("consult_intake_review", { p_appointment: appointmentId, p_reviewed: reviewed }));
  invalidate("intake");
}

/** Staff: which of these appointments have an intake (id → reviewed?). */
export async function intakeStatus(appointmentIds: string[]): Promise<Record<string, { reviewed: boolean }>> {
  if (!appointmentIds.length) return {};
  const rows = must(await supabase.from("consult_intake").select("appointment_id, reviewed_at").in("appointment_id", appointmentIds)) ?? [];
  return Object.fromEntries(rows.map((r) => [r.appointment_id, { reviewed: !!r.reviewed_at }]));
}

/** Staff (patient record): her upcoming consultation, else the latest one of the last 30 days. */
export async function consultForRecord(patientId: string): Promise<string | null> {
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const rows = (must(await supabase.from("appointments").select("id, starts_at, services!inner(is_consultation)").eq("patient_id", patientId)
    .eq("services.is_consultation", true).neq("status", "cancelled").gte("starts_at", since).order("starts_at")) ?? []) as unknown as { id: string; starts_at: string }[];
  const now = Date.now();
  return (rows.find((r) => new Date(r.starts_at).getTime() >= now) ?? rows[rows.length - 1])?.id ?? null;
}
