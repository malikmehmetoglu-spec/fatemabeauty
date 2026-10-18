"use client";

/** W_Payroll.dc.html — الرواتب (live, Supabase `payroll_entries`). One row per member per month; amounts are entered by the admin/accountant. */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, NumberInput, SubmitButton, Tag, TextInput, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listPayroll, markPaid, monthKey, netPay, savePayroll, type Payroll, type Staff } from "@/lib/db/staff";
import { useSession } from "@/lib/supabase/session";
import { AR_MONTHS } from "@/lib/data";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { RowBtn, StaffCell, TeamTabs, errText, useTeam } from "../team-ui";

const monthLabel = (p: string) => `${AR_MONTHS[Number(p.slice(5)) - 1]} ${p.slice(0, 4)}`;
const shiftMonth = (p: string, n: number) => { const d = new Date(Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5)) - 1 + n, 15)); return d.toISOString().slice(0, 7); };

export default function PayrollPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin" || me?.role === "accountant";
  const team = useTeam();
  const [period, setPeriod] = useState(monthKey());
  const { data, loading, error } = useQuery(["payroll", period], () => listPayroll(period));
  const [editing, setEditing] = useState<{ s: Staff; p?: Payroll } | null>(null);
  const [msg, setMsg] = useState("");

  const entries = data ?? [];
  const by = new Map(entries.map((p) => [p.staff_id, p]));
  const total = entries.reduce((n, p) => n + netPay(p), 0);
  const paid = entries.filter((p) => p.paid_at);
  const members = canManage ? team.active.concat(team.list.filter((s) => !s.active && by.has(s.id))) : team.list.filter((s) => by.has(s.id));

  async function togglePaid(p: Payroll) {
    setMsg("");
    try { await markPaid(p.id, !p.paid_at); } catch (e) { setMsg(errText(e)); }
  }

  return (
    <AdminShell active="فريق العمل" title="الرواتب" subtitle={`مسير رواتب ${monthLabel(period)}`}
      actions={<>
        <GhostButton icon="fwd" onClick={() => setPeriod(shiftMonth(period, -1))}>الشهر السابق</GhostButton>
        <GhostButton icon="back" onClick={() => setPeriod(shiftMonth(period, 1))}>التالي</GhostButton>
      </>}>
      <TeamTabs />
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="صافي الرواتب المسجّلة" value={money(total)} sub={`${entries.length} موظفة في مسير ${monthLabel(period)}`} icon="wallet" />
        <Kpi label="مدفوعة" value={paid.length} sub={money(paid.reduce((n, p) => n + netPay(p), 0))} icon="check" />
        <Kpi label="غير مدفوعة" value={entries.length - paid.length} icon="clock" />
      </div>
      {msg && <ErrorNote>{msg}</ErrorNote>}
      {team.loading || loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الرواتب: {error}</ErrorNote> : members.length === 0 ? (
        <EmptyState icon="wallet" title="لا رواتب مسجّلة لهذا الشهر" text="أضيفي الموظفات من صفحة الفريق، ثم سجّلي لكل منهن الراتب الأساسي والعمولة والمكافآت والخصومات." />
      ) : (
        <DataTable minWidth={700} headers={["الموظفة", "الأساسي", "العمولة", "مكافآت", "خصومات", "الصافي", "مدفوع", ""]} widths={[2, 1, 1, 0.9, 0.9, 1.1, 0.8, 1]}
          rows={members.map((s) => {
            const p = by.get(s.id);
            const dash = <span style={{ color: C.muted }}>—</span>;
            return [
              <StaffCell key="s" s={s} sub={s.title} />,
              p ? money(p.base_salary, false) : dash,
              p ? money(p.commission, false) : dash,
              p ? money(p.bonus, false) : dash,
              p ? money(p.deductions, false) : dash,
              p ? <b key="n">{money(netPay(p))}</b> : <span key="n" style={{ fontSize: 12.5, color: C.muted }}>لم يُسجّل</span>,
              p ? (canManage ? <Toggle key="t" on={!!p.paid_at} label={`دُفع راتب ${s.name}`} onChange={() => togglePaid(p)} /> : <Tag key="t" kind={p.paid_at ? "green" : "amber"}>{p.paid_at ? "مدفوع" : "لا"}</Tag>) : <span key="t" />,
              canManage ? <RowBtn key="e" icon={p ? "edit" : "plus"} label={p ? "تعديل" : "تسجيل"} onClick={() => setEditing({ s, p })} /> : <span key="e" />,
            ];
          })} />
      )}
      <PayrollDialog target={editing} period={period} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}

function PayrollDialog({ target, period, onClose }: { target: { s: Staff; p?: Payroll } | null; period: string; onClose: () => void }) {
  const [f, setF] = useState({ base: "", commission: "", bonus: "", deductions: "", note: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    const p = target?.p;
    setF({ base: p ? String(p.base_salary) : "", commission: p ? String(p.commission) : "", bonus: p ? String(p.bonus) : "", deductions: p ? String(p.deductions) : "", note: p?.note ?? "" });
    setError("");
  }, [target]);
  const n = (s: string) => Math.round(Number(s || 0));
  async function submit() {
    if (!target) return;
    if (f.base.trim() === "") { setError("اكتبي الراتب الأساسي."); return; }
    setBusy(true);
    try {
      await savePayroll({ id: target.p?.id, staff_id: target.s.id, period, base_salary: n(f.base), commission: n(f.commission), bonus: n(f.bonus), deductions: n(f.deductions), note: f.note.trim() });
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  const net = n(f.base) + n(f.commission) + n(f.bonus) - n(f.deductions);
  return (
    <Modal open={!!target} onClose={onClose} title={`راتب ${monthLabel(period)} — ${target?.s.name ?? ""}`} width={540}
      footer={<SubmitButton onClick={submit} busy={busy}>حفظ</SubmitButton>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NumberInput label="الراتب الأساسي" required value={f.base} onChange={(v) => setF({ ...f, base: v })} suffix="ل.س" />
        <NumberInput label="العمولة" value={f.commission} onChange={(v) => setF({ ...f, commission: v })} suffix="ل.س" hint="من صفحة العمولات" />
        <NumberInput label="مكافآت" value={f.bonus} onChange={(v) => setF({ ...f, bonus: v })} suffix="ل.س" />
        <NumberInput label="خصومات" value={f.deductions} onChange={(v) => setF({ ...f, deductions: v })} suffix="ل.س" />
      </div>
      <TextInput label="ملاحظة" value={f.note} onChange={(v) => setF({ ...f, note: v })} />
      <div style={{ fontSize: 15, fontWeight: 700 }}>الصافي: <span style={{ color: net < 0 ? C.danger : C.accent }}>{money(net)}</span></div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
