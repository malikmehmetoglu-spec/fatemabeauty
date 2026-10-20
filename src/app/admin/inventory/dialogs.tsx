"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Modal, NumberInput, Segment, Select, SubmitButton, TextArea, TextInput, Toggle, Icon } from "@/components/ui";
import {
  adjustStock, archiveProduct, KIND_LABEL, listLocations, listStockByLocation, productImage, qtyAt, receiveStock, saveProductWithImage, stockError,
  transferStock, UNITS, wasteStock, type LocationKind, type Product, type StockLocation,
} from "@/lib/db/products";
import { useQuery } from "@/lib/db/query";
import { dayKey } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";

const num = (s: string) => (s.trim() === "" ? null : Number(s));
const str = (n: number | null | undefined) => (n == null ? "" : String(n));
const errText = (e: unknown) => "تعذّر الحفظ: " + stockError(e);
/** Whole, non-negative amount (prices and costs are in whole Syrian pounds). */
const badMoney = (s: string) => s.trim() !== "" && !(/^\d+$/.test(s.trim()));
const badQty = (s: string) => s.trim() !== "" && !(Number.isFinite(Number(s)) && Number(s) >= 0 && /^\d+(\.\d{1,2})?$/.test(s.trim()));
/** Active stock locations + per-location quantities (shared cache with the inventory page). */
export function useLocations() {
  const locs = useQuery(["products", "locations"], listLocations);
  const map = useQuery(["products", "by-location"], listStockByLocation);
  const all = locs.data ?? [];
  const active = all.filter((l) => l.active);
  const def = active.find((l) => l.is_default_center) ?? active[0] ?? null;
  return { all, active, def, map: map.data ?? null, multi: active.length > 1, loading: locs.loading,
    /** Background re-fetch (keeps the current data on screen). */
    refresh: () => Promise.all([locs.refresh(), map.refresh()]) };
}
export const locLabel = (l: Pick<StockLocation, "name" | "kind">) => `${l.name} (${KIND_LABEL[l.kind as LocationKind] ?? ""})`;

/** Location picker; hidden when only one location exists (the default is used). */
export function LocationSelect({ label = "الموقع", value, onChange, locations, qtyOf, unit }: {
  label?: string; value: string; onChange: (v: string) => void; locations: StockLocation[]; qtyOf?: (id: string) => number; unit?: string;
}) {
  if (locations.length <= 1) return null;
  return (
    <Select label={label} value={value} onChange={onChange}
      options={locations.map((l) => ({ value: l.id, label: locLabel(l) + (qtyOf ? ` — ${qtyOf(l.id)} ${unit ?? ""}` : "") }))} />
  );
}

/** Grid that wraps to fewer columns on narrow screens (dialogs open full width on phones). */
const grid = (min: number) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 12 }) as const;

