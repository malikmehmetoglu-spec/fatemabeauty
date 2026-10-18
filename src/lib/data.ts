/**
 * Reference data for every screen (port of the design kit's data.py).
 *
 * This is the temporary data source until Supabase is connected. Screens must read from here
 * (or from functions in this file) — never invent numbers inline — so the whole app tells one story.
 *
 * Rules:
 *  - The only real person is فاطمة طيبة. Every other name is a SAMPLE → show it with <PersonName sample> / <ExampleTag/>.
 *  - Prices: approximate, new Syrian pound (ل.س). "Today" = Tuesday 13 Oct 2026, 12:30.
 *
 * Data fixes (18 Oct 2026) vs. the design canvas:
 *  1. The 14:15 session in room 2 is a deep cleansing, not a hydrafacial (the hydrafacial device is in room 1).
 *  2. The phone persona's visit today is in the admin schedule: 13:00, room 1, queue number 12, with فاطمة طيبة.
 *  3. File 1024 is the persona (sample name «ريم سالم») everywhere.
 */

export type ServiceKey = "clean" | "hydra" | "peel" | "laser" | "consult";
export type Service = { key: ServiceKey; name: string; price: number; minutes: number; room: string; from?: boolean; desc: string };
export type Staff = { id: string; name: string; role: string; sample: boolean; initials: string };
export type AppointmentStatus = "انتهت" | "لم تحضر" | "في الجلسة" | "في الانتظار" | "مؤكد" | "بانتظار التأكيد";
export type Appointment = {
  id: string; time: string; room: string; service: ServiceKey; serviceName: string; specialist: string;
  name: string; sample: boolean; fileNo: number; status: AppointmentStatus; price: number; queueNo: number; minutes: number;
};

/* ---------- time ---------- */

export const TODAY = new Date(2026, 9, 13); // الثلاثاء 13 تشرين الأول 2026
export const NOW = "12:30";
export const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]; // index = Date.getDay()
export const AR_MONTHS = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];

/* ---------- services ---------- */

export const SERVICES: Service[] = [
  { key: "clean", name: "تنظيف عميق للبشرة", price: 1500, minutes: 60, room: "غرفة 1", desc: "تنظيف المسام وإزالة الرؤوس السوداء" },
  { key: "hydra", name: "هيدرافيشل", price: 2000, minutes: 60, room: "غرفة 1", desc: "تنظيف وترطيب عميق بالجهاز" },
  { key: "peel", name: "تقشير البشرة", price: 2000, minutes: 45, room: "غرفة 2", desc: "تجديد البشرة وتوحيد لونها" },
  { key: "laser", name: "جلسة ليزر", price: 3500, minutes: 45, room: "غرفة 3", from: true, desc: "السعر حسب المنطقة" },
  { key: "consult", name: "استشارة في المركز", price: 0, minutes: 20, room: "غرفة 2", desc: "تقييم بشرتكِ وخطة تناسبها" },
];
export const SERVICE = Object.fromEntries(SERVICES.map((s) => [s.key, s])) as Record<ServiceKey, Service>;

/** Packages: 6 sessions for the price of 5. */
export const PACKAGE_RULE = "6 جلسات بسعر 5";
export const PACKAGES = (["clean", "hydra", "peel"] as ServiceKey[]).map((k) => ({
  service: k, name: SERVICE[k].name, sessions: 6, price: SERVICE[k].price * 5, saving: SERVICE[k].price,
}));

export const ROOMS = ["غرفة 1", "غرفة 2", "غرفة 3"];
export const DEVICES = [{ name: "جهاز الهيدرافيشل", room: "غرفة 1" }, { name: "جهاز الليزر", room: "غرفة 3" }];

/* ---------- team ---------- */

export const STAFF: Staff[] = [
  { id: "fatema", name: "فاطمة طيبة", role: "أخصائية عناية بالبشرة", sample: false, initials: "ف ط" },
  { id: "reem", name: "ريم الحسن", role: "أخصائية ليزر", sample: true, initials: "ر ح" },
  { id: "hiba", name: "هبة العلي", role: "أخصائية عناية بالبشرة", sample: true, initials: "ه ع" },
  { id: "lina", name: "لينا خوري", role: "الاستقبال", sample: true, initials: "ل خ" },
  { id: "salma", name: "سلمى حداد", role: "المحاسبة", sample: true, initials: "س ح" },
];
export const isSampleName = (name: string) => name !== "فاطمة طيبة";

/* ---------- the phone-app persona (no name shown inside the phone app) ---------- */

export const PERSONA = {
  name: "ريم سالم",            // sample name, shown only in staff screens
  fileNo: 1024,
  package: "تنظيف عميق · 6 جلسات",
  packageService: "clean" as ServiceKey,
  packagePrice: 7500,
  sessionsDone: 3,
  sessionsLeft: 3,
  sessions: [new Date(2026, 7, 18), new Date(2026, 8, 15), new Date(2026, 9, 13)],
  nextSession: new Date(2026, 10, 10),
  nextTime: "10:30",
  todayTime: "13:00",
  queueNo: 12,
  room: "غرفة 1",
  points: 320,
  tier: "الفضية",
  toNextTier: 180,
  specialist: "فاطمة طيبة",
};

/* ---------- sample patient names (always tagged مثال) ---------- */

