"use client";

import Link from "next/link";
import { PhoneScreen } from "@/components/shell";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, GLASS, SHB } from "@/lib/tokens";

/** P_Splash.dc.html — splash / start screen. */
export function SplashScreen() {
  const ring = (size: number, border: string) => (
    <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", width: size, height: size, margin: `${-size / 2}px 0 0 ${-size / 2}px`, borderRadius: "50%", border, pointerEvents: "none" }} />
  );
  return (
    <PhoneScreen padding="calc(env(safe-area-inset-top, 0px) + 54px) 24px calc(env(safe-area-inset-bottom, 0px) + 26px)">
      <div aria-hidden style={{ position: "absolute", bottom: -120, left: -60, width: 360, height: 360, borderRadius: "50%", zIndex: -1, background: "radial-gradient(circle, rgba(190,150,215,0.40) 0%, rgba(190,150,215,0) 70%)" }} />
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", marginTop: 40 }}>
        <div style={{ position: "relative", width: 190, height: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ring(250, "1px solid rgba(217,184,105,0.35)")}
          {ring(330, "1px solid rgba(255,255,255,0.8)")}
          {ring(420, "1px solid rgba(217,184,105,0.18)")}
          <Logo height={150} />
        </div>
        <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <span style={{ width: 26, height: 1, background: C.gold2 }} />
          <span style={{ width: 5, height: 5, borderRadius: 3, background: C.gold }} />
          <span style={{ width: 26, height: 1, background: C.gold2 }} />
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 16, color: C.sub, lineHeight: 1.7 }}>عناية تليق ببشرتكِ<br />وخبرة تمنحكِ إشراقة تدوم</p>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingBottom: 14 }}>
        <div role="progressbar" aria-label="جارٍ التحميل" style={{ display: "flex", gap: 7, justifyContent: "center" }}>
          <span style={{ width: 22, height: 7, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)", boxShadow: "0 3px 8px rgba(123,70,135,0.35)" }} />
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "#DDC8E2" }} />
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "#E9DBED" }} />
        </div>
        <Link href={R.Login} style={{ ...GLASS, height: 52, padding: "0 34px", borderRadius: 26, boxShadow: SHB, display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, color: C.accent }}>
          ابدئي<Icon name="fwd" color={C.accent} size={18} stroke={2} />
        </Link>
      </div>
    </PhoneScreen>
  );
}
