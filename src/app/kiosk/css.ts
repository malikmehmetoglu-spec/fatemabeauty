import type { CSSProperties } from "react";

/**
 * Inline CSS string → React style object. Used where the reception-tablet designs build state-dependent
 * styles as strings (kept verbatim so the port stays faithful to the design).
 */
export function css(s: string): CSSProperties {
  const out: Record<string, string | number> = {};
  let depth = 0, cur = "";
  const decls: string[] = [];
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { decls.push(cur); cur = ""; } else cur += ch;
  }
  decls.push(cur);
  for (const d of decls) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    let k = d.slice(0, i).trim();
    let v: string | number = d.slice(i + 1).trim();
    if (k.startsWith("-webkit-")) k = "Webkit-" + k.slice(8);
    k = k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    if (k === "fontFamily") v = /Rubik/.test(v) ? "var(--font-rubik), Rubik, sans-serif" : "var(--font-messiri), 'El Messiri', serif";
    else if (/^-?\d+(\.\d+)?px$/.test(v)) v = parseFloat(v);
    out[k] = v;
  }
  return out as CSSProperties;
}
