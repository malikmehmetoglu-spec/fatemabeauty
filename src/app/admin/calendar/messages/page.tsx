"use client";

/**
 * «رسائل المواعيد» — two work queues for customer service:
 *  1) رسالة تأكيد الحجز: confirmed upcoming visits with no confirmation sent on any channel yet
 *  2) التذكير بالموعد: upcoming visits with no reminder sent yet (asks her to confirm attendance)
 * Sending on any channel (WhatsApp / SMS / app) stamps appointments.confirm_channels.<kind> and the visit leaves the queue.
 */
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Chip, EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useSession } from "@/lib/supabase/session";
import { dateOfKey, endsAt, personName, type Appointment } from "@/lib/db/appointments";
import {
  canConfirm, confirmText, getCentre, listUpcomingForMessages, reminderText, sentChannels, smsConfirmText, smsReminderText, type ConfirmKind,
} from "@/lib/db/bookingRequests";
import { showPhone } from "@/lib/phone";
import { C, SH } from "@/lib/tokens";
import { arErr } from "../../patients/kit";
import { NEW_BTN } from "../CalendarBoard";
import { SendChannels } from "../channels";
import st from "../requests/requests.module.css";
import { useState } from "react";

const SOURCE: Record<string, string> = { public: "رابط الحجز", app: "التطبيق", reception: "الاستقبال", admin: "الإدارة" };
const phoneOf = (a: Appointment) => a.patient?.phone || a.walk_in_phone || null;
const unsent = (a: Appointment, k: ConfirmKind) => Object.keys(sentChannels(a, k)).length === 0;

export default function AppointmentMessagesPage() {
  const { staff } = useSession();
  const can = canConfirm(staff);
  const q = useQuery(["booking-requests", "messages"], listUpcomingForMessages);
  const centre = useQuery(["booking-requests", "centre"], getCentre);
  const [tab, setTab] = useState<ConfirmKind>("confirm");
  const all = q.data ?? [];
  const confirmQ = all.filter((a) => a.status === "confirmed" && unsent(a, "confirm"));
  const reminderQ = all.filter((a) => unsent(a, "reminder"));
  const list = tab === "confirm" ? confirmQ : reminderQ;

  return (
    <AdminShell active="المواعيد" title="رسائل المواعيد" subtitle="المواعيد التي لم تُرسل لها رسالة التأكيد أو التذكير بعد — تخرج من القائمة فور الإرسال"
      actions={<Link href={R.W_Calendar} style={NEW_BTN}><Icon name="cal" size={19} color={C.white} stroke={1.9} />التقويم</Link>}>
      <div className={st.wrap}>
        {!can && staff && <div className={st.note}>يمكنكِ الاطلاع فقط — الإرسال للمالكة والإدارة والاستقبال.</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip selected={tab === "confirm"} onClick={() => setTab("confirm")}>1 · رسالة تأكيد الحجز · {confirmQ.length}</Chip>
          <Chip selected={tab === "reminder"} onClick={() => setTab("reminder")}>2 · التذكير بالموعد · {reminderQ.length}</Chip>
        </div>
        {q.error ? <ErrorNote>{arErr(q.error, "تعذّر تحميل المواعيد.")}</ErrorNote> : q.loading ? <Loading /> : !list.length ? (
          <EmptyState icon="calcheck" title={tab === "confirm" ? "كل المواعيد المؤكدة أُرسل لها التأكيد" : "كل المواعيد القادمة أُرسل لها التذكير"}
            text="عند حجز موعد جديد يظهر هنا حتى تُرسل له الرسالة." />
        ) : (
          <div className={st.grid}>
            {list.map((a) => (
              <article key={a.id} className={st.card} style={{ boxShadow: SH }}>
                <div className={st.head}>
                  <div style={{ minWidth: 0 }}>
                    <div className={st.name}>{a.patient ? <Link href={`${R.W_Record}?id=${a.patient.id}`}>{personName(a)}</Link> : personName(a)}</div>
                    <div className={`${st.phone} latin`} dir="ltr">{showPhone(phoneOf(a))}</div>
                  </div>
                  <div className={st.tags}>
                    {a.status === "pending" ? <Tag kind="amber">بانتظار التأكيد</Tag> : <Tag kind="green">مؤكد</Tag>}
                    {tab === "reminder" && !unsent(a, "confirm") && <Tag kind="plum">أُرسل التأكيد</Tag>}
                  </div>
                </div>
                <div>
                  <div className={st.row}><span>الخدمة</span><b>{a.service?.name ?? "—"}</b></div>
                  <div className={st.row}><span>الأخصائية</span><b>{a.specialist?.name ?? "—"}</b></div>
                  <div className={st.row}><span>الموعد</span><b>{arDate(dateOfKey(dayKey(new Date(a.starts_at))))} · <span className="latin" dir="ltr" style={{ unicodeBidi: "isolate" }}>{clock(a.starts_at)}–{clock(endsAt(a))}</span></b></div>
                  <div className={st.row}><span>المصدر</span><b><Tag kind={a.source === "public" ? "pink" : "gray"}>{SOURCE[a.source ?? ""] ?? a.source ?? "—"}</Tag></b></div>
                </div>
                {can && (tab === "confirm"
                  ? <SendChannels appt={a} kind="confirm" phone={phoneOf(a)} waText={confirmText(a, centre.data ?? {})} smsText={smsConfirmText(a)} label="إرسال التأكيد عبر" />
                  : <SendChannels appt={a} kind="reminder" phone={phoneOf(a)} waText={reminderText(a, centre.data ?? {})} smsText={smsReminderText(a)} label="إرسال التذكير عبر" />)}
                <div className={st.actions}>
                  <Link href={`${R.W_Calendar}?day=${dayKey(new Date(a.starts_at))}&open=${a.id}`} className={st.link}>فتح في التقويم</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
