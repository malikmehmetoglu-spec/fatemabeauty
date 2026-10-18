"use client";

/** W_Expenses.dc.html — المصاريف (live, Supabase): monthly list by category, add / edit / delete. */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { financeData, monthRange, sumBy, type Expense } from "@/lib/db/finance";
import { ExpenseDialog } from "./ExpenseDialog";
import css from "../finance.module.css";
import { arDate, dayKey, money } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";
import { Amount, Big, DeepBtn, Donut, LATIN, MonthPicker, PANEL, PanelTitle, Pill, ShareList, StatCard, downloadCsv, monthLabel } from "../parts";

export default function Page() {
  const thisMonth = dayKey().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Expense | "new" | null>(null);
  const r = monthRange(month);
  const { data, loading, error } = useQuery(["finance", "month", month], () => financeData(r));
  const exps = data?.expenses ?? [];
  const revenue = (data?.payments ?? []).reduce((s, p) => s + p.amount, 0);   // money received in the month
  const total = exps.reduce((s, e) => s + e.amount, 0);
  const byCat = sumBy(exps, (e) => e.category, (e) => e.amount);
  const list = cat === "all" ? exps : exps.filter((e) => e.category === cat);
  const fromTill = exps.filter((e) => e.from_cash_box).reduce((s, e) => s + e.amount, 0);

  return (
    <AdminShell active="المالية" title="المصاريف" subtitle={month === thisMonth ? `${monthLabel(month)} حتى اليوم` : monthLabel(month)} actions={<>
      <MonthPicker month={month} onChange={setMonth} max={thisMonth} />
      <DeepBtn icon="plus" onClick={() => setEditing("new")}>مصروف جديد</DeepBtn>
    </>}>
      <div className={css.stats}>
        <StatCard dark label={`إجمالي مصاريف ${monthLabel(month)}`} value={<Big n={total} />} sub={revenue > 0 ? `${Math.round((total / revenue) * 100)}% من مقبوضات الشهر (${money(revenue)})` : "لا مقبوضات مسجّلة هذا الشهر"} icon="receipt" />
        <StatCard label="عدد المصاريف" value={exps.length} sub={byCat.length ? `أكبر فئة: ${byCat[0][0]}` : "—"} icon="list" />
        <StatCard label="من الصندوق" value={<Big n={fromTill} />} sub="نثريات دُفعت من الدرج" icon="cash" />
      </div>
      <div className={css.split}>
        <div style={{ ...PANEL, flex: 1 }}>
          <PanelTitle right={<button type="button" disabled={!list.length} onClick={() => downloadCsv(`expenses-${month}.csv`, ["التاريخ", "الفئة", "البند", "المبلغ", "من الصندوق", "ملاحظة"], list.map((e) => [e.spent_on, e.category, e.label, e.amount, e.from_cash_box ? "نعم" : "", e.note ?? ""]))} style={{ border: "none", background: "none", color: C.accentMid, fontWeight: 700, fontSize: 12.5 }}>تصدير</button>}>آخر المصاريف</PanelTitle>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Pill on={cat === "all"} onClick={() => setCat("all")} style={{ height: 34 }}>الكل</Pill>
            {byCat.map(([k]) => <Pill key={k} on={cat === k} onClick={() => setCat(k)} style={{ height: 34 }}>{k}</Pill>)}
          </div>
          {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : exps.length === 0 ? (
            <EmptyState compact icon="receipt" title="لا مصاريف في هذا الشهر" style={{ boxShadow: "none" }} text="سجّلي الإيجار، الرواتب، المواد، الفواتير والنثريات لتظهر في التقارير المالية وصافي الربح."
              action={<DeepBtn icon="plus" onClick={() => setEditing("new")}>مصروف جديد</DeepBtn>} />
          ) : (<>
            <div className={css.thead}>
              {[["البند", 2.6], ["الفئة", 1], ["التاريخ", 1.4], ["المبلغ", 1.1], ["", 0.7]].map(([h, w], i) => <div key={i} style={{ flex: w as number }}>{h}</div>)}
            </div>
            {list.map((e) => (
              <div key={e.id} className={css.tr}>
                <div className={css.wide} style={{ flex: 2.6, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 700 }}>{e.label}</div>
                  {(e.note || e.from_cash_box) && <div style={{ fontSize: 12, color: C.sub2 }}>{[e.from_cash_box ? "من الصندوق" : "", e.note ?? ""].filter(Boolean).join(" · ")}</div>}
                </div>
                <div style={{ flex: 1 }}><span style={{ height: 24, padding: "0 10px", borderRadius: 12, background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>{e.category}</span></div>
                <div style={{ flex: 1.4, color: C.sub }}>{arDate(new Date(`${e.spent_on}T12:00:00`))}</div>
                <div style={{ flex: 1.1 }}><Amount n={e.amount} /></div>
                <div className={css.tight} style={{ flex: 0.7 }}>
                  <button type="button" aria-label="تعديل" onClick={() => setEditing(e)} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" color={C.accent} size={15} /></button>
                </div>
              </div>
            ))}
          </>)}
        </div>
        <div className={css.side} style={PANEL}>
          <PanelTitle>مصاريف {monthLabel(month)} حسب الفئة</PanelTitle>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Donut data={byCat} center={<><span style={{ fontSize: 11.5, color: C.sub2 }}>الإجمالي</span><b style={{ ...LATIN, fontSize: 16 }}>{money(total, false)}</b></>} />
          </div>
          <ShareList data={byCat} empty="لا مصاريف بعد" />
        </div>
      </div>
      <ExpenseDialog key={editing === "new" ? "new" : editing?.id ?? "none"} exp={editing} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}

