"use client";

/** Review.dc.html — rate a session (stars, liked tags, note). Saved to `reviews`. */
import { useEffect, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { getMyAppointment, getMyLastDone, submitReview } from "@/lib/db/marketing";
import { askLogin } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, SH } from "@/lib/tokens";
import { StaffAvatar, toggleChip } from "../consult/ui";

const WORDS = ["", "لم تعجبني", "مقبولة", "جيدة", "جيدة جداً", "ممتازة"];
const TAGS = ["لطف التعامل", "الالتزام بالموعد", "نتيجة واضحة", "نظافة المكان", "شرح مفيد", "هدوء الصالة"];
const STAR = "M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z";

export default function ReviewPage() {
  const { patient, guest, loading: sLoading } = useRequirePatient();
  const [apptId, setApptId] = useState<string | null | undefined>(undefined);
  useEffect(() => { setApptId(new URLSearchParams(window.location.search).get("appointment")); }, []);
  const { data: appt, loading } = useQuery(["reviews", "appt", apptId, patient?.id],
    () => (apptId ? getMyAppointment(apptId) : getMyLastDone(patient!.id)), { enabled: !!patient && apptId !== undefined });

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!rating) return;
    if (!patient) { askLogin({ text: "سجّلي الدخول لنرسل تقييمكِ إلى فريق المركز." }); return; }
    setBusy(true); setErr(null);
    try { await submitReview({ patient_id: patient.id, appointment_id: appt?.id ?? null, stars: rating, tags, note }); setDone(true); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  if (sLoading || (!patient && !guest) || loading) return <PhoneScreen><TopBar title="قيّمي تجربتكِ" back={R.P_Appointments} /><Loading /></PhoneScreen>;

  if (done) return (
    <PhoneScreen>
      <TopBar title="قيّمي تجربتكِ" back={R.P_Appointments} />
      <EmptyState icon="heart" title="شكراً لكِ" text="وصل تقييمكِ إلى فريق المركز، ويساعدنا على تحسين كل زيارة." action={<PrimaryButton href={R.P_Appointments}>العودة إلى مواعيدي</PrimaryButton>} />
    </PhoneScreen>
  );

  const who = appt?.staff?.name;
  return (
    <PhoneScreen>
      <TopBar title="قيّمي تجربتكِ" back={R.P_Appointments} />

      <div style={{ background: C.white, borderRadius: 30, padding: "22px 18px 18px", position: "relative", textAlign: "center", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {who ? <StaffAvatar name={who} photo={appt?.staff?.photo_url} size={84} style={{ border: "3px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.20)" }} />
          : <span style={{ width: 84, height: 84, borderRadius: 42, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="sparkle" size={34} /></span>}
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{who ? `كيف كانت جلستكِ مع ${who.split(" ")[0]}؟` : "كيف كانت تجربتكِ في المركز؟"}</div>
        {appt && <div style={{ fontSize: 13, color: C.sub2 }}>{appt.services?.name ?? ""} · {arDate(new Date(appt.starts_at))}</div>}
        <div role="radiogroup" aria-label="التقييم" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= rating;
            return (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} نجوم`} onClick={() => setRating(n)} style={{ border: "none", background: "transparent", padding: 2 }}>
                <svg width={34} height={34} viewBox="0 0 24 24" aria-hidden><path d={STAR} fill={on ? "#E9A23B" : "#FFFFFF"} stroke={on ? "#D98F26" : "#DFCFE2"} strokeWidth={1.4} strokeLinejoin="round" /></svg>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.accentMid, marginTop: 4, minHeight: 20 }}>{rating ? WORDS[rating] : "اختاري عدد النجوم"}</div>
      </div>

      <div style={{ position: "relative" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>ما الذي أعجبكِ؟</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TAGS.map((t) => {
            const on = tags.includes(t);
            return <button key={t} type="button" aria-pressed={on} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} style={toggleChip(on)}>{t}</button>;
          })}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <label htmlFor="note" style={{ display: "block", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>أضيفي ملاحظة</label>
        <textarea id="note" value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="شاركينا تجربتكِ بكلمات قليلة" style={{
          width: "100%", height: 92, borderRadius: 22, border: `1px solid ${C.border}`, background: C.white, padding: "12px 14px",
          fontSize: 14, color: C.ink, resize: "none", boxShadow: "0 12px 30px rgba(123,70,135,0.06), 0 2px 6px rgba(123,70,135,0.05)",
        }} />
      </div>

      {err && <ErrorNote>تعذّر إرسال التقييم: {err}</ErrorNote>}
      <div style={{ marginTop: "auto", position: "relative" }}>
        <PrimaryButton onClick={send} disabled={!rating || busy}>{busy ? "جارٍ الإرسال…" : "إرسال التقييم"}</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
