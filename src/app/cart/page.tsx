"use client";

/** P_Cart.dc.html — cart (interactive quantities, delivery mode, computed totals). */
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkCard, FatemaAvatar, PrimaryButton, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";
import { cartStore, cartTotals, setMode, useCart, useMode } from "@/lib/mock/c1";
import { ArtThumb, QtyStepper, Segmented } from "../store/c1ui";

export default function CartPage() {
  const cart = useCart();
  const mode = useMode();
  const { lines, count, sub } = cartTotals(cart);
  const d = mode === "d";

  return (
    <PhoneScreen>
      <TopBar title="السلة" back={R.P_Store} />

      <div style={{ ...CARD, borderRadius: 24, padding: "12px 16px 4px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FatemaAvatar size={28} />
          <span style={{ fontSize: 12.5, color: C.sub2 }}>روتينكِ كما أوصت به فاطمة طيبة</span>
        </div>
        {lines.length === 0 && <div style={{ padding: "16px 0", fontSize: 13.5, color: C.sub2 }}>سلتكِ فارغة</div>}
        {lines.map(({ p, qty, line }, i) => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <ArtThumb p={p} box={60} art={43} radius={20} />
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{p.size}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginTop: 2 }}><span className="latin">{money(line, false)}</span> ل.س</div>
            </div>
            <QtyStepper qty={qty} min={0} onChange={(q) => cartStore.set(p.key, q)} />
          </div>
        ))}
      </div>

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

      {lines.length > 0
        ? <PrimaryButton href={R.P_Checkout} style={{ marginTop: "auto", flexShrink: 0 }}>متابعة الدفع</PrimaryButton>
        : <SecondaryButton href={R.P_Store} icon="bag" style={{ marginTop: "auto", flexShrink: 0 }}>تصفّحي المتجر</SecondaryButton>}
    </PhoneScreen>
  );
}

function Row({ l, r }: { l: React.ReactNode; r: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>{l}{r}</div>;
}
