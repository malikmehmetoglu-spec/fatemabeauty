/** Batch "e" (admin web) helpers + admin-only sample data copied from the designs. All person names are samples (مثال). */
import type { CSSProperties } from "react";

/** Convert a design CSS string ("a:b;c:d") into a React style object (used where the design computes styles in JS). */
export function css(s: string): CSSProperties {
  const o: Record<string, string> = {};
  for (const part of s.split(/;(?![^(]*\))/)) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (!k || k === "box-sizing") continue;
    const key = k.startsWith("-webkit-") ? "Webkit" + k.slice(8).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    o[key] = v;
  }
  return o as CSSProperties;
}
