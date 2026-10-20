"use client";

/**
 * W_Payroll.dc.html — الرواتب (live, Supabase `payroll_entries`). One row per member per month.
 * A base salary may be in ل.س or $: a dollar base is converted with the current exchange rate while the entry is unpaid
 * and stays frozen (fx_rate, base_salary in ل.س) once it is paid. Commissions are always ل.س. Paid entries appear in
 * finance as the expense «رواتب» at their frozen ل.س value.
 */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, NumberInput, Segment, SubmitButton, Tag, TextInput, Toggle } from "@/components/ui";
import { invalidate, useQuery } from "@/lib/db/query";
import { listCommissionBase, listCommissionRules, listPayroll, markPaid, monthKey, netPay, savePayroll, type Payroll, type Staff } from "@/lib/db/staff";
import { listSalaries, usd, type Currency, type StaffSalary } from "@/lib/db/fx";
import { useSession } from "@/lib/supabase/session";
import { AR_MONTHS } from "@/lib/data";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { FxCard, useUsdRate } from "@/app/admin/finance/FxCard";
import { RowBtn, StaffCell, TeamTabs, errText, useTeam } from "../team-ui";

const monthLabel = (p: string) => `${AR_MONTHS[Number(p.slice(5)) - 1]} ${p.slice(0, 4)}`;
const shiftMonth = (p: string, n: number) => { const d = new Date(Date.UTC(Number(p.slice(0, 4)), Number(p.slice(5)) - 1 + n, 15)); return d.toISOString().slice(0, 7); };
const monthStart = (p: string) => new Date(`${p}-01T00:00:00+03:00`).toISOString();
const num = (n: number) => n.toLocaleString("en-US");
const LAT = { fontFamily: "var(--font-rubik), sans-serif", unicodeBidi: "isolate" as const };

/** Commission due per member for a month (same rule as the commissions page). */
function useCommissions(period: string) {
  const rules = useQuery(["commissions", "rules"], listCommissionRules);
  const base = useQuery(["commissions", "base", period], () => listCommissionBase(monthStart(period), monthStart(shiftMonth(period, 1))));
  const due = new Map<string, number>();
  for (const r of rules.data ?? []) {
    const sales = (base.data ?? []).filter((i) => i.appointments?.specialist_id === r.staff_id).reduce((n, i) => n + i.total, 0);
    due.set(r.staff_id, Math.round((sales * Number(r.percent)) / 100));
  }
  return { due, ready: !rules.loading && !base.loading };
}

