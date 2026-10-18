"use client";

/** Booking.dc.html — book a session: service, specialist, day and a real free time (live, Supabase). */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { busyRanges, freeSlots, getHours, openDays, useSearch } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { AR_MONTHS, initials } from "@/lib/data";
import { dayName } from "@/lib/format";
import { C, CARD, GLASS } from "@/lib/tokens";

const glassBtn: CSSProperties = { ...GLASS, width: 46, height: 46, borderRadius: 23, boxShadow: "0 6px 18px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" };
const PANEL: CSSProperties = { background: "linear-gradient(180deg, #FBF5FC 0%, #F6ECF8 100%)", border: "1px solid #FFFFFF", boxShadow: "inset 0 1px 0 #FFFFFF, 0 10px 26px rgba(123,70,135,0.06)", borderRadius: 28, padding: "16px 16px 18px" };
const pill = (on: boolean): CSSProperties => ({
  flexShrink: 0, height: 40, padding: "0 16px", borderRadius: 20, fontSize: 13.5, fontWeight: on ? 700 : 600, whiteSpace: "nowrap",
  border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.white,
  color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 4px 12px rgba(123,70,135,0.06)",
});
const dateOf = (k: string) => new Date(`${k}T12:00:00+03:00`);

export default function BookingPage() {
  const s = useRequirePatient();
  const q = useSearch();
  const services = useQuery(["catalog", "services"], listServices);
  const team = useQuery(["catalog", "specialists"], listSpecialists);
  const hours = useQuery(["appointments", "hours"], getHours);

  const bookable = useMemo(() => (services.data ?? []).filter((x) => x.bookable_online), [services.data]);
  const [svcKey, setSvcKey] = useState<string | null>(null);
  const [sp, setSp] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => { if (q && !svcKey) setSvcKey(q.get("service")); }, [q, svcKey]);
  const svc = bookable.find((x) => x.key === svcKey) ?? bookable[0] ?? null;
  const days = useMemo(() => (hours.data ? openDays(hours.data, 7) : []), [hours.data]);
  const curDay = day ?? days[0] ?? null;
  const specialist = (team.data ?? []).find((t) => t.id === sp) ?? null;

  const busy = useQuery(["appointments", "busy", days[0], days[days.length - 1]], () => busyRanges(days[0], days[days.length - 1]), { enabled: days.length > 0 && !!s.patient });
  const slots = useMemo(() => (svc && curDay && hours.data && busy.data ? freeSlots(hours.data, curDay, svc.minutes, busy.data, svc.room_id, sp) : []),
    [svc, curDay, hours.data, busy.data, sp]);
  useEffect(() => { setTime(null); }, [svcKey, sp, day]);

  if (s.loading || !s.patient) return <PhoneScreen><Loading /></PhoneScreen>;
  const loading = services.loading || hours.loading || team.loading;
  const error = services.error || hours.error || team.error || busy.error;
  const replace = q?.get("replace") ?? "";
  const next = svc && curDay && time ? `${R.P_Confirm}?service=${svc.key}&day=${curDay}&time=${time}${sp ? `&sp=${sp}` : ""}${replace ? `&replace=${replace}` : ""}` : undefined;

  return (
    <PhoneScreen padding="0" gap={0} background={C.white} blobs={false}>
      <div style={{ height: 300, background: "linear-gradient(160deg,#F2E5F5,#E2C8EA)", position: "relative", flexShrink: 0, overflow: "hidden" }}>
        {specialist?.photo_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={specialist.photo_url} alt={specialist.name} style={{ position: "absolute", inset: 0, width: "100%", height: 300, objectFit: "cover", objectPosition: "20% 25%" }} />
          : <div aria-hidden style={{ position: "absolute", left: 30, top: 90, width: 150, height: 150, borderRadius: 75, background: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 700, color: C.accentMid }}>
              {specialist ? initials(specialist.name) : <Icon name="sparkle" size={56} color={C.accentMid} stroke={1.4} />}
            </div>}
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, right: 0, width: 260, maxWidth: "70%", height: 300, background: "linear-gradient(to left, rgba(242,229,245,0.95) 0%, rgba(242,229,245,0.85) 55%, rgba(242,229,245,0) 100%)" }} />
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 54px)", left: 22, right: 22, display: "flex", justifyContent: "space-between" }}>
          <Link href={replace ? `${R.P_AppointmentDetail}?id=${replace}` : R.Main} aria-label="رجوع" style={glassBtn}><Icon name="back" color={C.accent} size={18} stroke={2} /></Link>
        </div>
        <div style={{ position: "absolute", top: 120, right: 24, width: "min(250px, 64%)" }}>
          <h1 style={{ margin: "10px 0 0", fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: C.ink }}>{specialist ? specialist.name : replace ? "تغيير الموعد" : "احجزي جلستكِ"}</h1>
          <div style={{ fontSize: 13, color: C.navText, marginTop: 4 }}>{specialist ? specialist.title : replace ? "يُلغى موعدكِ الحالي بعد تأكيد الجديد" : "اختاري الخدمة واليوم والوقت المناسب"}</div>
          {svc && (
            <div style={{ ...GLASS, display: "inline-block", marginTop: 12, boxShadow: "0 4px 12px rgba(123,70,135,0.10)", borderRadius: 14, padding: "4px 12px", fontSize: 13, fontWeight: 600, color: C.accent, whiteSpace: "nowrap" }}>
              {svc.short_name} · {priceLabel(svc)}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px calc(env(safe-area-inset-bottom, 0px) + 22px)", display: "flex", flexDirection: "column", gap: 14, flexGrow: 1, marginTop: -10, position: "relative" }}>
        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المواعيد: {error}</ErrorNote> : bookable.length === 0 ? (
          <EmptyState icon="cal" title="لا خدمات متاحة للحجز بعد" text="عند إضافة المركز لخدماته ستظهر هنا وتستطيعين الحجز مباشرة." />
        ) : (
          <>
            <div>
              <div style={{ fontSize: 13, color: C.sub2, marginBottom: 8 }}>الخدمة</div>
              <div role="radiogroup" aria-label="الخدمة" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {bookable.map((x) => (
                  <button key={x.key} type="button" role="radio" aria-checked={svc?.key === x.key} onClick={() => setSvcKey(x.key)} style={pill(svc?.key === x.key)}>
                    {x.short_name} · <span className="latin">{x.minutes}</span> د
                  </button>
                ))}
              </div>
            </div>

            {!!team.data?.length && (
              <div>
                <div style={{ fontSize: 13, color: C.sub2, marginBottom: 8 }}>الأخصائية</div>
                <div role="radiogroup" aria-label="الأخصائية" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                  <button type="button" role="radio" aria-checked={!sp} onClick={() => setSp(null)} style={pill(!sp)}>أي أخصائية متاحة</button>
                  {team.data.map((t) => (
                    <button key={t.id} type="button" role="radio" aria-checked={sp === t.id} onClick={() => setSp(t.id)} style={pill(sp === t.id)}>{t.name}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ ...PANEL, display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>اختاري اليوم</div>
                {curDay && <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{AR_MONTHS[dateOf(curDay).getMonth()]}</div>}
              </div>
              {days.length === 0 ? <div style={{ fontSize: 13.5, color: C.sub }}>لم تُحدَّد أيام الدوام بعد.</div> : (
                <div role="radiogroup" aria-label="اليوم" style={{ display: "flex", gap: 6 }}>
                  {days.map((k) => {
                    const on = curDay === k; const d = dateOf(k);
                    return (
                      <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setDay(k)} style={{
                        flex: 1, minWidth: 0, height: 62, borderRadius: 18, border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`,
                        background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.white, color: on ? C.accent : C.sub2,
                        boxShadow: on ? "0 10px 22px rgba(150,100,170,0.30)" : "0 4px 12px rgba(123,70,135,0.06)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>{d.getDate()}</div>
                        <div style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>{dayName(d)}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ fontSize: 13, color: C.sub2, margin: "16px 0 8px" }}>اختاري الوقت</div>
              {busy.loading ? <Loading label="نبحث عن الأوقات المتاحة…" style={{ padding: 12 }} /> : slots.length === 0 ? (
                <div style={{ ...CARD, borderRadius: 20, padding: "14px 16px", fontSize: 13.5, color: C.sub, lineHeight: 1.7 }}>
                  لا أوقات متاحة في هذا اليوم.{" "}
                  {svc && curDay && <Link href={`${R.P_Waitlist}?service=${svc.key}&day=${curDay}${sp ? `&sp=${sp}` : ""}`} style={{ color: C.accent, fontWeight: 700 }}>انضمي لقائمة الانتظار</Link>}
                </div>
              ) : (
                <div role="radiogroup" aria-label="الوقت" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8 }}>
                  {slots.map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={time === t} onClick={() => setTime(t)} className="latin"
                      style={{ ...pill(time === t), padding: 0, height: 40, fontSize: 14 }}>{t}</button>
                  ))}
                </div>
              )}
              <PrimaryButton href={next} disabled={!next} style={{ marginTop: 18, ...(next ? {} : { opacity: 0.55, pointerEvents: "none" }) }}>{replace ? "متابعة لتغيير الموعد" : "احجزي الجلسة"}</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </PhoneScreen>
  );
}
