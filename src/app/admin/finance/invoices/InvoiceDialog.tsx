"use client";

/** Invoice details: items, payments, record a payment, print, void (admin). */
import { useState } from "react";
import { ErrorNote, Modal, TextInput } from "@/components/ui";
import { customerName, financeError, outstanding, PAY_LABEL, voidInvoice, type InvoiceRow } from "@/lib/db/finance";
import { arDate, clock, money } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { Amount, DeepBtn, LATIN, LightBtn } from "../parts";
import { PayDialog } from "../receivables/PayDialog";

export function InvoiceDialog({ inv, names, onClose }: { inv: InvoiceRow | null; names: Record<string, string>; onClose: () => void }) {
  const { staff } = useSession();
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";
  const [voiding, setVoiding] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  if (!inv) return null;
  const doVoid = async () => {
    setBusy(true); setErr(null);
    try { await voidInvoice(inv.id, reason); onClose(); } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };
  return (
    <>
      <Modal open={!!inv && !paying} onClose={onClose} title={<>فاتورة <span dir="ltr" style={LATIN}>{inv.no}</span></>} width={600}>
        <div style={{ fontSize: 13.5, color: C.sub2, lineHeight: 1.8 }}>
          {customerName(inv)}{inv.patients?.file_no ? <> · ملف <span style={LATIN}>{inv.patients.file_no}</span></> : null} · {arDate(new Date(inv.created_at))} <span style={LATIN}>{clock(inv.created_at)}</span>
          {inv.created_by && names[inv.created_by] ? <> · أصدرتها {names[inv.created_by]}</> : null}
        </div>
        <div style={{ borderRadius: 18, border: `1px solid ${C.line}`, padding: "4px 14px" }}>
          {(inv.invoice_items ?? []).map((x) => (
            <div key={x.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13.5 }}>
              <span>{x.label} {x.qty > 1 && <span style={{ ...LATIN, color: C.sub2 }}>× {x.qty}</span>}</span><Amount n={x.qty * x.unit_price} />
            </div>
          ))}
          <Line label="المجموع" n={inv.subtotal} />
          {inv.discount > 0 && <Line label={`الخصم${inv.discount_approved_by ? " (بموافقة الإدارة)" : ""}`} n={-inv.discount} />}
          <Line label="الصافي" n={inv.total} bold />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>الدفعات</div>
          {(inv.invoice_payments ?? []).length === 0 ? <div style={{ fontSize: 13, color: C.muted }}>{inv.paid ? `مدفوعة ${PAY_LABEL[inv.method]}` : "لا دفعات بعد"}</div> :
            (inv.invoice_payments ?? []).map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                <span>{PAY_LABEL[p.method]} · {arDate(new Date(p.paid_at), { day: false })} <span style={LATIN}>{clock(p.paid_at)}</span></span>
                {p.method === "package" ? <span style={{ color: C.accent, fontWeight: 600 }}>جلسة من الباقة</span> : <Amount n={p.amount} />}
              </div>
            ))}
          {!inv.void && outstanding(inv) > 0 && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "#8A5A12" }}>المتبقي {money(outstanding(inv))}{inv.due_on ? ` · يستحق ${arDate(new Date(inv.due_on), { day: false })}` : ""}</div>}
        </div>
        {inv.note && <div style={{ fontSize: 13, color: C.sub, background: C.tint, borderRadius: 14, padding: "8px 12px" }}>{inv.note}</div>}
        {voiding && <TextInput label="سبب الإلغاء" value={reason} onChange={setReason} placeholder="مثلاً: خطأ في الإدخال" />}
        {err && <ErrorNote>{err}</ErrorNote>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <LightBtn icon="print" onClick={() => window.print()}>طباعة</LightBtn>
          {!inv.void && outstanding(inv) > 0 && <DeepBtn icon="cash" onClick={() => setPaying(true)} style={{ height: 40 }}>تسجيل دفعة</DeepBtn>}
          {isAdmin && !inv.void && (voiding
            ? <LightBtn icon="x" onClick={doVoid} disabled={busy} style={{ color: C.danger }}>{busy ? "جارٍ الإلغاء…" : "تأكيد الإلغاء"}</LightBtn>
            : <LightBtn icon="trash" onClick={() => setVoiding(true)} style={{ color: C.danger }}>إلغاء الفاتورة</LightBtn>)}
        </div>
        {isAdmin && voiding && <div style={{ fontSize: 12, color: C.sub2 }}>الإلغاء يعيد المنتجات إلى المخزون ويعيد جلسة الباقة، ويبقى في السجل.</div>}
      </Modal>
      <PayDialog inv={paying ? inv : null} onClose={() => { setPaying(false); onClose(); }} />
    </>
  );
}

function Line({ label, n, bold }: { label: string; n: number; bold?: boolean }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13.5, fontWeight: bold ? 700 : 400 }}><span>{label}</span><Amount n={n} weight={bold ? 700 : 500} /></div>;
}
