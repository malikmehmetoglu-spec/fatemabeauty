/**
 * Batch "g" — admin inventory / team / marketing screens.
 * Admin-only sample values copied from the designs (W_Purchases … W_Reviews). Every person name here is a sample
 * (shown with «مثال»), except فاطمة طيبة. Staff come from STAFF in @/lib/data.
 */
import type { CSSProperties } from "react";

/** Inline CSS string (as written in the designs' logic) → React style object. */
export function css(s: string): CSSProperties {
  const o: Record<string, string | number> = {};
  for (const decl of s.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim();
    if (!k || (k === "box-sizing" && v === "border-box")) continue;
    const key = k.startsWith("-webkit-") ? "Webkit" + k.slice(8).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      : k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    o[key] = v;
  }
  return o as CSSProperties;
}

export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export type GTag = "pink" | "green" | "amber" | "gray" | "plum";
const TAGST: Record<GTag, string> = {
  pink: "background:#F3EAF6;color:#B03D6A", green: "background:#E6F4EC;color:#2E7D50", amber: "background:#FCF1DE;color:#8A5A12",
  gray: "background:#F0EDF0;color:#695D6B", plum: "background:#7B4687;color:#FFFFFF",
};
export const tagStyle = (k: GTag) =>
  "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;" + TAGST[k];

/** Toggle track style used by the marketing screens. */
export const tg = (on: boolean) =>
  "width:52px;height:30px;border-radius:15px;padding:3px;border:none;flex-shrink:0;display:flex;justify-content:" + (on ? "flex-end" : "flex-start") +
  ";background:" + (on ? "linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)" : "#E6DDE8");

/** Chip style used by the marketing screens. */
export const ch = (on: boolean, h = 36) =>
  "height:" + h + "px;padding:0 14px;border-radius:" + h / 2 + "px;font-family:inherit;font-size:13px;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid " + (on ? "#FFFFFF" : "#EADCF0") +
  ";background:" + (on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF") + ";color:" + (on ? "#7B4687" : "#866F8D") +
  ";box-shadow:" + (on ? "0 6px 14px rgba(150,100,170,0.25)" : "0 3px 10px rgba(123,70,135,0.05)");

/* ---------- W_Stocktake ---------- */
export const STOCKTAKE = [
  { name: "مصل الهيالورونيك", lot: "HA-2607-11", unit: "أمبولة", sys: 18, cnt: 18, diff: 0 },
  { name: "محلول جلسات الهيدرافيشل", lot: "HF-2604-05", unit: "عبوة", sys: 14, cnt: 15, diff: 1 },
  { name: "مواد التقشير (محلول)", lot: "PL-2606-07", unit: "عبوة", sys: 6, cnt: 6, diff: 0 },
  { name: "جل التبريد لجلسات الليزر", lot: "LG-2609-01", unit: "عبوة", sys: 9, cnt: 9, diff: 0 },
  { name: "ماسك مهدئ", lot: "MS-2605-03", unit: "عبوة", sys: 24, cnt: 24, diff: 0 },
  { name: "منظف رغوي للبشرة", lot: "CL-2607-09", unit: "عبوة", sys: 20, cnt: 19, diff: -1 },
  { name: "واقي شمس للبيع", lot: "SP-2608-02", unit: "عبوة", sys: 35, cnt: 33, diff: -2 },
  { name: "قفازات طبية", lot: "GL-2608-12", unit: "علبة", sys: 12, cnt: 12, diff: 0 },
];

/* ---------- staff names (from STAFF) ---------- */
import { STAFF } from "@/lib/data";
/** Staff name by id: SN.reem → «ريم الحسن». */
export const SN = Object.fromEntries(STAFF.map((s) => [s.id, s.name])) as Record<"fatema" | "reem" | "hiba" | "lina" | "salma", string>;

/* ---------- W_Payroll (September 2026, sample values) ---------- */
export const PAYROLL = [
  { id: "reem", base: "40,000", comm: "66,500", ded: "0", net: "106,500", why: "لا استقطاعات", commNote: "10% (مثال) من إيراد 190 جلسة · 665,000 ل.س" },
  { id: "hiba", base: "36,000", comm: "30,000", ded: "0", net: "66,000", why: "لا استقطاعات", commNote: "10% (مثال) من إيراد 210 جلسة · 300,000 ل.س" },
  { id: "lina", base: "25,000", comm: "0", ded: "5,000", net: "20,000", why: "استرداد سلفة", commNote: "لا عمولة — دور إداري" },
  { id: "salma", base: "30,000", comm: "0", ded: "1,000", net: "29,000", why: "تأخير", commNote: "لا عمولة — دور إداري" },
].map((p) => {
  const s = STAFF.find((x) => x.id === p.id)!;
  return { ...p, name: s.name, role: s.role, ini: s.initials };
});
