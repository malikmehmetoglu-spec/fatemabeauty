"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stage } from "@/components/shell";
import { C } from "@/lib/tokens";
import { BoardView } from "../BoardView";
import { SoundUnlock, speakCall, useTv } from "../tv";

const SHOW_S = 25;

/** TV_Call.dc.html + Piece-jjwl.dc.html — waiting-room screen while a number is being called. */
export default function Page() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const tv = useTv();
  const router = useRouter();
  const back = useSearchParams().get("back");
  const CALL = tv.last;
  const spoken = useRef<string | null>(null);
  const settings = useRef(tv.call); settings.current = tv.call;
  // Speak whenever a new called_at appears (and on arrival if the call is fresh).
  useEffect(() => {
    // only newer calls are spoken (when the latest visit finishes, the card falls back to an older call silently)
    if (!CALL?.called_at || (spoken.current !== null && CALL.called_at <= spoken.current)) return;
    const first = spoken.current === null;
    spoken.current = CALL.called_at;
    if (first && Date.now() - new Date(CALL.called_at).getTime() > 60000) return;
    speakCall(CALL.queue_no, CALL.room, settings.current);
  }, [CALL?.called_at, CALL?.queue_no, CALL?.room]);
  // Return to the board after a while when we were switched here automatically.
  useEffect(() => {
    if (!back || !CALL?.called_at) return;
    const left = SHOW_S * 1000 - (Date.now() - new Date(CALL.called_at).getTime());
    const t = setTimeout(() => router.replace(back), Math.max(5000, left));
    return () => clearTimeout(t);
  }, [back, CALL?.called_at, router]);
  const roomNo = CALL?.room ? CALL.room.replace(/^غرفة\s*/, "") : "";
  return (
    <Stage width={1920} height={1080}  padding="0" direction="column" gap={0}>

      <div style={{ position: "absolute", inset: "0", padding: "60px 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 40, opacity: 0.32, filter: "blur(3px) saturate(0.7)", pointerEvents: "none" }} aria-hidden="true">
        <BoardView tv={tv} />
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
              <div style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 330, fontWeight: 500, lineHeight: 0.95, letterSpacing: -10, textShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>{CALL?.queue_no ?? "—"}
              </div>
              <div style={{ marginBottom: 40, height: 84, padding: "0 36px", borderRadius: 42, background: "linear-gradient(145deg,#FFFFFF,#E8D0ED)", color: C.accent, fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 14px 30px rgba(0,0,0,0.22)" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>{CALL?.room ?? "—"}
              </div>
            </div>
            <div style={{ height: 2, background: "#7C5485", margin: "30px 0 26px", width: "100%" }} />
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.25 }}>{CALL ? `تفضّلي إلى ${CALL.room ?? "الاستقبال"}` : "لا نداء بعد اليوم"}
            </div>
            <div dir="ltr" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 44, fontWeight: 500, color: C.onDark, textAlign: "right", marginTop: 8 }}>{CALL ? (roomNo && /^\d+$/.test(roomNo) ? `Please proceed to Room ${roomNo}` : "Please proceed") : "No calls yet today"}
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
      <SoundUnlock settings={tv.call} />
    </Stage>
  );
}

