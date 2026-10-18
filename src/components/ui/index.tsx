/**
 * Shared UI primitives — the React port of the design kit (kit.py).
 * Every screen should be built from these + inline layout styles using tokens from "@/lib/tokens".
 */
"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  C, CARD, DARK, DONE_GRAD, ICON_FILL, SELECTED, SHB, LOGO, LOGO_LIGHT, LOGO_ALT,
} from "@/lib/tokens";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

export { Icon } from "./Icon";
export type { IconName } from "./icons";

type IconRef = IconName | (string & {});

/* ---------- layout helpers ---------- */

export function Card({ children, style, radius = 26, padding = 16, as = "div" }: {
  children: ReactNode; style?: CSSProperties; radius?: number; padding?: number | string; as?: "div" | "section" | "article";
}) {
  const Tag = as;
  return <Tag style={{ ...CARD, borderRadius: radius, padding, position: "relative", ...style }}>{children}</Tag>;
}

/** Soft lilac glow placed inside a dark card. */
export function DarkGlow({ style }: { style?: CSSProperties }) {
  return (
    <div aria-hidden style={{
      position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, pointerEvents: "none",
      background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)", ...style,
    }} />
  );
}

/** The single dark mauve hero card of a screen. */
export function DarkCard({ children, style, radius = 30, padding = 20 }: {
  children: ReactNode; style?: CSSProperties; radius?: number; padding?: number | string;
}) {
  return (
    <div style={{ ...DARK, borderRadius: radius, padding, position: "relative", overflow: "hidden", ...style }}>
      <DarkGlow />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>{children}</h2>
      {right}
    </div>
  );
}

/* ---------- icons in shapes ---------- */

/** Lilac gradient circle with an icon. */
export function Circ({ icon, size = 42, color = C.accentMid, iconSize }: { icon: IconRef; size?: number; color?: string; iconSize?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: ICON_FILL,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon name={icon} color={color} size={iconSize ?? Math.max(14, Math.round(size * 0.46))} />
    </span>
  );
}

export function DoneDot({ size = 30 }: { size?: number }) {
  return (
    <span style={{ ...DONE_GRAD, width: size, height: size, borderRadius: size / 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="check" color="#FFFFFF" size={Math.round(size * 0.47)} stroke={2.4} />
    </span>
  );
}

/* ---------- buttons ---------- */

type Action = { href?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" };

function Clickable({ href, onClick, style, children, label, disabled, type = "button" }: Action & { style: CSSProperties; children: ReactNode; label?: string }) {
  if (href) return <Link href={href} aria-label={label} style={style}>{children}</Link>;
  return <button type={type} aria-label={label} onClick={onClick} disabled={disabled} style={{ border: "none", ...style }}>{children}</button>;
}

/** Round white icon button (46px default). Requires an accessible label. */
export function IconButton({ icon, label, size = 46, color = C.accent, style, badge, ...action }: Action & {
  icon: IconRef; label: string; size?: number; color?: string; style?: CSSProperties; badge?: boolean;
}) {
  return (
    <Clickable {...action} label={label} style={{
      width: size, height: size, borderRadius: size / 2, background: C.white, boxShadow: SHB, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style,
    }}>
      <Icon name={icon} color={color} size={Math.round(size * 0.4)} stroke={1.9} />
      {badge && <span style={{ position: "absolute", top: size * 0.24, right: size * 0.26, width: 9, height: 9, borderRadius: 5, background: "#9B4FB0", border: "2px solid #FFF" }} />}
    </Clickable>
  );
}

/** Dark capsule primary button. */
export function PrimaryButton({ children, icon, height = 58, style, ...action }: Action & {
  children: ReactNode; icon?: IconRef; height?: number; style?: CSSProperties;
}) {
  return (
    <Clickable {...action} style={{
      ...DARK, height, borderRadius: height / 2, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center",
      justifyContent: "center", gap: 8, padding: "0 22px", opacity: action.disabled ? 0.55 : 1, ...style,
    }}>
      {icon && <Icon name={icon} color="#FFFFFF" size={19} stroke={1.9} />}
      {children}
    </Clickable>
  );
}

/** White capsule secondary button. */
export function SecondaryButton({ children, icon, height = 56, color = C.accent, style, ...action }: Action & {
  children: ReactNode; icon?: IconRef; height?: number; color?: string; style?: CSSProperties;
}) {
  return (
    <Clickable {...action} style={{
      height, borderRadius: height / 2, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color,
      fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 20px", ...style,
    }}>
      {icon && <Icon name={icon} color={color} size={18} stroke={1.9} />}
      {children}
    </Clickable>
  );
}

/* ---------- chips, tags ---------- */

export function Chip({ children, selected = false, height = 38, onClick, style }: {
  children: ReactNode; selected?: boolean; height?: number; onClick?: () => void; style?: CSSProperties;
}) {
  const base: CSSProperties = {
    height, padding: "0 14px", borderRadius: height / 2, fontSize: 13, fontWeight: 600, display: "inline-flex",
    alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0,
  };
  const look: CSSProperties = selected ? SELECTED : {
    background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)",
  };
  if (onClick) return <button type="button" aria-pressed={selected} onClick={onClick} style={{ ...base, ...look, ...style }}>{children}</button>;
  return <span style={{ ...base, ...look, ...style }}>{children}</span>;
}

export type TagKind = "pink" | "green" | "amber" | "gray" | "plum" | "silver" | "lilac";
const TAGS: Record<TagKind, CSSProperties> = {
  pink: { background: "#FBEAF1", color: C.danger },
  green: { background: "#E6F4EC", color: C.okDeep },
  amber: { background: "#FCF1DE", color: "#8A5A12" },
  gray: { background: "#F0EDF0", color: "#695D6B" },
  plum: { background: C.accent, color: C.white },
  lilac: { background: C.tint, color: C.accent },
  silver: { background: "linear-gradient(145deg,#FFFFFF,#CFCBD6)", color: "#4A4452" },
};

export function Tag({ children, kind = "lilac", style }: { children: ReactNode; kind?: TagKind; style?: CSSProperties }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12,
      fontWeight: 600, whiteSpace: "nowrap", ...TAGS[kind], ...style,
    }}>{children}</span>
  );
}

