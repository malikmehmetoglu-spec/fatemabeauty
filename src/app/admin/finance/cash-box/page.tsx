"use client";

/**
 * W_CashBox.dc.html — الصندوق اليومي (live, Supabase).
 * Open a shift with an opening float; cash payments and till expenses accumulate; close by counting the drawer —
 * expected = opening + cash received − expenses paid from the till (computed on the server).
 */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, NumberInput, SubmitButton, TextArea } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { closeShift, customerName, financeError, getOpenShift, listShifts, openShift, PAY_LABEL, shiftActivity, staffNames, type CashShift } from "@/lib/db/finance";
import { arDate, clock, money } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { Amount, Big, LATIN, LightBtn, PANEL, PanelTitle, StatCard } from "../parts";
import { ExpenseDialog } from "../expenses/ExpenseDialog";
import { useSession } from "@/lib/supabase/session";
import css from "../finance.module.css";

export default function Page() {
  const open = useQuery(["finance", "shift", "open"], getOpenShift);
  const history = useQuery(["finance", "shifts"], () => listShifts(8));
  const names = useQuery(["finance", "staffNames"], staffNames);
  const shift = open.data ?? null;
  const subtitle = `${arDate(new Date())} · الآن ${clock()}` + (shift ? ` · الوردية مفتوحة منذ ${clock(shift.opened_at)}` : " · الصندوق مغلق");

  return (
    <AdminShell active="المالية" title="الصندوق اليومي" subtitle={subtitle}>
      {open.loading ? <Loading /> : open.error ? <ErrorNote>{open.error}</ErrorNote> : shift ? (
        <OpenShift shift={shift} names={names.data ?? {}} />
      ) : <OpenForm />}
      <div style={PANEL}>
        <PanelTitle>الورديات السابقة</PanelTitle>
        {history.loading ? <Loading /> : !(history.data ?? []).filter((s) => s.closed_at).length ? (
          <div style={{ fontSize: 13, color: C.muted, padding: "6px 0" }}>لم تُغلق أي وردية بعد. يظهر هنا تقرير كل إغلاق: المتوقع، المعدود والفرق.</div>
        ) : (history.data ?? []).filter((s) => s.closed_at).map((s) => {
          const diff = (s.counted_cash ?? 0) - (s.expected_cash ?? 0);
          return (
            <div key={s.id} className={css.histRow}>
              <div style={{ flex: "1.6 1 220px" }}>{arDate(new Date(s.opened_at))} · <span style={LATIN}>{clock(s.opened_at)}–{clock(s.closed_at as string)}</span></div>
              <div style={{ flex: "1.2 1 120px", color: C.sub2 }}>{(s.closed_by && names.data?.[s.closed_by]) || "—"}</div>
              <div style={{ flex: "1.2 1 140px" }}>المتوقع <Amount n={s.expected_cash ?? 0} /></div>
              <div style={{ flex: "1.2 1 140px" }}>المعدود <Amount n={s.counted_cash ?? 0} /></div>
              <div style={{ flex: "1 1 120px", fontWeight: 700, color: diff === 0 ? C.okDeep : diff < 0 ? C.danger : "#8A5A12" }}>{diff === 0 ? "مطابق" : `${diff > 0 ? "زيادة" : "عجز"} ${money(Math.abs(diff))}`}</div>
              {s.note && <div style={{ flex: "1.6 1 100%", fontSize: 12, color: C.sub2 }}>{s.note}</div>}
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}

function OpenForm() {
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    setBusy(true); setErr(null);
    const n = Number(v || 0);
    if (!Number.isFinite(n) || n < 0) { setErr("أدخلي رصيد افتتاح صحيحاً (0 أو أكثر)."); return; }
    try { await openShift(n); } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };
  return (
    <EmptyState icon="cash" title="الصندوق مغلق" text="افتحي وردية جديدة بإدخال رصيد الافتتاح (النقد الموجود في الدرج الآن). تُحسب المقبوضات النقدية والمصاريف من الصندوق تلقائياً حتى الإغلاق."
      action={
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", width: "min(320px, 100%)" }}>
          <NumberInput label="رصيد الافتتاح" value={v} onChange={setV} suffix="ل.س" />
          {err && <ErrorNote>{err}</ErrorNote>}
          <SubmitButton onClick={go} busy={busy}>فتح الوردية</SubmitButton>
        </div>
      } />
  );
}

function OpenShift({ shift, names }: { shift: CashShift; names: Record<string, string> }) {
  const act = useQuery(["finance", "shift", "activity", shift.id], () => shiftActivity(shift));
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { staff } = useSession();
  const canExpense = staff?.role === "owner" || staff?.role === "admin" || staff?.role === "accountant";
  const [addExp, setAddExp] = useState(false);
  const a = act.data;
  const cashIn = (a?.payments ?? []).filter((p) => p.method === "cash").reduce((s, p) => s + p.amount, 0);
  const refunds = (a?.refunds ?? []).reduce((s, r) => s + r.refund_cash, 0);
  const cardIn = (a?.payments ?? []).filter((p) => p.method === "card").reduce((s, p) => s + p.amount, 0);
  const pkgCount = (a?.payments ?? []).filter((p) => p.method === "package").length;
  const exp = (a?.expenses ?? []).reduce((s, e) => s + e.amount, 0);
  const expected = a?.expected ?? shift.opening_cash;
  const c = counted === "" ? null : Math.max(0, Math.round(Number(counted) || 0));
  const diff = c === null ? 0 : c - expected;
  const step = (n: number) => setCounted(String(Math.max(0, (c ?? expected) + n)));

  const close = async () => {
    if (c === null) return;
    if (diff !== 0 && !note.trim()) { setErr(diff < 0 ? "يوجد عجز — اذكري السبب قبل الإغلاق." : "توجد زيادة — اذكري السبب قبل الإغلاق."); return; }
    setBusy(true); setErr(null);
    try { await closeShift(c, note); } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };

  type Move = { id: string; at: string; title: string; sub: string; amount: number; sign: 1 | -1; out?: boolean };
  const moves: Move[] = [
    ...(a?.payments ?? []).map((p) => ({ id: p.id, at: p.paid_at, title: p.invoices ? customerName({ patients: p.invoices.patients, walk_in_name: p.invoices.walk_in_name }) : "دفعة", sub: `${PAY_LABEL[p.method]}${p.method !== "cash" ? " (خارج الدرج)" : ""} · ${p.invoices?.no ?? ""}`, amount: p.amount, sign: 1 as const, out: p.method !== "cash" })),
    ...(a?.expenses ?? []).map((e) => ({ id: e.id, at: e.created_at, title: e.label, sub: `مصروف من الصندوق · ${e.category}`, amount: e.amount, sign: -1 as const })),
    ...(a?.refunds ?? []).map((r) => ({ id: r.id, at: r.void_at ?? "", title: customerName({ patients: r.patients, walk_in_name: r.walk_in_name }), sub: `إرجاع نقدي لفاتورة ملغاة · ${r.no}`, amount: r.refund_cash, sign: -1 as const })),
  ].sort((x, y) => y.at.localeCompare(x.at));

  return (<>
    <div className={css.stats}>
      <StatCard label="رصيد الافتتاح" value={<Big n={shift.opening_cash} />} sub={`${clock(shift.opened_at)}${shift.opened_by && names[shift.opened_by] ? ` · ${names[shift.opened_by]}` : ""}`} icon="wallet" />
      <StatCard label="مقبوضات نقدية" value={<Big n={cashIn} />} sub={`${(a?.payments ?? []).filter((p) => p.method === "cash").length} دفعة`} icon="cash" />
      <StatCard label="مصروفات ومرتجعات" value={<Big n={exp + refunds} />} sub={refunds ? `مصاريف ${money(exp)} · مرتجع ${money(refunds)}` : "مدفوعة من الدرج"} icon="receipt" />
      <StatCard dark label="النقد المتوقع في الدرج" value={<Big n={expected} />} sub={`بطاقة ${money(cardIn)} خارج الدرج${pkgCount ? ` · ${pkgCount} جلسة باقة` : ""}`} icon="lock" />
    </div>
    <div className={css.split}>
      <div className={css.sideNarrow} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 12 }}>
        <PanelTitle right="−/+ بفئة 50">عدّ النقد الفعلي</PanelTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RoundBtn icon="minus" label="إنقاص" onClick={() => step(-50)} />
          <NumberInput label="المعدود في الدرج" value={counted} onChange={setCounted} suffix="ل.س" placeholder={money(expected, false)} style={{ flex: 1 }} />
          <RoundBtn icon="plus" label="زيادة" onClick={() => step(50)} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 16, padding: "12px 14px", background: c === null ? C.tint : diff === 0 ? "#E6F4EC" : diff < 0 ? "#FBEAF1" : "#FCF1DE" }}>
          <span style={{ fontSize: 13, color: C.sub2 }}>الفرق عن المتوقع</span>
          <span dir="ltr" style={{ ...LATIN, fontSize: 18, fontWeight: 700, color: c === null ? C.muted : diff === 0 ? C.okDeep : diff < 0 ? C.danger : "#8A5A12" }}>{c === null ? "—" : `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${money(Math.abs(diff), false)}`}</span>
        </div>
        {c !== null && <div style={{ fontSize: 12.5, color: C.sub2 }}>{diff === 0 ? "الصندوق مطابق." : diff < 0 ? "عجز — يُطلب ذكر السبب عند الإغلاق ويظهر في تقرير الإغلاق." : "زيادة — يُطلب ذكر السبب وتُسجَّل في تقرير الإغلاق."}</div>}
        <TextArea label="ملاحظة الإغلاق" value={note} onChange={setNote} rows={2} placeholder={diff < 0 ? "سبب العجز (مطلوب)" : diff > 0 ? "سبب الزيادة (مطلوب)" : "اختياري"} />
        {err && <ErrorNote>{err}</ErrorNote>}
        <SubmitButton onClick={close} busy={busy} disabled={c === null}>إغلاق الوردية</SubmitButton>
      </div>
      <div style={{ ...PANEL, flex: 1 }}>
        <PanelTitle right={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{moves.length} حركة{canExpense && <LightBtn icon="plus" onClick={() => setAddExp(true)} style={{ height: 34 }}>مصروف من الصندوق</LightBtn>}</span>}>حركات الصندوق في هذه الوردية</PanelTitle>
        <MoveRow title="رصيد افتتاحي" sub={names[shift.opened_by ?? ""] ?? ""} at={shift.opened_at} amount={shift.opening_cash} sign={1} />
        {act.loading ? <Loading /> : moves.length === 0 ? <div style={{ fontSize: 13, color: C.muted, padding: "12px 0" }}>لا حركات بعد. تظهر هنا كل دفعة من الكاشير وكل مصروف من الدرج.</div>
          : moves.map((m) => <MoveRow key={m.id} {...m} />)}
      </div>
    </div>
    {addExp && <ExpenseDialog exp="new" till onClose={() => setAddExp(false)} />}
  </>);
}

function MoveRow({ title, sub, at, amount, sign, out }: { title: string; sub: string; at: string; amount: number; sign: 1 | -1; out?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, borderTop: `1px solid ${C.line}` }}>
      <span style={{ width: 34, height: 34, borderRadius: 17, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={sign < 0 ? "receipt" : out ? "card" : "cash"} color={C.accentMid} size={15} />
      </span>
      <div style={{ flex: 1, lineHeight: 1.4, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub2 }}><span style={LATIN}>{clock(at)}</span>{sub ? ` · ${sub}` : ""}</div>
      </div>
      <span dir="ltr" style={{ ...LATIN, fontWeight: 700, fontSize: 14, color: out ? C.muted : sign < 0 ? C.danger : C.okDeep }}>{sign < 0 ? "−" : "+"}{money(amount, false)}</span>
    </div>
  );
}

function RoundBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <button type="button" aria-label={label} onClick={onClick} style={{ width: 46, height: 46, marginTop: 22, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} color={C.accent} size={18} stroke={2.2} /></button>;
}
