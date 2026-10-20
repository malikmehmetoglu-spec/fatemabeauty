"use client";

import Link from "next/link";
import t from "../../adminPages.module.css";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, Select, SubmitButton, Tag, TextArea, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { addCondition, getPatient, getTiers, listConditions, removeCondition, SKIN_TYPES, tierFor, updatePatient, type ConditionKind, type Patient } from "@/lib/db/patients";
import { angleLabel, listConsents, listNotes, listPatientPackages, listPhotos, listPrescriptions, listVisits, rxItems, STAGE_LABEL, STATUS_LABEL, WHEN_LABEL, type NoteFields } from "@/lib/db/clinical";
import { C } from "@/lib/tokens";
import { WaIconLink } from "../../calendar/whatsapp";
import { arErr, Bar, BackLink, chip, displayName, fileHref, Initials, outlineBtn, Panel, PILL_DANGER, PILL_GRAY, PLUS } from "../kit";

const TABS = ["الزيارات", "ملاحظات الجلسات", "الوصفات", "الموافقات", "الصور"];
const KIND_LABEL: Record<ConditionKind, string> = { allergy: "حساسية", medication: "دواء", concern: "مشكلة بشرة" };

/** W_Record.dc.html */
export default function RecordPage() {
  return <Suspense><Record /></Suspense>;
}

