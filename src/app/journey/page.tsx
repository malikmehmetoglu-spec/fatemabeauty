"use client";

/** Journey.dc.html — «رحلتي» root tab: care plan progress, next session, aftercare, skin check-in. */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, DoneDot, EmptyState, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, DARK, SH } from "@/lib/tokens";
import { arDate, clock } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useMe } from "@/lib/db/patients";
import { listPatientPackages, listVisits } from "@/lib/db/clinical";
import { Wait } from "../account/Wait";

const AFTERCARE = [
  { icon: "nomk", text: "تجنبي المكياج 24 ساعة" },
  { icon: "sun", text: "واقي شمس كل صباح" },
  { icon: "drop", text: "ترطيب لطيف مرتين يومياً" },
  { icon: "hand", text: "لا تلمسي البشرة أو تقشريها" },
];
const MOODS = ["ممتازة", "احمرار خفيف", "أحتاج مساعدة"];

function mood(on: boolean): CSSProperties {
  return {
    flex: 1, minWidth: 0, height: 42, borderRadius: 21, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", padding: "0 6px",
    border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
    color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 3px 10px rgba(123,70,135,0.05)",
  };
}

export default function JourneyPage() {
  const [m, setM] = useState(-1);
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: pkgs, loading: lp } = useQuery(["clinical", "packages", id], () => listPatientPackages(id), { enabled: !!id });
  const { data: visits } = useQuery(["clinical", "visits", id], () => listVisits(id), { enabled: !!id });
  const pkg = pkgs?.find((x) => x.sessions_used < x.sessions_total) ?? pkgs?.[0];
  const now = new Date().toISOString();
  const next = [...(visits ?? [])].reverse().find((v) => ["pending", "confirmed", "checked_in"].includes(v.status) && v.starts_at >= now.slice(0, 10));
  const lastDone = (visits ?? []).find((v) => v.status === "done");
  const total = pkg?.sessions_total ?? 0;
  const done = pkg?.sessions_used ?? 0;
  const circ = 2 * Math.PI * 34;
  const pct = total ? (done / total) * 100 : 0;
  return (
    <PhoneScreen tab="رحلتي">
      <TopBar title="رحلة بشرتي" back={R.Main} />
      {!me ? <Wait loading={loading} error={error} /> : lp ? <Wait loading /> : (
        <>
      {pkg ? (
        <>
      <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <DarkGlow />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, color: C.onDark }}>خطة العناية</div>
          <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.35 }}>{pkg.packages?.name ?? "باقتكِ"}</div>
          <div style={{ fontSize: 13, color: C.onDark, marginTop: 4 }}>{total - done > 0 ? `بقي ${total - done} من ${total} جلسات` : "اكتملت الباقة"}</div>
        </div>
        <div style={{ width: 86, height: 86, position: "relative", flexShrink: 0 }}>
          <svg width={86} height={86} viewBox="0 0 86 86" aria-hidden>
            <circle cx={43} cy={43} r={34} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={8} />
            <circle cx={43} cy={43} r={34} fill="none" stroke="#E8D6F0" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${(circ * done) / total} ${circ}`} transform="rotate(-90 43 43)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
            <span className="latin" style={{ fontSize: 22, fontWeight: 700 }}>{done}/{total}</span>
            <span style={{ fontSize: 10, color: C.onDark }}>جلسات</span>
          </div>
        </div>
      </div>

      {total <= 12 && (
      <div style={{ background: C.white, borderRadius: 26, padding: "16px 14px 14px", position: "relative", boxShadow: SH }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", top: 14, left: 18, right: 18, height: 2, background: `linear-gradient(to left, #A877B6 0%, #A877B6 ${pct}%, #EADFEC ${pct}%, #EADFEC 100%)` }} />
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const isDone = n <= done, isNext = n === done + 1;
            return (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                {isDone ? <DoneDot size={30} /> : (
                  <span style={{
                    width: 30, height: 30, borderRadius: 15, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                    ...(isNext ? { border: `2px solid ${C.accentMid}`, boxShadow: "0 0 0 5px rgba(150,100,170,0.15)", fontWeight: 700, color: C.accentMid } : { border: "1px solid #EADFEC", color: C.muted }),
                  }}>{n}</span>
                )}
                {total <= 6 && <span style={{ fontSize: 11, color: isDone ? C.accent : isNext ? C.accentMid : C.muted, whiteSpace: "nowrap" }}>الجلسة {n}</span>}
              </div>
            );
          })}
        </div>
      </div>
      )}
        </>
      ) : (
        <EmptyState compact icon="layers" title="لا توجد خطة عناية بعد" text="عندما تبدئين باقة جلسات تظهر هنا مراحلها وتقدّمكِ." action={<Link href={R.P_Services} style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>تصفّحي الخدمات</Link>} />
      )}

      {next ? (
      <div style={{ background: C.white, borderRadius: 26, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, position: "relative", boxShadow: SH }}>
        {next.staff?.photo_url
          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={next.staff.photo_url} alt={next.staff.name} style={{ width: 50, height: 50, borderRadius: 25, objectFit: "cover", border: "2px solid #FFFFFF", flexShrink: 0 }} />
          : <Circ icon="cal" size={50} iconSize={22} />}
        <div style={{ flexGrow: 1, lineHeight: 1.35, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: C.sub2 }}>الجلسة القادمة · {next.services?.name ?? ""}</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{arDate(new Date(next.starts_at))}، {clock(next.starts_at)}</div>
          {next.staff && <div style={{ fontSize: 12, color: C.sub2 }}>مع {next.staff.name}</div>}
        </div>
        <Link href={`${R.P_AppointmentDetail}?id=${next.id}`} style={{ ...DARK, height: 40, padding: "0 16px", borderRadius: 20, boxShadow: "0 8px 18px rgba(123,70,135,0.30)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>التفاصيل</Link>
      </div>
      ) : (
      <Link href={R.P_Services} style={{ background: C.white, borderRadius: 26, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, position: "relative", boxShadow: SH }}>
        <Circ icon="cal" size={50} iconSize={22} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 12, color: C.sub2 }}>الجلسة القادمة</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>لا موعد محجوز — احجزي جلستكِ</div>
        </div>
        <Icon name="fwd" color={C.muted} size={18} />
      </Link>
      )}

      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        <Link href={R.P_BeforeAfter} style={{ flex: 1, background: C.white, borderRadius: 20, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: SH, fontSize: 13, fontWeight: 600, color: C.accent }}><Icon name="image" size={17} color={C.accentMid} />صوري قبل/بعد</Link>
        <Link href={R.Routine} style={{ flex: 1, background: C.white, borderRadius: 20, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: SH, fontSize: 13, fontWeight: 600, color: C.accent }}><Icon name="bottle" size={17} color={C.accentMid} />روتيني</Link>
      </div>

      {lastDone && <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>عناية ما بعد الجلسة</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          {AFTERCARE.map((a) => (
            <div key={a.text} style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 18, padding: "9px 10px", boxShadow: "0 12px 30px rgba(123,70,135,0.06), 0 2px 6px rgba(123,70,135,0.05)" }}>
              <Circ icon={a.icon} size={34} iconSize={16} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.accent, lineHeight: 1.35 }}>{a.text}</span>
            </div>
          ))}
        </div>
      </div>}

      {lastDone && <div style={{ marginTop: 4, position: "relative", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", borderRadius: 26, padding: "14px 16px", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>كيف تشعر بشرتكِ اليوم؟</div>
        <div style={{ display: "flex", gap: 8 }}>
          {MOODS.map((l, i) => <button key={l} type="button" aria-pressed={m === i} onClick={() => setM(i)} style={mood(m === i)}>{l}</button>)}
        </div>
      </div>}
        </>
      )}
    </PhoneScreen>
  );
}
