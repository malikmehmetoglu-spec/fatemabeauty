"use client";

/** P_ConsultBook.dc.html — book an online consultation (day, time). Days and times follow the consultant's «أوقات الدوام» (rpc booking_weekdays / app_slots). */
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, ErrorNote, Icon, Loading, PrimaryButton, SectionTitle } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS } from "@/lib/data";
import { atDamascus, dayKey, dayName, money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { bookConsult, getConsultService, getHours } from "@/lib/db/consult";
import { appSlots, bookingWeekdays } from "@/lib/db/appointments";
import { GuestCard } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD, SOFT_PANEL } from "@/lib/tokens";

const sel = (on: boolean): CSSProperties => ({
  border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`,
  background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
  color: on ? C.accent : C.sub2,
  boxShadow: on ? "0 10px 22px rgba(150,100,170,0.30)" : "0 4px 12px rgba(123,70,135,0.06)",
});
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export default function ConsultBookPage() {
  const { patient, guest, loading: sLoading } = useRequirePatient();
  const { data: svc, loading: l1 } = useQuery(["consult", "service"], getConsultService);
  const { data: hours, loading: l2 } = useQuery(["consult", "hours"], getHours);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { data: wdays } = useQuery(["consult", "weekdays", svc?.key], () => bookingWeekdays(svc!.key, null), { enabled: !!svc });
  const days = useMemo(() => {
    if (!hours || !wdays) return [];
    const out: Date[] = [];
    for (let i = 0; out.length < 6 && i < 21; i++) {
      const d = new Date(Date.now() + i * 864e5);
      const k = dayKey(d);
      const wd = new Date(`${k}T12:00:00+03:00`).getUTCDay();
      if (wdays.includes(wd)) out.push(new Date(`${k}T12:00:00+03:00`));
    }
    return out;
  }, [hours, wdays]);

  // free times from the server: the consultant's working hours, overlaps; every max(minutes, 30) min, at least 1 h ahead
  const dk = days[day] ? dayKey(days[day]) : null;
  const { data: free } = useQuery(["consult", "slots", svc?.key, dk], () => appSlots(dk!, svc!.key, null), { enabled: !!svc && !!dk });
  const times = useMemo(() => {
    if (!svc || !dk || !free) return [];
    const step = Math.max(svc.minutes, 30);
    return free.filter((t) => toMin(t) % step === 0 && new Date(atDamascus(dk, t)).getTime() > Date.now() + 60 * 6e4);
  }, [svc, dk, free]);

  const book = async () => {
    if (!svc || !slot || !days[day]) return;
    setBusy(true); setErr(null);
    try { await bookConsult(svc.key, atDamascus(dayKey(days[day]), slot)); setDone(true); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  if (guest) return <PhoneScreen><TopBar title="حجز استشارة أونلاين" back={R.Consult} /><GuestCard icon="cam" what="حجوزات استشاراتكِ" /></PhoneScreen>;
  if (sLoading || !patient || l1 || l2) return <PhoneScreen><TopBar title="حجز استشارة أونلاين" back={R.Consult} /><Loading /></PhoneScreen>;
  if (!svc) return (
    <PhoneScreen>
      <TopBar title="حجز استشارة أونلاين" back={R.Consult} />
      <EmptyState icon="cam" title="الاستشارة الأونلاين غير متاحة حالياً" text="لم يُضف المركز خدمة الاستشارة عن بُعد بعد. يمكنكِ حجز استشارة في المركز."
        action={<PrimaryButton href={R.Booking}>حجز موعد في المركز</PrimaryButton>} />
    </PhoneScreen>
  );
  if (done) return (
    <PhoneScreen>
      <TopBar title="حجز استشارة أونلاين" back={R.Consult} />
      <EmptyState icon="calcheck" title="تم حجز الاستشارة" text="سيؤكد المركز الموعد ويتواصل معكِ لترتيب المكالمة." action={<PrimaryButton href={R.Consult}>عرض استشاراتي</PrimaryButton>} />
    </PhoneScreen>
  );

  const d = days[day];
  return (
    <PhoneScreen>
      <TopBar title="حجز استشارة أونلاين" back={R.Consult} />

      <div style={{ ...SOFT_PANEL, display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" }}>
        <Circ icon="cam" size={46} iconSize={20} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{svc.name}</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>من بيتكِ · نحو {svc.minutes} دقيقة{svc.price > 0 ? ` · ${money(svc.price)}` : ""}</div>
        </div>
      </div>

      <SectionTitle right={d ? <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{AR_MONTHS[d.getMonth()]} {d.getFullYear()}</span> : undefined}>اختاري اليوم</SectionTitle>
      <div style={{ display: "flex", gap: 8 }}>
        {days.map((x, i) => (
          <button key={i} type="button" aria-pressed={day === i} onClick={() => { setDay(i); setSlot(null); }} style={{
            ...sel(day === i), flex: 1, minWidth: 0, height: 62, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{x.getDate()}</span>
            <span style={{ fontSize: 11 }}>{dayName(x)}</span>
          </button>
        ))}
      </div>

      <SectionTitle>اختاري الوقت</SectionTitle>
      {times.length === 0 ? <EmptyState compact icon="clock" title="لا أوقات متاحة في هذا اليوم" /> : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {times.map((t) => (
            <button key={t} type="button" aria-pressed={slot === t} onClick={() => setSlot(t)} className="latin" style={{
              ...sel(slot === t), flex: "1 0 64px", height: 40, borderRadius: 20, fontSize: 13.5, fontWeight: 600, padding: 0,
            }}>{t}</button>
          ))}
        </div>
      )}

      <Link href={R.P_SkinType} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "10px 14px", color: C.ink }}>
        <Circ icon="clip" size={38} iconSize={17} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>استبيان قصير عن بشرتكِ</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يساعد الأخصائية على التحضير لاستشارتكِ</div>
        </div>
        <Icon name="chev" color={C.accentMid} size={18} stroke={2} />
      </Link>

      {err && <ErrorNote>تعذّر الحجز: {err}</ErrorNote>}
      <PrimaryButton onClick={book} disabled={!slot || busy} style={{ marginTop: "auto" }}>
        {busy ? "جارٍ الحجز…" : slot && d ? `تأكيد · ${dayName(d)} ${d.getDate()} · ${slot}` : "اختاري الوقت"}
      </PrimaryButton>
    </PhoneScreen>
  );
}