function Record() {
  const id = useSearchParams().get("id") ?? "";
  const { data: p, loading, error } = useQuery(["patients", "one", id], () => getPatient(id), { enabled: !!id });
  const { data: tiers } = useQuery(["settings", "tiers"], getTiers);
  const [editing, setEditing] = useState(false);

  if (!id) return <Shell><EmptyState icon="users" title="اختاري مراجعة من القائمة" action={<Link href={R.W_Patients} style={outlineBtn()}>كل المراجعات</Link>} /></Shell>;
  if (error) return <Shell><ErrorNote>{arErr(error, "تعذّر تحميل الملف. أعيدي تحميل الصفحة.")}</ErrorNote></Shell>;
  if (loading) return <Shell><Loading /></Shell>;
  if (!p) return <Shell><EmptyState icon="users" title="لم يُعثر على هذا الملف" action={<Link href={R.W_Patients} style={outlineBtn()}>كل المراجعات</Link>} /></Shell>;
  const tier = tierFor(p.points, tiers ?? []);

  return (
    <Shell fileNo={p.file_no}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0, flexGrow: 1 }}>
        <Panel>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <Initials name={p.name} size={72} />
            <div style={{ flex: "1 1 220px", lineHeight: 1.4, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: p.name ? C.ink : C.muted }}>{displayName(p.name)}</span>
                <span style={PILL_DANGER} className="latin">ملف {p.file_no}</span>
                {p.source === "public" && <Tag kind="pink">من رابط الحجز</Tag>}
                {tier && <span style={{ ...PILL_GRAY, background: "linear-gradient(145deg,#FFFFFF,#CFCBD6)", color: "#4A4452" }}>العضوية {tier.name}</span>}
              </div>
              <div style={{ display: "flex", gap: 18, fontSize: 13, color: C.sub, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon name="phone" size={15} color={C.accentMid} /><span dir="ltr" className="latin" style={{ unicodeBidi: "isolate" }}>{p.phone ?? "—"}</span><WaIconLink phone={p.phone} name={p.name} size={30} /></span>
                {p.birth_date && <span>الميلاد: {arDate(new Date(p.birth_date), { day: false, year: true })}</span>}
                <span>الملف منذ: {arDate(new Date(p.created_at), { day: false, year: true })}</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={PILL_GRAY}>نوع البشرة: {p.skin_type ?? "غير محدد"}</span>
                <span style={PILL_GRAY}><span className="latin">{p.points}</span>&nbsp;نقطة</span>
                {p.pregnant && <span style={PILL_DANGER}>حامل</span>}
                {p.breastfeeding && <span style={PILL_DANGER}>مرضع</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href={fileHref(R.W_BookingModal, "patient", p.id)} style={outlineBtn(42)}><Icon name={PLUS} size={16} color={C.accent} stroke={1.9} />موعد جديد</Link>
              <Link href={fileHref(R.W_SessionNote, "patient", p.id)} style={outlineBtn(42)}><Icon name="edit" size={16} color={C.accent} />ملاحظة</Link>
              <Link href={fileHref(R.W_Prescription, "patient", p.id)} style={outlineBtn(42)}><Icon name="pill" size={16} color={C.accent} />وصفة</Link>
              <Link href={fileHref(R.W_Photos, "patient", p.id)} style={outlineBtn(42)}><Icon name="camera" size={16} color={C.accent} />الصور</Link>
              <button type="button" onClick={() => setEditing(true)} style={outlineBtn(42)}><Icon name="settings" size={16} color={C.accent} />تعديل</button>
            </div>
          </div>
          {p.notes && <div style={{ marginTop: 12, fontSize: 13, color: C.sub, background: "#FAF5FB", borderRadius: 14, padding: "8px 12px" }}>{p.notes}</div>}
        </Panel>

        <div className={t.split}>
          <div className={t.side} style={{ ["--side" as string]: "340px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Conditions patientId={p.id} />
            <Packages patientId={p.id} />
          </div>
          <History p={p} />
        </div>
      </div>
      {editing && <EditPatient p={p} onClose={() => setEditing(false)} />}
    </Shell>
  );
}

function Shell({ children, fileNo }: { children: React.ReactNode; fileNo?: number }) {
  return (
    <AdminShell active="المراجعات" title={fileNo ? `ملف ${fileNo}` : "ملف المراجعة"} subtitle="السجل الصحي للمراجعة" actions={<BackLink href={R.W_Patients}>كل المراجعات</BackLink>}>
      {children}
    </AdminShell>
  );
}

function Conditions({ patientId }: { patientId: string }) {
  const { data, loading } = useQuery(["conditions", patientId], () => listConditions(patientId));
  const [kind, setKind] = useState<ConditionKind>("allergy");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function add() {
    if (!name.trim() || busy) return;
    setBusy(true); setErr("");
    try { await addCondition(patientId, kind, name.trim()); setName(""); } catch (e) { setErr(arErr(e)); } finally { setBusy(false); }
  }
  async function remove(id: string, label: string) {
    if (!window.confirm(`حذف «${label}» من الحالة الصحية؟`)) return;
    setErr("");
    try { await removeCondition(id); } catch (e) { setErr(arErr(e, "تعذّر الحذف. حاولي مرة أخرى.")); }
  }
  return (
    <Panel title="الحالة الصحية" sub="تظهر للأخصائية قبل كل جلسة">
      {loading ? <Loading /> : !data?.length ? <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>لا حساسية أو أدوية مسجّلة.</div> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {data.map((c) => (
            <Tag key={c.id} kind={c.kind === "allergy" ? "pink" : c.kind === "medication" ? "amber" : "lilac"}>
              {KIND_LABEL[c.kind as ConditionKind]}: {c.name}
              <button type="button" aria-label={`حذف ${c.name}`} onClick={() => remove(c.id, c.name)} style={{ border: "none", background: "transparent", padding: 0, marginInlineStart: 4, display: "inline-flex" }}><Icon name="x" size={12} color={C.sub2} /></button>
            </Tag>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Select label="النوع" value={kind} onChange={setKind} options={(Object.keys(KIND_LABEL) as ConditionKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))} style={{ width: 110 }} />
        <TextInput label="الاسم" value={name} onChange={setName} style={{ flex: "1 1 120px", minWidth: 0 }} />
        <button type="button" onClick={add} disabled={!name.trim() || busy} aria-label="إضافة" style={{ ...outlineBtn(46), padding: "0 12px", opacity: !name.trim() || busy ? 0.5 : 1 }}><Icon name={PLUS} size={16} color={C.accent} /></button>
      </div>
      {err && <ErrorNote style={{ marginTop: 8 }}>{err}</ErrorNote>}
    </Panel>
  );
}

function Packages({ patientId }: { patientId: string }) {
  const { data, loading } = useQuery(["clinical", "packages", patientId], () => listPatientPackages(patientId));
  return (
    <Panel title="الباقات">
      {loading ? <Loading /> : !data?.length ? <div style={{ fontSize: 13, color: C.muted }}>لا باقات مشتراة.</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((x) => (
            <div key={x.id} style={{ lineHeight: 1.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700 }}>
                <span>{x.packages?.name ?? "باقة"}</span><span className="latin" style={{ color: C.accent }}>{x.sessions_used}/{x.sessions_total}</span>
              </div>
              <Bar done={x.sessions_used} total={x.sessions_total} />
              <div style={{ fontSize: 12, color: C.sub2, marginTop: 3 }}>اشتُريت {arDate(new Date(x.purchased_at), { day: false, year: true })} · {money(x.price_paid)}</div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function History({ p }: { p: Patient }) {
  const [tab, setT] = useState(0);
  return (
    <Panel className={t.grow}>
      <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {TABS.map((x, i) => <button key={x} type="button" role="tab" aria-selected={tab === i} onClick={() => setT(i)} style={chip(tab === i, 36)}>{x}</button>)}
      </div>
      {tab === 0 && <Visits id={p.id} />}
      {tab === 1 && <Notes id={p.id} />}
      {tab === 2 && <Rx id={p.id} />}
      {tab === 3 && <Consents id={p.id} />}
      {tab === 4 && <Photos id={p.id} />}
    </Panel>
  );
}

const rowStyle = { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1", fontSize: 13.5 } as const;
const when = (iso: string) => `${arDate(new Date(iso), { year: true })} · ${clock(iso)}`;

function Visits({ id }: { id: string }) {
  const { data, loading } = useQuery(["clinical", "visits", id], () => listVisits(id));
  if (loading) return <Loading />;
  if (!data?.length) return <EmptyState compact icon="cal" title="لا زيارات بعد" text="تظهر هنا مواعيدها وزياراتها السابقة." />;
  return <div>{data.map((v) => (
    <div key={v.id} className={t.row} style={rowStyle}>
      <span style={{ flex: 1.2, color: C.sub }}>{when(v.starts_at)}</span>
      <span style={{ flex: 1.3, fontWeight: 700 }}>{v.services?.name ?? v.service_key}</span>
      <span style={{ flex: 1, color: C.sub }}>{v.staff?.name ?? "—"}{v.rooms ? ` · ${v.rooms.name}` : ""}</span>
      <Tag kind={v.status === "done" ? "green" : v.status === "cancelled" || v.status === "no_show" ? "gray" : "lilac"}>{STATUS_LABEL[v.status] ?? v.status}</Tag>
      {v.status === "done" && <Link href={fileHref(R.W_SessionNote, "appointment", v.id)} style={{ fontSize: 12.5, color: C.accent, fontWeight: 600 }}>ملاحظة</Link>}
    </div>
  ))}</div>;
}

function Notes({ id }: { id: string }) {
  const { data, loading } = useQuery(["clinical", "notes", id], () => listNotes(id));
  if (loading) return <Loading />;
  if (!data?.length) return <EmptyState compact icon="edit" title="لا ملاحظات جلسات" text="تكتب الأخصائية ملاحظة بعد كل جلسة." action={<Link href={fileHref(R.W_SessionNote, "patient", id)} style={outlineBtn(40)}>كتابة ملاحظة</Link>} />;
  return <div>{data.map((n) => {
    const f = n.fields as NoteFields;
    return (
      <div key={n.id} style={{ ...rowStyle, display: "block" }}>
        <div style={{ fontSize: 12, color: C.sub2, marginBottom: 4 }}>{when(n.created_at)}{n.staff ? ` · ${n.staff.name}` : ""}</div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{n.body || Object.values(f ?? {}).join(" · ")}</div>
      </div>
    );
  })}</div>;
}

function Rx({ id }: { id: string }) {
  const { data, loading } = useQuery(["clinical", "rx", id], () => listPrescriptions(id));
  if (loading) return <Loading />;
  if (!data?.length) return <EmptyState compact icon="pill" title="لا وصفات" text="تُرسل الوصفة لتطبيق المراجعة وتُحفظ هنا." action={<Link href={fileHref(R.W_Prescription, "patient", id)} style={outlineBtn(40)}>وصفة جديدة</Link>} />;
  return <div>{data.map((r) => (
    <div key={r.id} style={{ ...rowStyle, display: "block" }}>
      <div style={{ fontSize: 12, color: C.sub2, marginBottom: 4 }}>{when(r.created_at)}{r.staff ? ` · ${r.staff.name}` : ""}</div>
      {rxItems(r).map((x, i) => <div key={i}><b>{x.name}</b> — {WHEN_LABEL[x.when]}{x.how ? ` · ${x.how}` : ""}</div>)}
    </div>
  ))}</div>;
}

function Consents({ id }: { id: string }) {
  const { data, loading } = useQuery(["clinical", "consents", id], () => listConsents(id));
  if (loading) return <Loading />;
  if (!data?.length) return <EmptyState compact icon="sign" title="لا موافقات موقّعة" text="توقّع المراجعة الموافقة من تطبيقها أو على جهاز الاستقبال." />;
  return <div>{data.map((c) => (
    <div key={c.id} style={rowStyle}>
      <Icon name="sign" size={18} color={C.accentMid} />
      <span style={{ flex: 1, fontWeight: 700 }}>{(c.answers as { title?: string })?.title ?? c.services?.name ?? "موافقة عامة"}</span>
      <span style={{ color: C.sub }}>{when(c.signed_at)}</span>
      <Tag kind="green">موقّعة</Tag>
    </div>
  ))}</div>;
}

function Photos({ id }: { id: string }) {
  const { data, loading } = useQuery(["clinical", "photos", id], () => listPhotos(id));
  if (loading) return <Loading />;
  if (!data?.length) return <EmptyState compact icon="camera" title="لا صور بعد" text="تُلتقط الصور قبل الجلسة وبعدها من جهاز الاستقبال أو من شاشة الصور." action={<Link href={fileHref(R.W_Photos, "patient", id)} style={outlineBtn(40)}>شاشة الصور</Link>} />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
      {data.map((x) => (
        <Link key={x.id} href={fileHref(R.W_Photos, "patient", id)} style={{ borderRadius: 16, overflow: "hidden", background: "#F3EAF6", aspectRatio: "3/4", position: "relative", display: "block" }}>
          {x.url && <img src={x.url} alt={angleLabel(x.angle)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          <span style={{ position: "absolute", bottom: 6, right: 6, ...PILL_GRAY, height: 20, fontSize: 11 }}>{STAGE_LABEL[x.stage] ?? x.stage} · {arDate(new Date(x.created_at), { day: false })}</span>
        </Link>
      ))}
    </div>
  );
}

/** Same shape createPatient stores (+963…), so the patient's app login still matches the file. */
function normPhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (!d) return null;
  return v.trim().startsWith("+") && !d.startsWith("963") ? `+${d}` : `+963${d.replace(/^(963|0)/, "")}`;
}

function EditPatient({ p, onClose }: { p: Patient; onClose: () => void }) {
  const [name, setName] = useState(p.name);
  const [phone, setPhone] = useState(p.phone ?? "");
  const [dob, setDob] = useState(p.birth_date ?? "");
  const [skin, setSkin] = useState(p.skin_type ?? "");
  const [notes, setNotes] = useState(p.notes ?? "");
  const [preg, setPreg] = useState(p.pregnant);
  const [bf, setBf] = useState(p.breastfeeding);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    setErr("");
    if (!name.trim()) { setErr("اكتبي اسم المراجعة."); return; }
    if (phone.trim() && phone.replace(/\D/g, "").length < 9) { setErr("رقم الهاتف غير مكتمل."); return; }
    setBusy(true);
    try {
      await updatePatient(p.id, { name: name.trim(), phone: normPhone(phone), birth_date: dob || null, skin_type: skin || null, notes: notes.trim() || null, pregnant: preg, breastfeeding: bf });
      onClose();
    } catch (e) { setErr(arErr(e)); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title={`تعديل ملف ${p.file_no}`} footer={<><SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <TextInput label="الاسم" value={name} onChange={setName} />
      <div className={t.two}>
        <TextInput label="الهاتف" value={phone} onChange={setPhone} dir="ltr" />
        <TextInput label="تاريخ الميلاد" value={dob} onChange={setDob} type="date" />
      </div>
      <Select label="نوع البشرة" value={skin} onChange={setSkin} options={[{ value: "", label: "غير محدد" }, ...SKIN_TYPES.map((s) => ({ value: s, label: s }))]} />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><Toggle on={preg} onChange={setPreg} label="حامل" />حامل</label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><Toggle on={bf} onChange={setBf} label="مرضع" />مرضع</label>
      </div>
      <TextArea label="ملاحظات" value={notes} onChange={setNotes} />
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
