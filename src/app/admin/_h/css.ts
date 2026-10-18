import type { CSSProperties } from "react";

/**
 * Turns a CSS declaration string (as computed by the design's interactive logic, e.g. a toggle or chip look)
 * into a React style object. Used only for state-dependent styles ported from the batch-h admin designs.
 */
export function css(s: string | undefined | null): CSSProperties {
  const out: Record<string, string> = {};
  if (!s) return out;
  let depth = 0;
  let buf = "";
  const decls: string[] = [];
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { decls.push(buf); buf = ""; } else buf += ch;
  }
  decls.push(buf);
  for (const d of decls) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    let k = d.slice(0, i).trim();
    if (!k) continue;
    if (k.startsWith("-webkit-")) k = "Webkit-" + k.slice(8);
    k = k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[k] = d.slice(i + 1).trim();
  }
  // the designs have no global border-box rule: sized boxes with padding/border are content-box unless stated
  if (!out.boxSizing && (out.height || out.width) && Object.keys(out).some((x) => x.startsWith("padding") || (x.startsWith("border") && x !== "borderRadius"))) {
    out.boxSizing = "content-box";
  }
  return out as CSSProperties;
}

/** 12500 → "12,500" */
export const fmt = (n: number | string) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Design toggle look (RTL: ON knob on the left) as a CSS string. */
export function tg(on: boolean) {
  return "width:52px;height:30px;border-radius:15px;padding:3px;box-sizing:border-box;border:none;flex-shrink:0;display:flex;justify-content:" + (on ? "flex-end" : "flex-start") +
    ";background:" + (on ? "linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)" : "#E6DDE8");
}

/** Design chip look as a CSS string. */
export function ch(on: boolean, h = 36) {
  return "height:" + h + "px;padding:0 14px;border-radius:" + h / 2 + "px;font-family:inherit;font-size:13px;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid " + (on ? "#FFFFFF" : "#EADCF0") +
    ";background:" + (on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF") + ";color:" + (on ? "#7B4687" : "#866F8D") +
    ";box-shadow:" + (on ? "0 6px 14px rgba(150,100,170,0.25)" : "0 3px 10px rgba(123,70,135,0.05)");
}
