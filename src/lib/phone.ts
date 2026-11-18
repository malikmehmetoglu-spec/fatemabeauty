/**
 * Phone numbers (same rule as private.norm_phone_sy, migration 0196):
 * - Syrian: 09…, 9…, 963…, +963…, 00963… → "+9639XXXXXXXX"
 * - Other countries: typed with + or 00 and the country code (e.g. +90 532…, 0049…) → "+<digits>" (7–15 digits)
 * Returns null when the number is not valid.
 */
export function normPhone(raw?: string | null): string | null {
  const v = (raw ?? "").trim();
  const all = v.replace(/\D/g, "");
  if (!all) return null;
  if (/^(\+|00)/.test(v)) {
    const d0 = all.replace(/^00/, "");
    if (!d0.startsWith("963")) return /^[1-9]\d{6,14}$/.test(d0) ? `+${d0}` : null;
  }
  const d = all.replace(/^(00963|963|0)/, "");
  return /^9\d{8}$/.test(d) ? `+963${d}` : null;
}
export const phoneOk = (raw?: string | null) => normPhone(raw) !== null;
export const isSyrian = (p?: string | null) => !!p && p.startsWith("+963");
/** Error line shown under booking forms. */
export const PHONE_ERR = "رقم الهاتف إلزامي: رقم سوري يبدأ بـ 09، أو رقم أجنبي بالرمز الدولي (مثل +90…).";
/** For display: Syrian «0933 123 456», others as «+90 5321234567». */
export function showPhone(p?: string | null) {
  if (!p) return "—";
  if (isSyrian(p)) { const d = p.slice(4); return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`; }
  return p;
}
