"use client";

/**
 * «طلب اشتراك بباقة» (table package_requests, migration 0178).
 * Patient requests a package from the app → pays at the centre → owner/admin confirm
 * (rpc package_request_confirm_payment → paid invoice with a package line → patient_packages row) → notification.
 */
import { supabase } from "@/lib/supabase/client";
import { invalidate } from "./query";

// The new table/RPCs are not in the generated types yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
const must = <T,>(r: { data: T; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data; };

export type PrStatus = "pending" | "paid" | "cancelled";
export type PackageRequest = { id: string; patient_id: string; package_id: string; status: PrStatus; price: number; created_at: string; paid_at: string | null };
export type PrRow = { id: string; patient_id: string; patient_name: string; file_no: number; phone: string | null; package_id: string; package_name: string;
  sessions: number; status: PrStatus; price: number; created_at: string; paid_at: string | null; invoice_no: string | null };

/** Friendly error text (client + admin). */
export function prError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/already_pending|package_requests_one_pending/.test(m)) return "طلبكِ لهذه الباقة قيد الانتظار من قبل.";
  if (/too_many_pending/.test(m)) return "لديكِ عدة طلبات قيد الانتظار؛ ادفعي في المركز لتفعيلها أولاً.";
  if (/unknown package/.test(m)) return "هذه الباقة غير متاحة حالياً.";
  if (/not_pending/.test(m)) return "تمّت معالجة هذا الطلب من قبل.";
  if (/no patient record/.test(m)) return "سجّلي دخولكِ بحسابكِ أولاً.";
  if (/not allowed|row-level/.test(m)) return "ليست لديكِ صلاحية لهذا الإجراء.";
  if (/shift/i.test(m)) return "افتحي وردية الصندوق أولاً ثم أعيدي المحاولة.";
  return "حدث خطأ غير متوقع. حاولي مرة أخرى.";
}

/* ---------- patient ---------- */
export async function myPendingPackageRequests(): Promise<PackageRequest[]> {
  return must(await db.from("package_requests").select("*").eq("status", "pending").order("created_at", { ascending: false })) ?? [];
}
export async function submitPackageRequest(packageId: string): Promise<PackageRequest> {
  const row = must(await db.rpc("package_request_submit", { p_package: packageId })) as PackageRequest;
  invalidate("pkgreq"); invalidate("notifications");
  return row;
}
export async function cancelPackageRequest(id: string) {
  must(await db.rpc("package_request_cancel", { p_id: id }));
  invalidate("pkgreq");
}

/* ---------- owner/admin ---------- */
export async function packageRequestList(): Promise<PrRow[]> {
  return must(await db.rpc("package_request_list")) ?? [];
}
export async function pendingPackageCount(): Promise<number> {
  const r = await db.from("package_requests").select("id", { count: "exact", head: true }).eq("status", "pending");
  return r.count ?? 0;
}
export async function confirmPackagePayment(id: string, method: "cash" | "card") {
  must(await db.rpc("package_request_confirm_payment", { p_id: id, p_method: method }));
  invalidate("pkgreq"); invalidate("packages");
}
