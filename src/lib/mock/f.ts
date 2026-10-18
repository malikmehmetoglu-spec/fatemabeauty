/** Batch "f" — admin finance / inventory sample data. Today's sessions always derive from @/lib/data. */
import { DONE_TODAY, TODAY, toMinutes, type Appointment } from "@/lib/data";

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const ymd = `${String(TODAY.getMonth() + 1).padStart(2, "0")}${String(TODAY.getDate()).padStart(2, "0")}`;

/** Card payments in the design: laser sessions; everything else cash. */
export const payMethod = (a: Appointment) => (a.service === "laser" ? "بطاقة" : "نقدي");

export type Invoice = Appointment & { inv: string; issuedAt: string; method: "نقدي" | "بطاقة" };

/** One invoice per finished paid session, issued when the session ends (INV-MMDD-NN). */
export const INVOICES_TODAY: Invoice[] = DONE_TODAY.filter((a) => a.price > 0)
  .map((a) => ({ ...a, end: toMinutes(a.time) + a.minutes }))
  .sort((a, b) => a.end - b.end || a.queueNo - b.queueNo)
  .map(({ end, ...a }, i) => ({ ...a, inv: `INV-${ymd}-${String(i + 1).padStart(2, "0")}`, issuedAt: hhmm(end), method: payMethod(a) }));

export const endTime = (a: Appointment) => hhmm(toMinutes(a.time) + a.minutes);
export const CASH_TODAY = INVOICES_TODAY.filter((i) => i.method === "نقدي").reduce((s, i) => s + i.price, 0);
export const CARD_TODAY = INVOICES_TODAY.filter((i) => i.method === "بطاقة").reduce((s, i) => s + i.price, 0);

/* ---------- commissions (W_Commissions) — monthly sample figures from the design ---------- */
export type CommissionRow = { name: string; ex: boolean; ini: string; sessions: number; revenue: number; rate: number; comm: number; breakdown: { l: string }[] };
export const COMMISSIONS: { oct: CommissionRow[]; sep: CommissionRow[] } = {"oct": [{"name": "فاطمة طيبة", "ex": false, "ini": "ف ط", "sessions": 92, "revenue": 161000, "rate": 0, "comm": 0, "breakdown": [{"l": "تنظيف 46"}, {"l": "هيدرافيشل 29"}, {"l": "تقشير 17"}]}, {"name": "ريم الحسن", "ex": true, "ini": "ر ا", "sessions": 80, "revenue": 280000, "rate": 10, "comm": 28000, "breakdown": [{"l": "ليزر 80"}]}, {"name": "هبة العلي", "ex": true, "ini": "ه ا", "sessions": 89, "revenue": 127000, "rate": 10, "comm": 12700, "breakdown": [{"l": "تنظيف 34"}, {"l": "هيدرافيشل 13"}, {"l": "تقشير 25"}, {"l": "استشارة 17"}]}], "sep": [{"name": "فاطمة طيبة", "ex": false, "ini": "ف ط", "sessions": 220, "revenue": 385000, "rate": 0, "comm": 0, "breakdown": [{"l": "تنظيف 110"}, {"l": "هيدرافيشل 70"}, {"l": "تقشير 40"}]}, {"name": "ريم الحسن", "ex": true, "ini": "ر ا", "sessions": 190, "revenue": 665000, "rate": 10, "comm": 66500, "breakdown": [{"l": "ليزر 190"}]}, {"name": "هبة العلي", "ex": true, "ini": "ه ا", "sessions": 210, "revenue": 300000, "rate": 10, "comm": 30000, "breakdown": [{"l": "تنظيف 80"}, {"l": "هيدرافيشل 30"}, {"l": "تقشير 60"}, {"l": "استشارة 40"}]}]};
