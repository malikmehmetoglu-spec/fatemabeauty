"use client";

import { Suspense, useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Stage } from "@/components/shell";
import { EmptyState, ErrorNote } from "@/components/ui";
import { R } from "@/lib/routes";
import { isConsult, personName, savePhotoConsent } from "@/lib/db/queue";
import { BG, C, SH, SHB, ICON_FILL } from "@/lib/tokens";
import { ApptPicker, KC, NowText, StepHeader, T_PHOTO_CONSENT, apptLine, kioskError, setFlash, useApptParam, useKiosk } from "../kiosk";

/**
 * Reception tablet — consultations only: face-photo consent (step 3 of 4).
 * Signed → kind 'photo' (photos allowed by the database); declined → kind 'photo_declined' (consultation continues, no photos).
 */
const TERMS: { icon: string; text: string }[] = [
  { icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0", text: "تُلتقط صور الوجه فقط — لا تُصوَّر أي منطقة أخرى من الجسم." },
  { icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2", text: "تُحفظ الصور في ملفكِ الخاص لمتابعة خطتكِ العلاجية ومقارنة النتائج فقط." },
  { icon: "M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 11V7a4 4 0 1 1 8 0v4", text: "لا تُشارَك ولا تُنشَر في أي مكان دون إذن خطّي منفصل منكِ." },
  { icon: "M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3", text: "يحق لكِ طلب حذف صوركِ في أي وقت." },
];

function signaturePng(strokes: string[]): Promise<Blob> {
  const k = 2, c = document.createElement("canvas");
  c.width = 426 * k; c.height = 220 * k;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, c.width, c.height);
  g.scale(k, k); g.strokeStyle = "#35213D"; g.lineWidth = 4; g.lineCap = "round"; g.lineJoin = "round";
  strokes.forEach((d) => g.stroke(new Path2D(d)));
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("تعذّر حفظ التوقيع"))), "image/png"));
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const k = useKiosk();
  const router = useRouter();
  const f = useApptParam(!k.gate);
  const [agree, setAgree] = useState(false);
  const [strokes, setStrokes] = useState<string[]>([]);
  const [busy, setBusy] = useState<"sign" | "decline" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const padRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  const pt = (e: PointerEvent<SVGSVGElement>) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(padRef.current!.getScreenCTM()!.inverse());
    return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  };
  const down = (e: PointerEvent<SVGSVGElement>) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); setStrokes([...strokes, `M${pt(e)}`]); };
  const move = (e: PointerEvent<SVGSVGElement>) => { if (!drawing.current) return; const p = pt(e); setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]}L${p}`]); };
  const up = () => { drawing.current = false; };

  if (k.gate) return k.gate;
  const A = f.appt;
  if (!A) return <ApptPicker title="موافقة التصوير" today={f.today} loading={f.loading} error={f.error} path={T_PHOTO_CONSENT} />;
  if (!isConsult(A)) {
    return (
      <Stage fluid width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>
        <StepHeader back={R.T_Desk} title="موافقة التصوير" sub={apptLine(A)} />
        <div style={{ margin: "auto", maxWidth: 560 }}>
          <EmptyState icon="camera" title="لا تصوير في جلسات العناية" text="سياسة المركز: صور الوجه تُلتقط في الاستشارات فقط وبموافقة خاصة. هذه الجلسة لا تحتاج أي صور." />
        </div>
      </Stage>
    );
  }
  const signed = strokes.length > 0;
  const ready = agree && signed && !busy;
  const answers = (accepted: boolean) => ({ accepted, scope: "face", terms: TERMS.map((t) => t.text), by: k.staff?.name ?? null });
  const sign = async () => {
    setBusy("sign"); setErr(null);
    try {
      await savePhotoConsent(A, await signaturePng(strokes), answers(true));
      router.push(`${R.T_Photos}?id=${A.id}`);
    } catch (e) { setErr(kioskError(e)); setBusy(null); }
  };
  const decline = async () => {
    setBusy("decline"); setErr(null);
    try {
      await savePhotoConsent(A, null, answers(false));
      setFlash(`اكتمل تجهيز ${personName(A)} — بدون صور`);
      router.push(R.T_Desk);
    } catch (e) { setErr(kioskError(e)); setBusy(null); }
  };
  const box = { width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    ...(agree ? { background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)" } : { background: C.white, border: "1.5px solid #DAC7DE", boxSizing: "border-box" as const }) };
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>
      <StepHeader back={`${R.T_Consent}?id=${A.id}`} title="موافقة التصوير" sub={apptLine(A)} flow={{ step: 3, consult: true }} />
      <div className={KC.cols} style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, borderRadius: 32, padding: "22px 26px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>موافقة على تصوير الوجه</div>
            <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: ICON_FILL, color: C.accent }}>اختيارية</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.7, color: C.sub }}>نلتقط صوراً لوجهكِ في الاستشارة لنقارن تقدّم بشرتكِ في المراجعات القادمة. الموافقة اختيارية تماماً، ورفضها لا يؤثر على استشارتكِ.</div>
          {TERMS.map((t) => (
            <div key={t.text} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
              </span>
              <div style={{ fontSize: 17, lineHeight: 1.6, paddingTop: 6 }}>{t.text}</div>
            </div>
          ))}
          <button type="button" onClick={decline} disabled={!!busy} style={{ marginTop: "auto", alignSelf: "flex-start", maxWidth: "100%", minHeight: 52, padding: "10px 22px", lineHeight: 1.4, borderRadius: 26, border: "1px solid #EADCF0", background: C.white, boxShadow: SHB, color: C.sub, fontSize: 16, fontWeight: 700, fontFamily: "inherit", opacity: busy ? 0.6 : 1 }}>
            {busy === "decline" ? "جارٍ الحفظ…" : "لا أوافق — متابعة بدون صور"}
          </button>
        </div>
        <div className={KC.side} style={{ width: 440, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 32, padding: "20px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>توقيعكِ</div>
              <button type="button" onClick={() => setStrokes([])} style={{ height: 48, padding: "0 18px", borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.danger, fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>مسح</button>
            </div>
            <div role="img" aria-label="لوحة التوقيع" style={{ flexGrow: 1, minHeight: 200, borderRadius: 24, background: "linear-gradient(180deg,#FFFFFF,#FAF5FB)", border: "1.5px dashed #DDCAE2", position: "relative", overflow: "hidden" }}>
              <svg ref={padRef} width="100%" height="100%" viewBox="0 0 426 220" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, touchAction: "none", cursor: "crosshair" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
                <line x1="40" y1="172" x2="386" y2="172" stroke="#E4D6E8" strokeWidth="1.5" />
                {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="#7B4687" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />)}
              </svg>
              <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 13, color: C.muted }}>وقّعي بإصبعكِ داخل الإطار</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15, color: C.sub }}>
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{personName(A)}</span>
              <span style={{ whiteSpace: "nowrap" }}><NowText part="date" /></span>
            </div>
            <button type="button" role="checkbox" aria-checked={agree} onClick={() => setAgree(!agree)} style={{ display: "flex", alignItems: "center", gap: 12, border: "none", background: "transparent", padding: "4px 0", fontFamily: "inherit", fontSize: 16, fontWeight: 600, color: C.ink, textAlign: "right", minHeight: 48 }}>
              <span style={box}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg></span>
              أوافق على تصوير وجهي فقط للأغراض المذكورة
            </button>
          </div>
          {err && <ErrorNote>{err}</ErrorNote>}
          <button type="button" onClick={sign} disabled={!ready} style={{ height: 66, borderRadius: 33, border: "none", color: C.white, fontSize: 20, fontWeight: 600, fontFamily: "inherit", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0) 45%,rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", opacity: ready ? 1 : 0.45 }}>
            {busy === "sign" ? "جارٍ الحفظ…" : "توقيع والانتقال إلى صور الوجه"}
          </button>
        </div>
      </div>
    </Stage>
  );
}
