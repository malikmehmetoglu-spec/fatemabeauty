"use client";

/** Empty / loading states, dialogs and form fields — shared by every data screen. */
import { useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { C, CARD, DARK, ICON_FILL, SH, SHB } from "@/lib/tokens";
import { Icon } from "./Icon";

type IconRef = string;

/* ---------- states ---------- */

/** Shown wherever a list has no real data yet. Say what will appear here, and offer the action that adds it. */
export function EmptyState({ icon = "box", title, text, action, compact = false, style }: {
  icon?: IconRef; title: string; text?: ReactNode; action?: ReactNode; compact?: boolean; style?: CSSProperties;
}) {
  return (
    <div style={{ ...CARD, borderRadius: 26, padding: compact ? "22px 18px" : "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", ...style }}>
      <span style={{ width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: 32, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={compact ? 22 : 28} />
      </span>
      <div style={{ fontSize: compact ? 15 : 17, fontWeight: 700, color: C.ink }}>{title}</div>
      {text && <div style={{ fontSize: 13.5, color: C.sub, maxWidth: 440, lineHeight: 1.8 }}>{text}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}

export function Loading({ label = "جارٍ التحميل…", style }: { label?: string; style?: CSSProperties }) {
  return (
    <div role="status" style={{ padding: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: C.sub2, fontSize: 14, ...style }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${C.border}`, borderTopColor: C.accent, animation: "fbspin .8s linear infinite" }} />
      {label}
      <style>{"@keyframes fbspin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

export function ErrorNote({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div role="alert" style={{ fontSize: 13.5, fontWeight: 600, color: C.danger, background: "#FBEAF1", borderRadius: 14, padding: "10px 14px", ...style }}>{children}</div>;
}

/* ---------- dialog ---------- */

export function Modal({ open, onClose, title, children, footer, width = 560 }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" dir="rtl" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(53,33,61,0.38)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: width, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", borderRadius: 30, background: "linear-gradient(170deg, #FFFFFF 0%, #F9F4FA 100%)", boxShadow: `${SH}, 0 30px 60px rgba(53,33,61,0.25)`, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16, color: C.ink }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" style={{ width: 38, height: 38, borderRadius: 19, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" color={C.sub2} size={17} />
          </button>
        </div>
        {children}
        {footer && <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-start", marginTop: 4 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- fields ---------- */

const control: CSSProperties = {
  width: "100%", height: 46, borderRadius: 16, border: `1px solid #EADCF0`, background: C.white, padding: "0 14px",
  fontSize: 14, color: C.ink, boxShadow: "inset 0 1px 3px rgba(123,70,135,0.05)", outline: "none",
};

export function Field({ label, hint, children, style }: { label: string; hint?: ReactNode; children: (id: string) => ReactNode; style?: CSSProperties }) {
  const id = useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: C.sub2 }}>{label}</label>
      {children(id)}
      {hint && <div style={{ fontSize: 12, color: C.muted }}>{hint}</div>}
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, type = "text", dir, hint, required, style }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; dir?: "ltr" | "rtl"; hint?: ReactNode; required?: boolean; style?: CSSProperties;
}) {
  return (
    <Field label={label + (required ? " *" : "")} hint={hint} style={style}>
      {(id) => <input id={id} type={type} dir={dir} value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} style={{ ...control, textAlign: dir === "ltr" ? "left" : undefined }} />}
    </Field>
  );
}

export function NumberInput({ label, value, onChange, placeholder, suffix, hint, required, style }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string; hint?: ReactNode; required?: boolean; style?: CSSProperties;
}) {
  return (
    <Field label={label + (required ? " *" : "")} hint={hint} style={style}>
      {(id) => (
        <div style={{ position: "relative" }}>
          <input id={id} inputMode="decimal" dir="ltr" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
            className="latin" style={{ ...control, textAlign: "left", paddingLeft: suffix ? 44 : 14 }} />
          {suffix && <span style={{ position: "absolute", left: 14, top: 13, fontSize: 13, color: C.muted }}>{suffix}</span>}
        </div>
      )}
    </Field>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, style }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; style?: CSSProperties;
}) {
  return (
    <Field label={label} style={style}>
      {(id) => <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ ...control, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.7 }} />}
    </Field>
  );
}

export function Select<T extends string>({ label, value, onChange, options, style }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; style?: CSSProperties;
}) {
  return (
    <Field label={label} style={style}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} style={{ ...control, appearance: "none", backgroundImage: "none" }}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}

/** Two-option or multi-option pill switch. */
export function Segment<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "inline-flex", background: C.tint2, borderRadius: 20, padding: 3, gap: 2 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)} style={{
            height: 36, padding: "0 16px", borderRadius: 17, border: "none", fontSize: 13.5, fontWeight: on ? 700 : 600,
            background: on ? C.white : "transparent", color: on ? C.accent : C.sub2, boxShadow: on ? "0 3px 8px rgba(123,70,135,0.14)" : "none",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

/** Primary submit used inside forms/dialogs. */
export function SubmitButton({ children, onClick, busy, disabled, style }: { children: ReactNode; onClick: () => void; busy?: boolean; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button type="button" onClick={onClick} disabled={busy || disabled} style={{ ...DARK, border: "none", height: 50, padding: "0 26px", borderRadius: 25, fontSize: 15.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: busy || disabled ? 0.6 : 1, ...style }}>
      {busy ? "جارٍ الحفظ…" : children}
    </button>
  );
}

export function GhostButton({ children, onClick, icon, color = C.accent, style }: { children: ReactNode; onClick?: () => void; icon?: string; color?: string; style?: CSSProperties }) {
  return (
    <button type="button" onClick={onClick} style={{ height: 46, padding: "0 18px", borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", flexShrink: 0, ...style }}>
      {icon && <Icon name={icon} color={color} size={17} stroke={1.9} />}{children}
    </button>
  );
}
