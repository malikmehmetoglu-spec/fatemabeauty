"use client";

/** P_Product.dc.html — product detail (live, ?key=<product key>). */
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, ErrorNote, Loading, PrimaryButton, SecondaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD, GLASS, SH } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { getProduct, type Product } from "@/lib/db/products";
import { cartStore, useCart } from "@/lib/db/orders";
import { ProductPic, QtyStepper } from "../c1ui";
import css from "../store.module.css";

export default function ProductPage() {
  return <Suspense fallback={<PhoneScreen><Loading /></PhoneScreen>}><ProductLoader /></Suspense>;
}

function ProductLoader() {
  const key = useSearchParams().get("key") ?? "";
  const { data, loading, error } = useQuery(["products", "one", key], () => getProduct(key), { enabled: !!key });
  if (!key || (!loading && !error && !data)) {
    return (
      <PhoneScreen wide>
        <TopBar title="تفاصيل المنتج" back={R.P_Store} />
        <EmptyState icon="bag" title="المنتج غير موجود" text="ربما أُزيل من المتجر. تصفّحي المنتجات المتوفرة الآن." />
        <SecondaryButton href={R.P_Store} icon="bag" style={{ marginTop: "auto" }}>العودة إلى المتجر</SecondaryButton>
      </PhoneScreen>
    );
  }
  if (loading || !data) return <PhoneScreen wide><TopBar title="تفاصيل المنتج" back={R.P_Store} />{error ? <ErrorNote>تعذّر التحميل: {error}</ErrorNote> : <Loading />}</PhoneScreen>;
  return <ProductView p={data} />;
}

function ProductView({ p }: { p: Product }) {
  const price = p.price ?? 0;
  const stock = Number(p.stock);
  const out = stock <= 0;
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const inCart = useCart()[p.key] ?? 0;
  const room = Math.max(0, Math.floor(stock) - inCart);
  const steps = p.usage.split(/\n+/).map((t) => t.trim()).filter(Boolean);

  return (
    <PhoneScreen wide>
      <TopBar title="تفاصيل المنتج" back={R.P_Store} />

      <div className={css.split}>
      <div className={css.col}>
      <div className={css.hero} style={{
        borderRadius: 32, position: "relative", overflow: "hidden", flexShrink: 0,
        background: "radial-gradient(circle at 50% 46%, #FFFFFF 0%, #F6EBF8 52%, #EAD4EF 100%)", border: "1px solid #FFFFFF", boxShadow: SH,
      }}>
        <div aria-hidden style={{ position: "absolute", top: 34, left: "50%", width: 170, height: 170, marginLeft: -85, borderRadius: 85, background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>
          <ProductPic p={p} width={166} fill radius={32} artClass={css.heroSvg} alt={p.name} />
        </div>
        {p.recommended && (
          <div style={{ ...GLASS, position: "absolute", top: 14, right: 14, height: 40, padding: "0 12px 0 6px", borderRadius: 20, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 6px 16px rgba(123,70,135,0.10)" }}>
            <Circ icon="sparkle" size={30} iconSize={15} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.accent }}>توصية الأخصائية</span>
          </div>
        )}
        {out && <div style={{ position: "absolute", bottom: 14, left: 14 }}><Tag kind="gray">غير متوفر حالياً</Tag></div>}
      </div>
      </div>

      <div className={css.aside}>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ lineHeight: 1.3, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: C.ink }}>{p.name}</h1>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {p.size && <Tag kind="gray">الحجم {p.size}</Tag>}
            {p.category && <Tag kind="pink">{p.category}</Tag>}
          </div>
        </div>
        <div style={{ textAlign: "left", lineHeight: 1.1, flexShrink: 0 }}>
          {p.price != null ? <>
            <div className="latin" style={{ fontSize: 26, fontWeight: 700, color: C.accent }}>{money(price, false)}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>ل.س</div>
          </> : <Tag kind="pink">اسألي عن السعر</Tag>}
        </div>
      </div>

      {p.description && (
        <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", flexShrink: 0, fontSize: 13.5, color: C.sub, lineHeight: 1.8, whiteSpace: "pre-line" }}>{p.description}</div>
      )}

      {steps.length > 0 && (
        <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Circ icon="sun" size={36} iconSize={16} />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>طريقة الاستخدام</h2>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {steps.map((t, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: C.sub, lineHeight: 1.55, marginTop: 4 }}>
                <span className="latin" style={{ width: 20, height: 20, borderRadius: 10, background: C.tint, color: C.accentMid, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      )}

      {!out && p.price != null && stock <= 5 && <div style={{ fontSize: 12.5, fontWeight: 600, color: C.danger }}>بقي <span className="latin">{stock}</span> فقط</div>}
      {inCart > 0 && <div style={{ fontSize: 12.5, color: C.sub2 }}>في سلتكِ الآن: <span className="latin">{inCart}</span></div>}
      <div className={css.pin} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {out || p.price == null ? (
          <SecondaryButton href={R.P_Chat} icon="msg" style={{ flex: 1 }}>{out ? "غير متوفر حالياً · اسألي المركز" : "اسألي عن السعر"}</SecondaryButton>
        ) : room <= 0 ? (
          <SecondaryButton href={R.P_Cart} icon="bag" style={{ flex: 1 }}>كل الكمية المتوفرة في سلتكِ · افتحي السلة</SecondaryButton>
        ) : <>
          <QtyStepper qty={Math.min(qty, room)} onChange={setQty} btn={34} radius={21} max={Math.max(1, room)} />
          <PrimaryButton icon="bag" style={{ flex: 1, fontSize: "clamp(14px, 4.1vw, 16px)", gap: 6, padding: "0 10px", minWidth: 0, whiteSpace: "nowrap" }}
            onClick={() => { cartStore.add(p.key, Math.min(qty, room)); router.push(R.P_Cart); }}>
            أضيفي إلى السلة · <span className="latin">{money(Math.min(qty, room) * price, false)}</span>
          </PrimaryButton>
        </>}
      </div>
      </div>
      </div>
    </PhoneScreen>
  );
}
