"use client";

/** «تعديل الموعد» — date, time, service, level, specialist and note of an upcoming visit (rpc edit_appointment, migration 0200). */
import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Modal, Select, SubmitButton, TextInput } from "@/components/ui";
import { useQuery, invalidate } from "@/lib/db/query";
import { listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { levelsOf, listLevels } from "@/lib/db/levels";
import { levelPrice } from "../settings/services/levels";
import { OPEN_VISIT, bookingError, personName, type Appointment } from "@/lib/db/appointments";
import { atDamascus, clock, dayKey } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";

const TIMES = Array.from({ length: (17 - 10) * 4 + 1 }, (_, i) => {
  const m = 10 * 60 + i * 15;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

export function EditAppointmentDialog({ appt, onClose }: { appt: Appointment | null; onClose: () => void }) {
  const services = useQuery(["catalog", "services"], listServices);
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const levels = useQuery(["levels", "all"], listLevels);
  const [day, setDay] = useState(""); const [time, setTime] = useState("");
  const [svc, setSvc] = useState(""); const [lv, setLv] = useState(""); const [sp, setSp] = useState("");
  const [note, setNote] = useState(""); const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  useEffect(() => {
    if (!appt) return;
    setDay(dayKey(new Date(appt.starts_at))); setTime(clock(appt.starts_at));
    setSvc(appt.service_key ?? ""); setLv(appt.level_id ?? ""); setSp(appt.specialist_id ?? "");
    setNote(appt.note ?? ""); setName(appt.walk_in_name ?? ""); setPhone(appt.walk_in_phone ?? ""); setErr("");
  }, [appt]);
  const lvls = useMemo(() => levelsOf(levels.data, svc), [levels.data, svc]);
  if (!appt) return null;
  const times = TIMES.includes(time) || !time ? TIMES : [time, ...TIMES];

  async function save() {
    if (!day || !time || !svc) { setErr("أكملي التاريخ والوقت والخدمة."); return; }
    setBusy(true); setErr("");
    try {
      const { error } = await supabase.rpc("edit_appointment" as never, {
        p_id: appt!.id, p_starts: atDamascus(day, time), p_service: svc, p_level: lv || lvls[0]?.id || null,
        p_specialist: sp || null, p_note: note, p_walk_in_name: name, p_walk_in_phone: phone,
      } as never);
      if (error) throw error;
      invalidate("appointments"); invalidate("reception"); invalidate("booking-requests");
      onClose();
    } catch (e) { setErr(/not allowed/.test(String((e as Error)?.message)) ? "تعديل المواعيد للإدارة والاستقبال." : bookingError(e)); }
    finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={`تعديل موعد — ${personName(appt)}`} width={540}
      footer={<SubmitButton busy={busy} onClick={save}>حفظ التعديلات</SubmitButton>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <TextInput label="التاريخ" type="date" dir="ltr" value={day} onChange={setDay} />
        <Select label="الوقت" value={time} onChange={setTime} options={times.map((t) => ({ value: t, label: t }))} />
      </div>
      <Select label="الخدمة" value={svc} onChange={(v) => { setSvc(v); setLv(""); }}
        options={(services.data ?? []).filter((s) => s.key !== OPEN_VISIT).map((s) => ({ value: s.key, label: `${s.name} · ${s.minutes} د · ${priceLabel(s)}` }))} />
      {lvls.length > 1 && (
        <Select label="المستوى" value={lv || lvls[0].id} onChange={setLv} options={lvls.map((l) => ({ value: l.id, label: `${l.name} · ${l.minutes} د · ${levelPrice(l)}` }))} />
      )}
      <Select label="الأخصائية" value={sp} onChange={setSp} options={[{ value: "", label: "غير محدّدة" }, ...(team.data ?? []).map((t) => ({ value: t.id, label: t.name }))]} />
      {!appt.patient_id && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <TextInput label="الاسم" value={name} onChange={setName} />
          <TextInput label="رقم الهاتف" dir="ltr" value={phone} onChange={setPhone} />
        </div>
      )}
      <TextInput label="ملاحظة" value={note} onChange={setNote} />
      <div style={{ fontSize: 12.5, color: "#8a7a90", lineHeight: 1.6 }}>تغيير الخدمة أو المستوى يعيد حساب السعر والمدة. آخر موعد 5:00 مساءً، ولا مواعيد يوم الجمعة.</div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
