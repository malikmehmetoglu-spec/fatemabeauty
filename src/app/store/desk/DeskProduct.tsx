"use client";

/** Product page on tablets & desktop: square gallery, details & buy box, then related products. */
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listStore, productImage, type Product } from "@/lib/db/products";
import { cartStore, useCart } from "@/lib/db/orders";
import { ProductPic } from "../c1ui";
import { ProductCard, Row, badgesFor, useBest } from "./DeskHome";
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
  const best = useBest();
  const badges = badgesFor(p, best);
  const { data: all } = useQuery(["products", "store"], listStore);
  const others = (all ?? []).filter((x) => x.key !== p.key);
  const related = [
    ...others.filter((x) => p.category && x.category.trim() === p.category.trim()),
    ...others.filter((x) => x.recommended && x.category.trim() !== p.category.trim()),
    ...others.filter((x) => !x.recommended && x.category.trim() !== p.category.trim()),
  ].slice(0, 10);
  const tabs = ([["desc", "الوصف", !!p.description], ["use", "طريقة الاستخدام", steps.length > 0]] as const).filter((t) => t[2]);
  const [tab, setTab] = useState<string>(tabs[0]?.[0] ?? "desc");
  const canBuy = !out && p.price != null && room > 0;
  const add = () => { cartStore.add(p.key, q); setQty(1); drawer.open(); };

  // sticky bar once the buy box scrolls out of view
  const buyRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState(false);
  useEffect(() => {
    const el = buyRef.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setStick(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-84px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <StoreChrome active="product">
      <nav className={d.crumbs} aria-label="مسار التصفح">
        <Link href={R.P_Store}>المتجر</Link>
        <Icon name="chev" size={14} color={C.muted} />
        {p.category && <><Link href={`${R.P_Store}?cat=${encodeURIComponent(p.category.trim())}`}>{p.category}</Link><Icon name="chev" size={14} color={C.muted} /></>}
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className={d.pdp}>
        <Gallery p={p} badges={badges} />

        <div className={d.info}>
          <div>
            {p.category && <span className={d.cat} style={{ fontSize: 14 }}>{p.category}</span>}
            <h1 className={d.pTitle}>{p.name}</h1>
          </div>
          <div className={d.pPrice}>
            {p.price != null ? <><span className={d.price}>{money(price, false)}</span><span className={d.cur} style={{ fontSize: 16 }}>ل.س</span></>
              : <span className={d.price} style={{ fontSize: 22 }}>اسألي عن السعر</span>}
          </div>
          <div className={d.pTags}>
            {p.size && <span className={d.pill}><Icon name="drop" size={15} color={C.accentMid} />الحجم {p.size}</span>}
            {p.recommended && <span className={d.pill}><Icon name="sparkle" size={15} color={C.accentMid} />توصية الأخصائية</span>}
            {out ? <span className={d.stock} style={{ color: C.sub2 }}><span className={d.dot} style={{ background: C.muted }} />غير متوفر حالياً</span>
              : stock <= 5 ? <span className={d.stock} style={{ color: C.danger }}><span className={d.dot} style={{ background: C.danger }} />بقي <span className="latin">{stock}</span> فقط</span>
              : <span className={d.stock} style={{ color: C.okDeep }}><span className={d.dot} style={{ background: C.ok }} />متوفر</span>}
          </div>

          <div className={d.buy} ref={buyRef}>
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
              <button type="button" className={d.btn} onClick={add}>
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

          {tabs.length > 0 && (
            <div className={d.tabsBox}>
              <div className={d.tabs} role="tablist" aria-label="تفاصيل المنتج">
                {tabs.map(([k, label]) => (
                  <button key={k} type="button" role="tab" id={`t-${k}`} aria-controls={`tp-${k}`} aria-selected={tab === k}
                    className={`${d.tab} ${tab === k ? d.tabOn : ""}`} onClick={() => setTab(k)}>{label}</button>
                ))}
              </div>
              {tab === "desc" && p.description && <div role="tabpanel" id="tp-desc" aria-labelledby="t-desc" className={d.tabPanel}><p className={d.prose}>{p.description}</p></div>}
              {tab === "use" && steps.length > 0 && (
                <div role="tabpanel" id="tp-use" aria-labelledby="t-use" className={d.tabPanel}>
                  <ol className={d.steps}>{steps.map((t, i) => <li key={i}><span className={d.stepNo}>{i + 1}</span>{t}</li>)}</ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className={d.related}>
          <Row id="rel" title="قد يعجبكِ أيضاً" action={<Link href={R.P_Store} className={d.linkBtn}>كل المنتجات</Link>}>
            {related.map((x) => <ProductCard key={x.key} p={x} />)}
          </Row>
        </div>
      )}

      <div className={`${d.stickyBar} ${stick ? d.stickyOn : ""}`} aria-hidden={!stick} inert={!stick}>
        <div className={d.stickyIn}>
          <span className={d.stickyThumb}><ProductPic p={p} width={30} fill alt="" /></span>
          <span className={d.stickyName}>{p.name}</span>
          {p.price != null && <span className={d.priceWrap}><span className={d.price}>{money(price, false)}</span><span className={d.cur}>ل.س</span></span>}
          {canBuy
            ? <button type="button" className={d.btn} style={{ height: 46, fontSize: 15 }} onClick={add}><Icon name="bag" color="#FFFFFF" size={17} />أضيفي إلى السلة</button>
            : <button type="button" className={d.btnGhost} style={{ height: 46, fontSize: 15 }} onClick={() => buyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}>التفاصيل</button>}
        </div>
      </div>
    </StoreChrome>
  );
}

/** Rounded-square gallery with hover zoom that follows the pointer. */
function Gallery({ p, badges }: { p: Product; badges: [string, string][] }) {
  const img = productImage(p);
  const [origin, setOrigin] = useState<string | null>(null);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <div className={`${d.gallery} ${img ? d.galleryZoom : ""}`} onMouseMove={img ? move : undefined} onMouseLeave={() => setOrigin(null)}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={p.name} className={d.zoomImg} style={origin ? { transformOrigin: origin, transform: "scale(1.8)" } : undefined} />
      ) : <span className={d.galleryArt}><ProductPic p={p} width={110} fill alt={p.name} /></span>}
      {badges.length > 0 && (
        <span className={d.badges} style={{ top: 18, right: 18 }}>
          {badges.map(([t, k]) => <span key={k} className={`${d.badge} ${d[`b_${k}`] ?? ""}`}>{t}</span>)}
        </span>
      )}
    </div>
  );
}
