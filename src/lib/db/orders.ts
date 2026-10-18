"use client";

/**
 * Store orders + the patient's cart.
 * The cart lives in localStorage and holds only product keys and quantities; prices and stock are always re-read live.
 */
import { useEffect, useRef, useSyncExternalStore } from "react";
import { supabase, type Database, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";
import { getStoreProducts, type Product } from "./products";

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderFull = Order & { order_items: OrderItem[]; patients: { name: string; phone: string | null; file_no: number } | null };

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "طلب جديد", preparing: "قيد التجهيز", ready: "جاهز للاستلام", out_for_delivery: "خرج للتوصيل", delivered: "سُلِّم", cancelled: "ملغى",
};

/** Next step of an order (null when finished). */
export function nextStatus(o: Pick<Order, "status" | "delivery">): OrderStatus | null {
  if (o.status === "new") return "preparing";
  if (o.status === "preparing") return o.delivery ? "out_for_delivery" : "ready";
  if (o.status === "ready" || o.status === "out_for_delivery") return "delivered";
  return null;
}

/** Timeline steps for the patient's tracking screen. */
export function orderSteps(delivery: boolean) {
  return [
    { s: "new" as OrderStatus, title: "تم الطلب", sub: "استلمنا طلبكِ وسيتأكّد الفريق من المنتجات" },
    { s: "preparing" as OrderStatus, title: "قيد التجهيز", sub: "يجهّز فريق المركز طلبكِ" },
    delivery
      ? { s: "out_for_delivery" as OrderStatus, title: "خرج للتوصيل", sub: "المندوب في الطريق إليكِ" }
      : { s: "ready" as OrderStatus, title: "جاهز للاستلام", sub: "استلميه من الاستقبال في المركز" },
    { s: "delivered" as OrderStatus, title: "سُلِّم", sub: "الدفع نقداً عند الاستلام" },
  ];
}

const FULL = "*, order_items(*), patients(name, phone, file_no)";

/** Staff: all orders, newest first. */
export async function listOrders() {
  return must(await supabase.from("orders").select(FULL).order("created_at", { ascending: false }).limit(300)) as unknown as OrderFull[];
}

/** Patient: her own orders (RLS limits rows; the filter also keeps a staff session to its own patient file). */
export async function listMyOrders(patientId: string) {
  return must(await supabase.from("orders").select("*, order_items(*)").eq("patient_id", patientId).order("created_at", { ascending: false })) as unknown as OrderFull[];
}

export async function getOrder(id: string) {
  return must(await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle()) as unknown as OrderFull | null;
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  if (status === "cancelled") return cancelOrder(id);
  must(await supabase.from("orders").update({ status }).eq("id", id));
  invalidate("orders");
}

/** Cancels and returns the items to stock. */
export async function cancelOrder(id: string) {
  must(await supabase.rpc("cancel_order", { p_order: id }));
  invalidate("orders"); invalidate("products");
}

/** Products by key (for the cart — only visible retail items are readable by patients). */
export async function getProductsByKeys(keys: string[]) {
  return getStoreProducts(keys);
}

/** Readable message for errors raised by place_order. */
export function orderError(e: unknown) {
  const m = e instanceof Error ? e.message : String(e);
  const out = /out of stock: (.*)/.exec(m);
  if (out) return `الكمية المتوفرة من «${out[1]}» لا تكفي. خفّفي الكمية أو احذفيه من السلة.`;
  const un = /unavailable: (.*)/.exec(m);
  if (un) return `«${un[1]}» لم يعد متاحاً في المتجر.`;
  if (/sign in/.test(m)) return "سجّلي الدخول بحساب المراجِعة أولاً.";
  if (/empty order/.test(m)) return "سلتكِ فارغة.";
  if (/address required/.test(m)) return "اكتبي عنوان التوصيل.";
  if (/bad quantity|too many items/.test(m)) return "إحدى الكميات غير صحيحة. عدّلي السلة وحاولي مجدداً.";
  if (/already delivered/.test(m)) return "سُلِّم هذا الطلب ولا يمكن إلغاؤه.";
  if (/order is closed|bad status|use cancel_order/.test(m)) return "لا يمكن نقل الطلب إلى هذه الحالة.";
  if (/not allowed|row-level security|permission denied/.test(m)) return "لا تملكين صلاحية هذا الإجراء.";
  if (/Failed to fetch|NetworkError/.test(m)) return "تعذّر الاتصال. تحققي من الإنترنت وحاولي مجدداً.";
  return "تعذّر إرسال الطلب: " + m;
}

