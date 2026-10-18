"use client";

/**
 * W_Commissions.dc.html — العمولات (live).
 * Each specialist has a commission % (`commission_rules`); the base is the paid invoices of the month
 * whose appointment was done by her. Nothing is shown until a rate is set and invoices exist.
 */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, NumberInput, SubmitButton, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listCommissionBase, listCommissionRules, monthKey, saveCommissionRule, type CommissionRule, type Staff } from "@/lib/db/staff";
import { useSession } from "@/lib/supabase/session";
import { AR_MONTHS } from "@/lib/data";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { RowBtn, StaffCell, TeamTabs, errText, useTeam } from "@/app/admin/staff/team-ui";

const monthLabel = (p: string) => `${AR_MONTHS[Number(p.slice(5)) - 1]} ${p.slice(0, 4)}`;
const shiftMonth = (p: string, n: number) => new Date(Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5)) - 1 + n, 15)).toISOString().slice(0, 7);
const monthStart = (p: string) => new Date(`${p}-01T00:00:00+03:00`).toISOString();

export default function CommissionsPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin" || me?.role === "accountant";
  const team = useTeam();
  const [period, setPeriod] = useState(monthKey());
  const rules = useQuery(["commissions", "rules"], listCommissionRules);
  const base = useQuery(["commissions", "base", period], () => listCommissionBase(monthStart(period), monthStart(shiftMonth(period, 1))));
  const [editing, setEditing] = useState<{ s: Staff; r?: CommissionRule } | null>(null);

  const ruleOf = new Map((rules.data ?? []).map((r) => [r.staff_id, r]));
  const specialists = team.active.filter((s) => s.role === "specialist" || ruleOf.has(s.id));
  const rows = specialists.map((s) => {
    const inv = (base.data ?? []).filter((i) => i.appointments?.specialist_id === s.id);
    const sales = inv.reduce((n, i) => n + i.total, 0);
    const r = ruleOf.get(s.id);
    return { s, r, count: inv.length, sales, due: r ? Math.round((sales * Number(r.percent)) / 100) : null };
  });
  const totalDue = rows.reduce((n, x) => n + (x.due ?? 0), 0);
  const totalSales = rows.reduce((n, x) => n + x.sales, 0);

  return (
    <AdminShell active="المالية" title="العمولات" subtitle={`عمولات الأخصائيات على الجلسات المدفوعة · ${monthLabel(period)}`}
      actions={<>
        <GhostButton icon="fwd" onClick={() => setPeriod(shiftMonth(period, -1))}>الشهر السابق</GhostButton>
        <GhostButton icon="back" onClick={() => setPeriod(shiftMonth(period, 1))}>التالي</GhostButton>
      </>}>
      <TeamTabs />
      <div className="adm-row">
        <Kpi dark label="العمولات المستحقة" value={money(totalDue)} sub={monthLabel(period)} icon="percent" />
        <Kpi label="قيمة الجلسات المدفوعة" value={money(totalSales)} sub="صافي بنود الخدمات بعد الخصم" icon="receipt" />
        <Kpi label="أخصائيات لهن نسبة" value={rows.filter((x) => x.r).length} sub={`من ${rows.length}`} icon="users" />
      </div>
      {team.loading || rules.loading || base.loading ? <Loading /> : rules.error || base.error ? <ErrorNote>تعذّر تحميل العمولات: {rules.error || base.error}</ErrorNote> : rows.length === 0 ? (
        <EmptyState icon="percent" title="لا أخصائيات بعد" text="أضيفي الأخصائيات من صفحة الفريق، ثم حدّدي لكل منهن نسبة العمولة. تُحسب العمولة تلقائياً من الفواتير المدفوعة لجلساتها." />
      ) : (
        <DataTable headers={["الأخصائية", "النسبة", "جلسات مدفوعة", "قيمة الجلسات", "العمولة", ""]} widths={[2, 0.8, 1, 1.2, 1.2, 1]}
          rows={rows.map((x) => [
            <StaffCell key="s" s={x.s} sub={x.r?.note || x.s.title} />,
            x.r ? <b key="p" className="latin">{Number(x.r.percent)}%</b> : <span key="p" style={{ fontSize: 12.5, color: C.muted }}>غير محددة</span>,
            <span key="c" className="latin">{x.count}</span>,
            money(x.sales),
            x.due != null ? <b key="d" style={{ color: C.accent }}>{money(x.due)}</b> : <span key="d" style={{ color: C.muted }}>—</span>,
            canManage ? <RowBtn key="e" icon={x.r ? "edit" : "plus"} label={x.r ? "تعديل النسبة" : "تحديد النسبة"} onClick={() => setEditing({ s: x.s, r: x.r })} /> : <span key="e" />,
          ])} />
      )}
      <div style={{ fontSize: 12.5, color: C.sub2 }}>العمولة = النسبة × صافي بنود الخدمات (بعد الخصم، بدون المنتجات والباقات) في الفواتير المدفوعة بالكامل وغير الملغاة هذا الشهر للمواعيد التي نفّذتها الأخصائية. جلسات الباقات قيمتها 0 هنا لأن ثمن الباقة يُحتسب عند بيعها. سجّليها في الراتب من صفحة الرواتب.</div>
      <RuleDialog target={editing} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}

function RuleDialog({ target, onClose }: { target: { s: Staff; r?: CommissionRule } | null; onClose: () => void }) {
  const [pct, setPct] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setPct(target?.r ? String(Number(target.r.percent)) : ""); setNote(target?.r?.note ?? ""); setError(""); }, [target]);
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
