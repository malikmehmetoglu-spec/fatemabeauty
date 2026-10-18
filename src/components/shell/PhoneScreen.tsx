"use client";

import type { CSSProperties, ReactNode } from "react";
import { BG, C, SELECTED } from "@/lib/tokens";
import { R } from "@/lib/routes";
import { Icon, IconButton } from "@/components/ui";
import Link from "next/link";
import ps from "./phone.module.css";

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

/**
 * A phone screen. Fills the device on mobile; on wider screens it is a centred 480px column.
 * Content is a flex column (gap 14). Put the primary action last with `marginTop: "auto"` to pin it to the bottom.
 * Long content scrolls (scrollbars are hidden globally).
 */
export function PhoneScreen({
  children, tab, padding, gap = 14, background = BG, blobs = true, overlay, style, wide = false,
}: {
  children: ReactNode; tab?: TabLabel; padding?: string; gap?: number; background?: string;
  blobs?: boolean; overlay?: ReactNode; style?: CSSProperties;
  /** Store-style pages: grow up to 1180px on desktop instead of the 480px phone column. */
  wide?: boolean;
}) {
  const top = "calc(env(safe-area-inset-top, 0px) + 22px)";
  const bottom = tab ? "calc(env(safe-area-inset-bottom, 0px) + 104px)" : "calc(env(safe-area-inset-bottom, 0px) + 22px)";
  return (
    <div className={ps.page}>
      <main dir="rtl" className={`${ps.col} ${wide ? "" : ps.narrow}`} style={{
        maxWidth: wide ? 1180 : 480, background, color: C.ink, gap,
        padding: padding ?? `${top} 20px ${bottom}`, ...style,
      }}>
        {blobs && <Blobs />}
        {children}
        {overlay}
      </main>
      {tab && <TabBar active={tab} />}
    </div>
  );
}
