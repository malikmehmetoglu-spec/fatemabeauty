"use client";

/** Record a later payment (instalment) against an open invoice. */
import { useEffect, useState } from "react";
import { ErrorNote, Modal, NumberInput, Segment, SubmitButton } from "@/components/ui";
import { customerName, financeError, outstanding, payInvoice, type InvoiceRow } from "@/lib/db/finance";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { LATIN } from "../parts";

export function PayDialog({ inv, onClose }: { inv: InvoiceRow | null; onClose: () => void }) {
  const left = inv ? outstanding(inv) : 0;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setAmount(left ? String(left) : ""); setErr(null); }, [inv?.id, left]);
  if (!inv) return null;
  const n = Number(amount) || 0;
  const save = async () => {
    setBusy(true); setErr(null);
    try { await payInvoice(inv.id, n, method); onClose(); } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title="تسجيل دفعة" width={460} footer={<SubmitButton onClick={save} busy={busy} disabled={n <= 0 || n > left}>تسجيل {n > 0 ? money(n) : ""}</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub2 }}>{customerName(inv)} · فاتورة <span dir="ltr" style={LATIN}>{inv.no}</span> · المتبقي {money(left)}</div>
      <NumberInput label="المبلغ" value={amount} onChange={setAmount} suffix="ل.س" hint={n > left ? "أكبر من المتبقي" : undefined} />
      <Segment label="طريقة الدفع" value={method} onChange={setMethod} options={[{ value: "cash", label: "نقدي" }, { value: "card", label: "بطاقة" }]} />
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
