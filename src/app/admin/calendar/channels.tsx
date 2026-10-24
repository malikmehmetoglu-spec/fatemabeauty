"use client";

/**
 * Three ways to send the booking confirmation (or the apology after a rejection): WhatsApp (wa.me on staff's phone),
 * SMS (Edge Function «staff-sms» through the clinic's gateway phone) and the app (notification + message in her chat).
 * Used by «طلبات الحجز» and the calendar appointment dialog. Sent channels show as badges with the time.
 */
import { useState } from "react";
import { clock } from "@/lib/format";
import type { Appointment } from "@/lib/db/appointments";
import { Icon } from "@/components/ui";
import {
  markWhatsApp, sendInApp, sendSms, sentChannels, waLink, type Channel, type ConfirmKind,
} from "@/lib/db/bookingRequests";
import { WaIcon } from "./whatsapp";
import st from "./channels.module.css";

const SMS_ICON = "M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1zM8 11h.01M12 11h.01M16 11h.01";
const APP_ICON = "M7 4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM11 18h2M10 8.5l1.5 1.5 3-3";
const NAME: Record<Channel, string> = { whatsapp: "واتساب", sms: "SMS", app: "التطبيق" };

export function SendChannels({ appt, kind, phone, waText, smsText, label }: {
  appt: Appointment; kind: ConfirmKind; phone: string | null; waText: string; smsText: string; label?: string;
}) {
  const [local, setLocal] = useState<Partial<Record<Channel, string>>>({});
  const [busy, setBusy] = useState<Channel | null>(null);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const sent = { ...sentChannels(appt, kind), ...local };
  const stamp = (c: Channel) => setLocal((m) => ({ ...m, [c]: new Date().toISOString() }));
  const wa = waLink(phone, waText);
  const hasPatient = !!appt.patient_id;

  async function sms() {
    if (!phone || busy) return;
    setBusy("sms"); setErr(""); setNote("");
    try { await sendSms(appt.id, kind, smsText); stamp("sms"); setNote("أُرسلت رسالة SMS — تصل خلال لحظات من هاتف المركز."); }
    catch (e) { setErr((e as Error).message); }
    setBusy(null);
  }
  async function app() {
    if (!hasPatient || busy) return;
    setBusy("app"); setErr(""); setNote("");
    try {
      const r = await sendInApp(appt.id, kind, waText); stamp("app");
      setNote(r.hasApp ? "وصلها إشعار ورسالة في محادثتها مع المركز." : "لم تثبّت التطبيق بعد — سترى الرسالة عند الدخول برقم هاتفها.");
    } catch (e) { setErr((e as Error).message); }
    setBusy(null);
  }

  const done = (Object.keys(NAME) as Channel[]).filter((c) => sent[c]);
  return (
    <div className={st.box}>
      {label && <div className={st.label}>{label}</div>}
      <div className={st.row}>
        {wa ? (
          <a className={`${st.btn} ${st.wa}`} href={wa} target="_blank" rel="noopener noreferrer"
            onClick={() => { stamp("whatsapp"); markWhatsApp(appt.id, kind); }}>
            <WaIcon color="#fff" /><span>واتساب</span>
          </a>
        ) : (
          <span className={`${st.btn} ${st.wa} ${st.off}`} title="لا يوجد رقم هاتف لهذه المراجِعة"><WaIcon color="#A595AA" /><span>واتساب</span></span>
        )}
        <button type="button" className={`${st.btn} ${st.sms} ${!phone ? st.off : ""} ${busy === "sms" ? st.busy : ""}`} disabled={!phone || !!busy}
          title={phone ? "إرسال رسالة نصية قصيرة من هاتف المركز" : "لا يوجد رقم هاتف لهذه المراجِعة"} onClick={sms}>
          <Icon name={SMS_ICON} size={18} color={phone ? "#7B4687" : "#A595AA"} stroke={1.8} /><span>{busy === "sms" ? "جارٍ…" : <bdi className={st.latin}>SMS</bdi>}</span>
        </button>
        <button type="button" className={`${st.btn} ${st.app} ${!hasPatient ? st.off : ""} ${busy === "app" ? st.busy : ""}`} disabled={!hasPatient || !!busy}
          title={hasPatient ? "إشعار ورسالة في محادثتها داخل التطبيق" : "لا يوجد ملف مراجِعة مرتبط بالموعد"} onClick={app}>
          <Icon name={APP_ICON} size={18} color={hasPatient ? "#fff" : "#A595AA"} stroke={1.8} /><span>{busy === "app" ? "جارٍ…" : "التطبيق"}</span>
        </button>
      </div>
      {done.length > 0 && (
        <div className={st.badges} aria-label="القنوات التي أُرسل عبرها">
          {done.map((c) => (
            <span key={c} className={st.badge}>
              <Icon name="check" size={14} color="#2F8A57" stroke={2.4} />
              {c === "sms" ? <bdi className={st.latin}>SMS</bdi> : NAME[c]}
              <time dir="ltr">{clock(sent[c]!)}</time>
            </span>
          ))}
        </div>
      )}
      {note && <div className={st.note}>{note}</div>}
      {err && <div className={st.err}>{err}</div>}
    </div>
  );
}
