"use client";

/** Store home on tablets & desktop: hero shelf, «توصيات فاطمة», categories + sort, product grid. */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listStore, type Product } from "@/lib/db/products";
import { cartStore, useCart } from "@/lib/db/orders";
import { ProductPic } from "../c1ui";
import { BOOK, StoreChrome, drawer, productHref } from "./StoreChrome";
import d from "./desk.module.css";

type Sort = "default" | "new" | "low" | "high";
const SORTS: [Sort, string][] = [["default", "المقترح"], ["new", "الأحدث"], ["low", "السعر: من الأقل"], ["high", "السعر: من الأعلى"]];
const ALL = "الكل";

export function DeskHome() {
  const { data, loading, error } = useQuery(["products", "store"], listStore);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [sort, setSort] = useState<Sort>("default");
  // a search submitted from another store page arrives as ?q=
  useEffect(() => { const v = new URLSearchParams(window.location.search).get("q"); if (v) setQ(v); }, []);

  const products = useMemo(() => data ?? [], [data]);
  const cats = useMemo(() => {
    const m = new Map<string, number>();
    products.forEach((p) => { const c = p.category.trim(); if (c) m.set(c, (m.get(c) ?? 0) + 1); });
    return Array.from(m.entries());
  }, [products]);
  const recommended = products.filter((p) => p.recommended && p.price != null && Number(p.stock) > 0);

  const needle = q.trim().toLowerCase();
  const shown = useMemo(() => {
    const list = products.filter((p) => needle
      ? [p.name, p.category, p.size, p.description].some((t) => t.toLowerCase().includes(needle))
      : cat === ALL || p.category.trim() === cat);
    const price = (p: Product) => p.price ?? Number.MAX_SAFE_INTEGER;
    if (sort === "new") list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "low") list.sort((a, b) => price(a) - price(b));
    if (sort === "high") list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return list;
  }, [products, needle, cat, sort]);

  const browsing = !needle && cat === ALL;
  const title = needle ? "نتائج البحث" : cat === ALL ? "كل المنتجات" : cat;
  const pickCat = (c: string) => { setCat(c); setQ(""); };

  return (
    <StoreChrome active="store" search={q} onSearch={setQ}>
      {browsing && <Hero picks={recommended.slice(0, 3)} />}
      {browsing && (
        <div className={d.perks}>
          <span><Icon name="truck" color={C.accentMid} size={18} />توصيل للمنزل أو استلام من المركز</span>
          <span><Icon name="cash" color={C.accentMid} size={18} />الدفع نقداً عند الاستلام</span>
          <span><Icon name="shield" color={C.accentMid} size={18} />منتجات معتمدة من أخصائيات المركز</span>
        </div>
      )}

      <div className={d.shop} style={browsing ? undefined : { marginTop: 32 }}>
        <aside className={d.side} aria-label="تصفية المنتجات">
          {cats.length > 0 && (
            <div>
              <h2 className={d.sideTitle}>الأقسام</h2>
              <ul className={d.catList}>
                {[[ALL, products.length] as [string, number], ...cats].map(([c, n]) => (
                  <li key={c}>
                    <button type="button" aria-pressed={!needle && cat === c} className={`${d.catBtn} ${!needle && cat === c ? d.catOn : ""}`} onClick={() => pickCat(c)}>
                      <span className={d.catName}>{c}</span><span className={d.catCount}>{n}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {products.length > 1 && (
            <div>
              <h2 className={d.sideTitle}>الترتيب</h2>
              <div className={d.sortList} role="radiogroup" aria-label="ترتيب المنتجات">
                {SORTS.map(([k, label]) => (
                  <button key={k} type="button" role="radio" aria-checked={sort === k} className={`${d.sortOpt} ${sort === k ? d.sortOn : ""}`} onClick={() => setSort(k)}>
                    <span className={d.radio} />{label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={d.sideNote}>
            <span><b>لستِ متأكدة مما يناسبكِ؟</b> احجزي استشارة في المركز وستختار لكِ الأخصائية روتينكِ.</span>
            <Link href={BOOK}>احجزي موعداً</Link>
          </div>
        </aside>

        <div className={d.content}>
          {cats.length > 0 && (
            <div className={d.bar}>
              <div className={d.pills}>
                {[ALL, ...cats.map(([c]) => c)].map((c) => (
                  <button key={c} type="button" aria-pressed={!needle && cat === c} className={`${d.pillBtn} ${!needle && cat === c ? d.pillOn : ""}`} onClick={() => pickCat(c)}>{c}</button>
                ))}
              </div>
              <label className={d.srOnly} htmlFor="sort-sel">ترتيب المنتجات</label>
              <select id="sort-sel" className={d.select} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </div>
          )}

          {browsing && recommended.length > 0 && (
            <section id="picks" aria-labelledby="picks-h">
              <div className={d.secHead}>
                <div>
                  <h2 id="picks-h" className={d.h2}>توصيات فاطمة</h2>
                  <p className={d.secSub}>ما تنصح به أخصائيات المركز لروتين يومي متوازن.</p>
                </div>
              </div>
              <div className={`${d.recGrid} ${recommended.length === 3 ? d.recThree : ""}`}>
                {recommended.slice(0, 4).map((p) => <RecCard key={p.key} p={p} />)}
              </div>
            </section>
          )}

          <section aria-labelledby="all-h">
            <div className={d.secHead}>
              <h2 id="all-h" className={d.h2}>{title}</h2>
              {!loading && products.length > 0 && <span className={d.resultCount}><span className="latin">{shown.length}</span> {shown.length === 1 ? "منتج" : "منتجات"}</span>}
            </div>
            {loading ? <div className={d.note}>جارٍ تحميل المتجر…</div>
              : error ? <div className={d.empty}><h3>تعذّر تحميل المتجر</h3><p>{error}</p></div>
              : products.length === 0 ? (
                <div className={d.empty}>
                  <Icon name="bag" color={C.accentMid} size={36} />
                  <h3>المتجر قيد التجهيز</h3>
                  <p>ستظهر هنا منتجات العناية التي يعتمدها المركز فور إضافتها. يمكنكِ السؤال عن أي منتج عبر المحادثة.</p>
                  <Link href={R.P_Chat} className={d.linkBtn}>راسلي المركز</Link>
                </div>
              ) : shown.length === 0 ? (
                <div className={d.empty}>
                  <h3>لا توجد منتجات مطابقة</h3>
                  <p>جرّبي كلمة أخرى أو تصفّحي كل المنتجات.</p>
                  <button type="button" className={d.linkBtn} onClick={() => pickCat(ALL)}>عرض كل المنتجات</button>
                </div>
              ) : (
                <div className={d.grid}>{shown.map((p) => <ProductCard key={p.key} p={p} />)}</div>
              )}
          </section>
        </div>
      </div>
    </StoreChrome>
  );
}

function Hero({ picks }: { picks: Product[] }) {
  return (
    <section className={d.hero} aria-labelledby="hero-h">
      <div className={d.heroText}>
        <span className={d.heroKicker}>متجر فاطمة بيوتي</span>
        <h1 id="hero-h" className={d.heroTitle}>روتين بشرتكِ،<br />كما تختاره أخصائيتكِ</h1>
        <p className={d.heroLead}>منتجات عناية معتمدة في المركز، تصلكِ إلى البيت أو تستلمينها في زيارتكِ القادمة.</p>
        <div className={d.heroCtas}>
          <a href={picks.length ? "#picks" : "#all-h"} className={d.btnLight}><Icon name="sparkle" color={C.accent} size={18} />{picks.length ? "تسوّقي التوصيات" : "تسوّقي المنتجات"}</a>
          <Link href={BOOK} className={d.btnOutline}><Icon name="cal" color="#FFFFFF" size={18} />احجزي استشارة</Link>
        </div>
      </div>
      <div className={d.stage} aria-hidden={picks.length === 0}>
        {picks.length === 0 ? (
          <div className={d.niche} style={{ maxWidth: 220 }}><span className={d.nicheArt}><Logo height={90} /></span></div>
        ) : picks.map((p) => (
          <Link key={p.key} href={productHref(p.key)} className={d.niche} aria-label={p.name}>
            <span className={d.nicheArt}><ProductPic p={p} width={70} fill alt="" /></span>
            <span className={d.nicheLabel}>{p.category || p.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Adds one, capped at stock, and opens the drawer. */
export function useQuickAdd(p: Product) {
  const cart = useCart();
  const inCart = cart[p.key] ?? 0;
  const room = Math.max(0, Math.floor(Number(p.stock)) - inCart);
  return { inCart, room, add: () => { if (room > 0) cartStore.add(p.key, 1); drawer.open(); } };
}

function Price({ p }: { p: Product }) {
  return p.price != null
    ? <span><span className={d.price}>{money(p.price, false)}</span><span className={d.cur}>ل.س</span></span>
    : <span className={d.size} style={{ color: C.accent, fontWeight: 600 }}>اسألي عن السعر</span>;
}

export function ProductCard({ p }: { p: Product }) {
  const out = Number(p.stock) <= 0;
  const { inCart, room, add } = useQuickAdd(p);
  const href = productHref(p.key);
  const low = !out && Number(p.stock) <= 3;
  return (
    <article className={d.card}>
      <div style={{ position: "relative" }}>
        <Link href={href} className={d.pic} aria-label={p.name}>
          <span className={d.picArt}><ProductPic p={p} width={84} fill alt="" /></span>
          {out && <span className={d.outVeil} />}
          {out ? <span className={`${d.badge} ${d.badgeOut}`}>غير متوفر حالياً</span>
            : p.recommended && <span className={d.badge}><Icon name="sparkle" color={C.accent} size={13} />توصية</span>}
        </Link>
        {!out && p.price != null && (
          <button type="button" className={`${d.quick} ${inCart ? d.quickIn : ""}`} onClick={add} aria-label={room > 0 ? `أضيفي ${p.name} للسلة` : `${p.name} في سلتكِ`}>
            <Icon name={inCart ? "check" : "plus"} color={inCart ? C.accent : "#FFFFFF"} size={17} stroke={2.2} />
            {inCart ? (room > 0 ? `في السلة (${inCart}) · أضيفي واحدة` : "الكمية كلها في سلتكِ") : "أضيفي للسلة"}
          </button>
        )}
      </div>
      <div className={d.meta}>
        {p.category && <span className={d.cat}>{p.category}</span>}
        <Link href={href} className={d.name} title={p.name}>{p.name}</Link>
        <div className={d.priceRow}>
          <Price p={p} />
          {p.size && <span className={d.size}>{p.size}</span>}
        </div>
        {low && <span className={d.low}>بقي <span className="latin">{Number(p.stock)}</span> فقط</span>}
      </div>
    </article>
  );
}

function RecCard({ p }: { p: Product }) {
  const { inCart, room, add } = useQuickAdd(p);
  return (
    <article className={d.rec}>
      <Link href={productHref(p.key)} className={d.recPic} aria-label={p.name}>
        <span className={d.picArt}><ProductPic p={p} width={64} fill alt="" /></span>
      </Link>
      <div className={d.recBody}>
        <span className={d.cat}>{[p.category, p.size].filter(Boolean).join("، ")}</span>
        <Link href={productHref(p.key)} className={d.name}>{p.name}</Link>
        {p.description && <span className={d.recNote}>{p.description}</span>}
        <div className={d.priceRow} style={{ alignItems: "center" }}>
          <Price p={p} />
          <button type="button" className={d.btnGhost} style={{ height: 40, padding: "0 16px", fontSize: 14 }} onClick={add} disabled={room <= 0 && inCart > 0}>
            <Icon name={inCart ? "check" : "plus"} color={C.accent} size={16} stroke={2.2} />{inCart ? "في السلة" : "أضيفي"}
          </button>
        </div>
      </div>
    </article>
  );
}
