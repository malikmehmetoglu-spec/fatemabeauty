"use client";

/** Service and package dialogs (live, Supabase). */
import { arError } from "@/lib/arError";
import { useEffect, useState } from "react";
import { ErrorNote, Modal, NumberInput, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { saveService, savePackage, setPackageActive, type Device, type Package, type Room, type Service } from "@/lib/db/catalog";
import { C } from "@/lib/tokens";
import { Row } from "@/app/admin/settings/rooms/dialogs";

const err = (e: unknown) => arError(e);
const blank = () => ({ name: "", short: "", desc: "", price: "", from: false, minutes: "", room: "", device: "", online: true, consult: false, active: true, sort: "" });

export function ServiceDialog({ open, service, rooms, devices, onClose }: {
  open: boolean; service: Service | null; rooms: Room[]; devices: Device[]; onClose: () => void;
}) {
  const [f, setF] = useState(blank());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError("");
    setF(service ? {
      name: service.name, short: service.short_name, desc: service.description, price: String(service.price), from: service.price_from,
      minutes: String(service.minutes), room: service.room_id ?? "", device: service.device_id ?? "", online: service.bookable_online, consult: service.is_consultation,
      active: service.active, sort: String(service.sort),
    } : blank());
  }, [open, service]);
  const set = <K extends keyof ReturnType<typeof blank>>(k: K, v: ReturnType<typeof blank>[K]) => setF((x) => ({ ...x, [k]: v }));

  async function submit() {
    setError("");
    const price = Number(f.price), minutes = Number(f.minutes);
    if (!f.name.trim()) { setError("اكتبي اسم الخدمة."); return; }
    if (f.price.trim() === "" || !(price >= 0)) { setError("اكتبي السعر (0 للخدمة المجانية)."); return; }
    if (!(minutes > 0)) { setError("اكتبي مدة الجلسة بالدقائق."); return; }
    setBusy(true);
    try {
      await saveService({
        key: service?.key, name: f.name.trim(), short_name: f.short.trim() || f.name.trim(), description: f.desc.trim(),
        price: Math.round(price), price_from: f.from, minutes: Math.round(minutes), room_id: f.room || null, device_id: f.device || null,
        bookable_online: f.online, is_consultation: f.consult, active: f.active, sort: Number(f.sort) || 0,
      });
      onClose();
    } catch (e) { setError(err(e)); } finally { setBusy(false); }
  }

  const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as const;
  return (
    <Modal open={open} onClose={onClose} title={service ? "تعديل الخدمة" : "خدمة جديدة"} width={620}
      footer={<SubmitButton onClick={submit} busy={busy}>{service ? "حفظ التغييرات" : "إضافة الخدمة"}</SubmitButton>}>
      <div style={row}>
        <TextInput label="اسم الخدمة" required value={f.name} onChange={(v) => set("name", v)} placeholder="مثلاً: تنظيف عميق للبشرة" />
        <TextInput label="الاسم المختصر" value={f.short} onChange={(v) => set("short", v)} hint="يظهر في البطاقات الصغيرة وشاشة الانتظار" />
      </div>
      <TextArea label="الوصف" value={f.desc} onChange={(v) => set("desc", v)} rows={2} />
      <div style={row}>
        <NumberInput label="السعر" required suffix="ل.س" value={f.price} onChange={(v) => set("price", v)} hint="0 = مجانية" />
        <NumberInput label="المدة" required suffix="دقيقة" value={f.minutes} onChange={(v) => set("minutes", v)} />
      </div>
      <div style={row}>
        <Select label="الغرفة الأساسية" value={f.room} onChange={(v) => set("room", v)} options={[{ value: "", label: "أي غرفة" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))]} />
        <Select label="الجهاز" value={f.device} onChange={(v) => set("device", v)} options={[{ value: "", label: "بلا جهاز" }, ...devices.map((d) => ({ value: d.id, label: d.name }))]} />
      </div>
      <NumberInput label="الترتيب" value={f.sort} onChange={(v) => set("sort", v)} hint="الأصغر يظهر أولاً في التطبيق" />
      <div>
        <Row title="السعر «يبدأ من»" sub="يظهر السعر مسبوقاً بكلمة «من»"><Toggle on={f.from} onChange={(v) => set("from", v)} label="السعر يبدأ من" /></Row>
        <Row title="قابلة للحجز من التطبيق" sub="تظهر للمراجعات مع الأوقات المتاحة"><Toggle on={f.online} onChange={(v) => set("online", v)} label="قابلة للحجز من التطبيق" /></Row>
        <Row title="خدمة استشارة" sub="تُحجز مع الاستشارية في رابط الحجز العام"><Toggle on={f.consult} onChange={(v) => set("consult", v)} label="خدمة استشارة" /></Row>
        <Row title="مفعّلة" sub="الخدمة الموقوفة لا تظهر للمراجعات"><Toggle on={f.active} onChange={(v) => set("active", v)} label="مفعّلة" /></Row>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

