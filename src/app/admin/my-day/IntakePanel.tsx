"use client";

/**
 * «ملخص ما قبل الاستشارة» — staff view of a consultation's intake (consult_intake, migration 0170):
 * answers, face photos of this appointment, last visits, last plan/notes, allergies, levels + «تمت المراجعة».
 * Used on «جدولي» and on the patient record.
 */
import Link from "next/link";
import { useState } from "react";
import { ErrorNote, Icon, Loading, Modal } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { arDate, clock } from "@/lib/format";
import { C } from "@/lib/tokens";
import { consultForRecord, getIntakeSummary, intakeStatus, markIntakeReviewed } from "@/lib/db/intake";
import css from "./intake.module.css";

const ANGLE: Record<string, string> = { front: "من الأمام", right: "الجانب الأيمن", left: "الجانب الأيسر" };

/** Small status badge «جاهزة ✓» / «لم تُعبّئ النموذج» (optionally clickable). */
export function IntakeBadge({ ready, reviewed, onClick }: { ready: boolean; reviewed?: boolean; onClick?: () => void }) {
  const cls = `${css.badge} ${ready ? css.badgeOk : css.badgeNo}`;
  const label = ready ? (reviewed ? "جاهزة ✓ · رُوجعت" : "جاهزة ✓") : "لم تُعبّئ النموذج";
  return onClick
    ? <button type="button" className={cls} onClick={onClick} title="ملخص ما قبل الاستشارة">{label}</button>
    : <span className={cls}>{label}</span>;
}

/** Status map for a list of consultation appointments (for badges). */
export function useIntakeStatus(ids: string[]) {
  return useQuery(["intake", "status", ids.join(",")], () => intakeStatus(ids), { enabled: ids.length > 0 });
}

