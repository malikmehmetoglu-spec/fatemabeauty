"use client";

/**
 * Store chrome for tablets & desktop (≥768px): full-width header (logo, nav, search, account, cart),
 * a cart drawer and the footer — the /site visual language. Phones keep PhoneScreen + the tab bar.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { cartCount, cartLines, cartStore, getProductsByKeys, itemsLabel, useCart } from "@/lib/db/orders";
import { getPublicInfo } from "@/lib/db/publicBooking";
import { useSession } from "@/lib/supabase/session";
import { ProductPic } from "../c1ui";
import d from "./desk.module.css";

export const BOOK = "/book/";
export const productHref = (key: string) => `${R.P_Product}?key=${encodeURIComponent(key)}`;

/** true from 768px up; null before the first client render (static export). */
export function useDesktop() {
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    const on = () => setV(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

/** Blank brand background while the layout is decided (one frame). */
export function Blank() {
  return <div style={{ minHeight: "100dvh", background: "#F4EBF7" }} />;
}

// ---- cart drawer open state (shared by header & "add to cart" buttons) ----
let drawerOpen = false;
const subs = new Set<() => void>();
export const drawer = {
  open() { drawerOpen = true; subs.forEach((f) => f()); },
  close() { drawerOpen = false; subs.forEach((f) => f()); },
};
function useDrawer() {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => drawerOpen, () => false);
}

type Nav = "store" | "cart" | "checkout" | "product";

export function StoreChrome({ children, active = "store", search, onSearch }: {
  children: ReactNode; active?: Nav;
  /** Home page: live search. Other pages: submitting the search opens the store with ?q=. */
  search?: string; onSearch?: (q: string) => void;
}) {
  const cart = useCart();
  const count = cartCount(cart);
  const router = useRouter();
  const [local, setLocal] = useState("");
  const value = onSearch ? search ?? "" : local;
  const session = useSession();
  const open = useDrawer();
  useEffect(() => () => drawer.close(), []);

  return (
    <div className={d.page} dir="rtl">
      <div className={d.halo} aria-hidden />
      <header className={d.header}>
        <div className={`${d.wrap} ${d.headRow}`}>
          <Link href={R.P_Store} aria-label="متجر فاطمة بيوتي — الصفحة الأولى"><Logo height={54} /></Link>
          <div className={d.headTools}>
            <form role="search" className={d.search} onSubmit={(e) => {
              e.preventDefault();
              if (!onSearch) router.push(`${R.P_Store}?q=${encodeURIComponent(local.trim())}`);
            }}>
              <Icon name="search" color={C.muted} size={18} />
              <label htmlFor="store-q" className={d.srOnly}>ابحثي في المتجر</label>
              <input id="store-q" type="search" value={value} placeholder="ابحثي عن غسول، سيروم، واقي شمس"
                onChange={(e) => (onSearch ? onSearch(e.target.value) : setLocal(e.target.value))} />
            </form>
            <Link href={session.patient ? R.P_OrderTrack : `${R.Login}?next=${encodeURIComponent(R.P_Store)}`} className={d.acctBtn}
              aria-label={session.patient ? "حسابي — طلباتي" : "تسجيل الدخول"}>
              <Icon name="user" color={C.accent} size={19} />{session.patient ? "حسابي" : "دخول"}
            </Link>
            <button type="button" className={d.cartBtn} onClick={drawer.open} aria-haspopup="dialog"
              aria-label={count ? `السلة، فيها ${itemsLabel(count)}` : "السلة فارغة"}>
              <Icon name="bag" color="#FFFFFF" size={19} stroke={1.9} />السلة
              <span className={d.count} aria-hidden>{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main className={d.main}>
        <div className={d.wrap}>{children}</div>
      </main>

      <Footer />
      {open && <CartDrawer />}
    </div>
  );
}

function CartDrawer() {
  const cart = useCart();
  const keys = Object.keys(cart).sort();
  const { data, loading } = useQuery(["products", "cart", keys.join(",")], () => getProductsByKeys(keys), { enabled: keys.length > 0 });
  const { lines, count, sub, canOrder } = cartLines(cart, data);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") drawer.close(); };
    window.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, []);

  return (
    <>
      <div className={d.scrim} onClick={drawer.close} aria-hidden />
      <aside className={d.drawer} role="dialog" aria-modal="true" aria-label="سلتكِ">
        <div className={d.drawerHead}>
          <div>
            <h2 className={d.panelTitle} style={{ fontSize: 20 }}>سلتكِ</h2>
            {count > 0 && <div className={d.note}>{itemsLabel(count)}</div>}
          </div>
          <button type="button" className={d.iconBtn} onClick={drawer.close} aria-label="إغلاق السلة" autoFocus>
            <Icon name="x" color={C.accent} size={19} />
          </button>
        </div>
        <div className={d.drawerBody}>
          {keys.length === 0 ? (
            <div className={d.empty} style={{ marginTop: 24, border: "none", background: "transparent" }}>
              <Icon name="bag" color={C.accentMid} size={34} />
              <h3>سلتكِ فارغة</h3>
              <p>أضيفي منتجات العناية من المتجر وستظهر هنا مع أسعارها المحدّثة.</p>
              <button type="button" className={d.linkBtn} onClick={drawer.close}>تابعي التسوّق</button>
            </div>
          ) : loading && !data ? <div className={d.note} style={{ padding: "24px 0" }}>جارٍ تحميل السلة…</div> : lines.map(({ p, qty, line, problem }) => {
            const max = Math.max(qty, Math.floor(Number(p.stock)));
            return (
              <div key={p.key} className={d.drawerLine}>
                <Link href={productHref(p.key)} className={d.miniThumb} style={{ width: 64, height: 74 }} onClick={drawer.close} aria-label={p.name}>
                  <ProductPic p={p} width={40} fill />
                </Link>
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <Link href={productHref(p.key)} onClick={drawer.close} className={d.lineName} style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Link>
                    <span className={d.price} style={{ fontSize: 15 }}>{money(line, false)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span className={d.lineSub}>{p.size}</span>
                    <SmallStepper qty={qty} max={max} onChange={(q) => cartStore.set(p.key, q)} />
                  </div>
                  {problem && <div className={d.low}>{problem}</div>}
                </div>
              </div>
            );
          })}
        </div>
        {lines.length > 0 && (
          <div className={d.drawerFoot}>
            <div className={d.sumTotal} style={{ borderTop: "none", paddingTop: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>المجموع الفرعي</span>
              <span><span className={d.price} style={{ fontSize: 22 }}>{money(sub, false)}</span><span className={d.cur}>ل.س</span></span>
            </div>
            <div className={d.sumHint}>رسوم التوصيل تُحدَّد عند تأكيد العنوان، والاستلام من المركز بدون رسوم.</div>
            {canOrder
              ? <Link href={R.P_Checkout} className={d.btn} onClick={drawer.close}>إتمام الطلب</Link>
              : <span className={d.btn} aria-disabled="true">عدّلي الكميات المعلَّمة أولاً</span>}
            <Link href={R.P_Cart} className={d.btnGhost} onClick={drawer.close}>عرض السلة</Link>
          </div>
        )}
      </aside>
    </>
  );
}

export function SmallStepper({ qty, max, onChange, min = 0 }: { qty: number; max: number; min?: number; onChange: (q: number) => void }) {
  return (
    <div className={d.smallStepper}>
      <button type="button" aria-label="زيادة الكمية" disabled={qty >= max} onClick={() => onChange(Math.min(max, qty + 1))}><Icon name="plus" color={C.accent} size={14} stroke={2.2} /></button>
      <output className="latin" aria-live="polite">{qty}</output>
      <button type="button" aria-label={qty <= 1 && min === 0 ? "إزالة من السلة" : "إنقاص الكمية"} disabled={qty <= min} onClick={() => onChange(Math.max(min, qty - 1))}>
        <Icon name={qty <= 1 && min === 0 ? "trash" : "minus"} color={C.accent} size={14} stroke={2} />
      </button>
    </div>
  );
}

function Footer() {
  const { data } = useQuery(["public", "info"], getPublicInfo);
  const phone = data?.centre?.phone, wa = data?.centre?.whatsapp;
  const waLink = wa ? `https://wa.me/${wa.replace(/\D/g, "")}` : null;
  return (
    <footer className={d.footer}>
      <div className={`${d.wrap} ${d.footGrid}`}>
        <div>
          <Logo height={52} />
          <p className={d.footAbout}>منتجات عناية تختارها أخصائيات المركز لروتينكِ اليومي، تستلمينها في زيارتكِ أو تصلكِ إلى البيت.</p>
        </div>
        <div>
          <h2 className={d.footTitle}>المتجر</h2>
          <ul className={d.footLinks}>
            <li><Link href={R.P_Store}>كل المنتجات</Link></li>
            <li><Link href={R.P_Cart}>السلة</Link></li>
            <li><Link href={R.P_OrderTrack}>طلباتي</Link></li>
          </ul>
        </div>
        <div>
          <h2 className={d.footTitle}>المركز</h2>
          <ul className={d.footLinks}>
            <li><Link href={R.P_Services}>الخدمات والأسعار</Link></li>
            <li><Link href={BOOK}>احجزي موعداً</Link></li>
            <li><Link href={R.P_Help}>المساعدة</Link></li>
          </ul>
        </div>
        <div>
          <h2 className={d.footTitle}>تواصلي معنا</h2>
          <ul className={d.footLinks}>
            {phone && <li><a href={`tel:${phone}`}><Icon name="phone" size={16} /><span className="latin" dir="ltr">{phone}</span></a></li>}
            {waLink && <li><a href={waLink} target="_blank" rel="noopener noreferrer"><Icon name="msg" size={16} />واتساب</a></li>}
            <li><Link href={R.P_Chat}><Icon name="msg" size={16} />راسلي المركز</Link></li>
          </ul>
        </div>
      </div>
      <div className={`${d.wrap} ${d.footBottom}`}>
        <span>© {new Date().getFullYear()} Fatema Beauty — Skin Care Center</span>
        <span>الدفع نقداً عند الاستلام</span>
      </div>
    </footer>
  );
}
