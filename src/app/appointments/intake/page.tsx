"use client";

/**
 * «جهّزي استشارتكِ» — pre-consultation intake for one of her consultation appointments (?id=).
 * Answers go to consult_intake (editable until the visit starts). Optional face photos only after the photo
 * consent (consents.kind = 'photo'); if not signed yet, the consent text + signature are shown here first.
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PhoneScreen, TopBar } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { useSearch } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { GuestCard } from "@/components/guest";
import { arDate, clock } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";
import {
  PHOTO_TERMS, getConsultAppt, getIntake, intakeFields, intakeOpen, listApptPhotos, myPhotoConsent, saveIntake, signPhotoConsent, uploadIntakePhoto,
  type ConsultAppt, type IntakeFields,
} from "@/lib/db/intake";
import css from "./intake.module.css";

const ANGLES: { key: string; label: string }[] = [
  { key: "front", label: "من الأمام" }, { key: "right", label: "الجانب الأيمن" }, { key: "left", label: "الجانب الأيسر" },
];

export default function IntakePage() {
  const s = useRequirePatient();
  const q = useSearch();
  const id = q?.get("id") ?? "";
  const a = useQuery(["intake", "appt", id], () => getConsultAppt(id), { enabled: !!id && !!s.patient });
  const i = useQuery(["intake", "one", id], () => getIntake(id), { enabled: !!a.data });

  if (s.guest) return <PhoneScreen><TopBar title="جهّزي استشارتكِ" back={R.P_Appointments} /><GuestCard icon="cal" what="استشارتكِ" /></PhoneScreen>;
  if (s.loading || !s.patient || !q || (id && (a.loading || i.loading))) return <PhoneScreen><Loading /></PhoneScreen>;
  const appt = a.data;
  if (!appt || !appt.services?.is_consultation) return (
    <PhoneScreen gap={12}>
      <TopBar title="جهّزي استشارتكِ" back={R.P_Appointments} />
      <EmptyState icon="file" title="لا يوجد نموذج لهذا الموعد" text="نموذج ما قبل الاستشارة متاح لمواعيد الاستشارة فقط." action={<PrimaryButton href={R.P_Appointments} height={50}>مواعيدي</PrimaryButton>} />
    </PhoneScreen>
  );
  return <Form appt={appt} initial={intakeFields(i.data ?? null)} existing={!!i.data} name={s.patient.name} />;
}

function Form({ appt, initial, existing, name }: { appt: ConsultAppt; initial: IntakeFields; existing: boolean; name: string }) {
  const router = useRouter();
  const open = intakeOpen(appt);
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof IntakeFields>(k: K, v: IntakeFields[K]) => { setErr(null); setF((x) => ({ ...x, [k]: v })); };
  const back = `${R.P_AppointmentDetail}?id=${appt.id}`;
  const when = new Date(appt.starts_at);

  async function submit() {
    if (!f.concern.trim()) { setErr("اكتبي باختصار ما الذي يزعجكِ أو ما تودّين استشارتنا فيه."); return; }
    setBusy(true); setErr(null);
    try { await saveIntake(appt, f); router.push(`${back}&intake=1`); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  }

  return (
    <PhoneScreen gap={14}>
      <TopBar title="جهّزي استشارتكِ" back={back} />
      <div className={css.hero}>
        <div className={css.heroTitle}>أخبرينا عن بشرتكِ</div>
        <div className={css.heroText}>
          إجاباتكِ تصل إلى المستشارة قبل موعدكِ لتستفيدي من وقت الاستشارة كاملاً. لا توجد إجابة خاطئة — اكتبي بكلماتكِ.
        </div>
        <div className={css.heroMeta}>
          <span><Icon name="cal" size={14} color="#FFFFFF" />{arDate(when)}</span>
          <span className="latin" dir="ltr"><Icon name="clock" size={14} color="#FFFFFF" />{clock(when)}</span>
          <span><Icon name="sparkle" size={14} color="#FFFFFF" />{appt.services?.name}</span>
        </div>
      </div>

      {!open && <ErrorNote>{existing ? "بدأ موعد الاستشارة أو انتهى — يمكنكِ مراجعة إجاباتكِ فقط." : "لم يعد بالإمكان تعبئة النموذج لهذا الموعد."}</ErrorNote>}

      <fieldset className={css.card} disabled={!open}>
        <Q n={1} label="ما الذي يزعجكِ أو تودّين استشارتنا فيه؟" required>
          <textarea className={css.input} rows={3} aria-label="ما الذي يزعجكِ" value={f.concern} onChange={(e) => set("concern", e.target.value)} placeholder="مثلاً: حبوب متكرّرة على الذقن، بقع داكنة بعد الصيف…" maxLength={1000} />
        </Q>
        <Q n={2} label="منذ متى؟">
          <div className={css.chips}>
            {["أقل من شهر", "1–6 أشهر", "أكثر من 6 أشهر", "منذ سنوات"].map((c) => (
              <button key={c} type="button" className={css.chip} data-on={f.since === c ? "1" : undefined} onClick={() => set("since", f.since === c ? "" : c)}>{c}</button>
            ))}
          </div>
        </Q>
        <Q n={3} label="ماذا جرّبتِ حتى الآن؟">
          <textarea className={css.input} rows={2} aria-label="ماذا جرّبتِ" value={f.tried} onChange={(e) => set("tried", e.target.value)} placeholder="منتجات، جلسات، وصفات… وكيف كانت النتيجة" maxLength={1000} />
        </Q>
        <Q n={4} label="أدوية أو مكمّلات تستخدمينها حالياً">
          <input className={css.input} aria-label="أدوية أو مكمّلات" value={f.medications} onChange={(e) => set("medications", e.target.value)} placeholder="اكتبي «لا شيء» إن لم يوجد" maxLength={500} />
        </Q>
        <Q n={5} label="هل لديكِ حساسية من أي مادة أو دواء؟">
          <input className={css.input} aria-label="الحساسية" value={f.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="اكتبي «لا» إن لم يوجد" maxLength={500} />
        </Q>
        <Q n={6} label="هل أنتِ حامل أو مرضع حالياً؟">
          <div className={css.chips}>
            {([[true, "نعم"], [false, "لا"]] as const).map(([v, l]) => (
              <button key={l} type="button" className={css.chip} data-on={f.pregnant === v ? "1" : undefined} onClick={() => set("pregnant", f.pregnant === v ? null : v)}>{l}</button>
            ))}
          </div>
        </Q>
        <Q n={7} label="ما النتيجة التي تحلمين بها؟">
          <textarea className={css.input} rows={2} aria-label="النتيجة المرجوّة" value={f.goals} onChange={(e) => set("goals", e.target.value)} placeholder="مثلاً: بشرة أنقى وروتين بسيط أستطيع الالتزام به" maxLength={1000} />
        </Q>
      </fieldset>

      <Photos appt={appt} open={open} name={name} />

      {err && <ErrorNote>{err}</ErrorNote>}
      {open && (
        <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
          <PrimaryButton onClick={submit} disabled={busy}>{busy ? "جارٍ الإرسال…" : existing ? "حفظ التعديلات" : "إرسال إلى المستشارة"}</PrimaryButton>
          <div style={{ fontSize: 12, color: C.sub2, textAlign: "center" }}>يمكنكِ تعديل إجاباتكِ حتى بداية الموعد.</div>
        </div>
      )}
    </PhoneScreen>
  );
}

function Q({ n, label, required, children }: { n: number; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={css.q} role="group" aria-label={label}>
      <span className={css.qLabel}><span className={css.qNo}>{n}</span>{label}{required && <span className={css.req}> *</span>}</span>
      {children}
    </div>
  );
}

/* ---------- optional face photos, after the photo consent ---------- */