/** REQUIRED next to any sample person name (everyone except فاطمة طيبة). */
export function ExampleTag() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10,
      fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle",
    }}>مثال</span>
  );
}

/** A person's name, automatically tagged «مثال» when the person is a sample. */
export function PersonName({ name, sample, style }: { name: string; sample: boolean; style?: CSSProperties }) {
  return <span style={style}>{name}{sample && <ExampleTag />}</span>;
}

/* ---------- avatars, logo ---------- */

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)",
      border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: Math.round(size * 0.38), fontWeight: 700, color: C.accent,
    }}>{initials}</span>
  );
}


export function Logo({ height = 54, light = false, style }: { height?: number; light?: boolean; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={light ? LOGO_LIGHT : LOGO} alt={LOGO_ALT} style={{ height, width: "auto", display: "block", ...style }} />
  );
}

/* ---------- controls ---------- */

/** RTL toggle: ON puts the knob on the LEFT. */
export function Toggle({ on, onChange, label }: { on: boolean; onChange?: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange?.(!on)} style={{
      width: 52, height: 30, borderRadius: 15, padding: 3, border: "none", flexShrink: 0, display: "flex",
      justifyContent: on ? "flex-end" : "flex-start",
      background: on ? "linear-gradient(145deg,#C9A2D8,#7B4687)" : "#E6DDE8",
      boxShadow: on ? "0 6px 14px rgba(123,70,135,0.30)" : "inset 0 1px 3px rgba(0,0,0,0.08)", transition: "background .2s",
    }}>
      <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
    </button>
  );
}

export function Progress({ pct, height = 8, dark = false }: { pct: number; height?: number; dark?: boolean }) {
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}
      style={{ height, borderRadius: height / 2, background: dark ? "rgba(255,255,255,0.18)" : "#ECE2EF", overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height, borderRadius: height / 2,
        background: dark ? "linear-gradient(90deg, #E8D6F0, #FFFFFF)" : "linear-gradient(90deg,#C9A2D8,#7B4687)",
      }} />
    </div>
  );
}

/* ---------- admin building blocks ---------- */

export function Kpi({ label, value, sub, icon = "chart", dark = false }: {
  label: string; value: ReactNode; sub?: ReactNode; icon?: IconRef; dark?: boolean;
}) {
  if (dark) {
    return (
      <div style={{ ...DARK, flex: 1, minWidth: 0, borderRadius: 26, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
        <DarkGlow />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 13, color: C.onDark }}>{label}</div>
          <Icon name={icon} color="#E8D6F0" size={20} />
        </div>
        <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{value}</div>
        {sub && <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>{sub}</div>}
      </div>
    );
  }
  return (
    <div style={{ ...CARD, flex: 1, minWidth: 0, borderRadius: 26, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: C.sub2 }}>{label}</div>
        <Circ icon={icon} size={36} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>}
    </div>
  );
}

/** Card table. `widths` are CSS flex values per column. */
export function DataTable({ headers, rows, widths, rowHeight = 54, style }: {
  headers: ReactNode[]; rows: ReactNode[][]; widths?: (string | number)[]; rowHeight?: number; style?: CSSProperties;
}) {
  const w = widths ?? headers.map(() => 1);
  return (
    <div role="table" style={{ ...CARD, borderRadius: 26, padding: "8px 20px", ...style }}>
      <div role="row" style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
        {headers.map((h, i) => (
          <div role="columnheader" key={i} style={{ flex: w[i], minWidth: 0, fontSize: 12, color: C.sub2, fontWeight: 600 }}>{h}</div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div role="row" key={ri} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: rowHeight, borderTop: `1px solid ${C.line}` }}>
          {r.map((cell, ci) => (
            <div role="cell" key={ci} style={{ flex: w[ci], minWidth: 0, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export { EmptyState, Loading, ErrorNote, Modal, Field, TextInput, NumberInput, TextArea, Select, Segment, SubmitButton, GhostButton } from "./forms";
