"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS, SERVICE, TODAY } from "@/lib/data";
import { addDays, arDate, dayName } from "@/lib/format";
import { C, DARK, SELECTED } from "@/lib/tokens";

/** P_Waitlist.dc.html — join the waitlist for a full day. */
const FULL_DAY = addDays(TODAY, 2);
const NEAR = [1, 4, 5, 6].map((n) => addDays(TODAY, n));
const WINDOWS = [
  { k: "m", icon: "sun", t: "صباحاً", r: "10 – 12" },
  { k: "n", icon: "clock", t: "ظهراً", r: "12 – 3" },
  { k: "e", icon: "moon", t: "مساءً", r: "3 – 6" },
];
const OFF: CSSProperties = { background: C.white, border: "1px solid #EEE4F1", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", color: C.sub2 };
const POSITION = 2;

export default function WaitlistPage() {
  const [wins, setWins] = useState<Record<string, boolean>>({ m: true, n: true });
  const [days, setDays] = useState<Record<number, boolean>>({ 0: true });
  const svc = SERVICE.hydra;
  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="قائمة الانتظار" back={R.Booking} />

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ lineHeight: 1.4, minWidth: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 600 }}>
                <Icon name="calx" color="#FFFFFF" size={14} />اليوم ممتلئ
              </div>
              <div style={{ fontSize: 21, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" }}>{arDate(FULL_DAY)}</div>
              <div style={{ fontSize: 13, color: C.onDark }}>{svc.name} · {svc.minutes} دقيقة</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0, width: 86, height: 86, borderRadius: 43, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
              <div style={{ fontSize: 11, color: C.onDark }}>ترتيبكِ</div>
              <div style={{ fontSize: 44, fontWeight: 700, marginTop: 2 }}>{POSITION}</div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "14px 0 10px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
            <Icon name="users" color="#E8D6F0" size={18} />أنتِ الثانية في قائمة انتظار هذا اليوم
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12, borderRadius: 22, padding: "12px 14px", background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
        <Circ icon="bell" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.55 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>سنُعلمكِ أولاً إذا فرغ موعد</div>
          <div style={{ fontSize: 12.5, color: C.sub }}>يصلكِ إشعار على واتساب وفي التطبيق، وتؤكدين الموعد بلمسة واحدة.</div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>الأوقات المناسبة لكِ</h2>
        <div role="group" aria-label="الأوقات المناسبة" style={{ display: "flex", gap: 8 }}>
          {WINDOWS.map((w) => {
            const on = !!wins[w.k];
            return (
              <button key={w.k} type="button" aria-pressed={on} onClick={() => setWins({ ...wins, [w.k]: !on })} style={{
                flex: 1, minWidth: 0, height: 92, borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                ...(on ? SELECTED : OFF),
              }}>
                <Icon name={w.icon} color={on ? C.accent : C.accentMid} size={20} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{w.t}</span>
                <span dir="ltr" style={{ fontSize: 11.5, opacity: 0.8 }}>{w.r}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>أقبل أيضاً بأيام قريبة</h2>
          <div style={{ fontSize: 12, color: C.sub2 }}>{AR_MONTHS[TODAY.getMonth()]}</div>
        </div>
        <div role="group" aria-label="أيام قريبة" style={{ display: "flex", gap: 8 }}>
          {NEAR.map((d, i) => {
            const on = !!days[i];
            return (
              <button key={i} type="button" aria-pressed={on} onClick={() => setDays({ ...days, [i]: !on })} style={{
                flex: 1, minWidth: 0, height: 70, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                ...(on ? SELECTED : OFF),
              }}>
                <span style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{d.getDate()}</span>
                <span style={{ fontSize: 11 }}>{dayName(d)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Link href={R.Booking} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 40, fontSize: 13.5, color: C.sub, flexWrap: "wrap" }}>
        أو اختاري موعداً متاحاً في يوم آخر
        <span style={{ fontWeight: 700, color: C.accentMid, display: "inline-flex", alignItems: "center", gap: 2 }}>من التقويم<Icon name="fwd" color={C.accentMid} size={15} stroke={2} /></span>
      </Link>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton href={R.P_Appointments} icon="bell">انضمي لقائمة الانتظار</PrimaryButton>
        <div style={{ textAlign: "center", fontSize: 12, color: C.sub2 }}>يمكنكِ مغادرة القائمة في أي وقت من «مواعيدي»</div>
      </div>
    </PhoneScreen>
  );
}
