"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS, SERVICE, TODAY } from "@/lib/data";
import { addDays, dayName, money } from "@/lib/format";
import { C, CARD, FATEMA_PHOTO, GLASS, SHB } from "@/lib/tokens";

/** Booking.dc.html — book a session with فاطمة طيبة (day + time). */
const HEART = "M19.5 12.6L12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6";
const DAYS = [-2, -1, 0, 1].map((n) => addDays(TODAY, n));
const TIMES = ["10:00", "10:30", "11:00", "11:30"];

const glassBtn: CSSProperties = { ...GLASS, width: 46, height: 46, borderRadius: 23, boxShadow: "0 6px 18px rgba(0,0,0,0.10)", display: "flex", alignItems: "center", justifyContent: "center" };
const roundBtn: CSSProperties = { width: 56, height: 56, borderRadius: 28, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

export default function BookingPage() {
  const [day, setDay] = useState(2);
  const [time, setTime] = useState(1);
  const svc = SERVICE.clean;
  const selStart = time * 8 - 1;
  return (
    <PhoneScreen padding="0" gap={0} background={C.white} blobs={false}>
      <div style={{ height: 330, background: "#EAD7EE", position: "relative", flexShrink: 0, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ position: "absolute", inset: 0, width: "100%", height: 330, objectFit: "cover", objectPosition: "20% 25%" }} />
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, right: 0, width: 260, maxWidth: "70%", height: 330, background: "linear-gradient(to left, rgba(242,229,245,0.95) 0%, rgba(242,229,245,0.85) 55%, rgba(242,229,245,0) 100%)" }} />
        <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 54px)", left: 22, right: 22, display: "flex", justifyContent: "space-between" }}>
          <Link href={R.Main} aria-label="رجوع" style={glassBtn}><Icon name="back" color={C.accent} size={18} stroke={2} /></Link>
          <button type="button" aria-label="المفضلة" style={glassBtn}><Icon name={HEART} color={C.accent} size={18} /></button>
        </div>
        <div style={{ position: "absolute", top: 132, right: 24, width: 180 }}>
          <h1 style={{ margin: "10px 0 0", fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: C.ink }}>فاطمة<br />طيبة</h1>
          <div style={{ fontSize: 13, color: C.navText, marginTop: 4 }}>أخصائية عناية بالبشرة</div>
          <div style={{ ...GLASS, display: "inline-block", marginTop: 12, boxShadow: "0 4px 12px rgba(123,70,135,0.10)", borderRadius: 14, padding: "4px 12px", fontSize: 13, fontWeight: 600, color: C.accent, whiteSpace: "nowrap" }}>
            تنظيف عميق · {money(svc.price)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: -34, position: "relative", padding: "0 20px", display: "flex", gap: 10, alignItems: "center" }}>
        <Link href={R.P_ServiceDetail} style={{ flexGrow: 1, height: 56, borderRadius: 28, border: "1px solid #FFFFFF", background: "linear-gradient(145deg, #F9F2FB, #EDDAF1)", boxShadow: SHB, fontSize: 15, fontWeight: 600, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon name="info" color={C.accent} size={17} />التفاصيل
        </Link>
        <a href="tel:+963" aria-label="اتصال" style={roundBtn}><Icon name="phone" color={C.accent} size={19} /></a>
        <Link href={R.Consult} aria-label="استشارة فيديو" style={roundBtn}><Icon name="cam" color={C.accent} size={19} /></Link>
        <Link href={R.P_Chat} aria-label="محادثة" style={roundBtn}><Icon name="msg" color={C.accent} size={19} /></Link>
      </div>

      <div style={{ ...CARD, margin: "16px 20px 0", borderRadius: 24, padding: "14px 8px", display: "flex", justifyContent: "space-around", gap: 4 }}>
        {([["bell", "تذكير على واتساب"], ["camera", "صور قبل وبعد"], [HEART, "متابعة بعد الجلسة"]] as const).map(([ic, t]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name={ic} color={C.accentMid} size={18} /><div style={{ fontSize: 12.5, fontWeight: 600, color: C.accent }}>{t}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: "16px 20px 18px", background: "linear-gradient(180deg, #FBF5FC 0%, #F6ECF8 100%)", border: "1px solid #FFFFFF", boxShadow: "inset 0 1px 0 #FFFFFF, 0 10px 26px rgba(123,70,135,0.06)", borderRadius: 28, padding: "16px 16px 18px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: C.sub2 }}>اختاري اليوم</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
            <span style={{ color: C.accentMid }}>›</span>{AR_MONTHS[TODAY.getMonth()]}<span style={{ color: C.accentMid }}>‹</span>
          </div>
        </div>
        <div role="radiogroup" aria-label="اليوم" style={{ display: "flex", gap: 8 }}>
          {DAYS.map((d, i) => {
            const on = day === i;
            return (
              <button key={i} type="button" role="radio" aria-checked={on} onClick={() => setDay(i)} style={{
                flex: 1, minWidth: 0, height: 64, borderRadius: 18, border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`,
                background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.white, color: on ? C.accent : C.sub2,
                boxShadow: on ? "0 10px 22px rgba(150,100,170,0.30)" : "0 4px 12px rgba(123,70,135,0.06)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{d.getDate()}</div>
                <div style={{ fontSize: 11 }}>{dayName(d)}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 13, color: C.sub2, margin: "14px 0 4px" }}>اختاري الوقت</div>
        <div style={{ position: "relative", height: 8 }}>
          <div aria-hidden style={{ position: "absolute", top: 0, width: 60, height: 8, borderRadius: 4, background: "linear-gradient(90deg, #C9A2D8, #A877B6)", boxShadow: "0 3px 8px rgba(150,100,170,0.35)", right: `calc(${((selStart + 2) / 24) * 100}% - 30px + 4px)`, transition: "right .2s" }} />
        </div>
        <div aria-hidden style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 44, padding: "0 4px" }}>
          {Array.from({ length: 25 }, (_, i) => {
            const sel = i >= selStart && i <= selStart + 4;
            return <span key={i} style={{ width: 3, borderRadius: 2, height: sel ? 34 : i % 4 === 0 ? 26 : 16, background: sel ? "linear-gradient(180deg,#C9A2D8,#7B4687)" : "#D5C3D9" }} />;
          })}
        </div>
        <div role="radiogroup" aria-label="الوقت" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.navText, padding: "4px 6px 0" }}>
          {TIMES.map((t, i) => (
            <button key={t} type="button" role="radio" aria-checked={time === i} onClick={() => setTime(i)} className="latin" style={{ border: "none", background: "none", padding: 0, fontSize: 12, color: time === i ? C.accentMid : C.navText, fontWeight: time === i ? 700 : 400 }}>{t}</button>
          ))}
        </div>
        <PrimaryButton href={R.P_Confirm} style={{ marginTop: "auto" }}>احجزي الجلسة</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
