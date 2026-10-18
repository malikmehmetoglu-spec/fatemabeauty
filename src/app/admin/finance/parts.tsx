"use client";

/** Small building blocks shared by the finance & reports screens (not a route). */
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui";
import { AR_MONTHS } from "@/lib/data";
import { money } from "@/lib/format";
import { C, DEEP_SHADOW, ICON_FILL, SELECTED, SH, SHB, SHEEN } from "@/lib/tokens";

export const OFF: CSSProperties = { background: "#FFFFFF", border: "1px solid #EADCF0", color: "#866F8D", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" };
export const PANEL: CSSProperties = { borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", minWidth: 0 };
export const LATIN: CSSProperties = { fontFamily: "var(--font-rubik), sans-serif" };
export const SERIES = ["#7B4687", "#A673B4", "#C9A2D6", "#E3C9EC", "#D88FB0", "#8F7C96", "#B9AABD"];

export function Pill({ on, onClick, children, style }: { on: boolean; onClick: () => void; children: ReactNode; style?: CSSProperties }) {
  return <button type="button" onClick={onClick} aria-pressed={on} style={{ height: 40, padding: "0 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, ...(on ? SELECTED : OFF), ...style }}>{children}</button>;
}

export function LightBtn({ icon, children, onClick, style, disabled }: { icon?: string; children: ReactNode; onClick?: () => void; style?: CSSProperties; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1, ...style }}>
      {icon && <Icon name={icon} color={C.accent} size={17} stroke={1.9} />}{children}
    </button>
  );
}

export function DeepBtn({ icon, children, onClick, style, disabled }: { icon?: string; children: ReactNode; onClick?: () => void; style?: CSSProperties; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: SHEEN, boxShadow: DEEP_SHADOW, color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap", opacity: disabled ? 0.55 : 1, ...style }}>
      {icon && <Icon name={icon} color={C.white} size={17} stroke={1.9} />}{children}
    </button>
  );
}

/** Amount with a small currency unit. */
export function Amount({ n, size = 13.5, color = C.ink, weight = 700 }: { n: number; size?: number; color?: string; weight?: number }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ ...LATIN, fontWeight: weight, fontSize: size, color }}>{money(n, false)}</span>
      <span style={{ fontSize: Math.max(10.5, size * 0.75), color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
    </span>
  );
}

export function StatCard({ label, value, sub, icon, dark }: { label: string; value: ReactNode; sub?: ReactNode; icon: string; dark?: boolean }) {
  if (dark) return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: SHEEN, boxShadow: DEEP_SHADOW, color: C.white, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: C.onDark }}>{label}</div>
        <Icon name={icon} color="#E8D6F0" size={20} />
      </div>
      <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{ flex: 1, minWidth: 0, ...PANEL }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: C.sub2 }}>{label}</div>
        <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} color={C.accentMid} size={16} />
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>}
    </div>
  );
}

/** "1,500 ل.س" with a big number — for stat cards. */
export const Big = ({ n, unit = "ل.س" }: { n: number; unit?: string }) => <>{money(n, false)} <span style={{ fontSize: 14 }}>{unit}</span></>;

export function PanelTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{children}</div>
      {right && <div style={{ fontSize: 12, color: C.sub2 }}>{right}</div>}
    </div>
  );
}

export function NoData({ children = "لا بيانات في هذه الفترة بعد", height = 160 }: { children?: ReactNode; height?: number }) {
  return <div style={{ height, borderRadius: 18, background: "repeating-linear-gradient(135deg,#FBF7FC 0 10px,#F7F0F9 10px 20px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.muted, textAlign: "center", padding: 12 }}>{children}</div>;
}

/** Vertical bars. Labels under each bar; value in the tooltip. */
export function Bars({ data, height = 170, fmt = (n: number) => money(n), color = C.accentMid, highlight }: {
  data: { label: string; value: number; title?: string }[]; height?: number; fmt?: (n: number) => string; color?: string; highlight?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!data.length || max <= 0) return <NoData height={height + 22} />;
  const every = Math.ceil(data.length / 16);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: data.length > 20 ? 3 : 8, height }}>
        {data.map((d, i) => (
          <div key={i} title={`${d.title ?? d.label}: ${fmt(d.value)}`} style={{ flex: 1, minWidth: 0, height: `${Math.max(d.value > 0 ? 3 : 1, (d.value / max) * 100)}%`, borderRadius: "8px 8px 3px 3px",
            background: d.value <= 0 ? "#EFE5F2" : i === highlight ? C.accent : color, opacity: d.value <= 0 ? 1 : i === highlight || highlight === undefined ? 1 : 0.75 }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: data.length > 20 ? 3 : 8, marginTop: 6 }}>
        {data.map((d, i) => <div key={i} style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden" }}>{i % every === 0 ? d.label : ""}</div>)}
      </div>
    </div>
  );
}

/** Horizontal share bars with legend values. */
export function ShareList({ data, fmt = (n: number) => money(n), empty }: { data: [string, number][]; fmt?: (n: number) => string; empty?: string }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  if (!data.length || total <= 0) return <NoData height={120}>{empty}</NoData>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map(([k, v], i) => (
        <div key={k}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: SERIES[i % SERIES.length] }} />{k}</span>
            <span style={{ ...LATIN, color: C.sub }}>{fmt(v)} <span style={{ color: C.muted, fontSize: 11.5 }}>· {Math.round((v / total) * 100)}%</span></span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "#F1E8F4" }}><div style={{ height: 8, borderRadius: 4, width: `${(v / total) * 100}%`, background: SERIES[i % SERIES.length] }} /></div>
        </div>
      ))}
    </div>
  );
}

/** Donut from shares. */
export function Donut({ data, size = 150, center }: { data: [string, number][]; size?: number; center?: ReactNode }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  let acc = 0;
  const stops = total > 0 ? data.map(([, v], i) => { const a = acc; acc += (v / total) * 360; return `${SERIES[i % SERIES.length]} ${a}deg ${acc}deg`; }).join(", ") : "#EFE5F2 0deg 360deg";
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: `conic-gradient(${stops})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: size * 0.62, height: size * 0.62, borderRadius: size, background: C.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.3 }}>{center}</div>
    </div>
  );
}

export function MonthPicker({ month, onChange, max }: { month: string; onChange: (m: string) => void; max: string }) {
  const [y, m] = month.split("-").map(Number);
  const step = (n: number) => { const t = y * 12 + (m - 1) + n; onChange(`${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`); };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 46, borderRadius: 23, background: C.white, boxShadow: SHB, padding: "0 6px" }}>
      <button type="button" aria-label="الشهر السابق" onClick={() => step(-1)} style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: "scaleX(-1)" }}><Icon name="chev" color={C.accent} size={16} /></button>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: C.accent, minWidth: 110, justifyContent: "center" }}><Icon name="cal" color={C.accent} size={16} />{AR_MONTHS[m - 1]} {y}</span>
      <button type="button" aria-label="الشهر التالي" disabled={month >= max} onClick={() => step(1)} style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", opacity: month >= max ? 0.3 : 1 }}><Icon name="chev" color={C.accent} size={16} /></button>
    </div>
  );
}

export const monthLabel = (month: string) => { const [y, m] = month.split("-").map(Number); return `${AR_MONTHS[m - 1]} ${y}`; };

/** Simple CSV download (Excel opens it). */
export function downloadCsv(name: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
