"use client";

/** P_BeforeAfter.dc.html — before/after comparison with a draggable divider, angle chips and session picker. */
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Chip, Circ, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS, PERSONA } from "@/lib/data";
import { C, GLASS, SH_SOFT } from "@/lib/tokens";

const ANGLES = ["أمامي", "جانبي 45°", "جانبي 90°"];
/** Keep "45°" left-to-right inside the Arabic label. */
const angleText = (a: string) => { const [w, d] = a.split(" "); return d ? <>{w} <bdi dir="ltr">{d}</bdi></> : a; };
const TONES = ["#D9A88C", "#E2B49A", "#EBC4AD"];
const DATES = PERSONA.sessions.map((d) => `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`);
const LABEL: CSSProperties = { ...GLASS, position: "absolute", top: 14, height: 30, padding: "0 12px", borderRadius: 15, display: "flex", alignItems: "center", fontSize: 12.5, fontWeight: 700, color: C.accent, boxShadow: "0 6px 14px rgba(53,33,61,0.12)", whiteSpace: "nowrap" };

export default function BeforeAfterPage() {
  const [angle, setAngle] = useState(0);
  const [after, setAfter] = useState(DATES.length - 1);
  const [split, setSplit] = useState(50); // % from the left edge where "after" ends
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = (e: PointerEvent) => {
    if (!dragging.current || !box.current) return;
    const r = box.current.getBoundingClientRect();
    setSplit(Math.min(90, Math.max(10, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <PhoneScreen>
      <TopBar title="صور قبل وبعد" back={R.Journey} />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {ANGLES.map((a, i) => <Chip key={a} selected={angle === i} onClick={() => setAngle(i)}>{angleText(a)}</Chip>)}
      </div>

      <div ref={box} onPointerMove={move} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}
        style={{ height: 380, borderRadius: 32, position: "relative", overflow: "hidden", border: "3px solid #FFFFFF", boxShadow: "0 18px 40px rgba(123,70,135,0.18)", touchAction: "none" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: `${100 - split}%`, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, bottom: -30, right: -30, width: 420, background: "radial-gradient(ellipse at 60% 40%, #E9C2A8 0%, #D9A88C 45%, #C98F78 100%)", filter: "blur(14px)" }} />
          <span style={{ ...LABEL, right: 14 }}>قبل — {DATES[0]}</span>
        </div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${split}%`, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, bottom: -30, left: -30, width: 420, background: "radial-gradient(ellipse at 40% 40%, #F3D6C3 0%, #E8BFA6 50%, #D9AA92 100%)", filter: "blur(14px)" }} />
          <span style={{ ...LABEL, left: 14 }}>بعد — {DATES[after]}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(123,70,135,0.12) 100%)", pointerEvents: "none" }} />
        <svg width={300} height={300} viewBox="0 0 300 300" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-46%)", pointerEvents: "none" }}>
          <path d="M150 46c-38 0-62 30-62 74 0 52 30 92 62 92s62-40 62-92c0-44-24-74-62-74z" />
          <path d="M118 206c0 18-6 28-34 38-26 9-44 22-50 56M182 206c0 18 6 28 34 38 26 9 44 22 50 56" />
        </svg>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${split}%`, width: 3, marginLeft: -1.5, background: "#FFFFFF", boxShadow: "0 0 12px rgba(53,33,61,0.25)", pointerEvents: "none" }} />
        <button type="button" aria-label="اسحبي للمقارنة" onPointerDown={(e) => { dragging.current = true; (e.target as Element).releasePointerCapture?.(e.pointerId); }}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") setSplit((s) => Math.max(10, s - 5)); if (e.key === "ArrowRight") setSplit((s) => Math.min(90, s + 5)); }}
          style={{ position: "absolute", left: `${split}%`, top: "50%", transform: "translate(-50%,-50%)", width: 50, height: 50, borderRadius: 25, border: "3px solid #FFFFFF", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 10px 24px rgba(123,70,135,0.35)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "ew-resize", touchAction: "none" }}>
          <Icon name="M12 3v18M16 7l4 5-4 5M8 7l-4 5 4 5" color="#FFFFFF" size={22} stroke={2} />
        </button>
        <span style={{ ...GLASS, position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", height: 30, padding: "0 12px", borderRadius: 15, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.accent, whiteSpace: "nowrap" }}>
          <Icon name="eye" color={C.accent} size={15} />الزاوية: {angleText(ANGLES[angle])}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink }}>جلساتكِ</h2>
        <span style={{ fontSize: 12, color: C.sub2 }}>اختاري صورة «بعد»</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {DATES.map((date, i) => {
          const before = i === 0, on = after === i;
          return (
            <button key={date} type="button" aria-label={`الجلسة ${i + 1} · ${date}`} aria-pressed={on} onClick={() => i > 0 && setAfter(i)} style={{
              flex: 1, minWidth: 0, borderRadius: 22, padding: "8px 8px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              ...(on ? { background: "linear-gradient(160deg,#F9F2FB,#ECD8F1)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.26)" }
                : { background: "#FFFFFF", border: `1px solid ${C.borderSoft}`, boxShadow: "0 8px 20px rgba(123,70,135,0.07)" }),
            }}>
              <span style={{ width: "100%", height: 58, borderRadius: 15, display: "block", background: `radial-gradient(ellipse at 50% 40%,#F6E0D2 0%,${TONES[i]} 80%)`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.3, whiteSpace: "nowrap" }}>{date}</span>
              <span style={{
                height: 20, padding: "0 9px", borderRadius: 10, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center",
                ...(before ? { background: "#F0EDF0", color: "#695D6B" } : on ? { background: C.accent, color: C.white } : { background: C.tint, color: C.danger }),
              }}>{before ? "قبل" : on ? "بعد" : `الجلسة ${i + 1}`}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", borderRadius: 22, padding: "12px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 12 }}>
        <Circ icon="lock" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>صوركِ خاصة بكِ</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>لا يراها إلا أنتِ وأخصائيتكِ {PERSONA.specialist}</div>
        </div>
      </div>
    </PhoneScreen>
  );
}
