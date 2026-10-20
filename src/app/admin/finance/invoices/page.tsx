"use client";

/** W_Invoices.dc.html — الفواتير (live, Supabase). Day view with method filters, details, payments and void. */
import { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Tag, type TagKind } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { byMethod, collected, customerName, invoiceTitle, listInvoices, outstanding, PAY_LABEL, staffNames, type InvoiceRow } from "@/lib/db/finance";
import { initials } from "@/lib/data";
import { arDate, clock, dayKey, dayRange, money } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";
import { Amount, Big, DeepBtn, LATIN, LightBtn, Pill, PANEL, StatCard, downloadCsv } from "../parts";
import { InvoiceDialog } from "./InvoiceDialog";
import { InvoiceActions, useInvoicePrint } from "../InvoicePrint";
import css from "../finance.module.css";

type F = "all" | "cash" | "card" | "package" | "open" | "void";
const METHOD_TAG: Record<string, TagKind> = { cash: "pink", card: "gray", package: "lilac", points: "plum" };

export default function Page() {
  const [day, setDay] = useState(dayKey());
  const [f, setF] = useState<F>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<InvoiceRow | null>(null);
  const r = dayRange(day);
  const { data, loading, error } = useQuery(["invoices", "day", day], () => listInvoices(r.from, r.to));
  const names = useQuery(["finance", "staffNames"], staffNames);
  const receipt = useInvoicePrint();

  const all = data ?? [];
  const live = all.filter((i) => !i.void);
  const m = byMethod(live);
  const received = live.reduce((s, i) => s + collected(i), 0);
  const due = live.reduce((s, i) => s + outstanding(i), 0);
  const count = (k: F) => (k === "all" ? live.length : k === "open" ? live.filter((i) => !i.paid).length : k === "void" ? all.length - live.length : live.filter((i) => i.method === k).length);
  const list = (f === "void" ? all.filter((i) => i.void) : f === "all" ? live : f === "open" ? live.filter((i) => !i.paid) : live.filter((i) => i.method === f))
    .filter((i) => !q || customerName(i).includes(q) || i.no.includes(q) || String(i.patients?.file_no ?? "").includes(q));
  const isToday = day === dayKey();

  const exportCsv = () => downloadCsv(`invoices-${day}.csv`, ["رقم", "الوقت", "المراجعة", "البنود", "الدفع", "المجموع", "الخصم", "الصافي", "المقبوض", "الحالة"],
    list.map((i) => [i.no, clock(i.created_at), customerName(i), (i.invoice_items ?? []).map((x) => `${x.label}×${x.qty}`).join(" + "), (i.invoice_payments ?? []).filter((p) => p.amount > 0).length > 1 ? (i.invoice_payments ?? []).filter((p) => p.amount > 0).map((p) => `${PAY_LABEL[p.method]} ${p.amount}`).join(" + ") : PAY_LABEL[i.method], i.subtotal, i.discount, i.total, collected(i), i.void ? "ملغاة" : i.paid ? "مدفوعة" : "غير مكتملة"]));

  return (
    <AdminShell active="المالية" title="الفواتير" subtitle={`${arDate(new Date(`${day}T12:00:00`))}${isToday ? ` · آخر تحديث ${clock()}` : ""}`} actions={
      <Link href={R.W_Cashier} style={{ textDecoration: "none" }}><DeepBtn icon="plus">فاتورة جديدة</DeepBtn></Link>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={css.stats}>
          <StatCard label={isToday ? "فواتير اليوم" : "فواتير اليوم المختار"} value={live.length} sub={all.length - live.length ? `${all.length - live.length} ملغاة` : "صادرة في هذا اليوم"} icon="receipt" />
          <StatCard label="نقدي" value={<Big n={m.cash} />} sub="مقبوض على فواتير هذا اليوم" icon="cash" />
          <StatCard label="بطاقة" value={<Big n={m.card} />} sub={m.package ? `و ${live.filter((i) => i.patient_package_id).length} جلسة من باقات` : "خارج الدرج"} icon="card" />
          <StatCard dark label="إجمالي المقبوض" value={<Big n={received} />} sub={due ? `متبقٍ غير مدفوع ${money(due)}` : "لا مبالغ متبقية"} icon="wallet" />
        </div>

        <div className={css.toolbar}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([["all", "الكل"], ["cash", "نقدي"], ["card", "بطاقة"], ["package", "باقة"], ["open", "غير مكتملة"], ["void", "ملغاة"]] as [F, string][]).map(([k, t]) => (
              <Pill key={k} on={f === k} onClick={() => setF(k)}>{t} ({count(k)})</Pill>
            ))}
          </div>
          <div className={css.toolbarEnd}>
            <input aria-label="بحث في الفواتير" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم، رقم ملف أو فاتورة" style={{ height: 40, width: 200, borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 14px", fontSize: 13 }} />
            <label style={{ height: 40, borderRadius: 20, background: C.white, boxShadow: SHB, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 12px", color: C.accent }}>
              <Icon name="cal" color={C.accent} size={17} />
              <input aria-label="اليوم" type="date" value={day} max={dayKey()} onChange={(e) => e.target.value && setDay(e.target.value)} style={{ border: "none", background: "transparent", color: C.accent, fontSize: 13, ...LATIN }} />
            </label>
            <LightBtn icon="download" onClick={exportCsv} disabled={!list.length}>تصدير</LightBtn>
          </div>
        </div>

        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الفواتير: {error}</ErrorNote> : all.length === 0 ? (
          <EmptyState icon="receipt" title={isToday ? "لا فواتير اليوم بعد" : "لا فواتير في هذا اليوم"} text="تظهر هنا كل فاتورة تصدر من الكاشير أو من تابلت الاستقبال، مع طريقة الدفع والمبلغ المقبوض."
            action={<Link href={R.W_Cashier}><DeepBtn icon="plus">فتح الكاشير</DeepBtn></Link>} />
        ) : list.length === 0 ? <EmptyState compact icon="search" title="لا فواتير تطابق هذا الاختيار" /> : (
          <div style={{ ...PANEL, padding: "8px 20px 14px" }}>
            <div className={css.thead}>
              {[["رقم الفاتورة", 1.3], ["الوقت", 0.7], ["المراجعة", 1.7], ["البنود", 1.7], ["الأخصائية", 1.1], ["الدفع", 0.9], ["المبلغ", 1.1], ["الحالة", 1], ["", 1.1]].map(([h, w], i) => (
                <div key={i} style={{ flex: w as number }}>{h}</div>
              ))}
            </div>
            {list.map((i) => {
              const name = customerName(i);
              return (
                <div key={i.id} className={css.tr} style={{ opacity: i.void ? 0.55 : 1 }}>
                  <div style={{ flex: 1.3, minWidth: 0 }}><span dir="ltr" style={{ ...LATIN, fontSize: 13, fontWeight: 500 }}>{i.no}</span></div>
                  <div style={{ flex: 0.7, minWidth: 0 }}><span style={{ ...LATIN, fontSize: 13, color: C.sub }}>{clock(i.created_at)}</span></div>
                  <div className={css.wide} style={{ flex: 1.7, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>{initials(name)}</span>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                  </div>
                  <div style={{ flex: 1.7, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className={css.cellLabel}>البنود</span>{invoiceTitle(i)}</div>
                  <div style={{ flex: 1.1, minWidth: 0, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className={css.cellLabel}>الأخصائية</span>{i.appointments?.staff?.name ?? "—"}</div>
                  <div style={{ flex: 0.9, minWidth: 0 }}><Tag kind={METHOD_TAG[i.method]}>{new Set((i.invoice_payments ?? []).map((p) => p.method)).size > 1 ? "مقسّم" : PAY_LABEL[i.method]}</Tag></div>
                  <div style={{ flex: 1.1, minWidth: 0 }}><Amount n={i.total} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><Status i={i} /></div>
                  <div className={css.tight} style={{ flex: 1.1, minWidth: 0, display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <InvoiceActions compact inv={i} onPrint={receipt.print} extras={{ staff: i.created_by ? names.data?.[i.created_by] : null }} />
                    <button type="button" aria-label="عرض الفاتورة" onClick={() => setOpen(i)} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="eye" color={C.accent} size={16} /></button>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, minHeight: 54, margin: "4px -12px 0", padding: "6px 12px", borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#F2E4F5)" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>الإجمالي <span style={{ fontSize: 13, color: C.sub, fontWeight: 400 }}>· {list.length} فاتورة{f === "void" ? " ملغاة (لا تدخل في المجموع)" : ""}</span></div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
                <span>الصافي <Amount n={list.filter((i) => !i.void).reduce((s, i) => s + i.total, 0)} size={16} color={C.accent} /></span>
                <span>المقبوض <Amount n={list.reduce((s, i) => s + collected(i), 0)} /></span>
              </div>
            </div>
          </div>
        )}
      </div>
      {receipt.node}
      <InvoiceDialog inv={open} names={names.data ?? {}} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}

function Status({ i }: { i: InvoiceRow }) {
  const [bg, fg, t] = i.void ? ["#F1ECF2", C.sub2, "ملغاة"] : i.paid ? ["#E6F4EC", C.okDeep, "مدفوعة"] : ["#FCF1DE", "#8A5A12", "متبقٍ " + money(outstanding(i), false)];
  return <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: bg, color: fg }}>{t}</span>;
}

