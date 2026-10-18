"use client";
/* eslint-disable @next/next/no-img-element */

import { Stage } from "@/components/shell";
import { APPOINTMENTS_TODAY, NOW, ROOMS, TODAY } from "@/lib/data";
import { arDate, dayName } from "@/lib/format";
import { C, SH, ICON_FILL, LOGO } from "@/lib/tokens";

const UPCOMING = APPOINTMENTS_TODAY.filter((a) => a.status === "في الانتظار" || a.status === "مؤكد" || a.status === "بانتظار التأكيد");
const BOARD = ROOMS.map((room) => ({
  room,
  cur: APPOINTMENTS_TODAY.find((a) => a.room === room && a.status === "في الجلسة")?.queueNo ?? "—",
  next: UPCOMING.find((a) => a.room === room)?.queueNo ?? "—",
}));
const NEXT = UPCOMING.slice(0, 5);
/** The number being called: the latest session to start (12:30, room 2). */
const CALL = APPOINTMENTS_TODAY.filter((a) => a.status === "في الجلسة").at(-1)!;

/** TV_Call.dc.html + Piece-jjwl.dc.html — waiting-room screen while a number is being called. */
export default function Page() {
  return (
    <Stage width={1920} height={1080}  padding="0" direction="column" gap={0}>

      <div style={{ position: "absolute", inset: "0", padding: "60px 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 40, opacity: 0.32, filter: "blur(3px) saturate(0.7)", pointerEvents: "none" }} aria-hidden="true">
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
            <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 56, fontWeight: 500, color: C.accent, letterSpacing: 1 }}>{NOW}
            </div>
            <span style={{ width: 2, height: 46, background: C.border }} />
            <div style={{ fontSize: 26, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{dayName(TODAY)}
              <br />
              <span style={{ fontWeight: 500, color: C.sub }}>{arDate(TODAY, { day: false, year: true })}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, flexGrow: 1, minHeight: "0", position: "relative" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 48, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "36px 40px 34px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -120, left: -120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,214,240,0.7) 0%, rgba(232,214,240,0) 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
              <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <span style={{ fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>{BOARD[0].room}
              </span>
            </div>
            <div style={{ alignSelf: "center", marginTop: 34, height: 50, padding: "0 24px", borderRadius: 25, background: "#FBEAF1", color: C.danger, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", position: "relative" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: "#9B4FB0", boxShadow: "0 0 0 5px rgba(155,79,176,0.18)" }} />في الجلسة
            </div>
            <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 240, fontWeight: 500, lineHeight: 1, color: C.accent, textAlign: "center", margin: "14px 0 0", letterSpacing: -6, position: "relative", textShadow: "0 14px 30px rgba(123,70,135,0.15)" }}>{BOARD[0].cur}
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderRadius: 32, background: "linear-gradient(135deg,#F9F3FA,#F2E4F5)", border: "1px solid #FFFFFF", position: "relative" }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: C.sub }}>التالي
              </span>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 72, fontWeight: 500, color: C.ink, lineHeight: 1 }}>{BOARD[0].next}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 48, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "36px 40px 34px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -120, left: -120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,214,240,0.7) 0%, rgba(232,214,240,0) 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
              <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <span style={{ fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>{BOARD[1].room}
              </span>
            </div>
            <div style={{ alignSelf: "center", marginTop: 34, height: 50, padding: "0 24px", borderRadius: 25, background: "#FBEAF1", color: C.danger, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", position: "relative" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: "#9B4FB0", boxShadow: "0 0 0 5px rgba(155,79,176,0.18)" }} />في الجلسة
            </div>
            <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 240, fontWeight: 500, lineHeight: 1, color: C.accent, textAlign: "center", margin: "14px 0 0", letterSpacing: -6, position: "relative", textShadow: "0 14px 30px rgba(123,70,135,0.15)" }}>{BOARD[1].cur}
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderRadius: 32, background: "linear-gradient(135deg,#F9F3FA,#F2E4F5)", border: "1px solid #FFFFFF", position: "relative" }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: C.sub }}>التالي
              </span>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 72, fontWeight: 500, color: C.ink, lineHeight: 1 }}>{BOARD[1].next}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 48, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "36px 40px 34px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -120, left: -120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,214,240,0.7) 0%, rgba(232,214,240,0) 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
              <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <span style={{ fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>{BOARD[2].room}
              </span>
            </div>
            <div style={{ alignSelf: "center", marginTop: 34, height: 50, padding: "0 24px", borderRadius: 25, background: "#FBEAF1", color: C.danger, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap", position: "relative" }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: "#9B4FB0", boxShadow: "0 0 0 5px rgba(155,79,176,0.18)" }} />في الجلسة
            </div>
            <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 240, fontWeight: 500, lineHeight: 1, color: C.accent, textAlign: "center", margin: "14px 0 0", letterSpacing: -6, position: "relative", textShadow: "0 14px 30px rgba(123,70,135,0.15)" }}>{BOARD[2].cur}
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderRadius: 32, background: "linear-gradient(135deg,#F9F3FA,#F2E4F5)", border: "1px solid #FFFFFF", position: "relative" }}>
              <span style={{ fontSize: 30, fontWeight: 600, color: C.sub }}>التالي
              </span>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 72, fontWeight: 500, color: C.ink, lineHeight: 1 }}>{BOARD[2].next}
              </span>
            </div>
          </div>
          <div style={{ width: 400, flexShrink: 0, boxSizing: "border-box", borderRadius: 48, padding: "36px 44px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: SH, color: C.ink }}>
            <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 8 }}>التالي
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid transparent", position: "relative" }}>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 64, fontWeight: 500, lineHeight: 1 }}>{NEXT[0].queueNo}
              </span>
              <span style={{ fontSize: 28, color: C.sub }}>{NEXT[0].room}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #E9DCEE", position: "relative" }}>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 54, fontWeight: 500, lineHeight: 1 }}>{NEXT[1].queueNo}
              </span>
              <span style={{ fontSize: 28, color: C.sub }}>{NEXT[1].room}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #E9DCEE", position: "relative" }}>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 54, fontWeight: 500, lineHeight: 1 }}>{NEXT[2].queueNo}
              </span>
              <span style={{ fontSize: 28, color: C.sub }}>{NEXT[2].room}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #E9DCEE", position: "relative" }}>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 54, fontWeight: 500, lineHeight: 1 }}>{NEXT[3].queueNo}
              </span>
              <span style={{ fontSize: 28, color: C.sub }}>{NEXT[3].room}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #E9DCEE", position: "relative" }}>
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 54, fontWeight: 500, lineHeight: 1 }}>{NEXT[4].queueNo}
              </span>
              <span style={{ fontSize: 28, color: C.sub }}>{NEXT[4].room}
              </span>
            </div>
          </div>
        </div>
        <div style={{ height: 104, borderRadius: 52, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: SH, display: "flex", alignItems: "center", gap: 22, padding: "0 20px 0 40px", position: "relative", overflow: "hidden" }}>
          <span style={{ width: 72, height: 72, borderRadius: 36, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="33" height="33" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
            </svg>
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: C.accentMid, whiteSpace: "nowrap" }}>نصيحة اليوم
          </span>
          <span style={{ width: 2, height: 40, background: C.border }} />
          <span style={{ fontSize: 30, fontWeight: 600, color: C.ink, flexGrow: 1, whiteSpace: "nowrap" }}>ضعي واقي الشمس كل صباح، حتى في الأيام الغائمة والشتاء.
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: C.sub, whiteSpace: "nowrap" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
            </svg>انتبهي لرقمكِ على الشاشة
          </span>
        </div>
      </div>
      <div style={{ position: "absolute", inset: "0", background: "radial-gradient(ellipse at 50% 50%, rgba(249,245,250,0.2) 0%, rgba(240,224,244,0.55) 100%)", zIndex: 1 }} />

      {/* Piece-jjwl.dc.html — the glowing call card centred over the dimmed board */}
      <div role="alert" aria-live="assertive" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <div style={{ position: "absolute", width: 1500, height: 900, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(222,179,232,0.55) 0%, rgba(222,179,232,0) 65%)" }} />
        <div style={{ width: 1320, borderRadius: 64, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 40px 120px rgba(123,70,135,0.45), 0 0 0 10px rgba(255,255,255,0.35), 0 0 140px rgba(208,153,220,0.65), inset 0 1px 0 rgba(255,255,255,0.3)", color: C.white, position: "relative", overflow: "hidden", padding: "64px 80px", display: "flex", alignItems: "center", gap: 60 }}>
          <div style={{ position: "absolute", bottom: -200, right: -160, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,160,220,0.40) 0%, rgba(200,160,220,0) 70%)" }} />
          <svg width="460" height="460" viewBox="0 0 160 160" style={{ position: "absolute", top: -150, left: -150 }}>
            <circle cx="80" cy="80" r="78" fill="none" stroke="#7C5485" strokeWidth="0.6" />
            <circle cx="80" cy="80" r="56" fill="none" stroke="#7C5485" strokeWidth="0.6" />
          </svg>
          <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, color: C.onDark, fontWeight: 600 }}>الرقم
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
              <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 330, fontWeight: 500, lineHeight: 0.95, letterSpacing: -10, textShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>{CALL.queueNo}
              </div>
              <div style={{ marginBottom: 40, height: 84, padding: "0 36px", borderRadius: 42, background: "linear-gradient(145deg,#FFFFFF,#E8D0ED)", color: C.accent, fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 14px 30px rgba(0,0,0,0.22)" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>{CALL.room}
              </div>
            </div>
            <div style={{ height: 2, background: "#7C5485", margin: "30px 0 26px", width: "100%" }} />
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.25 }}>تفضّلي إلى {CALL.room}
            </div>
            <div dir="ltr" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 44, fontWeight: 500, color: C.onDark, textAlign: "right", marginTop: 8 }}>Please proceed to Room {CALL.room.replace("غرفة ", "")}
            </div>
          </div>
          <div style={{ position: "relative", width: 330, height: 330, flexShrink: 0 }}>
            <svg width="330" height="330" viewBox="-165 -165 330 330" style={{ position: "absolute", inset: "0" }} aria-hidden="true">
              <circle cx="0" cy="0" r="86" fill="none" stroke="#E8D6F0" strokeWidth="3" opacity="0.55" />
              <circle cx="0" cy="0" r="122" fill="none" stroke="#E8D6F0" strokeWidth="2.5" opacity="0.35" />
              <circle cx="0" cy="0" r="158" fill="none" stroke="#E8D6F0" strokeWidth="2" opacity="0.2" />
              <circle r="62" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            </svg>
            <span style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
              </svg>
            </span>
          </div>
        </div>

      </div>
    </Stage>
  );
}

