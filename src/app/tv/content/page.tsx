"use client";
/* eslint-disable @next/next/no-img-element */

import { Stage } from "@/components/shell";
import { C, SH, ICON_FILL, LOGO } from "@/lib/tokens";
import { SoundUnlock, useJumpToCall, useRotate, useTv } from "../tv";

const PT_ICONS = [
  "M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0",
  "M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4",
  "M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 14.5a1.6 1.6 0 0 1 2.6-1.8L7 13",
  "M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4",
];

/** TV_Content.dc.html — waiting-room screen between calls: a skin-care tip with a live queue strip. */
export default function Page() {
  const tv = useTv();
  useJumpToCall(tv.rows, "/tv/content/");
  const ti = useRotate(tv.tips.length, tv.content.interval_s ?? 12);
  const tip = tv.tips[ti];
  const points = (tip?.points ?? []).filter(Boolean).slice(0, 4);
  return (
    <Stage width={1920} height={1080}  padding="52px 72px 56px" direction="column" gap={28}>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <div style={{ display: "flex" }}>
          <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 84, width: "auto", display: "block" }} />
        </div>
      </div>
      {!tip ? (
      <div style={{ flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, position: "relative" }}>
        <img src={LOGO} alt="" style={{ height: 260, width: "auto" }} />
        <div style={{ fontSize: 44, fontWeight: 600, color: C.sub }}>أهلاً بكِ — انتبهي لرقمكِ على الشاشة</div>
      </div>
      ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 40, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
          <span style={{ alignSelf: "flex-start", height: 54, padding: "0 26px", borderRadius: 27, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
            </svg>نصيحة العناية
          </span>
          <h1 style={{ margin: "28px 0 0", fontSize: (tip.title?.length ?? 0) > 22 ? 76 : 100, fontWeight: 700, lineHeight: 1.15, color: C.accent }}>{tip.title}
          </h1>
          {tip.body && <p style={{ margin: "22px 0 0", fontSize: 34, lineHeight: 1.6, color: C.sub, maxWidth: 900 }}>{tip.body}
          </p>}
          {points.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", justifyContent: "start", gap: 20, marginTop: 40 }}>
            {points.map((pt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, height: 96, padding: "0 28px 0 34px", borderRadius: 48, background: C.white, boxShadow: SH }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={PT_ICONS[i % PT_ICONS.length]} />
                </svg>
              </span>
              <span style={{ fontSize: 31, fontWeight: 600 }}>{pt}
              </span>
            </div>
            ))}
          </div>}
        </div>
        <div style={{ width: 640, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="620" height="700" viewBox="0 0 620 700" aria-hidden="true">
            <defs>
              <linearGradient id="bt" x1="0" x2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="0.55" stopColor="#F8F1F9" />
                <stop offset="1" stopColor="#E5CFEA" />
              </linearGradient>
              <linearGradient id="cap" x1="0" x2="1">
                <stop offset="0" stopColor="#784883" />
                <stop offset="0.5" stopColor="#7B4687" />
                <stop offset="1" stopColor="#402347" />
              </linearGradient>
              <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#F6DFA5" />
                <stop offset="0.6" stopColor="#E9C46E" />
                <stop offset="1" stopColor="#D9B869" />
              </radialGradient>
              <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <filter id="bs" x="-40%" y="-20%" width="180%" height="150%">
                <feDropShadow dx="0" dy="30" stdDeviation="26" floodColor="#7B4687" floodOpacity="0.22" />
              </filter>
            </defs>
            <circle cx="310" cy="360" r="300" fill="url(#halo)" />
            <circle cx="310" cy="360" r="250" fill="none" stroke="#D9B869" strokeWidth="1.2" opacity="0.6" />
            <circle cx="310" cy="360" r="200" fill="rgba(255,255,255,0.5)" stroke="#FFFFFF" strokeWidth="2" />
            <g transform="translate(310 360) scale(9) translate(-12 -12)" fill="none" stroke="#A877B6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" fill="rgba(255,255,255,0.7)" />
            </g>
            <g fill="#E3C4EA">
              <path d="M120 470c10-16 18-26 18-36a18 18 0 0 0-36 0c0 10 8 20 18 36z" transform="rotate(180 120 452)" />
              <circle cx="510" cy="560" r="12" />
              <circle cx="96" cy="250" r="8" />
            </g>
            <g fill="#CA96D6" opacity="0.8">
              <path d="M540 360l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" />
              <path d="M80 380l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" />
            </g>
          </svg>
        </div>
      </div>
      )}
      <div style={{ height: 112, borderRadius: 56, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, display: "flex", alignItems: "center", gap: 40, padding: "0 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
        <span style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, position: "relative" }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#DEB3E8", boxShadow: "0 0 0 6px rgba(222,179,232,0.3)" }} />في الجلسة الآن
        </span>
        {tv.board.length === 0 && <span style={{ fontSize: 28, color: C.onDark }}>—</span>}
        {tv.board.map((b) => (
        <div key={b.room} style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
        <span style={{ width: 2, height: 44, background: "#7C5485", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontSize: 28, color: C.onDark, whiteSpace: "nowrap" }}>{b.room}
          </span>
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 52, fontWeight: 500 }}>{b.cur}
          </span>
        </div>
        </div>
        ))}
        <span style={{ width: 2, height: 44, background: "#7C5485" }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, position: "relative" }}>
          <span style={{ fontSize: 28, color: C.onDark }}>نُودي
          </span>
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 40, fontWeight: 500 }}>{tv.next.length ? tv.next.slice(0, 3).map((a) => a.queue_no).join(" · ") : "—"}
          </span>
        </div>
        <span style={{ marginInlineStart: "auto", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 44, fontWeight: 500, position: "relative" }}>{tv.time}
        </span>
      </div>
      <SoundUnlock settings={tv.call} />

    </Stage>
  );
}

