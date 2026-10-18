"use client";

/** W_Expenses.dc.html — المصاريف (live, Supabase): monthly list by category, add / edit / delete. */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Modal, NumberInput, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { collected, deleteExpense, EXPENSE_CATEGORIES, financeData, financeError, monthRange, saveExpense, sumBy, type Expense } from "@/lib/db/finance";
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
  const revenue = (data?.invoices ?? []).reduce((s, i) => s + collected(i), 0);
  const total = exps.reduce((s, e) => s + e.amount, 0);
  const byCat = sumBy(exps, (e) => e.category, (e) => e.amount);
  const list = cat === "all" ? exps : exps.filter((e) => e.category === cat);
  const fromTill = exps.filter((e) => e.from_cash_box).reduce((s, e) => s + e.amount, 0);

  return (
    <AdminShell active="المالية" title="المصاريف" subtitle={month === thisMonth ? `${monthLabel(month)} حتى اليوم` : monthLabel(month)} actions={<>
      <MonthPicker month={month} onChange={setMonth} max={thisMonth} />
      <DeepBtn icon="plus" onClick={() => setEditing("new")}>مصروف جديد</DeepBtn>
    </>}>
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard dark label={`إجمالي مصاريف ${monthLabel(month)}`} value={<Big n={total} />} sub={revenue > 0 ? `${Math.round((total / revenue) * 100)}% من مقبوضات الشهر (${money(revenue)})` : "لا مقبوضات مسجّلة هذا الشهر"} icon="receipt" />
        <StatCard label="عدد المصاريف" value={exps.length} sub={byCat.length ? `أكبر فئة: ${byCat[0][0]}` : "—"} icon="list" />
        <StatCard label="من الصندوق" value={<Big n={fromTill} />} sub="نثريات دُفعت من الدرج" icon="cash" />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
            <div style={{ display: "flex", gap: 12, height: 36, alignItems: "center" }}>
              {[["البند", 2.6], ["الفئة", 1], ["التاريخ", 1.4], ["المبلغ", 1.1], ["", 0.7]].map(([h, w], i) => <div key={i} style={{ flex: w as number, fontSize: 12, color: C.sub2, fontWeight: 600 }}>{h}</div>)}
            </div>
            {list.map((e) => (
              <div key={e.id} style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 54, borderTop: `1px solid ${C.line}`, fontSize: 13.5 }}>
                <div style={{ flex: 2.6, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 700 }}>{e.label}</div>
                  {(e.note || e.from_cash_box) && <div style={{ fontSize: 12, color: C.sub2 }}>{[e.from_cash_box ? "من الصندوق" : "", e.note ?? ""].filter(Boolean).join(" · ")}</div>}
                </div>
                <div style={{ flex: 1 }}><span style={{ height: 24, padding: "0 10px", borderRadius: 12, background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>{e.category}</span></div>
                <div style={{ flex: 1.4, color: C.sub }}>{arDate(new Date(`${e.spent_on}T12:00:00`))}</div>
                <div style={{ flex: 1.1 }}><Amount n={e.amount} /></div>
                <div style={{ flex: 0.7 }}>
                  <button type="button" aria-label="تعديل" onClick={() => setEditing(e)} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="edit" color={C.accent} size={15} /></button>
                </div>
              </div>
            ))}
          </>)}
        </div>
        <div style={{ ...PANEL, width: 360, flexShrink: 0 }}>
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

function ExpenseDialog({ exp, onClose }: { exp: Expense | "new" | null; onClose: () => void }) {
  const e = exp && exp !== "new" ? exp : null;
  const [category, setCategory] = useState(e?.category ?? EXPENSE_CATEGORIES[0]);
  const [label, setLabel] = useState(e?.label ?? "");
  const [amount, setAmount] = useState(e ? String(e.amount) : "");
  const [day, setDay] = useState(e?.spent_on ?? dayKey());
  const [note, setNote] = useState(e?.note ?? "");
  const [till, setTill] = useState(e?.from_cash_box ?? false);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cats = EXPENSE_CATEGORIES.includes(category) ? EXPENSE_CATEGORIES : [category, ...EXPENSE_CATEGORIES];
  const save = async () => {
    if (!label.trim() || !(Number(amount) > 0)) { setErr("أدخلي البند والمبلغ."); return; }
    setBusy(true); setErr(null);
    try { await saveExpense({ id: e?.id, category, label: label.trim(), amount: Math.round(Number(amount)), spent_on: day, note: note || null, from_cash_box: till }); onClose(); }
    catch (x) { setErr(financeError(x)); } finally { setBusy(false); }
  };
  const del = async () => {
    if (!e) return;
    setBusy(true);
    try { await deleteExpense(e.id); onClose(); } catch (x) { setErr(financeError(x)); } finally { setBusy(false); }
  };
  return (
    <Modal open={!!exp} onClose={onClose} title={e ? "تعديل مصروف" : "مصروف جديد"} footer={<>
      <SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton>
      {e && <button type="button" onClick={() => (confirmDel ? del() : setConfirmDel(true))} style={{ height: 50, padding: "0 20px", borderRadius: 25, border: "1px solid #F3D3E0", background: C.white, color: C.danger, fontWeight: 600 }}>{confirmDel ? "تأكيد الحذف" : "حذف"}</button>}
    </>}>
      <TextInput label="البند" required value={label} onChange={setLabel} placeholder="مثلاً: فاتورة الكهرباء" />
      <div style={{ display: "flex", gap: 12 }}>
        <Select label="الفئة" value={category} onChange={setCategory} options={cats.map((c) => ({ value: c, label: c }))} style={{ flex: 1 }} />
        <NumberInput label="المبلغ" required value={amount} onChange={setAmount} suffix="ل.س" style={{ flex: 1 }} />
      </div>
      <TextInput label="التاريخ" type="date" dir="ltr" value={day} onChange={setDay} />
      <TextArea label="ملاحظة" value={note} onChange={setNote} rows={2} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 13.5 }}><b>دُفع من الصندوق</b><div style={{ fontSize: 12, color: C.sub2 }}>يُخصم من النقد المتوقع في الوردية المفتوحة</div></div>
        <Toggle on={till} onChange={setTill} label="دُفع من الصندوق" />
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
