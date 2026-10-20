"use client";

/**
 * المواقع — where the stock is kept: مستودع / محل / مركز (live, Supabase).
 * Each batch of stock belongs to one location. Locations flagged «تغذّي المتجر الإلكتروني» feed the online store;
 * the default centre location is where cashier sales and session materials are taken from unless another is chosen.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Modal, Segment, SubmitButton, Tag, TextArea, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL } from "@/lib/tokens";
import { KIND_ICON, KIND_LABEL, saveLocation, stockError, type LocationKind, type StockLocation } from "@/lib/db/products";
import { useLocations } from "../dialogs";
import { BulkTransferDialog, DeleteLocationDialog } from "./LocationDialogs";

const KINDS: { value: LocationKind; label: string }[] = [
  { value: "warehouse", label: "مستودع" }, { value: "shop", label: "محل" }, { value: "center", label: "مركز" },
];
const KIND_HINT: Record<LocationKind, string> = {
  warehouse: "مخزن للبضاعة الاحتياطية، لا يُباع منه مباشرة عادةً",
  shop: "نقطة بيع منفصلة عن المركز",
  center: "المركز نفسه: الكاشير ومواد الجلسات",
};

export default function Page() {
  const L = useLocations();
  const [editing, setEditing] = useState<StockLocation | "new" | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<StockLocation | null>(null);
  const [moving, setMoving] = useState<StockLocation | null>(null);
  const [msg, setMsg] = useState("");

  const statsOf = (id: string) => {
    let items = 0, units = 0;
    for (const m of Object.values(L.map ?? {})) { const n = m[id] ?? 0; if (n > 0) { items++; units += n; } }
    return { items, units };
  };
  const online = L.active.filter((l) => l.sells_online);

  async function toggleActive(l: StockLocation) {
    setErr(""); setBusy(l.id);
    try { await saveLocation({ ...l, kind: l.kind as LocationKind, active: !l.active }); }
    catch (e) { setErr("تعذّر الحفظ: " + stockError(e)); } finally { setBusy(null); }
  }
  return (
    <AdminShell active="المخزون والأجهزة" title="المواقع" subtitle="أين توجد البضاعة: المستودع، المحل، المركز — لكل دفعة موقعها، ويمكن النقل بينها"
      actions={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة موقع</GhostButton>}>
      <div className="adm-row">
        <Kpi dark label="المواقع الفعّالة" value={L.active.length} sub={L.all.length > L.active.length ? `و${L.all.length - L.active.length} موقوف` : "كل المواقع فعّالة"} icon="map" />
        <Kpi label="تغذّي المتجر الإلكتروني" value={online.length} sub={online.map((l) => l.name).join(" · ") || "لا شيء — المتجر يظهر «غير متوفر»"} icon="bag" />
        <Kpi label="الموقع الافتراضي للمركز" value={L.def?.name ?? "—"} sub="الكاشير ومواد الجلسات تُخصم منه" icon="home" />
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}
      {msg && (
        <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600, color: C.okDeep, background: "#E8F5EC", borderRadius: 14, padding: "10px 14px" }}>
          <Icon name="check" size={16} color={C.okDeep} /><span style={{ flex: 1 }}>{msg}</span>
          <button type="button" aria-label="إخفاء" onClick={() => setMsg("")} style={{ border: "none", background: "none", padding: 4 }}><Icon name="x" size={14} color={C.okDeep} /></button>
        </div>
      )}

      {L.loading ? <Loading /> : !L.all.length ? (
        <EmptyState icon="map" title="لا مواقع بعد" text="أضيفي موقعاً: مستودع أو محل أو مركز."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة موقع</GhostButton>} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
          {L.all.map((l) => {
            const st = statsOf(l.id);
            const kind = l.kind as LocationKind;
            return (
              <article key={l.id} style={{ background: C.white, border: "1px solid #F0E6F3", borderRadius: 24, padding: 16, boxShadow: "0 8px 20px rgba(123,70,135,0.07)", display: "flex", flexDirection: "column", gap: 12, opacity: l.active ? 1 : 0.7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ width: 48, height: 48, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={KIND_ICON[kind] ?? "box"} size={22} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</div>
                    <div style={{ fontSize: 12.5, color: C.sub2 }}>{KIND_LABEL[kind]}{l.note ? ` · ${l.note}` : ""}</div>
                  </div>
                  {!l.active && <Tag kind="gray">موقوف</Tag>}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {l.is_default_center && <Tag kind="plum">الموقع الافتراضي للمركز</Tag>}
                  {l.sells_online ? <Tag kind="green">تغذّي المتجر الإلكتروني</Tag> : <Tag kind="gray">لا تظهر كمياته في المتجر</Tag>}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Stat label="أصناف فيه" value={st.items} />
                  <Stat label="مجموع الوحدات" value={st.units} />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                  <Btn icon="edit" onClick={() => setEditing(l)}>تعديل</Btn>
                  {!l.is_default_center && (
                    <Btn icon={l.active ? "pause" : "check"} disabled={busy === l.id || (l.active && st.units > 0)} title={l.active && st.units > 0 ? "في الموقع كمية — انقليها أولاً" : undefined}
                      onClick={() => toggleActive(l)}>{l.active ? "إيقاف" : "تفعيل"}</Btn>
                  )}
                  {st.units > 0 && L.active.some((o) => o.id !== l.id) && <Btn icon="refresh" onClick={() => { setMsg(""); setMoving(l); }}>نقل المخزون</Btn>}
                  {!l.is_default_center && L.active.some((o) => o.id !== l.id) && <Btn icon="trash" danger disabled={busy === l.id} onClick={() => { setMsg(""); setErr(""); setDeleting(l); }}>حذف الموقع</Btn>}
                </div>
                {l.active && st.units > 0 && !l.is_default_center && (
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>لإيقافه انقلي كمياته أولاً بـ«نقل المخزون»، أو صنفاً صنفاً من <Link href={R.W_Inventory} style={{ color: C.accent, fontWeight: 700 }}>المخزون</Link> («نقل»).</div>
                )}
                {l.is_default_center && L.active.length > 1 && (
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>لحذفه اجعلي موقعاً آخر هو الافتراضي أولاً (من «تعديل»).</div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.9, background: "rgba(255,255,255,0.6)", borderRadius: 18, padding: "12px 16px" }}>
        <b>كيف تعمل المواقع؟</b> كل استلام يُسجَّل في موقع. المتجر الإلكتروني يعرض ويبيع فقط من المواقع التي «تغذّي المتجر».
        الكاشير ومواد الجلسات تُخصم من الموقع الافتراضي للمركز (ويمكن اختيار موقع آخر في الكاشير). الجرد يتم لكل موقع على حدة،
        والنقل بين المواقع لا يغيّر المجموع الكلي ويحافظ على تواريخ الانتهاء.
      </div>

      <DeleteLocationDialog loc={deleting} stats={deleting ? statsOf(deleting.id) : { items: 0, units: 0 }} onClose={() => setDeleting(null)} onDone={setMsg} />
      <BulkTransferDialog from={moving} onClose={() => setMoving(null)} onDone={setMsg} />
      <LocationDialog open={!!editing} loc={editing === "new" ? null : editing} count={L.all.length} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, background: C.tint2, borderRadius: 16, padding: "8px 12px", lineHeight: 1.3 }}>
      <div className="latin" style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{value.toLocaleString("en-US")}</div>
      <div style={{ fontSize: 11.5, color: C.sub2 }}>{label}</div>
    </div>
  );
}

function Btn({ icon, children, onClick, disabled, danger, title }: { icon: string; children: string; onClick: () => void; disabled?: boolean; danger?: boolean; title?: string }) {
  const col = danger ? C.danger : C.accent;
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color: col, display: "inline-flex", alignItems: "center", gap: 5, opacity: disabled ? 0.5 : 1 }}>
      <Icon name={icon} color={col} size={14} stroke={2} />{children}
    </button>
  );
}

function LocationDialog({ open, loc, count, onClose }: { open: boolean; loc: StockLocation | null; count: number; onClose: () => void }) {
  const [name, setName] = useState(""); const [kind, setKind] = useState<LocationKind>("warehouse"); const [note, setNote] = useState("");
  const [online, setOnline] = useState(false); const [def, setDef] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    setError("");
    setName(loc?.name ?? ""); setKind((loc?.kind as LocationKind) ?? "warehouse"); setNote(loc?.note ?? "");
    setOnline(loc?.sells_online ?? false); setDef(loc?.is_default_center ?? false);
  }, [open, loc]);
  async function submit() {
    if (!name.trim()) { setError("اكتبي اسم الموقع."); return; }
    setBusy(true); setError("");
    try {
      await saveLocation({ id: loc?.id, name: name.trim(), kind, note: note.trim(), sells_online: online, is_default_center: def || !!loc?.is_default_center,
        active: loc?.active ?? true, sort: loc?.sort ?? count });
      onClose();
    } catch (e) { setError("تعذّر الحفظ: " + stockError(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title={loc ? "تعديل موقع" : "إضافة موقع"} width={520}
      footer={<SubmitButton onClick={submit} busy={busy}>{loc ? "حفظ" : "إضافة الموقع"}</SubmitButton>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Segment label="نوع الموقع" value={kind} onChange={setKind} options={KINDS} />
        <span style={{ fontSize: 12.5, color: C.sub2 }}>{KIND_HINT[kind]}</span>
      </div>
      <TextInput label="اسم الموقع" required value={name} onChange={setName} placeholder={kind === "warehouse" ? "مثلاً: المستودع الرئيسي" : kind === "shop" ? "مثلاً: محل السوق" : "مثلاً: المركز"} />
      <TextArea label="العنوان أو ملاحظة (اختياري)" value={note} onChange={setNote} rows={2} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, borderRadius: 18, padding: "12px 14px", background: C.tint2 }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 600 }}>
          <span>تغذّي المتجر الإلكتروني<span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.sub2 }}>كمياته تظهر في المتجر وتُصرف منها الطلبات</span></span>
          <Toggle on={online} onChange={setOnline} label="تغذّي المتجر الإلكتروني" />
        </label>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 600 }}>
          <span>الموقع الافتراضي للمركز<span style={{ display: "block", fontSize: 12, fontWeight: 400, color: C.sub2 }}>{loc?.is_default_center ? "لتغييره اجعلي موقعاً آخر هو الافتراضي" : "الكاشير ومواد الجلسات تُخصم منه"}</span></span>
          <Toggle on={def || !!loc?.is_default_center} onChange={(v) => !loc?.is_default_center && setDef(v)} label="الموقع الافتراضي للمركز" />
        </label>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
