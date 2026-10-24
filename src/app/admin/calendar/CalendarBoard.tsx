"use client";

/** Day/week board of W_Calendar.dc.html (live, Supabase) — shared by /admin/calendar and /admin/calendar/new.
 *  Day view: time grid with one column per room or specialist (overlaps laid out side by side in lanes, card height = duration);
 *  phones get an hour-grouped agenda instead. Week view: 7 day columns of compact cards. */
import { dayWindows, listStaffHours, rangesOn } from "@/lib/db/staff";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listRooms, listSpecialists } from "@/lib/db/catalog";
import {
  bookingError, dateOfKey, endsAt, getHours, listRange, personName, setStatus, STATUS_KIND, STATUS_LABEL, timeOf,
  type Appointment, type Status, useSearch, weekday,
} from "@/lib/db/appointments";
import { apologyText, approveBooking, canConfirm, confirmText, getCentre, pendingCount, smsApologyText, smsConfirmText } from "@/lib/db/bookingRequests";
import { useSession } from "@/lib/supabase/session";
import { SendChannels } from "./channels";
import { isVip, VipBookingDialog, VipButton, VipStar } from "./vip";
import { GOLD_DEEP, GOLD_LINE, GOLD_SOFT, reserveStatus } from "@/lib/db/vip";
import { apptCount, arErr } from "../patients/kit";
import { AR_DAYS } from "@/lib/data";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import S from "./calendar.module.css";

const HOUR = 88; // px per hour (15 min = 22px)
const PAD = 12; // breathing room above the first hour line so its label is not clipped
const MIN_H = 24;
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const shiftKey = (k: string, n: number) => dayKey(new Date(dateOfKey(k).getTime() + n * 864e5));
const durOf = (a: Appointment) => a.minutes + (a.extension_minutes ?? 0);
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** One colour per status: the bar on the card's leading edge, a light fill and the chip. */
const ST: Record<Status, { bar: string; bg: string; bd: string; chipBg: string; chipFg: string }> = {
  pending: { bar: "#E0A23A", bg: "#FFFBF3", bd: "#F3E1BC", chipBg: "#FCEFD6", chipFg: "#8A5A12" },
  confirmed: { bar: "#7B4687", bg: "#FFFFFF", bd: "#E6D8EC", chipBg: "#F1E6F5", chipFg: "#6A3A76" },
  checked_in: { bar: "#2F8F83", bg: "#F3FAF8", bd: "#CFE8E3", chipBg: "#DDF1EC", chipFg: "#1F6A60" },
  in_session: { bar: "#C8507F", bg: "#FDF1F6", bd: "#F2CADB", chipBg: "#F9DDE8", chipFg: "#9C2F5C" },
  done: { bar: "#A99AAE", bg: "#F7F5F8", bd: "#E9E3EB", chipBg: "#ECE7EE", chipFg: "#6E6073" },
  no_show: { bar: "#B03D6A", bg: "#FFFFFF", bd: "#EBC9D6", chipBg: "#F8E3EB", chipFg: "#8E2C53" },
  cancelled: { bar: "#CFC6D2", bg: "#FBFAFB", bd: "#ECE6EE", chipBg: "#F0ECF1", chipFg: "#8F8394" },
};
const LEGEND: Status[] = ["pending", "confirmed", "checked_in", "in_session", "done", "no_show"];

type Col = { id: string | null; name: string; secondary?: boolean };
type Placed = { a: Appointment; s: number; e: number; lane: number; lanes: number };

/** Google-Calendar style lanes: overlapping appointments of one column sit side by side. */
function placeLanes(items: Appointment[]): Placed[] {
  const rows = items.map((a) => { const s = toMin(timeOf(a)); return { a, s, e: s + Math.max(durOf(a), 1), lane: 0, lanes: 1 }; })
    .sort((x, y) => x.s - y.s || y.e - x.e);
  let cluster: Placed[] = [], ends: number[] = [], clusterEnd = -1;
  const close = () => { cluster.forEach((p) => { p.lanes = ends.length; }); cluster = []; ends = []; };
  for (const p of rows) {
    if (p.s >= clusterEnd) { close(); clusterEnd = -1; }
    let lane = ends.findIndex((e) => e <= p.s);
    if (lane < 0) { lane = ends.length; ends.push(p.e); } else ends[lane] = p.e;
    p.lane = lane; cluster.push(p); clusterEnd = Math.max(clusterEnd, p.e);
  }
  close();
  return rows;
}

