"use client";

/** Day/week board of W_Calendar.dc.html (live, Supabase) — shared by /admin/calendar and /admin/calendar/new. */
import { listStaffHours, rangesOn } from "@/lib/db/staff";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Chip, EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, Segment, SubmitButton, Tag, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listRooms, listSpecialists } from "@/lib/db/catalog";
import {
  bookingError, dateOfKey, endsAt, getHours, listRange, personName, saveHours, setStatus, STATUS_KIND, STATUS_LABEL, timeOf,
  type Appointment, type Hours, type Status, weekday,
} from "@/lib/db/appointments";
import { apptCount, arErr } from "../patients/kit";
import { AR_DAYS } from "@/lib/data";
import { arDate, clock, dayKey } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, SH, SHB } from "@/lib/tokens";
import css from "./appts.module.css";

const HOUR = 75; // px per hour
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const shiftKey = (k: string, n: number) => dayKey(new Date(dateOfKey(k).getTime() + n * 864e5));

const LOOK: Record<Status, CSSProperties> = {
  done: { background: "#F4F0F5", border: "1px solid #EAE1EC", color: "#866F8D" },
  checked_in: { background: "#FFF5E6", border: "1px solid #F2D8AA", color: "#7A4F12" },
  pending: { background: "#FFFFFF", border: "1.5px dashed #E2B868", color: "#35213D" },
  confirmed: { background: "#FFFFFF", border: "1px solid #E9DCEE", borderRight: "4px solid #3FA46A", boxShadow: "0 6px 14px rgba(123,70,135,0.07)", color: "#35213D" },
  in_session: { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: "#7B4687" },
  no_show: { background: "repeating-linear-gradient(135deg, #FAF4FB 0 8px, #F3E6F6 8px 16px)", border: "1px dashed #D2ACDA", color: "#B03D6A" },
  cancelled: { background: "#FAFAFA", border: "1px dashed #E0D8E2", color: "#A99AAE", textDecoration: "line-through" },
};

type Col = { id: string | null; name: string };

