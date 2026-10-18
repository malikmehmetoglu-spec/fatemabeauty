"use client";
 

import { Fragment, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stage } from "@/components/shell";
import { ErrorNote } from "@/components/ui";
import { R } from "@/lib/routes";
import { saveEligibility } from "@/lib/db/queue";
import { css } from "../css";
import { BG, C, SH, SHB, SH_SOFT } from "@/lib/tokens";
import { ApptPicker, NowText, apptLine, useApptParam, useKiosk } from "../kiosk";

/** T_Eligibility.dc.html */
const Q: [string, "block" | "warn", string][] = [["هل أنتِ حامل أو مرضعة؟", "block", "حمل أو رضاعة: تُؤجَّل جلسة الليزر."], ["تعرّض للشمس أو تسمير خلال آخر أسبوعين؟", "warn", "بشرة متعرّضة للشمس: خطر أعلى للحروق والتصبّغ — طاقة أخف أو تأجيل حسب تقدير الأخصائية."], ["أدوية تزيد التحسّس للضوء؟", "warn", "دواء يزيد التحسّس للضوء: راجعي نوع الدواء قبل البدء."], ["علاج إيزوتريتينوين لحب الشباب خلال 6 أشهر؟", "block", "إيزوتريتينوين حديث: يُؤجَّل الإجراء."], ["التهاب أو هربس نشط في منطقة الجلسة؟", "block", "التهاب نشط: لا تُعالج المنطقة حتى الشفاء."], ["ميل لظهور ندبات بارزة بعد الجروح؟", "warn", "ميل للندبات البارزة: اختبار بقعة صغيرة أولاً."], ["وشم أو مكياج دائم في المنطقة؟", "warn", "وشم في المنطقة: تجنّبي المرور فوقه."]];
const SK = ["I", "II", "III", "IV", "V", "VI"], COL = ["#F8E3D6", "#F0D2BC", "#DDB394", "#BE8B66", "#8E5E3F", "#5A3A28"];
const seg = (on: boolean, yes: boolean) => css("width:84px;height:56px;border-radius:28px;border:none;font-family:inherit;font-size:17px;font-weight:700;" +
  (on ? (yes ? "background:linear-gradient(145deg,#C9A2D8,#7B4687);color:#FFFFFF;box-shadow:0 8px 16px rgba(123,70,135,0.32)"
    : "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);color:#7B4687;box-shadow:0 8px 16px rgba(150,100,170,0.25)")
    : "background:transparent;color:#A595AC"));

