"use client";

/** P_Product.dc.html — product detail (واقي شمس SPF 50). */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Chip, Circ, IconButton, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD, FATEMA_PHOTO, GLASS, SH } from "@/lib/tokens";
import { FEATURED, FEATURED_INFO, PRODUCT, cartStore } from "@/lib/mock/c1";
import { ProductArt, QtyStepper } from "../c1ui";

export default function ProductPage() {
  const p = PRODUCT[FEATURED];
  const price = p.price ?? 0;
  const [qty, setQty] = useState(1);
  const [fav, setFav] = useState(false);
  const router = useRouter();

  return (
    <PhoneScreen>
      <TopBar title="تفاصيل المنتج" back={R.P_Store} right={
        <IconButton icon="heart" label={fav ? "إزالة من المفضلة" : "أضيفي إلى المفضلة"} onClick={() => setFav(!fav)} color={fav ? C.danger : C.accent} />
      } />

      <div style={{
        height: 262, borderRadius: 32, position: "relative", overflow: "hidden", flexShrink: 0,
        background: "radial-gradient(circle at 50% 46%, #FFFFFF 0%, #F6EBF8 52%, #EAD4EF 100%)", border: "1px solid #FFFFFF", boxShadow: SH,
      }}>
        <div aria-hidden style={{ position: "absolute", top: 34, left: "50%", width: 170, height: 170, marginLeft: -85, borderRadius: 85, background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
          <ProductArt p={p} width={166} />
        </div>
        <div style={{ ...GLASS, position: "absolute", top: 14, right: 14, height: 40, padding: "0 12px 0 5px", borderRadius: 20, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 6px 16px rgba(123,70,135,0.10)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 30, height: 30, borderRadius: 15, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.accent }}>أوصت به أخصائيتكِ</span>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 14 }}><Tag kind="pink">{FEATURED_INFO.routineTag}</Tag></div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ lineHeight: 1.3, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: C.ink }}>{p.name}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <Tag kind="gray">{FEATURED_INFO.tags[0]}</Tag>
            <Tag kind="pink">{FEATURED_INFO.tags[1]}</Tag>
          </div>
        </div>
        <div style={{ textAlign: "left", lineHeight: 1.1, flexShrink: 0 }}>
          <div className="latin" style={{ fontSize: 26, fontWeight: 700, color: C.accent }}>{money(price, false)}</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>ل.س · سعر تقريبي</div>
        </div>
      </div>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Circ icon="sun" size={36} iconSize={16} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>طريقة الاستخدام</h2>
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {FEATURED_INFO.steps.map((t, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: C.sub, lineHeight: 1.55, marginTop: 4 }}>
              <span className="latin" style={{ width: 20, height: 20, borderRadius: 10, background: C.tint, color: C.accentMid, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>يناسب</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FEATURED_INFO.suits.map((s, i) => <Chip key={s} selected={i === 0} height={34}>{s}</Chip>)}
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <QtyStepper qty={qty} onChange={setQty} btn={34} radius={21} />
        <PrimaryButton icon="bag" style={{ flex: 1, fontSize: "clamp(14px, 4.1vw, 16px)", gap: 6, padding: "0 10px", minWidth: 0, whiteSpace: "nowrap" }}
          onClick={() => { cartStore.add(p.key, qty); router.push(R.P_Cart); }}>
          أضيفي إلى السلة · <span className="latin">{money(qty * price, false)}</span>
        </PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
