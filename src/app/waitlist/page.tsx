"use client";

/** P_Waitlist.dc.html — join the waitlist for a full day (live, Supabase). */
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listServices } from "@/lib/db/catalog";
import { dateOfKey, getHours, joinWaitlist, myWaitlist, openDays, setWaitStatus, useSearch } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { arDate, dayName } from "@/lib/format";
import { C, CARD, DARK, SELECTED } from "@/lib/tokens";

type Part = "any" | "morning" | "evening";
const WINDOWS: { k: Part; icon: string; t: string; r: string }[] = [
  { k: "morning", icon: "sun", t: "صباحاً", r: "قبل 2 ظهراً" },
  { k: "evening", icon: "moon", t: "مساءً", r: "بعد 2 ظهراً" },
  { k: "any", icon: "clock", t: "أي وقت", r: "طوال الدوام" },
];
const OFF: CSSProperties = { background: C.white, border: "1px solid #EEE4F1", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", color: C.sub2 };
const PART_LABEL: Record<string, string> = { any: "أي وقت", morning: "صباحاً", evening: "مساءً" };

export default function WaitlistPage() {
  const s = useRequirePatient();
  const q = useSearch();
  const services = useQuery(["catalog", "services"], listServices);
  const hours = useQuery(["appointments", "hours"], getHours);
  const mine = useQuery(["waitlist", "mine", s.patient?.id], () => myWaitlist(s.patient!.id), { enabled: !!s.patient });
  const [part, setPart] = useState<Part>("any");
  const [day, setDay] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { if (q && day === null) setDay(q.get("day") || ""); }, [q, day]);
  if (s.loading || !s.patient || !q) return <PhoneScreen><Loading /></PhoneScreen>;
  const svc = (services.data ?? []).find((x) => x.key === q.get("service")) ?? null;
  const near = hours.data ? openDays(hours.data, 6) : [];
  const spId = q.get("sp");

  async function join() {
    setBusy(true); setError("");
    try {
      await joinWaitlist({ patient_id: s.patient!.id, service_key: svc?.key ?? null, specialist_id: spId, preferred_day: day || null, part });
      setDone(true);
    } catch (e) { setError("تعذّر الانضمام: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(false); }
  }

  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="قائمة الانتظار" back={svc ? `${R.Booking}?service=${svc.key}` : R.Booking} />

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative", lineHeight: 1.4 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 600 }}>
            <Icon name="calx" color="#FFFFFF" size={14} />{day ? "اليوم ممتلئ" : "أول موعد يفرغ"}
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, marginTop: 8 }}>{day ? arDate(dateOfKey(day)) : "أي يوم قريب"}</div>
          <div style={{ fontSize: 13, color: C.onDark }}>{svc ? `${svc.name} · ${svc.minutes} دقيقة` : "أي جلسة"}</div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 22, padding: "12px 14px", background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
        <Circ icon="bell" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.55 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>سنتواصل معكِ إذا فرغ موعد</div>
          <div style={{ fontSize: 12.5, color: C.sub }}>يرى فريق الاستقبال طلبكِ ويعرض عليكِ أول موعد يناسبكِ.</div>
        </div>
      </div>

      {done ? (
        <div style={{ ...CARD, borderRadius: 24, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Circ icon="check" size={40} iconSize={18} />
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>انضممتِ لقائمة الانتظار</div>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>الوقت المناسب لكِ</h2>
            <div role="radiogroup" aria-label="الوقت المناسب" style={{ display: "flex", gap: 8 }}>
              {WINDOWS.map((w) => {
                const on = part === w.k;
                return (
                  <button key={w.k} type="button" role="radio" aria-checked={on} onClick={() => setPart(w.k)} style={{
                    flex: 1, minWidth: 0, height: 92, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                    ...(on ? SELECTED : OFF),
                  }}>
                    <Icon name={w.icon} color={on ? C.accent : C.accentMid} size={20} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{w.t}</span>
                    <span style={{ fontSize: 11.5, opacity: 0.8 }}>{w.r}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {near.length > 0 && (
            <div style={{ position: "relative" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>اليوم المفضّل</h2>
              <div role="radiogroup" aria-label="اليوم المفضل" style={{ display: "flex", gap: 6 }}>
                {[...near.slice(0, 5), ""].map((k) => {
                  const on = (day ?? "") === k;
                  return (
                    <button key={k || "any"} type="button" role="radio" aria-checked={on} onClick={() => setDay(k)} style={{
                      flex: 1, minWidth: 0, height: 66, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      ...(on ? SELECTED : OFF),
                    }}>
                      {k ? <><span style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>{dateOfKey(k).getDate()}</span><span style={{ fontSize: 10.5 }}>{dayName(dateOfKey(k))}</span></>
                        : <span style={{ fontSize: 12.5, fontWeight: 700 }}>أي يوم</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!!mine.data?.length && (
        <div style={{ ...CARD, borderRadius: 24, padding: "6px 16px" }}>
          {mine.data.map((w, i) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{w.service?.name ?? "أي جلسة"}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{w.preferred_day ? arDate(dateOfKey(w.preferred_day)) : "أي يوم"} · {PART_LABEL[w.part]}</div>
              </div>
              <button type="button" onClick={() => setWaitStatus(w.id, "closed")} style={{ border: "none", background: "none", color: C.danger, fontSize: 13, fontWeight: 700 }}>مغادرة</button>
            </div>
          ))}
        </div>
      )}

      <Link href={svc ? `${R.Booking}?service=${svc.key}` : R.Booking} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 40, fontSize: 13.5, color: C.sub, flexWrap: "wrap" }}>
        أو اختاري موعداً متاحاً في يوم آخر
        <span style={{ fontWeight: 700, color: C.accentMid, display: "inline-flex", alignItems: "center", gap: 2 }}>من التقويم<Icon name="fwd" color={C.accentMid} size={15} stroke={2} /></span>
      </Link>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        {done ? <PrimaryButton href={R.P_Appointments}>مواعيدي</PrimaryButton>
          : <PrimaryButton icon="bell" onClick={join} disabled={busy}>{busy ? "جارٍ الحفظ…" : "انضمي لقائمة الانتظار"}</PrimaryButton>}
        <div style={{ textAlign: "center", fontSize: 12, color: C.sub2 }}>يمكنكِ مغادرة القائمة في أي وقت من هذه الصفحة</div>
      </div>
    </PhoneScreen>
  );
}