/** Reception tablet: laser eligibility checklist before the procedure. */
export default function Page() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const k = useKiosk();
  const router = useRouter();
  const f = useApptParam(!k.gate);
  const [st, setSt] = useState({ ans: [false, false, false, false, false, false, false], skin: -1 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setAns = (i: number, v: boolean) => setSt({ ...st, ans: st.ans.map((x, j) => (j === i ? v : x)) });
  const qs = st.ans.map((v, i) => ({ yes: () => setAns(i, true), no: () => setAns(i, false), yStyle: seg(v, true), nStyle: seg(!v, false) }));
  const alerts = Q.map((q, i) => ({ t: q[2], kind: q[1], on: st.ans[i] })).filter((x) => x.on).map((x) => ({ t: x.t,
    style: css("display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:18px;font-size:14.5px;font-weight:600;line-height:1.55;" +
      (x.kind === "block" ? "background:#F4E6F8;color:#B03D6A;border:1px solid #E5C9EB" : "background:#FCF1DE;color:#8A5A12;border:1px solid #F3E0BF")),
    dot: css("width:8px;height:8px;border-radius:4px;flex-shrink:0;margin-top:9px;background:" + (x.kind === "block" ? "#B03D6A" : "#C9962B")) }));
  const block = Q.some((q, i) => q[1] === "block" && st.ans[i]);
  const skins = SK.map((s, i) => ({ s, pick: () => setSt({ ...st, skin: i }),
    style: css("flex:1;height:72px;border-radius:20px;font-family:var(--font-rubik),sans-serif;font-size:15px;font-weight:500;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;" +
      (st.skin === i ? "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687;font-weight:700" : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D")),
    sw: css("width:22px;height:22px;border-radius:11px;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.15);background:" + COL[i]) }));
  const skinNote = st.skin < 0 ? "اختاري نوع البشرة قبل ضبط إعدادات الجهاز." : st.skin >= 3 ? "بشرة داكنة (IV–VI): ابدئي بطاقة أخف واختبار بقعة، فخطر التصبّغ بعد الليزر أعلى." : "تأكدي من النوع قبل ضبط إعدادات الجهاز.";
  const noAlerts = alerts.length === 0, nAlerts = alerts.length;
  const btn = busy ? "جارٍ الحفظ…" : block ? "تأجيل الجلسة" : alerts.length ? "متابعة الجلسة بحذر" : "متابعة الجلسة";
  if (k.gate) return k.gate;
  const A = f.appt;
  if (!A) return <ApptPicker title="قبل الإجراء" today={f.today} loading={f.loading} error={f.error} path={R.T_Eligibility} />;
  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      await saveEligibility(A.id, {
        answers: Q.map((q, i) => ({ q: q[0], yes: st.ans[i], level: q[1] })),
        skin_type: st.skin >= 0 ? SK[st.skin] : null,
        decision: block ? "postpone" : alerts.length ? "caution" : "ok",
        by: k.staff?.name ?? null,
      });
      router.push(block ? R.T_Desk : `${R.T_Consent}?id=${A.id}`);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  };
  return (
    <Stage width={1194} height={834}  background={BG} padding="36px 40px 32px" direction="column" gap={20}>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <Link href={R.T_Desk} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        <div style={{ lineHeight: 1.3, flexGrow: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>قبل الإجراء
          </div>
          <div style={{ fontSize: 15, color: C.sub2 }}>{apptLine(A)}{A.eligibility_at ? " · تم الفحص مسبقاً" : ""}
          </div>
        </div>
        <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
          </svg>
          <span><NowText part="date" />
          </span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}><NowText part="time" />
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ flex: 1, minWidth: "0", borderRadius: 32, padding: "14px 24px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 4px" }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>أسئلة الأمان
            </div>
            <div style={{ fontSize: 13, color: C.sub2 }}>اسألي المراجعة واختاري الإجابة
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82 }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>هل أنتِ حامل أو مرضعة؟
              </div>
            </div>
            <div role="group" aria-label="هل أنتِ حامل أو مرضعة؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[0]} onClick={qs[0].yes} style={qs[0].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[0]} onClick={qs[0].no} style={qs[0].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>تعرّض للشمس أو تسمير خلال آخر أسبوعين؟
              </div>
            </div>
            <div role="group" aria-label="تعرّض للشمس أو تسمير خلال آخر أسبوعين؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[1]} onClick={qs[1].yes} style={qs[1].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[1]} onClick={qs[1].no} style={qs[1].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>أدوية تزيد التحسّس للضوء؟
              </div>
            </div>
            <div role="group" aria-label="أدوية تزيد التحسّس للضوء؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[2]} onClick={qs[2].yes} style={qs[2].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[2]} onClick={qs[2].no} style={qs[2].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>علاج إيزوتريتينوين لحب الشباب خلال 6 أشهر؟
              </div>
            </div>
            <div role="group" aria-label="علاج إيزوتريتينوين لحب الشباب خلال 6 أشهر؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[3]} onClick={qs[3].yes} style={qs[3].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[3]} onClick={qs[3].no} style={qs[3].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>التهاب أو هربس نشط في منطقة الجلسة؟
              </div>
            </div>
            <div role="group" aria-label="التهاب أو هربس نشط في منطقة الجلسة؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[4]} onClick={qs[4].yes} style={qs[4].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[4]} onClick={qs[4].no} style={qs[4].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>ميل لظهور ندبات بارزة بعد الجروح؟
              </div>
            </div>
            <div role="group" aria-label="ميل لظهور ندبات بارزة بعد الجروح؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[5]} onClick={qs[5].yes} style={qs[5].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[5]} onClick={qs[5].no} style={qs[5].nStyle}>لا
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 82, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>وشم أو مكياج دائم في المنطقة؟
              </div>
            </div>
            <div role="group" aria-label="وشم أو مكياج دائم في المنطقة؟" style={{ display: "flex", padding: 4, borderRadius: 32, background: "#F5EFF7", border: "1px solid #E9DCEE", flexShrink: 0 }}>
              <button type="button" aria-pressed={st.ans[6]} onClick={qs[6].yes} style={qs[6].yStyle}>نعم
              </button>
              <button type="button" aria-pressed={!st.ans[6]} onClick={qs[6].no} style={qs[6].nStyle}>لا
              </button>
            </div>
          </div>
        </div>
        <div style={{ width: 410, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ borderRadius: 30, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>نوع البشرة
              </div>
              <div style={{ fontSize: 13, color: C.sub2 }}>مقياس فيتزباتريك
              </div>
            </div>
            <div dir="ltr" style={{ display: "flex", gap: 6 }}>
              <button type="button" aria-pressed={st.skin === 0} onClick={skins[0].pick} aria-label="نوع البشرة I" style={skins[0].style}>
                <span style={skins[0].sw} />I
              </button>
              <button type="button" aria-pressed={st.skin === 1} onClick={skins[1].pick} aria-label="نوع البشرة II" style={skins[1].style}>
                <span style={skins[1].sw} />II
              </button>
              <button type="button" aria-pressed={st.skin === 2} onClick={skins[2].pick} aria-label="نوع البشرة III" style={skins[2].style}>
                <span style={skins[2].sw} />III
              </button>
              <button type="button" aria-pressed={st.skin === 3} onClick={skins[3].pick} aria-label="نوع البشرة IV" style={skins[3].style}>
                <span style={skins[3].sw} />IV
              </button>
              <button type="button" aria-pressed={st.skin === 4} onClick={skins[4].pick} aria-label="نوع البشرة V" style={skins[4].style}>
                <span style={skins[4].sw} />V
              </button>
              <button type="button" aria-pressed={st.skin === 5} onClick={skins[5].pick} aria-label="نوع البشرة VI" style={skins[5].style}>
                <span style={skins[5].sw} />VI
              </button>
            </div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.55, display: "flex", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
              </svg>
              <span>{skinNote}
              </span>
            </div>
          </div>
          <div style={{ borderRadius: 30, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 10, flexGrow: 1, minHeight: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>تنبيهات
              </div>
              <span style={{ minWidth: 30, height: 30, borderRadius: 15, padding: "0 8px", boxSizing: "border-box", background: "#FBEAF1", color: C.danger, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>{nAlerts}
              </span>
            </div>
            {alerts.map((al, alI) => (
              <Fragment key={alI}>
                <div style={al.style}>
                  <span style={al.dot} />
                  <span>{al.t}
                  </span>
                </div>
              </Fragment>
            ))}
            {noAlerts && (<>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 18, background: "#E6F4EC", color: C.okDeep, fontSize: 15, fontWeight: 600 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4" />
                </svg>لا موانع — يمكنكِ البدء
              </div>
            </>)}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid #EDE2F1", fontSize: 13.5, color: C.sub2 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM9 13h6M9 17h6" />
              </svg>تُحفظ الإجابات في ملف المراجعة باسم الأخصائية ووقت الجلسة
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "12px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", flexDirection: "column", gap: 8, fontSize: 14.5, color: C.sub }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6" />
              </svg>نظارات الحماية للمراجعة والأخصائية
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
              </svg>صور «قبل» للمنطقة بنفس الزوايا
            </div>
          </div>
          {err && <ErrorNote>{err}</ErrorNote>}
          <button type="button" onClick={submit} disabled={busy} style={{ border: "none", fontFamily: "inherit", opacity: busy ? 0.6 : 1, height: 64, borderRadius: 32, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4" />
            </svg>{btn}
          </button>
        </div>
      </div>

    </Stage>
  );
}