export function PackageDialog({ open, pkg, services, onClose }: { open: boolean; pkg: Package | null; services: Service[]; onClose: () => void }) {
  const [svc, setSvc] = useState("");
  const [name, setName] = useState("");
  const [sessions, setSessions] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError(""); setSvc(pkg?.service_key ?? services[0]?.key ?? ""); setName(pkg?.name ?? "");
    setSessions(pkg ? String(pkg.sessions) : ""); setPrice(pkg ? String(pkg.price) : "");
  }, [open, pkg, services]);

  const s = services.find((x) => x.key === svc);
  const n = Number(sessions), p = Number(price);
  const full = s && n > 0 ? s.price * n : 0;

  async function submit() {
    setError("");
    if (!svc) { setError("اختاري الخدمة."); return; }
    if (!(n > 0)) { setError("اكتبي عدد الجلسات."); return; }
    if (price.trim() === "" || !(p >= 0)) { setError("اكتبي سعر الباقة."); return; }
    setBusy(true);
    try {
      await savePackage({ id: pkg?.id, service_key: svc, name: name.trim() || `باقة ${s?.short_name || s?.name || ""}`.trim(), sessions: Math.round(n), price: Math.round(p), active: true });
      onClose();
    } catch (e) { setError(err(e)); } finally { setBusy(false); }
  }
  async function stop() {
    if (!pkg || !confirm(`إيقاف «${pkg.name}»؟ تبقى الباقات المشتراة سارية.`)) return;
    setBusy(true);
    try { await setPackageActive(pkg.id, false); onClose(); } catch (e) { setError(err(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={pkg ? "تعديل باقة" : "باقة جديدة"} width={520}
      footer={<>
        <SubmitButton onClick={submit} busy={busy}>{pkg ? "حفظ التغييرات" : "إضافة الباقة"}</SubmitButton>
        {pkg?.active && <button type="button" onClick={stop} style={{ border: "none", background: "none", color: C.danger, fontSize: 14, fontWeight: 600, marginInlineStart: "auto" }}>إيقاف الباقة</button>}
      </>}>
      <Select label="الخدمة" value={svc} onChange={setSvc} options={services.map((x) => ({ value: x.key, label: x.name }))} />
      <TextInput label="اسم الباقة" value={name} onChange={setName} placeholder={s ? `باقة ${s.short_name || s.name}` : ""} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <NumberInput label="عدد الجلسات" required value={sessions} onChange={setSessions} />
        <NumberInput label="سعر الباقة" required suffix="ل.س" value={price} onChange={setPrice} />
      </div>
      {full > 0 && price.trim() !== "" && (
        <div style={{ fontSize: 13, color: C.sub2 }}>
          بسعر الجلسة المنفردة: {full.toLocaleString("en-US")} ل.س — {full > p ? `توفّر المراجعة ${(full - p).toLocaleString("en-US")} ل.س` : "لا توفير"}
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
