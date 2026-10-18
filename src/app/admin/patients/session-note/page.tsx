"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, SubmitButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useSession } from "@/lib/supabase/session";
import { getPatient, listConditions } from "@/lib/db/patients";
import { getVisit, listNotes, saveNote, type NoteFields } from "@/lib/db/clinical";
import { C } from "@/lib/tokens";
import { BackLink, chip, displayName, fileHref, Initials, outlineBtn, Panel, PILL_GRAY } from "../kit";

const FIELDS: [keyof NoteFields, string, string][] = [
  ["complaint", "الشكوى", "ما الذي تشكو منه المراجعة؟"], ["exam", "الفحص", "حالة البشرة عند الفحص"],
  ["procedure", "الإجراء", "ما الذي تم في الجلسة؟"], ["reaction", "استجابة البشرة", "احمرار، تحسّس، لا شيء…"],
  ["plan", "الخطة والمتابعة", "الجلسة القادمة والتوصيات"],
];
/** Quick phrases that only pre-fill the "procedure" field — the specialist edits them. */
const TEMPLATES: [string, NoteFields][] = [
  ["تنظيف عميق", { procedure: "تنظيف عميق: تنظيف، تقشير خفيف، استخراج، قناع مهدّئ، واقي شمس." }],
  ["بشرة حساسة", { procedure: "بروتوكول لطيف للبشرة الحساسة بمستحضرات خالية من العطور.", reaction: "لا تحسّس ظاهر." }],
  ["متابعة باقة", { plan: "متابعة الباقة حسب الجدول، والالتزام بالروتين المنزلي." }],
];

/** W_SessionNote.dc.html */
export default function SessionNotePage() {
  return <Suspense><SessionNote /></Suspense>;
}

function SessionNote() {
  const sp = useSearchParams();
  const apptId = sp.get("appointment") ?? "";
  const { data: visit, loading: lv } = useQuery(["clinical", "visit", apptId], () => getVisit(apptId), { enabled: !!apptId });
  const patientId = sp.get("patient") || visit?.patient_id || "";
  const { data: p, loading: lp } = useQuery(["patients", "one", patientId], () => getPatient(patientId), { enabled: !!patientId });
  const { data: conds } = useQuery(["conditions", patientId], () => listConditions(patientId), { enabled: !!patientId });
  const { data: notes } = useQuery(["clinical", "notes", patientId], () => listNotes(patientId), { enabled: !!patientId });
  const { staff } = useSession();
  const router = useRouter();
  const [f, setF] = useState<NoteFields>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const subtitle = visit ? `${clock(visit.starts_at)} · ${visit.services?.name ?? ""}${visit.rooms ? ` · ${visit.rooms.name}` : ""}${visit.staff ? ` · مع ${visit.staff.name}` : ""}` : "ملاحظة سريرية في ملف المراجعة";
  const shell = (body: React.ReactNode) => (
    <AdminShell active="جدولي" title="ملاحظة الجلسة" subtitle={subtitle} actions={patientId ? <BackLink href={fileHref(R.W_Record, "id", patientId)} icon="file">فتح الملف</BackLink> : undefined}>{body}</AdminShell>
  );
  if (!apptId && !patientId) return shell(<EmptyState icon="edit" title="اختاري جلسة أو مراجعة" text="افتحي الملاحظة من ملف المراجعة أو من جدولكِ اليومي." action={<Link href={R.W_Patients} style={outlineBtn()}>المراجعات</Link>} />);
  if (lv || lp) return shell(<Loading />);
  if (!p) return shell(<EmptyState icon="users" title="لا يوجد ملف مراجعة مرتبط" text="هذا الموعد لمراجعة بدون ملف. افتحي لها ملفاً من الاستقبال أولاً." />);

  const allergies = (conds ?? []).filter((c) => c.kind === "allergy");
  const empty = !Object.values(f).some((v) => v && v.trim());

  async function save() {
    setBusy(true); setErr("");
    try { await saveNote({ patientId: p!.id, appointmentId: apptId || null, authorId: staff?.id ?? null, fields: f }); router.push(fileHref(R.W_Record, "id", p!.id)); }
    catch (e) { setErr(e instanceof Error ? e.message : "تعذّر الحفظ"); setBusy(false); }
  }

  return shell(
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
      {allergies.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 18, background: "linear-gradient(90deg,#F4E6F8,#FAF3FB)", border: "1px solid #DEC6E8" }}>
          <span style={{ width: 32, height: 32, borderRadius: 16, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="alert" size={17} color={C.white} stroke={2} /></span>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.danger }}>تنبيه حساسية: {allergies.map((a) => a.name).join("، ")}</div>
          <div style={{ fontSize: 12.5, color: C.sub }}>تجنّبي المستحضرات التي تحتوي عليها.</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Panel title="ملاحظة الجلسة" style={{ flex: 1, minWidth: 480 }} right={
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.sub2 }}>قوالب سريعة:</span>
            {TEMPLATES.map(([t, v]) => <button key={t} type="button" onClick={() => setF({ ...f, ...v })} style={{ ...chip(false, 32), fontSize: 12, padding: "0 10px" }}>{t}</button>)}
          </div>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FIELDS.map(([k, label, ph]) => (
              <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, gridColumn: k === "plan" ? "1 / -1" : undefined }}>
                <label htmlFor={k} style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>{label}</label>
                <textarea id={k} rows={4} value={f[k] ?? ""} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} style={{ borderRadius: 16, border: "1px solid #EADCF0", background: C.white, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, color: C.ink, width: "100%", resize: "vertical", outline: "none" }} />
              </div>
            ))}
          </div>
          {err && <ErrorNote style={{ marginTop: 12 }}>{err}</ErrorNote>}
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <SubmitButton onClick={save} busy={busy} disabled={empty}>حفظ الملاحظة</SubmitButton>
            <Link href={fileHref(R.W_Prescription, "patient", p.id)} style={outlineBtn(50)}><Icon name="pill" size={16} color={C.accent} />كتابة وصفة</Link>
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 320, maxWidth: "100%" }}>
          <Panel>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Initials name={p.name} size={44} />
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{displayName(p.name)}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>ملف <span className="latin">{p.file_no}</span></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              <span style={PILL_GRAY}>البشرة: {p.skin_type ?? "غير محدد"}</span>
              {(conds ?? []).filter((c) => c.kind !== "allergy").map((c) => <span key={c.id} style={PILL_GRAY}>{c.name}</span>)}
            </div>
          </Panel>
          <Panel title="ملاحظات سابقة">
            {!notes?.length ? <div style={{ fontSize: 13, color: C.muted }}>لا ملاحظات سابقة.</div> : notes.slice(0, 4).map((n) => (
              <div key={n.id} style={{ borderTop: "1px solid #EDE2F1", padding: "8px 0", fontSize: 12.5, lineHeight: 1.6 }}>
                <div style={{ color: C.sub2 }}>{arDate(new Date(n.created_at), { day: false, year: true })}{n.staff ? ` · ${n.staff.name}` : ""}</div>
                <div style={{ whiteSpace: "pre-wrap", color: C.sub }}>{n.body}</div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
