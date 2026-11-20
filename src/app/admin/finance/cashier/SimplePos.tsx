"use client";

/**
 * «نقطة البيع» — the simplified screen for a pos-only seller: customer name + phone, scan barcodes,
 * one big button that issues the invoice (paid in full) and opens the print dialog.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AdminShell } from "@/components/shell";
import { Icon, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { createInvoice, financeError, getInvoice, listSellables, type CartLine, type InvoiceRow } from "@/lib/db/finance";
import { money } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { useInvoicePrint } from "../InvoicePrint";
import { useLocations } from "../../inventory/dialogs";
import { qtyAt } from "@/lib/db/products";

const box: CSSProperties = { background: C.white, borderRadius: 26, padding: 22, boxShadow: "0 10px 26px rgba(120,70,135,0.10)", border: "1px solid #F0E6F3" };
const big: CSSProperties = { height: 60, borderRadius: 18, border: "2px solid #E3D2E8", background: "#FEFCFE", padding: "0 18px", fontSize: 20, color: C.ink, outline: "none", width: "100%", fontFamily: "inherit" };
const lbl: CSSProperties = { fontSize: 17, fontWeight: 700, color: C.ink, display: "flex", flexDirection: "column", gap: 8 };

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
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const scan = useRef<HTMLInputElement>(null);
  const products = sellables.data?.products ?? [];
  const stockOf = (key?: string) => {
    const p = products.find((x) => x.key === key);
    if (!p) return 0;
    return L.multi && L.def ? qtyAt(L.map, p, L.def.id) : Number(p.stock);
  };
  useEffect(() => { if (msg?.ok) { const t = setTimeout(() => setMsg(null), 6000); return () => clearTimeout(t); } }, [msg]);

  const addCode = () => {
    const s = code.trim();
    setCode("");
    if (!s) return;
    const p = products.find((x) => x.barcode === s)
      ?? (() => { const m = products.filter((x) => x.name.toLowerCase().includes(s.toLowerCase()) || (x.name_ar ?? "").includes(s)); return m.length === 1 ? m[0] : undefined; })();
    if (!p) { setMsg({ ok: false, text: "لم أجد هذا المنتج. أعيدي المسح أو اسألي الإدارة." }); return; }
    const have = lines.find((l) => l.ref === p.key)?.qty ?? 0;
    if (have + 1 > stockOf(p.key)) { setMsg({ ok: false, text: `لا توجد كمية كافية من «${p.name_ar || p.name}» في المخزون.` }); return; }
    setMsg(null);
    setLines(have ? lines.map((l) => (l.ref === p.key ? { ...l, qty: l.qty + 1 } : l))
      : [...lines, { kind: "product", ref: p.key, qty: 1, label: p.name_ar ? `${p.name_ar} — ${p.name}` : p.name, unit_price: p.price ?? 0 }]);
  };

  const total = lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
  const digits = phone.replace(/\D/g, "");
  const phoneOk = /^0?9\d{8}$/.test(digits);
  const missing = !name.trim() ? "اكتبي اسم الزبونة" : !phoneOk ? "اكتبي رقم هاتف صحيح (09…)" : !lines.length ? "امسحي باركود منتج واحد على الأقل" : "";

  const sell = async () => {
    if (missing || busy) return;
    setBusy(true); setMsg(null);
    try {
      const inv = await createInvoice({
        walkInName: name.trim(), lines, discount: 0, payments: [{ method: card ? "card" : "cash", amount: total }],
        note: `هاتف: ${digits.startsWith("0") ? digits : "0" + digits}`, location: L.multi && L.def ? L.def.id : null,
      });
      if (inv) {
        const row = await getInvoice(inv.id).catch(() => ({ ...inv, patients: null, invoice_items: [], invoice_payments: [], appointments: null }) as InvoiceRow);
        receipt.print(row as InvoiceRow, { staff: staff?.name });
      }
      setName(""); setPhone(""); setLines([]); setCard(false);
      setMsg({ ok: true, text: "تم البيع بنجاح" });
    } catch (e) { setMsg({ ok: false, text: financeError(e) }); } finally { setBusy(false); }
  };

  const qtyBtn: CSSProperties = { width: 48, height: 48, borderRadius: 24, border: "2px solid #E3D2E8", background: C.white, fontSize: 26, fontWeight: 700, color: C.accent, cursor: "pointer", display: "grid", placeItems: "center" };
  return (
    <AdminShell active="المالية" title="نقطة البيع" subtitle="بيع الأدوية والمنتجات">
      {sellables.loading && !sellables.data ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 820, width: "100%", margin: "0 auto" }}>
          <div style={{ ...box, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <label style={lbl}>١. اسم الزبونة<input style={big} value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" /></label>
            <label style={lbl}>٢. رقم الهاتف<input style={{ ...big, direction: "ltr", textAlign: "right" }} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" /></label>
          </div>

          <div style={box}>
            <label style={lbl}>٣. امسحي باركود المنتج
              <input ref={scan} style={{ ...big, borderColor: C.accent, borderStyle: "dashed" }} value={code} onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCode(); } }} placeholder="ضعي المؤشر هنا ثم امسحي الباركود" />
            </label>
            {lines.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
                {lines.map((l) => (
                  <div key={l.ref} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, background: "#F9F3FB" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 19, fontWeight: 700, color: C.ink }}>{l.label}</div>
                      <div style={{ fontSize: 16, color: C.sub }}>{money(l.unit_price)} للقطعة</div>
                    </div>
                    <button type="button" style={qtyBtn} aria-label="إنقاص" onClick={() => setLines(l.qty > 1 ? lines.map((x) => (x.ref === l.ref ? { ...x, qty: x.qty - 1 } : x)) : lines.filter((x) => x.ref !== l.ref))}>−</button>
                    <b className="latin" style={{ fontSize: 24, minWidth: 30, textAlign: "center" }}>{l.qty}</b>
                    <button type="button" style={qtyBtn} aria-label="زيادة" disabled={l.qty >= stockOf(l.ref)} onClick={() => setLines(lines.map((x) => (x.ref === l.ref ? { ...x, qty: x.qty + 1 } : x)))}>+</button>
                    <b style={{ fontSize: 19, minWidth: 110, textAlign: "left", color: C.ink }}>{money(l.qty * l.unit_price)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...box, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>المجموع</span>
              <b style={{ fontSize: 32, color: C.accent }}>{money(total)}</b>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[false, true].map((c) => (
                <button key={String(c)} type="button" onClick={() => setCard(c)} style={{ flex: 1, height: 52, borderRadius: 16, fontSize: 18, fontWeight: 700, cursor: "pointer",
                  border: `2px solid ${card === c ? C.accent : "#E3D2E8"}`, background: card === c ? "#F3E7F6" : C.white, color: card === c ? C.accent : C.sub }}>{c ? "بطاقة" : "نقداً"}</button>
              ))}
            </div>
            {msg && <div style={{ fontSize: 18, fontWeight: 700, padding: "14px 16px", borderRadius: 16, background: msg.ok ? "#E7F6EC" : "#FBEAF1", color: msg.ok ? "#1F7A3D" : C.danger }}>{msg.text}</div>}
            <button type="button" disabled={!!missing || busy} onClick={sell}
              style={{ height: 76, borderRadius: 24, border: "none", fontSize: 24, fontWeight: 800, color: C.white, cursor: missing ? "default" : "pointer",
                background: missing ? "#CDB8D3" : C.accent, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Icon name="print" color={C.white} size={28} />{busy ? "جارٍ البيع…" : "قبول البيع وطباعة الفاتورة"}
            </button>
            {missing && <div style={{ fontSize: 16, color: C.sub, textAlign: "center" }}>{missing}</div>}
          </div>
        </div>
      )}
      {receipt.node}
    </AdminShell>
  );
}
