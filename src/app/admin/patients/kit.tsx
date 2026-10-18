"use client";

/** Small building blocks shared by the patient/clinical admin screens (styles follow the W_* designs). */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui";
import { initials } from "@/lib/data";
import { C, SH } from "@/lib/tokens";

export const chip = (on: boolean, h = 38): CSSProperties => ({
  height: h, padding: "0 14px", borderRadius: h / 2, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center",
  gap: 6, whiteSpace: "nowrap", cursor: "pointer",
  ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }
    : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
});

export const outlineBtn = (h = 46): CSSProperties => ({
  height: h, borderRadius: h / 2, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)",
});

export const primaryBtn: CSSProperties = {
  height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)",
  boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 18px", whiteSpace: "nowrap",
};

export const pill = (bg: string, color: string): CSSProperties => ({ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: bg, color });
export const PILL_DANGER = pill("#FBEAF1", C.danger);
export const PILL_GRAY = pill("#F0EDF0", "#695D6B");

export const PLUS = "M12 5v14M5 12h14";
export const BACK = "M9 6l6 6-6 6";

export function Panel({ title, sub, right, children, style, className }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={className} style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", minWidth: 0, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Initials({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.36), fontWeight: 700, color: C.accent, whiteSpace: "nowrap" }}>
      {name.trim() ? initials(name) : <Icon name="user" size={Math.round(size * 0.45)} color={C.accent} />}
    </span>
  );
}

export function BackLink({ href, children, icon = BACK }: { href: string; children: ReactNode; icon?: string }) {
  return <Link href={href} style={outlineBtn()}><Icon name={icon} size={16} color={C.accent} stroke={1.9} />{children}</Link>;
}

export function Bar({ done, total }: { done: number; total: number }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
      <div style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%`, height: 5, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
    </div>
  );
}

export const displayName = (n?: string | null) => (n && n.trim()) || "بدون اسم";
export const fileHref = (base: string, key: string, id: string) => `${base}?${key}=${encodeURIComponent(id)}`;
