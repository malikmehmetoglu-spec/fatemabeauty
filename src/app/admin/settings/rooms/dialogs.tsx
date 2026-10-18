"use client";

/** Room and device dialogs (live, Supabase) — shared by الغرف والأجهزة and الأجهزة pages. */
import { arError } from "@/lib/arError";
import { useEffect, useState } from "react";
import { ErrorNote, Modal, NumberInput, Select, SubmitButton, TextInput, Toggle } from "@/components/ui";
import { removeDevice, saveDevice, saveRoom, type Device, type Room } from "@/lib/db/catalog";
import { C } from "@/lib/tokens";

const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (/duplicate key.*name/i.test(m)) return "يوجد اسم مطابق مسبقاً.";
  if (/foreign key/i.test(m)) return "لا يمكن الحذف: هناك خدمة مرتبطة بهذا الجهاز. غيّري جهاز الخدمة أولاً.";
  return arError(e);
};

export function RoomDialog({ open, room, onClose }: { open: boolean; room: Room | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [sort, setSort] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError(""); setName(room?.name ?? ""); setSort(room ? String(room.sort) : ""); setActive(room?.active ?? true);
  }, [open, room]);

  async function submit() {
    if (!name.trim()) { setError("اكتبي اسم الغرفة."); return; }
    setBusy(true); setError("");
    try { await saveRoom({ id: room?.id, name: name.trim(), sort: Number(sort) || 0, active }); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={room ? "تعديل غرفة" : "غرفة جديدة"} width={480}
      footer={<SubmitButton onClick={submit} busy={busy}>{room ? "حفظ التعديلات" : "إضافة الغرفة"}</SubmitButton>}>
      <TextInput label="اسم الغرفة" required value={name} onChange={setName} placeholder="مثلاً: غرفة 1" />
      <NumberInput label="الترتيب" value={sort} onChange={setSort} hint="الأصغر يظهر أولاً" />
      <Row title="متاحة للحجز" sub="الغرفة المغلقة لا تظهر في الحجز"><Toggle on={active} onChange={setActive} label="متاحة للحجز" /></Row>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

export function DeviceDialog({ open, device, rooms, onClose }: { open: boolean; device: Device | null; rooms: Room[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [maint, setMaint] = useState(false);
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError(""); setName(device?.name ?? ""); setRoom(device?.room_id ?? ""); setMaint(device?.in_maintenance ?? false); setNext(device?.next_service_at ?? "");
  }, [open, device]);

  async function submit() {
    if (!name.trim()) { setError("اكتبي اسم الجهاز."); return; }
    setBusy(true); setError("");
    try { await saveDevice({ id: device?.id, name: name.trim(), room_id: room || null, in_maintenance: maint, next_service_at: next || null }); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  async function remove() {
    if (!device || !confirm(`حذف الجهاز «${device.name}»؟`)) return;
    setBusy(true); setError("");
    try { await removeDevice(device.id); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={device ? "تعديل جهاز" : "جهاز جديد"} width={520}
      footer={<>
        <SubmitButton onClick={submit} busy={busy}>{device ? "حفظ التعديلات" : "إضافة الجهاز"}</SubmitButton>
        {device && <button type="button" onClick={remove} style={{ border: "none", background: "none", color: C.danger, fontSize: 14, fontWeight: 600, marginInlineStart: "auto" }}>حذف الجهاز</button>}
      </>}>
      <TextInput label="اسم الجهاز" required value={name} onChange={setName} placeholder="مثلاً: جهاز الليزر" />
      <Select label="الغرفة" value={room} onChange={setRoom} options={[{ value: "", label: "بلا غرفة" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))]} />
      <TextInput label="موعد الصيانة القادمة" type="date" dir="ltr" value={next} onChange={setNext} />
      <Row title="في الصيانة" sub="الخدمات المرتبطة به تُعلَّم بأن الجهاز غير متاح"><Toggle on={maint} onChange={setMaint} label="في الصيانة" /></Row>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

export function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
      <div style={{ lineHeight: 1.35 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.sub2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
