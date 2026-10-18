"use client";

/** W_Receivables.dc.html — الذمم والأقساط (live, Supabase): every invoice not fully paid, with ageing and instalments. */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { collected, customerName, invoiceTitle, listReceivables, outstanding, type InvoiceRow } from "@/lib/db/finance";
import { initials } from "@/lib/data";
import { arDate, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { Amount, Big, LATIN, LightBtn, PANEL, PanelTitle, Pill, SERIES, StatCard, downloadCsv } from "../parts";
import { PayDialog } from "./PayDialog";
import css from "../finance.module.css";

const daysBetween = (a: string, b: string) => Math.round((new Date(`${a}T12:00:00Z`).getTime() - new Date(`${b}T12:00:00Z`).getTime()) / 864e5);
type Bucket = "notdue" | "d30" | "d60" | "old";
const BUCKETS: [Bucket, string][] = [["notdue", "غير مستحق"], ["d30", "حتى 30 يوماً"], ["d60", "31 إلى 60 يوماً"], ["old", "أكثر من 60 يوماً"]];

/** Days overdue (negative = not due yet). Due date = due_on, or the invoice day when none was set. */
function overdue(i: InvoiceRow) {
  const due = i.due_on ?? dayKey(new Date(i.created_at));
  return daysBetween(dayKey(), due);
}
function bucket(i: InvoiceRow): Bucket {
  const d = overdue(i);
  return d <= 0 ? "notdue" : d <= 30 ? "d30" : d <= 60 ? "d60" : "old";
}

export default function Page() {
  const { data, loading, error } = useQuery(["invoices", "receivables"], listReceivables);
  const [f, setF] = useState<Bucket | "all">("all");
  const [paying, setPaying] = useState<InvoiceRow | null>(null);
  const all = data ?? [];
  const totalOpen = all.reduce((s, i) => s + outstanding(i), 0);
  const late = all.filter((i) => overdue(i) > 0);
  const sums = Object.fromEntries(BUCKETS.map(([k]) => [k, all.filter((i) => bucket(i) === k).reduce((s, i) => s + outstanding(i), 0)])) as Record<Bucket, number>;
  const list = f === "all" ? all : all.filter((i) => bucket(i) === f);
  const patients = new Set(all.map((i) => i.patient_id ?? i.id)).size;

  return (
    <AdminShell active="المالية" title="الذمم والأقساط" subtitle={all.length ? `${patients} مراجعة عليها مبالغ · ${late.length} متأخرة` : "الفواتير غير المسدّدة بالكامل"} actions={
      <LightBtn icon="download" disabled={!all.length} style={{ height: 46, borderRadius: 23 }} onClick={() => downloadCsv(`receivables-${dayKey()}.csv`, ["الفاتورة", "المراجعة", "البنود", "الإجمالي", "المدفوع", "المتبقي", "الاستحقاق", "التأخير (يوم)"],
        all.map((i) => [i.no, customerName(i), invoiceTitle(i), i.total, collected(i), outstanding(i), i.due_on ?? "", Math.max(0, overdue(i))]))}>تصدير</LightBtn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={css.stats}>
          <StatCard dark label="إجمالي الذمم المفتوحة" value={<Big n={totalOpen} />} sub={`${all.length} فاتورة`} icon="wallet" />
          <StatCard label="متأخرة" value={<Big n={late.reduce((s, i) => s + outstanding(i), 0)} />} sub={`${late.length} فاتورة تجاوزت تاريخ الاستحقاق`} icon="alert" />
          <StatCard label="غير مستحقة بعد" value={<Big n={sums.notdue} />} sub="أقساط بتاريخ قادم" icon="clock" />
        </div>

        <div style={PANEL}>
          <PanelTitle right="حسب تاريخ القسط المستحق">أعمار الذمم</PanelTitle>
          {totalOpen <= 0 ? <div style={{ height: 14, borderRadius: 7, background: "#EFE5F2" }} /> : (
            <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden" }}>
              {BUCKETS.map(([k, t], i) => sums[k] > 0 && <div key={k} title={`${t}: ${money(sums[k])}`} style={{ width: `${(sums[k] / totalOpen) * 100}%`, background: SERIES[i] }} />)}
            </div>
          )}
          <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
            {BUCKETS.map(([k, t], i) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: SERIES[i] }} />{t}<b style={{ ...LATIN, marginInlineStart: 4 }}>{money(sums[k], false)}</b>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill on={f === "all"} onClick={() => setF("all")}>الكل ({all.length})</Pill>
          {BUCKETS.map(([k, t]) => <Pill key={k} on={f === k} onClick={() => setF(k)}>{t} ({all.filter((i) => bucket(i) === k).length})</Pill>)}
        </div>

        {loading ? <Loading /> : error ? <ErrorNote>تعذّر التحميل: {error}</ErrorNote> : all.length === 0 ? (
          <EmptyState icon="wallet" title="لا ذمم مفتوحة" text="عندما تُصدر فاتورة بدفع آجل أو بقسط من الكاشير، تظهر هنا مع المبلغ المتبقي وتاريخ استحقاقه، ويمكن تسجيل الدفعات منها." />
        ) : list.length === 0 ? <EmptyState compact icon="search" title="لا فواتير في هذه الفئة" /> : (
          <div style={{ ...PANEL, padding: "8px 20px" }}>
            <div className={css.thead}>
              {[["المراجعة", 1.8], ["البنود", 1.8], ["المدفوع", 1.3], ["المتبقي", 1.1], ["القسط القادم", 1.2], ["العمر", 1], ["إجراء", 1]].map(([h, w]) => <div key={h} style={{ flex: w as number }}>{h}</div>)}
            </div>
            {list.map((i) => {
              const d = overdue(i), name = customerName(i);
              return (
                <div key={i.id} className={css.tr} style={{ minHeight: 58 }}>
                  <div className={css.wide} style={{ flex: 1.8, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>{initials(name)}</span>
                    <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{name}</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>{i.patients?.phone ? <span dir="ltr" style={LATIN}>{i.patients.phone}</span> : <span dir="ltr" style={LATIN}>{i.no}</span>}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1.8, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className={css.cellLabel}>البنود</span>{invoiceTitle(i)}</div>
                  <div style={{ flex: 1.3, minWidth: 0, ...LATIN, fontSize: 13 }}><span className={css.cellLabel}>المدفوع</span>{money(collected(i), false)} من {money(i.total, false)}</div>
                  <div style={{ flex: 1.1, minWidth: 0 }}><span className={css.cellLabel}>المتبقي</span><Amount n={outstanding(i)} color={C.accent} /></div>
                  <div style={{ flex: 1.2, minWidth: 0, fontSize: 13 }}><span className={css.cellLabel}>الاستحقاق</span>{i.due_on ? arDate(new Date(`${i.due_on}T12:00:00`), { day: false }) : <span style={{ color: C.muted }}>غير محدد</span>}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "inline-flex", height: 24, alignItems: "center", padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, ...(d > 30 ? { background: "#FBEAF1", color: C.danger } : d > 0 ? { background: "#FCF1DE", color: "#8A5A12" } : { background: "#E6F4EC", color: C.okDeep }) }}>
                      {d > 0 ? `متأخر ${d} يوماً` : d === 0 ? "يستحق اليوم" : `بعد ${-d} يوماً`}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}><LightBtn icon="cash" onClick={() => setPaying(i)} style={{ height: 34 }}>دفعة</LightBtn></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PayDialog inv={paying} onClose={() => setPaying(null)} />
    </AdminShell>
  );
}
