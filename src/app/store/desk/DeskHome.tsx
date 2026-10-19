"use client";

/**
 * Store home on tablets & desktop: hero slider (admin «واجهة المتجر»), category tiles, best sellers,
 * new arrivals, specialist picks, a routine band, then the full catalogue (categories + sort + grid).
 * Every section is data-driven and hidden when it has nothing real to show.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listStore, productImage, type Product } from "@/lib/db/products";
import { listBestsellers } from "@/lib/db/storefront";
import { cartStore, useCart } from "@/lib/db/orders";
import { ProductPic } from "../c1ui";
import { HeroSlider } from "./HeroSlider";
import { StoreChrome, drawer, productHref } from "./StoreChrome";
import d from "./desk.module.css";

type Sort = "default" | "new" | "low" | "high";
const SORTS: [Sort, string][] = [["default", "المقترح"], ["new", "الأحدث"], ["low", "السعر: من الأقل"], ["high", "السعر: من الأعلى"]];
const ALL = "الكل";
const NEW_DAYS = 30;

/** Best-seller keys (shared cache). */
export function useBest() {
  const { data } = useQuery(["products", "best"], listBestsellers);
  return data ?? [];
}

const isNew = (p: Product) => Date.now() - new Date(p.created_at).getTime() < NEW_DAYS * 864e5;
const buyable = (p: Product) => p.price != null && Number(p.stock) > 0;

/** Routine steps matched from real category names; shown only when all three exist. */
const ROUTINE: [string, string, RegExp][] = [
  ["نظّفي", "بشرة نقية تستقبل ما بعدها", /غسول|تنظيف|منظف|منظّف|صابون/],
  ["عالجي", "مكوّنات فعّالة لحاجة بشرتكِ", /سيروم|علاج|تونر|مصل/],
  ["رطّبي واحمي", "ترطيب يومي وحماية من الشمس", /ترطيب|مرطب|مرطّب|كريم|واقي|حماية/],
];

