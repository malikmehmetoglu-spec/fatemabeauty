"use client";

/**
 * Finance & reports — invoices, payments, cash shifts, expenses, receivables and computed analytics.
 * Invoices are created only through the `create_invoice` rpc (one transaction: items, product stock, package session,
 * discount rule from settings.policies, payments). Reusable by the kiosk cashier (T_Cashier).
 */
import { supabase, type Tables } from "@/lib/supabase/client";
import { dayKey, dayRange } from "@/lib/format";
import { invalidate, must } from "./query";

/** Like must(), for list queries: never null. */
function rows<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  return must(res) ?? [];
}

export type Invoice = Tables<"invoices">;
export type InvoiceItem = Tables<"invoice_items">;
export type InvoicePayment = Tables<"invoice_payments">;
export type CashShift = Tables<"cash_shifts">;
export type Expense = Tables<"expenses">;
export type PayMethod = Invoice["method"];

export const PAY_LABEL: Record<PayMethod, string> = { cash: "نقدي", card: "بطاقة", package: "رصيد باقة", points: "نقاط الولاء" };

export const EXPENSE_CATEGORIES = ["إيجار", "رواتب", "مواد", "كهرباء", "صيانة", "تسويق", "ضيافة", "أخرى"];

/** Arabic text for errors raised by the finance rpcs. */
export function financeError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  const map: [string, string][] = [
    ["discount needs approval", "الخصم أعلى من الحد المسموح ويحتاج موافقة الإدارة (حساب إدارة)."],
    ["out of stock", "الكمية غير متوفرة في المخزون: "],
    ["unavailable", "المنتج غير متاح للبيع: "],
    ["package has no sessions left", "لا جلسات متبقية في هذه الباقة."],
    ["package not found", "الباقة غير موجودة لهذه المراجعة."],
    ["deferred payment needs a patient file", "الدفع الآجل يحتاج ملف مراجعة."],
    ["a package needs a patient file", "بيع باقة يحتاج ملف مراجعة."],
    ["appointment already invoiced", "صدرت فاتورة لهذا الموعد من قبل."],
    ["paid more than total", "المبلغ المدفوع أكبر من المطلوب."],
    ["empty invoice", "أضيفي بنداً واحداً على الأقل."],
    ["a shift is already open", "هناك وردية مفتوحة بالفعل."],
    ["no open shift", "الصندوق مغلق — افتحي وردية من «الصندوق اليومي» قبل أي حركة نقدية."],
    ["bad amount", "المبلغ غير صحيح."],
    ["bad quantity", "الكمية يجب أن تكون عدداً صحيحاً موجباً."],
    ["not allowed", "لا تملكين صلاحية هذه العملية."],
    ["package does not cover this service", "الباقة المختارة لا تشمل أي خدمة في هذه الفاتورة."],
    ["one package per invoice", "باقة واحدة فقط لكل فاتورة."],
    ["custom lines need admin", "البنود اليدوية بسعر حر تحتاج حساب إدارة."],
    ["unknown service", "الخدمة غير موجودة أو موقوفة."],
    ["unknown package", "الباقة غير موجودة أو موقوفة."],
    ["unknown patient", "ملف المراجعة غير موجود."],
    ["unknown appointment", "الموعد غير موجود."],
    ["appointment not billable", "لا يمكن إصدار فاتورة لموعد ملغى أو لم تحضر صاحبته."],
    ["unknown invoice", "الفاتورة غير موجودة أو ملغاة."],
    ["discount larger than subtotal", "الخصم أكبر من مجموع الفاتورة."],
    ["cash or card only", "الدفعة اللاحقة نقداً أو بالبطاقة فقط."],
    ["points payment not supported", "الدفع بالنقاط غير متاح بعد."],
    ["bad payment method", "طريقة الدفع غير صحيحة."],
    ["bad price", "السعر غير صحيح."],
    ["bad item", "بند غير معروف في الفاتورة."],
    ["void reason required", "اكتبي سبب الإلغاء."],
    ["sold package already used", "لا يمكن إلغاء فاتورة باقة استُخدمت منها جلسات أو حُجزت عليها مواعيد."],
    ["difference needs a reason", "يوجد فرق بين المعدود والمتوقع — اكتبي السبب قبل الإغلاق."],
    ["shift closed", "هذا المصروف ضمن وردية مغلقة ولا يمكن تعديله أو حذفه (المالكة فقط)."],
    ["cash_shifts_one_open", "هناك وردية مفتوحة بالفعل."],
    ["Failed to fetch", "تعذّر الاتصال بالخادم — تحققي من الإنترنت وأعيدي المحاولة."],
  ];
  for (const [k, v] of map) if (m.includes(k)) return v.endsWith(": ") ? v + m.split(": ").slice(1).join(": ") : v;
  return /[\u0600-\u06FF]/.test(m) ? m : "تعذّرت العملية، أعيدي المحاولة. (" + m + ")";
}

