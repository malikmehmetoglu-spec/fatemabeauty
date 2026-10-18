"use client";

/** Team: staff members, their logins (via the «staff-admin» Edge Function), shifts, attendance, leave, payroll, commissions. */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Staff = Tables<"staff">;
export type Role = Staff["role"];
export type Shift = Tables<"staff_shifts">;
export type Attendance = Tables<"staff_attendance">;
export type Leave = Tables<"leave_requests">;
export type Payroll = Tables<"payroll_entries">;
export type CommissionRule = Tables<"commission_rules">;

export const ROLES: Role[] = ["owner", "admin", "specialist", "reception", "accountant"];
export const LEAVE_KIND: Record<string, string> = { annual: "سنوية", sick: "مرضية", unpaid: "بلا راتب", other: "أخرى" };
export const LEAVE_STATUS: Record<string, string> = { pending: "بانتظار الموافقة", approved: "موافق عليها", rejected: "مرفوضة" };

export function staffPhoto(s: Pick<Staff, "photo_url">) {
  const p = s.photo_url;
  if (!p) return null;
  if (/^(https?:)?\//.test(p)) return p;
  return supabase.storage.from("staff").getPublicUrl(p).data.publicUrl;
}

/* ---------- team ---------- */

export async function listStaff() {
  return must(await supabase.from("staff").select("*").order("active", { ascending: false }).order("created_at"));
}

export type StaffInput = { id?: string; name: string; title: string; role: Role; phone: string | null; photo_url?: string | null };

export async function saveStaff(input: StaffInput) {
  const { id, ...rest } = input;
  const row = id
    ? must(await supabase.from("staff").update(rest).eq("id", id).select().single())
    : must(await supabase.from("staff").insert(rest).select().single());
  invalidate("staff");
  return row;
}

/** Deactivate / reactivate a member without a login (members with a login go through the Edge Function so the login is banned too). */
export async function setStaffActive(s: Staff, active: boolean) {
  if (s.user_id) await staffAdmin({ action: active ? "enable" : "disable", staff_id: s.id });
  else must(await supabase.from("staff").update({ active }).eq("id", s.id));
  invalidate("staff");
}

export async function uploadStaffPhoto(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("staff").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

type AdminCall =
  | { action: "create"; staff_id: string; login: string; password: string }
  | { action: "password"; staff_id: string; password: string }
  | { action: "enable" | "disable"; staff_id: string };

/** Calls the «staff-admin» Edge Function (service role on the server; caller must be owner/admin). */
export async function staffAdmin(body: AdminCall) {
  const { data, error } = await supabase.functions.invoke("staff-admin", { body });
  if (error) {
    let msg = error.message;
    try { const ctx = (error as { context?: Response }).context; const j = ctx ? await ctx.json() : null; if (j?.error) msg = j.error; } catch { /* keep message */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  invalidate("staff");
  return data as { ok: true; email?: string };
}

/** The signed-in member changes her own password. */
export async function changeMyPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

/* ---------- shifts ---------- */

export async function listShifts(from: string, to: string) {
  return must(await supabase.from("staff_shifts").select("*").gte("day", from).lte("day", to).order("day").order("starts"));
}
export async function saveShift(input: { id?: string; staff_id: string; day: string; starts: string; ends: string; room_id: string | null; note: string }) {
  const { id, ...rest } = input;
  if (id) must(await supabase.from("staff_shifts").update(rest).eq("id", id));
  else must(await supabase.from("staff_shifts").insert(rest));
  invalidate("shifts");
}
export async function removeShift(id: string) {
  must(await supabase.from("staff_shifts").delete().eq("id", id));
  invalidate("shifts");
}
export async function listRooms() {
  return must(await supabase.from("rooms").select("id, name").order("name"));
}

/* ---------- attendance & leave ---------- */

export async function listAttendance(from: string, to: string) {
  return must(await supabase.from("staff_attendance").select("*").gte("day", from).lte("day", to).order("day", { ascending: false }));
}
export async function punch(kind: "in" | "out") {
  must(await supabase.rpc("attendance_punch", { p_kind: kind }));
  invalidate("attendance");
}
export async function saveAttendance(input: { id?: string; staff_id: string; day: string; check_in: string | null; check_out: string | null; note: string }) {
  const { id, ...rest } = input;
  if (id) must(await supabase.from("staff_attendance").update(rest).eq("id", id));
  else must(await supabase.from("staff_attendance").upsert(rest, { onConflict: "staff_id,day" }));
  invalidate("attendance");
}
export async function listLeave() {
  return must(await supabase.from("leave_requests").select("*").order("created_at", { ascending: false }).limit(200));
}
export async function requestLeave(input: { staff_id: string; starts: string; ends: string; kind: string; reason: string }, asAdmin = false) {
  must(await supabase.from("leave_requests").insert({ ...input, ...(asAdmin ? {} : { status: "pending" }) }));
  invalidate("leave");
}
export async function decideLeave(id: string, status: "approved" | "rejected", by: string) {
  must(await supabase.from("leave_requests").update({ status, decided_by: by }).eq("id", id));
  invalidate("leave");
}

/* ---------- payroll ---------- */

export async function listPayroll(period: string) {
  return must(await supabase.from("payroll_entries").select("*").eq("period", period));
}
export async function savePayroll(input: { id?: string; staff_id: string; period: string; base_salary: number; commission: number; bonus: number; deductions: number; note: string }) {
  const { id, ...rest } = input;
  if (id) must(await supabase.from("payroll_entries").update(rest).eq("id", id));
  else must(await supabase.from("payroll_entries").insert(rest));
  invalidate("payroll");
}
export async function markPaid(id: string, paid: boolean) {
  must(await supabase.from("payroll_entries").update({ paid_at: paid ? new Date().toISOString() : null }).eq("id", id));
  invalidate("payroll");
}
export const netPay = (p: Payroll) => p.base_salary + p.commission + p.bonus - p.deductions;

/* ---------- commissions ---------- */

export async function listCommissionRules() {
  return must(await supabase.from("commission_rules").select("*"));
}
export async function saveCommissionRule(staff_id: string, percent: number, note: string) {
  must(await supabase.from("commission_rules").upsert({ staff_id, percent, note, updated_at: new Date().toISOString() }));
  invalidate("commissions");
}

/** Paid invoices in [from, to) whose appointment had a specialist — the base for commissions. */
export async function listCommissionBase(fromIso: string, toIso: string) {
  const rows = must(await supabase.from("invoices").select("id, total, created_at, appointments!inner(specialist_id)")
    .eq("paid", true).gte("created_at", fromIso).lt("created_at", toIso).not("appointments.specialist_id", "is", null));
  return rows as unknown as { id: string; total: number; created_at: string; appointments: { specialist_id: string } }[];
}

/** "YYYY-MM" in Damascus time. */
export function monthKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus", year: "numeric", month: "2-digit" }).format(d).slice(0, 7);
}
