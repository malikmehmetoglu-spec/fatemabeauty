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

export const isLow = (p: Product) => Number(p.stock) <= Number(p.min_stock);

/** Every item, for staff (inventory screen). */
export async function listInventory() {
  return must(await supabase.from("products").select("*").eq("active", true).order("sort").order("name"));
}

/** What a visitor sees in the store (RLS already limits to visible retail items). */
export async function listStore() {
  return must(await supabase.from("products").select("*").eq("active", true).eq("kind", "retail").eq("show_in_store", true).order("sort").order("name"));
}

export async function getProduct(key: string) {
  return must(await supabase.from("products").select("*").eq("key", key).maybeSingle());
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
  return must(await supabase.from("stock_batches").select("*, products(name, unit)").gt("qty_left", 0).not("expires_on", "is", null).lte("expires_on", until).order("expires_on"));
}

export async function saveProduct(input: ProductInput, opening?: { qty: number; expires?: string | null; cost?: number | null; supplier?: string | null }) {
  const { key, ...rest } = input;
  const row = key
    ? must(await supabase.from("products").update({ ...rest, updated_at: new Date().toISOString() }).eq("key", key).select().single())
    : must(await supabase.from("products").insert(rest).select().single());
  if (!key && row && opening && opening.qty > 0) await receiveStock(row.key, opening.qty, opening.expires ?? null, opening.cost ?? null, opening.supplier ?? null);
  invalidate("products");
  return row;
}

export async function setShowInStore(key: string, show: boolean) {
  must(await supabase.from("products").update({ show_in_store: show }).eq("key", key));
  invalidate("products");
}

/** Removes an item from the inventory and the store (history is kept). */
export async function archiveProduct(key: string) {
  must(await supabase.from("products").update({ active: false, show_in_store: false }).eq("key", key));
  invalidate("products");
}

export async function receiveStock(key: string, qty: number, expires: string | null, unitCost: number | null, supplier: string | null) {
  must(await supabase.rpc("receive_stock", { p_product: key, p_qty: qty, p_expires: expires ?? undefined, p_unit_cost: unitCost ?? undefined, p_supplier: supplier ?? undefined }));
  invalidate("products");
}

export async function adjustStock(key: string, counted: number, note?: string) {
  must(await supabase.rpc("adjust_stock", { p_product: key, p_counted: counted, p_note: note }));
  invalidate("products");
}

export async function uploadProductImage(file: File) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
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
  return must(await supabase.from("stock_batches").select("*, products(name, unit, kind)").order("received_at", { ascending: false }).limit(limit)) as unknown as (Batch & { products: { name: string; unit: string; kind: string } | null })[];
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
