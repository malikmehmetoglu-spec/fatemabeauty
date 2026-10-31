"use client";
/* eslint-disable @next/next/no-img-element */

import { C, SH, ICON_FILL, LOGO } from "@/lib/tokens";
import { useRotate, type useTv } from "./tv";

/** TV_Board.dc.html content — rooms in session, who is next, and an optional tip strip (settings 'tv_content'). */
export function BoardView({ tv }: { tv: ReturnType<typeof useTv> }) {
  const ti = useRotate(tv.tips.length, tv.content.interval_s ?? 12);
  const tip = tv.tips[ti];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex" }}>
            <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 100, width: "auto", display: "block" }} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 22, color: C.sub }}>أهلاً بكِ — ننادي بالرقم فقط، بالعربية ثم الإنجليزية
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, height: 96, padding: "0 34px", borderRadius: 48, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: SH }}>
          <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 56, fontWeight: 500, color: C.accent, letterSpacing: 1 }}>{tv.time}
          </div>
          <span style={{ width: 2, height: 46, background: C.border }} />
          <div style={{ fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{tv.day}
            <br />
            <span style={{ fontWeight: 500, color: C.sub }}>{tv.date}
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 32, flexGrow: 1, minHeight: "0", position: "relative" }}>
        {tv.board.length === 0 && (
          <div style={{ flex: 1, borderRadius: 48, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: C.sub, textAlign: "center", lineHeight: 1.6 }}>
            تظهر هنا أرقام الغرف فور بدء جلسات اليوم
          </div>
        )}
        {tv.board.map((b) => (
        <div key={b.room} style={{ flex: 1, minWidth: "0", borderRadius: 48, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "36px 40px 34px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -120, left: -120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,214,240,0.7) 0%, rgba(232,214,240,0) 70%)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
            <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
              </svg>
            </span>
            <span style={{ fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>{b.room}
            </span>
          </div>
          <div style={{ alignSelf: "center", marginTop: 34, height: 50, padding: "0 24px", borderRadius: 25, background: "#FBEAF1", color: C.danger, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", position: "relative" }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: "#9B4FB0", boxShadow: "0 0 0 5px rgba(155,79,176,0.18)" }} />{b.cur === "—" ? "شاغرة" : "في الجلسة"}
          </div>
          {b.cur === "—" ? <div style={{ margin: "auto 0", textAlign: "center", fontSize: 36, fontWeight: 600, color: C.sub2, lineHeight: 1.5, position: "relative" }}>الغرفة جاهزة<br />للمراجِعة القادمة</div> : <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: tv.board.length > 3 ? 170 : 240, fontWeight: 500, lineHeight: 1, color: C.accent, textAlign: "center", margin: "14px 0 0", letterSpacing: -6, position: "relative", textShadow: "0 14px 30px rgba(123,70,135,0.15)" }}>{b.cur}
          </div>}
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderRadius: 32, background: "linear-gradient(135deg,#F9F3FA,#F2E4F5)", border: "1px solid #FFFFFF", position: "relative" }}>
            <span style={{ fontSize: 30, fontWeight: 600, color: C.sub }}>نُودي
            </span>
            <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 72, fontWeight: 500, color: C.ink, lineHeight: 1 }}>{b.next}
            </span>
          </div>
        </div>
        ))}
        <div style={{ backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", borderRadius: 48, padding: "36px 44px", color: C.white, position: "relative", overflow: "hidden", width: 400, flexShrink: 0, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
          <svg width="220" height="220" viewBox="0 0 160 160" style={{ position: "absolute", top: -60, left: -60 }}>
            <circle cx="80" cy="80" r="78" fill="none" stroke="#7C5485" strokeWidth="1" />
            <circle cx="80" cy="80" r="56" fill="none" stroke="#7C5485" strokeWidth="1" />
          </svg>
          <div style={{ position: "relative", fontSize: 34, fontWeight: 700, marginBottom: 8 }}>نُودي
          </div>
          {tv.next.length === 0 && <div style={{ position: "relative", fontSize: 28, color: C.onDark, lineHeight: 1.6 }}>سننادي الأرقام هنا تباعاً</div>}
          {tv.next.slice(0, 5).map((a, i) => (
          <div key={a.queue_no} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: i === 0 ? "1px solid transparent" : "1px solid #7C5485", position: "relative" }}>
            <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: i === 0 ? 64 : 54, fontWeight: 500, lineHeight: 1 }}>{a.queue_no}
            </span>
            <span style={{ fontSize: 28, color: C.onDark }}>{a.room ?? ""}
            </span>
          </div>
          ))}
        </div>
      </div>
      {tip && <div style={{ height: 104, borderRadius: 52, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: SH, display: "flex", alignItems: "center", gap: 22, padding: "0 20px 0 40px", position: "relative", overflow: "hidden" }}>
        <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
          </svg>
        </span>
        <span style={{ fontSize: 26, fontWeight: 700, color: C.accentMid, whiteSpace: "nowrap" }}>نصيحة اليوم
        </span>
        <span style={{ width: 2, height: 40, background: C.border }} />
        <span style={{ fontSize: 30, fontWeight: 600, color: C.ink, flexGrow: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tip ? (tip.body || tip.title) : ""}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: C.sub, whiteSpace: "nowrap" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
          </svg>انتبهي لرقمكِ على الشاشة
        </span>
      </div>}
    </>
  );
}
