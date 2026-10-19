"use client";

/** Checkout on tablets & desktop: steps on one side, sticky order summary + confirm on the other. */
import Link from "next/link";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { itemsLabel } from "@/lib/db/orders";
import { Field, ProductPic } from "../c1ui";
import { ModeChoice } from "./DeskCart";
import { StoreChrome } from "./StoreChrome";
import { useCheckout } from "./useCheckout";
import d from "./desk.module.css";

export function DeskCheckout() {
  const { mode, d: dlv, keys, loading, lines, count, sub, canOrder, session, addr, setA, busy, error, login, submit, empty } = useCheckout();

  if (empty) return (
    <StoreChrome active="checkout">
      <div className={d.empty} style={{ marginTop: 56 }}>
        <Icon name="bag" color={C.accentMid} size={38} />
        <h3>لا شيء لإتمام الطلب</h3>
        <p>سلتكِ فارغة. أضيفي منتجات من المتجر ثم عودي لإتمام الطلب.</p>
        <Link href={R.P_Store} className={d.btn} style={{ marginTop: 8 }}><Icon name="bag" color="#FFFFFF" size={19} />تصفّحي المتجر</Link>
      </div>
    </StoreChrome>
  );

  return (
    <StoreChrome active="checkout">
      <nav className={d.crumbs} aria-label="مسار الطلب">
        <Link href={R.P_Cart}>السلة</Link><Icon name="chev" size={14} color={C.muted} /><span aria-current="page">الدفع والتوصيل</span>
      </nav>
      <div className={d.pageHead} style={{ marginTop: 12 }}>
        <h1 className={d.h1}>إتمام الطلب</h1>
      </div>

      <div className={d.two}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <section className={`${d.panel} ${d.panelPad}`} aria-labelledby="s1">
            <div className={d.stepHead}><span className={d.stepBadge}>1</span><h2 id="s1" className={d.panelTitle}>طريقة الاستلام</h2></div>
            <ModeChoice mode={mode} />
            {dlv ? (
              <div className={d.fields}>
                <Field id="city" value={addr.city} onChange={setA("city")} label="المدينة" placeholder="مثلاً: دمشق" />
                <Field id="area" value={addr.area} onChange={setA("area")} label="المنطقة" placeholder="اسم الحي" />
                <Field id="street" value={addr.street} onChange={setA("street")} label="الشارع والبناء" placeholder="الشارع، البناء، الطابق" style={{ gridColumn: "1 / -1" }} />
                <Field id="near" value={addr.near} onChange={setA("near")} label="علامة مميزة قريبة (اختياري)" placeholder="تساعد المندوب في الوصول" style={{ gridColumn: "1 / -1" }} />
              </div>
            ) : (
              <div className={d.sideNote} style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="bell" color={C.accentMid} size={20} />
                <span>استلمي طلبكِ من الاستقبال في أي زيارة. تابعي حالته من «طلباتي»، وسنُعلمكِ حين يصبح جاهزاً.</span>
              </div>
            )}
          </section>

          <section className={`${d.panel} ${d.panelPad}`} aria-labelledby="s2">
            <div className={d.stepHead}><span className={d.stepBadge}>2</span><h2 id="s2" className={d.panelTitle}>طريقة الدفع</h2></div>
            <div className={d.seg} role="radiogroup" aria-label="طريقة الدفع" style={{ gridTemplateColumns: "1fr" }}>
              <button type="button" role="radio" aria-checked className={`${d.segOpt} ${d.segOn}`}>
                <Icon name="cash" color={C.accent} size={22} />
                <span style={{ flex: 1 }}><span className={d.segTitle}>نقداً</span><span className={d.segSub}>عند الاستلام</span></span>
                <span className={d.radio} style={{ borderColor: C.accent }}><span style={{ width: 8, height: 8, borderRadius: 4, background: C.accent }} /></span>
              </button>
            </div>
          </section>
        </div>

        <aside className={d.summary} aria-label="ملخص الطلب">
          <h2 className={d.panelTitle}>ملخص الطلب</h2>
          <div className={d.miniLines}>
            {lines.map(({ p, qty, line }) => (
              <div key={p.key} className={d.miniLine}>
                <span className={d.miniThumb}><ProductPic p={p} width={34} fill /><span className={d.qtyBubble}>{qty}</span></span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <span className={d.lineSub} style={{ display: "block" }}>{p.size}</span>
                </span>
                <span className="latin" style={{ fontWeight: 600 }}>{money(line, false)}</span>
              </div>
            ))}
          </div>
          <div className={d.sumRow} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14 }}><span>{itemsLabel(count)}</span><b><span className="latin">{money(sub, false)}</span> ل.س</b></div>
          <div className={d.sumRow}><span>{dlv ? "رسوم التوصيل" : "الاستلام من المركز"}</span><b>{dlv ? "تُحدَّد عند التأكيد" : "بدون رسوم"}</b></div>
          <div className={d.sumTotal}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>الإجمالي</span>
            <span><span className={d.price}>{money(sub, false)}</span><span className={d.cur}>ل.س{dlv ? " + التوصيل" : ""}</span></span>
          </div>
          {error && <div className={d.low} role="alert">{error}</div>}
          {keys.length === 0 ? null : session.loading || loading ? <div className={d.note}>جارٍ التحميل…</div> : !session.session ? (
            <>
              <div className={d.sumHint}>سجّلي الدخول برقم هاتفكِ لإرسال الطلب، ثم تعودين إلى هذه الصفحة.</div>
              <button type="button" className={d.btn} onClick={login}><Icon name="user" color="#FFFFFF" size={19} />تسجيل الدخول للمتابعة</button>
            </>
          ) : !session.patient ? (
            <div className={d.low}>هذا الحساب حساب موظفة. الطلب من المتجر متاح لحسابات المراجِعات فقط.</div>
          ) : (
            <button type="button" className={d.btn} onClick={submit} disabled={busy || !canOrder}>{busy ? "جارٍ إرسال الطلب…" : !canOrder ? "عدّلي السلة أولاً" : "تأكيد الطلب"}</button>
          )}
          <Link href={R.P_Cart} className={d.linkBtn} style={{ textAlign: "center", fontSize: 14 }}>تعديل السلة</Link>
        </aside>
      </div>
    </StoreChrome>
  );
}
