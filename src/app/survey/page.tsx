"use client";

/** P_Survey48.dc.html — 48-hour follow-up survey after the session. Saved to `surveys`. */
import { useEffect, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { getMyAppointment, getMyLastDone, submitSurvey } from "@/lib/db/marketing";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD, SH_SOFT } from "@/lib/tokens";
import { StaffAvatar, toggleChip } from "../consult/ui";

const QS: [string, string, string[]][] = [
  ["redness", "هل لاحظتِ احمراراً؟", ["لا يوجد", "خفيف", "واضح"]],
  ["itch", "هل تشعرين بحكة أو حرقة؟", ["لا", "أحياناً", "باستمرار"]],
  ["dryness", "هل بشرتكِ جافة أو تتقشر؟", ["لا", "قليلاً", "كثيراً"]],
  ["satisfaction", "ما مدى رضاكِ عن النتيجة؟", ["راضية جداً", "راضية", "غير راضية"]],
];

export default function Survey48Page() {
  const { patient, loading: sLoading } = useRequirePatient();
  const [apptId, setApptId] = useState<string | null | undefined>(undefined);
  useEffect(() => { setApptId(new URLSearchParams(window.location.search).get("appointment")); }, []);
  const { data: appt, loading } = useQuery(["survey", "appt", apptId, patient?.id],
    () => (apptId ? getMyAppointment(apptId) : getMyLastDone(patient!.id)), { enabled: !!patient && apptId !== undefined });

  const [a, setA] = useState<(number | null)[]>([null, null, null, null]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!patient) return;
    setBusy(true); setErr(null);
    try {
      const answers: Record<string, string> = {};
      QS.forEach(([k, , opts], i) => { if (a[i] != null) answers[k] = opts[a[i] as number]; });
      await submitSurvey({ patient_id: patient.id, appointment_id: appt?.id ?? null, answers, note });
      setDone(true);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  if (sLoading || !patient || loading) return <PhoneScreen><TopBar title="كيف بشرتكِ اليوم؟" back={R.Journey} /><Loading /></PhoneScreen>;
  if (done) return (
    <PhoneScreen>
      <TopBar title="كيف بشرتكِ اليوم؟" back={R.Journey} />
      <EmptyState icon="check" title="وصلت إجاباتكِ" text="ستطّلع عليها الأخصائية، وإذا احتاج الأمر ستتواصل معكِ." action={<PrimaryButton href={R.Journey}>العودة</PrimaryButton>} />
    </PhoneScreen>
  );

  return (
    <PhoneScreen>
      <TopBar title="كيف بشرتكِ اليوم؟" back={R.Journey} />

      <div style={{ borderRadius: 26, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 12 }}>
        {appt?.staff ? <StaffAvatar name={appt.staff.name} photo={appt.staff.photo_url} size={48} /> : <Icon name="sparkle" size={28} />}
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>متابعة بعد الجلسة</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>{appt ? `${appt.services?.name ?? ""} · ${arDate(new Date(appt.starts_at))}` : "أخبرينا كيف تشعر بشرتكِ"}</div>
        </div>
      </div>

      <div style={{ ...CARD, borderRadius: 28, padding: "6px 16px 8px" }}>
        {QS.map(([k, title, opts], qi) => (
          <div key={k} role="radiogroup" aria-label={title} style={{ padding: "12px 0", borderTop: qi ? `1px solid ${C.line}` : undefined }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, marginBottom: 9 }}>{title}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {opts.map((label, oi) => {
                const on = a[qi] === oi;
                return (
                  <button key={label} type="button" role="radio" aria-checked={on} onClick={() => setA(a.map((v, i) => (i === qi ? oi : v)))}
                    style={toggleChip(on, { flex: 1, minWidth: 0, padding: "0 6px" })}>{label}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="sv-note" style={{ display: "block", fontSize: 13, color: C.sub2, marginBottom: 6 }}>ملاحظة للأخصائية (اختياري)</label>
        <textarea id="sv-note" rows={2} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="اكتبي أي شيء لاحظتِه على بشرتكِ…" style={{
          width: "100%", height: 64, resize: "none", borderRadius: 20, border: "1px solid #EADCF0", background: C.white,
          boxShadow: "inset 0 2px 6px rgba(123,70,135,0.05)", padding: "12px 16px", fontSize: 13.5, color: C.ink, outline: "none",
        }} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0 4px" }}>
        <Icon name="info" size={18} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>إذا ظهر أي أثر غير متوقع ستتواصل معكِ الأخصائية</div>
      </div>

      {err && <ErrorNote>تعذّر الإرسال: {err}</ErrorNote>}
      <div style={{ marginTop: "auto" }}>
        <PrimaryButton icon="send" onClick={send} disabled={busy || a.every((x) => x == null)}>{busy ? "جارٍ الإرسال…" : "إرسال"}</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
