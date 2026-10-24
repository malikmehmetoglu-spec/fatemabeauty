"use client";

/** Photo-consent text + finger signature (consents.kind = 'photo'). Shared by the intake form and the written consultation. */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ErrorNote, Icon } from "@/components/ui";
import { PHOTO_TERMS, signPhotoConsent } from "@/lib/db/intake";
import { C, SHB } from "@/lib/tokens";
import css from "./intake.module.css";

function signaturePng(strokes: string[]): Promise<Blob> {
  const k = 2, c = document.createElement("canvas");
  c.width = 340 * k; c.height = 150 * k;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, c.width, c.height);
  g.scale(k, k); g.strokeStyle = "#35213D"; g.lineWidth = 3.5; g.lineCap = "round"; g.lineJoin = "round";
  strokes.forEach((d) => g.stroke(new Path2D(d)));
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("تعذّر حفظ التوقيع"))), "image/png"));
}

export function ConsentPad({ appt, name, onDone }: { appt: { patient_id: string | null; id: string | null; service_key: string | null }; name: string; onDone: () => void }) {
  const [agree, setAgree] = useState(false);
  const [strokes, setStrokes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const pad = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  useEffect(() => () => { drawing.current = false; }, []);
  const pt = (e: PointerEvent<SVGSVGElement>) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(pad.current!.getScreenCTM()!.inverse());
    return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  };
  const ready = agree && strokes.length > 0 && !busy;
  async function sign() {
    setBusy(true); setErr(null);
    try { await signPhotoConsent(appt, await signaturePng(strokes), name); onDone(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  }
  const box: CSSProperties = agree
    ? { background: "linear-gradient(145deg,#C9A2D8,#7B4687)", border: "none" }
    : { background: C.white, border: "1.5px solid #DAC7DE" };
  return (
    <div className={css.consent}>
      <div className={css.consentTitle}>موافقة على تصوير الوجه</div>
      <ul className={css.terms}>{PHOTO_TERMS.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className={css.padBox}>
        <svg ref={pad} viewBox="0 0 340 150" preserveAspectRatio="xMidYMid meet" className={css.pad} aria-label="لوحة التوقيع" role="img"
          onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); setStrokes((s) => [...s, `M${pt(e)}`]); }}
          onPointerMove={(e) => { if (!drawing.current) return; const p = pt(e); setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]}L${p}`]); }}
          onPointerUp={() => { drawing.current = false; }} onPointerLeave={() => { drawing.current = false; }}>
          <line x1="30" y1="118" x2="310" y2="118" stroke="#E4D6E8" strokeWidth="1.5" />
          {strokes.map((d, i) => <path key={i} d={d} fill="none" stroke="#7B4687" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />)}
        </svg>
        <span className={css.padHint}>{strokes.length ? "" : "وقّعي بإصبعكِ هنا"}</span>
        {strokes.length > 0 && <button type="button" className={css.clear} onClick={() => setStrokes([])}>مسح</button>}
      </div>
      <button type="button" role="checkbox" aria-checked={agree} className={css.agree} onClick={() => setAgree(!agree)}>
        <span className={css.box} style={box}><Icon name="check" size={15} color="#FFFFFF" stroke={2.6} /></span>
        أوافق على تصوير وجهي فقط للأغراض المذكورة
      </button>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className={css.consentActions}>
        <button type="button" className={css.ghost} onClick={onDone} disabled={busy}>ليس الآن</button>
        <button type="button" className={css.signBtn} onClick={sign} disabled={!ready} style={{ boxShadow: SHB }}>{busy ? "جارٍ الحفظ…" : "توقيع الموافقة"}</button>
      </div>
    </div>
  );
}

