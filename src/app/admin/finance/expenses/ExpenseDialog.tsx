"use client";

/** Add / edit / delete an expense (used by the expenses page and the cash box). */
import { useState } from "react";
import { ErrorNote, Modal, NumberInput, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { deleteExpense, EXPENSE_CATEGORIES, financeError, saveExpense, type Expense } from "@/lib/db/finance";
import { dayKey } from "@/lib/format";
import { C } from "@/lib/tokens";

export function ExpenseDialog({ exp, onClose, till: tillDefault = false }: { exp: Expense | "new" | null; onClose: () => void; till?: boolean }) {
  const e = exp && exp !== "new" ? exp : null;
  const [category, setCategory] = useState(e?.category ?? EXPENSE_CATEGORIES[0]);
  const [label, setLabel] = useState(e?.label ?? "");
  const [amount, setAmount] = useState(e ? String(e.amount) : "");
  const [day, setDay] = useState(e?.spent_on ?? dayKey());
  const [note, setNote] = useState(e?.note ?? "");
  const [till, setTill] = useState(e?.from_cash_box ?? tillDefault);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cats = EXPENSE_CATEGORIES.includes(category) ? EXPENSE_CATEGORIES : [category, ...EXPENSE_CATEGORIES];
  const save = async () => {
    if (!label.trim() || !(Number(amount) > 0)) { setErr("أدخلي البند والمبلغ."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) { setErr("اختاري تاريخ المصروف."); return; }
    if (day > dayKey()) { setErr("لا يمكن تسجيل مصروف بتاريخ مستقبلي."); return; }
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Select label="الفئة" value={category} onChange={setCategory} options={cats.map((c) => ({ value: c, label: c }))} style={{ flex: "1 1 160px" }} />
        <NumberInput label="المبلغ" required value={amount} onChange={setAmount} suffix="ل.س" style={{ flex: "1 1 160px" }} />
      </div>
      <TextInput label="التاريخ" type="date" dir="ltr" value={day} onChange={setDay} />
      <TextArea label="ملاحظة" value={note} onChange={setNote} rows={2} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 13.5 }}><b>دُفع من الصندوق</b><div style={{ fontSize: 12, color: C.sub2 }}>{e?.shift_id ? "مسجّل على وردية الصندوق التي دُفع منها" : "يُخصم من النقد المتوقع في الوردية المفتوحة (يجب أن يكون الصندوق مفتوحاً)"}</div></div>
        <Toggle on={till} onChange={setTill} label="دُفع من الصندوق" />
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