function payOf(a: Appointment): { paid: boolean } | null {
  const inv = (a.invoices ?? []).filter((i) => !i.void);
  if (inv.length) return { paid: inv.every((i) => i.paid) };
  return a.status === "done" ? { paid: false } : null;
}

const cardVars = (a: Appointment): CSSProperties => {
  const t = ST[a.status];
  const vip = isVip(a) && a.status !== "cancelled" && a.status !== "no_show";
  return { ["--st" as string]: t.bar, ["--bg" as string]: vip ? "linear-gradient(160deg, #FFFDF7, #FBF1D9)" : a.status === "no_show" ? "repeating-linear-gradient(135deg, #FFFFFF 0 6px, #FBF1F5 6px 12px)" : t.bg,
    ["--bd" as string]: vip ? "#E8D3A0" : t.bd, ["--chipbg" as string]: t.chipBg, ["--chipfg" as string]: t.chipFg } as CSSProperties;
};

function StatusChip({ s }: { s: Status }) {
  return <span className={S.chip}><span className={S.dot} style={{ background: ST[s].bar }} />{STATUS_LABEL[s]}</span>;
}

/** The one appointment card used everywhere (grid, week, phone agenda). */
function ApptCard({ a, by, mode, style, compact, narrow, px = 999, onOpen }: {
  a: Appointment; by: "room" | "specialist" | "both"; mode: "grid" | "week" | "agenda"; style?: CSSProperties; compact?: boolean; narrow?: boolean; px?: number; onOpen: (a: Appointment) => void;
}) {
  const vip = isVip(a);
  const range = `${timeOf(a)}–${clock(endsAt(a))}`;
  const svc = [a.service?.short_name || a.service?.name, a.level?.name].filter(Boolean).join(" · ");
  const where = by === "room" ? a.specialist?.name : by === "specialist" ? a.room?.name : [a.room?.name, a.specialist?.name].filter(Boolean).join(" · ");
  const pay = payOf(a);
  const ext = a.extension_minutes ? ` (+${a.extension_minutes} د)` : "";
  const title = `${personName(a)} · ${range}${ext} · ${svc}${where ? ` · ${where}` : ""} · ${STATUS_LABEL[a.status]}${pay ? ` · ${pay.paid ? "مدفوع" : "غير مدفوع"}` : ""}`;
  const cls = cx(S.card, vip && a.status !== "cancelled" && a.status !== "no_show" && S.cardVip, compact && S.compact, a.status === "cancelled" && S.struck,
    (a.status === "done" || a.status === "cancelled") && S.dim, mode === "week" && S.wCard, mode === "agenda" && S.aCard);
  const nameLine = (
    <div className={S.line1}>
      {vip && <VipStar size={12} />}
      <span className={S.name}>{personName(a)}</span>
    </div>
  );
  if (compact) {
    return (
      <button type="button" className={cls} style={{ ...cardVars(a), ...style }} onClick={() => onOpen(a)} title={title}>
        {nameLine}
        <span className={S.time}>{timeOf(a)}</span>
        {!narrow && <span className={S.dot} style={{ background: ST[a.status].bar }} aria-label={STATUS_LABEL[a.status]} />}
      </button>
    );
  }
  if (mode === "week") {
    return (
      <button type="button" className={cls} style={cardVars(a)} onClick={() => onOpen(a)} title={title}>
        <div className={S.line1} style={{ fontSize: 12 }}><span className={S.time} style={{ color: C.ink, fontWeight: 600 }}>{timeOf(a)}</span>{vip && <VipStar size={11} />}</div>
        <div className={S.meta} style={{ color: C.ink, fontSize: 12 }}>{personName(a)}</div>
        {svc && <div className={S.meta} style={{ fontSize: 11 }}>{svc}</div>}
      </button>
    );
  }
  return (
    <button type="button" className={cls} style={{ ...cardVars(a), ...style }} onClick={() => onOpen(a)} title={title}>
      {nameLine}
      <div className={S.meta}><span className={S.time}>{range}</span>{ext && <span style={{ color: GOLD_DEEP, fontWeight: 600 }}>{ext}</span>}</div>
      {svc && px >= 62 && <div className={S.meta} style={{ color: C.ink }}>{svc}</div>}
      {where && px >= 82 && <div className={S.meta}>{where}</div>}
      {!narrow && px >= (where ? 104 : 84) && (
        <div className={S.chips}>
          <StatusChip s={a.status} />
          {pay && <span className={S.pay}><span className={S.dot} style={{ background: pay.paid ? "#3FA46A" : "#E0A23A" }} />{pay.paid ? "مدفوع" : "غير مدفوع"}</span>}
        </div>
      )}
    </button>
  );
}