function Photos({ appt, open, name }: { appt: ConsultAppt; open: boolean; name: string }) {
  const pid = appt.patient_id ?? "";
  const consent = useQuery(["intake", "consent", pid], () => myPhotoConsent(pid), { enabled: !!pid });
  const photos = useQuery(["intake", "photos", appt.id], () => listApptPhotos(appt.id));
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const signed = consent.data?.signed === true;
  const list = photos.data ?? [];

  async function pick(angle: string, file: File | undefined) {
    if (!file) return;
    setBusy(angle); setErr(null);
    try { await uploadIntakePhoto(appt, file, angle); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(null); }
  }

  if (consent.loading) return null;
  return (
    <section className={css.card}>
      <div className={css.photoHead}>
        <div>
          <div className={css.photoTitle}>صور الوجه <span className={css.optional}>اختياري</span></div>
          <div className={css.photoText}>صور واضحة بإضاءة طبيعية ودون مكياج تساعد المستشارة على فهم بشرتكِ قبل الموعد.</div>
        </div>
      </div>
      {list.length > 0 && (
        <div className={css.thumbs}>
          {list.map((p) => (
            <figure key={p.id} className={css.thumb}>
              {p.url ? <img src={p.url} alt={ANGLES.find((x) => x.key === p.angle)?.label ?? "صورة"} /> : <span />}
              <figcaption>{ANGLES.find((x) => x.key === p.angle)?.label ?? p.angle}</figcaption>
            </figure>
          ))}
        </div>
      )}
      {!open ? null : signed ? (
        <div className={css.angles}>
          {ANGLES.map((x) => (
            <label key={x.key} className={css.angle} data-busy={busy === x.key ? "1" : undefined}>
              <input type="file" accept="image/*" capture="user" hidden disabled={!!busy} onChange={(e) => { void pick(x.key, e.target.files?.[0]); e.target.value = ""; }} />
              <Icon name="camera" size={20} color={C.accent} />
              <span>{busy === x.key ? "جارٍ الرفع…" : x.label}</span>
            </label>
          ))}
        </div>
      ) : show ? (
        <ConsentPad appt={appt} name={name} onDone={() => setShow(false)} />
      ) : (
        <button type="button" className={css.consentBtn} onClick={() => setShow(true)}>
          <Icon name="sign" size={17} color={C.accent} />{consent.data && !consent.data.signed ? "غيّرتِ رأيكِ؟ وقّعي موافقة التصوير" : "إضافة صور — بعد موافقة التصوير"}
        </button>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}
    </section>
  );
}

function signaturePng(strokes: string[]): Promise<Blob> {
  const k = 2, c = document.createElement("canvas");
  c.width = 340 * k; c.height = 150 * k;
  const g = c.getContext("2d")!;
  g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, c.width, c.height);
  g.scale(k, k); g.strokeStyle = "#35213D"; g.lineWidth = 3.5; g.lineCap = "round"; g.lineJoin = "round";
  strokes.forEach((d) => g.stroke(new Path2D(d)));
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("تعذّر حفظ التوقيع"))), "image/png"));
}

function ConsentPad({ appt, name, onDone }: { appt: ConsultAppt; name: string; onDone: () => void }) {
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