export default function PayrollPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin" || me?.role === "accountant";
  const team = useTeam();
  const [period, setPeriod] = useState(monthKey());
  const { data, loading, error } = useQuery(["payroll", period], () => listPayroll(period));
  const sal = useQuery(["salaries"], listSalaries);
  const { rate } = useUsdRate();
  const com = useCommissions(period);
  const [editing, setEditing] = useState<{ s: Staff; p?: Payroll } | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const entries = data ?? [];
  const by = new Map(entries.map((p) => [p.staff_id, p]));
  const salOf = new Map((sal.data ?? []).map((x) => [x.staff_id, x]));
  const total = entries.reduce((n, p) => n + netPay(p), 0);
  const paid = entries.filter((p) => p.paid_at);
  const members = canManage ? team.active.concat(team.list.filter((s) => !s.active && by.has(s.id))) : team.list.filter((s) => by.has(s.id));
  const missing = team.active.filter((s) => !by.has(s.id) && (salOf.get(s.id)?.base_salary ?? 0) > 0);

  async function togglePaid(p: Payroll) {
    setMsg("");
    try { await markPaid(p.id, !p.paid_at); } catch (e) { setMsg(errText(e)); }
  }

  /** Creates the missing entries of the month from each member's salary + her commission. */
  async function generate() {
    setMsg(""); setBusy(true);
    try {
      for (const s of missing) {
        const x = salOf.get(s.id) as StaffSalary;
        await savePayroll({ staff_id: s.id, period, currency: x.salary_currency as Currency, amount_original: x.base_salary, base_salary: x.salary_currency === "SYP" ? x.base_salary : 0,
          commission: com.due.get(s.id) ?? 0, bonus: 0, deductions: 0, note: "" });
      }
    } catch (e) { setMsg(errText(e)); invalidate("payroll"); } finally { setBusy(false); }
  }

  return (
    <AdminShell active="فريق العمل" title="الرواتب" subtitle={`مسير رواتب ${monthLabel(period)}`}
      actions={<>
        <GhostButton icon="fwd" onClick={() => setPeriod(shiftMonth(period, -1))}>الشهر السابق</GhostButton>
        <GhostButton icon="back" onClick={() => setPeriod(shiftMonth(period, 1))}>التالي</GhostButton>
      </>}>
      <TeamTabs />
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="صافي الرواتب المسجّلة" value={money(total)}
          sub={`${entries.length} موظفة في مسير ${monthLabel(period)}${rate && total > 0 ? ` · ≈ ${usd(Math.round(total / rate.usd_to_syp))} بسعر اليوم` : ""}`} icon="wallet" />
        <Kpi label="مدفوعة" value={paid.length} sub={money(paid.reduce((n, p) => n + netPay(p), 0))} icon="check" />
        <Kpi label="غير مدفوعة" value={entries.length - paid.length} icon="clock" />
      </div>
      <FxCard compact />
      {canManage && missing.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 13.5, color: C.sub }}>
          <span style={{ flex: "1 1 260px" }}>{missing.length} موظفة لديها راتب محدد ولم تُسجَّل في مسير {monthLabel(period)} بعد. يُضاف الراتب والعمولة المحسوبة تلقائياً.</span>
          <GhostButton icon="plus" onClick={busy || !com.ready ? undefined : generate}>{busy ? "جارٍ التوليد…" : "توليد المسير"}</GhostButton>
        </div>
      )}
      {msg && <ErrorNote>{msg}</ErrorNote>}
      {team.loading || loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الرواتب: {error}</ErrorNote> : members.length === 0 ? (
        <EmptyState icon="wallet" title="لا رواتب مسجّلة لهذا الشهر" text="أضيفي الموظفات من صفحة الفريق مع رواتبهن (بالليرة أو بالدولار)، ثم سجّلي لكل منهن الراتب والعمولة والمكافآت والخصومات." />
      ) : (
        <DataTable minWidth={860} headers={["الموظفة", "الأساسي", "العمولة", "مكافآت", "خصومات", "الصافي", "مدفوع", ""]} widths={[1.8, 1.6, 1, 0.8, 0.8, 1.2, 0.7, 0.9]}
          rows={members.map((s) => {
            const p = by.get(s.id);
            const x = salOf.get(s.id);
            const dash = <span style={{ color: C.muted }}>—</span>;
            return [
              <StaffCell key="s" s={s} sub={x && x.base_salary > 0 ? `الراتب: ${x.salary_currency === "USD" ? usd(x.base_salary) : money(x.base_salary)}` : s.title} />,
              p ? <BaseCell key="b" p={p} /> : dash,
              p ? money(p.commission, false) : dash,
              p ? money(p.bonus, false) : dash,
              p ? money(p.deductions, false) : dash,
              p ? <b key="n">{money(netPay(p))}</b> : <span key="n" style={{ fontSize: 12.5, color: C.muted }}>لم يُسجّل</span>,
              p ? (canManage ? <Toggle key="t" on={!!p.paid_at} label={`دُفع راتب ${s.name}`} onChange={() => togglePaid(p)} /> : <Tag key="t" kind={p.paid_at ? "green" : "amber"}>{p.paid_at ? "مدفوع" : "لا"}</Tag>) : <span key="t" />,
              canManage ? <RowBtn key="e" icon={p ? "edit" : "plus"} label={p ? "تعديل" : "تسجيل"} onClick={() => setEditing({ s, p })} /> : <span key="e" />,
            ];
          })} />
      )}
      {entries.some((p) => p.currency === "USD") && (
        <div style={{ fontSize: 12.5, color: C.sub2, lineHeight: 1.7 }}>
          رواتب الدولار تُحوَّل بسعر الصرف الحالي ما دامت غير مدفوعة، وعند تفعيل «مدفوع» يُثبَّت السعر ويُسجَّل المبلغ بالليرة في المالية (الرواتب) ولا يتغير لاحقاً.
        </div>
      )}
      <PayrollDialog target={editing} period={period} salary={editing ? salOf.get(editing.s.id) : undefined} commission={editing ? com.due.get(editing.s.id) : undefined} rate={rate?.usd_to_syp ?? null} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}

function BaseCell({ p }: { p: Payroll }) {
  if (p.currency !== "USD") return <span>{money(p.base_salary, false)}</span>;
  return (
    <span style={{ lineHeight: 1.35 }}>
      <b style={LAT} dir="ltr">{usd(p.amount_original ?? 0)}</b>
      <div style={{ fontSize: 11.5, color: C.sub2 }}><span dir="ltr" style={LAT}>{`× ${num(p.fx_rate ?? 0)} = ${num(p.base_salary)}`}</span> ل.س{p.paid_at ? " · مثبّت" : ""}</div>
    </span>
  );
}

