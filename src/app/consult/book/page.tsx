"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, FatemaAvatar, Icon, PrimaryButton, SectionTitle } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS } from "@/lib/data";
import { dayName } from "@/lib/format";
import { C, CARD, DONE_GRAD, GLASS, SOFT_PANEL } from "@/lib/tokens";

const DAYS = [14, 15, 17, 18].map((n) => new Date(2026, 9, n));
const TIMES = ["11:00", "12:30", "16:00", "17:30", "18:30"];

const sel = (on: boolean): CSSProperties => ({
  border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`,
  background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
  color: on ? C.accent : C.sub2,
  boxShadow: on ? "0 10px 22px rgba(150,100,170,0.30)" : "0 4px 12px rgba(123,70,135,0.06)",
});

function Shot({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, height: 132, borderRadius: 22, position: "relative", overflow: "hidden", border: "2px solid #FFFFFF", boxShadow: "0 10px 22px rgba(123,70,135,0.12)" }}>
      <div style={{ position: "absolute", inset: -20, background: "radial-gradient(ellipse at 50% 40%, #F3D6C3 0%, #DDB096 80%)", filter: "blur(8px)" }} />
      <span style={{ ...DONE_GRAD, position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="check" color="#FFFFFF" size={11} stroke={2.4} />
      </span>
      <div style={{ ...GLASS, position: "absolute", bottom: 8, right: 8, left: 8, height: 26, borderRadius: 13, fontSize: 11.5, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{label}</div>
    </div>
  );
}

/** P_ConsultBook.dc.html — book an online consultation (day, time, skin photos). */
export default function ConsultBookPage() {
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(2);
  const d = DAYS[day];
  return (
    <PhoneScreen>
      <TopBar title="حجز استشارة أونلاين" />

      <div style={{ ...SOFT_PANEL, display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" }}>
        <FatemaAvatar size={46} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>مع فاطمة طيبة</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>مكالمة فيديو من بيتكِ · نحو 20 دقيقة</div>
        </div>
        <Circ icon="cam" size={40} iconSize={18} />
      </div>

      <SectionTitle right={<span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{AR_MONTHS[9]} 2026</span>}>اختاري اليوم</SectionTitle>
      <div style={{ display: "flex", gap: 8 }}>
        {DAYS.map((x, i) => (
          <button key={i} type="button" aria-pressed={day === i} onClick={() => setDay(i)} style={{
            ...sel(day === i), flex: 1, minWidth: 0, height: 62, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15 }}>{x.getDate()}</span>
            <span style={{ fontSize: 11 }}>{dayName(x)}</span>
          </button>
        ))}
      </div>

      <SectionTitle>اختاري الوقت</SectionTitle>
      <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
        {TIMES.map((t, i) => (
          <button key={t} type="button" aria-pressed={slot === i} onClick={() => setSlot(i)} style={{
            ...sel(slot === i), flex: 1, minWidth: 0, height: 40, borderRadius: 20, fontSize: 13.5, fontWeight: 600, padding: 0,
          }}>{t}</button>
        ))}
      </div>

      <SectionTitle right={<span style={{ fontSize: 12, color: C.sub2 }}>2 من 3 · بضوء النهار وبدون مكياج</span>}>صور بشرتكِ</SectionTitle>
      <div style={{ display: "flex", gap: 10 }}>
        <Shot label="أمامية" />
        <Shot label="الجانب الأيمن" />
        <button type="button" aria-label="التقاط صورة الجانب الأيسر" style={{
          flex: 1, minWidth: 0, height: 132, borderRadius: 22, border: "1.5px dashed #D7BFDC", background: "linear-gradient(180deg,#FFFFFF,#F8F1FA)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Circ icon="camera" size={42} iconSize={19} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.accent }}>الجانب الأيسر</span>
          <span style={{ fontSize: 10.5, color: C.muted }}>التقطي صورة</span>
        </button>
      </div>

      <Link href={R.P_SkinType} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "10px 14px" }}>
        <Circ icon="clip" size={38} iconSize={17} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>استبيان قصير عن بشرتكِ</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يساعد الأخصائية على التحضير لاستشارتكِ</div>
        </div>
        <Icon name="chev" color={C.accentMid} size={18} stroke={2} />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12.5, color: C.sub }}>
        <Icon name="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" color={C.ok} size={17} />
        يصلكِ التأكيد ورابط المكالمة على واتساب
      </div>

      <PrimaryButton href={R.Consult} style={{ marginTop: "auto" }}>متابعة · {dayName(d)} {d.getDate()} · {TIMES[slot]}</PrimaryButton>
    </PhoneScreen>
  );
}
