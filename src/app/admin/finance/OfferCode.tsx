"use client";

/**
 * «كود الخصم» — shared by the admin cashier and the reception tablet cashier.
 * «تطبيق» checks the code with the `check_offer_code` rpc (preview only); the invoice rpc re-validates it and
 * recomputes the discount from DB prices. While a code is applied the parent disables its manual discount.
 */
import { useState } from "react";
import { Icon } from "@/components/ui";
import { checkOfferCode, financeError, offerDiscount, offerLabel, type AppliedOffer, type CartLine } from "@/lib/db/finance";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";

export function OfferCodeField({ lines, offer, onChange, disabled, big }: {
  lines: CartLine[]; offer: AppliedOffer | null; onChange: (o: AppliedOffer | null) => void; disabled?: boolean; big?: boolean;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const h = big ? 52 : 42;
  const fs = big ? 16 : 13.5;

  const apply = async () => {
    const c = code.trim().toUpperCase();
    if (!c || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await checkOfferCode(c, lines);
      if (r.ok) { onChange(r.offer); setCode(""); } else setErr(r.reason);
    } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  };

  if (offer) {
    const d = offerDiscount(offer, lines);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 8, minHeight: h, borderRadius: h / 2, padding: "4px 6px 4px 14px", background: "#E6F4EC", border: "1px solid #CDE8D7", color: C.okDeep, fontSize: fs, fontWeight: 700 }}>
          <Icon name="gift" color={C.okDeep} size={big ? 20 : 17} />
          <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
            <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{offer.code}</span> — {offerLabel(offer)} <span style={{ whiteSpace: "nowrap" }}>(<bdi dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>−{money(d, false)}</bdi> ل.س)</span>
          </span>
          <button type="button" aria-label="إزالة كود الخصم" onClick={() => { onChange(null); setErr(null); }}
            style={{ width: h - 10, height: h - 10, borderRadius: (h - 10) / 2, border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <Icon name="x" color={C.okDeep} size={big ? 17 : 14} />
          </button>
        </div>
        {offer.title && <div style={{ fontSize: big ? 13.5 : 12, color: C.sub2, padding: "0 6px" }}>{offer.title}{d === 0 ? " · لا ينطبق على بنود الفاتورة الحالية" : ""}</div>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 8, opacity: disabled ? 0.5 : 1 }}>
        <label style={{ flex: 1, minWidth: 0, height: h, borderRadius: h / 2, border: `1px solid ${err ? "#E9B8CB" : "#EADCF0"}`, background: "#FEFCFE", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
          <Icon name="gift" color={C.muted} size={big ? 19 : 16} />
          <input aria-label="كود الخصم" value={code} disabled={disabled} onChange={(e) => { setCode(e.target.value); setErr(null); }} onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
            placeholder="كود الخصم" dir={code ? "ltr" : "rtl"} autoCapitalize="characters" spellCheck={false}
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 0, fontSize: fs, color: C.ink, fontFamily: code ? "var(--font-rubik), sans-serif" : "inherit", textTransform: "uppercase", textAlign: "right" }} />
        </label>
        <button type="button" onClick={apply} disabled={disabled || busy || !code.trim()}
          style={{ height: h, padding: big ? "0 24px" : "0 18px", borderRadius: h / 2, border: "none", background: C.accent, color: C.white, fontSize: fs, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", opacity: disabled || busy || !code.trim() ? 0.55 : 1, cursor: "pointer" }}>
          {busy ? "…" : "تطبيق"}
        </button>
      </div>
      {err && <div role="alert" style={{ fontSize: big ? 14 : 12.5, fontWeight: 600, color: C.danger, padding: "0 6px" }}>{err}</div>}
    </div>
  );
}
