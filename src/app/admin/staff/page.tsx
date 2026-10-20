"use client";

/**
 * W_Staff.dc.html — فريق العمل (live, Supabase `staff`).
 * Add / edit members, upload a photo, create the login (Edge Function «staff-admin»), reset password, deactivate.
 */
import { arError } from "@/lib/arError";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Modal, NumberInput, Segment, Select, SubmitButton, Tag, TextInput, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listSalaries, saveSalary, type Currency } from "@/lib/db/fx";
import { useUsdRate } from "@/app/admin/finance/FxCard";
import { Row } from "@/app/admin/settings/rooms/dialogs";
import { saveStaff, setStaffActive, staffAdmin, staffPhoto, uploadStaffPhoto, type Role, type Staff } from "@/lib/db/staff";
import { useSession, ROLE_LABEL } from "@/lib/supabase/session";
import { arDate, money } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { RowBtn, StaffAvatar, TeamTabs, errText, useTeam } from "./team-ui";
import { listAllServices, listCategories, type Service } from "@/lib/db/catalog";
import { listAssignments, servicesSummary, setStaffServices, type Assignment } from "@/lib/db/staffServices";
import { ServicePicker } from "./ServicePicker";

export default function StaffPage() {
  const { staff: me } = useSession();
  const { list, loading, error, refresh } = useTeam();
  const [editing, setEditing] = useState<Staff | "new" | null>(null);
  const [login, setLogin] = useState<Staff | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [msg, setMsg] = useState("");
  const svcQ = useQuery(["catalog", "services", "all"], listAllServices);
  const asgQ = useQuery(["staff_services"], listAssignments);

  const isOwner = me?.role === "owner";
  const canManage = me?.role === "owner" || me?.role === "admin";
  /** Owner row: only the owner. Admin rows: only the owner (or the admin herself). */
  const canEdit = (s: Staff) => canManage && (s.role === "owner" ? isOwner && s.id === me?.id : s.role === "admin" ? isOwner || s.id === me?.id : true);

  const active = list.filter((s) => s.active);
  const shown = showInactive ? list : active;
  const count = (r: Role[]) => active.filter((s) => r.includes(s.role)).length;

  async function toggleActive(s: Staff) {
    if (!confirm(s.active ? `إيقاف «${s.name}»؟ لن تتمكن من الدخول حتى إعادة تفعيلها.` : `إعادة تفعيل «${s.name}»؟`)) return;
    setMsg("");
    try { await setStaffActive(s, !s.active); } catch (e) { setMsg(errText(e)); }
  }

  async function deleteMember(s: Staff) {
    if (!confirm(`حذف «${s.name}» نهائياً مع حساب دخولها؟ لا يمكن التراجع عن الحذف.`)) return;
    setMsg("");
    try { await staffAdmin({ action: "delete", staff_id: s.id }); await refresh(); } catch (e) { setMsg(errText(e)); }
  }

  return (
    <AdminShell active="فريق العمل" title="فريق العمل" subtitle={arDate(new Date())}
      actions={canManage ? <GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة موظفة</GhostButton> : undefined}>
      <TeamTabs />
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="الفريق النشط" value={active.length} sub={list.length > active.length ? `${list.length - active.length} موقوفة` : "كل الحسابات نشطة"} icon="users" />
        <Kpi label="أخصائيات" value={count(["specialist"])} sub="يظهرن في الحجز" icon="sparkle" />
        <Kpi label="استقبال ومحاسبة" value={count(["reception", "accountant"])} icon="cash" />
        <Kpi label="بلا حساب دخول" value={active.filter((s) => !s.user_id).length} sub="أنشئي لهن حساباً" icon="lock" />
      </div>

      {msg && <ErrorNote>{msg}</ErrorNote>}

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الفريق: {error}</ErrorNote> : (
        <>
          {shown.length > 0 && <TeamTable rows={shown} me={me} services={svcQ.data ?? []} assignments={asgQ.data ?? []} canEdit={canEdit} onEdit={setEditing} onLogin={setLogin} onToggle={toggleActive} onDelete={deleteMember} />}
          {list.length > active.length && (
            <button type="button" onClick={() => setShowInactive((v) => !v)} style={{ alignSelf: "flex-start", border: "none", background: "none", color: C.accent, fontSize: 13.5, fontWeight: 600 }}>
              {showInactive ? "إخفاء الموقوفات" : `إظهار الموقوفات (${list.length - active.length})`}
            </button>
          )}
          {active.length <= 1 && (
            <EmptyState icon="users" title="لم تُضف أي موظفة بعد"
              text="أضيفي أعضاء الفريق: الاسم والدور ورقم الهاتف والصورة، ثم أنشئي لكل منهن اسم مستخدم وكلمة مرور للدخول إلى اللوحة."
              action={canManage ? <GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة موظفة</GhostButton> : undefined} />
          )}
        </>
      )}

      <StaffDialog open={!!editing} member={editing === "new" ? null : editing} isOwner={isOwner} onClose={() => setEditing(null)} />
      <LoginDialog member={login} onClose={() => setLogin(null)} />
    </AdminShell>
  );
}

