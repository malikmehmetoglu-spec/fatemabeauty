"use client";

import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { DoneDot, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, DARK, FATEMA_PHOTO, GLASS, SH, SHB } from "@/lib/tokens";

/** Consult.dc.html — online consultation waiting room (before joining the video call). */
export default function ConsultPage() {
  const glassBtn = {
    ...GLASS, width: 52, height: 52, borderRadius: 26, boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
  } as const;
  const ready: [string, string][] = [
    ["صور بشرتكِ", "3 صور: أمامية وجانبيتان"],
    ["استبيان ما قبل الاستشارة", "اطّلعت عليه الأخصائية"],
    ["الدفع المسبق", "تم تأكيد الحجز"],
  ];
  return (
    <PhoneScreen>
      <TopBar title="استشارة أونلاين" />

      <div style={{ height: 360, borderRadius: 32, overflow: "hidden", position: "relative", flexShrink: 0, boxShadow: SH, background: "#EAD7EE" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        <div style={{ ...GLASS, position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 6, borderRadius: 16, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.accent }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: C.ok }} />متصلة الآن
        </div>
        <div style={{
          position: "absolute", top: 14, left: 14, width: 84, height: 112, borderRadius: 20, background: "linear-gradient(160deg, #F3E6F6, #E4CBE9)",
          border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 20px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        }}>
          <Icon name="user" color={C.accent} size={26} stroke={1.6} />
          <span style={{ fontSize: 11, color: C.accent }}>أنتِ</span>
        </div>
        <div style={{ ...GLASS, position: "absolute", bottom: 14, left: 14, right: 14, borderRadius: 24, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>فاطمة طيبة</div>
            <div style={{ fontSize: 12, color: C.navText }}>ستنضم خلال لحظات</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" aria-label="الميكروفون" style={glassBtn}><Icon name="mic" color={C.accent} size={20} stroke={1.9} /></button>
            <button type="button" aria-label="الكاميرا" style={glassBtn}><Icon name="cam" color={C.accent} size={20} stroke={1.9} /></button>
          </div>
        </div>
      </div>

      <div style={{ background: C.white, borderRadius: 26, padding: "6px 16px", position: "relative", boxShadow: SH }}>
        <div style={{ fontSize: 13, color: C.sub2, paddingTop: 8 }}>جاهزة للجلسة</div>
        {ready.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <DoneDot />
            <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", gap: 10, alignItems: "center" }}>
        <Link href={R.P_InCall} style={{ ...DARK, flexGrow: 1, height: 58, borderRadius: 29, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="cam" color="#FFFFFF" size={20} stroke={1.9} />انضمي للجلسة
        </Link>
        <button type="button" aria-label="اتصال صوتي" style={{ width: 58, height: 58, borderRadius: 29, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="phone" color={C.accent} size={20} stroke={1.9} />
        </button>
      </div>
    </PhoneScreen>
  );
}
