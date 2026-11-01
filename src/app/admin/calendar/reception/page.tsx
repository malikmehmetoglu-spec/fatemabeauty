"use client";

/**
 * «الاستقبال والنداء» — reception's call screen (permission: المواعيد).
 * Paid & checked-in clients waiting, grouped by specialist (room when none), with «نداء» / «إعادة النداء»
 * (sets called_at; the TV announces the number). Arrived-but-unpaid clients are listed apart with «الدفع والتذكرة».
 * No start/finish here: specialists start from the room tablet.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { bookingError, callPatient, endsAt, isOpenVisit, listRange, personName, timeOf, useLiveAppointments, type Appointment } from "@/lib/db/appointments";
import { isPaid } from "@/lib/db/levels";
import { arDate, clock, dayKey } from "@/lib/format";
import { C, ICON_FILL, SH } from "@/lib/tokens";
import { ArrivalPanel } from "../ArrivalPanel";
import { AppointmentDialog } from "../CalendarBoard";

const mins = (iso: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0);
const card = { borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH } as const;
const small = { height: 40, padding: "0 14px", fontSize: 13.5 } as const;

export default function ReceptionPage() {
  useLiveAppointments("reception-call");
  const today = dayKey();
  const q = useQuery(["appointments", "day", today], () => listRange(today));
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [pay, setPay] = useState<Appointment | null>(null);
  const [open, setOpen] = useState<Appointment | null>(null);

  const list = q.data ?? [];
  const waiting = list.filter((a) => a.status === "checked_in").sort((x, y) => (x.checked_in_at ?? "").localeCompare(y.checked_in_at ?? ""));
  const ready = waiting.filter((a) => isPaid(a) && !isOpenVisit(a));
  const unpaid = waiting.filter((a) => !isPaid(a) || isOpenVisit(a));
  const expected = list.filter((a) => (a.status === "confirmed" || a.status === "pending") && endsAt(a).getTime() > Date.now() - 60 * 60000);

  // group the ready ones by specialist (room when no specialist)
  const groups = new Map<string, { title: string; sub: string; items: Appointment[] }>();
  for (const a of ready) {
    const key = a.specialist_id ?? `room:${a.room_id ?? "-"}`;
    if (!groups.has(key)) {
      const cur = a.specialist_id ? list.find((x) => x.specialist_id === a.specialist_id && x.status === "in_session") : null;
      groups.set(key, {
        title: a.specialist?.name ?? a.room?.name ?? "بدون أخصائية",
        sub: [a.room?.name, cur ? `في جلسة حتى ${clock(endsAt(cur))}` : a.specialist_id ? "متاحة الآن" : ""].filter(Boolean).join(" · "),
        items: [],
      });
    }
    groups.get(key)!.items.push(a);
  }

  async function call(a: Appointment) {
    setBusy(a.id); setErr("");
    try { await callPatient(a.id); } catch (e) { setErr(bookingError(e)); } finally { setBusy(null); }
  }

  const row = (a: Appointment, actions: ReactNode) => (
    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
      <span className="latin" style={{ width: 50, height: 50, borderRadius: 18, flexShrink: 0, background: a.called_at ? C.accent : ICON_FILL, color: a.called_at ? C.white : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700 }}>{a.queue_no ?? "—"}</span>
      <div style={{ flex: "1 1 200px", minWidth: 0, lineHeight: 1.4 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{personName(a)}</div>
        <div style={{ fontSize: 12.5, color: C.sub2 }}>
          {isOpenVisit(a) ? "جلسة غير محددة" : `${a.service?.short_name ?? ""}${a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""}`} · موعد {timeOf(a)} · تنتظر منذ <span className="latin">{mins(a.checked_in_at)}</span> د
          {a.called_at && <> · نُوديت <span className="latin">{clock(a.called_at)}</span></>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );

  return (
    <AdminShell active="المواعيد" title="الاستقبال والنداء" subtitle={`مباشر · ${arDate(new Date())}`}
      actions={<Link href={R.W_Calendar} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 16px", whiteSpace: "nowrap" }}>
        <Icon name="cal" size={16} color={C.accent} />التقويم</Link>}>
      {err && <ErrorNote>{err}</ErrorNote>}
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{q.error}</ErrorNote> : (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "1.6 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>جاهزات للنداء <span style={{ fontSize: 13, color: C.sub2, fontWeight: 500 }}>· دفعن وسجّلن الوصول</span></div>
            {groups.size === 0 && <EmptyState icon="users" title="لا أحد ينتظر النداء" text="تظهر هنا كل مراجِعة دفعت وسجّلت وصولها، مجمّعة حسب الأخصائية." />}
            {[...groups.entries()].map(([k, g]) => (
              <div key={k} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <b style={{ fontSize: 16 }}>{g.title}</b><span style={{ fontSize: 12.5, color: C.sub2 }}>{g.sub}</span>
                </div>
                {g.items.map((a) => row(a, <GhostButton icon="bell" style={small} onClick={() => busy !== a.id && call(a)}>{a.called_at ? "إعادة النداء" : "نداء"}</GhostButton>))}
              </div>
            ))}
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <b style={{ fontSize: 16 }}>وصلن — بانتظار الجلسة أو الدفع</b>
              {unpaid.length === 0 ? <div style={{ fontSize: 13, color: C.sub2, padding: "8px 0" }}>لا أحد.</div>
                : unpaid.map((a) => row(a, <GhostButton icon="receipt" style={small} onClick={() => setPay(a)}>{isOpenVisit(a) ? "تحديد الجلسة والدفع" : "الدفع والتذكرة"}</GhostButton>))}
            </div>
            <div style={card}>
              <b style={{ fontSize: 16 }}>متوقَّعات اليوم</b>
              {expected.length === 0 ? <div style={{ fontSize: 13, color: C.sub2, padding: "8px 0" }}>لا مواعيد متبقية.</div>
                : expected.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
                    <span className="latin" style={{ fontSize: 13.5, fontWeight: 700, minWidth: 44 }}>{timeOf(a)}</span>
                    <div style={{ flex: "1 1 140px", minWidth: 0, fontSize: 13.5 }}><b>{personName(a)}</b> · {isOpenVisit(a) ? <Tag kind="lilac">جلسة غير محددة</Tag> : a.service?.short_name}</div>
                    <GhostButton icon="check" style={small} onClick={() => setPay(a)}>تسجيل الوصول</GhostButton>
                    <GhostButton style={small} onClick={() => setOpen(a)}>التفاصيل</GhostButton>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      {pay && <ArrivalPanel appt={pay} onClose={() => setPay(null)} />}
      <AppointmentDialog appt={open} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}
