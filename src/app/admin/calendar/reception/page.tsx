"use client";
import { BirthDateSelect, GenderPick, isoBirth } from "../../patients/basicInfo";

/**
 * «شاشة الاستقبال» — Lubna's landing page (permission: المواعيد).
 * Today's appointments as cards in five lanes by state:
 *   قادمات → بانتظار الدفع/التحديد → بانتظار النداء → في الجلسة → انتهت (collapsed).
 * Actions: تسجيل الوصول (ArrivalPanel: assign → pay → print), تذكير SMS (staff-sms, logged in sms_log),
 * نداء / إعادة النداء (called_at → TV voice), إعادة الطباعة, لم تحضر, حضور بدون موعد (open visit now).
 * No start/finish here: specialists start from the room tablet. On phone/tablet the lanes become tabs.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { invalidate, useQuery } from "@/lib/db/query";
import {
  book, bookingError, callPatient, createPatient, endsAt, getAppointment, isOpenVisit, listRange, OPEN_VISIT, OPEN_VISIT_ROOM,
  personName, searchPatients, setStatus, timeOf, useLiveAppointments, type Appointment,
} from "@/lib/db/appointments";
import { sendSms } from "@/lib/db/bookingRequests";
import { getInvoice, type InvoiceRow } from "@/lib/db/finance";
import { isPaid } from "@/lib/db/levels";
import { arDate, clock, dayKey, dayRange } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";
import { C, ICON_FILL, SELECTED, SH } from "@/lib/tokens";
import { loadTicket, TicketSheet, type TicketData } from "@/components/ticket/QueueTicket";
import { ReceiptSheet } from "../../finance/InvoicePrint";
import { ArrivalPanel } from "../ArrivalPanel";
import { AppointmentDialog } from "../CalendarBoard";
import { isVip, VipStar } from "../vip";

type Lane = "coming" | "pay" | "call" | "session" | "done";
const LANES: { k: Lane; t: string; icon: string; empty: string }[] = [
  { k: "coming", t: "قادمات", icon: "clock", empty: "لا مواعيد قادمة اليوم." },
  { k: "pay", t: "بانتظار الدفع/التحديد", icon: "receipt", empty: "لا أحد بانتظار الدفع." },
  { k: "call", t: "بانتظار النداء", icon: "bell", empty: "لا أحد ينتظر النداء." },
  { k: "session", t: "في الجلسة", icon: "sparkle", empty: "لا جلسات جارية الآن." },
  { k: "done", t: "انتهت", icon: "check", empty: "لم تنتهِ أي جلسة بعد." },
];
const LATE_MIN = 10;
const AMBER = { bg: "#FFF7EA", bd: "#F1D3A0", fg: "#8A5A12" };
const REMINDER = "فاطمة بيوتي: نذكّركِ";
const reminderText = (a: Appointment) => `${REMINDER} بموعدكِ اليوم الساعة ${timeOf(a)}. نرجو الحضور قبل 10 دقائق. بانتظاركِ.`;

const laneOf = (a: Appointment): Lane | null => {
  if (a.status === "pending" || a.status === "confirmed") return "coming";
  if (a.status === "checked_in") return isPaid(a) && !isOpenVisit(a) ? "call" : "pay";
  if (a.status === "in_session") return "session";
  if (a.status === "done") return "done";
  return null; // cancelled / no-show
};
const phoneOf = (a: Appointment) => a.patient?.phone || a.walk_in_phone || "";
const showPhone = (p: string) => p.replace(/^\+963/, "0");
const minsSince = (iso: string | null, now: number) => (iso ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000)) : 0);

function useNow(ms: number) {
  const [n, setN] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return n;
}
function useWide(px: number) {
  const [w, setW] = useState(true);
  useEffect(() => {
    const m = window.matchMedia(`(min-width: ${px}px)`);
    const f = () => setW(m.matches); f();
    m.addEventListener("change", f); return () => m.removeEventListener("change", f);
  }, [px]);
  return w;
}

/** Today's reminder SMS per appointment (latest successful one). */
async function todayReminders(): Promise<Record<string, string>> {
  const r = dayRange(dayKey());
  const { data } = await supabase.from("sms_log").select("appointment_id, created_at, body, status")
    .gte("created_at", r.from).lt("created_at", r.to).in("status", ["sent", "dry_run"]).like("body", `${REMINDER}%`).order("created_at");
  const out: Record<string, string> = {};
  for (const x of data ?? []) if (x.appointment_id) out[x.appointment_id] = x.created_at;
  return out;
}

