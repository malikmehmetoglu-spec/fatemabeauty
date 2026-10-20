"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { refreshSession, useRequirePatient } from "@/lib/supabase/session";
import { invalidate } from "@/lib/db/query";
import { PhoneScreen, TopBar } from "@/components/shell";
import { GuestCard } from "@/components/guest";
import { Circ, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, CARD, DONE_GRAD, SELECTED } from "@/lib/tokens";

/** P_Profile.dc.html — complete the profile after first login. */
const CONCERNS = ["حبوب", "تصبّغات", "مسام واسعة", "جفاف", "بشرة دهنية", "حساسية واحمرار", "رؤوس سوداء"];
const QUESTIONS: [string, string][] = [["preg", "هل أنتِ حامل أو مرضع حالياً؟"], ["iso", "هل تتناولين دواءً لحب الشباب حالياً؟"]];
const ISO_NOTE = "تتناول دواءً لحب الشباب";
const SHIELD = "M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4";

const field: CSSProperties = { display: "flex", alignItems: "center", gap: 8, height: 44, borderRadius: 22, background: "#FAF7FB", border: `1px solid ${C.border}`, padding: "0 14px" };
const inputStyle: CSSProperties = { flexGrow: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink, textAlign: "right" };
const smallInput: CSSProperties = { width: "100%", boxSizing: "border-box", height: 40, borderRadius: 20, background: "#FAF7FB", border: `1px solid ${C.border}`, padding: "0 14px", fontSize: 13.5, outline: "none", color: C.ink };
const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 5 };
const chipBase: CSSProperties = { height: 32, padding: "0 12px", borderRadius: 19, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 };

export default function ProfilePage() {
  const [concerns, setConcerns] = useState<Record<number, boolean>>({});
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [allergy, setAllergy] = useState("");
  const [meds, setMeds] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { patient, guest } = useRequirePatient();
  const [existing, setExisting] = useState<{ kind: string; name: string }[]>([]);
  const filled = useRef(false);
  // Editing an existing profile (from «حسابي»): start from what is already saved instead of wiping it.
  useEffect(() => {
    if (!patient || filled.current) return;
    filled.current = true;
    setName(patient.name ?? "");
    if (patient.birth_date) { const [y, mo, d] = patient.birth_date.split("-"); setDob(`${Number(d)} / ${Number(mo)} / ${y}`); }
    setAnswers({ preg: patient.pregnant || patient.breastfeeding ? "yes" : "no", iso: (patient.notes ?? "").includes(ISO_NOTE) ? "yes" : "no" });
    supabase.from("patient_conditions").select("kind,name").eq("patient_id", patient.id).then(({ data }) => {
      const rows = data ?? [];
      setExisting(rows);
      setConcerns(Object.fromEntries(CONCERNS.map((c, i) => [i, rows.some((r) => r.kind === "concern" && r.name === c)])));
    });
  }, [patient]);
  async function save() {
    setError("");
    if (!name.trim()) { setError("اكتبي اسمكِ أولاً."); return; }
    if (!patient) return;
    let birth: string | null = null;
    if (dob.trim()) {
      const m = dob.replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).match(/^(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})$/);
      const d = m ? new Date(`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}T12:00:00Z`) : null;
      if (!m || !d || isNaN(d.getTime()) || d.getUTCDate() !== Number(m[1]) || d > new Date() || Number(m[3]) < 1920) {
        setError("اكتبي تاريخ الميلاد بالشكل: اليوم / الشهر / السنة، مثل 15 / 4 / 1995"); return;
      }
      birth = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }
    const otherNotes = (patient.notes ?? "").replace(ISO_NOTE, "").trim();
    const notes = [answers.iso === "yes" ? ISO_NOTE : "", otherNotes].filter(Boolean).join("\n") || null;
    setBusy(true);
    const { error: e } = await supabase.from("patients").update({
      name: name.trim(), pregnant: answers.preg === "yes", ...(answers.preg === "no" ? { breastfeeding: false } : {}),
      birth_date: birth, notes,
    }).eq("id", patient.id);
    const has = (kind: string, n: string) => existing.some((r) => r.kind === kind && r.name === n);
    const conds = [
      ...CONCERNS.filter((c, i) => concerns[i] && !has("concern", c)).map((c) => ({ patient_id: patient.id, kind: "concern", name: c })),
      ...(allergy.trim() && !has("allergy", allergy.trim()) ? [{ patient_id: patient.id, kind: "allergy", name: allergy.trim() }] : []),
      ...(meds.trim() && !has("medication", meds.trim()) ? [{ patient_id: patient.id, kind: "medication", name: meds.trim() }] : []),
    ];
    let ce = null;
    if (!e && conds.length) ({ error: ce } = await supabase.from("patient_conditions").insert(conds));
    setBusy(false);
    if (e || ce) { setError("تعذّر الحفظ. تأكدي من الاتصال وحاولي مرة أخرى."); return; }
    invalidate("me"); invalidate("patients"); await refreshSession();
    // Came here from a sign-in started elsewhere (e.g. checkout): continue there.
    let next: string | null = null;
    try { next = sessionStorage.getItem("fb.after_login"); sessionStorage.removeItem("fb.after_login"); } catch {}
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : R.Main);
  }
  const [answers, setAnswers] = useState<Record<string, string>>({ preg: "no", iso: "no" });
  const [consent, setConsent] = useState(true);

  if (guest) return <PhoneScreen><TopBar title="ملفي" back={R.Account} /><GuestCard what="ملفكِ الصحي" /></PhoneScreen>;
  return (
    <PhoneScreen auth gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title={patient?.name ? "ملفي" : "إكمال الملف"} back={patient?.name ? R.Account : R.Main} />
      <div style={{ position: "relative", marginTop: -4, fontSize: 13.5, color: C.sub, lineHeight: 1.6, textAlign: "center" }}>خطوة أخيرة لتتعرّف الأخصائية على بشرتكِ قبل أول جلسة</div>

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label htmlFor="pname" style={label}>الاسم الكامل</label>
          <div style={field}><Icon name="user" color={C.accentMid} size={17} /><input id="pname" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتبي اسمكِ كما تحبين أن نناديكِ" style={inputStyle} /></div>
        </div>
        <div>
          <label htmlFor="pdob" style={label}>تاريخ الميلاد</label>
          <div style={field}><Icon name="cal" color={C.accentMid} size={17} /><input id="pdob" type="text" inputMode="numeric" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="اليوم / الشهر / السنة" style={inputStyle} /></div>
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
            <input id="pallergy" type="text" value={allergy} onChange={(e) => setAllergy(e.target.value)} placeholder="لا يوجد" style={smallInput} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <label htmlFor="pmeds" style={{ ...label, marginBottom: 4 }}>أدوية حالية</label>
            <input id="pmeds" type="text" value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="لا يوجد" style={smallInput} />
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

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        {error && <div role="alert" style={{ fontSize: 13.5, fontWeight: 600, color: C.danger, background: "#FBEAF1", borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>{error}</div>}
        {consent ? <PrimaryButton onClick={save} disabled={busy} style={{ width: "100%" }}>{busy ? "جارٍ الحفظ…" : "حفظ ومتابعة"}</PrimaryButton> : <PrimaryButton disabled style={{ opacity: 0.45, width: "100%" }}>حفظ ومتابعة</PrimaryButton>}
      </div>
    </PhoneScreen>
  );
}
