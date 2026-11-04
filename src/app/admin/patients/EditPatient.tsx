"use client";

/** «تعديل البيانات» — the patient-file edit dialog, shared by the record page and the patients list. */
import { useState } from "react";
import { ErrorNote, GhostButton, Modal, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { SKIN_TYPES, updatePatient, type Patient } from "@/lib/db/patients";
import t from "../adminPages.module.css";
import { arErr } from "./kit";
import { BirthDateSelect, GenderPick, isoBirth, MARITAL_LABEL, maritalLabel } from "./basicInfo";

/** Same shape createPatient stores (+963…), so the patient's app login still matches the file. */
function normPhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (!d) return null;
  return v.trim().startsWith("+") && !d.startsWith("963") ? `+${d}` : `+963${d.replace(/^(963|0)/, "")}`;
}

/** `contactOnly` («خدمة العملاء»): basic info only — the database refuses medical fields from that role. */
type EditP = Pick<Patient, "id" | "file_no" | "name" | "phone" | "birth_date" | "skin_type" | "notes" | "pregnant" | "breastfeeding"> & Partial<Pick<Patient, "gender" | "city" | "address" | "occupation" | "referral" | "emergency_phone" | "marital_status">>;
export function EditPatient({ p, onClose, contactOnly }: { p: EditP; onClose: () => void; contactOnly?: boolean }) {
  const [name, setName] = useState(p.name);
  const [phone, setPhone] = useState(p.phone ?? "");
  const [dob, setDob] = useState(p.birth_date ?? "");
  const [gender, setGender] = useState<"female" | "male">(p.gender === "male" ? "male" : "female");
  const [marital, setMarital] = useState(p.marital_status ?? "");
  const [city, setCity] = useState(p.city ?? "");
  const [address, setAddress] = useState(p.address ?? "");
  const [job, setJob] = useState(p.occupation ?? "");
  const [emerg, setEmerg] = useState(p.emergency_phone ?? "");
  const [ref, setRef] = useState(p.referral ?? "");
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
    if (emerg.trim() && emerg.replace(/\D/g, "").length < 9) { setErr("رقم الطوارئ غير مكتمل."); return; }
    const birth = isoBirth(dob);
    if (birth === null) { setErr("أكملي تاريخ الميلاد (اليوم والشهر والسنة) أو اتركيه فارغاً."); return; }
    setBusy(true);
    const basic = {
      name: name.trim(), phone: normPhone(phone), birth_date: birth || null, gender,
      marital_status: marital || null, city: city.trim() || null, address: address.trim() || null,
      occupation: job.trim() || null, emergency_phone: normPhone(emerg), referral: ref.trim() || null,
    };
    try {
      await updatePatient(p.id, contactOnly ? basic
        : { ...basic, skin_type: skin || null, notes: notes.trim() || null, pregnant: gender === "male" ? false : preg, breastfeeding: gender === "male" ? false : bf });
      onClose();
    } catch (e) { setErr(arErr(e)); }
    setBusy(false);
  }
  return (
    <Modal open onClose={onClose} title={`تعديل ملف ${p.file_no}`} footer={<><SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <TextInput label="الاسم" value={name} onChange={setName} />
      <div className={t.two}>
        <TextInput label="الهاتف" value={phone} onChange={setPhone} dir="ltr" />
        <GenderPick value={gender} onChange={setGender} />
      </div>
      <div className={t.two}>
        <BirthDateSelect value={dob} onChange={setDob} />
        <Select label="الحالة الاجتماعية" value={marital} onChange={setMarital} options={[{ value: "", label: "غير محدد" }, ...Object.keys(MARITAL_LABEL).map((k) => ({ value: k, label: maritalLabel(k, gender) ?? k }))]} />
      </div>
      <div className={t.two}>
        <TextInput label="المدينة" value={city} onChange={setCity} />
        <TextInput label="المهنة" value={job} onChange={setJob} />
      </div>
      <TextInput label="العنوان" value={address} onChange={setAddress} />
      <div className={t.two}>
        <TextInput label="رقم للطوارئ" value={emerg} onChange={setEmerg} dir="ltr" />
        <TextInput label="كيف عرفتِ بنا" value={ref} onChange={setRef} placeholder="صديقة، إنستغرام…" />
      </div>
      {!contactOnly && <>
      <Select label="نوع البشرة" value={skin} onChange={setSkin} options={[{ value: "", label: "غير محدد" }, ...SKIN_TYPES.map((s) => ({ value: s, label: s }))]} />
      {gender === "female" && <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><Toggle on={preg} onChange={setPreg} label="حامل" />حامل</label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><Toggle on={bf} onChange={setBf} label="مرضع" />مرضع</label>
      </div>}
      <TextArea label="ملاحظات" value={notes} onChange={setNotes} />
      </>}
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
