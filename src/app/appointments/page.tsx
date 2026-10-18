"use client";

/** P_Appointments.dc.html — «مواعيدي» root tab: upcoming / past appointments. */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Circ, DarkGlow, FatemaAvatar, Icon, IconButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_DAYS, AR_MONTHS, PERSONA } from "@/lib/data";
import { C, CARD, DARK, SELECTED, SH_SOFT, SHB } from "@/lib/tokens";
import { DAYS_TO_NEXT, NEXT_LABEL, NEXT_SESSION_NO, PAST_SESSIONS, PKG_SERVICE, PKG_TOTAL, TODAY_LABEL } from "@/lib/mock/b";

const TAB_ON: CSSProperties = { flex: 1, height: 40, borderRadius: 20, border: "none", fontSize: 14, fontWeight: 700, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: C.accent, boxShadow: "0 8px 18px rgba(150,100,170,0.25)" };
const TAB_OFF: CSSProperties = { flex: 1, height: 40, borderRadius: 20, border: "none", fontSize: 14, fontWeight: 600, background: "transparent", color: C.sub2 };
const ROW: CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" };
const PILL: CSSProperties = { height: 34, padding: "0 14px", borderRadius: 17, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 };
const PILL_OFF: CSSProperties = { ...PILL, background: C.white, border: "1px solid #EADCF0", color: C.sub2, fontWeight: 600 };

export default function AppointmentsPage() {
  const [tab, setTab] = useState<"up" | "past">("up");
  const last = PAST_SESSIONS[0];
  return (
    <PhoneScreen tab="مواعيدي">
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ lineHeight: 1.3 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink }}>مواعيدي</h1>
          <div style={{ fontSize: 13, color: C.sub2 }}>{TODAY_LABEL}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconButton icon="bell" label="الإشعارات" href={R.Notifications} />
          <IconButton icon="plus" label="حجز موعد جديد" href={R.P_Services} />
        </div>
      </div>

      <div role="tablist" aria-label="المواعيد" style={{ position: "relative", display: "flex", gap: 4, padding: 4, borderRadius: 24, background: "rgba(255,255,255,0.7)", border: "1px solid #FFFFFF", boxShadow: SHB }}>
        {([["up", "القادمة · 1"], ["past", `السابقة · ${PAST_SESSIONS.length}`]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={tab === k ? TAB_ON : TAB_OFF}>{t}</button>
        ))}
      </div>

      {tab === "up" ? (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href={R.P_AppointmentDetail} style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px", display: "block" }}>
            <DarkGlow />
            <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.onDark }}>موعدكِ القادم</div>
                  <div style={{ fontSize: 21, fontWeight: 700, marginTop: 2, whiteSpace: "nowrap" }}>{NEXT_LABEL}</div>
                  <div style={{ fontSize: 14, color: "#F2E6F4" }}>الساعة {PERSONA.nextTime} · {PKG_SERVICE.room}</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>بعد {DAYS_TO_NEXT} يوماً</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "14px 0 12px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FatemaAvatar size={40} />
                <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{PKG_SERVICE.name}</div>
                  <div style={{ fontSize: 12.5, color: C.onDark }}>مع {PERSONA.specialist} · {PKG_SERVICE.minutes} دقيقة</div>
                </div>
                <span style={{ width: 40, height: 40, borderRadius: 20, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="arrow" color={C.accent} size={16} stroke={2} />
                </span>
              </div>
            </div>
          </Link>

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "0 6px", fontSize: 12.5, color: C.sub }}>
            <Icon name="bell" size={17} />سنذكّركِ على واتساب قبل الموعد بيوم، وصباح يوم الجلسة
          </div>

          <Link href={R.Packages} style={{ ...CARD, position: "relative", display: "block", borderRadius: 26, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Circ icon="gift" size={40} iconSize={18} />
              <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>باقة {PERSONA.package}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>موعد {PERSONA.nextSession.getDate()} {AR_MONTHS[PERSONA.nextSession.getMonth()]} هو الجلسة {NEXT_SESSION_NO} من {PKG_TOTAL}</div>
              </div>
              <Tag kind="pink">متبقٍ {PERSONA.sessionsLeft}</Tag>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
              {Array.from({ length: PKG_TOTAL }, (_, i) => (
                <span key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: i < PERSONA.sessionsDone ? "linear-gradient(90deg,#C9A2D8,#7B4687)" : i === PERSONA.sessionsDone ? "#DEC6E8" : "#EFE6F1" }} />
              ))}
            </div>
          </Link>

          <Link href={R.Review} style={{ ...ROW, background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: SH_SOFT }}>
            <Circ icon="star" size={40} iconSize={18} />
            <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>كيف كانت جلسة اليوم؟</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{TODAY_LABEL} · الجلسة {last.no} من {PKG_TOTAL}</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "#9B4FB0", flexShrink: 0 }} />
            <Icon name="chev" size={18} stroke={2} />
          </Link>

          <Link href={R.P_Services} style={{ ...ROW, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
            <Circ icon="plus" size={40} iconSize={18} />
            <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>احجزي جلسة أخرى</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>هيدرافيشل، تقشير، ليزر أو استشارة</div>
            </div>
            <Icon name="chev" size={18} stroke={2} />
          </Link>
        </div>
      ) : (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
          {PAST_SESSIONS.map(({ date, no }, i) => (
            <div key={no} style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 64, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{date.getDate()}</span>
                  <span style={{ fontSize: 10.5, color: C.accentMid, whiteSpace: "nowrap" }}>{AR_MONTHS[date.getMonth()]}</span>
                </div>
                <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{PKG_SERVICE.name}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{AR_DAYS[date.getDay()]} · {PERSONA.specialist} · الجلسة {no} من {PKG_TOTAL}</div>
                </div>
                <Tag kind="gray">انتهت</Tag>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                {i === 0 ? (
                  <Link href={R.Review} style={{ ...PILL, ...SELECTED, fontWeight: 700 }}><Icon name="star" color={C.accent} size={15} />قيّمي الجلسة</Link>
                ) : (
                  <Link href={R.Review} style={PILL_OFF}><Icon name="star" size={15} />التقييم</Link>
                )}
                <Link href={R.Routine} style={PILL_OFF}><Icon name="clip" size={15} />الروتين</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PhoneScreen>
  );
}
