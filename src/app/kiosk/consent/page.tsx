"use client";
 

import { useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { APPOINTMENTS_TODAY, NOW, TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";
import { css } from "../css";
import { BG, C, SH, SHB, ICON_FILL } from "@/lib/tokens";

/** T_Consent.dc.html */
/** The patient signing: today's 12:30 peel in room 2. */
const A = APPOINTMENTS_TODAY.find((a) => a.time === "12:30" && a.room === "غرفة 2")!;
const SAMPLE = [
  "M70 190c18-40 30-92 52-92 18 0 4 70-6 96 22-30 44-66 64-66 14 0-2 44 6 44 12 0 30-40 46-40 12 0 6 30 16 30s26-24 40-24c10 0 4 22 14 22 14 0 36-34 62-34",
  "M260 176c22 10 52 12 96 2",
];
const seg = (on: boolean, yes: boolean) => css("width:84px;height:56px;border-radius:28px;border:none;font-family:inherit;font-size:17px;font-weight:700;" +
  (on ? (yes ? "background:linear-gradient(145deg,#C9A2D8,#7B4687);color:#FFFFFF;box-shadow:0 8px 16px rgba(123,70,135,0.32)"
    : "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);color:#7B4687;box-shadow:0 8px 16px rgba(150,100,170,0.25)")
    : "background:transparent;color:#A595AC"));

/** Reception tablet: treatment consent with health questions and a finger signature. */
export default function Page() {
  const [ans, setAns] = useState([false, false, false]);
  const [agree, setAgree] = useState(true);
  const [strokes, setStrokes] = useState<string[]>(SAMPLE);
  const padRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const pt = (e: PointerEvent<SVGSVGElement>) => {
    const svg = padRef.current!, m = svg.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const start = strokes === SAMPLE ? [] : strokes;
    setStrokes([...start, `M${pt(e)}`]);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return;
    const p = pt(e);
    setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]}L${p}`]);
  };
  const up = () => { drawing.current = false; };
  const qs = ans.map((_, i) => ({
    yes: () => setAns(ans.map((x, j) => (j === i ? true : x))), no: () => setAns(ans.map((x, j) => (j === i ? false : x))),
    yStyle: seg(ans[i], true), nStyle: seg(!ans[i], false),
  }));
  const anyYes = ans.some(Boolean);
  const toggleAgree = () => setAgree(!agree);
  const boxStyle = css("width:32px;height:32px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;" +
    (agree ? "background:linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 12px rgba(123,70,135,0.30)" : "background:#FFFFFF;border:1.5px solid #DAC7DE;box-sizing:border-box"));
  const btnStyle = css("height:66px;border-radius:33px;border:none;color:#FFFFFF;font-size:20px;font-weight:600;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:10px;" +
    "background-color:#7B4687;background-image:linear-gradient(145deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0) 45%,rgba(0,0,0,0.20) 100%);box-shadow:0 16px 34px rgba(123,70,135,0.32),inset 0 1px 0 rgba(255,255,255,0.25);" + (agree ? "" : "opacity:0.45;pointer-events:none"));
  return (
    <Stage width={1194} height={834}  background={BG} padding="36px 40px 32px" direction="column" gap={20}>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <Link href={R.T_Eligibility} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        <div style={{ lineHeight: 1.3, flexGrow: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>توقيع الموافقة
          </div>
          <div style={{ fontSize: 15, color: C.sub2 }}>{A.name}
            <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
            </span>{" "}· {A.serviceName} · {A.room} · {A.time} · مع {A.specialist}
            <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
            </span>
          </div>
        </div>
        <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
          </svg>
          <span>{arDate(TODAY)}
          </span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}>{NOW}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 32, padding: "22px 26px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>موافقة على جلسة {A.serviceName}
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>اقرئي قبل التوقيع
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                </svg>
              </span>
              <div style={{ fontSize: 17, lineHeight: 1.6, paddingTop: 6 }}>يزيل التقشير الطبقة السطحية من البشرة ليساعد على تجديدها وتوحيد لونها.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" />
                </svg>
              </span>
              <div style={{ fontSize: 17, lineHeight: 1.6, paddingTop: 6 }}>قد تشعرين بوخز أو حرارة خفيفة أثناء الجلسة، وهذا متوقع.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
                </svg>
              </span>
              <div style={{ fontSize: 17, lineHeight: 1.6, paddingTop: 6 }}>الاحمرار والتقشّر الخفيف لأيام قليلة بعد الجلسة أمر طبيعي — استخدمي واقي الشمس يومياً.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 14.5a1.6 1.6 0 0 1 2.6-1.8L7 13" />
                </svg>
              </span>
              <div style={{ fontSize: 17, lineHeight: 1.6, paddingTop: 6 }}>يمكنكِ طلب إيقاف الجلسة في أي لحظة.
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 32, padding: "14px 26px 10px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            <div style={{ fontSize: 19, fontWeight: 700, padding: "4px 0 6px" }}>قبل أن نبدأ
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 66 }}>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>هل أنتِ حامل أو مرضعة؟
                </div>
              </div>
              <div role="group" aria-label="هل أنتِ حامل أو مرضعة؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
                <button type="button" aria-pressed={ans[0]} onClick={qs[0].yes} style={qs[0].yStyle}>نعم
                </button>
                <button type="button" aria-pressed={!ans[0]} onClick={qs[0].no} style={qs[0].nStyle}>لا
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 66, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>هل في وجهكِ جرح أو التهاب الآن؟
                </div>
              </div>
              <div role="group" aria-label="هل في وجهكِ جرح أو التهاب الآن؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
                <button type="button" aria-pressed={ans[1]} onClick={qs[1].yes} style={qs[1].yStyle}>نعم
                </button>
                <button type="button" aria-pressed={!ans[1]} onClick={qs[1].no} style={qs[1].nStyle}>لا
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 66, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>هل استخدمتِ ريتينول أو مقشّراً هذا الأسبوع؟
                </div>
              </div>
              <div role="group" aria-label="هل استخدمتِ ريتينول أو مقشّراً هذا الأسبوع؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
                <button type="button" aria-pressed={ans[2]} onClick={qs[2].yes} style={qs[2].yStyle}>نعم
                </button>
                <button type="button" aria-pressed={!ans[2]} onClick={qs[2].no} style={qs[2].nStyle}>لا
                </button>
              </div>
            </div>
            {anyYes && (<>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 4px", padding: "12px 16px", borderRadius: 18, background: "#FCF1DE", color: "#8A5A12", fontSize: 15, fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A5A12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
                </svg>شكراً لصراحتكِ — ستراجع الأخصائية إجابتكِ معكِ قبل البدء.
              </div>
            </>)}
          </div>
        </div>
        <div style={{ width: 470, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 32, padding: "20px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>توقيعكِ
              </div>
              <button type="button" onClick={() => setStrokes([])} style={{ height: 48, padding: "0 18px", borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.danger, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#B03D6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>مسح
              </button>
            </div>
            <div role="img" aria-label="لوحة التوقيع" style={{ flexGrow: 1, minHeight: 220, borderRadius: 24, background: "linear-gradient(180deg,#FFFFFF,#FAF5FB)", border: "1.5px dashed #DDCAE2", position: "relative", overflow: "hidden" }}>
              <svg ref={padRef} width="100%" height="100%" viewBox="0 0 426 260" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "0", touchAction: "none", cursor: "crosshair" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
                <line x1="40" y1="208" x2="386" y2="208" stroke="#E4D6E8" strokeWidth="1.5" />
                <path d="M370 194l14 14M384 194l-14 14" stroke="#CFB9D4" strokeWidth="2" strokeLinecap="round" />
                {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="#7B4687" strokeWidth={i === 1 && d === SAMPLE[1] ? 3.5 : 4.5} strokeLinecap="round" strokeLinejoin="round" />)}
              </svg>
              <div style={{ position: "absolute", bottom: 12, left: "0", right: "0", textAlign: "center", fontSize: 13, color: C.muted }}>وقّعي بإصبعكِ داخل الإطار
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: C.sub }}>
              <span>{A.name}
                <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                </span>
              </span>
              <span>{arDate(TODAY, { year: true })}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 20, background: "#F8F2FA" }}>
              <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.accent }}>ه ع
              </span>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>الشاهدة
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{A.specialist}
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
              </div>
            </div>
            <button type="button" role="checkbox" aria-checked={agree} onClick={toggleAgree} style={{ display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", padding: "4px 0", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: C.ink, textAlign: "right", minHeight: 48 }}>
              <span style={boxStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>قرأتُ المعلومات وفهمتُها، وأوافق على الجلسة
            </button>
          </div>
          <Link href={R.T_Photos} style={btnStyle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 19h18M5 15c2-2 3.5-5 3.5-7.5C8.5 5.5 7.8 5 7 5S5 6 5 8c0 3 3 5 5 7 1.5-2 2.5-3 3.5-3s1 2 2 2 1.5-1 2.5-1" />
            </svg>توقيع
          </Link>
        </div>
      </div>

    </Stage>
  );
}