function PayrollDialog({ target, period, salary, commission, rate, onClose }: {
  target: { s: Staff; p?: Payroll } | null; period: string; salary?: StaffSalary; commission?: number; rate: number | null; onClose: () => void;
}) {
  const [f, setF] = useState({ cur: "SYP" as Currency, base: "", commission: "", bonus: "", deductions: "", note: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    const p = target?.p;
    setF(p
      ? { cur: p.currency as Currency, base: String(p.amount_original ?? p.base_salary), commission: String(p.commission), bonus: String(p.bonus), deductions: String(p.deductions), note: p.note }
      : { cur: (salary?.salary_currency as Currency) ?? "SYP", base: salary?.base_salary ? String(salary.base_salary) : "", commission: commission ? String(commission) : "", bonus: "", deductions: "", note: "" });
    setError("");
  }, [target, salary, commission]);
  const n = (s: string) => Math.round(Number(s || 0));
  const frozen = !!target?.p?.paid_at && target.p.currency === "USD" && f.cur === "USD";
  const useRate = frozen ? target?.p?.fx_rate ?? null : rate;
  const baseSyp = f.cur === "USD" ? (useRate ? n(f.base) * useRate : null) : n(f.base);

  async function submit() {
    if (!target) return;
    if (f.base.trim() === "") { setError("اكتبي الراتب الأساسي."); return; }
    if (f.cur === "USD" && !useRate) { setError("حدّدي سعر الصرف أولاً (بطاقة «سعر الصرف» في هذه الصفحة)."); return; }
    setBusy(true);
    try {
      await savePayroll({ id: target.p?.id, staff_id: target.s.id, period, currency: f.cur, amount_original: n(f.base), base_salary: baseSyp ?? 0,
        commission: n(f.commission), bonus: n(f.bonus), deductions: n(f.deductions), note: f.note.trim() });
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  const net = baseSyp === null ? null : baseSyp + n(f.commission) + n(f.bonus) - n(f.deductions);
  return (
    <Modal open={!!target} onClose={onClose} title={`راتب ${monthLabel(period)} — ${target?.s.name ?? ""}`} width={560}
      footer={<SubmitButton onClick={submit} busy={busy}>حفظ</SubmitButton>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.sub }}>عملة الراتب</span>
        <Segment label="عملة الراتب" value={f.cur} onChange={(cur) => setF({ ...f, cur })} options={[{ value: "SYP", label: "ل.س" }, { value: "USD", label: "$" }]} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        <NumberInput label={f.cur === "USD" ? "الراتب الأساسي بالدولار" : "الراتب الأساسي"} required value={f.base} onChange={(v) => setF({ ...f, base: v })} suffix={f.cur === "USD" ? "$" : "ل.س"}
          hint={f.cur === "USD" ? (useRate ? <span>= <span dir="ltr" style={LAT}>{num(baseSyp ?? 0)}</span> ل.س بسعر <span dir="ltr" style={LAT}>{num(useRate)}</span>{frozen ? " (سعر الدفع المثبّت)" : " (سعر اليوم)"}</span> : "لم يُحدَّد سعر الصرف بعد") : undefined} />
        <NumberInput label="العمولة" value={f.commission} onChange={(v) => setF({ ...f, commission: v })} suffix="ل.س" hint={commission !== undefined ? `المحسوبة هذا الشهر: ${money(commission)}` : "من صفحة العمولات"} />
        <NumberInput label="مكافآت" value={f.bonus} onChange={(v) => setF({ ...f, bonus: v })} suffix="ل.س" />
        <NumberInput label="خصومات" value={f.deductions} onChange={(v) => setF({ ...f, deductions: v })} suffix="ل.س" />
      </div>
      <TextInput label="ملاحظة" value={f.note} onChange={(v) => setF({ ...f, note: v })} />
      <div style={{ borderRadius: 16, background: C.tint, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.8 }}>
        {f.cur === "USD" && useRate && (
          <div style={{ color: C.sub }}>
            <span dir="ltr" style={LAT}>{`${num(n(f.base))}$ × ${num(useRate)} = ${num(baseSyp ?? 0)}`}</span> ل.س
            {n(f.commission) > 0 && <> + عمولة <span dir="ltr" style={LAT}>{num(n(f.commission))}</span> ل.س</>}
            {n(f.bonus) > 0 && <> + مكافآت <span dir="ltr" style={LAT}>{num(n(f.bonus))}</span></>}
            {n(f.deductions) > 0 && <> − خصومات <span dir="ltr" style={LAT}>{num(n(f.deductions))}</span></>}
          </div>
        )}
        <div style={{ fontSize: 15, fontWeight: 700 }}>الصافي: <span style={{ color: net !== null && net < 0 ? C.danger : C.accent }}>{net === null ? "—" : money(net)}</span></div>
      </div>
      {f.cur === "USD" && !frozen && <div style={{ fontSize: 12, color: C.sub2 }}>يُثبَّت سعر الصرف لحظة تفعيل «مدفوع»؛ قبل ذلك يُحدَّث مع كل تغيير للسعر.</div>}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
