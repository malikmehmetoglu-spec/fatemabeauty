"use client";

/**
 * Admin/owner: payment status of written consultations (rpc written_consult_payments — no access to the questions or photos).
 * «تأكيد الدفع» creates a paid invoice for service «online-consultation» and starts the 48-hour clock.
 */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Loading, Modal, SubmitButton, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, money } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";
import { WC_KIND, WC_STATUS, confirmWcPayment, wcError, wcPayments, type WcPayment } from "@/lib/db/writtenConsult";
import pg from "../../adminPages.module.css";

export default function WcPaymentsPage() {
  const q = useQuery(["wc", "payments"], wcPayments);
  const [pay, setPay] = useState<WcPayment | null>(null);
  const rows = q.data ?? [];
  const waiting = rows.filter((r) => r.status === "awaiting_payment");
  return (
    <AdminShell active="المالية" title="الاستشارات المكتوبة" subtitle="تأكيد دفع الاستشارات المكتوبة · يبدأ موعد الرد (48 ساعة) من لحظة التأكيد">
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{wcError(new Error(q.error))}</ErrorNote> : rows.length === 0 ? (
        <EmptyState icon="msg" title="لا استشارات مكتوبة" text="عندما ترسل مراجِعة استشارة مكتوبة من التطبيق تظهر هنا لتأكيد دفعها." />
      ) : (
        <div style={{ borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SHB, padding: "8px 18px" }}>
          <div style={{ fontSize: 13, color: C.sub2, padding: "8px 0" }}>بانتظار الدفع: <b className="latin" style={{ color: C.accent }}>{waiting.length}</b></div>
          {rows.map((r) => (
            <div key={r.id} className={pg.row} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: "2 1 0", minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{r.patient_name}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>ملف <span className="latin">{r.file_no}</span>{r.phone ? <> · <span className="latin" dir="ltr">{r.phone}</span></> : null}</div>
              </div>
              <div style={{ flex: "1 1 0", fontSize: 12.5, color: C.sub2 }}>{arDate(new Date(r.created_at))} · <span className="latin">{clock(r.created_at)}</span></div>
              <div className="latin" style={{ flex: "1 1 0", fontWeight: 700 }}>{money(r.price)}</div>
              <div style={{ flex: "1 1 0" }}><Tag kind={WC_KIND[r.status]}>{r.status === "awaiting_payment" ? WC_STATUS[r.status] : `مدفوعة${r.invoice_no ? ` · ${r.invoice_no}` : ""}`}</Tag></div>
              <div style={{ flex: "0 0 auto" }}>
                {r.status === "awaiting_payment" ? <SubmitButton onClick={() => setPay(r)} style={{ height: 42 }}>تأكيد الدفع</SubmitButton> : <span style={{ fontSize: 12, color: C.sub2 }}>{r.paid_at ? `أُكّد ${clock(r.paid_at)}` : ""}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {pay && <PayDialog r={pay} onClose={() => setPay(null)} />}
    </AdminShell>
  );
}

function PayDialog({ r, onClose }: { r: WcPayment; onClose: () => void }) {
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    try { await confirmWcPayment(r.id, method); onClose(); } catch (e) { setErr(wcError(e)); setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title="تأكيد دفع استشارة مكتوبة" width={460}
      footer={<><SubmitButton busy={busy} onClick={go}>تأكيد استلام {money(r.price)}</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <div style={{ fontSize: 14.5, lineHeight: 1.9 }}>المراجِعة <b>{r.patient_name}</b> · ملف <span className="latin">{r.file_no}</span></div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["cash", "card"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMethod(m)} style={{ flex: 1, height: 44, borderRadius: 22, fontWeight: 700, fontSize: 14,
            border: method === m ? "none" : "1px solid #EADCF0", background: method === m ? "linear-gradient(150deg,#9C64AA,#6A3577)" : C.white, color: method === m ? "#fff" : C.sub }}>
            {m === "cash" ? "نقداً" : "بطاقة"}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: C.sub2 }}>تُنشأ فاتورة مدفوعة في الصندوق المفتوح، وتُبلَّغ المراجِعة أن استشارتها وصلت إلى أ. فاطمة.</div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
