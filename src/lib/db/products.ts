"use client";

/** Inventory & store — one list of items. Retail items show in the store unless hidden. */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Product = Tables<"products">;
export type Batch = Tables<"stock_batches">;
export type Movement = Tables<"stock_movements">;
export type ProductInput = Partial<Omit<Product, "created_at" | "updated_at" | "stock">> & { name: string };

export const UNITS = ["قطعة", "عبوة", "مل", "لتر", "غرام", "علبة", "زوج"];
export const MOVE_LABEL: Record<string, string> = {
  receive: "استلام", sale: "بيع في المركز", order: "طلب من المتجر", session: "استهلاك جلسة",
  adjust: "تعديل جرد", return: "مرتجع", waste: "تالف / منتهي",
};

export function productImage(p: Pick<Product, "image_path">) {
  if (!p.image_path) return null;
  return supabase.storage.from("products").getPublicUrl(p.image_path).data.publicUrl;
}

/** Needs reordering: at or below the alert level (an item with no alert level is "low" only when it ran out). */
export const isLow = (p: Product) => Number(p.stock) <= 0 || Number(p.stock) <= Number(p.min_stock);

/** Every item, for staff (inventory screen). */
export async function listInventory() {
  return must(await supabase.from("products").select("*").eq("active", true).order("sort").order("name"));
}

/**
 * What a visitor sees in the store. The products table is staff-only; visitors and patients read the
 * `store_products` function (visible retail items, without cost / min stock / SKU).
 */
export async function listStore() {
  return (must(await supabase.rpc("store_products", {})) ?? []) as Product[];
}

/** One store product (null when hidden, archived, consumable or unknown). */
export async function getProduct(key: string) {
  const rows = (must(await supabase.rpc("store_products", { p_keys: [key] })) ?? []) as Product[];
  return rows[0] ?? null;
}

/** Store products by key (cart / checkout). */
export async function getStoreProducts(keys: string[]) {
  if (!keys.length) return [] as Product[];
  return (must(await supabase.rpc("store_products", { p_keys: keys })) ?? []) as Product[];
}

export async function listBatches(key: string) {
  return must(await supabase.from("stock_batches").select("*").eq("product_key", key).order("expires_on", { ascending: true, nullsFirst: false }));
}

export async function listMovements(key: string) {
  return must(await supabase.from("stock_movements").select("*").eq("product_key", key).order("created_at", { ascending: false }).limit(50));
}

/** Batches still in stock that expire within `days` days. */
export async function listExpiring(days = 60) {
  const until = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
  return must(await supabase.from("stock_batches").select("*, products!inner(name, unit, active)").eq("products.active", true).gt("qty_left", 0).not("expires_on", "is", null).lte("expires_on", until).order("expires_on"));
}

export async function saveProduct(input: ProductInput, opening?: { qty: number; expires?: string | null; cost?: number | null; supplier?: string | null }) {
  const { key, ...rest } = input;
  const row = key
    ? must(await supabase.from("products").update({ ...rest, updated_at: new Date().toISOString() }).eq("key", key).select().single())
    : must(await supabase.from("products").insert(rest).select().single());
  invalidate("products");
  if (!key && row && opening && opening.qty > 0) {
    try { await receiveStock(row.key, opening.qty, opening.expires ?? null, opening.cost ?? null, opening.supplier ?? null); }
    catch (e) { throw new Error("أُضيف الصنف لكن لم تُسجَّل الكمية الأولى: " + stockError(e) + " — سجّليها من «استلام»."); }
  }
  return row;
}

/** Replaces an item's photo: uploads the new file, saves, then removes the old file (or the new one if saving failed). */
export async function saveProductWithImage(input: ProductInput, file: File | null, oldPath: string | null,
  opening?: Parameters<typeof saveProduct>[1]) {
  const path = file ? await uploadProductImage(file) : oldPath;
  try {
    const row = await saveProduct({ ...input, image_path: path }, opening);
    if (file && oldPath && oldPath !== path) await supabase.storage.from("products").remove([oldPath]);
    return row;
  } catch (e) {
    if (file && path && !(e instanceof Error && e.message.startsWith("أُضيف الصنف"))) await supabase.storage.from("products").remove([path]);
    throw e;
  }
}

