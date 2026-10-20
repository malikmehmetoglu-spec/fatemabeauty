"use client";

/**
 * One invoice → printed receipt + WhatsApp summary. Shared by the admin cashier, the invoices list / details and the
 * reception tablet cashier. The receipt is portalled straight under <body> only while printing, and the print
 * stylesheet hides every other child of <body>, so exactly one invoice is printed.
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import { Icon } from "@/components/ui";
import { customerName, outstanding, PAY_LABEL, type InvoiceRow } from "@/lib/db/finance";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { C, LOGO, SHB } from "@/lib/tokens";
import css from "./finance.module.css";

export type PrintExtras = { staff?: string | null; received?: number | null; change?: number | null };

const when = (iso: string) => `${arDate(new Date(`${dayKey(new Date(iso))}T12:00:00`), { year: true })} · ${clock(iso)}`;
const methodsOf = (inv: InvoiceRow) => {
  const ms = [...new Set((inv.invoice_payments ?? []).filter((p) => p.amount > 0 || p.method === "package").map((p) => PAY_LABEL[p.method]))];
  return ms.length ? ms.join(" + ") : inv.paid ? PAY_LABEL[inv.method] : "آجل";
};
const paidOf = (inv: InvoiceRow) => (inv.invoice_payments ?? []).reduce((s, p) => s + p.amount, 0) || inv.amount_paid || 0;

/** International number for wa.me (digits only, Syrian 09… → 9639…). Null when there is no usable number. */
export function waPhone(phone?: string | null) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "963" + d.slice(1);
  else if (d.length === 9 && d.startsWith("9")) d = "963" + d;
  return d.length >= 10 ? d : null;
}

/** Arabic plain-text summary of one invoice for WhatsApp. */
export function waText(inv: InvoiceRow, extras: PrintExtras = {}) {
  const left = inv.void ? 0 : outstanding(inv);
  const lines = [
    "Fatema Beauty — مركز فاطمة بيوتي",
    `فاتورة رقم ${inv.no}${inv.void ? " (ملغاة)" : ""}`,
    `التاريخ: ${when(inv.created_at)}`,
    `المراجِعة: ${customerName(inv)}`,
    "",
    ...(inv.invoice_items ?? []).map((x) => `- ${x.label}${x.qty > 1 ? ` × ${x.qty}` : ""}: ${money(x.qty * x.unit_price)}`),
    "",
    ...(inv.discount > 0 ? [`الخصم: ${money(inv.discount)}`] : []),
    `الإجمالي: ${money(inv.total)}`,
    `المدفوع: ${money(paidOf(inv))} (${methodsOf(inv)})`,
    ...(left > 0 ? [`المتبقي: ${money(left)}${inv.due_on ? ` · يستحق ${inv.due_on}` : ""}`] : []),
    ...(extras.staff ? [`الموظفة: ${extras.staff}`] : []),
    "",
    "شكراً لزيارتكِ",
  ];
  return lines.join("\n");
}