export default function ReceptionPage() {
  useLiveAppointments("reception-screen");
  useEffect(() => { const t = setInterval(() => { invalidate("appointments"); invalidate("reception"); }, 15000); return () => clearInterval(t); }, []);
  const today = dayKey();
  const q = useQuery(["appointments", "day", today], () => listRange(today));
  const sms = useQuery(["reception", "sms", today], todayReminders);
  const now = useNow(15000);
  const wide = useWide(1240);
  const [tab, setTab] = useState<Lane>("coming");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [arrive, setArrive] = useState<Appointment | null>(null);
  const [details, setDetails] = useState<Appointment | null>(null);
  const [reprint, setReprint] = useState<Appointment | null>(null);
  const [walkIn, setWalkIn] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const lanes = useMemo(() => {
    const s = search.trim().toLowerCase(), d = s.replace(/\D/g, "").replace(/^(963|0)/, "");
    const hit = (a: Appointment) => !s || personName(a).toLowerCase().includes(s) || (d.length >= 3 && phoneOf(a).replace(/\D/g, "").includes(d));
    const m: Record<Lane, Appointment[]> = { coming: [], pay: [], call: [], session: [], done: [] };
    for (const a of q.data ?? []) { const l = laneOf(a); if (l && hit(a)) m[l].push(a); }
    const by = (f: (a: Appointment) => string | null) => (x: Appointment, y: Appointment) => (f(x) ?? "").localeCompare(f(y) ?? "");
    m.coming.sort(by((a) => a.starts_at));
    m.pay.sort(by((a) => a.checked_in_at));
    m.call.sort(by((a) => a.checked_in_at));
    m.session.sort(by((a) => a.started_at));
    m.done.sort((x, y) => (y.finished_at ?? "").localeCompare(x.finished_at ?? ""));
    return m;
  }, [q.data, search]);

  async function run(id: string, f: () => Promise<unknown>, ok?: string) {
    setBusy(id); setErr(""); setNote("");
    try { await f(); if (ok) setNote(ok); } catch (e) { setErr(e instanceof Error ? e.message : bookingError(e)); } finally { setBusy(null); }
  }
  const remind = (a: Appointment) => {
    const at = sms.data?.[a.id];
    if (at && !confirm(`أُرسل تذكير لـ${personName(a)} اليوم الساعة ${clock(at)}. إرسال تذكير آخر؟`)) return;
    if (!at && !confirm(`إرسال تذكير SMS إلى ${personName(a)}؟\n\n«${reminderText(a)}»`)) return;
    run(a.id, async () => { await sendSms(a.id, "reminder", reminderText(a)); invalidate("reception"); }, `أُرسل التذكير إلى ${personName(a)}.`);
  };
  const noShow = (a: Appointment) => {
    if (!confirm(`تسجيل «لم تحضر» لموعد ${personName(a)} الساعة ${timeOf(a)}؟`)) return;
    run(a.id, () => setStatus(a.id, "no_show"));
  };
  const call = (a: Appointment) => run(a.id, () => callPatient(a.id), `نُودي الرقم ${a.queue_no ?? ""} — ${personName(a)}.`);

  const card = (a: Appointment, lane: Lane) => (
    <ApptCard key={a.id} a={a} lane={lane} now={now} busy={busy === a.id} smsAt={sms.data?.[a.id] ?? null}
      onArrive={() => setArrive(a)} onRemind={() => remind(a)} onCall={() => call(a)} onReprint={() => setReprint(a)}
      onNoShow={() => noShow(a)} onDetails={() => setDetails(a)} />
  );
  const laneBody = (l: Lane) => {
    const items = lanes[l];
    const meta = LANES.find((x) => x.k === l)!;
    if (!items.length) return <EmptyState compact icon={meta.icon} title={search ? "لا نتائج" : meta.empty} text="" />;
    return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{items.map((a) => card(a, l))}</div>;
  };

  return (
    <AdminShell active="الاستقبال" title="شاشة الاستقبال" subtitle={`مباشر · ${arDate(new Date())}`}
      actions={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setWalkIn(true)} style={{ ...pill, ...SELECTED }}><Icon name="plus" size={17} color={C.accent} />حضور بدون موعد</button>
          <Link href={R.W_BookingModal} style={{ ...pill, background: C.accent, color: C.white, border: "none" }}><Icon name="cal" size={17} color="#FFFFFF" />حجز موعد</Link>
        </div>
      }>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 8, height: 50, padding: "0 16px", borderRadius: 25, background: C.white, border: `1px solid ${C.border}`, boxShadow: SH }}>
          <Icon name="search" size={18} color={C.sub2} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحثي بالاسم أو رقم الهاتف"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, color: C.ink }} />
          {search && <button type="button" aria-label="مسح" onClick={() => setSearch("")} style={{ border: "none", background: "transparent", display: "flex" }}><Icon name="x" size={16} color={C.sub2} /></button>}
        </div>
        <div className="noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "100%" }}>
          {LANES.map((l) => {
            const on = !wide && tab === l.k;
            return (
              <button key={l.k} type="button" onClick={() => { setTab(l.k); if (l.k === "done") setShowDone(true); }}
                style={{ height: 50, padding: "0 14px", borderRadius: 25, display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", color: on ? C.accent : C.navText, ...(on ? SELECTED : { background: C.white, border: `1px solid ${C.border}` }) }}>
                {l.t}<span className="latin" style={{ minWidth: 26, height: 26, borderRadius: 13, padding: "0 7px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: l.k === "coming" && lanes.coming.some((a) => late(a, now)) ? AMBER.bd : ICON_FILL, color: C.accent, fontSize: 13 }}>{lanes[l.k].length}</span>
              </button>
            );
          })}
        </div>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      {note && <div style={{ borderRadius: 18, padding: "10px 16px", background: "#EAF6EF", color: C.okDeep, fontWeight: 700, fontSize: 14 }}>{note}</div>}
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{q.error}</ErrorNote> : wide ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, alignItems: "start" }}>
            {LANES.filter((l) => l.k !== "done").map((l) => (
              <section key={l.k} style={{ borderRadius: 28, padding: 12, background: C.tint2, border: `1px solid ${C.borderSoft}`, minWidth: 0 }}>
                <LaneHead t={l.t} icon={l.icon} n={lanes[l.k].length} />
                {laneBody(l.k)}
              </section>
            ))}
          </div>
          <section style={{ borderRadius: 28, padding: 12, background: C.tint2, border: `1px solid ${C.borderSoft}` }}>
            <button type="button" onClick={() => setShowDone((v) => !v)} style={{ width: "100%", border: "none", background: "transparent", fontFamily: "inherit", padding: 0, textAlign: "right" }}>
              <LaneHead t="انتهت" icon="check" n={lanes.done.length} right={<Icon name={showDone ? "up" : "down"} size={18} color={C.sub2} />} />
            </button>
            {showDone && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>{lanes.done.map((a) => card(a, "done"))}</div>}
          </section>
        </>
      ) : (
        <section className="rec-tabs">{laneBody(tab)}<style>{".rec-tabs > div { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)); align-items: start; }"}</style></section>
      )}
      {arrive && <ArrivalPanel appt={arrive} onClose={() => { setArrive(null); invalidate("appointments"); }} />}
      <AppointmentDialog appt={details} onClose={() => setDetails(null)} />
      {reprint && <ReprintDialog a={reprint} onClose={() => setReprint(null)} />}
      {walkIn && <WalkInDialog onClose={() => setWalkIn(false)} onBooked={(a) => { setWalkIn(false); setArrive(a); }} />}
    </AdminShell>
  );
}

