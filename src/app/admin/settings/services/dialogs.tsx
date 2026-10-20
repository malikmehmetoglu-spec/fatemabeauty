"use client";

/** Service and package dialogs (live, Supabase). */
import { arError } from "@/lib/arError";
import { useEffect, useState } from "react";
import { ErrorNote, Icon, Modal, NumberInput, Segment, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { saveCategory, saveService, savePackage, setPackageActive, sypCeil5, type Category, type Device, type Package, type Room, type Service } from "@/lib/db/catalog";
import { C } from "@/lib/tokens";
import { Row } from "@/app/admin/settings/rooms/dialogs";
import { useQuery } from "@/lib/db/query";
import { listStaff } from "@/lib/db/staff";
import { serviceProviders } from "@/lib/db/appointments";
import { listAssignments, setServiceStaff } from "@/lib/db/staffServices";
import { StaffAvatar } from "@/app/admin/staff/team-ui";
import { SELECTED } from "@/lib/tokens";

const err = (e: unknown) => arError(e);
const blank = (cat = "") => ({ name: "", short: "", desc: "", price: "", cur: "SYP" as "SYP" | "USD", cat, from: false, minutes: "", room: "", device: "", online: true, consult: false, active: true, sort: "" });

export function ServiceDialog({ open, service, rooms, devices, categories, rate, defaultCategory, onClose }: {
  open: boolean; service: Service | null; rooms: Room[]; devices: Device[]; categories: Category[]; rate: number | null; defaultCategory?: string; onClose: () => void;
}) {
  const [f, setF] = useState(blank());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError("");
    setF(service ? {
      name: service.name, short: service.short_name, desc: service.description, price: String(service.price), cur: service.price_currency === "USD" ? "USD" : "SYP", cat: service.category_id ?? "", from: service.price_from,
      minutes: String(service.minutes), room: service.room_id ?? "", device: service.device_id ?? "", online: service.bookable_online, consult: service.is_consultation,
      active: service.active, sort: String(service.sort),
    } : blank(defaultCategory ?? categories[0]?.key ?? ""));
  }, [open, service, defaultCategory, categories]);
  // «من تقدّمها» — same table as «الخدمات التي تقدّمها» in the staff dialog
  const team = useQuery(["staff", "all"], listStaff);
  const prov = useQuery(["appointments", "providers"], serviceProviders);
  const asg = useQuery(["staff_services"], listAssignments);
  const cands = (team.data ?? []).filter((t) => t.active && (t.role === "specialist" || t.is_consultant || (asg.data ?? []).some((a) => a.staff_id === t.id)));
  const [who, setWho] = useState<string[] | null>(null);
  const providedNow = cands.filter((t) => service && (prov.data?.map[t.id] ?? []).includes(service.key)).map((t) => t.id);
  useEffect(() => { if (open) setWho(null); }, [open, service]);
  const picked = who ?? (service ? providedNow : cands.filter((t) => (f.consult ? t.is_consultant : t.role === "specialist" && !t.is_consultant) && !(asg.data ?? []).some((a) => a.staff_id === t.id)).map((t) => t.id));
  const set = <K extends keyof ReturnType<typeof blank>>(k: K, v: ReturnType<typeof blank>[K]) => setF((x) => ({ ...x, [k]: v }));

  async function submit() {
    setError("");
    const price = Number(f.price), minutes = Number(f.minutes);
    if (!f.name.trim()) { setError("اكتبي اسم الخدمة."); return; }
    if (f.price.trim() === "" || !(price >= 0)) { setError("اكتبي السعر (0 للخدمة المجانية)."); return; }
    if (!(minutes > 0)) { setError("اكتبي مدة الجلسة بالدقائق."); return; }
    setBusy(true);
    try {
      const saved = await saveService({
        key: service?.key, name: f.name.trim(), short_name: f.short.trim() || f.name.trim(), description: f.desc.trim(),
        price: Math.round(price), price_currency: f.cur, category_id: f.cat || null, price_from: f.from, minutes: Math.round(minutes), room_id: f.room || null, device_id: f.device || null,
        bookable_online: f.online, is_consultation: f.consult, active: f.active, sort: Number(f.sort) || 0,
      });
      // a new service is provided automatically by members without assignments; only explicit changes are written
      if (saved && who && prov.data && asg.data) {
        const provided = { ...prov.data.map };
        if (!service) for (const t of cands) if (!(asg.data.some((a) => a.staff_id === t.id)) && (f.consult ? t.is_consultant : t.role === "specialist" && !t.is_consultant)) provided[t.id] = [...(provided[t.id] ?? []), saved.key];
        await setServiceStaff(saved.key, who, asg.data, provided, cands.map((t) => t.id));
      }
      onClose();
    } catch (e) { setError(err(e)); } finally { setBusy(false); }
  }

  const row = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 } as const;
  const cat = categories.find((c) => c.key === f.cat);
  return (
    <Modal open={open} onClose={onClose} title={service ? "تعديل الخدمة" : "خدمة جديدة"} width={620}
      footer={<SubmitButton onClick={submit} busy={busy}>{service ? "حفظ التغييرات" : "إضافة الخدمة"}</SubmitButton>}>
      <div style={row}>
        <TextInput label="اسم الخدمة" required value={f.name} onChange={(v) => set("name", v)} placeholder="مثلاً: تنظيف عميق للبشرة" />
        <TextInput label="الاسم المختصر" value={f.short} onChange={(v) => set("short", v)} hint="يظهر في البطاقات الصغيرة وشاشة الانتظار" />
      </div>
      <TextArea label="الوصف" value={f.desc} onChange={(v) => set("desc", v)} rows={2} />
      <Select label="الفئة" value={f.cat} onChange={(v) => set("cat", v)} options={[{ value: "", label: "بلا فئة" }, ...categories.map((c) => ({ value: c.key, label: c.name }))]} />
      {cat?.instructions && <div style={{ fontSize: 12.5, color: C.sub2, background: "#FBF6FC", border: "1px solid #F0E4F3", borderRadius: 16, padding: "10px 14px", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: C.ink, marginBottom: 2 }}>تعليمات الفئة (تظهر للمراجعات مع كل خدمة فيها)</div>
        {cat.instructions.split("\n").filter(Boolean).map((t) => <div key={t}>• {t}</div>)}
      </div>}
      <div style={row}>
        <div>
          <NumberInput label="السعر" required suffix={f.cur === "USD" ? "$" : "ل.س"} value={f.price} onChange={(v) => set("price", v)}
            hint={f.cur === "USD" ? (rate ? <>≈ {sypCeil5(Number(f.price || 0) * rate).toLocaleString("en-US")} ل.س بسعر اليوم ({rate.toLocaleString("en-US")} ل.س للدولار). المراجعات يرين الليرة فقط.</> : "لم يُحدَّد سعر الصرف بعد: يظهر «السعر عند الاستفسار» للمراجعات.") : "0 = مجانية"} />
          <div style={{ marginTop: 8 }}><Segment label="عملة السعر" value={f.cur} onChange={(v) => set("cur", v)} options={[{ value: "SYP", label: "ل.س" }, { value: "USD", label: "$" }]} /></div>
        </div>
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
      {cands.length > 0 && (
        <div style={{ borderRadius: 20, border: "1px solid #F0E4F3", background: "#FBF6FC", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ lineHeight: 1.45 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>الأخصائيات اللواتي يقدّمنها</div>
            <div style={{ fontSize: 12.5, color: C.sub2 }}>عند الحجز تظهر للمراجعة هؤلاء فقط مع هذه الخدمة. يُحفظ في «الخدمات التي تقدّمها» لكل أخصائية.</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cands.map((t) => {
              const on = picked.includes(t.id);
              return (
                <button key={t.id} type="button" role="checkbox" aria-checked={on} onClick={() => setWho(on ? picked.filter((x) => x !== t.id) : [...picked, t.id])}
                  style={{ minHeight: 40, padding: "4px 12px 4px 6px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: on ? 700 : 600,
                    ...(on ? SELECTED : { background: C.white, border: "1px solid #EADCF0", color: C.sub2 }) }}>
                  <StaffAvatar s={t} size={28} />{t.name}{on && <Icon name="check" size={14} color={C.accent} stroke={2.4} />}
                </button>
              );
            })}
          </div>
          {picked.length === 0 && <div style={{ fontSize: 12.5, color: "#8A5A12", fontWeight: 600 }}>لا أخصائية تقدّم هذه الخدمة — لن تظهر لها أوقات في الحجز.</div>}
        </div>
      )}
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

/** Icons offered for a category (keys of the app's Icon set). */
export const CATEGORY_ICONS = ["sparkle", "face", "drop", "eye", "msg", "hand", "sun", "heart", "star"];

export function CategoryDialog({ open, category, nextSort, onClose }: { open: boolean; category: Category | null; nextSort: number; onClose: () => void }) {
  const [name, setName] = useState("");
  const [short, setShort] = useState("");
  const [ins, setIns] = useState("");
  const [icon, setIcon] = useState("sparkle");
  const [preg, setPreg] = useState(false);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError(""); setName(category?.name ?? ""); setShort(category?.short_description ?? ""); setIns(category?.instructions ?? "");
    setIcon(category?.icon ?? "sparkle"); setPreg(category?.not_for_pregnant ?? false); setActive(category?.active ?? true);
  }, [open, category]);

  async function submit() {
    setError("");
    if (!name.trim()) { setError("اكتبي اسم الفئة."); return; }
    setBusy(true);
    try {
      const instructions = ins.split("\n").map((t) => t.trim()).filter(Boolean).join("\n");
      await saveCategory({ key: category?.key, name: name.trim(), short_description: short.trim(), instructions, icon, not_for_pregnant: preg, active, sort: category?.sort ?? nextSort }, !category);
      onClose();
    } catch (e) { setError(err(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? "تعديل الفئة" : "فئة جديدة"} width={560}
      footer={<SubmitButton onClick={submit} busy={busy}>{category ? "حفظ التغييرات" : "إضافة الفئة"}</SubmitButton>}>
      <TextInput label="اسم الفئة" required value={name} onChange={setName} placeholder="مثلاً: العناية بالشعر" />
      <TextInput label="وصف قصير" value={short} onChange={setShort} hint="يظهر تحت اسم الفئة في التطبيق" />
      <TextArea label="تعليمات قبل الجلسة وبعدها (سطر لكل تعليمة)" value={ins} onChange={setIns} rows={6} />
      <div>
        <div style={{ fontSize: 13, color: C.sub2, marginBottom: 6 }}>الأيقونة</div>
        <div role="radiogroup" aria-label="الأيقونة" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORY_ICONS.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={icon === k} aria-label={k} onClick={() => setIcon(k)}
              style={{ width: 42, height: 42, borderRadius: 21, border: `1.5px solid ${icon === k ? C.accentMid : "#EADCF0"}`, background: icon === k ? "#F3E7F7" : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={k} size={18} color={C.accent} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Row title="غير مناسبة للحامل" sub="يظهر تنبيه واضح عند الحجز، وتحذير إن كان ملف المراجِعة يذكر الحمل"><Toggle on={preg} onChange={setPreg} label="غير مناسبة للحامل" /></Row>
        <Row title="مفعّلة" sub="الفئة الموقوفة لا تظهر للمراجعات"><Toggle on={active} onChange={setActive} label="مفعّلة" /></Row>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
