"use client";

/** P_Store.dc.html — store (root tab «المتجر»). */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { DarkGlow, Icon, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD, DARK, FATEMA_PHOTO, SHB, SH_SOFT } from "@/lib/tokens";
import { PRODUCT, PRODUCTS, ROUTINE, ROUTINE_PRICE, STORE_CATS, STORE_DEFAULT, cartStore, cartTotals, useCart, type ProductKey } from "@/lib/mock/c1";
import { ProductArt } from "./c1ui";

const chip = (on: boolean): CSSProperties => ({
  height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex",
  alignItems: "center", gap: 6, flexShrink: 0,
  ...(on
    ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
    : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
});

export default function StorePage() {
  const [cat, setCat] = useState("الكل");
  const [q, setQ] = useState("");
  const [added, setAdded] = useState<Partial<Record<ProductKey, boolean>>>({});
  const cart = useCart();
  const { count } = cartTotals(cart);

  const query = q.trim();
  const shown = PRODUCTS.filter((p) =>
    query ? p.name.includes(query) || p.cat.includes(query) : cat === "الكل" ? STORE_DEFAULT.includes(p.key) : p.cat === cat);

  const toggle = (k: ProductKey) => {
    const on = !!added[k];
    setAdded({ ...added, [k]: !on });
    cartStore.add(k, on ? -1 : 1);
  };
  const addRoutine = () => ROUTINE.forEach((k) => { if (!cart[k]) cartStore.add(k); });

  return (
    <PhoneScreen tab="المتجر" gap={12}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div style={{ lineHeight: 1.25 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink }}>المتجر</h1>
          <div style={{ fontSize: 12.5, color: C.sub2, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="truck" color={C.accentMid} size={15} />توصيل للمنزل أو استلام من المركز
          </div>
        </div>
        <Link href={R.P_Cart} aria-label={`السلة، ${count} منتجات`} style={{
          width: 50, height: 50, borderRadius: 25, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <Icon name="bag" color={C.accent} size={21} stroke={1.9} />
          <span className="latin" style={{
            position: "absolute", top: -2, left: -2, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 10,
            background: "linear-gradient(145deg,#C9A2D8,#7B4687)", color: C.white, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF", boxSizing: "border-box",
          }}>{count}</span>
        </Link>
      </header>

      <div style={{ position: "relative", display: "flex", alignItems: "center", height: 46, borderRadius: 23, background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: SH_SOFT, padding: "0 16px", gap: 8 }}>
        <Icon name="search" color={C.muted} size={18} />
        <label htmlFor="q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>ابحثي في المتجر</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي عن غسول، سيروم، واقي شمس"
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink, flex: 1, minWidth: 0, height: "100%" }} />
      </div>

      <div style={{ display: "flex", gap: 8, margin: "-4px -20px -6px", padding: "4px 20px 12px", flexShrink: 0, overflowX: "auto" }}>
        {STORE_CATS.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => { setCat(c); setQ(""); }} style={chip(cat === c && !query)}>{c}</button>
        ))}
      </div>

      <div style={{ ...DARK, borderRadius: 28, padding: "14px 16px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <DarkGlow />
        <div style={{ position: "relative", display: "flex", gap: 12, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 8, width: 132, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 11, color: C.onDark }}>موصى به لكِ من</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>فاطمة طيبة</div>
              </div>
            </div>
            <Link href={R.P_Cart} onClick={addRoutine} style={{
              height: 34, borderRadius: 17, background: C.white, color: C.accent, fontSize: 12.5, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "0 6px 14px rgba(0,0,0,0.18)", whiteSpace: "nowrap",
            }}>الروتين كاملاً · <span className="latin">{money(ROUTINE_PRICE, false)}</span></Link>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 6, minWidth: 0 }}>
            {ROUTINE.map((k) => (
              <div key={k} style={{
                flex: 1, minWidth: 0, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
                padding: "6px 4px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, background: "radial-gradient(circle, #FFFFFF 0%, #ECDDF2 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
                  <ProductArt p={PRODUCT[k]} width={28} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.white, whiteSpace: "nowrap" }}>{PRODUCT[k].short}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{query ? "نتائج البحث" : cat === "الكل" ? "منتجات العناية" : cat}</h2>
        {shown.length === 0 && <div style={{ fontSize: 13, color: C.sub2 }}>لا توجد منتجات مطابقة</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {shown.map((p) => {
            const on = !!added[p.key];
            const detail = p.key === "spf";
            const art = (
              <div style={{ height: 74, borderRadius: 18, background: "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F3EAF6 80%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -8px 16px rgba(150,100,170,0.08)" }}>
                <ProductArt p={p} width={58} />
              </div>
            );
            const name = <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>;
            return (
              <div key={p.key} style={{ ...CARD, borderRadius: 24, padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
                {detail ? <Link href={R.P_Product} aria-label={`تفاصيل ${p.name}`} style={{ display: "block" }}>{art}</Link> : art}
                <div style={{ padding: "0 4px" }}>
                  {detail ? <Link href={R.P_Product}>{name}</Link> : name}
                  <div style={{ fontSize: 11.5, color: C.muted }}>{p.size}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", minHeight: 36, gap: 6 }}>
                  {p.price === null ? (
                    <>
                      <Tag kind="pink" style={{ height: 26, borderRadius: 13 }}>اسألي عن السعر</Tag>
                      <Link href={R.P_Chat} aria-label={`اسألي المركز عن سعر ${p.name}`} style={{ width: 36, height: 36, borderRadius: 18, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon name="msg" color={C.accent} size={17} />
                      </Link>
                    </>
                  ) : (
                    <>
                      <div style={{ lineHeight: 1.15 }}>
                        <div className="latin" style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{money(p.price, false)}</div>
                        <div style={{ fontSize: 11, color: C.sub2 }}>ل.س</div>
                      </div>
                      <button type="button" aria-pressed={on} aria-label={`أضيفي ${p.name} إلى السلة`} onClick={() => toggle(p.key)} style={{
                        width: 36, height: 36, borderRadius: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                        ...(on
                          ? { border: "none", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)" }
                          : { border: "1px solid #FFFFFF", background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", boxShadow: "0 4px 10px rgba(150,100,170,0.18)" }),
                      }}>
                        <Icon name={on ? "check" : "plus"} color={on ? C.white : C.accent} size={17} stroke={2.2} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PhoneScreen>
  );
}