function TeamTable({ rows, me, services, assignments, canEdit, onEdit, onLogin, onToggle, onDelete }: {
  rows: Staff[]; me: Staff | null; services: Service[]; assignments: Assignment[]; canEdit: (s: Staff) => boolean; onEdit: (s: Staff) => void; onLogin: (s: Staff) => void; onToggle: (s: Staff) => void; onDelete: (s: Staff) => void;
}) {
  return (
    <DataTable headers={["الموظفة", "الدور", "الخدمات", "الهاتف", "حساب الدخول", "الحالة", ""]} widths={[2, 0.9, 1.2, 1.1, 1.3, 0.7, 3.8]} minWidth={1300} rowHeight={64}
      rows={rows.map((s) => [
        <>
          <StaffAvatar s={s} size={42} />
          <div style={{ lineHeight: 1.35, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}{s.id === me?.id && <span style={{ fontSize: 11.5, color: C.sub2, fontWeight: 600 }}> (أنتِ)</span>}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{s.title || "—"}{s.photo_placeholder && s.photo_url && <Tag kind="amber" style={{ height: 18, padding: "0 7px", fontSize: 10.5, marginInlineStart: 6 }}>صورة مؤقتة</Tag>}</div>
          </div>
        </>,
        <Tag key="r" kind={s.role === "owner" ? "plum" : s.role === "admin" ? "lilac" : s.role === "specialist" ? "pink" : "gray"}>{ROLE_LABEL[s.role]}</Tag>,
        s.role === "specialist" || s.is_consultant || assignments.some((a) => a.staff_id === s.id) ? (() => {
          const keys = assignments.filter((a) => a.staff_id === s.id).map((a) => a.service_key);
          return <span key="sv" title={keys.length ? services.filter((x) => keys.includes(x.key)).map((x) => x.short_name || x.name).join("، ") : "إن لم تُحدَّد خدمات تقدّم كل خدمات قسمها"}
            style={{ fontSize: 12.5, fontWeight: 600, color: keys.length ? C.accent : C.sub2 }}>{keys.length ? servicesSummary(keys, services) : s.is_consultant ? "كل الاستشارات" : "كل الخدمات"}</span>;
        })() : <span key="sv" style={{ color: C.muted }}>—</span>,
        <span key="p" className="latin" dir="ltr">{s.phone || "—"}</span>,
        s.user_id
          ? <span key="l" className="latin" dir="ltr" style={{ fontSize: 12.5, color: C.sub }}>{s.username || s.email}</span>
          : <span key="l" style={{ fontSize: 12.5, color: C.muted }}>لا يوجد حساب</span>,
        <Tag key="a" kind={s.active ? "green" : "gray"}>{s.active ? "نشطة" : "موقوفة"}</Tag>,
        canEdit(s) ? (
          <span key="b" style={{ display: "flex", gap: 8, flexWrap: "nowrap", justifyContent: "flex-end", width: "100%" }}>
            <RowBtn icon="edit" label="تعديل" onClick={() => onEdit(s)} />
            <RowBtn icon="lock" label={s.user_id ? "كلمة المرور" : "إنشاء حساب"} onClick={() => onLogin(s)} />
            {s.id !== me?.id && s.role !== "owner" && <RowBtn icon={s.active ? "pause" : "refresh"} label={s.active ? "إيقاف" : "تفعيل"} color={s.active ? C.danger : C.okDeep} onClick={() => onToggle(s)} />}
            {s.id !== me?.id && s.role !== "owner" && <RowBtn icon="trash" label="حذف" color={C.danger} onClick={() => onDelete(s)} />}
          </span>
        ) : <span key="b" />,
      ])} />
  );
}

function StaffDialog({ open, member, isOwner, onClose }: { open: boolean; member: Staff | null; isOwner: boolean; onClose: () => void }) {
  const [name, setName] = useState(""); const [title, setTitle] = useState(""); const [role, setRole] = useState<Role>("specialist"); const [phone, setPhone] = useState(""); const [consultant, setConsultant] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const salaries = useQuery(["salaries"], listSalaries);
  const { rate } = useUsdRate();
  const [salary, setSalary] = useState(""); const [cur, setCur] = useState<Currency>("SYP");
  const curSalary = member ? (salaries.data ?? []).find((x) => x.staff_id === member.id) : undefined;
  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? ""); setTitle(member?.title ?? ""); setRole(member?.role ?? "specialist"); setPhone(member?.phone ?? ""); setConsultant(member?.is_consultant ?? false); setFile(null); setError("");
    setSalary(curSalary?.base_salary ? String(curSalary.base_salary) : ""); setCur((curSalary?.salary_currency as Currency) ?? "SYP");
  }, [open, member, curSalary]);
  const salN = Math.round(Number(salary || 0));
  // «الخدمات التي تقدّمها»
  const allSvc = useQuery(["catalog", "services", "all"], listAllServices);
  const cats = useQuery(["catalog", "categories", "all"], () => listCategories(true));
  const asg = useQuery(["staff_services"], listAssignments);
  const [svcKeys, setSvcKeys] = useState<string[]>([]);
  const curKeys = member ? (asg.data ?? []).filter((a) => a.staff_id === member.id).map((a) => a.service_key).sort().join("|") : "";
  useEffect(() => { if (open) setSvcKeys(curKeys ? curKeys.split("|") : []); }, [open, curKeys]);
  const showServices = role === "specialist" || consultant || svcKeys.length > 0;

  const roleOpts: { value: Role; label: string }[] = (member?.role === "owner" ? ["owner"] as Role[] : (isOwner ? ["admin", "specialist", "reception", "accountant"] : ["specialist", "reception", "accountant", ...(member?.role === "admin" ? ["admin"] : [])]) as Role[])
    .map((r) => ({ value: r, label: ROLE_LABEL[r] }));
  const preview = file ? URL.createObjectURL(file) : member ? staffPhoto(member) : null;

  async function submit() {
    setError("");
    if (!name.trim()) { setError("اكتبي اسم الموظفة."); return; }
    setBusy(true);
    try {
      const photo_url = file ? await uploadStaffPhoto(file) : member?.photo_url ?? null;
      const row = await saveStaff({ id: member?.id, name: name.trim(), title: title.trim(), role, phone: phone.trim() || null, photo_url, ...(file ? { photo_placeholder: false } : {}), is_consultant: consultant });
      if (row && asg.data && svcKeys.slice().sort().join("|") !== curKeys) await setStaffServices(row.id, svcKeys, asg.data);
      if (row && (salN !== (curSalary?.base_salary ?? 0) || cur !== (curSalary?.salary_currency ?? "SYP"))) await saveSalary(row.id, salN, cur);
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={member ? "تعديل بيانات الموظفة" : "إضافة موظفة"} width={600}
      footer={<SubmitButton onClick={submit} busy={busy}>{member ? "حفظ التعديلات" : "إضافة"}</SubmitButton>}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <label style={{ width: 96, height: 96, borderRadius: 48, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", fontSize: 11.5, color: C.sub2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><Icon name="camera" size={24} />صورة</>}
          <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {!file && member?.photo_placeholder && member.photo_url && <Tag kind="amber" style={{ height: 20, padding: "0 8px", fontSize: 11 }}>صورة مؤقتة</Tag>}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="الاسم الكامل" required value={name} onChange={setName} />
          <TextInput label="المسمى الوظيفي" value={title} onChange={setTitle} placeholder="أخصائية بشرة، موظفة استقبال…" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="الدور (يحدد الصلاحيات)" value={role} onChange={setRole} options={roleOpts} />
        <TextInput label="رقم الهاتف" dir="ltr" value={phone} onChange={setPhone} placeholder="09xx xxx xxx" />
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <NumberInput label="الراتب الشهري الأساسي" value={salary} onChange={(v) => setSalary(v.replace(/\./g, ""))} suffix={cur === "USD" ? "$" : "ل.س"} style={{ flex: "1 1 220px" }}
          hint={cur === "USD" && salN > 0 ? (rate ? <>≈ <span dir="ltr" className="latin">{money(Math.round(salN * Number(rate.usd_to_syp)), false)}</span> ل.س بسعر اليوم (<span dir="ltr" className="latin">{money(Number(rate.usd_to_syp), false)}</span>)</> : "لم يُحدَّد سعر الصرف بعد — حدّديه من المالية") : "يُستخدم عند توليد مسير الرواتب"} />
        <div style={{ marginTop: 25 }}><Segment label="عملة الراتب" value={cur} onChange={setCur} options={[{ value: "SYP", label: "ل.س" }, { value: "USD", label: "$" }]} /></div>
      </div>
      <Row title="استشارية" sub="تظهر في «استشارة» برابط الحجز العام بدل جلسات العناية"><Toggle on={consultant} onChange={setConsultant} label="استشارية" /></Row>
      {showServices && (allSvc.data && cats.data
        ? <ServicePicker services={allSvc.data} categories={cats.data} value={svcKeys} onChange={setSvcKeys} consultant={consultant} />
        : <Loading label="نحمّل الخدمات…" style={{ padding: 8 }} />)}
      {!isOwner && <div style={{ fontSize: 12.5, color: C.sub2 }}>دور «الإدارة» يمنحه المدير العام فقط.</div>}
      {!member && <div style={{ fontSize: 12.5, color: C.sub2 }}>بعد الإضافة أنشئي حساب الدخول من زر «إنشاء حساب».</div>}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

function LoginDialog({ member, onClose }: { member: Staff | null; onClose: () => void }) {
  const [login, setLogin] = useState(""); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState("");
  useEffect(() => { setLogin(""); setPw(""); setPw2(""); setError(""); setDone(""); }, [member]);
  const creating = !!member && !member.user_id;

  async function submit() {
    if (!member) return;
    setError("");
    if (creating && login.trim().length < 3) { setError("اكتبي اسم مستخدم (3 أحرف لاتينية على الأقل) أو بريداً إلكترونياً."); return; }
    if (pw.length < 8) { setError("كلمة المرور 8 أحرف على الأقل."); return; }
    if (pw !== pw2) { setError("كلمتا المرور غير متطابقتين."); return; }
    setBusy(true);
    try {
      if (creating) {
        await staffAdmin({ action: "create", staff_id: member.id, login: login.trim(), password: pw });
        setDone(`تم إنشاء الحساب. تدخل الموظفة باسم المستخدم «${login.trim().toLowerCase()}» وكلمة المرور التي اخترتِها.`);
      } else {
        await staffAdmin({ action: "password", staff_id: member.id, password: pw });
        setDone("تم تغيير كلمة المرور.");
      }
    } catch (e) { setError(arError(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={!!member} onClose={onClose} title={creating ? `إنشاء حساب دخول — ${member?.name ?? ""}` : `تغيير كلمة المرور — ${member?.name ?? ""}`} width={500}
      footer={done ? <SubmitButton onClick={onClose}>تم</SubmitButton> : <SubmitButton onClick={submit} busy={busy}>{creating ? "إنشاء الحساب" : "حفظ كلمة المرور"}</SubmitButton>}>
      {done ? <div style={{ fontSize: 14, color: C.okDeep, fontWeight: 600, lineHeight: 1.8 }}>{done}</div> : (
        <>
          {creating
            ? <TextInput label="اسم المستخدم أو البريد الإلكتروني" required dir="ltr" value={login} onChange={setLogin} placeholder="username" hint="بأحرف لاتينية. تكتبه الموظفة في شاشة دخول الموظفين." />
            : <div style={{ fontSize: 13.5, color: C.sub }}>اسم الدخول: <b className="latin" dir="ltr">{member?.username || member?.email}</b></div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput label="كلمة المرور" type="password" dir="ltr" required value={pw} onChange={setPw} hint="8 أحرف على الأقل" />
            <TextInput label="تأكيد كلمة المرور" type="password" dir="ltr" required value={pw2} onChange={setPw2} />
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      )}
    </Modal>
  );
}