export function waHref(inv: InvoiceRow, phone?: string | null, extras?: PrintExtras) {
  const p = waPhone(phone ?? inv.patients?.phone);
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(waText(inv, extras))}` : null;
}

/** The printed receipt itself (thermal-width, black on white). */
export function ReceiptSheet({ inv, extras = {} }: { inv: InvoiceRow; extras?: PrintExtras }) {
  const left = inv.void ? 0 : outstanding(inv);
  const row = (l: ReactNode, v: ReactNode, bold?: boolean) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "3px 0", fontWeight: bold ? 700 : 400 }}><span>{l}</span><span className={css.num}>{v}</span></div>
  );
  return (
    <div className={css.sheet} dir="rtl" data-print-receipt="">
      <div style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Fatema Beauty" style={{ height: 54, margin: "0 auto 4px", display: "block" }} />
        <div style={{ fontSize: "13pt", fontWeight: 700 }}>مركز فاطمة بيوتي</div>
        <div style={{ fontSize: "9pt" }}>Fatema Beauty — Skin Care Center</div>
      </div>
      <div className={css.dash} />
      {row("رقم الفاتورة", <span dir="ltr">{inv.no}</span>, true)}
      {row("التاريخ", when(inv.created_at))}
      {row("المراجِعة", `${customerName(inv)}${inv.patients?.file_no ? ` · ملف ${inv.patients.file_no}` : ""}`)}
      {inv.void && <div style={{ textAlign: "center", fontWeight: 700, margin: "4px 0" }}>— فاتورة ملغاة —</div>}
      <div className={css.dash} />
      {(inv.invoice_items ?? []).map((x) => row(<>{x.label}{x.qty > 1 ? <span dir="ltr"> × {x.qty}</span> : null}</>, money(x.qty * x.unit_price, false)))}
      <div className={css.dash} />
      {row("المجموع", money(inv.subtotal, false))}
      {inv.discount > 0 && row("الخصم", `− ${money(inv.discount, false)}`)}
      {row("الإجمالي", money(inv.total), true)}
      {row("المدفوع", money(paidOf(inv)))}
      {row("طريقة الدفع", methodsOf(inv))}
      {extras.received != null && row("المستلم", money(extras.received))}
      {extras.change != null && extras.change > 0 && row("الباقي للمراجِعة", money(extras.change))}
      {left > 0 && row(`المتبقي${inv.due_on ? ` (يستحق ${inv.due_on})` : ""}`, money(left), true)}
      {extras.staff && row("الموظفة", extras.staff)}
      {inv.note && <div style={{ marginTop: 6, fontSize: "9pt" }}>{inv.note}</div>}
      <div className={css.dash} />
      <div style={{ textAlign: "center" }}>شكراً لزيارتكِ</div>
    </div>
  );
}

/** `print(inv)` mounts that invoice's receipt and opens the print dialog; render `node` once in the page. */
export function useInvoicePrint() {
  const [job, setJob] = useState<{ inv: InvoiceRow; extras?: PrintExtras } | null>(null);
  const print = (inv: InvoiceRow, extras?: PrintExtras) => {
    flushSync(() => setJob({ inv, extras }));
    window.print();
  };
  const node = job && typeof document !== "undefined" ? createPortal(<ReceiptSheet inv={job.inv} extras={job.extras} />, document.body) : null;
  return { print, node };
}

const btn: CSSProperties = { height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", textDecoration: "none", cursor: "pointer" };

/** «طباعة الفاتورة» + «إرسال على واتساب» for one issued invoice. `compact` = icon-only (table rows). */
export function InvoiceActions({ inv, onPrint, phone, extras, compact, style }: {
  inv: InvoiceRow; onPrint: (inv: InvoiceRow, extras?: PrintExtras) => void; phone?: string | null; extras?: PrintExtras; compact?: boolean; style?: CSSProperties;
}) {
  const href = waHref(inv, phone, extras);
  const sq: CSSProperties = compact ? { width: 32, height: 32, padding: 0, borderRadius: 16 } : { flex: 1 };
  return (
    <div style={{ display: "flex", gap: compact ? 6 : 10, ...style }}>
      <button type="button" aria-label="طباعة الفاتورة" title="طباعة الفاتورة" onClick={() => onPrint(inv, extras)} style={{ ...btn, ...sq }}>
        <Icon name="print" color={C.accent} size={compact ? 15 : 17} stroke={1.9} />{!compact && "طباعة الفاتورة"}
      </button>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label="إرسال على واتساب" title="إرسال على واتساب" style={{ ...btn, ...sq }}>
          <Icon name="send" color={C.accent} size={compact ? 15 : 17} stroke={1.9} />{!compact && "إرسال على واتساب"}
        </a>
      ) : (
        <span role="button" aria-disabled="true" aria-label="إرسال على واتساب" title="لا يوجد رقم هاتف للمراجِعة" style={{ ...btn, ...sq, opacity: 0.45, cursor: "not-allowed" }}>
          <Icon name="send" color={C.muted} size={compact ? 15 : 17} stroke={1.9} />{!compact && "إرسال على واتساب"}
        </span>
      )}
    </div>
  );
}
