"use client";

/**
 * «نقطة البيع» — the cashier's design, reduced for a pos-only seller: customer name + phone, scan barcodes,
 * one button that issues the invoice (paid in full) and opens the print dialog.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { createInvoice, financeError, getInvoice, listSellables, type CartLine, type InvoiceRow } from "@/lib/db/finance";
import { arDate, clock, money } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, ICON_FILL, SELECTED } from "@/lib/tokens";
import { Amount, LATIN, OFF, PANEL } from "../parts";
import { useInvoicePrint } from "../InvoicePrint";
import { useLocations } from "../../inventory/dialogs";
import { qtyAt } from "@/lib/db/products";
import css from "../finance.module.css";

const GRAD = "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)";
const STEP: CSSProperties = { width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: ICON_FILL, color: C.accent, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" };

/** Privacy on the printed receipt: «فاطمة أحمد» → «فاطمة أ.»  ·  0912345678 → 09•••••678 */
const maskName = (n: string) => { const [a, ...r] = n.trim().split(/\s+/); return [a, ...r.map((w) => w[0] + ".")].join(" "); };
const maskPhone = (d: string) => d.length > 5 ? d.slice(0, 2) + "•".repeat(d.length - 5) + d.slice(-3) : d;

function Title({ n, children }: { n: number; children: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700 }}><span style={{ ...STEP, ...LATIN }}>{n}</span>{children}</div>;
}
function QtyBtn({ icon, onClick, disabled, label }: { icon: string; onClick: () => void; disabled?: boolean; label: string }) {
  return <button type="button" aria-label={label} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? 0.4 : 1, width: 32, height: 32, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} color={C.accent} size={15} stroke={2.2} /></button>;
}

