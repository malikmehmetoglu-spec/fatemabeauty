"use client";

/**
 * W_Commissions.dc.html — العمولات (live).
 * Each specialist has a commission % (`commission_rules`, defaulting to 10% when not set); the base is the paid
 * invoices of the selected month or date range whose appointment was done by her. Includes per-specialist print report.
 */
import { useEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, NumberInput, SubmitButton, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listCommissionBase, listCommissionRules, monthKey, saveCommissionRule, type CommissionRule, type Staff } from "@/lib/db/staff";
import { useSession } from "@/lib/supabase/session";
import { AR_MONTHS } from "@/lib/data";
import { arDate, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { RowBtn, StaffCell, TeamTabs, errText, useTeam } from "@/app/admin/staff/team-ui";

const DEFAULT_PCT = 10;
const monthLabel = (p: string) => `${AR_MONTHS[Number(p.slice(5)) - 1]} ${p.slice(0, 4)}`;
const shiftMonth = (p: string, n: number) => new Date(Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5)) - 1 + n, 15)).toISOString().slice(0, 7);
const monthStart = (p: string) => new Date(`${p}-01T00:00:00+03:00`).toISOString();
const dayStart = (d: string) => new Date(`${d}T00:00:00+03:00`).toISOString();
const nextDayStart = (d: string) => new Date(new Date(`${d}T00:00:00+03:00`).getTime() + 864e5).toISOString();

type BaseInv = NonNullable<Awaited<ReturnType<typeof listCommissionBase>>>[number];
type SpecRow = { s: Staff; r?: CommissionRule; pct: number; count: number; sales: number; due: number; inv: BaseInv[] };

