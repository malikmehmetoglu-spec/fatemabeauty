"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { ErrorNote, Loading, Toggle } from "@/components/ui";
import { initials } from "@/lib/data";
import { createInvoice, customerName, financeError, offerDiscount, type AppliedOffer, type CartLine, getInvoice, listCashierQueue, listPatientPackages, type CashierAppt, type InvoiceRow } from "@/lib/db/finance";
import { useInvoicePrint, waHref, type PrintExtras } from "../../admin/finance/InvoicePrint";
import { OfferCodeField } from "../../admin/finance/OfferCode";
import { useQuery } from "@/lib/db/query";
import { clock, money } from "@/lib/format";
import { css } from "../css";
import { BG, C, SH, SH_SOFT, ICON_FILL } from "@/lib/tokens";
import { DatePill, KC, KioskNav, useKiosk } from "../kiosk";

/** T_Cashier.dc.html */
const SEL = "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687";
const n = (x: string | number) => Number(x || 0).toLocaleString("en-US");
const STATUS: Record<string, string> = { done: "انتهت", in_session: "في الجلسة", checked_in: "في الانتظار" };
const nameOf = (a: CashierAppt) => a.patients?.name || a.walk_in_name || "مراجِعة";

type Done = { inv: InvoiceRow; extras: PrintExtras };
const doneBtn = { height: 40, padding: "0 16px", borderRadius: 20, border: "1px solid #CDE8D7", background: "#FFFFFF", color: "#2E7D50", fontSize: 14, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex", alignItems: "center" } as const;

/** Reception tablet: cashier — issues the invoice for a finished session (real rows via finance.ts). */
export default function Page() {
  const k = useKiosk();
  const q = useQuery(["queue", "cashier"], () => listCashierQueue(), { enabled: !k.gate });
  const [selId, setSelId] = useState<string | null>(null);
  const [st, setSt] = useState({ m: 0, recv: "" });
  const [print, setPrint] = useState(false);
  const [offer, setOffer] = useState<AppliedOffer | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const receipt = useInvoicePrint();
  const due = (q.data ?? []).filter((a) => !a.invoiced);
  const A = due.find((a) => a.id === selId) ?? due.find((a) => a.status === "done") ?? due[0];
  const pk = useQuery(["queue", "cashier-pkg", A?.patient_id ?? ""], () => listPatientPackages(A!.patient_id!), { enabled: !k.gate && !!A?.patient_id });
  if (k.gate) return k.gate;
  const doneCount = (q.data ?? []).filter((a) => a.status === "done").length;
  const pkg0 = (pk.data ?? []).find((p) => p.sessions_used < p.sessions_total && p.packages?.service_key === A?.service_key);
  const PRICE = A?.price || A?.services?.price || 0; // same rule as the server (booked price, else the service price)
  const line: CartLine[] = A ? [{ kind: "service", ref: A.service_key, qty: 1, label: A.services?.name ?? A.service_key, unit_price: PRICE }] : [];
  const code = st.m !== 2 ? offer : null; // a package session is free → no code on it
  const DISC = code ? offerDiscount(code, line) : 0;
  const TOTAL = PRICE - DISC;
  const methods = [0, 1, 2].map((i) => ({ pick: () => { if (i !== 2 || pkg0) setSt({ ...st, m: i }); },
    style: css("flex:1;height:72px;border-radius:24px;font-family:inherit;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;" + (i === 2 && !pkg0 ? "opacity:0.45;" : "") +
      (st.m === i ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 4px 12px rgba(123,70,135,0.06)")) }));
  const press = (k: string) => { let r = st.recv;
    if (k === "del") r = r.slice(0, -1); else if (r.length < 9) r = (r === "0" ? "" : r) + k;
    setSt({ ...st, recv: r }); };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "del"].map((k) => ({ k: k === "del" ? "⌫" : k, aria: k === "del" ? "حذف" : k, press: () => press(k) }));
  const round = (v: number, step: number) => Math.ceil(v / step) * step;
  const quickVals = [...new Set([TOTAL, round(TOTAL, 5000), round(TOTAL, 10000)])].filter((v) => v > 0);
  const quick = quickVals.map((v) => ({ label: n(v), set: () => setSt({ ...st, recv: String(v) }),
    style: css("height:56px;border-radius:28px;font-family:var(--font-rubik),sans-serif;font-size:17px;font-weight:500;" +
      (Number(st.recv) === v ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#7B4687;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }));
  const r = Number(st.recv || 0), diff = r - TOTAL;
  const cash = st.m === 0, card = st.m === 1, pkg = st.m === 2;
  const recv = n(r), changeLabel = diff >= 0 ? "الباقي للمراجعة" : "المبلغ ناقص", change = n(Math.abs(diff)) + " ل.س";
  const changeStyle = css("font-size:30px;font-weight:700;font-family:var(--font-rubik),sans-serif;line-height:1.3;color:" + (diff >= 0 ? "#2E7D50" : "#B03D6A"));
  const dueTxt = st.m === 2 ? "0" : n(TOTAL), dueNote = st.m === 2 ? "تُخصم من الباقة" : code ? `كود ${code.code}` : "بدون خصم";
  const canIssue = !!A && !busy && !(code && DISC <= 0) && (cash ? r >= TOTAL : card ? true : !!pkg0);
  const issue = async () => {
    if (!A) return;
    setBusy(true); setErr(null);
    try {
      const inv = await createInvoice({
        patientId: A.patient_id, appointmentId: A.id, walkInName: A.patient_id ? null : A.walk_in_name,
        // the price comes from the appointment on the server; with a package the server makes this line 0
        lines: line,
        discount: 0,
        offerCode: code?.code ?? null,
        payments: pkg ? [{ method: "package", amount: 0 }] : [{ method: cash ? "cash" : "card", amount: TOTAL }],
        patientPackageId: pkg ? pkg0?.id : null,
      });
      if (!inv) throw new Error("no invoice");
      // the invoice exists now: a failed re-read must not look like a failed issue
      const full: InvoiceRow = (await getInvoice(inv.id).catch(() => null)) ?? ({ ...inv, patients: A.patients ? { name: A.patients.name, file_no: A.patients.file_no, phone: A.patients.phone } : null, invoice_items: [], invoice_payments: [], appointments: null } as unknown as InvoiceRow);
      const d: Done = { inv: full, extras: { staff: k.staff?.name ?? null, received: cash ? r : null, change: cash ? Math.max(0, diff) : null } };
      setDone(d);
      setSelId(null); setSt({ m: 0, recv: "" }); setOffer(null);
      if (print) receipt.print(d.inv, d.extras);
    } catch (e) { setErr(financeError(e)); }
    setBusy(false);
  };
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>

      <KioskNav active={R.T_Cashier} />
      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div className={KC.hdr} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div className={KC.title} style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>الكاشير
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>{due.length ? `${due.length} بانتظار الدفع` : "لا جلسات بانتظار الدفع"} · {doneCount} جلسات انتهت اليوم
            </div>
          </div>
          <DatePill />
        </div>
        {due.length > 1 && (
          <div className={KC.wrap} style={{ display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
            {due.map((a) => (
              <button key={a.id} type="button" onClick={() => { setSelId(a.id); setDone(null); setOffer(null); }} style={css("height:44px;padding:0 16px;border-radius:22px;font-size:14px;font-weight:600;font-family:inherit;white-space:nowrap;" + (a.id === A?.id ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D"))}>
                {nameOf(a)} · {clock(a.starts_at)}
              </button>
            ))}
          </div>
        )}
        {done && (() => {
          const href = waHref(done.inv, done.inv.patients?.phone, done.extras);
          return (
            <div role="status" className={KC.wrap} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 10px 18px", borderRadius: 22, background: "#E6F4EC", color: "#2E7D50", fontWeight: 700, fontSize: 16, flexWrap: "wrap" }}>
              <span style={{ flex: "1 1 180px" }}>تم إصدار الفاتورة {done.inv.no} — {customerName(done.inv)} · {money(done.inv.total)}</span>
              <button type="button" onClick={() => receipt.print(done.inv, done.extras)} style={doneBtn}>طباعة الفاتورة</button>
              {href
                ? <a href={href} target="_blank" rel="noopener noreferrer" style={doneBtn}>إرسال على واتساب</a>
                : <span aria-disabled="true" title="لا يوجد رقم هاتف للمراجِعة" style={{ ...doneBtn, opacity: 0.45, cursor: "not-allowed" }}>إرسال على واتساب</span>}
              <button type="button" onClick={() => setDone(null)} aria-label="إغلاق" style={{ ...doneBtn, width: 40, padding: 0, justifyContent: "center" }}>×</button>
            </div>
          );
        })()}
        {err && <ErrorNote>{err}</ErrorNote>}
        {q.error && <ErrorNote>{q.error}</ErrorNote>}
        {(q.loading || !A) ? (
          <div style={{ flexGrow: 1, borderRadius: 30, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 40 }}>
            {q.loading ? <Loading /> : <>
              <div style={{ fontSize: 24, fontWeight: 700 }}>لا جلسات بانتظار الدفع</div>
              <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.7, maxWidth: 520 }}>تظهر هنا جلسات اليوم بعد انتهائها (أو أثناءها) لإصدار فاتورتها. أنهي الجلسة من شاشة الاستقبال أولاً.</div>
              <Link href={R.T_Desk} style={{ color: C.accent, fontWeight: 700, fontSize: 17 }}>شاشة الاستقبال</Link>
            </>}
          </div>
        ) : (
        <div className={KC.cols} style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: "0" }}>
          <div className={KC.lcol} style={{ width: 420, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "20px 22px 6px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14 }}>
                <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, color: C.accent }}>{initials(nameOf(A))}
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 19, fontWeight: 700 }}>{nameOf(A)}
                  </div>
                  <div style={{ fontSize: 14, color: C.sub2 }}>{A.patients ? `ملف ${A.patients.file_no} · ` : ""}{clock(A.starts_at)}
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>{STATUS[A.status] ?? A.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" />
                  </svg>
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{A.services?.name ?? A.service_key}
                  </div>
                  <div style={{ fontSize: 13, color: C.sub2 }}>{[A.staff?.name, A.rooms?.name, `${A.minutes} دقيقة`].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>{money(PRICE)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderTop: "1px solid #EDE2F1", fontSize: 16 }}>
                <span style={{ color: C.sub }}>المجموع
                </span>
                <span style={{ fontWeight: 700 }}>{money(PRICE)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderTop: "1px solid #EDE2F1", fontSize: 16 }}>
                <span style={{ color: C.sub }}>{code ? `خصم (كود ${code.code})` : "الخصم"}
                </span>
                <span style={{ fontWeight: 700, color: code ? "#2E7D50" : undefined }}>{pkg ? "رصيد باقة" : code ? `− ${money(DISC)}` : "لا يوجد"}
                </span>
              </div>
              {!pkg && <div style={{ padding: "4px 0 14px" }}><OfferCodeField big lines={line} offer={offer} onChange={setOffer} /></div>}
            </div>
            <div style={{ backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", borderRadius: 30, padding: "20px 26px", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
              <svg width="220" height="220" viewBox="0 0 160 160" style={{ position: "absolute", top: -60, left: -60 }}>
                <circle cx="80" cy="80" r="78" fill="none" stroke="#7C5485" strokeWidth="1" />
                <circle cx="80" cy="80" r="56" fill="none" stroke="#7C5485" strokeWidth="1" />
              </svg>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 15, color: C.onDark }}>المطلوب دفعه
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className={KC.dueNo} style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>{dueTxt}
                    </span>
                    <span style={{ fontSize: 18, color: C.onDark }}>ل.س
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: C.onDark, paddingBottom: 10 }}>{dueNote}
                </div>
              </div>
            </div>
            <div className={KC.opts} style={{ borderRadius: 26, padding: "6px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, fontSize: 16, fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2M17 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4M7 13h10v8H7z" />
                    </svg>
                  </span>طباعة إيصال ورقي
                </span>
                <Toggle on={print} onChange={setPrint} label="طباعة إيصال ورقي" />
              </div>
            </div>
            <button type="button" className={KC.issue} onClick={issue} disabled={!canIssue} style={{ opacity: canIssue ? 1 : 0.55, fontFamily: "inherit", marginTop: "auto", height: 64, borderRadius: 32, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2M9 7h6M9 11h6M13 15h2" />
              </svg>{busy ? "جارٍ الإصدار…" : "إصدار الفاتورة"}
            </button>
          </div>
          <div className={KC.rcol} style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>طريقة الدفع
            </div>
            <div className={KC.methods} style={{ display: "flex", gap: 12 }}>
              <button type="button" aria-pressed={st.m === 0} onClick={methods[0].pick} style={methods[0].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" />
                </svg>نقداً
              </button>
              <button type="button" aria-pressed={st.m === 1} onClick={methods[1].pick} style={methods[1].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M7 15h2" />
                </svg>بطاقة
              </button>
              <button type="button" aria-pressed={st.m === 2} onClick={methods[2].pick} style={methods[2].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                </svg>من الباقة
              </button>
            </div>
            {cash && (<>
              <div className={KC.cashRow} style={{ display: "flex", gap: 16, flexGrow: 1, minHeight: "0" }}>
                <div style={{ width: 250, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ borderRadius: 26, padding: "14px 18px", background: C.white, border: "1.5px solid #E3CEE8", boxShadow: "0 0 0 5px rgba(222,190,229,0.22)" }}>
                    <div style={{ fontSize: 14, color: C.sub2 }}>المبلغ المستلم
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, lineHeight: 1.3 }}>{recv}
                      </span>
                      <span style={{ fontSize: 15, color: C.sub2 }}>ل.س
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: C.sub2, padding: "0 6px" }}>مبالغ سريعة
                  </div>
                  {quick.map((q, qI) => (
                    <Fragment key={qI}>
                      <button type="button" onClick={q.set} style={q.style}>{q.label}
                      </button>
                    </Fragment>
                  ))}
                  <div style={{ marginTop: "auto", borderRadius: 26, padding: "12px 18px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
                    <div style={{ fontSize: 14, color: C.sub2 }}>{changeLabel}
                    </div>
                    <div style={changeStyle}>{change}
                    </div>
                  </div>
                </div>
                <div dir="ltr" className={KC.keypad} style={{ flex: 1, minWidth: "0", borderRadius: 30, padding: 16, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "1fr", gap: 10 }}>
                  {keys.map((k, kI) => (
                    <Fragment key={kI}>
                      <button type="button" onClick={k.press} aria-label={k.aria} style={{ borderRadius: 20, border: "1px solid #F0E6F3", background: "linear-gradient(180deg,#FFFFFF,#FAF4FB)", boxShadow: "0 4px 10px rgba(123,70,135,0.06), inset 0 1px 0 #FFFFFF", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 25, fontWeight: 500, color: C.ink, minHeight: 56 }}>{k.k}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>)}
            {card && (<>
              <div style={{ flexGrow: 1, borderRadius: 30, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 40px" }}>
                <span style={{ width: 116, height: 116, borderRadius: 58, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(150,100,170,0.25), inset 0 1px 0 #FFFFFF" }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M7 15h2" />
                  </svg>
                </span>
                <div style={{ fontSize: 24, fontWeight: 700 }}>مرّري البطاقة على جهاز الدفع
                </div>
                <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6 }}>المبلغ{" "}
                  <b style={{ color: C.accent }}>{money(TOTAL)}
                  </b>{" "}— بعد نجاح العملية اضغطي «إصدار الفاتورة».
                </div>
              </div>
            </>)}
            {pkg && (<>
              <div style={{ flexGrow: 1, borderRadius: 30, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 40px" }}>
                <span style={{ width: 116, height: 116, borderRadius: 58, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(150,100,170,0.25), inset 0 1px 0 #FFFFFF" }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                  </svg>
                </span>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{pkg0 ? "تُخصم جلسة واحدة من باقتها" : "لا توجد باقة فعّالة لهذه الخدمة"}
                </div>
                <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6 }}>{pkg0 ? `${pkg0.packages?.name ?? "الباقة"} — متبقٍ ${pkg0.sessions_total - pkg0.sessions_used} من ${pkg0.sessions_total} جلسات. لا يُطلب أي مبلغ اليوم.` : "اختاري الدفع نقداً أو بالبطاقة."}
                </div>
              </div>
            </>)}
          </div>
        </div>
        )}
      </div>
      {receipt.node}

    </Stage>
  );
}