export default function SimplePos() {
  const { staff } = useSession();
  const sellables = useQuery(["finance", "sellables"], listSellables);
  const L = useLocations();
  const receipt = useInvoicePrint();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [card, setCard] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const products = sellables.data?.products ?? [];
  const stockOf = (key?: string) => {
    const p = products.find((x) => x.key === key);
    if (!p) return 0;
    return L.multi && L.def ? qtyAt(L.map, p, L.def.id) : Number(p.stock);
  };
  useEffect(() => { if (done) { const t = setTimeout(() => setDone(null), 8000); return () => clearTimeout(t); } }, [done]);

  const addCode = () => {
    const s = code.trim();
    setCode("");
    if (!s) return;
    const p = products.find((x) => x.barcode === s)
      ?? (() => { const m = products.filter((x) => x.name.toLowerCase().includes(s.toLowerCase()) || (x.name_ar ?? "").includes(s)); return m.length === 1 ? m[0] : undefined; })();
    if (!p) { setErr("لم يُعثر على المنتج. أعيدي مسح الباركود."); return; }
    const have = lines.find((l) => l.ref === p.key)?.qty ?? 0;
    if (have + 1 > stockOf(p.key)) { setErr(`لا توجد كمية كافية من «${p.name_ar || p.name}» في المخزون.`); return; }
    setErr(null); setDone(null);
    setLines(have ? lines.map((l) => (l.ref === p.key ? { ...l, qty: l.qty + 1 } : l))
      : [...lines, { kind: "product", ref: p.key, qty: 1, label: p.name_ar ? `${p.name_ar} — ${p.name}` : p.name, unit_price: p.price ?? 0 }]);
  };

  const total = lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const digits = phone.replace(/\D/g, "");
  const phoneOk = /^0?9\d{8}$/.test(digits);
  const missing = !name.trim() ? "اكتبي اسم الزبونة" : !phoneOk ? "اكتبي رقم هاتف صحيح يبدأ بـ 09" : !lines.length ? "امسحي باركود منتج واحد على الأقل" : "";

  const sell = async () => {
    if (missing || busy) return;
    setBusy(true); setErr(null);
    try {
      const inv = await createInvoice({
        walkInName: name.trim(), lines, discount: 0, payments: [{ method: card ? "card" : "cash", amount: total }],
        note: `هاتف: ${digits.startsWith("0") ? digits : "0" + digits}`, location: L.multi && L.def ? L.def.id : null,
      });
      if (inv) {
        const row = await getInvoice(inv.id).catch(() => ({ ...inv, patients: null, invoice_items: [], invoice_payments: [], appointments: null }) as InvoiceRow);
        const ph = digits.startsWith("0") ? digits : "0" + digits;
        receipt.print({ ...(row as InvoiceRow), walk_in_name: maskName(name), note: `هاتف: ${maskPhone(ph)}` }, { staff: staff?.name });
        setDone(inv.no ? String(inv.no) : "");
      }
      setName(""); setPhone(""); setLines([]); setCard(false);
    } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };

  return (
    <AdminShell active="المالية" title="نقطة البيع" subtitle={`${arDate(new Date())} · ${clock()}`}>
      {sellables.loading && !sellables.data ? <Loading /> : (
        <div className={css.cashier}>
          {/* ---------- customer ---------- */}
          <div className={css.cWho} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
            <Title n={1}>الزبونة</Title>
            <TextInput label="الاسم" value={name} onChange={setName} placeholder="اسم الزبونة" />
            <TextInput label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="09xxxxxxxx" dir="ltr" type="tel" />
            <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", background: C.tint, color: "#74457F", fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="info" color={C.accentMid} size={17} /><span>يُحفظ الاسم والرقم كاملين في النظام، وتُطبع الفاتورة بأجزاء مخفية منهما.</span>
            </div>
          </div>

          {/* ---------- products ---------- */}
          <div className={css.cBill} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
            <Title n={2}>المنتجات</Title>
            <label style={{ height: 50, borderRadius: 25, border: "1.5px dashed #DFCBE3", background: "#FEFCFE", display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
              <Icon name="scan" color={C.accentMid} size={19} />
              <input aria-label="باركود المنتج" value={code} onChange={(e) => setCode(e.target.value)} placeholder="امسحي باركود المنتج هنا"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCode(); } }}
                style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 15, color: C.ink, minWidth: 0 }} />
            </label>
            {lines.length === 0 ? (
              <EmptyState icon="bottle" title="لا منتجات بعد" text="ضعي المؤشر في خانة الباركود ثم امسحي المنتج، فيظهر هنا باسمه وسعره." style={{ boxShadow: "none", border: "none" }} />
            ) : (
              <div>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: C.sub2, padding: "0 4px 6px", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ flex: 3 }}>المنتج</div><div style={{ flex: 1.4, textAlign: "center" }}>الكمية</div><div style={{ flex: 1.3, textAlign: "left" }}>السعر</div><div style={{ width: 30 }} />
                </div>
                {lines.map((l) => (
                  <div key={l.ref} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 4px", borderBottom: `1px solid ${C.line}` }}>
                    <div style={{ flex: 3, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="bottle" color={C.accentMid} size={18} /></span>
                      <div style={{ lineHeight: 1.4, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{l.label}</div>
                        <div style={{ fontSize: 12, color: C.sub2 }}>{money(l.unit_price)} للقطعة</div>
                      </div>
                    </div>
                    <div style={{ flex: 1.4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <QtyBtn icon="minus" label="إنقاص" onClick={() => setLines(lines.map((x) => (x.ref === l.ref ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))} />
                      <span style={{ ...LATIN, minWidth: 20, textAlign: "center", fontSize: 16, fontWeight: 700 }}>{l.qty}</span>
                      <QtyBtn icon="plus" label="زيادة" disabled={l.qty >= stockOf(l.ref)} onClick={() => setLines(lines.map((x) => (x.ref === l.ref ? { ...x, qty: x.qty + 1 } : x)))} />
                    </div>
                    <div style={{ flex: 1.3, textAlign: "left" }}><Amount n={l.qty * l.unit_price} size={14.5} /></div>
                    <button type="button" aria-label="حذف المنتج" onClick={() => setLines(lines.filter((x) => x.ref !== l.ref))} style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="trash" color={C.muted} size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- total & sell ---------- */}
          <div className={css.cSum} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: GRAD, boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontSize: 13, color: C.onDark }}><span>عدد القطع</span><span style={LATIN}>{count}</span></div>
              <div style={{ position: "relative", height: 1, background: "rgba(255,255,255,0.18)", margin: "12px 0" }} />
              <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>المطلوب</div>
              <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ ...LATIN, fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{money(total, false)}</span><span style={{ fontSize: 15 }}>ل.س</span>
              </div>
            </div>

            <div style={{ ...PANEL, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Title n={3}>طريقة الدفع</Title>
              <div style={{ display: "flex", gap: 10 }}>
                {[false, true].map((c) => {
                  const on = card === c;
                  return (
                    <button key={String(c)} type="button" onClick={() => setCard(c)} style={{ flex: 1, height: 46, borderRadius: 23, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, color: C.ink, ...(on ? SELECTED : OFF) }}>
                      <span style={{ width: 14, height: 14, borderRadius: 7, flexShrink: 0, ...(on ? { background: C.accent, border: "3px solid #F1E3F6", boxShadow: "0 0 0 1.5px #7B4687" } : { border: "1.5px solid #D1C0D5", background: C.white }) }} />
                      <span style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{c ? "بطاقة" : "نقدي"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {err && <ErrorNote>{err}</ErrorNote>}
              {done !== null && (
                <div className={css.success} role="status">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.okDeep, fontSize: 15, fontWeight: 700 }}>
                    <Icon name="check" color={C.okDeep} size={19} />تم البيع{done ? <> · فاتورة <span dir="ltr" style={LATIN}>{done}</span></> : null}
                  </div>
                </div>
              )}
              {missing && <div style={{ fontSize: 12.5, color: C.sub2, textAlign: "center" }}>{missing}</div>}
              <button type="button" onClick={sell} disabled={!!missing || busy} style={{ height: 62, borderRadius: 31, border: "none", backgroundColor: C.accent, backgroundImage: GRAD, boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, opacity: missing || busy ? 0.55 : 1 }}>
                <Icon name="print" color={C.white} size={20} />{busy ? "جارٍ البيع…" : "قبول البيع وطباعة الفاتورة"}
              </button>
            </div>
          </div>
        </div>
      )}
      {receipt.node}
    </AdminShell>
  );
}
