"use client";

/** «تعديل البيانات» — the patient-file edit dialog, shared by the record page and the patients list. */
import { useState } from "react";
import { ErrorNote, GhostButton, Modal, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { SKIN_TYPES, updatePatient, type Patient } from "@/lib/db/patients";
import t from "../adminPages.module.css";
import { arErr } from "./kit";

/** Same shape createPatient stores (+963…), so the patient's app login still matches the file. */
function normPhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (!d) return null;
  return v.trim().startsWith("+") && !d.startsWith("963") ? `+${d}` : `+963${d.replace(/^(963|0)/, "")}`;
}

/** `contactOnly` («خدمة العملاء»): name + phone only — the database refuses medical fields from that role. */
export function EditPatient({ p, onClose, contactOnly }: { p: Pick<Patient, "id" | "file_no" | "name" | "phone" | "birth_date" | "skin_type" | "notes" | "pregnant" | "breastfeeding">; onClose: () => void; contactOnly?: boolean }) {
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
      await updatePatient(p.id, contactOnly
        ? { name: name.trim(), phone: normPhone(phone) }
        : { name: name.trim(), phone: normPhone(phone), birth_date: dob || null, skin_type: skin || null, notes: notes.trim() || null, pregnant: preg, breastfeeding: bf });
      onClose();
    } catch (e) { setErr(arErr(e)); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title={`تعديل ملف ${p.file_no}`} footer={<><SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <TextInput label="الاسم" value={name} onChange={setName} />
      {contactOnly ? <TextInput label="الهاتف" value={phone} onChange={setPhone} dir="ltr" /> : <>
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
      </>}
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
