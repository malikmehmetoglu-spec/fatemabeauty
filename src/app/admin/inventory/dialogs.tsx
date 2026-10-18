"use client";

import { useEffect, useState } from "react";
import { ErrorNote, Modal, NumberInput, Segment, Select, SubmitButton, TextArea, TextInput, Toggle, Icon } from "@/components/ui";
import { adjustStock, archiveProduct, productImage, receiveStock, saveProduct, uploadProductImage, UNITS, type Product } from "@/lib/db/products";
import { C, ICON_FILL } from "@/lib/tokens";

const num = (s: string) => (s.trim() === "" ? null : Number(s));
const str = (n: number | null | undefined) => (n == null ? "" : String(n));
const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (/duplicate key.*sku/i.test(m)) return "رمز الصنف مستخدم لصنف آخر.";
  return "تعذّر الحفظ: " + m;
};

/** Add or edit an inventory item. New items can start with an opening quantity + expiry. */
export function ProductDialog({ open, product, onClose }: { open: boolean; product: Product | null; onClose: () => void }) {
  const [f, setF] = useState(blank());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(""); setFile(null);
    setF(product ? {
      name: product.name, kind: product.kind as "retail" | "consumable", category: product.category, size: product.size, unit: product.unit,
      sku: product.sku ?? "", price: str(product.price), cost: str(product.cost), min: str(Number(product.min_stock)),
      show: product.show_in_store, recommended: product.recommended, description: product.description, usage: product.usage,
      qty: "", expires: "", supplier: "",
    } : blank());
  }, [open, product]);

  const set = <K extends keyof ReturnType<typeof blank>>(k: K, v: ReturnType<typeof blank>[K]) => setF((x) => ({ ...x, [k]: v }));
  const preview = file ? URL.createObjectURL(file) : product ? productImage(product) : null;

  async function submit() {
    setError("");
    if (!f.name.trim()) { setError("اكتبي اسم الصنف."); return; }
    if (f.kind === "retail" && f.show && num(f.price) == null) { setError("منتج البيع الظاهر في المتجر يحتاج سعراً، أو أخفيه من المتجر."); return; }
    setBusy(true);
    try {
      const image_path = file ? await uploadProductImage(file) : product?.image_path ?? null;
      await saveProduct({
        key: product?.key, name: f.name.trim(), kind: f.kind, category: f.category.trim(), size: f.size.trim(), unit: f.unit,
        sku: f.sku.trim() || null, price: f.kind === "retail" ? num(f.price) : null, cost: num(f.cost), min_stock: num(f.min) ?? 0,
        show_in_store: f.kind === "retail" ? f.show : false, recommended: f.kind === "retail" && f.recommended,
        description: f.description.trim(), usage: f.usage.trim(), image_path,
      }, product ? undefined : { qty: num(f.qty) ?? 0, expires: f.expires || null, cost: num(f.cost), supplier: f.supplier || null });
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  async function archive() {
    if (!product || !confirm(`إزالة «${product.name}» من المخزون والمتجر؟ يبقى سجلّه في الطلبات السابقة.`)) return;
    setBusy(true);
    try { await archiveProduct(product.key); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as const;
  return (
    <Modal open={open} onClose={onClose} title={product ? "تعديل صنف" : "إضافة صنف إلى المخزون"} width={640}
      footer={<>
        <SubmitButton onClick={submit} busy={busy}>{product ? "حفظ التعديلات" : "إضافة الصنف"}</SubmitButton>
        {product && <button type="button" onClick={archive} style={{ border: "none", background: "none", color: C.danger, fontSize: 14, fontWeight: 600, marginInlineStart: "auto" }}>إزالة الصنف</button>}
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Segment label="نوع الصنف" value={f.kind} onChange={(v) => set("kind", v)} options={[{ value: "retail", label: "منتج للبيع" }, { value: "consumable", label: "مادة للجلسات" }]} />
        <span style={{ fontSize: 12.5, color: C.sub2 }}>{f.kind === "retail" ? "يظهر في المتجر تلقائياً" : "لا يظهر في المتجر"}</span>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <label style={{ width: 96, height: 96, borderRadius: 22, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", fontSize: 11.5, color: C.accent, fontWeight: 600 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <><Icon name="image" size={24} />صورة</>}
          <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="اسم الصنف" required value={f.name} onChange={(v) => set("name", v)} placeholder="مثلاً: واقي شمس SPF 50" />
          <div style={row}>
            <TextInput label="الفئة" value={f.category} onChange={(v) => set("category", v)} placeholder="السيرومات، الحماية…" />
            <TextInput label="الحجم" value={f.size} onChange={(v) => set("size", v)} placeholder="50 مل" />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <NumberInput label={`الكمية (${f.unit})`} value={f.qty} onChange={(v) => set("qty", v)} placeholder="0" />
            <TextInput label="تاريخ الانتهاء" type="date" dir="ltr" value={f.expires} onChange={(v) => set("expires", v)} />
            <TextInput label="المورّد" value={f.supplier} onChange={(v) => set("supplier", v)} />
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
export function ReceiveDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [qty, setQty] = useState(""); const [expires, setExpires] = useState(""); const [cost, setCost] = useState(""); const [supplier, setSupplier] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setQty(""); setExpires(""); setCost(product?.cost != null ? String(product.cost) : ""); setSupplier(""); setError(""); }, [product]);
  async function submit() {
    if (!product) return;
    const n = num(qty);
    if (!n || n <= 0) { setError("اكتبي الكمية المستلمة."); return; }
    setBusy(true);
    try { await receiveStock(product.key, n, expires || null, num(cost), supplier || null); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!product} onClose={onClose} title={`استلام كمية — ${product?.name ?? ""}`} width={520}
      footer={<SubmitButton onClick={submit} busy={busy}>إضافة إلى المخزون</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>الكمية الحالية: <b className="latin">{Number(product?.stock ?? 0)}</b> {product?.unit}. كل استلام يُسجَّل كدفعة بتاريخ انتهائها، ويُصرف الأقرب انتهاءً أولاً.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
export function AdjustDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [counted, setCounted] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setCounted(product ? String(Number(product.stock)) : ""); setNote(""); setError(""); }, [product]);
  async function submit() {
    if (!product) return;
    const n = num(counted);
    if (n == null || n < 0) { setError("اكتبي الكمية المعدودة."); return; }
    setBusy(true);
    try { await adjustStock(product.key, n, note || undefined); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  const diff = product && num(counted) != null ? (num(counted) as number) - Number(product.stock) : 0;
  return (
    <Modal open={!!product} onClose={onClose} title={`جرد — ${product?.name ?? ""}`} width={480}
      footer={<SubmitButton onClick={submit} busy={busy}>اعتماد الجرد</SubmitButton>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
