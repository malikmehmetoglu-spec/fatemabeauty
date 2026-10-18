"use client";

/** P_Cart.dc.html — cart. Keys + quantities from localStorage; names, prices and stock are re-read live. */
import Link from "next/link";
import { useEffect } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, ErrorNote, Loading, PrimaryButton, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { cartLines, cartStore, getProductsByKeys, useLiveRefresh, setMode, useCart, useMode } from "@/lib/db/orders";
import { ArtThumb, QtyStepper, Segmented } from "../store/c1ui";
import css from "../store/store.module.css";

export default function CartPage() {
  const cart = useCart();
  const mode = useMode();
  const keys = Object.keys(cart).sort();
  const { data, loading, error, refresh } = useQuery(["products", "cart", keys.join(",")], () => getProductsByKeys(keys), { enabled: keys.length > 0 });
  // Prices and stock are always live: re-read when the page opens and when the tab comes back into focus.
  useLiveRefresh(keys.length > 0 ? refresh : null);
  const { lines, missing, count, sub, canOrder } = cartLines(cart, data);
  const d = mode === "d";
  // Drop items that are no longer sold.
  useEffect(() => { if (data) missing.forEach((k) => cartStore.set(k, 0)); }, [data, missing]);

  return (
    <PhoneScreen wide>
      <TopBar title="السلة" back={R.P_Store} />

      <div className={css.split}>
      <div className={css.col}>
      <div style={{ ...CARD, borderRadius: 24, padding: "12px 16px 4px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Circ icon="bag" size={28} iconSize={14} />
          <span style={{ fontSize: 12.5, color: C.sub2 }}>الأسعار والكميات محدّثة من المركز</span>
        </div>
        {keys.length > 0 && loading && <Loading />}
        {error && <ErrorNote style={{ margin: "10px 0" }}>تعذّر تحميل السلة: {error}</ErrorNote>}
        {!loading && !error && lines.length === 0 && <div style={{ padding: "16px 0", fontSize: 13.5, color: C.sub2 }}>سلتكِ فارغة</div>}
        {lines.map(({ p, qty, line, problem }, i) => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Link href={`${R.P_Product}?key=${encodeURIComponent(p.key)}`} aria-label={p.name}><ArtThumb p={p} box={60} art={43} radius={20} /></Link>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{p.size}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginTop: 2 }}><span className="latin">{money(line, false)}</span> ل.س</div>
              {problem && <div style={{ fontSize: 12, fontWeight: 600, color: C.danger }}>{problem}</div>}
            </div>
            <QtyStepper qty={qty} min={0} max={Math.max(qty, Math.floor(Number(p.stock)))} onChange={(q) => cartStore.set(p.key, q)} />
          </div>
        ))}
      </div>
      </div>

      <div className={css.aside}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>طريقة الاستلام</h2>
        <Segmented value={mode} onChange={setMode} options={[
          { value: "d", label: "توصيل للمنزل", icon: "truck" },
          { value: "p", label: "استلام من المركز", icon: "home" },
        ]} />
      </div>

      <DarkCard radius={28} padding="16px 20px">
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13.5 }}>
          <Row l={<span style={{ color: C.onDark }}>المجموع الفرعي · <span className="latin">{count}</span> منتجات</span>}
            r={<span style={{ fontWeight: 600 }}><span className="latin">{money(sub, false)}</span> ل.س</span>} />
          <Row l={<span style={{ color: C.onDark }}>{d ? "رسوم التوصيل" : "الاستلام من المركز"}</span>}
            r={<span style={{ fontWeight: 600 }}>{d ? "تُحدَّد عند التأكيد" : "بدون رسوم"}</span>} />
          <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "3px 0" }} />
          <Row l={<span style={{ fontSize: 15, fontWeight: 700 }}>الإجمالي</span>}
            r={<span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}><span className="latin">{money(sub, false)}</span> <span style={{ fontSize: 13, fontWeight: 600 }}>ل.س</span></span>} />
          <div style={{ fontSize: 11.5, color: C.onDark }}>{d ? "يُضاف رسم التوصيل بعد تأكيد العنوان." : "سنرسل لكِ رسالة حين يصبح طلبكِ جاهزاً."}</div>
        </div>
      </DarkCard>

      {lines.length > 0 && !canOrder && <ErrorNote>عدّلي الكميات المعلَّمة قبل المتابعة.</ErrorNote>}
      <div className={css.pin} style={{ marginTop: "auto", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {lines.length > 0
          ? <PrimaryButton href={canOrder ? R.P_Checkout : undefined} disabled={!canOrder}>متابعة الدفع</PrimaryButton>
          : <SecondaryButton href={R.P_Store} icon="bag">تصفّحي المتجر</SecondaryButton>}
      </div>
      </div>
      </div>
    </PhoneScreen>
  );
}

function Row({ l, r }: { l: React.ReactNode; r: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>{l}{r}</div>;
}
