"use client";

import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, CARD, DONE_GRAD, SELECTED } from "@/lib/tokens";

/** P_Profile.dc.html — complete the profile after first login. */
const CONCERNS = ["حبوب", "تصبّغات", "مسام واسعة", "جفاف", "بشرة دهنية", "حساسية واحمرار", "رؤوس سوداء"];
const QUESTIONS: [string, string][] = [["preg", "هل أنتِ حامل أو مرضع حالياً؟"], ["iso", "هل تتناولين دواءً لحب الشباب حالياً؟"]];
const SHIELD = "M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4";

const field: CSSProperties = { display: "flex", alignItems: "center", gap: 8, height: 44, borderRadius: 22, background: "#FAF7FB", border: `1px solid ${C.border}`, padding: "0 14px" };
const inputStyle: CSSProperties = { flexGrow: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink, textAlign: "right" };
const smallInput: CSSProperties = { width: "100%", boxSizing: "border-box", height: 40, borderRadius: 20, background: "#FAF7FB", border: `1px solid ${C.border}`, padding: "0 14px", fontSize: 13.5, outline: "none", color: C.ink };
const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 5 };
const chipBase: CSSProperties = { height: 32, padding: "0 12px", borderRadius: 19, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 };

export default function ProfilePage() {
  const [concerns, setConcerns] = useState<Record<number, boolean>>({ 1: true, 6: true });
  const [answers, setAnswers] = useState<Record<string, string>>({ preg: "no", iso: "no" });
  const [consent, setConsent] = useState(true);

  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="إكمال الملف" back={R.P_OTP} />
      <div style={{ position: "relative", marginTop: -4, fontSize: 13.5, color: C.sub, lineHeight: 1.6, textAlign: "center" }}>خطوة أخيرة لتتعرّف الأخصائية على بشرتكِ قبل أول جلسة</div>

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label htmlFor="pname" style={label}>الاسم الكامل</label>
          <div style={field}><Icon name="user" color={C.accentMid} size={17} /><input id="pname" type="text" placeholder="اكتبي اسمكِ كما تحبين أن نناديكِ" style={inputStyle} /></div>
        </div>
        <div>
          <label htmlFor="pdob" style={label}>تاريخ الميلاد</label>
          <div style={field}><Icon name="cal" color={C.accentMid} size={17} /><input id="pdob" type="text" placeholder="اليوم / الشهر / السنة" style={inputStyle} /></div>
        </div>
      </div>

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Circ icon={SHIELD} size={34} iconSize={15} />
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>أسئلة صحية قصيرة</div>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>تساعدنا على اختيار ما يناسب بشرتكِ بأمان</div>
          </div>
        </div>
        {QUESTIONS.map(([k, q]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 2 }}>
            <span style={{ fontSize: 13, lineHeight: 1.45, fontWeight: 600, color: C.ink }}>{q}</span>
            <div role="radiogroup" aria-label={q} style={{ display: "flex", background: C.tint2, borderRadius: 17, padding: 3, flexShrink: 0 }}>
              {([["no", "لا"], ["yes", "نعم"]] as const).map(([v, t]) => {
                const on = answers[k] === v;
                return (
                  <button key={v} type="button" role="radio" aria-checked={on} onClick={() => setAnswers({ ...answers, [k]: v })} style={{
                    height: 28, padding: "0 14px", borderRadius: 14, border: "none", fontSize: 12.5,
                    ...(on ? { fontWeight: 700, background: C.white, color: C.accent, boxShadow: "0 3px 8px rgba(123,70,135,0.14)" } : { fontWeight: 600, background: "transparent", color: C.muted }),
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label htmlFor="pallergy" style={{ ...label, marginBottom: 4 }}>حساسية معروفة</label>
            <input id="pallergy" type="text" placeholder="لا يوجد" style={smallInput} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label htmlFor="pmeds" style={{ ...label, marginBottom: 4 }}>أدوية حالية</label>
            <input id="pmeds" type="text" placeholder="لا يوجد" style={smallInput} />
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>ما الذي يزعجكِ في بشرتكِ؟ <span style={{ fontWeight: 400, color: C.sub2 }}>(اختاري ما يناسب)</span></div>
        <div role="group" aria-label="مشكلات البشرة" style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {CONCERNS.map((t, i) => {
            const on = !!concerns[i];
            return (
              <button key={t} type="button" aria-pressed={on} onClick={() => setConcerns({ ...concerns, [i]: !on })} style={{
                ...chipBase,
                ...(on ? { ...SELECTED, fontWeight: 700 } : { fontWeight: 600, background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
              }}>{t}</button>
            );
          })}
        </div>
      </div>

      <button type="button" role="checkbox" aria-checked={consent} onClick={() => setConsent(!consent)} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10, border: "none", background: "transparent", padding: "0 4px", textAlign: "right" }}>
        <span style={{
          width: 22, height: 22, borderRadius: 8, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center",
          ...(consent ? { ...DONE_GRAD, boxShadow: "0 4px 10px rgba(123,70,135,0.30)", border: "none" } : { background: C.white, border: "1.5px solid #DFCFE2" }),
        }}><Icon name="check" color="#FFFFFF" size={13} stroke={2.6} /></span>
        <span style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>أوافق على حفظ بياناتي الصحية بسرية، ولا يطّلع عليها إلا فريق المركز لأجل علاجي فقط.</span>
      </button>

      <div style={{ marginTop: "auto", position: "relative" }}>
        {consent ? <PrimaryButton href={R.Main}>حفظ ومتابعة</PrimaryButton> : <PrimaryButton disabled style={{ opacity: 0.45, width: "100%" }}>حفظ ومتابعة</PrimaryButton>}
      </div>
    </PhoneScreen>
  );
}