const pill: CSSProperties = { height: 48, borderRadius: 24, padding: "0 18px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", color: C.accent, whiteSpace: "nowrap" };
const late = (a: Appointment, now: number) => laneOf(a) === "coming" && now - new Date(a.starts_at).getTime() > LATE_MIN * 60000;

function LaneHead({ t, icon, n, right }: { t: string; icon: string; n: number; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 12px" }}>
      <span style={{ width: 34, height: 34, borderRadius: 17, background: ICON_FILL, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={17} color={C.accent} /></span>
      <b style={{ fontSize: 15.5, flex: 1 }}>{t}</b>
      <span className="latin" style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{n}</span>
      {right}
    </div>
  );
}

function Timer({ from }: { from: string | null }) {
  const now = useNow(1000);
  const s = from ? Math.max(0, Math.floor((now - new Date(from).getTime()) / 1000)) : 0;
  return <span className="latin" dir="ltr">{String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</span>;
}

const btn = (primary: boolean): CSSProperties => ({
  height: 48, padding: "0 16px", borderRadius: 24, fontFamily: "inherit", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, whiteSpace: "nowrap",
  ...(primary ? { background: C.accent, color: C.white, border: "none", flex: "1 1 100%" } : { background: C.white, color: C.accent, border: `1px solid ${C.border}`, flex: "1 1 0", minWidth: 0, padding: "0 10px", fontSize: 13.5 }),
});
function Btn({ icon, children, primary = false, onClick, busy, danger }: { icon: string; children: ReactNode; primary?: boolean; onClick: () => void; busy?: boolean; danger?: boolean }) {
  return (
    <button type="button" disabled={busy} onClick={onClick} style={{ ...btn(primary), opacity: busy ? 0.6 : 1, ...(danger ? { color: C.danger } : null) }}>
      <Icon name={icon} size={17} color={primary ? "#FFFFFF" : danger ? C.danger : C.accent} />{children}
    </button>
  );
}

function ApptCard({ a, lane, now, busy, smsAt, onArrive, onRemind, onCall, onReprint, onNoShow, onDetails }: {
  a: Appointment; lane: Lane; now: number; busy: boolean; smsAt: string | null;
  onArrive: () => void; onRemind: () => void; onCall: () => void; onReprint: () => void; onNoShow: () => void; onDetails: () => void;
}) {
  const isLate = late(a, now);
  const phone = phoneOf(a);
  const svc = isOpenVisit(a) ? "جلسة غير محددة" : `${a.service?.short_name ?? a.service?.name ?? ""}${a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""}`;
  const vip = isVip(a);
  const big = lane === "call" || lane === "session" || lane === "pay";
  return (
    <article style={{ borderRadius: 24, padding: 14, background: isLate ? AMBER.bg : C.white, border: `1px solid ${isLate ? AMBER.bd : C.borderSoft}`, boxShadow: SH, display: "flex", flexDirection: "column", gap: 10, opacity: lane === "done" ? 0.85 : 1 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {big && a.queue_no != null ? (
          <span className="latin" style={{ width: 58, height: 58, borderRadius: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, ...(lane === "call" && !a.called_at ? { background: C.accent, color: C.white } : { background: ICON_FILL, color: C.accent }) }}>{a.queue_no}</span>
        ) : (
          <span className="latin" style={{ minWidth: 58, height: 40, borderRadius: 14, padding: "0 8px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, background: isLate ? AMBER.bd : ICON_FILL, color: isLate ? AMBER.fg : C.accent }}>{timeOf(a)}</span>
        )}
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.45 }}>
          <button type="button" onClick={onDetails} style={{ border: "none", background: "transparent", padding: 0, fontFamily: "inherit", fontSize: 16, fontWeight: 800, color: C.ink, textAlign: "right", display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{personName(a)}</span>{vip && <VipStar size={14} />}
          </button>
          <div style={{ fontSize: 13, color: isOpenVisit(a) ? C.accent : C.sub, fontWeight: isOpenVisit(a) ? 700 : 500 }}>{svc}</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>
            {a.specialist?.name ?? "بدون أخصائية"}{big ? <> · موعد <span className="latin">{timeOf(a)}</span></> : null}
          </div>
          {phone && <a href={`tel:${phone}`} className="latin" dir="ltr" style={{ fontSize: 12.5, color: C.sub2 }}>{showPhone(phone)}</a>}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {isLate && <Badge c={AMBER.fg} bg="#FBE7C4">متأخرة <span className="latin">{minsSince(a.starts_at, now)}</span> د</Badge>}
        {a.status === "pending" && <Badge c={AMBER.fg} bg="#FBE7C4">غير مؤكد</Badge>}
        {a.note && <Badge c={C.accent} bg={C.tint} title={a.note}>ملاحظة: {a.note.length > 26 ? a.note.slice(0, 26) + "…" : a.note}</Badge>}
        {lane === "coming" && smsAt && <Badge c={C.okDeep} bg="#E3F3EA">ذُكّرت <span className="latin">{clock(smsAt)}</span></Badge>}
        {(lane === "pay" || lane === "call") && <Badge c={C.sub} bg={C.tint2}>تنتظر <span className="latin">{minsSince(a.checked_in_at, now)}</span> د</Badge>}
        {lane === "call" && a.called_at && <Badge c={C.accent} bg={C.tint}>نُوديت <span className="latin">{clock(a.called_at)}</span></Badge>}
        {lane === "pay" && <Badge c={AMBER.fg} bg="#FBE7C4">{isOpenVisit(a) ? "حدّدي الجلسة" : "غير مدفوعة"}</Badge>}
        {lane === "session" && <Badge c="#9C2F5C" bg="#F8E3EB"><Icon name="clock" size={13} color="#9C2F5C" />منذ <Timer from={a.started_at} /> · تنتهي <span className="latin">{clock(endsAt(a))}</span></Badge>}
        {lane === "done" && a.finished_at && <Badge c={C.okDeep} bg="#E3F3EA">انتهت <span className="latin">{clock(a.finished_at)}</span></Badge>}
      </div>
      {lane !== "done" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {lane === "coming" && <>
            <Btn primary icon="check" busy={busy} onClick={onArrive}>تسجيل الوصول</Btn>
            <Btn icon="send" busy={busy} onClick={onRemind}>{smsAt ? "تذكير مجدداً" : "تذكير SMS"}</Btn>
            <Btn icon="calx" busy={busy} danger onClick={onNoShow}>لم تحضر</Btn>
          </>}
          {lane === "pay" && <Btn primary icon="receipt" busy={busy} onClick={onArrive}>{isOpenVisit(a) ? "تحديد الجلسة والدفع" : "الدفع والتذكرة"}</Btn>}
          {lane === "call" && <>
            <Btn primary icon="bell" busy={busy} onClick={onCall}>{a.called_at ? "إعادة النداء" : "نداء"}</Btn>
            <Btn icon="print" busy={busy} onClick={onReprint}>طباعة مجدداً</Btn>
          </>}
          {lane === "session" && <Btn icon="print" busy={busy} onClick={onReprint}>طباعة مجدداً</Btn>}
        </div>
      )}
    </article>
  );
}

function Badge({ children, c, bg, title }: { children: ReactNode; c: string; bg: string; title?: string }) {
  return <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 26, padding: "0 10px", borderRadius: 13, background: bg, color: c, fontSize: 12, fontWeight: 700, maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap" }}>{children}</span>;
}

/* ---------- reprint invoice + ticket ---------- */

function ReprintDialog({ a, onClose }: { a: Appointment; onClose: () => void }) {
  const { staff } = useSession();
  const invId = (a.invoices ?? []).find((i) => i.paid && !i.void)?.id ?? null;
  const t = useQuery(["queue", "ticket", a.id, "reprint"], () => loadTicket(a.id));
  const inv = useQuery(["finance", "invoice", invId ?? "-"], () => getInvoice(invId as string), { enabled: !!invId });
  const [job, setJob] = useState<{ inv: InvoiceRow | null; t: TicketData | null } | null>(null);
  const print = (j: { inv: InvoiceRow | null; t: TicketData | null }) => { flushSync(() => setJob(j)); window.print(); setJob(null); };
  return (
    <Modal open onClose={onClose} title={`إعادة الطباعة — ${personName(a)}`} width={520}>
      {t.loading ? <Loading /> : t.error ? <ErrorNote>{t.error}</ErrorNote> : t.data && <TicketSheet t={t.data} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {inv.data && <SubmitButton onClick={() => print({ inv: inv.data ?? null, t: t.data ?? null })}><Icon name="print" color="#FFFFFF" size={18} />الفاتورة والتذكرة</SubmitButton>}
        <GhostButton icon="print" onClick={() => print({ inv: null, t: t.data ?? null })}>التذكرة فقط</GhostButton>
        {inv.data && <GhostButton icon="receipt" onClick={() => print({ inv: inv.data ?? null, t: null })}>الفاتورة فقط</GhostButton>}
      </div>
      {job && typeof document !== "undefined" && createPortal(
        <div data-print-receipt="">
          <style>{"@media print { @page { size: 80mm auto; margin: 0; } }"}</style>
          {job.inv && <ReceiptSheet inv={job.inv} extras={{ staff: staff?.name }} />}
          {job.t && <div style={job.inv ? { breakBefore: "page", pageBreakBefore: "always" } : undefined}><TicketSheet t={job.t} print /></div>}
        </div>, document.body)}
    </Modal>
  );
}

/* ---------- walk-in without appointment ---------- */

function WalkInDialog({ onClose, onBooked }: { onClose: () => void; onBooked: (a: Appointment) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    const digits = phone.replace(/[\s-]/g, "");
    if (!name.trim()) { setErr("اكتبي اسم المراجِعة."); return; }
    if (!/^(\+?963|0)?9\d{8}$/.test(digits)) { setErr("رقم الهاتف إلزامي: اكتبي رقماً صحيحاً يبدأ بـ 09."); return; }
    setBusy(true); setErr("");
    try {
      const core = digits.replace(/\D/g, "").replace(/^(963|0)/, "");
      const found = (await searchPatients(core)).find((p) => (p.phone ?? "").replace(/\D/g, "").endsWith(core));
      const pid = found?.id ?? (await createPatient(name, phone, { gender, birth_date: isoBirth(dob) || null }))?.id ?? null;
      const row = await book({ service: OPEN_VISIT, day: dayKey(), time: clock(), specialist: null, room: OPEN_VISIT_ROOM, patient: pid, source: "walk_in", level: null });
      const id = (Array.isArray(row) ? row[0] : row as { id?: string } | null)?.id;
      const a = id ? await getAppointment(id) : null;
      if (!a) throw new Error("تمّ الحجز، افتحيه من بطاقته في «قادمات».");
      onBooked(a);
    } catch (e) { setErr(bookingError(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} title="حضور بدون موعد" width={480}
      footer={<SubmitButton busy={busy} onClick={save}>متابعة لتسجيل الوصول</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>تُفتح زيارة الآن، ثم تحدّدين الجلسة والأخصائية وتدفع المراجِعة وتُطبع التذكرة.</div>
      <TextInput label="اسم المراجِعة" value={name} onChange={setName} required />
      <TextInput label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="09xxxxxxxx" dir="ltr" type="tel" required />
      <GenderPick value={gender} onChange={setGender} />
      <BirthDateSelect value={dob} onChange={setDob} label="تاريخ الميلاد (اختياري)" />
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
