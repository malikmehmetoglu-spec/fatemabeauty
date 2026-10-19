"use client";

/** Product page on tablets & desktop: square gallery, details & buy box, then related products. */
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listStore, type Product } from "@/lib/db/products";
import { cartStore, useCart } from "@/lib/db/orders";
import { ProductPic } from "../c1ui";
import { ProductCard } from "./DeskHome";
import { StoreChrome, drawer } from "./StoreChrome";
import d from "./desk.module.css";

export function DeskProductState({ title, text }: { title: string; text: string }) {
  return (
    <StoreChrome active="product">
      <div className={d.empty} style={{ marginTop: 48 }}>
        <Icon name="bag" color={C.accentMid} size={36} />
        <h3>{title}</h3>
        <p>{text}</p>
        <Link href={R.P_Store} className={d.linkBtn}>العودة إلى المتجر</Link>
      </div>
    </StoreChrome>
  );
}

export function DeskLoading() {
  return <StoreChrome active="product"><div className={d.note} style={{ padding: "64px 0", textAlign: "center" }}>جارٍ التحميل…</div></StoreChrome>;
}

export function DeskProduct({ p }: { p: Product }) {
  const price = p.price ?? 0;
  const stock = Number(p.stock);
  const out = stock <= 0;
  const inCart = useCart()[p.key] ?? 0;
  const room = Math.max(0, Math.floor(stock) - inCart);
  const [qty, setQty] = useState(1);
  const q = Math.max(1, Math.min(qty, room));
  const steps = p.usage.split(/\n+/).map((t) => t.trim()).filter(Boolean);
  const { data: all } = useQuery(["products", "store"], listStore);
  const others = (all ?? []).filter((x) => x.key !== p.key);
  const related = [
    ...others.filter((x) => p.category && x.category.trim() === p.category.trim()),
    ...others.filter((x) => x.recommended && x.category.trim() !== p.category.trim()),
    ...others.filter((x) => !x.recommended && x.category.trim() !== p.category.trim()),
  ].slice(0, 4);

  return (
    <StoreChrome active="product">
      <nav className={d.crumbs} aria-label="مسار التصفح">
        <Link href={R.P_Store}>المتجر</Link>
        <Icon name="chev" size={14} color={C.muted} />
        {p.category && <><span>{p.category}</span><Icon name="chev" size={14} color={C.muted} /></>}
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className={d.pdp}>
        <div className={d.gallery}>
          <span className={d.galleryArt}><ProductPic p={p} width={110} fill alt={p.name} /></span>
          {out ? <span className={`${d.badge} ${d.badgeOut}`} style={{ top: "auto", bottom: 22, right: "50%", transform: "translateX(50%)" }}>غير متوفر حالياً</span>
            : p.recommended && <span className={d.badge} style={{ top: "auto", bottom: 22, right: "50%", transform: "translateX(50%)" }}><Icon name="sparkle" color={C.accent} size={13} />توصية الأخصائية</span>}
        </div>

        <div className={d.info}>
          <div>
            {p.category && <span className={d.cat} style={{ fontSize: 14 }}>{p.category}</span>}
            <h1 className={d.pTitle}>{p.name}</h1>
          </div>
          <div className={d.pTags}>
            {p.size && <span className={d.pill}><Icon name="drop" size={15} color={C.accentMid} />الحجم {p.size}</span>}
            {out ? <span className={d.stock} style={{ color: C.sub2 }}><span className={d.dot} style={{ background: C.muted }} />غير متوفر حالياً</span>
              : stock <= 5 ? <span className={d.stock} style={{ color: C.danger }}><span className={d.dot} style={{ background: C.danger }} />بقي <span className="latin">{stock}</span> فقط</span>
              : <span className={d.stock} style={{ color: C.okDeep }}><span className={d.dot} style={{ background: C.ok }} />متوفر</span>}
          </div>
          <div className={d.pPrice}>
            {p.price != null ? <><span className={d.price}>{money(price, false)}</span><span className={d.cur} style={{ fontSize: 16 }}>ل.س</span></>
              : <span className={d.price} style={{ fontSize: 22 }}>اسألي عن السعر</span>}
          </div>

          <div className={d.buy}>
            {out || p.price == null ? (
              <Link href={R.P_Chat} className={d.btnGhost} style={{ flex: 1 }}><Icon name="msg" color={C.accent} size={18} />{out ? "اسألي المركز عن توفّره" : "اسألي عن السعر"}</Link>
            ) : room <= 0 ? (
              <button type="button" className={d.btnGhost} style={{ flex: 1 }} onClick={drawer.open}><Icon name="bag" color={C.accent} size={18} />الكمية المتوفرة كلها في سلتكِ</button>
            ) : <>
              <div className={d.stepper}>
                <button type="button" aria-label="زيادة الكمية" disabled={q >= room} onClick={() => setQty(Math.min(room, q + 1))}><Icon name="plus" color={C.accent} size={16} stroke={2.2} /></button>
                <output className="latin" aria-live="polite">{q}</output>
                <button type="button" aria-label="إنقاص الكمية" disabled={q <= 1} onClick={() => setQty(Math.max(1, q - 1))}><Icon name="minus" color={C.accent} size={16} stroke={2.2} /></button>
              </div>
              <button type="button" className={d.btn} onClick={() => { cartStore.add(p.key, q); setQty(1); drawer.open(); }}>
                <Icon name="bag" color="#FFFFFF" size={19} stroke={1.9} />أضيفي إلى السلة
                <span className="latin" style={{ opacity: 0.85, fontWeight: 500 }}>· {money(q * price, false)}</span>
              </button>
            </>}
            {inCart > 0 && <div className={d.note} style={{ flexBasis: "100%" }}>في سلتكِ الآن: <span className="latin">{inCart}</span></div>}
          </div>

          <div className={d.assure}>
            <div><Icon name="truck" color={C.accentMid} size={19} />توصيل للمنزل أو استلام من المركز</div>
            <div><Icon name="cash" color={C.accentMid} size={19} />الدفع نقداً عند الاستلام</div>
          </div>

          {p.description && (
            <div className={d.block}>
              <h2 className={d.blockTitle}>عن المنتج</h2>
              <p className={d.prose}>{p.description}</p>
            </div>
          )}
          {steps.length > 0 && (
            <div className={d.block}>
              <h2 className={d.blockTitle}>طريقة الاستخدام</h2>
              <ol className={d.steps}>
                {steps.map((t, i) => <li key={i}><span className={d.stepNo}>{i + 1}</span>{t}</li>)}
              </ol>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className={d.related} aria-labelledby="rel-h">
          <div className={d.secHead}>
            <h2 id="rel-h" className={d.h2}>قد يعجبكِ أيضاً</h2>
            <Link href={R.P_Store} className={d.linkBtn}>كل المنتجات</Link>
          </div>
          <div className={d.grid}>{related.map((x) => <ProductCard key={x.key} p={x} />)}</div>
        </section>
      )}
    </StoreChrome>
  );
}
