"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/supabase/session";
import { BG, C, SELECTED } from "@/lib/tokens";
import { R } from "@/lib/routes";
import { Icon, IconButton, Logo } from "@/components/ui";
import Link from "next/link";
import ps from "./phone.module.css";
import { GuestPill, GuestSheetHost } from "@/components/guest";

/** Soft lilac + white halos behind the content (design-system §3). */
export function Blobs({ width = 390 }: { width?: number }) {
  const a = Math.round(width * 0.72), b = Math.round(width * 0.77);
  return (
    <>
      <div aria-hidden style={{ position: "absolute", top: -90, right: -70, width: a, height: a, borderRadius: "50%", zIndex: -1, pointerEvents: "none", background: "radial-gradient(circle, rgba(190,150,215,0.55) 0%, rgba(190,150,215,0) 70%)" }} />
      <div aria-hidden style={{ position: "absolute", top: 120, left: -110, width: b, height: b, borderRadius: "50%", zIndex: -1, pointerEvents: "none", background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)" }} />
    </>
  );
}

export type TabLabel = "الرئيسية" | "مواعيدي" | "رحلتي" | "المتجر" | "حسابي";
const TABS: [string, TabLabel, string][] = [
  ["home", "الرئيسية", R.Main], ["cal", "مواعيدي", R.P_Appointments], ["sparkle", "رحلتي", R.Journey],
  ["bag", "المتجر", R.P_Store], ["user", "حسابي", R.Account],
];

/** Floating glass tab bar for the five root phone screens. */
export function TabBar({ active }: { active: TabLabel }) {
  return (
    <nav aria-label="التنقل الرئيسي" className={ps.tab} style={{
      position: "fixed", left: "50%", transform: "translateX(-50%)",
      width: "min(calc(100% - 32px), 448px)", height: 68, borderRadius: 34, background: "rgba(255,255,255,0.78)",
      backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)",
      boxShadow: "0 14px 34px rgba(123,70,135,0.16)", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 11px", zIndex: 50,
    }}>
      {TABS.map(([icon, label, href]) =>
        label === active ? (
          <Link key={label} href={href} aria-current="page" style={{ ...SELECTED, height: 46, padding: "0 16px", borderRadius: 23, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <Icon name={icon} color={C.accent} size={19} stroke={1.9} />{label}
          </Link>
        ) : (
          <Link key={label} href={href} style={{ width: 52, height: 46, borderRadius: 23, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, color: C.sub2, fontSize: 10 }}>
            <Icon name={icon} color={C.sub2} size={20} />{label}
          </Link>
        ),
      )}
    </nav>
  );
}

/** Standard top bar: round back button (right, RTL) + centred title + optional right slot (left side). */
export function TopBar({ title, back = R.Main, right }: { title: ReactNode; back?: string; right?: ReactNode }) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", gap: 10 }}>
      <IconButton icon="back" label="رجوع" href={back} />
      <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.ink, textAlign: "center" }}>{title}</h1>
      {right ?? <div style={{ width: 46 }} />}
    </header>
  );
}

/** Hidden from 1024px up (desktop shows the same thing elsewhere, e.g. the logo in the auth brand panel). */
export const phoneOnly = ps.phoneOnly;
/** Desktop (≥1024px): turns a vertical list of cards into a two-column grid. */
export const deskGrid = ps.deskGrid;
/** Desktop (≥1024px): rounds a full-bleed phone band (hero image etc.). */
export const deskRound = ps.deskRound;

/** Desktop-only form heading for the split-screen auth pages. */
export function DeskHeading({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div className={ps.deskOnly} style={{ position: "relative" }}>
      <h1 className={ps.deskHead}>{title}</h1>
      {sub && <p className={ps.deskSub}>{sub}</p>}
    </div>
  );
}

const STORE_PATHS = ["/store", "/cart", "/checkout", "/orders"];
/** Sign-in started from the store (next param / pending redirect) or on store.fatema.beauty. */
function useStoreContext() {
  const [v, setV] = useState(false);
  useEffect(() => {
    let n: string | null = new URLSearchParams(window.location.search).get("next");
    try { n = n ?? sessionStorage.getItem("fb.after_login"); } catch {}
    setV(window.location.hostname.startsWith("store.") || (!!n && STORE_PATHS.some((p) => n!.startsWith(p))));
  }, []);
  return v;
}

