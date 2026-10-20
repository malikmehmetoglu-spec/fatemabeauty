"use client";

/** «طلبات الحجز» — pending requests from the public booking link: approve → WhatsApp confirmation, or reject → apology. */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton, Tag, TextArea } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useSession } from "@/lib/supabase/session";
import { bookingError, dateOfKey, endsAt, personName, type Appointment } from "@/lib/db/appointments";
import {
  apologyText, approveBooking, canConfirm, confirmText, getCentre, listPending, listRecentConfirmed, markConfirmSent, rejectBooking, type Centre,
} from "@/lib/db/bookingRequests";
import { C, SH } from "@/lib/tokens";
import { arErr } from "../../patients/kit";
import { NEW_BTN } from "../CalendarBoard";
import { WaButton } from "../whatsapp";
import st from "./requests.module.css";

const SOURCE: Record<string, string> = { public: "رابط الحجز", app: "التطبيق", reception: "الاستقبال", admin: "الإدارة", walk_in: "حضور مباشر" };
const REASONS = ["الوقت غير متاح", "الأخصائية غير متاحة", "الخدمة غير متاحة حالياً", "تعذّر التواصل معها"];

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.round(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return arDate(dateOfKey(dayKey(new Date(iso))), { day: false });
};
const phoneOf = (a: Appointment) => a.patient?.phone || a.walk_in_phone || null;
const localPhone = (p: string | null) => { const d = (p ?? "").replace(/\D/g, "").replace(/^(00963|963|0)/, ""); return d.length === 9 ? `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : p ?? "—"; };

export default function BookingRequestsPage() {
  const { staff } = useSession();
  const can = canConfirm(staff);
  const pending = useQuery(["booking-requests", "pending"], listPending);
  const confirmed = useQuery(["booking-requests", "confirmed"], listRecentConfirmed);
  const centre = useQuery(["booking-requests", "centre"], getCentre);
  const [justDone, setJustDone] = useState<Record<string, Appointment>>({});
  const [rejecting, setRejecting] = useState<Appointment | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const c: Centre = centre.data ?? {};

  async function approve(a: Appointment) {
    setBusy(a.id); setErr("");
    try { await approveBooking(a.id); setJustDone((m) => ({ ...m, [a.id]: { ...a, status: "confirmed" } })); }
    catch (e) { setErr(/not allowed/.test(String((e as Error)?.message)) ? "لا تملكين صلاحية تأكيد المواعيد." : /not pending/.test(String((e as Error)?.message)) ? "لم يعد هذا الطلب بانتظار التأكيد — حدّثي الصفحة." : bookingError(e)); }
    setBusy(null);
  }

  const list = pending.data ?? [];
  const recent = [...Object.values(justDone), ...(confirmed.data ?? []).filter((a) => a.source === "public" && !justDone[a.id])];

  return (
    <AdminShell active="المواعيد" title="طلبات الحجز" subtitle="الحجوزات الواردة من رابط الحجز بانتظار تأكيد المركز"
      actions={<Link href={R.W_Calendar} style={NEW_BTN}><Icon name="cal" size={19} color={C.white} stroke={1.9} />التقويم</Link>}>
      <div className={st.wrap}>
        {!can && staff && <div className={st.note}>يمكنكِ الاطلاع على الطلبات فقط — التأكيد والرفض للمالكة والإدارة والاستقبال.</div>}
        {err && <ErrorNote>{err}</ErrorNote>}

        <section>
          <h2 className={st.h}>بانتظار التأكيد {list.length > 0 && <span className={st.count}>{list.length}</span>}</h2>
          {pending.error ? <ErrorNote>{arErr(pending.error, "تعذّر تحميل الطلبات.")}</ErrorNote> : pending.loading ? <Loading /> : !list.length ? (
            <EmptyState icon="calcheck" title="لا طلبات بانتظار التأكيد" text="عندما تحجز مراجِعة من رابط الحجز يظهر طلبها هنا لتأكيده وإرسال رسالة واتساب لها." />
          ) : (
            <div className={st.grid}>
              {list.map((a) => (
                <article key={a.id} className={st.card} style={{ boxShadow: SH }}>
                  <Head a={a} />
                  <Details a={a} />
                  {can && (
                    <div className={st.actions}>
                      <SubmitButton busy={busy === a.id} onClick={() => approve(a)}>تأكيد</SubmitButton>
                      <GhostButton color={C.danger} onClick={() => setRejecting(a)}>رفض / إلغاء</GhostButton>
                      <Link href={`${R.W_Calendar}?day=${dayKey(new Date(a.starts_at))}&open=${a.id}`} className={st.link}>تعديل الموعد</Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {recent.length > 0 && (
          <section>
            <h2 className={st.h}>مؤكدة من رابط الحجز — أرسلي التأكيد</h2>
            <div className={st.grid}>
              {recent.map((a) => (
                <article key={a.id} className={`${st.card} ${justDone[a.id] ? st.fresh : ""}`} style={{ boxShadow: SH }}>
                  <Head a={a} />
                  <Details a={a} />
                  {justDone[a.id] && <div className={st.ok}><Icon name="check" size={17} color="#2F8A57" stroke={2.2} />تم تأكيد الموعد — أرسلي رسالة التأكيد لها الآن.</div>}
                  {can && (
                    <div className={st.actions}>
                      <WaButton phone={phoneOf(a)} text={confirmText(a, c)} onSent={() => markConfirmSent(a.id)}>
                        {a.confirm_sent_at ? "إعادة إرسال التأكيد" : "إرسال التأكيد على واتساب"}
                      </WaButton>
                      <Link href={`${R.W_Calendar}?day=${dayKey(new Date(a.starts_at))}&open=${a.id}`} className={st.link}>فتح في التقويم</Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
      <RejectDialog appt={rejecting} centre={c} onClose={() => setRejecting(null)} />
    </AdminShell>
  );
}

function Head({ a }: { a: Appointment }) {
  return (
    <div className={st.head}>
      <div style={{ minWidth: 0 }}>
        <div className={st.name}>{a.patient ? <Link href={`${R.W_Record}?id=${a.patient.id}`}>{personName(a)}</Link> : personName(a)}</div>
        <div className={`${st.phone} latin`} dir="ltr">{localPhone(phoneOf(a))}</div>
      </div>
      <div className={st.tags}>
        {a.status === "pending" ? <Tag kind="amber">بانتظار التأكيد</Tag> : <Tag kind="green">مؤكد</Tag>}
        {a.confirm_sent_at && <Tag kind="plum">أُرسل التأكيد</Tag>}
      </div>
    </div>
  );
}

function Details({ a }: { a: Appointment }) {
  const row = (k: string, v: React.ReactNode) => <div className={st.row}><span>{k}</span><b>{v}</b></div>;
  return (
    <div>
      {row("الخدمة", a.service?.name ?? "—")}
      {row("الأخصائية", a.specialist?.name ?? "أي أخصائية متاحة")}
      {row("الموعد", <>{arDate(dateOfKey(dayKey(new Date(a.starts_at))))} · <span className="latin" dir="ltr" style={{ unicodeBidi: "isolate" }}>{clock(a.starts_at)}–{clock(endsAt(a))}</span></>)}
      {row("المصدر", <Tag kind={a.source === "public" ? "pink" : "gray"}>{SOURCE[a.source ?? ""] ?? a.source ?? "—"}</Tag>)}
      {a.note && row("ملاحظة", a.note)}
      {row("وصل الطلب", ago(a.created_at))}
    </div>
  );
}

function RejectDialog({ appt, centre, onClose }: { appt: Appointment | null; centre: Centre; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  if (!appt) return null;
  const a = appt;
  const close = () => { setReason(""); setErr(""); setDone(false); onClose(); };
  async function reject() {
    setBusy(true); setErr("");
    try { await rejectBooking(a.id, reason); setDone(true); } catch (e) { setErr(bookingError(e)); }
    setBusy(false);
  }
  return (
    <Modal open onClose={close} title={done ? "تم إلغاء الطلب" : `رفض طلب ${personName(a)}`} width={520}
      footer={done ? <>
        <WaButton phone={phoneOf(a)} text={apologyText(a, reason, centre)}>إرسال رسالة اعتذار</WaButton>
        <GhostButton onClick={close}>إغلاق</GhostButton>
      </> : <>
        <SubmitButton busy={busy} onClick={reject} style={{ background: C.danger }}>رفض الطلب</SubmitButton>
        <GhostButton onClick={close}>تراجع</GhostButton>
      </>}>
      {done ? (
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.sub }}>أُلغي الموعد وتحرّر الوقت. أرسلي لها رسالة اعتذار على واتساب واقترحي موعداً آخر.</p>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 14, color: C.sub }}>{a.service?.name} · {arDate(dateOfKey(dayKey(new Date(a.starts_at))))} · <span className="latin">{clock(a.starts_at)}</span></p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REASONS.map((r) => <button key={r} type="button" className={`${st.reason} ${reason === r ? st.reasonOn : ""}`} onClick={() => setReason(r)}>{r}</button>)}
          </div>
          <TextArea label="سبب الإلغاء (يظهر في رسالة الاعتذار)" value={reason} onChange={setReason} rows={2} />
          {err && <ErrorNote>{err}</ErrorNote>}
        </>
      )}
    </Modal>
  );
}
