import { AR_DAYS, AR_MONTHS } from "./data";

/** 1500 → "1,500 ل.س" (Western digits, new Syrian pound). */
export function money(n: number, withUnit = true) {
  const s = n.toLocaleString("en-US");
  return withUnit ? `${s} ل.س` : s;
}

/** Arabic date: "الثلاثاء 13 تشرين الأول" (+ year optionally). Always derived from a real Date → weekday is correct. */
export function arDate(d: Date, opts: { day?: boolean; year?: boolean } = {}) {
  const { day = true, year = false } = opts;
  const s = `${d.getDate()} ${AR_MONTHS[d.getMonth()]}${year ? ` ${d.getFullYear()}` : ""}`;
  return day ? `${AR_DAYS[d.getDay()]} ${s}` : s;
}

export const dayName = (d: Date) => AR_DAYS[d.getDay()];

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
