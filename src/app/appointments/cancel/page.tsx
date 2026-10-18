"use client";

/** P_CancelConfirm.dc.html — cancel-appointment bottom sheet over the appointment details. */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, FatemaAvatar, Icon, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA } from "@/lib/data";
import { C, CARD, DARK, SH_SOFT, SHEEN } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { NEXT_LABEL, NEXT_SESSION_NO, PKG_SERVICE, PKG_TOTAL } from "@/lib/mock/b";

const REASONS = ["تغيّر جدولي", "ظرف صحي", "سفر", "سأحجز وقتاً آخر", "سبب آخر"];
const TILE: CSSProperties = { borderRadius: 18, padding: "10px 12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" };

function chip(on: boolean): CSSProperties {
  return {
    height: 38, padding: "0 14px", borderRadius: 19, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
    color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 3px 10px rgba(123,70,135,0.05)",
  };
}

function InfoRow({ icon, title, sub, first, size = 40 }: { icon: string; title: string; sub: string; first?: boolean; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: size === 40 ? "12px 0" : "11px 0", borderTop: first ? undefined : `1px solid ${C.line}` }}>
      <Circ icon={icon} size={size} iconSize={size === 40 ? 18 : 16} />
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function CancelConfirmPage() {
  const [reason, setReason] = useState(0);
  const d = PERSONA.nextSession;
  const sheet = (
    <>
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(53,33,61,0.35)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-modal="true" aria-labelledby="cx-title" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 11, borderRadius: "38px 38px 0 0", background: "linear-gradient(180deg, #FFFFFF 0%, #FBF6FC 100%)",
        boxShadow: "0 -18px 40px rgba(53,33,61,0.22)", padding: "12px 20px calc(env(safe-area-inset-bottom, 0px) + 26px)", display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: "#E3D3E7", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: 27, flexShrink: 0, background: "linear-gradient(145deg,#F7ECF9,#EAD0F0)", boxShadow: "0 8px 18px rgba(145,77,160,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="calx" color={C.danger} size={25} />
          </span>
          <div style={{ lineHeight: 1.35 }}>
            <div id="cx-title" style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>إلغاء الموعد؟</div>
            <div style={{ fontSize: 13, color: C.sub }}>{arDate(d, { year: true })} · {PERSONA.nextTime}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.sub2, marginBottom: -4 }}>ما سبب الإلغاء؟ (اختياري)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REASONS.map((r, i) => (
            <button key={r} type="button" aria-pressed={reason === i} onClick={() => setReason(reason === i ? -1 : i)} style={chip(reason === i)}>{r}</button>
          ))}
        </div>
        <div style={{ borderRadius: 22, padding: "4px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
          <InfoRow first size={36} icon="refresh" title="لا تقلقي على موعدكِ" sub="سيعود موعدكِ متاحاً فوراً لمراجعة أخرى في قائمة الانتظار" />
          <InfoRow size={36} icon="layers" title="تعود الجلسة إلى رصيد باقتكِ" sub={`يبقى لكِ ${PERSONA.sessionsLeft} جلسات من ${PKG_TOTAL} في باقة التنظيف العميق`} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
          <Link href={R.P_Appointments} style={{
            height: 56, borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.white, fontSize: 16, fontWeight: 600,
            backgroundColor: C.danger, backgroundImage: SHEEN, boxShadow: "0 14px 28px rgba(145,77,160,0.32), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}>
            <Icon name="calx" color="#FFFFFF" size={19} />نعم، ألغي الموعد
          </Link>
          <SecondaryButton href={R.P_AppointmentDetail} height={52}>تراجعت</SecondaryButton>
        </div>
      </div>
    </>
  );

  return (
    <PhoneScreen overlay={sheet}>
      <TopBar title="تفاصيل الموعد" back={R.P_Appointments} />
      <div style={{ ...DARK, borderRadius: 32, padding: 22, position: "relative", overflow: "hidden" }}>
        <DarkGlow />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <FatemaAvatar size={52} />
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 13, color: C.onDark }}>مع {PERSONA.specialist}</div>
            <div style={{ fontSize: 21, fontWeight: 700 }}>{PKG_SERVICE.name}</div>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 18 }}>
          <div style={{ ...TILE, flex: 1 }}>
            <div style={{ fontSize: 11, color: C.onDark }}>اليوم</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{NEXT_LABEL}</div>
          </div>
          <div style={{ ...TILE, width: 92 }}>
            <div style={{ fontSize: 11, color: C.onDark }}>الساعة</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{PERSONA.nextTime}</div>
          </div>
        </div>
      </div>
      <div style={{ ...CARD, borderRadius: 26, padding: "4px 18px" }}>
        <InfoRow first icon="door" title={PKG_SERVICE.room} sub="يصلكِ رقم دوركِ عند تسجيل الوصول" />
        <InfoRow icon="layers" title="من باقتكِ" sub={`الجلسة ${NEXT_SESSION_NO} من ${PKG_TOTAL} · تنظيف عميق`} />
        <InfoRow icon="bell" title="التذكير" sub="واتساب قبل الموعد بيوم وبساعتين" />
      </div>
    </PhoneScreen>
  );
}
