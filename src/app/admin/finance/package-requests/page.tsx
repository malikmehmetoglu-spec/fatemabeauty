"use client";

/**
 * Owner/admin: package subscription requests sent from the client app (rpc package_request_list, migration 0178).
 * «تأكيد الدفع» creates a paid invoice with a package line (→ patient_packages, exactly as the cashier) and notifies the client.
 * Both actions need a 10-second countdown before the final button unlocks.
 */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Loading, Modal, SubmitButton, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, money } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";
import { cancelPackageRequest, confirmPackagePayment, packageRequestList, prError, type PrRow } from "@/lib/db/packageRequests";
import pg from "../../adminPages.module.css";

type Act = { r: PrRow; kind: "pay" | "cancel" };

export default function PackageRequestsPage() {
  const q = useQuery(["pkgreq", "list"], packageRequestList);
  const [act, setAct] = useState<Act | null>(null);
  const rows = q.data ?? [];
  const waiting = rows.filter((r) => r.status === "pending");
  return (
    <AdminShell active="المالية" title="طلبات الباقات" subtitle="طلبات اشتراك المراجِعات من التطبيق · تُفعَّل الباقة فور تأكيد الدفع">
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{prError(new Error(q.error))}</ErrorNote> : rows.length === 0 ? (
        <EmptyState icon="gift" title="لا طلبات باقات" text="عندما تطلب مراجِعة الاشتراك بباقة من التطبيق يظهر طلبها هنا لتأكيد الدفع." />
      ) : (
        <div style={{ borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SHB, padding: "8px 18px" }}>
          <div style={{ fontSize: 13, color: C.sub2, padding: "8px 0" }}>بانتظار الدفع: <b className="latin" style={{ color: C.accent }}>{waiting.length}</b></div>
          {rows.map((r) => (
            <div key={r.id} className={pg.row} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: "2 1 160px", minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{r.patient_name}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>ملف <span className="latin">{r.file_no}</span>{r.phone ? <> · <span className="latin" dir="ltr">{r.phone}</span></> : null}</div>
              </div>
              <div style={{ flex: "2 1 140px", minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.package_name}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{r.sessions} جلسات</div>
              </div>
              <div style={{ flex: "1 1 120px", fontSize: 12.5, color: C.sub2 }}>{arDate(new Date(r.created_at))} · <span className="latin">{clock(r.created_at)}</span></div>
              <div className="latin" style={{ flex: "1 1 100px", fontWeight: 700 }}>{money(r.price)}</div>
              <div style={{ flex: "1 1 110px" }}>
                <Tag kind={r.status === "pending" ? "amber" : r.status === "paid" ? "green" : "gray"}>
                  {r.status === "pending" ? "بانتظار الدفع" : r.status === "paid" ? `مفعّلة${r.invoice_no ? ` · ${r.invoice_no}` : ""}` : "ملغاة"}
                </Tag>
              </div>
              <div style={{ flex: "0 0 auto", display: "flex", gap: 8, alignItems: "center" }}>
                {r.status === "pending" ? <>
                  <SubmitButton onClick={() => setAct({ r, kind: "pay" })} style={{ height: 42 }}>تأكيد الدفع</SubmitButton>
                  <GhostButton onClick={() => setAct({ r, kind: "cancel" })} style={{ height: 42 }}>إلغاء</GhostButton>
                </> : <span style={{ fontSize: 12, color: C.sub2 }}>{r.paid_at ? `أُكّد ${clock(r.paid_at)}` : ""}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {act && <ActDialog act={act} onClose={() => setAct(null)} />}
    </AdminShell>
  );
}

function ActDialog({ act: { r, kind }, onClose }: { act: Act; onClose: () => void }) {
  const [method, setMethod] = useState<"cash" | "card">("cash");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState(10);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  async function go() {
    setBusy(true); setErr("");
    try {
      if (kind === "pay") await confirmPackagePayment(r.id, method); else await cancelPackageRequest(r.id);
      onClose();
    } catch (e) { setErr(prError(e)); setBusy(false); }
  }
  const pay = kind === "pay";
  const label = pay ? `تأكيد استلام ${money(r.price)}` : "إلغاء الطلب";
  return (
    <Modal open onClose={onClose} title={pay ? "تأكيد دفع باقة" : "إلغاء طلب باقة"} width={480}
      footer={<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <SubmitButton busy={busy} disabled={left > 0} onClick={go}>{left > 0 ? `${label} (${left})` : label}</SubmitButton>
        <GhostButton onClick={onClose}>تراجع</GhostButton>
      </div>}>
      <div style={{ fontSize: 14.5, lineHeight: 1.9 }}>المراجِعة <b>{r.patient_name}</b> · ملف <span className="latin">{r.file_no}</span></div>
      <div style={{ fontSize: 14, lineHeight: 1.8 }}>الباقة <b>{r.package_name}</b> · {r.sessions} جلسات · <b className="latin">{money(r.price)}</b></div>
      {pay && <div style={{ display: "flex", gap: 8 }}>
        {(["cash", "card"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMethod(m)} style={{ flex: 1, height: 44, borderRadius: 22, fontWeight: 700, fontSize: 14,
            border: method === m ? "none" : "1px solid #EADCF0", background: method === m ? "linear-gradient(150deg,#9C64AA,#6A3577)" : C.white, color: method === m ? "#fff" : C.sub }}>
            {m === "cash" ? "نقداً" : "بطاقة"}
          </button>
        ))}
      </div>}
      <div style={{ fontSize: 12.5, color: C.sub2 }}>
        {pay ? "تُنشأ فاتورة مدفوعة بالباقة، وتُضاف الباقة إلى ملف المراجِعة وتصلها رسالة بالتفعيل."
             : "يُلغى الطلب ولا تُنشأ أي فاتورة. يمكن للمراجِعة إرسال طلب جديد لاحقاً."}
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
