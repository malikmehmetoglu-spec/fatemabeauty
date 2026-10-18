"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { FatemaAvatar, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, GLASS, SHB, SHEEN } from "@/lib/tokens";

const DIM: CSSProperties = {
  background: "rgba(53,33,61,0.38)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.45)",
};
const round: CSSProperties = { width: 56, height: 56, borderRadius: 28, border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const btn = (on: boolean): CSSProperties => ({
  ...round,
  ...(on ? { background: C.white, color: C.accent, boxShadow: SHB } : { background: "rgba(123,70,135,0.85)", color: C.white, boxShadow: "0 6px 18px rgba(0,0,0,0.2)" }),
});

/** P_InCall.dc.html — online consultation, video call in progress. */
export default function InCallPage() {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  return (
    <PhoneScreen background="#35213D" blobs={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FATEMA_PHOTO} alt="فاطمة طيبة في مكالمة الفيديو" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", zIndex: -1 }} />
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 200, zIndex: -1, background: "linear-gradient(180deg, rgba(53,33,61,0.45) 0%, rgba(53,33,61,0) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 400, zIndex: -1, background: "linear-gradient(0deg, rgba(53,33,61,0.82) 0%, rgba(53,33,61,0) 100%)" }} />

      <div style={{ ...GLASS, display: "flex", alignItems: "center", gap: 10, height: 64, borderRadius: 32, padding: "0 8px 0 14px", boxShadow: "0 10px 26px rgba(53,33,61,0.18)" }}>
        <FatemaAvatar size={46} />
        <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.3 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: C.ink }}>فاطمة طيبة</div>
          <div style={{ fontSize: 12, color: C.sub, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: C.ok, flexShrink: 0 }} />استشارة أونلاين · اتصال جيد
          </div>
        </div>
        <span className="latin" aria-label="مدة المكالمة 12 دقيقة و40 ثانية" style={{
          height: 36, padding: "0 12px", borderRadius: 18, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 6,
          fontSize: 14, fontWeight: 500, color: C.accent, flexShrink: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#9B4FB0", boxShadow: "0 0 0 3px rgba(155,79,176,0.2)" }} />12:40
        </span>
      </div>

      <div style={{
        alignSelf: "flex-end", width: 108, height: 148, borderRadius: 26, border: "3px solid #FFFFFF", background: "linear-gradient(160deg,#F1E3F6 0%,#D9BCE5 100%)",
        boxShadow: "0 14px 30px rgba(53,33,61,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, position: "relative",
      }}>
        <Icon name="user" color={C.accent} size={34} stroke={1.6} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>أنتِ</span>
        {!mic && (
          <span style={{ position: "absolute", top: 8, left: 8, width: 26, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="micoff" color={C.danger} size={15} />
          </span>
        )}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ ...DIM, alignSelf: "center", maxWidth: 330, borderRadius: 20, padding: "10px 14px", color: C.white, display: "flex", gap: 8, alignItems: "flex-start", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>
          <Icon name="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM10.5 10.5a1.5 1.5 0 1 0 0 3M17 10.5a1.5 1.5 0 1 0 0 3" color="#FFFFFF" size={18} />
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}><span style={{ fontWeight: 700 }}>فاطمة طيبة: </span>قرّبي الكاميرا قليلاً من منطقة الأنف، وابقي قرب ضوء النافذة.</div>
        </div>
        <div style={{ ...DIM, height: 84, borderRadius: 42, padding: "0 12px", boxShadow: "0 14px 34px rgba(0,0,0,0.20)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <button type="button" onClick={() => setMic(!mic)} aria-label={mic ? "كتم الميكروفون" : "تشغيل الميكروفون"} aria-pressed={!mic} style={btn(mic)}>
            <Icon name={mic ? "mic" : "micoff"} color={mic ? C.accent : C.white} size={22} />
          </button>
          <button type="button" onClick={() => setCam(!cam)} aria-label={cam ? "إيقاف الكاميرا" : "تشغيل الكاميرا"} aria-pressed={!cam} style={btn(cam)}>
            <Icon name="cam" color="currentColor" size={22} />
          </button>
          <button type="button" aria-label="تبديل الكاميرا" style={{ ...round, background: C.white, boxShadow: SHB }}>
            <Icon name="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M11 11l-2 2 2 2M13 15l2-2-2-2" color={C.accent} size={22} />
          </button>
          <Link href={R.P_Chat} aria-label="المحادثة" style={{ ...round, background: C.white, boxShadow: SHB }}>
            <Icon name="msg" color={C.accent} size={22} />
          </Link>
          <Link href={R.P_ConsultSummary} aria-label="إنهاء المكالمة" style={{
            ...round, width: 64, height: 64, borderRadius: 32, backgroundColor: C.danger, backgroundImage: SHEEN,
            boxShadow: "0 12px 26px rgba(145,77,160,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}>
            <Icon name="phoneoff" color="#FFFFFF" size={26} stroke={2} />
          </Link>
        </div>
      </div>
    </PhoneScreen>
  );
}
