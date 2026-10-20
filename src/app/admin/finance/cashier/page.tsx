"use client";

/**
 * W_Cashier.dc.html — الكاشير (live, Supabase).
 * Pick a finished / in-session / checked-in appointment of today, a patient file, or a walk-in buyer;
 * add services, retail products (stock is deducted) and packages; discount (policy limit from settings);
 * pay by cash / card / split / package session / deferred. Everything is issued by the `create_invoice` rpc.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, NumberInput, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import {
  createInvoice, financeError, getInvoice, getOpenShift, getPolicies, listCashierQueue, listInvoices, listPatientPackages, listSellables, searchPatients,
  customerName, type CartLine, type CashierAppt, type InvoiceRow, type PayMethod,
} from "@/lib/db/finance";
import { initials } from "@/lib/data";
import { arDate, clock, dayRange, money } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, ICON_FILL, SELECTED, SH, SH_SOFT, SHB } from "@/lib/tokens";
import { Amount, LATIN, OFF, PANEL, Receipt } from "../parts";
import { locLabel, useLocations } from "../../inventory/dialogs";
import { qtyAt } from "@/lib/db/products";
import css from "../finance.module.css";

type Who =
  | { type: "appt"; appt: CashierAppt }
  | { type: "patient"; id: string; name: string; file_no: number; phone: string | null }
  | { type: "walkin"; name: string };
type Mode = "cash" | "card" | "split" | "package" | "deferred";

const MODES: { k: Mode; label: string }[] = [
  { k: "cash", label: "نقدي" }, { k: "card", label: "بطاقة" }, { k: "split", label: "نقدي + بطاقة" },
  { k: "package", label: "رصيد باقة" }, { k: "deferred", label: "آجل / قسط" },
];
const PCTS = [0, 5, 10, 15, 20];
const STATUS_AR: Record<string, string> = { done: "انتهت", in_session: "في الجلسة", checked_in: "حضرت" };

const avatar = (size: number): CSSProperties => ({ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700, color: C.accent });

export default function Page() {
  const { staff } = useSession();
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";
  const today = dayRange();
  const queue = useQuery(["queue", "cashier"], listCashierQueue);
  const shift = useQuery(["finance", "shift", "open"], getOpenShift);
  const policies = useQuery(["finance", "policies"], getPolicies);
  const sellables = useQuery(["finance", "sellables"], listSellables);
  const todays = useQuery(["invoices", "today", today.from], () => listInvoices(today.from, today.to));

  const [who, setWho] = useState<Who | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [pct, setPct] = useState(0);
  const [discMode, setDiscMode] = useState<"pct" | "amt">("pct");
  const [discAmt, setDiscAmt] = useState("");
  const [mode, setMode] = useState<Mode>("cash");
  const [splitCash, setSplitCash] = useState("");
  const [paidNow, setPaidNow] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [issued, setIssued] = useState<InvoiceRow | null>(null);

  const patientId = who?.type === "appt" ? who.appt.patient_id : who?.type === "patient" ? who.id : null;
  const pkgs = useQuery(["patients", "packages", patientId], () => listPatientPackages(patientId as string), { enabled: !!patientId });
  const usable = (pkgs.data ?? []).filter((p) => p.sessions_used < p.sessions_total);

  // stock location the products are sold from — the selector shows only when there are several locations
  const L = useLocations();
  const [saleLocSel, setSaleLocSel] = useState("");
  const saleLoc = (saleLocSel && L.active.some((l) => l.id === saleLocSel) ? saleLocSel : L.def?.id) ?? "";
  const stockOf = (key?: string) => {
    const p = sellables.data?.products.find((x) => x.key === key);
    if (!p) return 0;
    return L.multi && saleLoc ? qtyAt(L.map, p, saleLoc) : Number(p.stock);
  };
  const reset = (w: Who | null, l: CartLine[] = []) => {
    setWho(w); setLines(l); setPct(0); setDiscMode("pct"); setDiscAmt(""); setMode("cash"); setSplitCash(""); setPaidNow(""); setDueOn(""); setPkgId(null); setNote(""); setErr(null); setIssued(null);
  };
  const pickAppt = (a: CashierAppt) => reset({ type: "appt", appt: a }, [{ kind: "service", ref: a.service_key, qty: 1, label: a.services?.name ?? "جلسة", unit_price: a.price || sellables.data?.services.find((x) => x.key === a.service_key)?.price || 0 }]);

  // the package covers one session of its service → that line is free
  const pkg = usable.find((p) => p.id === pkgId) ?? null;
  const coveredIdx = mode === "package" && pkg ? lines.findIndex((l) => l.kind === "service" && l.ref === pkg.packages?.service_key) : -1;
  const priced = lines.map((l, i) => (i === coveredIdx ? { ...l, unit_price: 0, qty: 1 } : l));
  const sub = priced.reduce((s, l) => s + l.qty * l.unit_price, 0);
  // discount: a % button or a fixed amount; the server allows up to round(subtotal × policy %) without approval
  const dAmt = discMode === "pct" ? Math.round((sub * pct) / 100) : Math.min(sub, Math.max(0, Math.round(Number(discAmt) || 0)));
  const dPct = sub ? Math.round((dAmt / sub) * 1000) / 10 : 0;
  const total = sub - dAmt;
  const maxPct = policies.data?.maxDiscount ?? 0;
  const needApproval = dAmt > Math.round((sub * maxPct) / 100);
  const blockedByApproval = needApproval && !isAdmin;

  const payments = useMemo((): { method: PayMethod; amount: number }[] => {
    if (mode === "cash" || mode === "card") return [{ method: mode, amount: total }];
    if (mode === "split") { const c = Math.min(total, Number(splitCash) || 0); return [{ method: "cash", amount: c }, { method: "card", amount: total - c }]; }
    if (mode === "package") return [{ method: "package", amount: 0 }, { method: "cash", amount: total }];
    // deferred: paid now in cash, the rest stays receivable
    return [{ method: "cash", amount: Math.min(total, Number(paidNow) || 0) }];
  }, [mode, total, splitCash, paidNow]);

  const problems: string[] = [];
  if (!who) problems.push("اختاري موعداً أو مراجعة");
  if (!lines.length) problems.push("أضيفي بنداً");
  if (lines.some((l) => l.kind === "product" && l.qty > stockOf(l.ref))) problems.push(L.multi ? "كمية منتج لا تكفي في موقع الصرف المختار" : "كمية منتج لا تكفي في المخزون");
  if (mode === "package" && (!pkg || coveredIdx < 0)) problems.push(pkg ? "الباقة لا تشمل أي خدمة في الفاتورة" : "اختاري باقة");
  if (mode === "deferred" && !patientId) problems.push("الدفع الآجل يحتاج ملف مراجعة");
  if (lines.some((l) => l.kind === "package") && !patientId) problems.push("بيع باقة يحتاج ملف مراجعة");
  if (blockedByApproval) problems.push("الخصم يحتاج موافقة الإدارة");
  if (discMode === "amt" && Number(discAmt) > sub) problems.push("الخصم أكبر من المجموع");
  if (mode === "split" && (Number(splitCash) || 0) > total) problems.push("المبلغ النقدي أكبر من المطلوب");
  if (mode === "deferred" && (Number(paidNow) || 0) > total) problems.push("المدفوع أكبر من المطلوب");
  if (!shift.loading && !shift.data && payments.some((p) => p.method === "cash" && p.amount > 0)) problems.push("الصندوق مغلق — افتحي وردية من «الصندوق اليومي» أو اختاري البطاقة");

  const issue = async () => {
    if (!who || problems.length || busy) return;
    setBusy(true); setErr(null);
    try {
      const inv = await createInvoice({
        patientId, appointmentId: who.type === "appt" ? who.appt.id : null, walkInName: who.type === "walkin" ? who.name : null,
        lines: priced, discount: dAmt, payments, patientPackageId: mode === "package" ? pkgId : null, note, dueOn: mode === "deferred" && dueOn ? dueOn : null,
        location: L.multi && saleLoc ? saleLoc : null,
      });
      // the invoice exists now: never let a failed re-read look like a failed issue (it could be issued twice)
      if (inv) setIssued(await getInvoice(inv.id).catch(() => ({ ...inv, patients: null, invoice_items: [], invoice_payments: [], appointments: null }) as InvoiceRow));
    } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };

  const ready = (queue.data ?? []).filter((a) => a.status === "done" && !a.invoiced);
  const inSession = (queue.data ?? []).filter((a) => a.status !== "done" && !a.invoiced);
  const todayList = (todays.data ?? []).filter((i) => !i.void);
  const prev = todayList[0];
  const whoName = who ? (who.type === "appt" ? customerName({ patients: who.appt.patients, walk_in_name: who.appt.walk_in_name }) : who.name) : "";
  const whoPhone = who?.type === "appt" ? who.appt.patients?.phone : who?.type === "patient" ? who.phone : null;
  const nowLabel = `${arDate(new Date())} · ${clock()}`;
  const shiftLabel = shift.data ? `الصندوق مفتوح منذ ${clock(shift.data.opened_at)}` : "الصندوق مغلق — افتحيه قبل قبض النقد";

  return (
    <AdminShell active="المالية" title="الكاشير" subtitle={`${nowLabel} · ${shiftLabel}`} actions={
      <Link href={R.W_CashBox} style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
        <Icon name="cash" color={C.accent} size={17} stroke={1.9} />الصندوق اليومي
      </Link>}>
      <div className={css.cashier}>
        {/* ---------- left: who pays ---------- */}
        <div className={css.cWho} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>جلسات بانتظار الدفع</div>
            {!!ready.length && <span style={{ height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#FBEAF1", color: C.danger, display: "inline-flex", alignItems: "center" }}>{ready.length} جاهزة</span>}
          </div>
          {queue.loading ? <Loading /> : queue.error ? <ErrorNote>{queue.error}</ErrorNote> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ready.map((a) => <ApptRow key={a.id} a={a} on={who?.type === "appt" && who.appt.id === a.id} onClick={() => pickAppt(a)} />)}
              {!ready.length && <div style={{ fontSize: 12.5, color: C.muted, padding: "6px 4px" }}>لا جلسات منتهية بلا فاتورة الآن.</div>}
              {!!inSession.length && <div style={{ fontSize: 12, fontWeight: 700, color: C.sub2, padding: "4px 4px 0" }}>في المركز الآن</div>}
              {inSession.map((a) => <ApptRow key={a.id} a={a} on={who?.type === "appt" && who.appt.id === a.id} onClick={() => pickAppt(a)} />)}
              <div style={{ fontSize: 12, color: C.muted, padding: "2px 4px" }}>تظهر الجلسة هنا تلقائياً عند انتهائها.</div>
            </div>
          )}
          <div style={{ height: 1, background: C.line }} />
          <PatientPicker onPick={(p) => reset(p.type === "patient" ? p : p)} />
          <div style={{ marginTop: "auto", borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: C.sub2 }}>
            <span>صدرت اليوم {todayList.length} فاتورة</span>
            <Link href={R.W_Invoices} style={{ color: C.accentMid, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>كل الفواتير <Icon name="chev" color={C.accentMid} size={15} /></Link>
          </div>
        </div>

        {/* ---------- middle: invoice ---------- */}
        <div className={css.cBill} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
          {!who ? (
            <EmptyState icon="receipt" title="اختاري من ستدفع" style={{ boxShadow: "none", border: "none", margin: "auto" }}
              text="اختاري جلسة منتهية من القائمة، أو ابحثي عن ملف مراجعة، أو سجّلي بيعاً لزبونة بلا ملف. تُضاف الخدمة تلقائياً ويمكنكِ إضافة منتجات وباقات." />
          ) : (<>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={avatar(54)}>{initials(whoName) || <Icon name="user" size={22} />}</span>
              <div style={{ flex: 1, lineHeight: 1.5, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{whoName}</div>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>
                  {who.type === "appt" ? <>
                    {who.appt.patients?.file_no ? <>ملف <span dir="ltr" style={LATIN}>{who.appt.patients.file_no}</span> · </> : "بدون ملف · "}
                    {[who.appt.rooms?.name, who.appt.staff?.name].filter(Boolean).join(" · ") || "—"}
                  </> : who.type === "patient" ? <>ملف <span dir="ltr" style={LATIN}>{who.file_no}</span>{who.phone ? <> · <span dir="ltr" style={LATIN}>{who.phone}</span></> : null}</> : "بيع مباشر بدون ملف"}
                </div>
              </div>
              <button type="button" onClick={() => reset(null)} aria-label="إلغاء الاختيار" style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" color={C.sub2} size={16} /></button>
            </div>
            <div style={{ height: 1, background: C.line }} />

            <div>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: C.sub2, padding: "0 4px 6px", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ flex: 3 }}>البند</div><div style={{ flex: 1.2, textAlign: "center" }}>الكمية</div><div style={{ flex: 1.3, textAlign: "left" }}>السعر</div><div style={{ width: 30 }} />
              </div>
              {priced.length === 0 && <div style={{ padding: "16px 4px", fontSize: 13, color: C.muted }}>لا بنود بعد — أضيفي خدمة أو منتجاً.</div>}
              {priced.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 4px", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 3, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={l.kind === "product" ? "bottle" : l.kind === "package" ? "gift" : "sparkle"} color={C.accentMid} size={16} />
                    </span>
                    <div style={{ lineHeight: 1.4, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{l.label}</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>{i === coveredIdx ? "مشمولة بالباقة" : l.kind === "product" ? "منتج — يُخصم من المخزون" : l.kind === "package" ? "باقة جديدة تُضاف لملف المراجعة" : "خدمة"}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1.2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {l.kind === "service" ? <span style={LATIN}>{l.qty}</span> : <>
                      <QtyBtn icon="minus" onClick={() => setLines(lines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))} />
                      <span style={{ ...LATIN, minWidth: 18, textAlign: "center" }}>{l.qty}</span>
                      <QtyBtn icon="plus" disabled={l.kind === "product" && l.qty >= stockOf(l.ref)} onClick={() => setLines(lines.map((x, j) => (j === i ? { ...x, qty: x.qty + 1 } : x)))} />
                    </>}
                  </div>
                  <div style={{ flex: 1.3, textAlign: "left" }}><Amount n={l.qty * l.unit_price} /></div>
                  <button type="button" aria-label="حذف البند" onClick={() => setLines(lines.filter((_, j) => j !== i))} style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" color={C.muted} size={15} /></button>
                </div>
              ))}
            </div>
            {L.multi && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13, fontWeight: 600, color: C.sub }}>
                <Icon name="map" color={C.accentMid} size={16} />تُصرف المنتجات من
                <select aria-label="موقع صرف المنتجات" value={saleLoc} onChange={(e) => setSaleLocSel(e.target.value)}
                  style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: "inherit", maxWidth: "100%" }}>
                  {L.active.map((l) => <option key={l.id} value={l.id}>{locLabel(l)}</option>)}
                </select>
                {lines.some((l) => l.kind === "product" && l.qty > stockOf(l.ref)) && <span style={{ color: C.danger, fontSize: 12 }}>الكمية في هذا الموقع لا تكفي</span>}
              </label>
            )}
            <ItemSearch sellables={sellables.data} stockOf={stockOf} onAdd={(l) => {
              const j = lines.findIndex((x) => x.kind === l.kind && x.ref === l.ref && l.kind !== "service");
              if (j >= 0 && l.kind === "product" && lines[j].qty >= stockOf(l.ref)) { setErr("لا توجد كمية إضافية من هذا المنتج في المخزون."); return; }
              setLines(j >= 0 ? lines.map((x, k) => (k === j ? { ...x, qty: x.qty + 1 } : x)) : [...lines, l]);
            }} />

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>الخصم</div>
                <span style={{ fontSize: 12, color: C.sub2 }}>بدون موافقة حتى {maxPct}%</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {PCTS.map((p) => <button key={p} type="button" onClick={() => { setDiscMode("pct"); setPct(p); }} style={{ height: 38, padding: "0 16px", borderRadius: 19, fontSize: 13, fontWeight: 600, ...(discMode === "pct" && pct === p ? SELECTED : OFF) }}>{p === 0 ? "بدون خصم" : `${p}%`}</button>)}
                <button type="button" onClick={() => setDiscMode("amt")} style={{ height: 38, padding: "0 16px", borderRadius: 19, fontSize: 13, fontWeight: 600, ...(discMode === "amt" ? SELECTED : OFF) }}>مبلغ محدد</button>
              </div>
              {discMode === "amt" && <NumberInput label="قيمة الخصم" value={discAmt} onChange={setDiscAmt} suffix="ل.س" style={{ marginTop: 10 }} hint={sub ? `= ${dPct}% من المجموع · بدون موافقة حتى ${money(Math.round((sub * maxPct) / 100))}` : undefined} />}
              {needApproval ? (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, borderRadius: 16, padding: "10px 12px", background: "#FCF1DE", color: "#7A4F10", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="lock" color="#B07A1E" size={18} />
                  <span style={{ flex: 1 }}>{isAdmin ? `خصم فوق ${maxPct}% — يُسجَّل باسمكِ كموافقة إدارة.` : `الخصم فوق ${maxPct}% يحتاج موافقة الإدارة — اطلبي من حساب إدارة إصدار الفاتورة.`}</span>
                </div>
              ) : (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", background: C.tint, color: "#74457F", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="info" color={C.accentMid} size={17} /><span>حتى {maxPct}% يُطبَّق مباشرة. الحد يُضبط من إعدادات السياسات.</span>
                </div>
              )}
            </div>
            <div style={{ height: 1, background: C.line }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>طريقة الدفع</div>
              <div className={css.modes}>
                {MODES.map((m) => {
                  const on = mode === m.k;
                  const dis = m.k === "package" ? !usable.length : m.k === "deferred" ? !patientId : false;
                  return (
                    <button key={m.k} type="button" disabled={dis} onClick={() => setMode(m.k)} style={{ height: 46, borderRadius: 23, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, color: C.ink, opacity: dis ? 0.45 : 1, ...(on ? SELECTED : OFF) }}>
                      <span style={{ width: 14, height: 14, borderRadius: 7, flexShrink: 0, ...(on ? { background: C.accent, border: "3px solid #F1E3F6", boxShadow: "0 0 0 1.5px #7B4687" } : { border: "1.5px solid #D1C0D5", background: C.white }) }} />
                      <span style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              {mode === "split" && <NumberInput label="المبلغ النقدي (الباقي بالبطاقة)" value={splitCash} onChange={setSplitCash} suffix="ل.س" hint={`بالبطاقة: ${money(Math.max(0, total - (Number(splitCash) || 0)))}`} />}
              {mode === "package" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {usable.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPkgId(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 18, padding: "10px 14px", textAlign: "right", ...(pkgId === p.id ? SELECTED : OFF), color: C.ink }}>
                      <Icon name="gift" color={C.accentMid} size={18} />
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 13.5 }}>{p.packages?.name ?? "باقة"}</span>
                      <span style={{ fontSize: 12.5, color: C.sub2 }}>متبقٍ {p.sessions_total - p.sessions_used} من {p.sessions_total}</span>
                    </button>
                  ))}
                  <div style={{ fontSize: 12, color: C.sub2 }}>تُخصم جلسة واحدة من الباقة، وأي منتجات إضافية تُدفع نقداً.</div>
                </div>
              )}
              {mode === "deferred" && (
                <div className={css.pair}>
                  <NumberInput label="المدفوع الآن (نقداً)" value={paidNow} onChange={setPaidNow} suffix="ل.س" style={{ flex: 1 }} hint={`المتبقي ذمة: ${money(Math.max(0, total - (Number(paidNow) || 0)))}`} />
                  <TextInput label="تاريخ الاستحقاق" type="date" dir="ltr" value={dueOn} onChange={setDueOn} style={{ flex: 1 }} />
                </div>
              )}
              {mode !== "split" && mode !== "package" && mode !== "deferred" && <div style={{ fontSize: 12, color: C.sub2 }}>اختاري طريقة واحدة أو قسّمي المبلغ بين النقدي والبطاقة.</div>}
            </div>

            <label style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.sub2 }}>
              ملاحظة على الفاتورة (اختياري)
              <textarea aria-label="ملاحظة على الفاتورة" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="تظهر في نسخة المراجعة" style={{ borderRadius: 16, border: "1px solid #E7D9EB", background: "#FEFCFE", padding: "10px 12px", fontSize: 13, color: C.ink, resize: "none", outline: "none" }} />
            </label>
            {staff && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.sub2 }}><Icon name="shield" color={C.accentMid} size={16} /><span>تُسجَّل باسم {staff.name} وتظهر في الصندوق اليومي.</span></div>}
          </>)}
        </div>

        {/* ---------- right: totals ---------- */}
        <div className={css.cSum} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <Row dark label="المجموع الفرعي" value={`${money(sub, false)} ل.س`} />
            <Row dark label={`الخصم (${dPct}%)`} value={`− ${money(dAmt, false)} ل.س`} />
            {mode === "deferred" && <Row dark label="يبقى ذمة" value={`${money(Math.max(0, total - (Number(paidNow) || 0)), false)} ل.س`} />}
            <div style={{ position: "relative", height: 1, background: "rgba(255,255,255,0.18)", margin: "12px 0" }} />
            <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>المطلوب</div>
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ ...LATIN, fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{money(total, false)}</span><span style={{ fontSize: 15 }}>ل.س</span>
            </div>
          </div>

          <div style={{ ...PANEL, padding: "16px 18px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>ملخص الفاتورة</div>
            <SumRow label="رقم الفاتورة" value={issued ? <span dir="ltr" style={LATIN}>{issued.no}</span> : <span style={{ color: C.muted }}>يُولَّد عند الإصدار</span>} />
            <SumRow label="التاريخ" value={nowLabel} />
            <SumRow label="البنود" value={priced.length ? `${priced.reduce((s, l) => s + l.qty, 0)} بند` : "—"} />
            {who?.type === "appt" && <SumRow label="الأخصائية" value={who.appt.staff?.name ?? "—"} />}
            <SumRow label="طريقة الدفع" value={MODES.find((m) => m.k === mode)?.label} />
            <SumRow label="الخصم" value={dAmt ? `${money(dAmt)} (${dPct}%)` : "—"} />
          </div>

          {prev && (
            <div style={{ borderRadius: 22, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="receipt" color={C.accentMid} size={16} /></span>
              <div style={{ flex: 1, lineHeight: 1.45, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.sub2 }}>آخر فاتورة · <span dir="ltr" style={LATIN}>{prev.no}</span> · {clock(prev.created_at)}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{customerName(prev)}</div>
              </div>
              <Amount n={prev.total} size={13} />
            </div>
          )}

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {issued && <Receipt inv={issued} issuer={staff?.name} />}
            {err && <ErrorNote>{err}</ErrorNote>}
            {issued ? (
              <div style={{ borderRadius: 18, padding: "12px 14px", background: "#E6F4EC", color: C.okDeep, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" color={C.okDeep} size={18} />صدرت الفاتورة <span dir="ltr" style={LATIN}>{issued.no}</span>
              </div>
            ) : who && problems.length ? <div style={{ fontSize: 12.5, color: C.sub2, textAlign: "center" }}>{problems[0]}</div> : null}
            {issued ? (
              <button type="button" onClick={() => reset(null)} style={{ height: 58, borderRadius: 29, border: "none", backgroundColor: C.accent, boxShadow: "0 16px 34px rgba(123,70,135,0.32)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="plus" color={C.white} size={19} />فاتورة جديدة
              </button>
            ) : (
              <button type="button" onClick={issue} disabled={!who || !!problems.length || busy} style={{ height: 58, borderRadius: 29, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: !who || problems.length || busy ? 0.55 : 1 }}>
                <Icon name="receipt" color={C.white} size={19} />{busy ? "جارٍ الإصدار…" : blockedByApproval ? "بانتظار موافقة الإدارة" : "إصدار الفاتورة"}
              </button>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" disabled={!issued} onClick={() => window.print()} style={{ ...ghost, flex: 1, opacity: issued ? 1 : 0.5 }}><Icon name="print" color={C.accent} size={17} stroke={1.9} />طباعة</button>
              <button type="button" disabled={!issued || !whoPhone} onClick={() => issued && whoPhone && window.open(`https://wa.me/${whoPhone.replace(/\D/g, "").replace(/^0/, "963")}?text=${encodeURIComponent(`فاتورة ${issued.no} — المبلغ ${money(issued.total)}. شكراً لزيارتكِ Fatema Beauty.`)}`, "_blank")}
                style={{ ...ghost, flex: 1, opacity: issued && whoPhone ? 1 : 0.5 }}><Icon name="send" color={C.accent} size={17} stroke={1.9} />إرسال واتساب</button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

const ghost: CSSProperties = { height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" };

function Row({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontSize: 13, color: dark ? C.onDark : C.sub2, marginTop: 6 }}><span>{label}</span><span style={LATIN}>{value}</span></div>;
}
function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: `1px solid ${C.line}`, fontSize: 13 }}><span style={{ color: C.sub2 }}>{label}</span><span style={{ fontWeight: 700 }}>{value}</span></div>;
}
function QtyBtn({ icon, onClick, disabled }: { icon: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} style={{ opacity: disabled ? 0.4 : 1, width: 26, height: 26, borderRadius: 13, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} color={C.accent} size={13} stroke={2.2} /></button>;
}

function ApptRow({ a, on, onClick }: { a: CashierAppt; on: boolean; onClick: () => void }) {
  const name = customerName({ patients: a.patients, walk_in_name: a.walk_in_name });
  const done = a.status === "done";
  return (
    <button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 20, padding: done ? 12 : "10px 12px", textAlign: "right", color: on ? C.accent : C.ink,
      ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)" } : { background: C.white, border: "1px solid #EDE2F1" }) }}>
      <span style={avatar(done ? 42 : 38)}>{initials(name)}</span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
        <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>{a.services?.name ?? "—"} · {done && a.finished_at ? <>انتهت <span dir="ltr" style={LATIN}>{clock(a.finished_at)}</span></> : STATUS_AR[a.status]}</div>
      </div>
      {done && <span style={{ height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: C.accent, color: C.white, display: "inline-flex", alignItems: "center" }}>جاهزة</span>}
    </button>
  );
}

/** Search a patient file (name / file no. / phone) or start a walk-in sale. */
function PatientPicker({ onPick }: { onPick: (w: Who) => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t); }, [q]);
  const res = useQuery(["patients", "search", debounced], () => searchPatients(debounced), { enabled: debounced.trim().length > 0 });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.sub2, padding: "0 4px" }}>بيع أو دفع بدون موعد</div>
      <label style={{ height: 42, borderRadius: 21, border: "1.5px dashed #DFCBE3", background: "#FEFCFE", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
        <Icon name="search" color={C.muted} size={16} />
        <input aria-label="بحث عن ملف للدفع" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم، رقم ملف أو هاتف" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13, color: C.ink, minWidth: 0 }} />
      </label>
      {debounced.trim() && (res.loading ? <Loading style={{ padding: 8 }} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {(res.data ?? []).map((p) => (
            <button key={p.id} type="button" onClick={() => { onPick({ type: "patient", id: p.id, name: p.name || "بدون اسم", file_no: p.file_no, phone: p.phone }); setQ(""); }}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 38, borderRadius: 14, border: "none", background: C.tint, padding: "0 12px", fontSize: 13, fontWeight: 600, color: C.ink }}>
              <span>{p.name || "بدون اسم"}</span><span dir="ltr" style={{ ...LATIN, color: C.sub2, fontSize: 12 }}>#{p.file_no}</span>
            </button>
          ))}
          {!res.data?.length && <div style={{ fontSize: 12, color: C.muted, padding: "2px 4px" }}>لا ملف بهذا البحث.</div>}
          <button type="button" onClick={() => { onPick({ type: "walkin", name: q.trim() }); setQ(""); }} style={{ height: 36, borderRadius: 14, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color: C.accent }}>
            بيع مباشر باسم «{q.trim()}» بدون ملف
          </button>
        </div>
      ))}
    </div>
  );
}

type Sellables = Awaited<ReturnType<typeof listSellables>>;
function ItemSearch({ sellables, onAdd, stockOf }: { sellables?: Sellables; onAdd: (l: CartLine) => void; stockOf: (key?: string) => number }) {
  const [q, setQ] = useState("");
  const s = q.trim();
  const hits: (CartLine & { meta: string; disabled?: boolean })[] = !s || !sellables ? [] : [
    ...sellables.services.map((x) => ({ x, cat: sellables.categories.find((c) => c.key === x.category_id)?.name ?? "" }))
      .filter(({ x, cat }) => x.name.includes(s) || cat.includes(s))
      .map(({ x, cat }) => ({ kind: "service" as const, ref: x.key, qty: 1, label: x.name, unit_price: x.price, meta: x.price_unknown ? "السعر غير محدد — حدّدي سعر الصرف من المالية" : `${cat || "خدمة"} · ${x.minutes} دقيقة`, disabled: x.price_unknown })),
    ...sellables.products.filter((x) => x.name.includes(s)).map((x) => ({ kind: "product" as const, ref: x.key, qty: 1, label: x.name, unit_price: x.price ?? 0, meta: `منتج · المتوفر ${stockOf(x.key)} ${x.unit}`, disabled: stockOf(x.key) <= 0 })),
    ...sellables.packages.filter((x) => x.name.includes(s)).map((x) => ({ kind: "package" as const, ref: x.id, qty: 1, label: x.name, unit_price: x.price, meta: `باقة · ${x.sessions} جلسات` })),
  ].slice(0, 8);
  return (
    <div style={{ position: "relative" }}>
      <label style={{ height: 44, borderRadius: 22, border: "1.5px dashed #DFCBE3", background: "#FEFCFE", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
        <Icon name="search" color={C.muted} size={17} />
        <input aria-label="إضافة بند" value={q} onChange={(e) => setQ(e.target.value)} placeholder="أضيفي خدمة أو منتجاً من المتجر أو باقة" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13, color: C.ink }} />
      </label>
      {s && (
        <div style={{ position: "absolute", insetInline: 0, top: 50, zIndex: 20, borderRadius: 20, background: C.white, boxShadow: SH, border: "1px solid #F0E6F3", padding: 6, maxHeight: 300, overflowY: "auto" }}>
          {!sellables ? <Loading /> : hits.length === 0 ? <div style={{ padding: 12, fontSize: 13, color: C.muted }}>لا نتائج. أضيفي الخدمات والمنتجات من الإعدادات والمخزون.</div> : hits.map((h) => (
            <button key={h.kind + h.ref} type="button" disabled={h.disabled} onClick={() => { onAdd({ kind: h.kind, ref: h.ref, qty: 1, label: h.label, unit_price: h.unit_price } as CartLine); setQ(""); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 14, border: "none", background: "transparent", textAlign: "right", opacity: h.disabled ? 0.45 : 1 }}>
              <Icon name={h.kind === "product" ? "bottle" : h.kind === "package" ? "gift" : "sparkle"} color={C.accentMid} size={16} />
              <span style={{ flex: 1, lineHeight: 1.35 }}><span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.ink }}>{h.label}</span><span style={{ fontSize: 11.5, color: C.sub2 }}>{h.disabled ? "نفد من المخزون" : h.meta}</span></span>
              <Amount n={h.unit_price} size={12.5} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
