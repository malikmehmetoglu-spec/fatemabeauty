"use client";

/** Journey.dc.html — «رحلتي» root tab: care plan progress, next session, aftercare, skin check-in. */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, DoneDot, FatemaAvatar } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, DARK, SH } from "@/lib/tokens";
import { NEXT_SESSION_NO, PKG_SERVICE, PKG_TOTAL } from "@/lib/mock/b";
import { AR_DAYS, AR_MONTHS, PERSONA } from "@/lib/data";

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
  const [m, setM] = useState(0);
  const done = PERSONA.sessionsDone;
  const circ = 2 * Math.PI * 34; // 213.6
  const pct = (done / PKG_TOTAL) * 100;
  const next = PERSONA.nextSession;
  return (
    <PhoneScreen tab="رحلتي">
      <TopBar title="رحلة بشرتي" back={R.Main} />

      <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <DarkGlow />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 13, color: C.onDark }}>خطة العناية</div>
          <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.35 }}>{PKG_SERVICE.name}</div>
          <div style={{ fontSize: 13, color: C.onDark, marginTop: 4 }}>جلسة كل 4 أسابيع · مع {PERSONA.specialist}</div>
        </div>
        <div style={{ width: 86, height: 86, position: "relative", flexShrink: 0 }}>
          <svg width={86} height={86} viewBox="0 0 86 86" aria-hidden>
            <circle cx={43} cy={43} r={34} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={8} />
            <circle cx={43} cy={43} r={34} fill="none" stroke="#E8D6F0" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${(circ * done) / PKG_TOTAL} ${circ}`} transform="rotate(-90 43 43)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{done}/{PKG_TOTAL}</span>
            <span style={{ fontSize: 10, color: C.onDark }}>جلسات</span>
          </div>
        </div>
      </div>

      <div style={{ background: C.white, borderRadius: 26, padding: "16px 14px 14px", position: "relative", boxShadow: SH }}>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", top: 14, left: 18, right: 18, height: 2, background: `linear-gradient(to left, #A877B6 0%, #A877B6 ${pct}%, #EADFEC ${pct}%, #EADFEC 100%)` }} />
          {Array.from({ length: PKG_TOTAL }, (_, i) => {
            const n = i + 1;
            const isDone = n <= done, isNext = n === NEXT_SESSION_NO;
            return (
              <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                {isDone ? <DoneDot size={30} /> : (
                  <span style={{
                    width: 30, height: 30, borderRadius: 15, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                    ...(isNext ? { border: `2px solid ${C.accentMid}`, boxShadow: "0 0 0 5px rgba(150,100,170,0.15)", fontWeight: 700, color: C.accentMid } : { border: "1px solid #EADFEC", color: C.muted }),
                  }}>{n}</span>
                )}
                <span style={{ fontSize: 11, color: isDone ? C.accent : isNext ? C.accentMid : C.muted, whiteSpace: "nowrap" }}>الجلسة {n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: C.white, borderRadius: 26, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, position: "relative", boxShadow: SH }}>
        <FatemaAvatar size={50} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 12, color: C.sub2 }}>الجلسة القادمة · {AR_DAYS[next.getDay()]}</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{next.getDate()} {AR_MONTHS[next.getMonth()]}، {PERSONA.nextTime}</div>
        </div>
        <Link href={R.P_AppointmentDetail} style={{ ...DARK, height: 40, padding: "0 16px", borderRadius: 20, boxShadow: "0 8px 18px rgba(123,70,135,0.30)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>تأكيد</Link>
      </div>

      <div style={{ position: "relative" }}>
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
      </div>

      <div style={{ marginTop: 4, position: "relative", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", borderRadius: 26, padding: "14px 16px", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 10 }}>كيف تشعر بشرتكِ اليوم؟</div>
        <div style={{ display: "flex", gap: 8 }}>
          {MOODS.map((l, i) => <button key={l} type="button" aria-pressed={m === i} onClick={() => setM(i)} style={mood(m === i)}>{l}</button>)}
        </div>
      </div>

    </PhoneScreen>
  );
}
