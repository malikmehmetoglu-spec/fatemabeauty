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

/* ---------- real time (the centre works on Damascus time) ---------- */

export const TZ = "Asia/Damascus";

/** "YYYY-MM-DD" of a moment in Damascus time. */
export function dayKey(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** "13:05" in Damascus time. */
export function clock(d: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(d));
}

/** Start and end (ISO) of a Damascus calendar day, for range queries on timestamptz columns. */
export function dayRange(key: string = dayKey()) {
  const start = new Date(`${key}T00:00:00+03:00`);
  return { from: start.toISOString(), to: new Date(start.getTime() + 864e5).toISOString() };
}

/** Builds a timestamptz from a Damascus day key + "HH:MM". */
export function atDamascus(key: string, hhmm: string) {
  return new Date(`${key}T${hhmm}:00+03:00`).toISOString();
}
