"use client";

/** P_Consent.dc.html — treatment consent: summary, yes/no health questions, finger signature pad. */
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, Icon, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, CARD, SHB } from "@/lib/tokens";
import { PKG_SERVICE } from "@/lib/mock/b";

const INFO = [
  { icon: "sparkle", t: "ما هو الإجراء", d: "تنظيف البشرة بعمق وإزالة الرؤوس السوداء والشوائب، ثم تقشير لطيف وقناع مهدّئ وترطيب." },
  { icon: "drop", t: "ما قد تشعرين به بعده", d: "احمرار خفيف مؤقت يزول عادةً خلال ساعات، وقد تبدو البشرة حساسة قليلاً ليوم أو يومين." },
  { icon: "list", t: "التعليمات", d: "تجنبي المكياج 24 ساعة، واستعملي واقي الشمس، ولا تلمسي البشرة أو تقشريها." },
];
const QS = ["هل لديكِ حساسية من أي مستحضر للعناية بالبشرة؟", "هل تستعملين حالياً علاجاً موضعياً للبشرة (مثل الريتينويد)؟", "هل يوجد التهاب أو جرح مفتوح في وجهكِ؟"];
const DEMO_SIG = "M14 48c10-2 18-20 26-30 6-8 10-6 8 4-3 14-10 26-6 28 5 2 12-16 18-18 4-1 2 12 6 13 6 1 10-12 16-12 5 0 2 10 8 10 8 0 14-14 22-14 6 0 4 9 10 9 10 0 20-12 34-14 10-1 20 2 30 0";

const seg = (on: boolean): CSSProperties => ({
  width: 46, height: 30, borderRadius: 15, border: "none", fontSize: 12.5, fontWeight: 700,
  ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: C.accent, boxShadow: "0 4px 10px rgba(150,100,170,0.28)" } : { background: "transparent", color: C.muted }),
});

export default function ConsentPage() {
  const [a, setA] = useState([1, 1, 1]);
  const [demo, setDemo] = useState(true); // the design opens with a sample signature
  const [strokes, setStrokes] = useState<string[]>([]);
  const drawing = useRef(false);
  const pad = useRef<SVGSVGElement>(null);
  const signed = demo || strokes.length > 0;

  const pt = (e: PointerEvent) => {
    const r = pad.current!.getBoundingClientRect();
    return `${Math.round(e.clientX - r.left)} ${Math.round(e.clientY - r.top)}`;
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (demo) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStrokes((s) => [...s, `M${pt(e)}`]);
  };
  const move = (e: PointerEvent) => {
    if (!drawing.current) return;
    setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]} L${pt(e)}`]);
  };

  return (
    <PhoneScreen>
      <TopBar title="نموذج الموافقة" back={R.P_Prescriptions} />

      <div style={{ ...CARD, borderRadius: 26, padding: "8px 16px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0 6px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{PKG_SERVICE.name}</div>
          <Tag kind="pink">اقرئي ثم وقّعي</Tag>
        </div>
        {INFO.map((x) => (
          <div key={x.t} style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
            <Circ icon={x.icon} size={32} iconSize={15} />
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{x.t}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{x.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, borderRadius: 26, padding: "4px 16px" }}>
        {QS.map((title, i) => (
          <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <div style={{ flexGrow: 1, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{title}</div>
            <div role="radiogroup" aria-label={title} style={{ display: "flex", gap: 4, padding: 3, borderRadius: 18, background: C.tint2, flexShrink: 0 }}>
              {["نعم", "لا"].map((l, v) => (
                <button key={l} type="button" role="radio" aria-checked={a[i] === v} onClick={() => setA(a.map((x, j) => (j === i ? v : x)))} style={seg(a[i] === v)}>{l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, borderRadius: 26, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>وقّعي هنا</div>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>{arDate(TODAY, { year: true })}</div>
          </div>
          <button type="button" onClick={() => { setDemo(false); setStrokes([]); }} disabled={!signed} style={{ height: 32, padding: "0 12px", borderRadius: 16, border: "none", background: C.white, boxShadow: SHB, fontSize: 12, fontWeight: 600, color: C.danger, display: "flex", alignItems: "center", gap: 4, opacity: signed ? 1 : 0.5 }}>
            <Icon name="refresh" color={C.danger} size={14} />امسحي
          </button>
        </div>
        <div style={{ position: "relative", height: 92, marginTop: 8, borderRadius: 18, border: "1.5px dashed #DDC9E1", background: "linear-gradient(180deg,#FFFFFF,#FBF5FC)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {demo ? (
            <svg width={220} height={70} viewBox="0 0 220 70" fill="none" role="img" aria-label="توقيعكِ">
              <path d={DEMO_SIG} stroke={C.accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M30 58c40-4 90-5 160-3" stroke={C.accentMid} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
            </svg>
          ) : (
            <>
              {strokes.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.muted, pointerEvents: "none" }}>
                  <Icon name="sign" color={C.muted} size={16} />ارسمي توقيعكِ بإصبعكِ
                </div>
              )}
              <svg ref={pad} role="img" aria-label="مساحة التوقيع" onPointerDown={down} onPointerMove={move} onPointerUp={() => (drawing.current = false)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }}>
                {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke={C.accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />)}
              </svg>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <PrimaryButton icon="sign" href={signed ? R.P_Prescriptions : undefined} disabled={!signed} style={{ width: "100%" }}>توقيع وإرسال</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
