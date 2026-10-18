"use client";

/** P_Consent.dc.html — treatment consent: summary, yes/no health questions, finger signature pad. */
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, ErrorNote, Icon, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { C, CARD, SHB } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { useMe } from "@/lib/db/patients";
import { listVisits, signConsent } from "@/lib/db/clinical";
import { Wait } from "../account/Wait";

const GENERAL = [
  { icon: "drop", t: "ما قد تشعرين به بعده", d: "قد يظهر احمرار أو حساسية خفيفة مؤقتة حسب نوع الجلسة، وتخبركِ الأخصائية بما يُتوقّع." },
  { icon: "list", t: "التعليمات", d: "اتبعي تعليمات العناية بعد الجلسة التي تصلكِ، واستعملي واقي الشمس." },
  { icon: "lock", t: "سرية بياناتكِ", d: "تُحفظ إجاباتكِ وتوقيعكِ في ملفكِ الصحي، ولا يطّلع عليها إلا فريق المركز." },
];
const QS = ["هل لديكِ حساسية من أي مستحضر للعناية بالبشرة؟", "هل تستعملين حالياً علاجاً موضعياً للبشرة (مثل الريتينويد)؟", "هل يوجد التهاب أو جرح مفتوح في وجهكِ؟"];

const seg = (on: boolean): CSSProperties => ({
  width: 46, height: 30, borderRadius: 15, border: "none", fontSize: 12.5, fontWeight: 700,
  ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: C.accent, boxShadow: "0 4px 10px rgba(150,100,170,0.28)" } : { background: "transparent", color: C.muted }),
});

export default function ConsentPage() {
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: visits } = useQuery(["clinical", "visits", id], () => listVisits(id), { enabled: !!id });
  const today = new Date().toISOString().slice(0, 10);
  const next = [...(visits ?? [])].reverse().find((v) => ["pending", "confirmed", "checked_in"].includes(v.status) && v.starts_at >= today);
  const svc = next?.services;
  const title = svc?.name ?? "الموافقة العامة على جلسات العناية";
  const INFO = svc?.description ? [{ icon: "sparkle", t: "ما هو الإجراء", d: svc.description }, ...GENERAL] : GENERAL;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [a, setA] = useState([1, 1, 1]);
  const [strokes, setStrokes] = useState<string[]>([]);
  const drawing = useRef(false);
  const pad = useRef<SVGSVGElement>(null);
  const signed = strokes.length > 0;

  const pt = (e: PointerEvent) => {
    const r = pad.current!.getBoundingClientRect();
    return `${Math.round(e.clientX - r.left)} ${Math.round(e.clientY - r.top)}`;
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setStrokes((s) => [...s, `M${pt(e)}`]);
  };
  const move = (e: PointerEvent) => {
    if (!drawing.current) return;
    setStrokes((s) => [...s.slice(0, -1), `${s[s.length - 1]} L${pt(e)}`]);
  };

  async function submit() {
    if (!me || !signed) return;
    setBusy(true); setErr("");
    try {
      await signConsent(me.id, next?.service_key ?? null, {
        title, signer: me.name, signature: strokes.join(" "), method: "app",
        questions: Object.fromEntries(QS.map((q, i) => [q, a[i] === 0])),
      }, next?.id ?? null);
      router.push(R.P_Prescriptions);
    } catch { setErr("تعذّر حفظ التوقيع. حاولي مرة أخرى."); setBusy(false); }
  }

  return (
    <PhoneScreen>
      <TopBar title="نموذج الموافقة" back={R.P_Prescriptions} />
      {!me ? <Wait loading={loading} error={error} /> : (<>

      <div style={{ ...CARD, borderRadius: 26, padding: "8px 16px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0 6px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{title}</div>
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
            <div style={{ fontSize: 11.5, color: C.sub2 }}>{arDate(new Date(), { year: true })}</div>
          </div>
          <button type="button" onClick={() => setStrokes([])} disabled={!signed} style={{ height: 32, padding: "0 12px", borderRadius: 16, border: "none", background: C.white, boxShadow: SHB, fontSize: 12, fontWeight: 600, color: C.danger, display: "flex", alignItems: "center", gap: 4, opacity: signed ? 1 : 0.5 }}>
            <Icon name="refresh" color={C.danger} size={14} />امسحي
          </button>
        </div>
        <div style={{ position: "relative", height: 92, marginTop: 8, borderRadius: 18, border: "1.5px dashed #DDC9E1", background: "linear-gradient(180deg,#FFFFFF,#FBF5FC)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {(
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

      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ marginTop: "auto" }}>
        <PrimaryButton icon="sign" onClick={submit} disabled={!signed || busy} style={{ width: "100%", opacity: signed ? 1 : 0.5 }}>{busy ? "جارٍ الحفظ…" : "توقيع وإرسال"}</PrimaryButton>
      </div>
      </>)}
    </PhoneScreen>
  );
}