/** Readable Arabic message for errors raised by the stock functions / guards. */
export function stockError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  if (/out of stock/.test(m)) return "الكمية في المخزون لا تكفي.";
  if (/already expired/.test(m)) return "تاريخ الانتهاء مضى — لا يمكن استلام دفعة منتهية.";
  if (/quantity must be positive|must not be negative/.test(m)) return "الكمية غير صحيحة.";
  if (/not allowed|row-level security|permission denied/.test(m)) return "لا تملكين صلاحية تعديل المخزون.";
  if (/unknown product/.test(m)) return "الصنف غير موجود أو مُزال.";
  if (/sales history/.test(m)) return "للصنف سجل مبيعات؛ استخدمي «إزالة» بدل الحذف.";
  if (/duplicate key.*sku/i.test(m)) return "رمز الصنف مستخدم لصنف آخر.";
  if (/products_price_check|products_cost_check|min_stock_nonneg/.test(m)) return "الأسعار والحد الأدنى لا تكون سالبة.";
  if (/invalid input syntax for type integer/.test(m)) return "السعر والكلفة أرقام صحيحة بلا كسور.";
  return m;
}

export async function setShowInStore(key: string, show: boolean) {
  must(await supabase.from("products").update({ show_in_store: show }).eq("key", key));
  invalidate("products");
}

/** Removes an item from the inventory and the store (history is kept). */
export async function archiveProduct(key: string) {
  must(await supabase.from("products").update({ active: false, show_in_store: false, recommended: false }).eq("key", key));
  invalidate("products");
}

export async function receiveStock(key: string, qty: number, expires: string | null, unitCost: number | null, supplier: string | null) {
  must(await supabase.rpc("receive_stock", { p_product: key, p_qty: qty, p_expires: expires ?? undefined, p_unit_cost: unitCost ?? undefined, p_supplier: supplier ?? undefined }));
  invalidate("products");
}

/** Writes off a quantity (expired / damaged); with a batch, from that batch first. */
export async function wasteStock(key: string, qty: number, batch?: string | null, note?: string) {
  must(await supabase.rpc("waste_stock", { p_product: key, p_qty: qty, p_batch: batch ?? undefined, p_note: note }));
  invalidate("products");
}

export async function adjustStock(key: string, counted: number, note?: string) {
  must(await supabase.rpc("adjust_stock", { p_product: key, p_counted: counted, p_note: note }));
  invalidate("products");
}

export async function uploadProductImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("اختاري ملف صورة (JPG أو PNG أو WEBP).");
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة أكبر من 5 ميغابايت.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("products").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** Places a store order for the signed-in patient (stock is checked and deducted on the server). */
export async function placeOrder(items: { product_key: string; qty: number }[], delivery: boolean, address?: string) {
  const order = must(await supabase.rpc("place_order", { p_items: items, p_delivery: delivery, p_address: address }));
  invalidate("products"); invalidate("orders");
  return order;
}

export async function setRecommended(key: string, recommended: boolean) {
  must(await supabase.from("products").update({ recommended }).eq("key", key));
  invalidate("products");
}

/** Every stock batch (receiving log) with its product, newest first. */
export async function listAllBatches(limit = 300) {
  return must(await supabase.from("stock_batches").select("*, products(name, unit, kind)").eq("source", "receive").order("received_at", { ascending: false }).limit(limit)) as unknown as (Batch & { products: { name: string; unit: string; kind: string } | null })[];
}

/** Applies several stocktake counts; returns how many items changed. */
export async function applyStocktake(counts: { key: string; counted: number; current: number }[], note?: string) {
  let changed = 0;
  for (const c of counts) {
    if (c.counted === c.current) continue;
    must(await supabase.rpc("adjust_stock", { p_product: c.key, p_counted: c.counted, p_note: note }));
    changed++;
  }
  invalidate("products");
  return changed;
}