/* ---------- periods ---------- */

/** Range for a Damascus month "YYYY-MM": timestamps [from, to) and dates [fromDay, toDay). */
export function monthRange(month = dayKey().slice(0, 7)) {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  return { from: dayRange(`${month}-01`).from, to: dayRange(`${next}-01`).from, fromDay: `${month}-01`, toDay: `${next}-01` };
}
export function daysRange(fromDay: string, toDayExclusive: string) {
  return { from: dayRange(fromDay).from, to: dayRange(toDayExclusive).from, fromDay, toDay: toDayExclusive };
}
export function shiftDay(key: string, n: number) {
  const d = new Date(`${key}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const monthOf = (key: string) => key.slice(0, 7);
export function shiftMonth(month: string, n: number) {
  const [y, m] = month.split("-").map(Number);
  const t = y * 12 + (m - 1) + n;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}

/* ---------- reference data ---------- */

export async function getPolicies() {
  const row = must(await supabase.from("settings").select("value").eq("key", "policies").maybeSingle());
  const v = (row?.value ?? {}) as { max_discount_without_approval?: number };
  return { maxDiscount: Number(v.max_discount_without_approval ?? 0) };
}

export async function listSellables() {
  const [services, products, packages] = await Promise.all([
    supabase.from("services").select("key, name, short_name, price, minutes").eq("active", true).order("sort"),
    supabase.from("products").select("key, name, size, price, stock, unit").eq("active", true).eq("kind", "retail").not("price", "is", null).order("name"),
    supabase.from("packages").select("id, name, sessions, price, service_key").eq("active", true).order("name"),
  ]);
  return { services: rows(services), products: rows(products), packages: rows(packages) };
}

/** user_id → staff name (invoices store the auth user who issued them). */
export async function staffNames() {
  const list = rows(await supabase.from("staff").select("user_id, name"));
  return Object.fromEntries(list.filter((r) => r.user_id).map((r) => [r.user_id as string, r.name])) as Record<string, string>;
}

export async function searchPatients(q: string) {
  const s = q.trim();
  if (!s) return [];
  let req = supabase.from("patients").select("id, name, file_no, phone").limit(8);
  req = /^\d+$/.test(s) ? req.or(`file_no.eq.${s},phone.ilike.%${s}%`) : req.ilike("name", `%${s}%`);
  return rows(await req);
}

export async function listPatientPackages(patientId: string) {
  // packages emptied by a voided sale have 0 sessions → hidden
  return rows(await supabase.from("patient_packages").select("*, packages(name, service_key)").eq("patient_id", patientId).gt("sessions_total", 0).order("purchased_at", { ascending: false }));
}

/* ---------- cashier ---------- */

const APPT_SELECT = "id, patient_id, walk_in_name, service_key, price, status, starts_at, finished_at, minutes, patients(name, file_no, phone), services(name, price), staff(name), rooms(name), invoices(id, void)";

/** Today's appointments the cashier cares about: finished (ready to pay), in session or checked in. Invoiced ones are flagged. */
export async function listCashierQueue() {
  const r = dayRange();
  const list = rows(await supabase.from("appointments").select(APPT_SELECT).gte("starts_at", r.from).lt("starts_at", r.to)
    .in("status", ["checked_in", "in_session", "done"]).order("starts_at"));
  return list.map((a) => ({ ...a, invoiced: (a.invoices ?? []).some((i) => !i.void) }));
}
export type CashierAppt = Awaited<ReturnType<typeof listCashierQueue>>[number];

export type CartLine =
  | { kind: "service"; ref: string; qty: number; label: string; unit_price: number }
  | { kind: "product"; ref: string; qty: number; label: string; unit_price: number }
  | { kind: "package"; ref: string; qty: number; label: string; unit_price: number }
  | { kind: "custom"; ref?: string; qty: number; label: string; unit_price: number };

export type InvoiceArgs = {
  patientId?: string | null; appointmentId?: string | null; walkInName?: string | null;
  lines: CartLine[]; discount: number; payments: { method: PayMethod; amount: number }[];
  patientPackageId?: string | null; note?: string; dueOn?: string | null;
};

/** One atomic call: invoice + items + stock 'sale' movements + package session + payments. */
export async function createInvoice(a: InvoiceArgs) {
  const inv = must(await supabase.rpc("create_invoice", {
    p_patient: (a.patientId ?? null) as string,
    p_appointment: (a.appointmentId ?? null) as string,
    // prices come from the DB; only a custom line (admin) carries its own price
    p_items: a.lines.map((l) => ({ kind: l.kind, ref: l.ref ?? null, qty: l.qty, label: l.label, ...(l.kind === "custom" ? { unit_price: l.unit_price } : {}) })),
    p_discount: Math.max(0, Math.round(a.discount)),
    p_payments: a.payments.filter((p) => p.amount > 0 || p.method === "package"),
    p_patient_package: a.patientPackageId ?? undefined,
    p_note: a.note || undefined,
    p_due_on: a.dueOn ?? undefined,
    p_walk_in_name: a.walkInName ?? undefined,
  }));
  ["invoices", "finance", "queue", "products", "patients", "appointments", "commissions"].forEach(invalidate);
  return inv;
}

export async function payInvoice(id: string, amount: number, method: "cash" | "card") {
  const inv = must(await supabase.rpc("pay_invoice", { p_invoice: id, p_amount: Math.round(amount), p_method: method }));
  ["invoices", "finance", "patients", "commissions"].forEach(invalidate);
  return inv;
}

export async function voidInvoice(id: string, reason: string) {
  must(await supabase.rpc("void_invoice", { p_invoice: id, p_reason: reason }));
  ["invoices", "finance", "products", "patients", "queue", "appointments", "commissions"].forEach(invalidate);
}

/* ---------- invoices ---------- */

const INV_SELECT = "*, patients(name, file_no, phone), invoice_items(*), invoice_payments(*), appointments(starts_at, services(name), staff(name))";

export async function listInvoices(from: string, to: string) {
  return rows(await supabase.from("invoices").select(INV_SELECT).gte("created_at", from).lt("created_at", to).order("created_at", { ascending: false }));
}
export type InvoiceRow = Awaited<ReturnType<typeof listInvoices>>[number];
export async function getInvoice(id: string) {
  return must(await supabase.from("invoices").select(INV_SELECT).eq("id", id).single());
}
type Pay = { amount: number; method: PayMethod };

/** Money actually received for an invoice (falls back to the total for invoices recorded without payment rows). */
export function collected(inv: Pick<Invoice, "paid" | "total" | "amount_paid" | "void"> & { invoice_payments?: { amount: number }[] | null }) {
  if (inv.void) return 0;
  const p = inv.invoice_payments ?? [];
  if (p.length) return p.reduce((s, x) => s + x.amount, 0);
  return inv.amount_paid || (inv.paid ? inv.total : 0);
}
export const outstanding = (inv: Parameters<typeof collected>[0]) => (inv.void ? 0 : Math.max(0, inv.total - collected(inv)));

/** Amount received per method (payment rows, or the invoice method when there are none). */
export function byMethod(invs: InvoiceRow[]) {
  const out: Record<PayMethod, number> = { cash: 0, card: 0, package: 0, points: 0 };
  for (const i of invs) {
    if (i.void) continue;
    if (i.invoice_payments?.length) (i.invoice_payments as Pay[]).forEach((p) => { out[p.method] += p.amount; });
    else if (i.paid) out[i.method as PayMethod] += i.total;
  }
  return out;
}

export function invoiceTitle(i: InvoiceRow) {
  const svc = i.appointments?.services?.name;
  const first = i.invoice_items?.[0]?.label;
  const n = i.invoice_items?.length ?? 0;
  return (svc ?? first ?? "—") + (n > 1 ? ` + ${n - 1}` : "");
}
export const customerName = (i: { patients?: { name: string } | null; walk_in_name?: string | null }) => i.patients?.name || i.walk_in_name || "زبونة بدون ملف";

/** Unpaid (open) invoices, oldest due first. */
export async function listReceivables() {
  return rows(await supabase.from("invoices").select(INV_SELECT).eq("paid", false).eq("void", false).order("due_on", { ascending: true, nullsFirst: false }).order("created_at"));
}

/* ---------- cash box ---------- */

export async function getOpenShift() {
  return must(await supabase.from("cash_shifts").select("*").is("closed_at", null).maybeSingle());
}
export async function listShifts(limit = 10) {
  return rows(await supabase.from("cash_shifts").select("*").order("opened_at", { ascending: false }).limit(limit));
}
/**
 * Everything that went through a shift: cash payments of the shift (shift_id), card / package payments taken while it was
 * open (shown for information, outside the drawer), till expenses and cash refunds of invoices voided during the shift.
 * expected = opening + cash − till expenses − refunds (computed on the server).
 */
export async function shiftActivity(shift: CashShift) {
  const end = shift.closed_at ?? new Date(Date.now() + 60_000).toISOString();
  const [cashPays, otherPays, exps, refunds, expected] = await Promise.all([
    supabase.from("invoice_payments").select("*, invoices(no, walk_in_name, patients(name))").eq("shift_id", shift.id).order("paid_at", { ascending: false }),
    supabase.from("invoice_payments").select("*, invoices(no, walk_in_name, patients(name))").neq("method", "cash").gte("paid_at", shift.opened_at).lt("paid_at", end).order("paid_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("shift_id", shift.id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, no, refund_cash, void_at, walk_in_name, patients(name)").eq("refund_shift_id", shift.id).order("void_at", { ascending: false }),
    shift.closed_at ? Promise.resolve({ data: shift.expected_cash ?? 0, error: null }) : supabase.rpc("cash_shift_expected", { p_shift: shift.id }),
  ]);
  return { payments: [...rows(cashPays), ...rows(otherPays)], expenses: rows(exps), refunds: rows(refunds), expected: Number(must(expected) ?? 0) };
}
export async function openShift(opening: number) {
  const s = must(await supabase.rpc("open_cash_shift", { p_opening: Math.round(opening) }));
  invalidate("finance"); return s;
}
export async function closeShift(counted: number, note?: string) {
  const s = must(await supabase.rpc("close_cash_shift", { p_counted: Math.round(counted), p_note: note }));
  invalidate("finance"); return s;
}

/* ---------- expenses ---------- */

export async function listExpenses(fromDay: string, toDay: string) {
  return rows(await supabase.from("expenses").select("*").gte("spent_on", fromDay).lt("spent_on", toDay).order("spent_on", { ascending: false }).order("created_at", { ascending: false }));
}
export type ExpenseInput = { id?: string; category: string; label: string; amount: number; spent_on: string; note?: string | null; from_cash_box: boolean };
export async function saveExpense(e: ExpenseInput) {
  const { id, ...row } = e;
  if (id) must(await supabase.from("expenses").update(row).eq("id", id));
  else {
    const { data: u } = await supabase.auth.getUser();
    must(await supabase.from("expenses").insert({ ...row, created_by: u.user?.id ?? null }));
  }
  invalidate("finance");
}
export async function deleteExpense(id: string) {
  must(await supabase.from("expenses").delete().eq("id", id));
  invalidate("finance");
}

/* ---------- reports ---------- */

/**
 * Rows for a finance report over [from, to): invoices issued in the period (sales), money received in the period
 * (payment rows by paid_at, whatever the invoice date; voided invoices excluded) and expenses. Computed on the page.
 */
export async function financeData(r: { from: string; to: string; fromDay: string; toDay: string }) {
  const [invs, exps, pays] = await Promise.all([
    listInvoices(r.from, r.to), listExpenses(r.fromDay, r.toDay),
    supabase.from("invoice_payments").select("amount, method, paid_at, invoices!inner(void)").eq("invoices.void", false).gte("paid_at", r.from).lt("paid_at", r.to),
  ]);
  return { invoices: invs.filter((i) => !i.void), expenses: exps, payments: rows(pays).map(({ amount, method, paid_at }) => ({ amount, method, paid_at })) };
}
export type ReceivedRow = { amount: number; method: PayMethod; paid_at: string };
export function receivedByMethod(p: ReceivedRow[]) {
  const out: Record<PayMethod, number> = { cash: 0, card: 0, package: 0, points: 0 };
  p.forEach((x) => { out[x.method] += x.amount; });
  return out;
}

/** Operational rows over [from, to): appointments (with service), new patients, reviews. */
export async function opsData(from: string, to: string) {
  const [appts, newPatients, reviews] = await Promise.all([
    supabase.from("appointments").select("id, patient_id, status, starts_at, service_key, source, services(name)").gte("starts_at", from).lt("starts_at", to),
    supabase.from("patients").select("id, created_at").gte("created_at", from).lt("created_at", to),
    supabase.from("reviews").select("stars, created_at").gte("created_at", from).lt("created_at", to),
  ]);
  const a = rows(appts);
  const ids = [...new Set(a.map((x) => x.patient_id).filter(Boolean))] as string[];
  // first-ever visit per patient (to split new vs returning)
  const firsts = ids.length
    ? rows(await supabase.from("appointments").select("patient_id, starts_at").in("patient_id", ids).in("status", ["done", "checked_in", "in_session"]).lt("starts_at", from).limit(5000))
    : [];
  const returning = new Set(firsts.map((f) => f.patient_id));
  return { appointments: a, newPatients: rows(newPatients), reviews: rows(reviews), returning };
}

/* ---------- patient (own) ---------- */

export async function myInvoices(patientId: string) {
  return rows(await supabase.from("invoices").select("*, invoice_items(*), invoice_payments(*), appointments(services(name), staff(name))").eq("patient_id", patientId).eq("void", false).order("created_at", { ascending: false }));
}
export async function myPackages(patientId: string) {
  return rows(await supabase.from("patient_packages").select("*, packages(name)").eq("patient_id", patientId).gt("sessions_total", 0).order("purchased_at", { ascending: false }));
}

/* ---------- helpers ---------- */

export function sumBy<T>(rows: T[], key: (r: T) => string, val: (r: T) => number) {
  const m = new Map<string, number>();
  rows.forEach((r) => m.set(key(r), (m.get(key(r)) ?? 0) + val(r)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
/** Damascus day key of a timestamp. */
export const dayOf = (ts: string) => dayKey(new Date(ts));