export function IntakePanel({ appointmentId, compact = false }: { appointmentId: string; compact?: boolean }) {
  const q = useQuery(["intake", "summary", appointmentId], () => getIntakeSummary(appointmentId));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (q.loading) return <div className={css.panel}><Loading /></div>;
  if (q.error) return <ErrorNote>تعذّر تحميل ملخص الاستشارة: {q.error}</ErrorNote>;
  const s = q.data;
  if (!s) return null;
  const i = s.intake;
  const allergies = [i?.allergies?.trim(), ...s.fileAllergies].filter((x) => x && !/^(لا|لايوجد|لا يوجد|لا شيء|no|none)\.?$/i.test(x)).join("، ");
  const pregnant = i?.pregnant ?? (s.patient?.pregnant || s.patient?.breastfeeding ? true : null);
  const plan = s.lastNote?.fields?.plan?.trim();

  async function review(v: boolean) {
    setBusy(true); setErr(null);
    try { await markIntakeReviewed(appointmentId, v); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }

  const answers: [string, string | null | undefined][] = i ? [
    ["ما يزعجها", i.concern], ["منذ متى", i.since], ["ما جرّبته", i.tried], ["أدوية حالية", i.medications], ["ما تريده", i.goals],
  ] : [];

  return (
    <section className={css.panel} data-compact={compact ? "1" : undefined} aria-label="ملخص ما قبل الاستشارة">
      <header className={css.head}>
        <div className={css.headText}>
          <div className={css.title}><Icon name="file" size={17} color={C.accent} />ملخص ما قبل الاستشارة</div>
          <div className={css.meta}>{s.appt.services?.name} · {arDate(new Date(s.appt.starts_at))} · <span className="latin">{clock(s.appt.starts_at)}</span></div>
        </div>
        <IntakeBadge ready={!!i} reviewed={!!i?.reviewed_at} />
      </header>

      <div className={css.alerts}>
        <span className={allergies ? css.alertRed : css.alertSoft}>
          <Icon name="alert" size={14} color="currentColor" />حساسية: {allergies || (i?.allergies ? "لا يوجد" : "لم تُذكر")}
        </span>
        {pregnant === true && <span className={css.alertRed}><Icon name="alert" size={14} color="currentColor" />حامل أو مرضع</span>}
        {s.levels.length > 0 && <span className={css.alertSoft}>المستويات: {s.levels.join("، ")}</span>}
        {s.patient?.skin_type && <span className={css.alertSoft}>نوع البشرة: {s.patient.skin_type}</span>}
      </div>

      {i ? (
        <dl className={css.answers}>
          {answers.filter(([, v]) => v && v.trim()).map(([k, v]) => (
            <div key={k} className={css.answer}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      ) : (
        <div className={css.empty}>لم تُعبّئ المراجِعة نموذج ما قبل الاستشارة بعد. أُرسل لها تذكير في التطبيق عند الحجز.</div>
      )}

      {s.photos.length > 0 && (
        <div className={css.photos}>
          {s.photos.map((p) => (
            <a key={p.id} href={p.url ?? undefined} target="_blank" rel="noreferrer" className={css.photo}>
              {p.url ? <img src={p.url} alt={ANGLE[p.angle] ?? "صورة"} /> : <span />}
              <span className={css.photoCap}>{ANGLE[p.angle] ?? p.angle}</span>
            </a>
          ))}
        </div>
      )}
      {s.photos.length === 0 && i && <div className={css.note}>{s.photoConsent?.signed ? "لم ترفع صوراً." : "بلا صور — لم توقّع موافقة التصوير."}</div>}

      <div className={css.history}>
        <div className={css.histCol}>
          <div className={css.histTitle}>آخر الزيارات</div>
          {s.visits.length ? s.visits.map((v) => (
            <div key={v.id} className={css.histRow}><span>{v.services?.name ?? "—"}</span><span className="latin">{new Date(v.starts_at).toLocaleDateString("en-GB", { timeZone: "Asia/Damascus" })}</span></div>
          )) : <div className={css.note}>أول زيارة لها.</div>}
        </div>
        <div className={css.histCol}>
          <div className={css.histTitle}>آخر خطة / ملاحظة</div>
          {s.lastNote ? (
            <div className={css.plan}>{plan || s.lastNote.body || "—"}<span className={css.planBy}>{s.lastNote.staff ?? ""} · <span className="latin">{new Date(s.lastNote.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Damascus" })}</span></span></div>
          ) : <div className={css.note}>لا ملاحظات سابقة.</div>}
        </div>
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}
      <footer className={css.foot}>
        {s.patient && <Link href={`${R.W_Record}?id=${s.patient.id}`} className={css.link}>فتح الملف</Link>}
        <span className={css.spacer} />
        {i && (i.reviewed_at ? (
          <>
            <span className={css.reviewed}><Icon name="check" size={14} color={C.okDeep} stroke={2.4} />رُوجع{s.reviewer ? ` · ${s.reviewer}` : ""}</span>
            <button type="button" className={css.ghostBtn} disabled={busy} onClick={() => review(false)}>تراجع</button>
          </>
        ) : (
          <button type="button" className={css.reviewBtn} disabled={busy} onClick={() => review(true)}>
            <Icon name="check" size={15} color="#FFFFFF" stroke={2.4} />{busy ? "جارٍ الحفظ…" : "تمت المراجعة"}
          </button>
        ))}
      </footer>
    </section>
  );
}

/** Badge that opens the panel in a modal (for list rows). */
export function IntakeBadgeButton({ appointmentId, ready, reviewed }: { appointmentId: string; ready: boolean; reviewed?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IntakeBadge ready={ready} reviewed={reviewed} onClick={() => setOpen(true)} />
      {open && (
        <Modal open onClose={() => setOpen(false)} title="ملخص ما قبل الاستشارة" width={640}>
          <IntakePanel appointmentId={appointmentId} compact />
        </Modal>
      )}
    </>
  );
}

/** Patient record: the panel for her upcoming / latest consultation (hidden when none). */
export function RecordIntake({ patientId }: { patientId: string }) {
  const q = useQuery(["intake", "record", patientId], () => consultForRecord(patientId));
  if (!q.data) return null;
  return <IntakePanel appointmentId={q.data} />;
}
