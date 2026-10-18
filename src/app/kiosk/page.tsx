"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL, LOGO } from "@/lib/tokens";

/** T_Welcome.dc.html */
const T = {
  ar: { dir: "rtl", font: "var(--font-messiri), 'El Messiri', serif", hello: "أهلاً بكِ", h1: "امسحي رمز موعدكِ", sub: "افتحي موعدكِ في التطبيق، ثم اعرضي رمز الوصول أمام الكاميرا.", s1: "افتحي «موعدي اليوم» في التطبيق", s2: "اعرضي رمز الوصول أمام الكاميرا", s3: "خذي رقم دوركِ واجلسي براحتكِ", w1: "ليس لديكِ موعد؟", w2: "سجّلي حضوركِ واحجزي جلسة من هنا", cam: "وجّهي الرمز نحو الكاميرا", help: "تحتاجين مساعدة؟ فريق الاستقبال بجانبكِ" },
  en: { dir: "ltr", font: "var(--font-rubik), Rubik, sans-serif", hello: "Welcome", h1: "Scan your appointment code", sub: "Open your appointment in the app, then show the check-in code to the camera.", s1: "Open “Today’s appointment” in the app", s2: "Show the check-in code to the camera", s3: "Take your number and relax", w1: "No appointment?", w2: "Check in and book a session here", cam: "Point the code at the camera", help: "Need help? Our reception team is right here" },
} as const;

const seg = (on: boolean, font: string): CSSProperties => ({
  height: 48, padding: "0 22px", borderRadius: 24, border: "none", fontSize: 16, fontWeight: on ? 700 : 600, display: "flex", alignItems: "center", fontFamily: font,
  ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: C.accent, boxShadow: "0 8px 18px rgba(150,100,170,0.28)" } : { background: "transparent", color: C.sub2 }),
});

