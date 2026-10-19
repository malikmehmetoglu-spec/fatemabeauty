"use client";

/** P_Store.dc.html — store (root tab «المتجر»). Live: visible retail items of the centre's inventory. */
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { DarkGlow, EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD, DARK, SHB, SH_SOFT } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listStore, type Product } from "@/lib/db/products";
import { cartCount, cartStore, useCart } from "@/lib/db/orders";
import { ProductPic } from "./c1ui";
import css from "./store.module.css";
import { Blank, useDesktop } from "./desk/StoreChrome";
import { DeskHome } from "./desk/DeskHome";

const chip = (on: boolean): CSSProperties => ({
  height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex",
  alignItems: "center", gap: 6, flexShrink: 0,
  ...(on
    ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
    : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
});

export default function StorePage() {
  const desk = useDesktop();
  if (desk === null) return <Blank />;
  return desk ? <DeskHome /> : <PhoneStore />;
}

function PhoneStore() {
  const { data, loading, error } = useQuery(["products", "store"], listStore);
  const [cat, setCat] = useState("الكل");
  const [q, setQ] = useState("");
  const cart = useCart();
  const count = cartCount(cart);

  const products = useMemo(() => data ?? [], [data]);
  const cats = useMemo(() => ["الكل", ...Array.from(new Set(products.map((p) => p.category.trim()).filter(Boolean)))], [products]);
  const recommended = products.filter((p) => p.recommended && p.price != null && Number(p.stock) > 0).slice(0, 3);
  const recPrice = recommended.reduce((s, p) => s + (p.price ?? 0), 0);

  const query = q.trim();
  const needle = query.toLowerCase();
  const shown = products.filter((p) =>
    query ? [p.name, p.category, p.size, p.description].some((t) => t.toLowerCase().includes(needle)) : cat === "الكل" ? true : p.category.trim() === cat);

  const toggle = (p: Product) => cartStore.set(p.key, cart[p.key] ? 0 : 1);
  const addRecommended = () => recommended.forEach((p) => { if (!cart[p.key]) cartStore.add(p.key); });

  return (
    <PhoneScreen tab="المتجر" gap={12} wide>
      <div className={css.top}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", gap: 16 }}>
        <div style={{ lineHeight: 1.25 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink }}>المتجر</h1>
          <div style={{ fontSize: 12.5, color: C.sub2, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="truck" color={C.accentMid} size={15} />توصيل للمنزل أو استلام من المركز
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
        <Link href={R.P_OrderTrack} aria-label="طلباتي" title="طلباتي" style={{
          width: 50, height: 50, borderRadius: 25, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="box" color={C.accent} size={21} stroke={1.9} />
        </Link>
        <Link href={R.P_Cart} aria-label={count ? `السلة، فيها ${count}` : "السلة فارغة"} style={{
          width: 50, height: 50, borderRadius: 25, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <Icon name="bag" color={C.accent} size={21} stroke={1.9} />
          {count > 0 && <span className="latin" style={{
            position: "absolute", top: -2, left: -2, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 10,
            background: "linear-gradient(145deg,#C9A2D8,#7B4687)", color: C.white, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF", boxSizing: "border-box",
          }}>{count}</span>}
        </Link>
        </div>
      </header>

      <div className={css.search} style={{ position: "relative", display: "flex", alignItems: "center", height: 46, borderRadius: 23, background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: SH_SOFT, padding: "0 16px", gap: 8 }}>
        <Icon name="search" color={C.muted} size={18} />
        <label htmlFor="q" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>ابحثي في المتجر</label>
        <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي عن غسول، سيروم، واقي شمس"
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink, flex: 1, minWidth: 0, height: "100%" }} />
      </div>
      </div>

      {cats.length > 1 && <div className={css.cats}>
        {cats.length > 1 && cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => { setCat(c); setQ(""); }} style={chip(cat === c && !query)}>{c}</button>
        ))}
      </div>}

      {recommended.length > 0 && !query && cat === "الكل" && (
        <div style={{ ...DARK, borderRadius: 28, padding: "14px 16px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
          <DarkGlow />
          <div style={{ position: "relative", display: "flex", gap: 12, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 8, width: 132, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="sparkle" color="#E8D6F0" size={18} />
                </span>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 11, color: C.onDark }}>اختيارات</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>توصية الأخصائية</div>
                </div>
              </div>
              <Link href={R.P_Cart} onClick={addRecommended} style={{
                minHeight: 34, borderRadius: 17, padding: "5px 10px", background: C.white, color: C.accent, fontSize: 12.5, fontWeight: 700, lineHeight: 1.25,
                display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 4, boxShadow: "0 6px 14px rgba(0,0,0,0.18)", textAlign: "center",
              }}><span>{recommended.length > 1 ? "أضيفيها كلها" : "أضيفيه"}</span><span className="latin" style={{ whiteSpace: "nowrap" }}>{money(recPrice, false)}</span></Link>
            </div>
            <div style={{ flex: 1, display: "flex", gap: 6, minWidth: 0 }}>
              {recommended.map((p) => (
                <Link key={p.key} href={`${R.P_Product}?key=${encodeURIComponent(p.key)}`} style={{
                  flex: 1, minWidth: 0, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
                  padding: "6px 4px 7px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                  <span style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", background: "radial-gradient(circle, #FFFFFF 0%, #ECDDF2 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
                    <ProductPic p={p} width={28} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{p.category || p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{query ? "نتائج البحث" : cat === "الكل" ? "منتجات العناية" : cat}</h2>
        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المتجر: {error}</ErrorNote> : products.length === 0 ? (
          <EmptyState icon="bag" title="المتجر قيد التجهيز"
            text="ستظهر هنا منتجات العناية التي يعتمدها المركز فور إضافتها. يمكنكِ السؤال عن أي منتج عبر المحادثة."
            action={<Link href={R.P_Chat} style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>راسلي المركز</Link>} />
        ) : shown.length === 0 && <div style={{ fontSize: 13, color: C.sub2 }}>لا توجد منتجات مطابقة</div>}
        <div className={css.grid}>
          {shown.map((p) => {
            const on = !!cart[p.key];
            const out = Number(p.stock) <= 0;
            const href = `${R.P_Product}?key=${encodeURIComponent(p.key)}`;
            const art = (
              <div className={css.art} style={{ borderRadius: 18, overflow: "hidden", position: "relative", background: "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F3EAF6 80%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -8px 16px rgba(150,100,170,0.08)", opacity: out ? 0.6 : 1 }}>
                <ProductPic p={p} width={64} fill artClass={css.artSvg} alt={p.name} />
                {p.recommended && <span style={{ position: "absolute", top: 5, right: 5, height: 20, padding: "0 7px", borderRadius: 10, background: "rgba(255,255,255,0.92)", color: C.accent, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 3, boxShadow: "0 2px 6px rgba(123,70,135,0.15)" }}><Icon name="sparkle" color={C.accent} size={11} />توصية الأخصائية</span>}
              </div>
            );
            const name = <div title={p.name} style={{ fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: "2.6em", overflowWrap: "anywhere" }}>{p.name}</div>;
            return (
              <div key={p.key} className={css.card} style={{ ...CARD, borderRadius: 24, padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
                <Link href={href} aria-label={`تفاصيل ${p.name}`} style={{ display: "block" }}>{art}</Link>
                <div style={{ padding: "0 4px" }}>
                  <Link href={href}>{name}</Link>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{p.size}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", minHeight: 36, gap: 6 }}>
                  {out ? (
                    <Tag kind="gray" style={{ height: 26, borderRadius: 13 }}>غير متوفر حالياً</Tag>
                  ) : p.price === null ? (
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
                      <button type="button" aria-pressed={on} aria-label={on ? `أزيلي ${p.name} من السلة` : `أضيفي ${p.name} إلى السلة`} onClick={() => toggle(p)} style={{
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
