"use client";

/** W_FinanceReports.dc.html — التقارير المالية (live, computed from invoices & expenses of the chosen month). */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { dayOf, financeData, monthRange, PAY_LABEL, receivedByMethod, shiftDay, sumBy } from "@/lib/db/finance";
import css from "../finance.module.css";
import { arDate, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { PrintStyles, Bars, Big, DeepBtn, LATIN, LightBtn, MonthPicker, PANEL, PanelTitle, ShareList, StatCard, downloadCsv, monthLabel } from "../parts";

const KIND_AR: Record<string, string> = { service: "خدمات", product: "منتجات", package: "باقات", custom: "أخرى" };

export default function Page() {
  const thisMonth = dayKey().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const r = monthRange(month);
  const { data, loading, error } = useQuery(["finance", "month", month], () => financeData(r));
  const invs = data?.invoices ?? [];
  const exps = data?.expenses ?? [];

  const revenue = invs.reduce((s, i) => s + i.total, 0);
  const pays = data?.payments ?? [];
  const received = pays.reduce((s, p) => s + p.amount, 0);   // money received in the month (any invoice date)
  const expenses = exps.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expenses;
  const sessions = invs.filter((i) => i.appointment_id).length;

  // net value per line: share of the invoice discount spread over its lines
  const lines = invs.flatMap((i) => (i.invoice_items ?? []).map((x) => ({ ...x, net: i.subtotal ? (x.qty * x.unit_price * i.total) / i.subtotal : 0, spec: i.appointments?.staff?.name })));
  const byService = sumBy(lines.filter((l) => l.kind === "service" || l.kind === "custom"), (l) => l.label, (l) => l.net).map(([k, v]) => [k, Math.round(v)] as [string, number]);
  const byKind = sumBy(lines, (l) => KIND_AR[l.kind] ?? "أخرى", (l) => l.net).map(([k, v]) => [k, Math.round(v)] as [string, number]);
  const bySpec = sumBy(invs.filter((i) => i.appointments?.staff?.name), (i) => i.appointments?.staff?.name as string, (i) => i.total);
  const methods = receivedByMethod(pays);
  const byMeth = (Object.entries(methods) as [keyof typeof PAY_LABEL, number][]).filter(([, v]) => v > 0).map(([k, v]) => [PAY_LABEL[k], v] as [string, number]);
  const pkgSessions = invs.filter((i) => i.patient_package_id).length;
  const byCat = sumBy(exps, (e) => e.category, (e) => e.amount);

  const days: string[] = [];
  const lastDay = month === thisMonth ? dayKey() : shiftDay(r.toDay, -1);
  for (let d = r.fromDay; d <= lastDay; d = shiftDay(d, 1)) days.push(d);
  const perDay = new Map<string, number>();
  invs.forEach((i) => perDay.set(dayOf(i.created_at), (perDay.get(dayOf(i.created_at)) ?? 0) + i.total));
  const activeDays = [...perDay.values()].filter((v) => v > 0).length;
  const bars = days.map((d) => ({ label: String(Number(d.slice(8))), value: perDay.get(d) ?? 0, title: arDate(new Date(`${d}T12:00:00`)) }));

  const exportCsv = () => downloadCsv(`finance-${month}.csv`, ["البند", "القيمة"], [
    ["الإيرادات (صافي الفواتير)", revenue], ["المقبوض فعلياً", received], ["ذمم من فواتير الشهر", invs.reduce((s, i) => s + Math.max(0, i.total - i.amount_paid), 0)], ["المصاريف", expenses], ["صافي الربح", profit],
    ...byService.map(([k, v]) => [`خدمة: ${k}`, v]), ...byMeth.map(([k, v]) => [`طريقة: ${k}`, v]), ...byCat.map(([k, v]) => [`مصروف: ${k}`, v]),
    ...days.map((d) => [`يوم ${d}`, perDay.get(d) ?? 0]),
  ]);

  return (
    <AdminShell active="المالية" title="التقارير المالية" subtitle={`${monthLabel(month)} · محسوبة من الفواتير والمصاريف المسجّلة`} actions={<>
      <MonthPicker month={month} onChange={setMonth} max={thisMonth} />
      <LightBtn icon="print" onClick={() => window.print()} style={{ height: 46, borderRadius: 23 }}>PDF</LightBtn>
      <DeepBtn icon="download" onClick={exportCsv} disabled={!invs.length && !exps.length}>Excel</DeepBtn>
    </>}>
      <PrintStyles />
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل التقرير: {error}</ErrorNote> : (<>
        <div className={css.stats}>
          <StatCard dark label={`إيرادات ${monthLabel(month)}`} value={<Big n={revenue} />} sub={`${invs.length} فاتورة · ${sessions} جلسة · ${activeDays} يوم عمل`} icon="wallet" />
          <StatCard label="المصاريف" value={<Big n={expenses} />} sub={byCat.length ? byCat.slice(0, 3).map(([k]) => k).join("، ") : "لا مصاريف مسجّلة"} icon="receipt" />
          <StatCard label="صافي الربح" value={<span style={{ color: profit < 0 ? C.danger : C.ink }}><Big n={profit} /></span>} sub={revenue > 0 ? `هامش ${Math.round((profit / revenue) * 100)}%` : "—"} icon="trend" />
          <StatCard label="متوسط اليوم" value={<Big n={activeDays ? Math.round(revenue / activeDays) : 0} />} sub={`المقبوض فعلياً ${money(received)}`} icon="chart" />
        </div>

        <div style={PANEL}>
          <PanelTitle right="صافي الفواتير بعد الخصم">الإيراد اليومي — {monthLabel(month)}</PanelTitle>
          <Bars data={bars} height={180} highlight={month === thisMonth ? bars.length - 1 : undefined} />
        </div>

        <div className={css.three}>
          <div style={PANEL}>
            <PanelTitle right={byKind.map(([k, v]) => `${k} ${money(v, false)}`).join(" · ")}>حسب الخدمة</PanelTitle>
            <ShareList data={byService.slice(0, 8)} empty="لا خدمات مفوترة في هذا الشهر" />
          </div>
          <div style={PANEL}>
            <PanelTitle right={pkgSessions ? `${pkgSessions} جلسة من باقات` : "المقبوض في الشهر"}>حسب طريقة الدفع</PanelTitle>
            <ShareList data={byMeth} empty="لا مقبوضات بعد" />
          </div>
          <div style={PANEL}>
            <PanelTitle>حسب الأخصائية</PanelTitle>
            <ShareList data={bySpec} empty="لا جلسات مرتبطة بأخصائية" />
          </div>
        </div>

        <div style={PANEL}>
          <PanelTitle>لقطة الربح</PanelTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <SnapRow label="الإيرادات" n={revenue} strong />
            {byCat.map(([k, v]) => <SnapRow key={k} label={k} n={-v} />)}
            {!byCat.length && <SnapRow label="المصاريف" n={0} />}
            <SnapRow label="صافي الربح" n={profit} strong accent />
          </div>
        </div>
      </>)}
    </AdminShell>
  );
}

function SnapRow({ label, n, strong, accent }: { label: string; n: number; strong?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40, borderTop: `1px solid ${C.line}`, fontSize: 13.5, fontWeight: strong ? 700 : 400 }}>
      <span style={{ color: strong ? C.ink : C.sub }}>{label}</span>
      <span style={{ ...LATIN, color: accent ? (n < 0 ? C.danger : C.accent) : n < 0 ? C.sub : C.ink, fontSize: strong ? 15 : 13.5 }}>{n < 0 ? "−" : ""}{money(Math.abs(n))}</span>
    </div>
  );
}
