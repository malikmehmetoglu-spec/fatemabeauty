"use client";

/** Screen-only building blocks shared by the c1 store screens (store, product, cart, checkout, order, gift). */
import { useId, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import type { Product } from "@/lib/mock/c1";
import { C, SHB } from "@/lib/tokens";

/** Product illustration (bottle / dropper / tube / jar), viewBox 100×116 like the designs. */
export function ProductArt({ p, width }: { p: Product; width: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const b = `${uid}b`, c = `${uid}c`, s = `${uid}s`;
  const { kind, body, cap } = p.art;
  const flower = (cx: number, cy: number, rx: number, ry: number, r: number) => (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={cx} cy={cy - ry} rx={rx} ry={ry} fill={cap} opacity={0.55} transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
    </>
  );
  let shape: ReactNode;
  if (kind === "pump") {
    shape = (
      <>
        <rect x="44" y="22" width="5" height="12" rx="1.5" fill={`url(#${c})`} />
        <rect x="36" y="16" width="26" height="8" rx="4" fill={`url(#${c})`} />
        <rect x="60" y="17.5" width="12" height="4.5" rx="2.2" fill={`url(#${c})`} />
        <rect x="38" y="32" width="18" height="11" rx="3" fill={`url(#${c})`} />
        <rect x="28" y="41" width="38" height="66" rx="13" fill={`url(#${b})`} stroke="#FFFFFF" strokeWidth="1.2" />
        <rect x="33" y="62" width="28" height="30" rx="6" fill="#FFFFFF" opacity="0.88" />
        {flower(47, 71, 1.87, 3.4, 1.53)}
        <rect x="37" y="80" width="20" height="3" rx="1.5" fill={cap} opacity="0.75" />
        <rect x="41" y="86" width="12" height="2" rx="1" fill={cap} opacity="0.35" />
        <rect x="31.5" y="47" width="4" height="52" rx="2" fill="#FFFFFF" opacity="0.55" />
      </>
    );
  } else if (kind === "dropper") {
    shape = (
      <>
        <path d="M50 6c5 0 7.5 4 7.5 9v12h-15V15c0-5 2.5-9 7.5-9z" fill={`url(#${c})`} />
        <rect x="38" y="26" width="24" height="16" rx="4" fill={`url(#${c})`} />
        <rect x="30" y="40" width="40" height="67" rx="12" fill={`url(#${b})`} stroke="#FFFFFF" strokeWidth="1.2" />
        <rect x="35" y="60" width="30" height="30" rx="6" fill="#FFFFFF" opacity="0.88" />
        {flower(50, 69, 1.87, 3.4, 1.53)}
        <rect x="40" y="78" width="20" height="3" rx="1.5" fill={cap} opacity="0.75" />
        <rect x="44" y="84" width="12" height="2" rx="1" fill={cap} opacity="0.35" />
        <rect x="33.5" y="46" width="4" height="54" rx="2" fill="#FFFFFF" opacity="0.55" />
        <path d="M48 9.5c0-1.3.8-2 2-2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" fill="none" />
      </>
    );
  } else if (kind === "tube") {
    shape = (
      <>
        <rect x="25" y="10" width="50" height="10" rx="2.5" fill={`url(#${b})`} stroke="#FFFFFF" strokeWidth="1" />
        <path d="M27 19h46l-7 72H34z" fill={`url(#${b})`} stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="36" y="89" width="28" height="19" rx="5" fill={`url(#${c})`} />
        <rect x="37" y="42" width="26" height="30" rx="6" fill="#FFFFFF" opacity="0.88" />
        {flower(50, 51, 1.87, 3.4, 1.53)}
        <rect x="41" y="60" width="18" height="3" rx="1.5" fill={cap} opacity="0.75" />
        <rect x="44.6" y="66" width="10.8" height="2" rx="1" fill={cap} opacity="0.35" />
        <path d="M33 25l3.5 58" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
        {[28, 34, 40, 46, 52, 58, 64, 70].map((x) => <rect key={x} x={x} y="12.5" width="2" height="5" rx="1" fill={cap} opacity="0.18" />)}
      </>
    );
  } else {
    shape = (
      <>
        <rect x="22" y="48" width="56" height="17" rx="6" fill={`url(#${c})`} />
        <rect x="26" y="50.5" width="48" height="2.5" rx="1.2" fill="#FFFFFF" opacity="0.35" />
        <rect x="20" y="63" width="60" height="44" rx="13" fill={`url(#${b})`} stroke="#FFFFFF" strokeWidth="1.2" />
        <rect x="31" y="71" width="38" height="27" rx="6" fill="#FFFFFF" opacity="0.88" />
        {flower(50, 79, 1.76, 3.2, 1.44)}
        <rect x="39" y="87" width="22" height="3" rx="1.5" fill={cap} opacity="0.75" />
        <rect x="43.4" y="93" width="13.2" height="2" rx="1" fill={cap} opacity="0.35" />
        <rect x="24" y="68" width="4" height="34" rx="2" fill="#FFFFFF" opacity="0.55" />
      </>
    );
  }
  return (
    <svg width={width} height={Math.round(width * 1.16)} viewBox="0 0 100 116" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={b} x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor={body[0]} /><stop offset="1" stopColor={body[1]} /></linearGradient>
        <linearGradient id={c} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={cap} stopOpacity="0.85" /><stop offset="1" stopColor={cap} /></linearGradient>
        <radialGradient id={s} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#7B4687" stopOpacity="0.22" /><stop offset="1" stopColor="#7B4687" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="50" cy="111" rx="30" ry="5" fill={`url(#${s})`} />
      {shape}
    </svg>
  );
}

/** Round soft tile holding a product illustration. */
export function ArtThumb({ p, box, art, radius, style }: { p: Product; box: number; art: number; radius: number; style?: CSSProperties }) {
  return (
    <span style={{
      width: box, height: box, borderRadius: radius, flexShrink: 0, background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F3EAF6 75%)",
      border: "1px solid #FFFFFF", boxShadow: "inset 0 -6px 14px rgba(150,100,170,0.10), 0 4px 10px rgba(123,70,135,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center", ...style,
    }}>
      <ProductArt p={p} width={art} />
    </span>
  );
}

/** Two-option segmented control (delivery / pickup, session / amount). */
export function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string; icon: string; iconSize?: number }[];
}) {
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 24, background: "rgba(255,255,255,0.7)", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)} style={{
            flex: 1, height: 40, borderRadius: 20, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            ...(on
              ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
              : { background: "transparent", border: "1px solid transparent", color: C.sub2 }),
          }}>
            <Icon name={o.icon} color={C.accent} size={o.iconSize ?? 18} />{o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Lilac capsule quantity stepper (+ on the right in RTL). */
export function QtyStepper({ qty, onChange, btn = 28, radius = 18, min = 1, max = 9 }: {
  qty: number; onChange: (q: number) => void; btn?: number; radius?: number; min?: number; max?: number;
}) {
  const b: CSSProperties = {
    width: btn, height: btn, borderRadius: btn / 2, border: "none", background: C.white, boxShadow: SHB,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 4, borderRadius: radius, background: C.tint, flexShrink: 0 }}>
      <button type="button" aria-label="زيادة الكمية" onClick={() => onChange(Math.min(max, qty + 1))} style={b}><Icon name="plus" color={C.accent} size={15} stroke={2} /></button>
      <span className="latin" aria-live="polite" style={{ minWidth: 16, textAlign: "center", fontSize: 15, fontWeight: 700, color: C.ink }}>{qty}</span>
      <button type="button" aria-label="إنقاص الكمية" onClick={() => onChange(Math.max(min, qty - 1))} style={b}><Icon name="minus" color={C.accent} size={15} stroke={2} /></button>
    </div>
  );
}

/** Labelled text input matching the design's form fields. */
export function Field({ id, label, placeholder, type = "text", ltr, style }: {
  id: string; label: string; placeholder: string; type?: string; ltr?: boolean; style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1, ...style }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>{label}</label>
      <input id={id} type={type} dir={ltr ? "ltr" : undefined} placeholder={placeholder} className={ltr ? "latin" : undefined} style={INPUT_STYLE(ltr)} />
    </div>
  );
}
export const INPUT_STYLE = (ltr?: boolean): CSSProperties => ({
  height: 46, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, padding: "0 14px", fontSize: 14, color: C.ink,
  boxShadow: "inset 0 2px 4px rgba(123,70,135,0.04)", outline: "none", width: "100%", boxSizing: "border-box", ...(ltr ? { textAlign: "right" } : {}),
});