/* ---------- cart (localStorage, keys + qty only) ---------- */

export type Cart = Record<string, number>;
const CART_KEY = "fb.cart.v2";
const EMPTY: Cart = {};
let cart: Cart = EMPTY;
let loaded = false;
let listening = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  // Another tab changed the cart: re-read it.
  if (!listening) {
    listening = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== CART_KEY) return;
      loaded = false; cart = EMPTY; load(); subs.forEach((f) => f());
    });
  }
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && typeof v === "object") cart = Object.fromEntries(Object.entries(v).filter(([, q]) => typeof q === "number" && Number.isFinite(q) && q >= 1).map(([k, q]) => [k, Math.min(99, Math.floor(q as number))])) as Cart;
    }
  } catch { /* ignore */ }
}
function save() {
  try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export const cartStore = {
  set(k: string, qty: number) {
    load();
    const next = { ...cart };
    if (qty <= 0) delete next[k]; else next[k] = Math.min(99, Math.floor(qty));
    cart = next; save();
  },
  add(k: string, n = 1) { load(); cartStore.set(k, (cart[k] ?? 0) + n); },
  clear() { cart = {}; save(); },
};

export function useCart(): Cart {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => { subs.delete(f); }; },
    () => { load(); return cart; },
    () => EMPTY,
  );
}

export const cartCount = (c: Cart) => Object.values(c).reduce((s, q) => s + q, 0);

export type CartLine = { p: Product; qty: number; line: number; problem: string | null };

/** Joins the cart with live product rows. Lines whose product vanished are dropped (and reported). */
export function cartLines(c: Cart, products: Product[] | null | undefined) {
  const byKey = new Map((products ?? []).map((p) => [p.key, p]));
  const lines: CartLine[] = [];
  const missing: string[] = [];
  for (const [k, qty] of Object.entries(c)) {
    const p = byKey.get(k);
    if (!p || !p.active || p.kind !== "retail" || !p.show_in_store || p.price == null) { missing.push(k); continue; }
    const stock = Number(p.stock);
    const problem = stock <= 0 ? "غير متوفر حالياً" : qty > stock ? `المتوفر ${stock} فقط` : null;
    lines.push({ p, qty, line: qty * p.price, problem });
  }
  const ok = lines.filter((l) => !l.problem);
  return { lines, missing, count: lines.reduce((s, l) => s + l.qty, 0), sub: lines.reduce((s, l) => s + l.line, 0), canOrder: lines.length > 0 && ok.length === lines.length };
}

/** Delivery mode chosen in the cart, reused on checkout (kept across the sign-in round trip). */
export type Mode = "d" | "p";
const MODE_KEY = "fb.cart.mode";
let mode: Mode | null = null;
const msubs = new Set<() => void>();
function readMode(): Mode {
  if (mode) return mode;
  try { mode = window.localStorage.getItem(MODE_KEY) === "p" ? "p" : "d"; } catch { mode = "d"; }
  return mode;
}
export function setMode(m: Mode) {
  mode = m;
  try { window.localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ }
  msubs.forEach((f) => f());
}
export function useMode(): Mode {
  return useSyncExternalStore((f) => { msubs.add(f); return () => { msubs.delete(f); }; }, readMode, () => "d");
}

/** Where to come back after signing in. */
export const AFTER_LOGIN_KEY = "fb.after_login";
export function rememberReturn(path: string) {
  try { window.sessionStorage.setItem(AFTER_LOGIN_KEY, path); } catch { /* ignore */ }
}

/** Calls `reload` once when the page opens and whenever the window regains focus (live prices / stock). */
export function useLiveRefresh(reload: (() => unknown) | null) {
  const ref = useRef(reload);
  ref.current = reload;
  const on = !!reload;
  useEffect(() => {
    if (!on) return;
    ref.current?.();
    const f = () => { if (document.visibilityState === "visible") ref.current?.(); };
    window.addEventListener("focus", f);
    document.addEventListener("visibilitychange", f);
    return () => { window.removeEventListener("focus", f); document.removeEventListener("visibilitychange", f); };
  }, [on]);
}