const ring = "rgba(255,255,255,0.9)";
/** Desktop brand side of the login / code / profile screens. */
function AuthBrand({ store }: { store: boolean }) {
  const feats: [string, string, string][] = store
    ? [["bag", "منتجات مختارة بعناية", "تنصحكِ بها فاطمة طيبة لبشرتكِ"], ["truck", "توصيل أو استلام من المركز", "والدفع نقداً عند الاستلام"], ["box", "طلباتكِ في مكان واحد", "تابعي حالة كل طلب خطوة بخطوة"]]
    : [["cal", "احجزي جلستكِ بسهولة", "اختاري الخدمة والوقت المناسب لكِ"], ["clock", "تابعي دوركِ مباشرة", "اعرفي متى يحين موعدكِ يوم الزيارة"], ["sparkle", "رحلة بشرتكِ", "جلساتكِ وروتينكِ ونصائح فريقنا"]];
  return (
    <aside className={ps.brand} aria-label={store ? "متجر فاطمة بيوتي" : "تطبيق فاطمة بيوتي"}>
      <div className={ps.brandGlowA} aria-hidden /><div className={ps.brandGlowB} aria-hidden />
      <svg className={ps.brandRings} viewBox="0 0 560 560" aria-hidden>
        <circle cx="280" cy="280" r="270" fill="none" stroke={ring} strokeWidth="1.5" />
        <circle cx="280" cy="280" r="205" fill="none" stroke={ring} strokeWidth="1.5" />
        <circle cx="280" cy="280" r="140" fill="none" stroke={ring} strokeWidth="1.5" strokeDasharray="4 8" />
      </svg>
      <div className={ps.brandTop}>
        <Logo height={132} />
        <div className={ps.brandKicker}>{store ? "متجر فاطمة بيوتي" : "مركز فاطمة بيوتي للعناية بالبشرة"}</div>
        <p className={ps.brandLine}>عناية تليق ببشرتكِ<br />وخبرة تمنحكِ إشراقة تدوم</p>
      </div>
      <ul className={ps.brandFeats}>
        {feats.map(([icon, t, sub]) => (
          <li key={t}>
            <span className={ps.brandIcon}><Icon name={icon} color={C.accentMid} size={19} /></span>
            <div><b>{t}</b><small>{sub}</small></div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const SIDE: [string, TabLabel, string, string[]][] = [
  ["home", "الرئيسية", R.Main, ["/home"]],
  ["cal", "مواعيدي", R.P_Appointments, ["/appointments", "/booking", "/queue", "/checkin", "/waitlist", "/review", "/survey"]],
  ["sparkle", "رحلتي", R.Journey, ["/journey", "/routine", "/prescriptions"]],
  ["bag", "المتجر", R.P_Store, ["/store", "/cart", "/checkout", "/orders"]],
  ["user", "حسابي", R.Account, ["/account", "/profile", "/settings", "/payments", "/packages", "/notifications", "/help", "/gift", "/consent"]],
];

/** Desktop (≥1024px) navigation for the patient app — replaces the floating tab bar. Right side (RTL). */
function SideNav({ active }: { active?: TabLabel }) {
  const path = usePathname() ?? "";
  const { patient, guest } = useSession();
  const on = active ?? SIDE.find(([, , , ps_]) => ps_.some((p) => path.startsWith(p)))?.[1];
  return (
    <nav aria-label="التنقل الرئيسي" className={ps.side}>
      <Link href={R.Main} className={ps.sideLogo} aria-label="فاطمة بيوتي — الرئيسية"><Logo height={64} /></Link>
      <div className={ps.sideLinks}>
        {SIDE.map(([icon, label, href]) => (
          <Link key={label} href={href} aria-current={label === on ? "page" : undefined} className={`${ps.sideLink} ${label === on ? ps.sideOn : ""}`}>
            <Icon name={icon} color={label === on ? C.accent : C.sub2} size={20} stroke={label === on ? 1.9 : 1.6} />{label}
          </Link>
        ))}
      </div>
      <Link href={R.Booking} className={ps.sideCta}><Icon name="plus" color="#FFFFFF" size={18} stroke={2} />احجزي موعداً</Link>
      {patient && (
        <Link href={R.Account} className={ps.sideUser}>
          <span className={ps.sideAvatar}><Icon name="user" color={C.accentMid} size={18} /></span>
          <span className={ps.sideUserText}><b>{patient.name || "حسابي"}</b><small dir="ltr" className="latin">{patient.phone}</small></span>
        </Link>
      )}
      {guest && <div style={{ marginTop: "auto", paddingTop: 14 }}><GuestPill compact /></div>}
    </nav>
  );
}

/**
 * A phone screen. Fills the device on mobile; on tablets it is a centred 480px column.
 * On desktop (≥1024px) patient pages get a side navigation and a wider content area; `auth` pages become a split screen.
 * Content is a flex column (gap 14). Put the primary action last with `marginTop: "auto"` to pin it to the bottom.
 * Long content scrolls (scrollbars are hidden globally).
 */
export function PhoneScreen({
  children, tab, padding, gap = 14, background = BG, blobs = true, overlay, style, wide = false, auth = false, nav = true,
}: {
  children: ReactNode; tab?: TabLabel; padding?: string; gap?: number; background?: string;
  blobs?: boolean; overlay?: ReactNode; style?: CSSProperties;
  /** Store-style pages: grow up to 1180px on desktop instead of the 480px phone column. */
  wide?: boolean;
  /** Sign-in / profile screens: split screen with a brand panel on desktop. */
  auth?: boolean;
  /** Patient-app side navigation on desktop (off for splash and other standalone screens). */
  nav?: boolean;
}) {
  const top = "calc(env(safe-area-inset-top, 0px) + 22px)";
  const bottom = tab ? "calc(env(safe-area-inset-bottom, 0px) + 104px)" : "calc(env(safe-area-inset-bottom, 0px) + 22px)";
  const store = useStoreContext();
  const app = nav && !wide && !auth;
  return (
    <div className={`${ps.page} ${auth ? ps.authPage : ""} ${app ? ps.app : ""}`}>
      {auth && <AuthBrand store={store} />}
      <main dir="rtl" className={`${ps.col} ${wide ? "" : ps.narrow} ${auth ? ps.authCol : ""} ${app ? ps.appCol : ""} ${app && tab ? ps.appTab : ""}`} style={{
        maxWidth: wide ? 1180 : 480, background, color: C.ink, gap,
        padding: padding ?? `${top} 20px ${bottom}`, ...style,
      }}>
        {auth && store && <Link href={R.P_Store} className={ps.backStore}><Icon name="back" color={C.accent} size={16} />العودة إلى المتجر</Link>}
        {blobs && <Blobs />}
        {children}
        {overlay}
      </main>
      {app && <SideNav active={tab} />}
      {tab && <TabBar active={tab} />}
      <GuestSheetHost />
    </div>
  );
}