/** Add or edit an inventory item. New items can start with an opening quantity + expiry. */
export function ProductDialog({ open, product, onClose }: { open: boolean; product: Product | null; onClose: () => void }) {
  const [f, setF] = useState(blank());
  const L = useLocations();
  const [loc, setLoc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(""); setFile(null); setLoc("");
    setF(product ? {
      name: product.name, kind: product.kind as "retail" | "consumable", category: product.category, size: product.size, unit: product.unit,
      sku: product.sku ?? "", price: str(product.price), cost: str(product.cost), min: str(Number(product.min_stock)),
      show: product.show_in_store, recommended: product.recommended, description: product.description, usage: product.usage,
      qty: "", expires: "", supplier: "",
    } : blank());
  }, [open, product]);

  const set = <K extends keyof ReturnType<typeof blank>>(k: K, v: ReturnType<typeof blank>[K]) => setF((x) => ({ ...x, [k]: v }));
  const blobUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);
  const preview = blobUrl ?? (product ? productImage(product) : null);

  async function submit() {
    setError("");
    if (!f.name.trim()) { setError("اكتبي اسم الصنف."); return; }
    if (f.kind === "retail" && badMoney(f.price)) { setError("سعر البيع رقم صحيح موجب بالليرة (بلا فواصل أو كسور)."); return; }
    if (badMoney(f.cost)) { setError("سعر الكلفة رقم صحيح موجب بالليرة."); return; }
    if (badQty(f.min)) { setError("الحد الأدنى للتنبيه رقم موجب."); return; }
    if (f.kind === "retail" && f.show && num(f.price) == null) { setError("منتج البيع الظاهر في المتجر يحتاج سعراً، أو أخفيه من المتجر."); return; }
    if (!product && badQty(f.qty)) { setError("الكمية الأولى رقم موجب."); return; }
    if (!product && f.expires && f.expires < dayKey()) { setError("تاريخ الانتهاء مضى — لا يمكن إدخال كمية منتهية."); return; }
    if (file && !file.type.startsWith("image/")) { setError("اختاري ملف صورة."); return; }
    if (file && file.size > 5 * 1024 * 1024) { setError("حجم الصورة أكبر من 5 ميغابايت."); return; }
    setBusy(true);
    try {
      await saveProductWithImage({
        key: product?.key, name: f.name.trim(), kind: f.kind, category: f.category.trim(), size: f.size.trim(), unit: f.unit,
        sku: f.sku.trim() || null, price: f.kind === "retail" ? num(f.price) : null, cost: num(f.cost), min_stock: num(f.min) ?? 0,
        show_in_store: f.kind === "retail" ? f.show : false, recommended: f.kind === "retail" && f.recommended,
        description: f.description.trim(), usage: f.usage.trim(),
      }, file, product?.image_path ?? null, product ? undefined : { qty: num(f.qty) ?? 0, expires: f.expires || null, cost: num(f.cost), supplier: f.supplier || null, location: loc || L.def?.id || null });
      onClose();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      setError(m.startsWith("أُضيف الصنف") || m.startsWith("اختاري") || m.startsWith("حجم") ? m : errText(e));
    } finally { setBusy(false); }
  }

  async function archive() {
    if (!product || !confirm(`إزالة «${product.name}» من المخزون والمتجر؟ يبقى سجلّه في الطلبات السابقة.`)) return;
    setBusy(true);
    try { await archiveProduct(product.key); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  const row = grid(200);
  return (
    <Modal open={open} onClose={onClose} title={product ? "تعديل صنف" : "إضافة صنف إلى المخزون"} width={640}
      footer={<>
        <SubmitButton onClick={submit} busy={busy}>{product ? "حفظ التعديلات" : "إضافة الصنف"}</SubmitButton>
        {product && <button type="button" onClick={archive} style={{ border: "none", background: "none", color: C.danger, fontSize: 14, fontWeight: 600, marginInlineStart: "auto" }}>إزالة الصنف</button>}
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Segment label="نوع الصنف" value={f.kind} onChange={(v) => set("kind", v)} options={[{ value: "retail", label: "منتج للبيع" }, { value: "consumable", label: "مادة للجلسات" }]} />
        <span style={{ fontSize: 12.5, color: C.sub2 }}>{f.kind === "retail" ? "يظهر في المتجر تلقائياً" : "لا يظهر في المتجر"}</span>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
        <label style={{ width: 96, height: 96, borderRadius: 22, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", fontSize: 11.5, color: C.accent, fontWeight: 600 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><Icon name="image" size={24} />صورة</>}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden aria-label="صورة الصنف" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="اسم الصنف" required value={f.name} onChange={(v) => set("name", v)} placeholder="مثلاً: واقي شمس SPF 50" />
          <div style={row}>
            <TextInput label="الفئة" value={f.category} onChange={(v) => set("category", v)} placeholder="السيرومات، الحماية…" />
            <TextInput label="الحجم" value={f.size} onChange={(v) => set("size", v)} placeholder="50 مل" />
          </div>
        </div>
      </div>

      <div style={grid(160)}>
        <Select label="وحدة العدّ" value={f.unit} onChange={(v) => set("unit", v)} options={UNITS.map((u) => ({ value: u, label: u }))} />
        <NumberInput label="الحد الأدنى للتنبيه" value={f.min} onChange={(v) => set("min", v)} placeholder="0" />
        <TextInput label="رمز الصنف (اختياري)" value={f.sku} onChange={(v) => set("sku", v)} dir="ltr" />
      </div>

      <div style={row}>
        {f.kind === "retail" && <NumberInput label="سعر البيع" value={f.price} onChange={(v) => set("price", v)} suffix="ل.س" />}
        <NumberInput label="سعر الكلفة" value={f.cost} onChange={(v) => set("cost", v)} suffix="ل.س" hint="للتقارير فقط، لا يظهر للمراجِعات" />
      </div>

      {f.kind === "retail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderRadius: 18, padding: "12px 14px", background: C.tint2 }}>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 600 }}>
            إظهار في المتجر <Toggle on={f.show} onChange={(v) => set("show", v)} label="إظهار في المتجر" />
          </label>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 600 }}>
            توصية الأخصائية (يظهر بشارة في المتجر) <Toggle on={f.recommended} onChange={(v) => set("recommended", v)} label="توصية الأخصائية" />
          </label>
        </div>
      )}

      {f.kind === "retail" && (
        <div style={row}>
          <TextArea label="الوصف في المتجر" value={f.description} onChange={(v) => set("description", v)} rows={3} />
          <TextArea label="طريقة الاستخدام" value={f.usage} onChange={(v) => set("usage", v)} rows={3} />
        </div>
      )}

      {!product && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>الكمية الموجودة الآن (اختياري)</div>
          <div style={grid(160)}>
            <NumberInput label={`الكمية (${f.unit})`} value={f.qty} onChange={(v) => set("qty", v)} placeholder="0" />
            <TextInput label="تاريخ الانتهاء" type="date" dir="ltr" value={f.expires} onChange={(v) => set("expires", v)} />
            <TextInput label="المورّد" value={f.supplier} onChange={(v) => set("supplier", v)} />
            <LocationSelect label="أين توجد؟" value={loc || L.def?.id || ""} onChange={setLoc} locations={L.active} />
          </div>
        </div>
      )}

      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

function blank() {
  return {
    name: "", kind: "retail" as "retail" | "consumable", category: "", size: "", unit: "قطعة", sku: "", price: "", cost: "", min: "",
    show: true, recommended: false, description: "", usage: "", qty: "", expires: "", supplier: "",
  };
}

/** Receive goods: adds a batch (quantity + expiry) to the stock. */
export function ReceiveDialog({ product, onClose, location }: { product: Product | null; onClose: () => void; location?: string | null }) {
  const L = useLocations();
  const [loc, setLoc] = useState("");
  const [qty, setQty] = useState(""); const [expires, setExpires] = useState(""); const [cost, setCost] = useState(""); const [supplier, setSupplier] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setQty(""); setExpires(""); setCost(product?.cost != null ? String(product.cost) : ""); setSupplier(""); setError(""); setLoc(location ?? ""); }, [product, location]);
  const where = loc || L.def?.id || "";
  async function submit() {
    if (!product) return;
    const n = num(qty);
    if (!n || n <= 0 || badQty(qty)) { setError("اكتبي الكمية المستلمة (رقم موجب)."); return; }
    if (badMoney(cost)) { setError("كلفة الوحدة رقم صحيح موجب بالليرة."); return; }
    if (expires && expires < dayKey()) { setError("تاريخ الانتهاء مضى — لا يمكن استلام دفعة منتهية."); return; }
    setBusy(true);
    try { await receiveStock(product.key, n, expires || null, num(cost), supplier || null, where || null); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!product} onClose={onClose} title={`استلام كمية — ${product?.name ?? ""}`} width={520}
      footer={<SubmitButton onClick={submit} busy={busy}>إضافة إلى المخزون</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>الكمية الحالية: <b className="latin">{Number(product?.stock ?? 0)}</b> {product?.unit}. كل استلام يُسجَّل كدفعة بتاريخ انتهائها، ويُصرف الأقرب انتهاءً أولاً.</div>
      <div style={grid(180)}>
        <LocationSelect label="الاستلام إلى" value={where} onChange={setLoc} locations={L.active} qtyOf={product ? (id) => qtyAt(L.map, product, id) : undefined} unit={product?.unit} />
        <NumberInput label={`الكمية (${product?.unit ?? ""})`} required value={qty} onChange={setQty} />
        <TextInput label="تاريخ الانتهاء" type="date" dir="ltr" value={expires} onChange={setExpires} />
        <NumberInput label="كلفة الوحدة" value={cost} onChange={setCost} suffix="ل.س" />
        <TextInput label="المورّد" value={supplier} onChange={setSupplier} />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

/** Stocktake: set the counted quantity; the difference is logged. */
export function AdjustDialog({ product, onClose, location }: { product: Product | null; onClose: () => void; location?: string | null }) {
  const L = useLocations();
  const [loc, setLoc] = useState("");
  const [counted, setCounted] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const where = loc || location || L.def?.id || "";
  const current = product ? (where ? qtyAt(L.map, product, where) : Number(product.stock)) : 0;
  useEffect(() => { setLoc(location ?? ""); setNote(""); setError(""); }, [product, location]);
  useEffect(() => { setCounted(product ? String(current) : ""); }, [product, current]);
  async function submit() {
    if (!product) return;
    const n = num(counted);
    if (n == null || n < 0 || badQty(counted)) { setError("اكتبي الكمية المعدودة (رقم موجب)."); return; }
    setBusy(true);
    try { await adjustStock(product.key, n, note || undefined, where || null); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  const diff = product && num(counted) != null ? (num(counted) as number) - current : 0;
  return (
    <Modal open={!!product} onClose={onClose} title={`جرد — ${product?.name ?? ""}`} width={480}
      footer={<SubmitButton onClick={submit} busy={busy}>اعتماد الجرد</SubmitButton>}>
      <LocationSelect label="الموقع الذي تعدّينه" value={where} onChange={setLoc} locations={L.all.filter((l) => l.active || (product && qtyAt(L.map, product, l.id) > 0))} qtyOf={product ? (id) => qtyAt(L.map, product, id) : undefined} unit={product?.unit} />
      <div style={{ fontSize: 13.5, color: C.sub }}>كمية النظام{L.multi ? " في هذا الموقع" : ""}: <b className="latin">{current}</b> {product?.unit}</div>
      <div style={grid(160)}>
        <NumberInput label={`الكمية المعدودة (${product?.unit ?? ""})`} value={counted} onChange={setCounted} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 12, fontSize: 14 }}>
          الفرق: <b className="latin" style={{ color: diff < 0 ? C.danger : diff > 0 ? C.okDeep : C.sub2 }}>{diff > 0 ? "+" : ""}{diff}</b>
        </div>
      </div>
      <TextInput label="ملاحظة (سبب الفرق)" value={note} onChange={setNote} placeholder="تالف، منتهي، خطأ عدّ…" />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

/** Write off an expiring / damaged batch (taken from that batch first). */
export function WasteDialog({ batch, onClose }: { batch: { id: string; product_key: string; qty_left: number; expires_on: string | null; name: string; unit: string; location?: string | null } | null; onClose: () => void }) {
  const [qty, setQty] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setQty(batch ? String(Number(batch.qty_left)) : ""); setNote(""); setError(""); }, [batch]);
  async function submit() {
    if (!batch) return;
    const n = num(qty);
    if (!n || n <= 0 || badQty(qty) || n > Number(batch.qty_left)) { setError(`اكتبي كمية بين 0 و ${Number(batch.qty_left)}.`); return; }
    setBusy(true);
    try { await wasteStock(batch.product_key, n, batch.id, note.trim() || "منتهي الصلاحية"); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!batch} onClose={onClose} title={`إتلاف — ${batch?.name ?? ""}`} width={460}
      footer={<SubmitButton onClick={submit} busy={busy}>إتلاف وخصم من المخزون</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>{batch?.location ? <>في «{batch.location}» · </> : null}دفعة تنتهي {batch?.expires_on ?? "—"} · المتبقي منها <b className="latin">{Number(batch?.qty_left ?? 0)}</b> {batch?.unit}. تُسجَّل الحركة «تالف / منتهي».</div>
      <div style={grid(160)}>
        <NumberInput label={`الكمية (${batch?.unit ?? ""})`} value={qty} onChange={setQty} />
        <TextInput label="السبب" value={note} onChange={setNote} placeholder="منتهي الصلاحية، تالف…" />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

/** Write off a quantity of an item at a location (earliest-expiring first). */
export function WasteItemDialog({ product, onClose, location }: { product: Product | null; onClose: () => void; location?: string | null }) {
  const L = useLocations();
  const [loc, setLoc] = useState(""); const [qty, setQty] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setLoc(location ?? ""); setQty(""); setNote(""); setError(""); }, [product, location]);
  const where = loc || L.def?.id || "";
  const have = product ? (where ? qtyAt(L.map, product, where) : Number(product.stock)) : 0;
  async function submit() {
    if (!product) return;
    const n = num(qty);
    if (!n || n <= 0 || badQty(qty) || n > have) { setError(have > 0 ? `اكتبي كمية بين 0 و ${have}.` : "لا كمية في هذا الموقع."); return; }
    setBusy(true);
    try { await wasteStock(product.key, n, null, note.trim() || "تالف", where || null); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!product} onClose={onClose} title={`إتلاف — ${product?.name ?? ""}`} width={480}
      footer={<SubmitButton onClick={submit} busy={busy}>إتلاف وخصم من المخزون</SubmitButton>}>
      <LocationSelect label="من الموقع" value={where} onChange={setLoc} locations={L.all.filter((l) => l.active || (product && qtyAt(L.map, product, l.id) > 0))} qtyOf={product ? (id) => qtyAt(L.map, product, id) : undefined} unit={product?.unit} />
      <div style={{ fontSize: 13.5, color: C.sub }}>المتوفر{L.multi ? " في هذا الموقع" : ""}: <b className="latin">{have}</b> {product?.unit}. يُخصم الأقرب انتهاءً أولاً، وتُسجَّل الحركة «تالف / منتهي».</div>
      <div style={grid(160)}>
        <NumberInput label={`الكمية (${product?.unit ?? ""})`} value={qty} onChange={setQty} />
        <TextInput label="السبب" value={note} onChange={setNote} placeholder="تالف، منتهي، كسر…" />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

/** Move a quantity from one location to another (batches keep their expiry and cost). */
export function TransferDialog({ product, onClose, from: from0 }: { product: Product | null; onClose: () => void; from?: string | null }) {
  const L = useLocations();
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [qty, setQty] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const holding = product ? L.all.filter((l) => qtyAt(L.map, product, l.id) > 0) : [];
  useEffect(() => { setFrom(from0 ?? ""); setTo(""); setQty(""); setNote(""); setError(""); }, [product, from0]);
  const src = from || holding[0]?.id || "";
  const dst = to || L.active.find((l) => l.id !== src)?.id || "";
  const have = product && src ? qtyAt(L.map, product, src) : 0;
  async function submit() {
    if (!product) return;
    const n = num(qty);
    if (!src || !dst) { setError("اختاري الموقعين."); return; }
    if (src === dst) { setError("اختاري موقعين مختلفين للنقل."); return; }
    if (!n || n <= 0 || badQty(qty) || n > have) { setError(have > 0 ? `اكتبي كمية بين 0 و ${have}.` : "لا كمية في موقع المصدر."); return; }
    setBusy(true);
    try { await transferStock(product.key, n, src, dst, note.trim() || undefined); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  const qtyOf = product ? (id: string) => qtyAt(L.map, product, id) : undefined;
  return (
    <Modal open={!!product} onClose={onClose} title={`نقل بين المواقع — ${product?.name ?? ""}`} width={520}
      footer={<SubmitButton onClick={submit} busy={busy} disabled={L.active.length < 2 || !holding.length}>نقل الكمية</SubmitButton>}>
      {L.active.length < 2 ? (
        <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.8 }}>يوجد موقع واحد فقط. أضيفي مستودعاً أو محلاً من تبويب «المواقع» لتتمكّني من النقل.</div>
      ) : !holding.length ? (
        <div style={{ fontSize: 13.5, color: C.sub }}>لا كمية من هذا الصنف في أي موقع.</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, alignItems: "end" }}>
            <Select label="من" value={src} onChange={setFrom} options={holding.map((l) => ({ value: l.id, label: `${locLabel(l)} — ${qtyOf?.(l.id) ?? 0}` }))} />
            <Select label="إلى" value={dst} onChange={setTo} options={L.active.filter((l) => l.id !== src).map((l) => ({ value: l.id, label: `${locLabel(l)} — ${qtyOf?.(l.id) ?? 0}` }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.sub, background: C.tint2, borderRadius: 14, padding: "10px 12px" }}>
            <Icon name="refresh" size={16} />
            ينتقل الأقرب انتهاءً أولاً، وتبقى تواريخ الانتهاء والكلفة كما هي. المجموع الكلي لا يتغيّر.
          </div>
          <div style={grid(160)}>
            <NumberInput label={`الكمية (${product?.unit ?? ""}) — المتوفر ${have}`} value={qty} onChange={setQty} />
            <TextInput label="ملاحظة (اختياري)" value={note} onChange={setNote} placeholder="تعبئة رفوف المحل…" />
          </div>
        </>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
