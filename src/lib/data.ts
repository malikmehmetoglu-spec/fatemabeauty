/**
 * Shared constants and helpers. All business data (services, prices, team, patients, appointments…) lives in Supabase —
 * see src/lib/db/*. Nothing in this file is sample data.
 */

export type ServiceKey = "clean" | "hydra" | "peel" | "laser" | "consult";
export type Service = { key: ServiceKey; name: string; price: number; minutes: number; room: string; from?: boolean; desc: string };

export const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]; // index = Date.getDay()
export const AR_MONTHS = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];

export function initials(name: string) {
  const p = name.split(" ");
  return p.length > 1 ? `${p[0][0]} ${p[p.length - 1][0]}` : p[0][0];
}