export function DeskHome() {
  const { data, loading, error } = useQuery(["products", "store"], listStore);
  const best = useBest();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(ALL);
  const [sort, setSort] = useState<Sort>("default");
  const shopRef = useRef<HTMLDivElement>(null);
  // a search / category from another page (or a slide button) arrives as ?q= / ?cat=
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const v = sp.get("q"), c = sp.get("cat");
    if (v) setQ(v);
    if (c) setCat(c);
    if (v || c) requestAnimationFrame(() => shopRef.current?.scrollIntoView({ block: "start" }));
  }, []);

  const products = useMemo(() => data ?? [], [data]);
  const cats = useMemo(() => {
    const m = new Map<string, Product[]>();
    products.forEach((p) => { const c = p.category.trim(); if (c) m.set(c, [...(m.get(c) ?? []), p]); });
    return Array.from(m.entries());
  }, [products]);
  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const recommended = products.filter((p) => p.recommended && buyable(p));
  const bestList = best.map((k) => byKey.get(k)).filter((p): p is Product => !!p && Number(p.stock) > 0);
  const newest = useMemo(() => products.filter(isNew).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10), [products]);
  const routine = useMemo(() => {
    const names = cats.map(([c]) => c);
    const steps = ROUTINE.map(([verb, line, re]) => {
      const c = names.find((n) => re.test(n));
      return c ? { verb, line, cat: c, p: cats.find(([n]) => n === c)?.[1].find((x) => productImage(x)) ?? cats.find(([n]) => n === c)?.[1][0] } : null;
    });
    return steps.every(Boolean) && new Set(steps.map((s) => s!.cat)).size === 3 ? steps.map((s) => s!) : null;
  }, [cats]);

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
  const pickCat = useCallback((c: string, scroll = false) => {
    setCat(c); setQ("");
    if (scroll) requestAnimationFrame(() => shopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);
  // slide buttons pointing at the store itself stay on this page
  const onInternal = useCallback((href: string) => {
    const u = new URL(href, window.location.origin);
    if (u.pathname.replace(/\/$/, "") !== R.P_Store.replace(/\/$/, "")) return false;
    pickCat(u.searchParams.get("cat") || ALL, true);
    return true;
  }, [pickCat]);

  const showRows = browsing && !loading && products.length > 0;

  return (
    <StoreChrome active="store" search={q} onSearch={setQ}>
      {browsing && <HeroSlider onInternal={onInternal} hasPicks={recommended.length > 0} />}
      {browsing && (
        <div className={d.perks}>
          <span><Icon name="truck" color={C.accentMid} size={18} />توصيل للمنزل أو استلام من المركز</span>
          <span><Icon name="cash" color={C.accentMid} size={18} />الدفع نقداً عند الاستلام</span>
          <span><Icon name="shield" color={C.accentMid} size={18} />منتجات معتمدة من أخصائيات المركز</span>
        </div>
      )}

      {showRows && cats.length > 1 && (
        <section className={d.band} aria-labelledby="cats-h">
          <div className={d.secHead}><h2 id="cats-h" className={d.h2}>تسوّقي حسب القسم</h2></div>
          <div className={d.tiles} style={{ ["--n" as string]: Math.min(cats.length, 6) }}>
            {cats.map(([c, list]) => {
              const pic = list.find((p) => productImage(p)) ?? list[0];
              return (
                <button key={c} type="button" className={d.tile} onClick={() => pickCat(c, true)}>
                  <span className={d.tilePic}><span className={d.picArt}><ProductPic p={pic} width={56} fill alt="" /></span></span>
                  <span className={d.tileName}>{c}</span>
                  <span className={d.tileCount}><span className="latin">{list.length}</span> {list.length === 1 ? "منتج" : list.length <= 10 ? "منتجات" : "منتجاً"}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {showRows && bestList.length >= 2 && (
        <Row id="best" title="الأكثر طلباً" sub="ما تعيد المراجِعات طلبه أكثر من غيره.">{bestList.map((p) => <ProductCard key={p.key} p={p} />)}</Row>
      )}

      {showRows && recommended.length > 0 && (
        <Row id="picks" title="توصيات الأخصائية" sub="ما تنصح به أخصائيات المركز لروتين يومي متوازن.">{recommended.map((p) => <ProductCard key={p.key} p={p} />)}</Row>
      )}

      {showRows && routine && (
        <section className={d.routine} aria-labelledby="routine-h">
          <div className={d.routineHead}>
            <h2 id="routine-h" className={d.routineTitle}>روتينكِ في 3 خطوات</h2>
            <p className={d.routineLead}>ثلاث خطوات صباحاً ومساءً تكفي لبشرة متوازنة. اختاري من كل قسم ما يناسب نوع بشرتكِ.</p>
          </div>
          <ol className={d.routineSteps}>
            {routine.map((s, i) => (
              <li key={s.cat}>
                <button type="button" className={d.routineStep} onClick={() => pickCat(s.cat, true)}>
                  <span className={d.routinePic}>{s.p && <span className={d.picArt}><ProductPic p={s.p} width={50} fill alt="" /></span>}</span>
                  <span className={d.routineNo} aria-hidden><span className="latin">{i + 1}</span></span>
                  <span className={d.routineVerb}>{s.verb}</span>
                  <span className={d.routineLine}>{s.line}</span>
                  <span className={d.routineCat}>{s.cat}<Icon name="fwd" size={15} color="#FFFFFF" /></span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {showRows && newest.length >= 2 && (
        <Row id="new" title="وصل حديثاً" sub="أحدث ما أضافته أخصائيات المركز إلى المتجر.">{newest.map((p) => <ProductCard key={p.key} p={p} />)}</Row>
      )}

      <div ref={shopRef} className={d.shop} style={browsing ? undefined : { marginTop: 32 }}>
        <aside className={d.side} aria-label="تصفية المنتجات">
          {cats.length > 0 && (
            <div>
              <h2 className={d.sideTitle}>الأقسام</h2>
              <ul className={d.catList}>
                {[[ALL, products.length] as [string, number], ...cats.map(([c, l]) => [c, l.length] as [string, number])].map(([c, n]) => (
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
            <Link href="/book/">احجزي موعداً</Link>
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

/** Horizontal product row with arrows (scroll-snap, hidden scrollbar). */
export function Row({ id, title, sub, children, action }: { id: string; title: string; sub?: string; children: ReactNode[]; action?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const measure = useCallback(() => {
    const el = ref.current; if (!el) return;
    const x = Math.abs(el.scrollLeft); // RTL: scrollLeft is 0 → negative
    setEdge({ start: x < 4, end: x + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children.length]);
  const go = (dir: 1 | -1) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: -dir * el.clientWidth * 0.9, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const scrolls = !(edge.start && edge.end);
  return (
    <section className={d.band} aria-labelledby={`${id}-h`}>
      <div className={d.secHead}>
        <div>
          <h2 id={`${id}-h`} className={d.h2}>{title}</h2>
          {sub && <p className={d.secSub}>{sub}</p>}
        </div>
        <div className={d.rowTools}>
          {action}
          {scrolls && <>
            <button type="button" className={d.arrow} onClick={() => go(-1)} disabled={edge.start} aria-label={`السابق في ${title}`}><Icon name="back" size={18} color={C.accent} /></button>
            <button type="button" className={d.arrow} onClick={() => go(1)} disabled={edge.end} aria-label={`التالي في ${title}`}><Icon name="fwd" size={18} color={C.accent} /></button>
          </>}
        </div>
      </div>
      <div ref={ref} className={d.rail} onScroll={measure}>{children}</div>
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
    ? <span className={d.priceWrap}><span className={d.price}>{money(p.price, false)}</span><span className={d.cur}>ل.س</span></span>
    : <span className={d.size} style={{ color: C.accent, fontWeight: 600 }}>اسألي عن السعر</span>;
}

/** Badges in priority order (at most two). */
export function badgesFor(p: Product, best: string[]) {
  const stock = Number(p.stock);
  const out: [string, string][] = [];
  if (stock <= 0) return [["غير متوفر", "out"]] as [string, string][];
  if (best.slice(0, 3).includes(p.key)) out.push(["الأكثر مبيعاً", "best"]);
  if (p.recommended) out.push(["توصية", "rec"]);
  if (isNew(p)) out.push(["جديد", "new"]);
  if (stock <= 3) out.unshift(["قريباً ينفد", "low"]);
  return out.slice(0, 2);
}

export function ProductCard({ p }: { p: Product }) {
  const best = useBest();
  const out = Number(p.stock) <= 0;
  const { inCart, room, add } = useQuickAdd(p);
  const href = productHref(p.key);
  const badges = badgesFor(p, best);
  return (
    <article className={d.card}>
      <div className={d.picBox}>
        <Link href={href} className={d.pic} aria-label={p.name} tabIndex={-1}>
          <span className={d.picArt}><ProductPic p={p} width={84} fill alt="" /></span>
          {out && <span className={d.outVeil} />}
        </Link>
        {badges.length > 0 && (
          <span className={d.badges}>
            {badges.map(([t, k]) => <span key={k} className={`${d.badge} ${d[`b_${k}`] ?? ""}`}>{k === "rec" && <Icon name="sparkle" color={C.accent} size={12} />}{t}</span>)}
          </span>
        )}
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
      </div>
    </article>
  );
}
