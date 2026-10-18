/** Batch "b" helpers + screen-only sample data (appointments, queue, journey, routine, prescriptions, consent). */
import type { CSSProperties } from "react";
import { NOW, PERSONA, PERSONA_TODAY, SERVICE, TODAY, aheadOf, toMinutes } from "@/lib/data";
import { arDate } from "@/lib/format";

export const PKG_SERVICE = SERVICE[PERSONA.packageService];
export const PKG_TOTAL = PERSONA.sessionsDone + PERSONA.sessionsLeft; // 6
export const NEXT_SESSION_NO = PERSONA.sessionsDone + 1; // 4
export const DAYS_TO_NEXT = Math.round((PERSONA.nextSession.getTime() - TODAY.getTime()) / 86400000); // 28
export const NEXT_LABEL = arDate(PERSONA.nextSession);
export const TODAY_LABEL = arDate(TODAY);

/** Past sessions newest first, with their number in the package. */
export const PAST_SESSIONS = PERSONA.sessions.map((d, i) => ({ date: d, no: i + 1 })).reverse();

/** Check-in QR modules (25×25 grid, finder patterns drawn separately) — copied from P_CheckinQR.dc.html. */
export const QR_CELLS: [number, number][] = [[10,0],[15,0],[16,0],[9,1],[11,1],[13,1],[8,2],[10,2],[11,2],[13,2],[16,2],[11,3],[12,3],[8,4],[9,4],[14,4],[15,4],[16,4],[8,5],[9,5],[11,5],[12,5],[13,5],[14,5],[15,5],[16,5],[8,6],[10,6],[12,6],[14,6],[16,6],[8,7],[9,7],[10,7],[11,7],[13,7],[14,7],[15,7],[16,7],[0,8],[2,8],[3,8],[6,8],[7,8],[12,8],[20,8],[1,9],[2,9],[3,9],[4,9],[9,9],[10,9],[11,9],[12,9],[16,9],[17,9],[20,9],[21,9],[22,9],[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[10,10],[11,10],[12,10],[13,10],[15,10],[16,10],[18,10],[19,10],[20,10],[22,10],[23,10],[24,10],[0,11],[1,11],[4,11],[5,11],[7,11],[8,11],[9,11],[16,11],[20,11],[21,11],[23,11],[0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[6,12],[8,12],[9,12],[11,12],[12,12],[13,12],[14,12],[15,12],[17,12],[19,12],[20,12],[23,12],[0,13],[1,13],[2,13],[9,13],[10,13],[13,13],[15,13],[17,13],[22,13],[24,13],[3,14],[4,14],[5,14],[6,14],[9,14],[10,14],[13,14],[14,14],[15,14],[16,14],[17,14],[18,14],[20,14],[21,14],[4,15],[5,15],[8,15],[9,15],[11,15],[13,15],[14,15],[18,15],[20,15],[21,15],[22,15],[23,15],[0,16],[2,16],[6,16],[7,16],[8,16],[9,16],[11,16],[14,16],[16,16],[18,16],[19,16],[20,16],[22,16],[8,17],[9,17],[11,17],[13,17],[14,17],[18,17],[23,17],[8,18],[9,18],[14,18],[15,18],[16,18],[17,18],[18,18],[20,18],[9,19],[11,19],[12,19],[13,19],[14,19],[15,19],[17,19],[18,19],[19,19],[9,20],[10,20],[11,20],[12,20],[13,20],[14,20],[16,20],[18,20],[23,20],[8,21],[10,21],[11,21],[13,21],[14,21],[15,21],[16,21],[19,21],[20,21],[22,21],[24,21],[10,22],[14,22],[15,22],[17,22],[18,22],[23,22],[9,23],[10,23],[13,23],[16,23],[17,23],[21,23],[23,23],[10,24],[12,24],[15,24],[16,24],[17,24],[18,24],[19,24],[21,24],[22,24],[23,24],[24,24]];

/* ---------- today's queue (derived from the shared schedule) ---------- */
export const AHEAD = aheadOf(PERSONA_TODAY);
/** Expected wait: remaining minutes of everyone ahead in the same room. */
export const WAIT_MIN = Math.max(0, AHEAD.reduce((s, a) => Math.max(s, toMinutes(a.time) + a.minutes), toMinutes(NOW)) - toMinutes(NOW));
/** Arabic count of patients: 1 → «مراجعة واحدة», 2 → «مراجعتان», 3–10 → «N مراجعات». */
export function patientsAr(n: number) {
  if (n === 0) return "لا أحد";
  if (n === 1) return "مراجعة واحدة";
  if (n === 2) return "مراجعتان";
  return n <= 10 ? `${n} مراجعات` : `${n} مراجعة`;
}

/** Toggle-chip look used by several batch-b screens (selected = lilac gradient). */
export function toggleChip(on: boolean, extra: CSSProperties = {}): CSSProperties {
  return {
    height: 38, padding: "0 14px", borderRadius: 19, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
    color: on ? "#7B4687" : "#866F8D", boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 3px 10px rgba(123,70,135,0.05)", ...extra,
  };
}
