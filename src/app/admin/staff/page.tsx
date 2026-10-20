"use client";

/**
 * W_Staff.dc.html — فريق العمل (live, Supabase `staff`).
 * Add / edit members, upload a photo, create the login (Edge Function «staff-admin»), reset password, deactivate.
 */
import { arError } from "@/lib/arError";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Modal, Select, SubmitButton, Tag, TextInput, Toggle } from "@/components/ui";
import { Row } from "@/app/admin/settings/rooms/dialogs";
import { saveStaff, setStaffActive, staffAdmin, staffPhoto, uploadStaffPhoto, type Role, type Staff } from "@/lib/db/staff";
import { useSession, ROLE_LABEL } from "@/lib/supabase/session";
import { arDate } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { RowBtn, StaffAvatar, TeamTabs, errText, useTeam } from "./team-ui";

export default function StaffPage() {
  const { staff: me } = useSession();
  const { list, loading, error } = useTeam();
  const [editing, setEditing] = useState<Staff | "new" | null>(null);
  const [login, setLogin] = useState<Staff | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [msg, setMsg] = useState("");

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
          {shown.length > 0 && <TeamTable rows={shown} me={me} canEdit={canEdit} onEdit={setEditing} onLogin={setLogin} onToggle={toggleActive} />}
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

function TeamTable({ rows, me, canEdit, onEdit, onLogin, onToggle }: {
  rows: Staff[]; me: Staff | null; canEdit: (s: Staff) => boolean; onEdit: (s: Staff) => void; onLogin: (s: Staff) => void; onToggle: (s: Staff) => void;
}) {
  return (
    <DataTable headers={["الموظفة", "الدور", "الهاتف", "حساب الدخول", "الحالة", ""]} widths={[2.1, 1, 1.1, 1.4, 0.8, 3]} minWidth={1100} rowHeight={64}
      rows={rows.map((s) => [
        <>
          <StaffAvatar s={s} size={42} />
          <div style={{ lineHeight: 1.35, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{s.name}{s.id === me?.id && <span style={{ fontSize: 11.5, color: C.sub2, fontWeight: 600 }}> (أنتِ)</span>}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{s.title || "—"}</div>
          </div>
        </>,
        <Tag key="r" kind={s.role === "owner" ? "plum" : s.role === "admin" ? "lilac" : s.role === "specialist" ? "pink" : "gray"}>{ROLE_LABEL[s.role]}</Tag>,
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
          </span>
        ) : <span key="b" />,
      ])} />
  );
}

function StaffDialog({ open, member, isOwner, onClose }: { open: boolean; member: Staff | null; isOwner: boolean; onClose: () => void }) {
  const [name, setName] = useState(""); const [title, setTitle] = useState(""); const [role, setRole] = useState<Role>("specialist"); const [phone, setPhone] = useState(""); const [consultant, setConsultant] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? ""); setTitle(member?.title ?? ""); setRole(member?.role ?? "specialist"); setPhone(member?.phone ?? ""); setConsultant(member?.is_consultant ?? false); setFile(null); setError("");
  }, [open, member]);

  const roleOpts: { value: Role; label: string }[] = (member?.role === "owner" ? ["owner"] as Role[] : (isOwner ? ["admin", "specialist", "reception", "accountant"] : ["specialist", "reception", "accountant", ...(member?.role === "admin" ? ["admin"] : [])]) as Role[])
    .map((r) => ({ value: r, label: ROLE_LABEL[r] }));
  const preview = file ? URL.createObjectURL(file) : member ? staffPhoto(member) : null;

  async function submit() {
    setError("");
    if (!name.trim()) { setError("اكتبي اسم الموظفة."); return; }
    setBusy(true);
    try {
      const photo_url = file ? await uploadStaffPhoto(file) : member?.photo_url ?? null;
      await saveStaff({ id: member?.id, name: name.trim(), title: title.trim(), role, phone: phone.trim() || null, photo_url, is_consultant: consultant });
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={member ? "تعديل بيانات الموظفة" : "إضافة موظفة"} width={600}
      footer={<SubmitButton onClick={submit} busy={busy}>{member ? "حفظ التعديلات" : "إضافة"}</SubmitButton>}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <label style={{ width: 96, height: 96, borderRadius: 48, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", fontSize: 11.5, color: C.sub2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><Icon name="camera" size={24} />صورة</>}
          <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="الاسم الكامل" required value={name} onChange={setName} />
          <TextInput label="المسمى الوظيفي" value={title} onChange={setTitle} placeholder="أخصائية بشرة، موظفة استقبال…" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="الدور (يحدد الصلاحيات)" value={role} onChange={setRole} options={roleOpts} />
        <TextInput label="رقم الهاتف" dir="ltr" value={phone} onChange={setPhone} placeholder="09xx xxx xxx" />
      </div>
      <Row title="استشارية" sub="تظهر في «استشارة» برابط الحجز العام بدل جلسات العناية"><Toggle on={consultant} onChange={setConsultant} label="استشارية" /></Row>
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
