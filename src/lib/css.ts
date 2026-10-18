import type { CSSProperties } from "react";

/** "a:b;c:d" CSS string → React style object (used by screens ported from the design files). */
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

