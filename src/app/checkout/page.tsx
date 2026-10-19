"use client";

/** P_Checkout.dc.html — delivery / pickup + payment + order summary. Places a real order (place_order). */
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, ErrorNote, Icon, Loading, PrimaryButton, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";
import { setMode, itemsLabel } from "@/lib/db/orders";
import { useCheckout } from "../store/desk/useCheckout";
import { Blank, useDesktop } from "../store/desk/StoreChrome";
import { DeskCheckout } from "../store/desk/DeskCheckout";
import { ArtThumb, Field, Segmented } from "../store/c1ui";
import css from "../store/store.module.css";

type Pay = "cash";
const PAYS: { k: Pay; icon: string; title: string; sub: string }[] = [
  { k: "cash", icon: "cash", title: "نقداً", sub: "عند الاستلام" },
];

export default function CheckoutPage() {
  const desk = useDesktop();
  if (desk === null) return <Blank />;
  return desk ? <DeskCheckout /> : <PhoneCheckout />;
}

function PhoneCheckout() {
  const [pay, setPay] = useState<Pay>("cash");
  const { mode, d, keys, loading, lines, count, sub, canOrder, session, addr, setA, busy, error, login, submit, empty } = useCheckout();

  if (empty) return (
    <PhoneScreen>
      <TopBar title="الدفع والتوصيل" back={R.P_Cart} />
      <EmptyState icon="bag" title="لا شيء لإتمام الطلب" text="سلتكِ فارغة. أضيفي منتجات من المتجر ثم عودي لإتمام الطلب."
        action={<PrimaryButton href={R.P_Store} icon="bag">تصفّحي المتجر</PrimaryButton>} />
    </PhoneScreen>
  );

  return (
    <PhoneScreen gap={12} wide>
      <TopBar title="الدفع والتوصيل" back={R.P_Cart} />
      <div className={css.split}>
      <div className={css.col}>
      <Segmented value={mode} onChange={setMode} options={[
        { value: "d", label: "توصيل للمنزل", icon: "truck" },
        { value: "p", label: "استلام من المركز", icon: "home" },
      ]} />

      {d ? (
        <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Field id="city" value={addr.city} onChange={setA("city")} label="المدينة" placeholder="مثلاً: دمشق" />
            <Field id="area" value={addr.area} onChange={setA("area")} label="المنطقة" placeholder="اسم الحي" />
          </div>
          <Field id="street" value={addr.street} onChange={setA("street")} label="الشارع والبناء" placeholder="الشارع، البناء، الطابق" />
          <Field id="near" value={addr.near} onChange={setA("near")} label="علامة مميزة قريبة (اختياري)" placeholder="تساعد المندوب في الوصول" />
        </div>
      ) : (
        <div style={{ ...CARD, borderRadius: 24, padding: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Circ icon="home" size={44} iconSize={20} />
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>الاستلام من المركز</div>
              <div style={{ fontSize: 12.5, color: C.sub2 }}>استلمي طلبكِ من الاستقبال في أي زيارة</div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 16, background: "#F8F2FA", fontSize: 12.5, color: C.sub, display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="bell" color={C.accentMid} size={17} />تابعي حالة طلبكِ من «طلباتي»، وسيُعلَم حين يصبح جاهزاً
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>طريقة الدفع</h2>
        <div role="radiogroup" aria-label="طريقة الدفع" style={{ display: "flex", gap: 10 }}>
          {PAYS.map((o) => {
            const on = pay === o.k;
            return (
              <button key={o.k} type="button" role="radio" aria-checked={on} onClick={() => setPay(o.k)} style={{
                flex: 1, minWidth: 0, height: 62, borderRadius: 20, padding: "0 12px", display: "flex", alignItems: "center", gap: 10,
                ...(on
                  ? { background: "linear-gradient(160deg,#FFFFFF,#F4E6F8)", border: "1.5px solid #C9A2D8", boxShadow: "0 10px 22px rgba(150,100,170,0.22)" }
                  : { background: C.white, border: `1.5px solid ${C.borderSoft}`, boxShadow: "0 6px 14px rgba(123,70,135,0.06)" }),
              }}>
                <Circ icon={o.icon} size={36} iconSize={16} />
                <span style={{ flex: 1, textAlign: "right", lineHeight: 1.3, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.ink }}>{o.title}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: C.sub2 }}>{o.sub}</span>
                </span>
                <span style={{
                  width: 20, height: 20, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
                  ...(on ? { background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 4px 10px rgba(123,70,135,0.30)" } : { background: C.white, border: "1.5px solid #DFCFE2" }),
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: C.white }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      </div>

      <div className={css.aside}>
      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>ملخص الطلب</h2>
          <div style={{ display: "flex" }}>
            {lines.map(({ p }) => <ArtThumb key={p.key} p={p} box={32} art={24} radius={16} style={{ marginInlineStart: -10 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, color: C.sub }}>
          <Row l={<span>{itemsLabel(count)}</span>} r={<span style={{ color: C.ink, fontWeight: 600 }}><span className="latin">{money(sub, false)}</span> ل.س</span>} />
          <Row l={<span>{d ? "رسوم التوصيل" : "الاستلام من المركز"}</span>} r={<span style={{ color: C.ink, fontWeight: 600 }}>{d ? "تُحدَّد عند التأكيد" : "بدون رسوم"}</span>} />
          <div style={{ height: 1, background: C.line, margin: "3px 0" }} />
          <Row l={<span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>الإجمالي</span>}
            r={<span style={{ fontSize: 19, fontWeight: 700, color: C.accent }}><span className="latin">{money(sub, false)}</span> <span style={{ fontSize: 12 }}>ل.س</span><span style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>{d ? " + التوصيل" : ""}</span></span>} />
        </div>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div className={css.pin} style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
      {keys.length === 0 ? (
        <SecondaryButton href={R.P_Store} icon="bag" style={{ flexShrink: 0 }}>سلتكِ فارغة · تصفّحي المتجر</SecondaryButton>
      ) : session.loading || loading ? <Loading /> : !session.session ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12.5, color: C.sub2, textAlign: "center" }}>سجّلي الدخول برقم هاتفكِ لإرسال الطلب، ثم تعودين إلى هذه الصفحة.</div>
          <PrimaryButton icon="user" onClick={login} style={{ flexShrink: 0 }}>تسجيل الدخول للمتابعة</PrimaryButton>
        </div>
      ) : !session.patient ? (
        <ErrorNote>هذا الحساب حساب موظفة. الطلب من المتجر متاح لحسابات المراجِعات فقط.</ErrorNote>
      ) : (
        <PrimaryButton onClick={submit} disabled={busy || !canOrder} style={{ flexShrink: 0 }}>{busy ? "جارٍ إرسال الطلب…" : !canOrder ? "عدّلي السلة أولاً" : "تأكيد الطلب"}</PrimaryButton>
      )}
      </div>
      </div>
      </div>
    </PhoneScreen>
  );
}

function Row({ l, r }: { l: React.ReactNode; r: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>{l}{r}</div>;
}