export function CalendarBody() {
  const [day, setDay] = useState(dayKey());
  const [view, setView] = useState<"day" | "week">("day");
  const [by, setBy] = useState<"room" | "specialist">("room");
  const [showCancelled, setShowCancelled] = useState(false);
  const [open, setOpen] = useState<Appointment | null>(null);
  const [vipOpen, setVipOpen] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(t); }, []);

  const weekStart = shiftKey(day, -weekday(day));
  const from = view === "day" ? day : weekStart, to = view === "day" ? day : shiftKey(weekStart, 6);
  const appts = useQuery(["appointments", "range", from, to], () => listRange(from, to));
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const hours = useQuery(["appointments", "hours"], getHours);
  const staffHours = useQuery(["staff_hours", "all"], listStaffHours);
  const pend = useQuery(["booking-requests", "count"], pendingCount);
  const reserve = useQuery(["reserve", day], () => reserveStatus(day));
  const sp = useSearch();
  const [opened, setOpened] = useState<string | null>(null);
  // deep link from «طلبات الحجز» and elsewhere: ?day=YYYY-MM-DD&open=<appointment id> (or ?id=)
  useEffect(() => { const d = sp?.get("day"); if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDay(d); }, [sp]);
  useEffect(() => {
    const id = sp?.get("open") || sp?.get("id");
    if (!id || opened === id || !appts.data) return;
    const a = appts.data.find((x) => x.id === id);
    if (a) { setOpen(a); setOpened(id); }
  }, [sp, appts.data, opened]);

  const list = useMemo(() => (appts.data ?? []).filter((a) => showCancelled || a.status !== "cancelled"), [appts.data, showCancelled]);
  const keyOf = (a: Appointment) => (by === "room" ? a.room_id : a.specialist_id);
  const cols: Col[] = useMemo(() => {
    const base: Col[] = by === "room" ? (rooms.data ?? []).map((r) => ({ id: r.id, name: r.name })) : (team.data ?? []).map((s) => ({ id: s.id, name: s.name }));
    const k = (a: Appointment) => (by === "room" ? a.room_id : a.specialist_id);
    // appointments without a room (older bookings) or a removed specialist: a secondary column, only when it has any
    const extra = list.some((a) => !base.some((c) => c.id === k(a)));
    return extra ? [...base, { id: null, name: by === "room" ? "بدون غرفة" : "غير محدّدة", secondary: true }] : base;
  }, [by, rooms.data, team.data, list]);
  const inCol = (c: Col, a: Appointment) => (c.secondary ? !cols.some((x) => !x.secondary && x.id === keyOf(a)) : keyOf(a) === c.id);

  const h = hours.data;
  // visible range: earliest start / latest end of anyone's working hours that day (own schedule or the default hours)
  const rows = staffHours.data ?? [];
  const ids = [...new Set([...(team.data ?? []).map((s) => s.id), ...rows.map((r) => r.staff_id)])];
  const windows = h ? dayWindows(rows, ids, weekday(day), h) : [];
  const dayList = view === "day" ? list : [];
  const startMin = Math.min(windows.length ? windows[0].from : 600, ...dayList.map((a) => toMin(clock(a.starts_at))));
  const endMin = Math.max(windows.length ? Math.max(...windows.map((w) => w.to)) : 1080, ...dayList.map((a) => toMin(clock(endsAt(a)))));
  const first = Math.floor(startMin / 60) * 60, last = Math.ceil(endMin / 60) * 60;
  const yOf = (m: number) => PAD + ((m - first) * HOUR) / 60;
  const bodyH = yOf(last) + PAD;
  const isToday = day === dayKey();
  const nowM = toMin(clock());
  const showNow = isToday && nowM >= first && nowM <= last;
  const loading = appts.loading || rooms.loading || hours.loading;
  const err = appts.error || rooms.error || hours.error;
  /** Working ranges (minutes) of a specialist column on this day: her «أوقات الدوام», or the default hours without a schedule; null = not a specialist column. */
  const workOf = (id: string | null) => {
    if (by !== "specialist" || !id || !h) return null;
    return rangesOn(rows, id, weekday(day), h);
  };
  const offBands = (work: { from: number; to: number }[]) => {
    const out: { from: number; to: number }[] = []; let t = first;
    for (const w of work) { if (w.from > t) out.push({ from: t, to: w.from }); t = Math.max(t, w.to); }
    if (t < last) out.push({ from: t, to: last });
    return out;
  };

  // open the day scrolled to «now» (today) or to the first appointment
  const boardRef = useRef<HTMLDivElement>(null);
  const scrolledFor = useRef("");
  useEffect(() => {
    const el = boardRef.current;
    const sig = `${day}|${view}|${by}`;
    if (!el || loading || view !== "day" || scrolledFor.current === sig) return;
    scrolledFor.current = sig;
    const firstAppt = dayList.length ? Math.min(...dayList.map((a) => toMin(timeOf(a)))) : Infinity;
    const target = showNow ? Math.min(nowM - 90, firstAppt - 15) : Number.isFinite(firstAppt) ? firstAppt - 15 : first;
    el.scrollTop = Math.max(0, yOf(target) - PAD);
  });

  const placedByCol = cols.map((c) => placeLanes(list.filter((a) => inCol(c, a))));
  const dateLabel = view === "day" ? arDate(dateOfKey(day), { year: true }) : `${arDate(dateOfKey(from), { day: false })} – ${arDate(dateOfKey(to), { day: false })}`;
  const legend = showCancelled ? [...LEGEND, "cancelled" as Status] : LEGEND;

  return (
    <div className={S.root}>
      <div className={S.bar}>
        <div className={S.barRow}>
          <div className={cx(S.group, S.navRow)}>
            <button type="button" className={S.iconBtn} aria-label={view === "day" ? "اليوم السابق" : "الأسبوع السابق"} onClick={() => setDay(shiftKey(day, view === "day" ? -1 : -7))}><Icon name="M9 6l6 6-6 6" size={16} color={C.accent} /></button>
            <button type="button" className={S.btn} disabled={isToday} onClick={() => setDay(dayKey())}>اليوم</button>
            <button type="button" className={S.iconBtn} aria-label={view === "day" ? "اليوم التالي" : "الأسبوع التالي"} onClick={() => setDay(shiftKey(day, view === "day" ? 1 : 7))}><Icon name="M15 6l-6 6 6 6" size={16} color={C.accent} /></button>
            <span className={S.dateTitle}>{dateLabel}</span>
            <input type="date" className={S.dateInput} aria-label="اختيار يوم" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} dir="ltr" />
          </div>
          <span className={S.grow} />
          <div className={S.group}>
            <div className={S.seg} role="group" aria-label="العرض">
              <button type="button" aria-pressed={view === "day"} onClick={() => setView("day")}>يوم</button>
              <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>أسبوع</button>
            </div>
            {view === "day" && (
              <div className={S.seg} role="group" aria-label="التقسيم">
                <button type="button" aria-pressed={by === "room"} onClick={() => setBy("room")}>الغرف</button>
                <button type="button" aria-pressed={by === "specialist"} onClick={() => setBy("specialist")}>الأخصائيات</button>
              </div>
            )}
          </div>
        </div>
        <div className={S.barRow}>
          <div className={S.legend} aria-label="دليل الألوان">
            {legend.map((s) => <span key={s}><i className={S.sw} style={{ background: ST[s].bar }} />{STATUS_LABEL[s]}</span>)}
            <span><VipStar size={12} />VIP</span>
          </div>
          <span className={S.grow} />
          <div className={S.group}>
            <button type="button" className={S.btn} aria-pressed={showCancelled} onClick={() => setShowCancelled(!showCancelled)}>
              <Icon name={showCancelled ? "M5 12l5 5L20 7" : "M18 6L6 18M6 6l12 12"} size={14} color={C.accent} />الملغاة
            </button>
            <VipButton onClick={() => setVipOpen(true)} height={38} style={{ borderRadius: 12, fontSize: 13.5, padding: "0 14px", boxShadow: "0 6px 14px rgba(169,129,48,0.25)" }} />
            <Link href={R.W_BookingModal} className={S.primary}><Icon name="M12 5v14M5 12h14" size={16} color={C.white} stroke={2} />موعد جديد</Link>
          </div>
        </div>
      </div>

      {(pend.data ?? 0) > 0 && (
        <Link href={R.W_BookingRequests} className={S.banner}>
          <Icon name="bell" size={18} color="#B4781C" />
          <b style={{ fontSize: 13.5 }}><span className="latin">{pend.data}</span> {pend.data === 1 ? "طلب حجز" : "طلبات حجز"} من رابط الحجز بانتظار التأكيد</b>
          <span style={{ marginInlineStart: "auto", fontSize: 13, fontWeight: 700, color: C.accent }}>مراجعة الطلبات ←</span>
        </Link>
      )}

      {h && !staffHours.loading && windows.length === 0 && view === "day" && (
        <div style={{ borderRadius: 16, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 600 }}>لا أحد من الفريق يداوم في هذا اليوم حسب «أوقات الدوام» — الحجز من التطبيق ورابط الحجز مغلق فيه.</div>
      )}

      {loading ? <Loading /> : err ? <ErrorNote>{arErr(err, "تعذّر تحميل المواعيد. أعيدي تحميل الصفحة.")}</ErrorNote> : view === "week" ? (
        <WeekGrid from={from} list={list} onOpen={setOpen} onDay={(k) => { setDay(k); setView("day"); }}
          isOff={(k) => !!h && !staffHours.loading && dayWindows(rows, ids, weekday(k), h).length === 0} />
      ) : cols.length === 0 ? (
        <EmptyState icon="cal" title={by === "room" ? "لا غرف بعد" : "لا أخصائيات بعد"} text={by === "room" ? "أضيفي غرف المركز من الإعدادات لتظهر أعمدة التقويم." : "أضيفي فريق العمل لتظهر أعمدة الأخصائيات."}
          action={<Link href={by === "room" ? R.W_Rooms : R.W_Staff} style={{ color: C.accent, fontWeight: 700 }}>فتح الإعدادات</Link>} />
      ) : (
        <>
          <div className={S.board} ref={boardRef}>
            <div className={S.grid} style={{ gridTemplateColumns: `60px ${placedByCol.map((p) => `minmax(${Math.max(cols.length > 3 ? 160 : 190, Math.max(1, ...p.map((x) => x.lanes)) * 112)}px, ${Math.min(2, Math.max(1, ...p.map((x) => x.lanes)))}fr)`).join(" ")}` }}>
              <div className={S.corner} />
              {cols.map((c) => {
                const n = list.filter((a) => inCol(c, a) && a.status !== "cancelled").length;
                const w = workOf(c.id);
                const r = by === "room" && c.id ? (reserve.data ?? []).find((x) => x.room_id === c.id && x.capacity > 0) : undefined;
                return (
                  <div key={c.id ?? "none"} className={cx(S.head, c.secondary && S.headSecondary)}>
                    <div className={S.headName} title={c.name}>{c.name}</div>
                    <div className={S.headMeta}>
                      {n > 0 ? <span className={S.headCount}>{apptCount(n)}</span> : <span style={{ color: "#C9BCCE" }}>—</span>}
                      {w && <><span aria-hidden style={{ color: "#D9CCE0" }}>|</span>{w.length ? <span className="latin" dir="ltr">{w.map((x) => `${hm(x.from)}–${hm(x.to)}`).join(" · ")}</span> : <span>لا دوام اليوم</span>}</>}
                      {c.secondary && <><span aria-hidden style={{ color: "#D9CCE0" }}>|</span><span>مواعيد قديمة بلا {by === "room" ? "غرفة" : "أخصائية"}</span></>}
                    </div>
                    {r && (
                      <div className={S.reserve} title={`١٠٪ من وقت الغرفة محجوز لحالات VIP والطوارئ — لا يظهر في رابط الحجز ولا في التطبيق.${r.walk_in_open ? " آخر ساعتين: متاح لأي حالة دون موعد." : ""}`}>
                        <VipStar size={11} title="الاحتياطي" />
                        <span>احتياطي <span className="latin">{r.reserve_left}/{r.reserve}</span> د</span>
                        <span className={S.reserveTrack}><span className={S.reserveFill} style={{ display: "block", width: `${r.reserve ? Math.max(0, Math.min(100, (r.reserve_left / r.reserve) * 100)) : 0}%` }} /></span>
                        {r.walk_in_open && r.reserve_left > 0 && <span className={S.walkin}>مفتوح لأي حالة</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className={S.times} style={{ height: bodyH }}>
                {Array.from({ length: (last - first) / 60 + 1 }, (_, i) => (
                  <span key={i} className={S.tick} style={{ top: yOf(first + i * 60) }}>{hm(first + i * 60)}</span>
                ))}
                {showNow && <span className={S.nowBadge} style={{ top: yOf(nowM) }}>{hm(nowM)}</span>}
              </div>
              {cols.map((c, ci) => {
                const placed = placedByCol[ci];
                const w = workOf(c.id);
                return (
                  <div key={c.id ?? "none"} className={cx(S.col, c.secondary && S.colSecondary)} style={{ height: bodyH }}>
                    {w && offBands(w).map((b) => <div key={b.from} className={S.off} title="خارج دوام الأخصائية" style={{ top: yOf(b.from), height: yOf(b.to) - yOf(b.from) }} />)}
                    {Array.from({ length: (last - first) / 60 + 1 }, (_, i) => <div key={`h${i}`} className={S.hourLine} style={{ top: yOf(first + i * 60) }} />)}
                    {Array.from({ length: (last - first) / 60 }, (_, i) => <div key={`m${i}`} className={S.halfLine} style={{ top: yOf(first + i * 60 + 30) }} />)}
                    {placed.length === 0 && <div className={S.emptyCol}>لا مواعيد</div>}
                    {placed.map((p) => {
                      const top = yOf(p.s) + 1, height = Math.max(MIN_H, ((p.e - p.s) * HOUR) / 60 - 2);
                      const gap = 3, pct = 100 / p.lanes;
                      return (
                        <ApptCard key={p.a.id} a={p.a} by={by} mode="grid" onOpen={setOpen} compact={p.e - p.s <= 30} narrow={p.lanes >= 3} px={height}
                          style={{ top, height, insetInlineStart: `calc(${p.lane * pct}% + ${gap}px)`, width: `calc(${pct}% - ${gap * 2}px)` }} />
                      );
                    })}
                    {showNow && <div className={S.nowLine} style={{ top: yOf(nowM) - 1 }} aria-hidden />}
                  </div>
                );
              })}
            </div>
          </div>
          <Agenda list={list} isToday={isToday} nowM={nowM} onOpen={setOpen} />
        </>
      )}

      <AppointmentDialog appt={open} onClose={() => setOpen(null)} />
      <VipBookingDialog open={vipOpen} onClose={() => setVipOpen(false)} />
    </div>
  );
}

/** Phone day view: an hour-grouped agenda instead of a squeezed grid. */
function Agenda({ list, isToday, nowM, onOpen }: { list: Appointment[]; isToday: boolean; nowM: number; onOpen: (a: Appointment) => void }) {
  const sorted = [...list].sort((x, y) => x.starts_at.localeCompare(y.starts_at));
  const groups = new Map<number, Appointment[]>();
  for (const a of sorted) { const k = Math.floor(toMin(timeOf(a)) / 60); groups.set(k, [...(groups.get(k) ?? []), a]); }
  const keys = [...groups.keys()];
  const nowAt = isToday ? keys.findIndex((k) => k * 60 > nowM) : -2;
  return (
    <div className={S.agenda}>
      {keys.length === 0 && <div style={{ textAlign: "center", padding: "28px 0", fontSize: 14, color: C.sub2 }}>لا مواعيد في هذا اليوم بعد.</div>}
      {keys.map((k, i) => (
        <div key={k} className={S.aHour}>
          {i === nowAt && <div className={S.aNow}>الآن <span className="latin">{hm(nowM)}</span></div>}
          <div className={S.aHourLabel}><span className="latin">{hm(k * 60)}</span></div>
          {groups.get(k)!.map((a) => <ApptCard key={a.id} a={a} by="both" mode="agenda" onOpen={onOpen} />)}
        </div>
      ))}
      {isToday && keys.length > 0 && nowAt === -1 && <div className={S.aNow}>الآن <span className="latin">{hm(nowM)}</span></div>}
    </div>
  );
}

/** Accent "new appointment" button used in page headers. */
export const NEW_BTN = { height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 18px", whiteSpace: "nowrap" } as CSSProperties;

function WeekGrid({ from, list, onOpen, onDay, isOff }: { from: string; list: Appointment[]; onOpen: (a: Appointment) => void; onDay: (k: string) => void; isOff: (k: string) => boolean }) {
  const days = Array.from({ length: 7 }, (_, i) => shiftKey(from, i));
  return (
    <div className={S.week}>
      {days.map((k) => {
        const items = list.filter((a) => dayKey(new Date(a.starts_at)) === k).sort((x, y) => x.starts_at.localeCompare(y.starts_at));
        const n = items.filter((a) => a.status !== "cancelled").length;
        const off = isOff(k);
        return (
          <div key={k} className={cx(S.wday, k === dayKey() && S.wdayToday, off && S.wdayOff, items.length === 0 && S.wEmptyDay)}>
            <button type="button" className={S.wHead} onClick={() => onDay(k)} title="فتح اليوم">
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}><span className={S.wDow}>{AR_DAYS[weekday(k)]}</span><span className={S.wNum}>{dateOfKey(k).getDate()}</span></span>
              <span className={S.wCount}>{off ? "عطلة" : n ? apptCount(n) : "لا مواعيد"}</span>
            </button>
            {items.length === 0 ? <div className={S.wEmpty}>—</div> : items.map((a) => <ApptCard key={a.id} a={a} by="both" mode="week" onOpen={onOpen} />)}
          </div>
        );
      })}
    </div>
  );
}

const NEXT: Partial<Record<Status, { to: Status; label: string }[]>> = {
  pending: [{ to: "confirmed", label: "تأكيد الموعد" }, { to: "cancelled", label: "إلغاء" }],
  confirmed: [{ to: "checked_in", label: "تسجيل الوصول" }, { to: "no_show", label: "لم تحضر" }, { to: "cancelled", label: "إلغاء" }],
  checked_in: [{ to: "in_session", label: "بدء الجلسة" }, { to: "confirmed", label: "التراجع عن تسجيل الوصول" }, { to: "no_show", label: "لم تحضر" }],
  in_session: [{ to: "done", label: "إنهاء الجلسة" }],
  no_show: [{ to: "confirmed", label: "إرجاع إلى مؤكد" }],
  cancelled: [{ to: "confirmed", label: "استعادة الموعد" }],
};

/** Appointment card: details + status actions. */
export function AppointmentDialog({ appt, onClose }: { appt: Appointment | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmedNow, setConfirmedNow] = useState(false);
  const { staff } = useSession();
  const centre = useQuery(["booking-requests", "centre"], getCentre);
  useEffect(() => { setError(""); setConfirmedNow(false); }, [appt]);
  if (!appt) return null;
  const a: Appointment = confirmedNow ? { ...appt, status: "confirmed" } : appt;
  const can = canConfirm(staff);
  const phone = a.patient?.phone || a.walk_in_phone;
  async function go(to: Status) {
    if ((to === "cancelled" || to === "no_show") && !window.confirm(to === "cancelled" ? "إلغاء هذا الموعد؟" : "تسجيل أنها لم تحضر؟")) return;
    setBusy(true); setError("");
    try {
      // approving a request keeps the dialog open so the WhatsApp confirmation can be sent right away
      if (a.status === "pending" && to === "confirmed") { await approveBooking(a.id); setConfirmedNow(true); }
      else { await setStatus(a.id, to); onClose(); }
    } catch (e) { setError(/not allowed/.test(String((e as Error)?.message)) ? "تأكيد المواعيد للمالكة والإدارة والاستقبال." : bookingError(e)); } finally { setBusy(false); }
  }
  const row = (label: string, value: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
      <span style={{ color: C.sub2 }}>{label}</span><b>{value}</b>
    </div>
  );
  return (
    <Modal open onClose={onClose} title={personName(a)} width={520}
      footer={<>{(NEXT[a.status] ?? []).filter((n) => (can || a.status !== "pending") && (n.to !== "checked_in" || dayKey(new Date(a.starts_at)) === dayKey()) && (n.to !== "no_show" || new Date(a.starts_at).getTime() <= Date.now())).map((n, i) => i === 0 && n.to !== "cancelled" && n.to !== "no_show"
        ? <SubmitButton key={n.to} busy={busy} onClick={() => go(n.to)}>{n.label}</SubmitButton>
        : <GhostButton key={n.to} color={n.to === "cancelled" || n.to === "no_show" ? C.danger : C.accent} onClick={() => !busy && go(n.to)}>{n.label}</GhostButton>)}</>}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
        {isVip(a) && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 28, padding: "0 12px", borderRadius: 14, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, color: GOLD_DEEP, fontSize: 12.5, fontWeight: 700 }}><VipStar size={13} />VIP</span>}
        {a.queue_no != null && <Tag kind="plum">الدور {a.queue_no}</Tag>}
        {a.patient && <span style={{ fontSize: 12.5, color: C.sub2 }}>ملف {a.patient.file_no}{a.patient.phone ? ` · ${a.patient.phone}` : ""}</span>}
        {!a.patient && a.walk_in_phone && <span className="latin" style={{ fontSize: 12.5, color: C.sub2 }}>{a.walk_in_phone}</span>}
      </div>
      <div>
        {row("الجلسة", `${a.service?.name ?? ""} · ${a.minutes} د`)}
        {row("الموعد", `${arDate(new Date(a.starts_at))} · ${timeOf(a)}`)}
        {row("الغرفة", a.room?.name ?? "—")}
        {row("الأخصائية", a.specialist?.name ?? "—")}
        {row(a.vip ? "السعر (VIP ×1.7)" : "السعر", money(a.price ?? 0))}
        {row("المصدر", a.source === "app" ? "التطبيق" : a.source === "walk_in" ? "حضور مباشر" : a.source === "public" ? "حجز من الرابط" : a.source === "admin" ? "الإدارة" : "الاستقبال")}
        {a.note && row("ملاحظة المراجِعة", a.note)}
        {a.cancel_reason && row("سبب الإلغاء", a.cancel_reason)}
      </div>
      {a.status === "confirmed" && can && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRadius: 18, padding: "12px 14px", background: confirmedNow ? "#EAF7EF" : "#F8F2FA" }}>
          {confirmedNow && <b style={{ fontSize: 13.5, color: "#2F6E4A" }}>تم تأكيد الموعد — أرسلي التأكيد لها الآن.</b>}
          <SendChannels appt={a} kind="confirm" phone={phone} waText={confirmText(a, centre.data ?? {})} smsText={smsConfirmText(a)} label="إرسال التأكيد عبر" />
        </div>
      )}
      {a.status === "cancelled" && can && (a.patient_id || phone) && (
        <div style={{ borderRadius: 18, padding: "12px 14px", background: "#FBF1F3" }}>
          <SendChannels appt={a} kind="apology" phone={phone} waText={apologyText(a, a.cancel_reason ?? "", centre.data ?? {})} smsText={smsApologyText(a)} label="إرسال رسالة اعتذار عبر" />
        </div>
      )}
      {a.patient_id && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13.5, fontWeight: 700 }}>
          <Link href={`${R.W_Record}?id=${a.patient_id}`} style={{ color: C.accent }}>فتح ملفها</Link>
          {(a.status === "in_session" || a.status === "done") && <Link href={`${R.W_SessionNote}?appointment=${a.id}&patient=${a.patient_id}`} style={{ color: C.accent }}>ملاحظة الجلسة</Link>}
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