/** Reception tablet idle screen: scan the appointment QR code, or walk in without one. */
export default function Page() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const t = T[lang];
  const setAr = () => setLang("ar"), setEn = () => setLang("en");
  const arStyle = seg(lang === "ar", T.ar.font), enStyle = seg(lang === "en", T.en.font);
  return (
    <Stage width={1194} height={834} background={BG} padding="36px 40px 32px" direction="row" gap={36}>

      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <div style={{ display: "flex" }}>
              <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 66, width: "auto", display: "block" }} />
            </div>
          </div>
          <div role="group" aria-label="اللغة" style={{ display: "flex", background: "rgba(255,255,255,0.75)", border: "1px solid #FFFFFF", borderRadius: 28, padding: 4, boxShadow: SHB }}>
            <button onClick={setAr} style={arStyle}>عربي
            </button>
            <button onClick={setEn} style={enStyle}>English
            </button>
          </div>
        </div>
        <div dir={t.dir} style={{ fontFamily: t.font, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <div style={{ marginTop: 52, fontSize: 24, fontWeight: 600, color: C.accentMid }}>{t.hello}
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 52, fontWeight: 700, lineHeight: 1.2, color: C.accent }}>{t.h1}
          </h1>
          <div style={{ fontSize: 19, color: C.sub, marginTop: 12, lineHeight: 1.6, maxWidth: 520 }}>{t.sub}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
                <span style={{ position: "absolute", top: -4, insetInlineEnd: -4, width: 22, height: 22, borderRadius: 11, background: C.white, boxShadow: SHB, fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>1
                </span>
              </span>
              <span style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>{t.s1}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2M18 18h2v2M20 14v2" />
                </svg>
                <span style={{ position: "absolute", top: -4, insetInlineEnd: -4, width: 22, height: 22, borderRadius: 11, background: C.white, boxShadow: SHB, fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>2
                </span>
              </span>
              <span style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>{t.s2}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                </svg>
                <span style={{ position: "absolute", top: -4, insetInlineEnd: -4, width: 22, height: 22, borderRadius: 11, background: C.white, boxShadow: SHB, fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>3
                </span>
              </span>
              <span style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>{t.s3}
              </span>
            </div>
          </div>
          <Link href={R.T_WalkIn} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", borderRadius: 30, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
            <span style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </span>
            <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
              <div style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>{t.w1}
              </div>
              <div style={{ fontSize: 16, color: C.sub }}>{t.w2}
              </div>
            </div>
            <span style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 7L7 17M7 8v9h9" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
      <div style={{ width: 500, flexShrink: 0, borderRadius: 40, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: SH, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ position: "absolute", top: -120, left: -80, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(190,150,215,0.45) 0%, rgba(190,150,215,0) 70%)" }} />
        <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 20, background: "rgba(255,255,255,0.8)", boxShadow: SHB, fontSize: 14, fontWeight: 600, color: C.accent, whiteSpace: "nowrap" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
          </svg>
          <span dir={t.dir} style={{ fontFamily: t.font }}>{t.cam}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </div>
        <div style={{ position: "relative", marginTop: 40 }}>
          <svg width="430" height="430" viewBox="0 0 430 430" aria-hidden="true">
            <defs>
              <linearGradient id="scl" x1="0" x2="1">
                <stop offset="0" stopColor="#C9A2D8" stopOpacity="0" />
                <stop offset="0.5" stopColor="#A877B6" />
                <stop offset="1" stopColor="#C9A2D8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="scg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#E3C4EA" stopOpacity="0" />
                <stop offset="1" stopColor="#E3C4EA" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="ph" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#F3E9F5" />
              </linearGradient>
              <filter id="phs" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#7B4687" floodOpacity="0.18" />
              </filter>
            </defs>
            <g fill="none" stroke="#7B4687" strokeWidth="7" strokeLinecap="round">
              <path d="M20 92V48a28 28 0 0 1 28-28h44" />
              <path d="M338 20h44a28 28 0 0 1 28 28v44" />
              <path d="M410 338v44a28 28 0 0 1-28 28h-44" />
              <path d="M92 410H48a28 28 0 0 1-28-28v-44" />
            </g>
            <g filter="url(#phs)" transform="rotate(-6 215 215)">
              <rect x="128" y="62" width="174" height="306" rx="30" fill="url(#ph)" stroke="#FFFFFF" strokeWidth="3" />
              <rect x="190" y="76" width="50" height="7" rx="3.5" fill="#E9DCEE" />
              <text x="215" y="114" textAnchor="middle" fontFamily="var(--font-messiri), 'El Messiri', serif" fontSize="13" fontWeight="700" fill="#7B4687">رمز الوصول
              </text>
              <rect x="150" y="128" width="130" height="130" rx="16" fill="#FFFFFF" stroke="#E9DCEE" />
              <g transform="translate(157 135) scale(5.428)">
                <rect x="0.5" y="0.5" width="7" height="7" rx="1.6" fill="none" stroke="#35213D" strokeWidth="1" />
                <rect x="2.5" y="2.5" width="3" height="3" rx="0.8" fill="#35213D" />
                <rect x="13.5" y="0.5" width="7" height="7" rx="1.6" fill="none" stroke="#35213D" strokeWidth="1" />
                <rect x="15.5" y="2.5" width="3" height="3" rx="0.8" fill="#35213D" />
                <rect x="0.5" y="13.5" width="7" height="7" rx="1.6" fill="none" stroke="#35213D" strokeWidth="1" />
                <rect x="2.5" y="15.5" width="3" height="3" rx="0.8" fill="#35213D" />
                {"8,0 9,0 11,0 8,1 9,1 11,1 12,1 8,2 9,2 10,2 12,2 8,3 12,3 9,4 11,4 12,4 8,5 9,5 11,5 9,6 11,6 12,6 8,7 10,7 11,7 0,8 1,8 4,8 9,8 11,8 12,8 14,8 16,8 0,9 4,9 9,9 14,9 15,9 17,9 19,9 20,9 0,10 2,10 3,10 4,10 6,10 7,10 12,10 13,10 14,10 17,10 18,10 19,10 20,10 2,11 3,11 4,11 5,11 12,11 17,11 18,11 19,11 0,12 1,12 2,12 3,12 4,12 5,12 6,12 7,12 8,12 9,12 10,12 13,12 14,12 15,12 16,12 17,12 9,13 10,13 11,13 12,13 14,13 15,13 18,13 20,13 12,14 13,14 14,14 18,14 19,14 13,15 15,15 16,15 17,15 18,15 19,15 9,16 13,16 14,16 15,16 16,16 17,16 11,17 17,17 19,17 9,18 10,18 13,18 14,18 15,18 18,18 9,19 11,19 12,19 17,19 20,19 8,20 9,20 10,20 12,20 13,20 14,20 16,20 17,20 20,20".split(" ").map((p) => { const [x, y] = p.split(",").map(Number); return <rect key={p} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx="0.2" fill="#35213D" />; })}
              </g>
              <rect x="150" y="274" width="130" height="12" rx="6" fill="#F0E4F3" />
              <rect x="168" y="294" width="94" height="10" rx="5" fill="#F3EAF6" />
              <rect x="150" y="318" width="130" height="34" rx="17" fill="#7B4687" />
            </g>
            <g>
              <rect x="34" y="0" width="362" height="70" fill="url(#scg)" />
              <rect x="34" y="68" width="362" height="5" rx="2.5" fill="url(#scl)" />
              <animateTransform attributeName="transform" type="translate" values="0 36; 0 300; 0 36" dur="3.2s" repeatCount="indefinite" />
            </g>
          </svg>
        </div>
        <div dir={t.dir} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: C.sub, fontFamily: t.font }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 17v.01M12 13.5a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4" />
          </svg>{t.help}
        </div>
      </div>

    </Stage>
  );
}

