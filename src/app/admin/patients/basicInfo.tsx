"use client";

/** Basic (non-medical) patient info: labels, age, and the day / month-name / year birth-date picker. */
import type { CSSProperties } from "react";
import { C } from "@/lib/tokens";

export const GENDER_LABEL: Record<string, string> = { female: "أنثى", male: "ذكر" };
export const MARITAL_LABEL: Record<string, string> = { single: "عزباء", married: "متزوجة", divorced: "مطلّقة", widowed: "أرملة" };
export const MARITAL_LABEL_M: Record<string, string> = { single: "أعزب", married: "متزوج", divorced: "مطلّق", widowed: "أرمل" };
export const SOURCE_LABEL: Record<string, string> = { app: "تطبيق المراجعة", public: "رابط الحجز", reception: "الاستقبال", kiosk: "جهاز الاستقبال", walk_in: "زيارة مباشرة", mira: "ميرا" };
export const sourceLabel = (s: string | null) => (s ? SOURCE_LABEL[s] ?? s : "الاستقبال");
export const maritalLabel = (m: string | null, gender: string | null) => (m ? (gender === "male" ? MARITAL_LABEL_M : MARITAL_LABEL)[m] ?? m : null);

/** Whole years, Damascus calendar date. */
export function ageOf(birth: string | null): number | null {
  if (!birth) return null;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus" }).format(new Date());
  const [ty, tm, td] = today.split("-").map(Number);
  const [y, m, d] = birth.split("-").map(Number);
  if (!y) return null;
  const a = ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
  return a >= 0 && a < 130 ? a : null;
}

export const MONTHS = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1920 + 1 }, (_, i) => THIS_YEAR - i);
const sel: CSSProperties = { height: 46, borderRadius: 23, background: "#FAF7FB", border: `1px solid ${C.border}`, padding: "0 10px", fontSize: 14, outline: "none", appearance: "none", WebkitAppearance: "none", textAlign: "center", textAlignLast: "center", minWidth: 0, cursor: "pointer", fontFamily: "inherit" };
const lab: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 5 };

/** value/onChange are "YYYY-MM-DD" or "" — emits a date only when all three parts are chosen. */
export function BirthDateSelect({ value, onChange, label = "تاريخ الميلاد" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [y, m, d] = (value || "--").split("-");
  const parts = { d: d ? String(Number(d)) : "", m: m ? String(Number(m)) : "", y: y ?? "" };
  // keep partial choices in the string as "Y-M-D" with blanks; parent reads isoBirth()
  function set(k: "d" | "m" | "y", v: string) {
    const n = { ...parts, [k]: v };
    onChange(`${n.y}-${n.m ? n.m.padStart(2, "0") : ""}-${n.d ? n.d.padStart(2, "0") : ""}`);
  }
  return (
    <div style={{ minWidth: 0 }}>
      <span style={lab}>{label}</span>
      <div role="group" aria-label={label} style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr 1.25fr", gap: 6 }}>
        <select aria-label="اليوم" value={parts.d} onChange={(e) => set("d", e.target.value)} style={{ ...sel, color: parts.d ? C.ink : C.muted }}>
          <option value="">اليوم</option>
          {Array.from({ length: 31 }, (_, i) => <option key={i} value={String(i + 1)}>{i + 1}</option>)}
        </select>
        <select aria-label="الشهر" value={parts.m} onChange={(e) => set("m", e.target.value)} style={{ ...sel, color: parts.m ? C.ink : C.muted }}>
          <option value="">الشهر</option>
          {MONTHS.map((x, i) => <option key={x} value={String(i + 1)}>{x}</option>)}
        </select>
        <select aria-label="السنة" value={parts.y} onChange={(e) => set("y", e.target.value)} style={{ ...sel, color: parts.y ? C.ink : C.muted }}>
          <option value="">السنة</option>
          {YEARS.map((x) => <option key={x} value={String(x)}>{x}</option>)}
        </select>
      </div>
    </div>
  );
}

/** "" when empty, null when partial/invalid, else a real ISO date. */
export function isoBirth(v: string): string | null | "" {
  if (!v || v === "--") return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return dt.getUTCDate() === +m[3] ? v : null;
}

export function GenderPick({ value, onChange }: { value: string; onChange: (v: "female" | "male") => void }) {
  const b = (on: boolean): CSSProperties => ({ flex: 1, height: 46, borderRadius: 23, border: `1px solid ${on ? C.accent : C.border}`, background: on ? "#F6EAF8" : "#FAF7FB", color: on ? C.accent : C.sub, fontWeight: on ? 700 : 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit" });
  return (
    <div style={{ minWidth: 0 }}>
      <span style={lab}>الجنس</span>
      <div role="radiogroup" aria-label="الجنس" style={{ display: "flex", gap: 6 }}>
        {(["female", "male"] as const).map((g) => <button key={g} type="button" role="radio" aria-checked={value === g} onClick={() => onChange(g)} style={b(value === g)}>{GENDER_LABEL[g]}</button>)}
      </div>
    </div>
  );
}

/** Small ♀/♂-style marker for lists. */
export function GenderMark({ gender }: { gender: string | null }) {
  const male = gender === "male";
  return <span title={male ? "ذكر" : "أنثى"} aria-label={male ? "ذكر" : "أنثى"} style={{ fontSize: 12, color: male ? "#5A7BB5" : C.accentMid, fontFamily: "sans-serif" }}>{male ? "♂" : "♀"}</span>;
}
