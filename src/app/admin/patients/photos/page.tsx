"use client";

import ac from "../../adminPages.module.css";
import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { getPatient } from "@/lib/db/patients";
import { ANGLES, angleLabel, listPhotos, STAGE_LABEL, uploadPhoto, type PhotoRow } from "@/lib/db/clinical";
import { C } from "@/lib/tokens";
import { arErr, BackLink, chip, displayName, fileHref, outlineBtn, Panel, primaryBtn } from "../kit";

const FACE = "M50 14c-17 0-28 14-28 33 0 13 5 24 12 31 5 5 10 8 16 8s11-3 16-8c7-7 12-18 12-31 0-19-11-33-28-33zM38 44c2-2 6-2 8 0M54 44c2-2 6-2 8 0M50 50v10l-3 2M43 70c4 3 10 3 14 0";

/** W_Photos.dc.html */
export default function PhotosPage() {
  return <Suspense><Photos /></Suspense>;
}

function Frame({ label, photo }: { label: string; photo?: PhotoRow }) {
  return (
    <div style={{ flex: 1, minWidth: 0, aspectRatio: "3 / 4", maxHeight: 470, borderRadius: 26, position: "relative", overflow: "hidden", background: "radial-gradient(ellipse 60% 55% at 50% 45%, #F4E6F8 0%, #E9D8EF 60%, #DCC5E4 100%)", boxShadow: "inset 0 0 60px rgba(123,70,135,0.12), 0 12px 30px rgba(123,70,135,0.10)" }}>
      {photo?.url
        ? <img src={photo.url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <svg width={220} height={220} viewBox="0 0 100 100" fill="none" stroke={C.white} strokeWidth={1.1} strokeLinecap="round" aria-hidden="true" style={{ position: "absolute", left: "50%", top: "48%", transform: "translate(-50%,-50%)", opacity: 0.7 }}><path d={FACE} /></svg>}
      <span style={{ position: "absolute", top: 14, right: 14, height: 30, padding: "0 14px", borderRadius: 15, background: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 700, color: C.accent, display: "inline-flex", alignItems: "center" }}>
        {label}{photo ? ` · ${arDate(new Date(photo.created_at), { day: false, year: true })}` : ""}
      </span>
    </div>
  );
}

function Photos() {
  const patientId = useSearchParams().get("patient") ?? "";
  const { data: p, loading: lp } = useQuery(["patients", "one", patientId], () => getPatient(patientId), { enabled: !!patientId });
  const { data, loading, error } = useQuery(["clinical", "photos", patientId], () => listPhotos(patientId), { enabled: !!patientId });
  const [angle, setAngle] = useState("front");
  const [pick, setPick] = useState<{ b?: string; a?: string }>({});
  const [stage, setStage] = useState<"before" | "after" | "progress">("before");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const shell = (sub: React.ReactNode, body: React.ReactNode) => (
    <AdminShell active="المراجعات" title="صور قبل/بعد" subtitle={sub} actions={patientId ? <BackLink href={fileHref(R.W_Record, "id", patientId)} icon="file">الملف الصحي</BackLink> : undefined}>{body}</AdminShell>
  );
  if (!patientId) return shell("صور المراجعات", <EmptyState icon="camera" title="اختاري مراجعة أولاً" text="افتحي الصور من ملف المراجعة." action={<Link href={R.W_Patients} style={outlineBtn()}>المراجعات</Link>} />);
  if (lp || loading) return shell("", <Loading />);
  if (!p) return shell("", <EmptyState icon="users" title="لم يُعثر على هذا الملف" />);

  const all = data ?? [];
  const list = all.filter((x) => x.angle === angle);
  const before = list.find((x) => x.id === pick.b) ?? list[0];
  const after = list.find((x) => x.id === pick.a) ?? (list.length > 1 ? list[list.length - 1] : undefined);
  const sessions = new Set(all.map((x) => x.appointment_id ?? x.created_at.slice(0, 10))).size;

  async function onFile(file?: File) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) { setErr("اختاري ملف صورة (JPG أو PNG)."); return; }
    if (file.size > 15 * 1024 * 1024) { setErr("الصورة أكبر من 15 ميغابايت."); return; }
    setBusy(true);
    try { await uploadPhoto(p!.id, file, angle, stage, null); } catch (e) { setErr(arErr(e, "تعذّر رفع الصورة. حاولي مرة أخرى.")); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return shell(<>ملف <span className="latin">{p.file_no}</span> · {displayName(p.name)} · {sessions} جلسات مصوّرة</>,
    <div className={ac.split} style={{ flexGrow: 1 }}>
      <Panel title="مقارنة قبل/بعد" className={ac.grow} right={
        <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ANGLES.map((a) => <button key={a.key} type="button" role="tab" aria-selected={angle === a.key} onClick={() => { setAngle(a.key); setPick({}); }} style={{ ...chip(angle === a.key, 34), fontSize: 12.5, padding: "0 12px" }}>{a.label}</button>)}
        </div>}>
        {error && <ErrorNote>{arErr(error, "تعذّر تحميل الصور.")}</ErrorNote>}
        {!list.length ? (
          <EmptyState compact icon="camera" title={`لا صور بزاوية «${angleLabel(angle)}»`} text="ارفعي صورة من لوحة «إضافة صورة» أو التقطيها من جهاز الاستقبال قبل الجلسة." />
        ) : (
          <>
            <div style={{ display: "flex", gap: 14 }}>
              <Frame label="قبل" photo={before} />
              <Frame label="بعد" photo={after} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
              {list.map((x) => {
                const role = x.id === before?.id ? "قبل" : x.id === after?.id ? "بعد" : "";
                return (
                  <button key={x.id} type="button" onClick={() => setPick(new Date(x.created_at) < new Date(after?.created_at ?? 0) ? { ...pick, b: x.id } : { ...pick, a: x.id })}
                    style={{ width: 120, flexShrink: 0, borderRadius: 18, padding: 6, textAlign: "right", ...(role ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF" } : { background: C.white, border: "1px solid #EADCF0" }) }}>
                    <div style={{ height: 90, borderRadius: 12, overflow: "hidden", background: "#F3EAF6" }}>
                      {x.url && <img src={x.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div style={{ fontSize: 11.5, marginTop: 4, color: C.ink }}>{arDate(new Date(x.created_at), { day: false })} · {STAGE_LABEL[x.stage] ?? x.stage}{role ? ` · ${role}` : ""}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Panel>
      <Panel title="إضافة صورة" className={ac.side} style={{ ["--side" as string]: "280px" }}>
        <div style={{ fontSize: 12.5, color: C.sub2, marginBottom: 8 }}>الزاوية: <b style={{ color: C.ink }}>{angleLabel(angle)}</b></div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {(["before", "after", "progress"] as const).map((s) => <button key={s} type="button" onClick={() => setStage(s)} style={{ ...chip(stage === s, 34), fontSize: 12.5 }}>{STAGE_LABEL[s]}</button>)}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} style={{ ...primaryBtn, width: "100%", opacity: busy ? 0.6 : 1 }}><Icon name="upload" size={18} color={C.white} />{busy ? "جارٍ الرفع…" : "رفع صورة"}</button>
        {err && <ErrorNote style={{ marginTop: 10 }}>{err}</ErrorNote>}
        <div style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.7 }}>تُحفظ الصور في مساحة خاصة، ولا تراها إلا المراجعة نفسها وفريق المركز.</div>
      </Panel>
    </div>
  );
}