export const NAMES = ["ريم سالم", "لمى حداد", "نور الأحمد", "سارة يوسف", "رنا خليل", "هالة منصور", "ديما شاهين", "ميس عيسى",
  "جود الحلبي", "تالا ناصر", "لين عبود", "روان قاسم", "بتول درويش", "يارا حمدان", "غنى صباغ", "ماريا جرجس",
  "آية الشامي", "نغم إبراهيم", "سلاف موسى", "دانة عطار", "رهف زين", "شام العمر", "ولاء نجار", "كندة سعيد"];

export function initials(name: string) {
  const p = name.split(" ");
  return p.length > 1 ? `${p[0][0]} ${p[p.length - 1][0]}` : p[0][0];
}

/* ---------- today's schedule (deterministic) ---------- */

const PERSONA_INDEX = 11;
const PLAN: [string, string, ServiceKey, string][] = [
  ["10:00", "غرفة 1", "clean", "فاطمة طيبة"], ["10:00", "غرفة 3", "laser", "ريم الحسن"], ["10:15", "غرفة 2", "peel", "هبة العلي"],
  ["10:45", "غرفة 3", "laser", "ريم الحسن"], ["11:00", "غرفة 1", "hydra", "فاطمة طيبة"], ["11:00", "غرفة 2", "consult", "هبة العلي"],
  ["11:30", "غرفة 2", "clean", "هبة العلي"], ["11:30", "غرفة 3", "laser", "ريم الحسن"], ["12:00", "غرفة 1", "clean", "فاطمة طيبة"],
  ["12:15", "غرفة 3", "laser", "ريم الحسن"], ["12:30", "غرفة 2", "peel", "هبة العلي"], ["13:00", "غرفة 1", "clean", "فاطمة طيبة"],
  ["13:00", "غرفة 3", "laser", "ريم الحسن"], ["13:15", "غرفة 2", "clean", "هبة العلي"], ["14:00", "غرفة 1", "clean", "فاطمة طيبة"],
  ["14:00", "غرفة 3", "laser", "ريم الحسن"], ["14:15", "غرفة 2", "clean", "هبة العلي"], ["15:00", "غرفة 1", "peel", "فاطمة طيبة"],
  ["15:00", "غرفة 3", "laser", "ريم الحسن"], ["15:30", "غرفة 2", "clean", "هبة العلي"], ["16:00", "غرفة 1", "hydra", "فاطمة طيبة"],
  ["16:00", "غرفة 3", "laser", "ريم الحسن"], ["16:30", "غرفة 2", "consult", "هبة العلي"], ["17:00", "غرفة 1", "clean", "فاطمة طيبة"],
  ["17:00", "غرفة 3", "laser", "ريم الحسن"], ["17:15", "غرفة 2", "peel", "هبة العلي"],
];

export const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function buildToday(): Appointment[] {
  const now = toMinutes(NOW);
  return PLAN.map(([time, room, svc, sp], i) => {
    // the persona takes slot 11; the name she would have had moves to slot 0 so no name repeats
    const name = i === PERSONA_INDEX ? PERSONA.name : i === 0 ? NAMES[PERSONA_INDEX] : NAMES[i % NAMES.length];
    const hm = toMinutes(time);
    const dur = SERVICE[svc].minutes;
    let status: AppointmentStatus;
    if (hm + dur <= now) status = i !== 5 ? "انتهت" : "لم تحضر";
    else if (hm <= now && now < hm + dur) status = "في الجلسة";
    else if (hm - now <= 30) status = "في الانتظار";
    else status = i % 4 ? "مؤكد" : "بانتظار التأكيد";
    return {
      id: `a${i + 1}`, time, room, service: svc, serviceName: SERVICE[svc].name, specialist: sp,
      name, sample: true, fileNo: i === PERSONA_INDEX ? PERSONA.fileNo : 1000 + i * 7,
      status, price: SERVICE[svc].price, queueNo: i + 1, minutes: dur,
    };
  });
}

export const APPOINTMENTS_TODAY = buildToday();
export const COUNT_TODAY = APPOINTMENTS_TODAY.length; // 26
export const DONE_TODAY = APPOINTMENTS_TODAY.filter((a) => a.status === "انتهت");
export const REVENUE_SO_FAR = DONE_TODAY.reduce((s, a) => s + a.price, 0);
export const REVENUE_EXPECTED = APPOINTMENTS_TODAY.filter((a) => a.status !== "لم تحضر").reduce((s, a) => s + a.price, 0);
export const PERSONA_TODAY = APPOINTMENTS_TODAY[PERSONA_INDEX];

/** Patients in the same room still ahead of `a` (in session or waiting, earlier queue number). */
export function aheadOf(a: Appointment) {
  return APPOINTMENTS_TODAY.filter((x) => x.room === a.room && x.queueNo < a.queueNo && (x.status === "في الجلسة" || x.status === "في الانتظار"));
}

export const STATUS_TAG: Record<AppointmentStatus, "gray" | "pink" | "plum" | "amber" | "green"> = {
  "انتهت": "gray", "لم تحضر": "pink", "في الجلسة": "plum", "في الانتظار": "amber", "مؤكد": "green", "بانتظار التأكيد": "amber",
};

export const PRICE_SOURCES = [
  "https://www.barbinabeauty.com/index.php?cat=listofservices",
  "https://dermatologist-in-syria.com/",
];
