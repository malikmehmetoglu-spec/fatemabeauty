"use client";

/** Cart on tablets & desktop: lines on one side, sticky summary on the other. Same live logic as the phone cart. */
import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { cartLines, cartStore, getProductsByKeys, itemsLabel, setMode, useCart, useLiveRefresh, useMode } from "@/lib/db/orders";
import { ProductPic } from "../c1ui";
import { SmallStepper, StoreChrome, productHref } from "./StoreChrome";
import d from "./desk.module.css";

export function ModeChoice({ mode }: { mode: "d" | "p" }) {
  const opts: ["d" | "p", string, string, string][] = [
    ["d", "truck", "توصيل للمنزل", "رسوم التوصيل تُحدَّد عند التأكيد"],
    ["p", "home", "استلام من المركز", "بدون رسوم، في أي زيارة"],
  ];
  return (
    <div className={d.seg} role="radiogroup" aria-label="طريقة الاستلام">
      {opts.map(([k, icon, t, s]) => (
        <button key={k} type="button" role="radio" aria-checked={mode === k} className={`${d.segOpt} ${mode === k ? d.segOn : ""}`} onClick={() => setMode(k)}>
          <Icon name={icon} color={C.accent} size={22} />
          <span style={{ flex: 1, minWidth: 0 }}><span className={d.segTitle}>{t}</span><span className={d.segSub}>{s}</span></span>
          <span className={d.radio} style={mode === k ? { borderColor: C.accent } : undefined}>{mode === k && <span style={{ width: 8, height: 8, borderRadius: 4, background: C.accent }} />}</span>
        </button>
      ))}
    </div>
  );
}

export function DeskCart() {
  const cart = useCart();
  const mode = useMode();
  const keys = Object.keys(cart).sort();
  const { data, loading, error, refresh } = useQuery(["products", "cart", keys.join(",")], () => getProductsByKeys(keys), { enabled: keys.length > 0 });
  useLiveRefresh(keys.length > 0 ? refresh : null);
  const { lines, missing, count, sub, canOrder } = cartLines(cart, data);
  useEffect(() => { if (data) missing.forEach((k) => cartStore.set(k, 0)); }, [data, missing]);
  const dlv = mode === "d";

  if (keys.length === 0 || (data && !error && lines.length === 0)) return (
    <StoreChrome active="cart">
      <div className={d.empty} style={{ marginTop: 56 }}>
        <Icon name="bag" color={C.accentMid} size={38} />
        <h3>سلتكِ فارغة</h3>
        <p>أضيفي منتجات العناية من المتجر، وستظهر هنا مع أسعارها المحدّثة.</p>
        <Link href={R.P_Store} className={d.btn} style={{ marginTop: 8 }}><Icon name="bag" color="#FFFFFF" size={19} />تصفّحي المتجر</Link>
      </div>
    </StoreChrome>
  );

  return (
    <StoreChrome active="cart">
      <div className={d.pageHead}>
        <div>
          <h1 className={d.h1}>سلتكِ</h1>
          <div className={d.secSub}>{itemsLabel(count)} · الأسعار والكميات محدّثة من المركز</div>
        </div>
        <Link href={R.P_Store} className={d.linkBtn} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="back" color={C.accent} size={16} />متابعة التسوّق</Link>
      </div>

      <div className={d.two}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>
          <div className={d.panel}>
            {loading && !data && <div className={d.note} style={{ padding: "24px 0" }}>جارٍ تحميل السلة…</div>}
            {error && <div className={d.low} style={{ padding: "20px 0" }}>تعذّر تحميل السلة: {error}</div>}
            {lines.map(({ p, qty, line, problem }) => (
              <div key={p.key} className={d.line}>
                <Link href={productHref(p.key)} className={d.thumb} aria-label={p.name}><ProductPic p={p} width={56} fill /></Link>
                <div style={{ minWidth: 0 }}>
                  <Link href={productHref(p.key)} className={d.lineName}>{p.name}</Link>
                  <div className={d.lineSub}>{[p.category, p.size].filter(Boolean).join("، ")} · <span className="latin">{money(p.price ?? 0, false)}</span> ل.س للقطعة</div>
                  {problem && <div className={d.low}>{problem}</div>}
                  <button type="button" className={d.remove} onClick={() => cartStore.set(p.key, 0)}><Icon name="trash" size={14} color="currentColor" />إزالة</button>
                </div>
                <SmallStepper qty={qty} min={1} max={Math.max(qty, Math.floor(Number(p.stock)))} onChange={(q) => cartStore.set(p.key, q)} />
                <div className={d.lineTotal}><span className={d.price}>{money(line, false)}</span><span className={d.cur}>ل.س</span></div>
              </div>
            ))}
          </div>

          <div>
            <h2 className={d.panelTitle} style={{ marginBottom: 14 }}>طريقة الاستلام</h2>
            <ModeChoice mode={mode} />
          </div>
        </div>

        <aside className={d.summary} aria-label="ملخص السلة">
          <h2 className={d.panelTitle}>ملخص الطلب</h2>
          <div className={d.sumRow}><span>المجموع الفرعي · {itemsLabel(count)}</span><b><span className="latin">{money(sub, false)}</span> ل.س</b></div>
          <div className={d.sumRow}><span>{dlv ? "رسوم التوصيل" : "الاستلام من المركز"}</span><b>{dlv ? "تُحدَّد عند التأكيد" : "بدون رسوم"}</b></div>
          <div className={d.sumTotal}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>الإجمالي</span>
            <span><span className={d.price}>{money(sub, false)}</span><span className={d.cur}>ل.س</span></span>
          </div>
          <div className={d.sumHint}>{dlv ? "يُضاف رسم التوصيل بعد تأكيد العنوان." : "سنرسل لكِ رسالة حين يصبح طلبكِ جاهزاً."}</div>
          {lines.length > 0 && !canOrder && <div className={d.low}>عدّلي الكميات المعلَّمة قبل المتابعة.</div>}
          {canOrder ? <Link href={R.P_Checkout} className={d.btn}>متابعة الدفع</Link> : <span className={d.btn} aria-disabled="true">متابعة الدفع</span>}
          <div className={d.note} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><Icon name="cash" color={C.accentMid} size={17} />الدفع نقداً عند الاستلام</div>
        </aside>
      </div>
    </StoreChrome>
  );
}
