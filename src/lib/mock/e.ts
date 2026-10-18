/** Batch "e" (admin web) helpers + admin-only sample data copied from the designs. All person names are samples (مثال). */
import type { CSSProperties } from "react";
import { APPOINTMENTS_TODAY, DONE_TODAY, NOW, SERVICE, TODAY, toMinutes, type Appointment, type ServiceKey } from "@/lib/data";
import { arDate } from "@/lib/format";

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

/* ---------- derived from today's schedule (@/lib/data) ---------- */

export const TODAY_FULL = `${arDate(TODAY, { year: true })} · الآن ${NOW}`;

/** Short service names used in admin lists. */
export const SHORT: Record<ServiceKey, string> = { clean: "تنظيف عميق", hydra: "هيدرافيشل", peel: "تقشير", laser: "ليزر", consult: "استشارة" };

const nowMin = toMinutes(NOW);
/** Appointments due by now (ended), and the no-shows among them. */
export const DUE_NOW = APPOINTMENTS_TODAY.filter((a) => toMinutes(a.time) + a.minutes <= nowMin);
export const NO_SHOWS = DUE_NOW.filter((a) => a.status === "لم تحضر");
export const IN_SESSION = APPOINTMENTS_TODAY.filter((a) => a.status === "في الجلسة");
export const UPCOMING = APPOINTMENTS_TODAY.filter((a) => a.status === "في الانتظار" || a.status === "مؤكد" || a.status === "بانتظار التأكيد");
export const PENDING_CONFIRM = APPOINTMENTS_TODAY.filter((a) => a.status === "بانتظار التأكيد");
export const FIRST_TIME = APPOINTMENTS_TODAY[0].time;
export const LAST_TIME = APPOINTMENTS_TODAY[APPOINTMENTS_TODAY.length - 1].time;

/** Appointments per clock hour, with past / current / future state. */
export const HOURS = Array.from(new Set(APPOINTMENTS_TODAY.map((a) => a.time.slice(0, 2)))).map((h) => {
  const n = APPOINTMENTS_TODAY.filter((a) => a.time.startsWith(h)).length;
  const hh = Number(h) * 60;
  const state: "past" | "now" | "next" = hh + 60 <= nowMin ? "past" : hh <= nowMin ? "now" : "next";
  return { label: `${h}:00`, n, state };
});
export const HOURS_MAX = Math.max(...HOURS.map((h) => h.n));

/** Next patients in the queue (waiting / confirmed, in queue order). */
export const NEXT_IN_QUEUE: Appointment[] = UPCOMING.slice(0, 4);

/** Revenue by service from the finished sessions. */
export const REVENUE_BY_SERVICE = (Object.keys(SERVICE) as ServiceKey[])
  .map((k) => { const d = DONE_TODAY.filter((a) => a.service === k); return { key: k, name: SERVICE[k].name.replace(" للبشرة", ""), count: d.length, total: d.reduce((s, a) => s + a.price, 0) }; })
  .filter((r) => r.count > 0)
  .sort((a, b) => b.total - a.total);

/* ---------- W_Waitlist (sample rows from the design) ---------- */
export type WaitStatus = "match" | "waiting" | "nofit";
export const WAITLIST: { no: number; name: string; initials: string; service: string; windows: string[]; requested: Date; status: WaitStatus }[] = [
  { no: 1, name: "نغم إبراهيم", initials: "ن إ", service: "هيدرافيشل", windows: ["الخميس", "ظهراً"], requested: new Date(2026, 9, 6), status: "match" },
  { no: 2, name: "ميس عيسى", initials: "م ع", service: "ليزر", windows: ["الأربعاء", "صباحاً"], requested: new Date(2026, 9, 7), status: "waiting" },
  { no: 3, name: "دانة عطار", initials: "د ع", service: "هيدرافيشل", windows: ["أي يوم", "قبل 14:00"], requested: new Date(2026, 9, 8), status: "match" },
  { no: 4, name: "رهف زين", initials: "ر ز", service: "تنظيف عميق", windows: ["السبت", "مساءً"], requested: new Date(2026, 9, 9), status: "waiting" },
  { no: 5, name: "شام العمر", initials: "ش ا", service: "تقشير", windows: ["الخميس", "صباحاً"], requested: new Date(2026, 9, 10), status: "waiting" },
  { no: 6, name: "كندة سعيد", initials: "ك س", service: "هيدرافيشل", windows: ["الخميس", "مساءً"], requested: new Date(2026, 9, 11), status: "nofit" },
  { no: 7, name: "ولاء نجار", initials: "و ن", service: "ليزر", windows: ["الإثنين", "ظهراً"], requested: new Date(2026, 9, 12), status: "waiting" },
  { no: 8, name: "آية الشامي", initials: "آ ا", service: "تنظيف عميق", windows: ["أي يوم"], requested: new Date(2026, 9, 12), status: "waiting" },
];
/** The freed slot offered to the waitlist: Thursday 15 Oct, 12:00–13:00, hydrafacial, room 1. */
export const FREE_SLOT = { date: new Date(2026, 9, 15), from: "12:00", to: "13:00" };

/* ---------- W_Queue ---------- */
/** Check-in (arrival) times of patients already in the waiting hall, by queue number — sample values from the design. */
export const ARRIVALS: Record<number, string> = { 12: "12:20", 13: "12:26" };
export const minutesSince = (t: string) => toMinutes(NOW) - toMinutes(t);
