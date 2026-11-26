"use client";

/** Add / edit / delete an expense (used by the expenses page and the cash box). */
import { useState } from "react";
import { ErrorNote, Modal, NumberInput, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { deleteExpense, EXPENSE_CATEGORIES, financeError, saveExpense, type Expense } from "@/lib/db/finance";
import { currentRate, usd, type Currency } from "@/lib/db/fx";
import { useQuery } from "@/lib/db/query";
import { dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";

export function ExpenseDialog({ exp, onClose, till: tillDefault = false }: { exp: Expense | "new" | null; onClose: () => void; till?: boolean }) {
  const e = exp && exp !== "new" ? exp : null;
  const [category, setCategory] = useState(e?.category ?? EXPENSE_CATEGORIES[0]);
  const [label, setLabel] = useState(e?.label ?? "");
  const [amount, setAmount] = useState(e ? String(e.amount) : "");
  const [currency, setCurrency] = useState<Currency>("SYP");
  const fx = useQuery(["fx", "current"], currentRate);
  const rate = fx.data?.usd_to_syp ?? 0;
  const [day, setDay] = useState(e?.spent_on ?? dayKey());
  const [note, setNote] = useState(e?.note ?? "");
  const [till, setTill] = useState(e?.from_cash_box ?? tillDefault);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cats = EXPENSE_CATEGORIES.includes(category) ? EXPENSE_CATEGORIES : [category, ...EXPENSE_CATEGORIES];
  const save = async () => {
    if (!label.trim() || !(Number(amount) > 0)) { setErr("أدخلي البند والمبلغ."); return; }
    if (currency === "USD" && !(rate > 0)) { setErr("لم يُضبط سعر صرف الدولار بعد."); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) { setErr("اختاري تاريخ المصروف."); return; }
    if (day > dayKey()) { setErr("لا يمكن تسجيل مصروف بتاريخ مستقبلي."); return; }
    setBusy(true); setErr(null);
    const num = Number(amount);
    const sypAmount = currency === "USD" ? Math.round(num * rate) : Math.round(num);
    const fxTag = currency === "USD" ? `${usd(num)} × ${rate.toLocaleString("en-US")}` : "";
    const finalNote = fxTag ? (note.trim() ? `${note.trim()} (${fxTag})` : fxTag) : (note || null);
    try { await saveExpense({ id: e?.id, category, label: label.trim(), amount: sypAmount, spent_on: day, note: finalNote, from_cash_box: till }); onClose(); }
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
        <Select label="الفئة" value={category} onChange={setCategory} options={cats.map((c) => ({ value: c, label: c }))} style={{ flex: "1 1 150px" }} />
        <Select label="العملة" value={currency} onChange={(v) => setCurrency(v as Currency)} options={[{ value: "SYP", label: "ل.س" }, { value: "USD", label: "دولار ($)" }]} style={{ flex: "0 0 115px" }} />
        <NumberInput label="المبلغ" required value={amount} onChange={setAmount} suffix={currency === "USD" ? "$" : "ل.س"} style={{ flex: "1 1 150px" }} />
      </div>
      {currency === "USD" && (
        <div style={{ fontSize: 13, color: C.sub2, background: "#FAF6FC", padding: "8px 12px", borderRadius: 12 }}>
          {rate > 0 ? (
            <>سعر الصرف: <b className="latin">1$ = {rate.toLocaleString("en-US")}</b> ل.س{Number(amount) > 0 ? <> · يُضاف للصندوق: <b style={{ color: C.accent }}>{money(Math.round(Number(amount) * rate))}</b></> : null}</>
          ) : (
            <span style={{ color: C.danger }}>لم يُضبط سعر صرف الدولار بعد.</span>
          )}
        </div>
      )}
      <TextInput label="التاريخ" type="date" dir="ltr" value={day} onChange={setDay} />
      <TextArea label="ملاحظة" value={note} onChange={setNote} rows={2} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 13.5 }}><b>دُفع من الصندوق</b><div style={{ fontSize: 12, color: C.sub2 }}>نثرية دُفعت نقداً من درج المركز</div></div>
        <Toggle on={till} onChange={setTill} label="دُفع من الصندوق" />
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}