export default function CommissionsPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin" || me?.role === "accountant";
  const team = useTeam();
  const [mode, setMode] = useState<"month" | "range">("month");
  const [period, setPeriod] = useState(monthKey());
  const [fromDay, setFromDay] = useState(() => `${monthKey()}-01`);
  const [toDay, setToDay] = useState(() => dayKey());
  const rules = useQuery(["commissions", "rules"], listCommissionRules);

  const rangeFrom = mode === "month" ? monthStart(period) : dayStart(fromDay);
  const rangeTo = mode === "month" ? monthStart(shiftMonth(period, 1)) : nextDayStart(toDay >= fromDay ? toDay : fromDay);
  const rangeLabel = mode === "month" ? monthLabel(period) : `${fromDay} → ${toDay >= fromDay ? toDay : fromDay}`;

  const base = useQuery(["commissions", "base", rangeFrom, rangeTo], () => listCommissionBase(rangeFrom, rangeTo));
  const [editing, setEditing] = useState<{ s: Staff; r?: CommissionRule } | null>(null);
  const [printing, setPrinting] = useState<SpecRow | null>(null);

  const ruleOf = new Map((rules.data ?? []).map((r) => [r.staff_id, r]));
  const specialists = team.active.filter((s) => s.role === "specialist" || ruleOf.has(s.id));
  const rows: SpecRow[] = specialists.map((s) => {
    const inv = (base.data ?? []).filter((i) => i.appointments?.specialist_id === s.id);
    const sales = inv.reduce((n, i) => n + i.total, 0);
    const r = ruleOf.get(s.id);
    const pct = r ? Number(r.percent) : DEFAULT_PCT;
    return { s, r, pct, count: inv.length, sales, due: Math.round((sales * pct) / 100), inv };
  });
  const totalDue = rows.reduce((n, x) => n + x.due, 0);
  const totalSales = rows.reduce((n, x) => n + x.sales, 0);

  function printReport(row: SpecRow) {
    flushSync(() => setPrinting(row));
    window.print();
    setPrinting(null);
  }

  return (
    <AdminShell active="فريق العمل" title="العمولات" subtitle={`عمولات الأخصائيات على الجلسات المدفوعة · ${rangeLabel}`}
      actions={<>
        <Chip height={38} selected={mode === "month"} onClick={() => setMode("month")}>شهري</Chip>
        <Chip height={38} selected={mode === "range"} onClick={() => setMode("range")}>حسب الأيام</Chip>
        {mode === "month" ? <>
          <GhostButton icon="fwd" onClick={() => setPeriod(shiftMonth(period, -1))}>السابق</GhostButton>
          <GhostButton icon="back" onClick={() => setPeriod(shiftMonth(period, 1))}>التالي</GhostButton>
        </> : <>
          <input type="date" value={fromDay} onChange={(e) => e.target.value && setFromDay(e.target.value)} dir="ltr" aria-label="من تاريخ"
            style={{ height: 38, borderRadius: 12, border: "1px solid #EADCF0", padding: "0 10px", fontSize: 13 }} />
          <input type="date" value={toDay} onChange={(e) => e.target.value && setToDay(e.target.value)} dir="ltr" aria-label="إلى تاريخ"
            style={{ height: 38, borderRadius: 12, border: "1px solid #EADCF0", padding: "0 10px", fontSize: 13 }} />
        </>}
      </>}>
      <TeamTabs />
      <div className="adm-row">
        <Kpi dark label="العمولات المستحقة" value={money(totalDue)} sub={rangeLabel} icon="percent" />
        <Kpi label="قيمة الجلسات المدفوعة" value={money(totalSales)} sub="صافي بنود الخدمات بعد الخصم" icon="receipt" />
        <Kpi label="عدد الأخصائيات" value={rows.length} sub={`الافتراضي ${DEFAULT_PCT}%`} icon="users" />
      </div>
      {team.loading || rules.loading || base.loading ? <Loading /> : rules.error || base.error ? <ErrorNote>تعذّر تحميل العمولات: {rules.error || base.error}</ErrorNote> : rows.length === 0 ? (
        <EmptyState icon="percent" title="لا أخصائيات بعد" text="أضيفي الأخصائيات من صفحة الفريق، وتُحسب العمولة تلقائياً بنسبة 10% (أو النسبة المحددة) من الفواتير المدفوعة لجلساتها." />
      ) : (
        <DataTable headers={["الأخصائية", "النسبة", "عدد الجلسات", "قيمة الجلسات", "حسابها (العمولة)", ""]} widths={[1.8, 0.7, 0.9, 1.1, 1.2, 1.4]}
          rows={rows.map((x) => [
            <StaffCell key="s" s={x.s} sub={x.r?.note || x.s.title} />,
            <b key="p" className="latin">{x.pct}%</b>,
            <span key="c" className="latin">{x.count}</span>,
            money(x.sales),
            <b key="d" style={{ color: C.accent }}>{money(x.due)}</b>,
            <div key="e" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <RowBtn icon="print" label="طباعة التقرير" onClick={() => printReport(x)} />
              {canManage && <RowBtn icon={x.r ? "edit" : "plus"} label="النسبة" onClick={() => setEditing({ s: x.s, r: x.r })} />}
            </div>,
          ])} />
      )}
      <div style={{ fontSize: 12.5, color: C.sub2 }}>العمولة = النسبة (الافتراضي {DEFAULT_PCT}%) × صافي بنود الخدمات (بعد الخصم، بدون المنتجات والباقات) في الفواتير المدفوعة بالكامل وغير الملغاة خلال الفترة المحددة للمواعيد التي نفّذتها الأخصائية.</div>
      <RuleDialog target={editing} onClose={() => setEditing(null)} />
      {printing && typeof document !== "undefined" && createPortal(
        <div data-print-receipt="" dir="rtl" style={{ padding: 24, fontFamily: "inherit", color: "#1A121D", background: "#fff" }}>
          <style>{"@media print { @page { size: A4; margin: 16mm; } }"}</style>
          <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Fatema Beauty — تقرير عمولة أخصائية</h2>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>الفترة: {rangeLabel} · تاريخ الطباعة: {arDate(new Date(), { year: true })}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 12, border: "1px solid #DDD", borderRadius: 10, marginBottom: 18 }}>
            <div><div style={{ fontSize: 11, color: "#666" }}>الأخصائية</div><b>{printing.s.name}</b></div>
            <div><div style={{ fontSize: 11, color: "#666" }}>عدد الجلسات</div><b className="latin">{printing.count}</b></div>
            <div><div style={{ fontSize: 11, color: "#666" }}>قيمة الجلسات</div><b>{money(printing.sales)}</b></div>
            <div><div style={{ fontSize: 11, color: "#666" }}>العمولة ({printing.pct}%)</div><b>{money(printing.due)}</b></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333", textAlign: "right" }}>
                <th style={{ padding: "8px 4px" }}>#</th>
                <th style={{ padding: "8px 4px" }}>التاريخ</th>
                <th style={{ padding: "8px 4px" }}>قيمة الجلسة</th>
                <th style={{ padding: "8px 4px" }}>العمولة ({printing.pct}%)</th>
              </tr>
            </thead>
            <tbody>
              {printing.inv.map((i, idx) => (
                <tr key={i.id} style={{ borderBottom: "1px solid #EEE" }}>
                  <td style={{ padding: "6px 4px" }} className="latin">{idx + 1}</td>
                  <td style={{ padding: "6px 4px" }}>{arDate(new Date(i.created_at), { year: true })}</td>
                  <td style={{ padding: "6px 4px" }}>{money(i.total)}</td>
                  <td style={{ padding: "6px 4px" }}>{money(Math.round((i.total * printing.pct) / 100))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
        document.body,
      )}
    </AdminShell>
  );
}

function RuleDialog({ target, onClose }: { target: { s: Staff; r?: CommissionRule } | null; onClose: () => void }) {
  const [pct, setPct] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setPct(target?.r ? String(Number(target.r.percent)) : String(DEFAULT_PCT)); setNote(target?.r?.note ?? ""); setError(""); }, [target]);
  async function submit() {
    if (!target) return;
    const n = Number(pct);
    if (pct.trim() === "" || !(n >= 0 && n <= 100)) { setError("النسبة بين 0 و 100."); return; }
    setBusy(true);
    try { await saveCommissionRule(target.s.id, n, note.trim()); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!target} onClose={onClose} title={`نسبة العمولة — ${target?.s.name ?? ""}`} width={460} footer={<SubmitButton onClick={submit} busy={busy}>حفظ</SubmitButton>}>
      <NumberInput label="النسبة من قيمة الجلسة" required value={pct} onChange={setPct} suffix="%" />
      <TextInput label="ملاحظة" value={note} onChange={setNote} />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