export function CalendarBody() {
  const { staff } = useSession();
  const [day, setDay] = useState(dayKey());
  const [view, setView] = useState<"day" | "week">("day");
  const [by, setBy] = useState<"room" | "specialist">("room");
  const [showCancelled, setShowCancelled] = useState(false);
  const [open, setOpen] = useState<Appointment | null>(null);
  const [editHours, setEditHours] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(t); }, []);

  const weekStart = shiftKey(day, -weekday(day));
  const from = view === "day" ? day : weekStart, to = view === "day" ? day : shiftKey(weekStart, 6);
  const appts = useQuery(["appointments", "range", from, to], () => listRange(from, to));
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const hours = useQuery(["appointments", "hours"], getHours);
  const staffHours = useQuery(["staff_hours", "all"], listStaffHours);

  const list = (appts.data ?? []).filter((a) => showCancelled || a.status !== "cancelled");
  const cols: Col[] = useMemo(() => {
    const base: Col[] = by === "room" ? (rooms.data ?? []).map((r) => ({ id: r.id, name: r.name })) : (team.data ?? []).map((s) => ({ id: s.id, name: s.name }));
    const key = (a: Appointment) => (by === "room" ? a.room_id : a.specialist_id);
    const extra = list.some((a) => !base.some((c) => c.id === key(a)));
    return extra ? [...base, { id: null, name: by === "room" ? "بدون غرفة" : "غير محدّدة" }] : base;
  }, [by, rooms.data, team.data, list]);

  const h = hours.data;
  const startMin = Math.min(h ? toMin(h.from) : 600, ...list.map((a) => toMin(clock(a.starts_at))));
  const endMin = Math.max(h ? toMin(h.to) : 1080, ...list.map((a) => toMin(clock(endsAt(a)))));
  const first = Math.floor(startMin / 60) * 60, last = Math.ceil(endMin / 60) * 60;
  const yOf = (m: number) => ((m - first) * HOUR) / 60;
  const isToday = day === dayKey();
  const nowM = toMin(clock());
  const loading = appts.loading || rooms.loading || hours.loading;
  const err = appts.error || rooms.error || hours.error;
  const isAdmin = staff?.role === "admin" || staff?.role === "owner";
  /** Working ranges (minutes) of a specialist column on this day: her «أوقات الدوام» clipped to the clinic hours; null = not a specialist column. */
  const workOf = (id: string | null) => {
    if (by !== "specialist" || !id || !h) return null;
    if (!h.days.includes(weekday(day))) return [];
    const cf = toMin(h.from), ct = toMin(h.to);
    const r = rangesOn(staffHours.data ?? [], id, weekday(day)) ?? [{ from: cf, to: ct }];
    return r.map((x) => ({ from: Math.max(cf, x.from), to: Math.min(ct, x.to) })).filter((x) => x.to > x.from).sort((a, b) => a.from - b.from);
  };
  const offBands = (work: { from: number; to: number }[]) => {
    const out: { from: number; to: number }[] = []; let t = first;
    for (const w of work) { if (w.from > t) out.push({ from: t, to: w.from }); t = Math.max(t, w.to); }
    if (t < last) out.push({ from: t, to: last });
    return out;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button type="button" aria-label="السابق" onClick={() => setDay(shiftKey(day, view === "day" ? -1 : -7))} style={navBtn}><Icon name="M9 6l6 6-6 6" size={16} color={C.accent} /></button>
          <div style={{ minWidth: 0, flex: "1 1 auto", textAlign: "center", fontSize: 16, fontWeight: 700 }}>
            {view === "day" ? arDate(dateOfKey(day), { year: true }) : `${arDate(dateOfKey(from), { day: false })} – ${arDate(dateOfKey(to), { day: false })}`}
          </div>
          <button type="button" aria-label="التالي" onClick={() => setDay(shiftKey(day, view === "day" ? 1 : 7))} style={navBtn}><Icon name="M15 6l-6 6 6 6" size={16} color={C.accent} /></button>
        </div>
        {!isToday && <Chip onClick={() => setDay(dayKey())}>اليوم</Chip>}
        <input type="date" aria-label="اختيار يوم" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} dir="ltr"
          style={{ height: 38, borderRadius: 19, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 13 }} />
        <span style={{ marginInlineStart: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Segment label="العرض" value={view} onChange={setView} options={[{ value: "day", label: "يوم" }, { value: "week", label: "أسبوع" }]} />
          {view === "day" && <Segment label="التقسيم" value={by} onChange={setBy} options={[{ value: "room", label: "الغرف" }, { value: "specialist", label: "الأخصائيات" }]} />}
          <Chip selected={showCancelled} onClick={() => setShowCancelled(!showCancelled)}>الملغاة</Chip>
          {isAdmin && <GhostButton icon="clock" onClick={() => setEditHours(true)}>ساعات الدوام</GhostButton>}
        </span>
      </div>

      {h && !h.days.includes(weekday(day)) && view === "day" && (
        <div style={{ borderRadius: 18, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 600 }}>هذا اليوم خارج أيام الدوام المحدّدة — الحجز من التطبيق مغلق فيه.</div>
      )}

      {loading ? <Loading /> : err ? <ErrorNote>{arErr(err, "تعذّر تحميل المواعيد. أعيدي تحميل الصفحة.")}</ErrorNote> : view === "week" ? (
        <WeekGrid from={from} list={list} onOpen={setOpen} onDay={(k) => { setDay(k); setView("day"); }} />
      ) : cols.length === 0 ? (
        <EmptyState icon="cal" title={by === "room" ? "لا غرف بعد" : "لا أخصائيات بعد"} text={by === "room" ? "أضيفي غرف المركز من الإعدادات لتظهر أعمدة التقويم." : "أضيفي فريق العمل لتظهر أعمدة الأخصائيات."}
          action={<Link href={by === "room" ? R.W_Rooms : R.W_Staff} style={{ color: C.accent, fontWeight: 700 }}>فتح الإعدادات</Link>} />
      ) : (
        <div style={{ borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "12px 14px 16px", overflowX: "auto" }}>
          <div style={{ display: "flex", minWidth: 120 + cols.length * 200 }}>
            <div style={{ width: 56, flexShrink: 0 }} />
            {cols.map((c) => {
              const n = list.filter((a) => (by === "room" ? a.room_id : a.specialist_id) === c.id && a.status !== "cancelled").length;
              return (
                <div key={c.id ?? "none"} style={{ flex: 1, minWidth: 190, padding: "0 8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3 }}>{c.name}
                    {(() => { const w = workOf(c.id); return w && <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.sub2 }}>{w.length ? <span className="latin" dir="ltr">{w.map((x) => `${hm(x.from)}–${hm(x.to)}`).join(" · ")}</span> : "لا دوام اليوم"}</span>; })()}
                  </span>
                  <Tag kind="lilac">{apptCount(n)}</Tag>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", position: "relative", minWidth: 120 + cols.length * 200, height: yOf(last) + 4 }}>
            <div style={{ width: 56, flexShrink: 0, position: "relative" }}>
              {Array.from({ length: (last - first) / 60 + 1 }, (_, i) => (
                <span key={i} className="latin" style={{ position: "absolute", top: i * HOUR - 8, right: 6, fontSize: 11.5, color: C.muted }}>{hm(first + i * 60)}</span>
              ))}
            </div>
            {cols.map((c) => (
              <div key={c.id ?? "none"} style={{ flex: 1, minWidth: 190, position: "relative", borderRight: "1px solid #F1E8F3" }}>
                {Array.from({ length: (last - first) / 60 }, (_, i) => (
                  <div key={i} style={{ position: "absolute", top: i * HOUR, left: 0, right: 0, height: HOUR, borderTop: "1px dashed #EFE5F2" }} />
                ))}
                {(() => { const w = workOf(c.id); return w && offBands(w).map((b) => (
                  <div key={b.from} title="خارج دوام الأخصائية" style={{ position: "absolute", top: yOf(b.from), height: yOf(b.to) - yOf(b.from), left: 0, right: 0,
                    background: "repeating-linear-gradient(135deg, #F4F1F5 0 6px, #ECE7EE 6px 12px)", opacity: 0.85 }} />
                )); })()}
                {list.filter((a) => (by === "room" ? a.room_id : a.specialist_id) === c.id).map((a) => {
                  const s = toMin(timeOf(a));
                  const short = a.minutes < 30;
                  return (
                    <button key={a.id} type="button" onClick={() => setOpen(a)} style={{
                      position: "absolute", left: 6, right: 6, top: yOf(s) + 2, height: Math.max(22, (a.minutes * HOUR) / 60 - 4), borderRadius: 14, padding: "5px 10px",
                      overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", gap: 1, textAlign: "right", ...LOOK[a.status],
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, width: "100%" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short ? `${timeOf(a)} · ` : ""}{personName(a)}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{STATUS_LABEL[a.status]}</span>
                      </div>
                      {!short && <div style={{ fontSize: 11.5, opacity: 0.85, whiteSpace: "nowrap" }}><span dir="ltr" style={{ unicodeBidi: "isolate" }}>{timeOf(a)}–{clock(endsAt(a))}</span> · {a.service?.short_name}{by === "room" && a.specialist ? ` · ${a.specialist.name}` : by === "specialist" && a.room ? ` · ${a.room.name}` : ""}</div>}
                    </button>
                  );
                })}
              </div>
            ))}
            {isToday && nowM >= first && nowM <= last && (
              <div aria-hidden style={{ position: "absolute", top: yOf(nowM), left: 0, right: 56, height: 2, background: "#D0679A", boxShadow: "0 0 0 3px rgba(208,103,154,0.15)" }} />
            )}
          </div>
          {list.length === 0 && <div style={{ textAlign: "center", fontSize: 13.5, color: C.sub2, paddingTop: 10 }}>لا مواعيد في هذا اليوم بعد — أضيفي موعداً من «موعد جديد».</div>}
        </div>
      )}

      <AppointmentDialog appt={open} onClose={() => setOpen(null)} />
      {h && <HoursDialog open={editHours} hours={h} onClose={() => setEditHours(false)} />}
    </div>
  );
}

/** Accent "new appointment" button used in page headers. */
export const NEW_BTN = { height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 18px", whiteSpace: "nowrap" } as CSSProperties;

const navBtn: CSSProperties = { width: 38, height: 38, borderRadius: 19, border: "1px solid #EADCF0", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" };

function WeekGrid({ from, list, onOpen, onDay }: { from: string; list: Appointment[]; onOpen: (a: Appointment) => void; onDay: (k: string) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => shiftKey(from, i));
  return (
    <div style={{ overflowX: "auto", margin: "0 -4px", padding: "0 4px 6px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 10, minWidth: 760 }}>
      {days.map((k) => {
        const items = list.filter((a) => dayKey(new Date(a.starts_at)) === k);
        const d = dateOfKey(k);
        const wd = weekday(k);
        return (
          <div key={k} style={{ borderRadius: 22, background: C.white, border: k === dayKey() ? "1.5px solid #C9A2D8" : "1px solid #F0E6F3", boxShadow: SH, padding: "10px 8px", minHeight: 240, display: "flex", flexDirection: "column", gap: 6 }}>
            <button type="button" onClick={() => onDay(k)} title="عرض اليوم" style={{ textAlign: "center", lineHeight: 1.3, marginBottom: 4, border: "none", background: "none", padding: 0, color: C.ink }}>
              <div style={{ fontSize: 12, color: C.sub2 }}>{AR_DAYS[wd]}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{d.getDate()}</div>
            </button>
            {items.length === 0 ? <div style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>—</div> : items.map((a) => (
              <button key={a.id} type="button" onClick={() => onOpen(a)} style={{ borderRadius: 12, padding: "5px 8px", textAlign: "right", ...LOOK[a.status] }}>
                <div className="latin" style={{ fontSize: 11.5, fontWeight: 700 }}>{timeOf(a)}</div>
                <div style={{ fontSize: 11.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{personName(a)}</div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
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
  useEffect(() => { setError(""); }, [appt]);
  if (!appt) return null;
  const a = appt;
  async function go(to: Status) {
    if ((to === "cancelled" || to === "no_show") && !window.confirm(to === "cancelled" ? "إلغاء هذا الموعد؟" : "تسجيل أنها لم تحضر؟")) return;
    setBusy(true); setError("");
    try { await setStatus(a.id, to); onClose(); } catch (e) { setError(bookingError(e)); } finally { setBusy(false); }
  }
  const row = (label: string, value: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.line}`, fontSize: 14 }}>
      <span style={{ color: C.sub2 }}>{label}</span><b>{value}</b>
    </div>
  );
  return (
    <Modal open onClose={onClose} title={personName(a)} width={520}
      footer={<>{(NEXT[a.status] ?? []).filter((n) => (n.to !== "checked_in" || dayKey(new Date(a.starts_at)) === dayKey()) && (n.to !== "no_show" || new Date(a.starts_at).getTime() <= Date.now())).map((n, i) => i === 0 && n.to !== "cancelled" && n.to !== "no_show"
        ? <SubmitButton key={n.to} busy={busy} onClick={() => go(n.to)}>{n.label}</SubmitButton>
        : <GhostButton key={n.to} color={n.to === "cancelled" || n.to === "no_show" ? C.danger : C.accent} onClick={() => !busy && go(n.to)}>{n.label}</GhostButton>)}</>}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
        {a.queue_no != null && <Tag kind="plum">الدور {a.queue_no}</Tag>}
        {a.patient && <span style={{ fontSize: 12.5, color: C.sub2 }}>ملف {a.patient.file_no}{a.patient.phone ? ` · ${a.patient.phone}` : ""}</span>}
        {!a.patient && a.walk_in_phone && <span className="latin" style={{ fontSize: 12.5, color: C.sub2 }}>{a.walk_in_phone}</span>}
      </div>
      <div>
        {row("الجلسة", `${a.service?.name ?? ""} · ${a.minutes} د`)}
        {row("الموعد", `${arDate(new Date(a.starts_at))} · ${timeOf(a)}`)}
        {row("الغرفة", a.room?.name ?? "—")}
        {row("الأخصائية", a.specialist?.name ?? "—")}
        {row("المصدر", a.source === "app" ? "التطبيق" : a.source === "walk_in" ? "حضور مباشر" : a.source === "public" ? "حجز من الرابط" : a.source === "admin" ? "الإدارة" : "الاستقبال")}
        {a.note && row("ملاحظة المراجِعة", a.note)}
        {a.cancel_reason && row("سبب الإلغاء", a.cancel_reason)}
      </div>
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

function HoursDialog({ open, hours, onClose }: { open: boolean; hours: Hours; onClose: () => void }) {
  const [h, setH] = useState(hours);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setH(hours); setError(""); } }, [open, hours]);
  async function save() {
    if (!/^\d{2}:\d{2}$/.test(h.from) || !/^\d{2}:\d{2}$/.test(h.to) || toMin(h.to) <= toMin(h.from)) { setError("تحقّقي من وقت البداية والنهاية."); return; }
    setBusy(true);
    try { await saveHours(h); onClose(); } catch (e) { setError(arErr(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="ساعات الدوام" width={520} footer={<SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>تُستخدم لحساب الأوقات المتاحة للحجز من التطبيق.</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {AR_DAYS.map((n, i) => (
          <Chip key={i} selected={h.days.includes(i)} onClick={() => setH({ ...h, days: h.days.includes(i) ? h.days.filter((x) => x !== i) : [...h.days, i].sort() })}>{n}</Chip>
        ))}
      </div>
      <div className={css.grid3}>
        <TextInput label="من" type="time" dir="ltr" value={h.from} onChange={(v) => setH({ ...h, from: v })} />
        <TextInput label="إلى" type="time" dir="ltr" value={h.to} onChange={(v) => setH({ ...h, to: v })} />
        <TextInput label="الفاصل (دقيقة)" dir="ltr" value={String(h.slot)} onChange={(v) => setH({ ...h, slot: Math.max(5, Number(v.replace(/\D/g, "")) || 15) })} />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
