/**
 * Batch c1 sample data — store products, cart, order, gift card.
 * Product prices are the researched prices shown in the designs (P_Store / P_Cart).
 */
"use client";

import { useSyncExternalStore } from "react";

export type ArtKind = "pump" | "dropper" | "tube" | "jar";
export type ProductKey = "clean" | "hyal" | "spf" | "vitc" | "moist" | "mask";
export type Product = {
  key: ProductKey; name: string; size: string; cat: string; short: string;
  /** null = «اسألي عن السعر» */
  price: number | null;
  art: { kind: ArtKind; body: [string, string]; cap: string };
};

const LILAC: [string, string] = ["#FCF5FD", "#E4C8EA"];
const MAUVE = "#7B4687";
const GOLD = "#C9A24B";

export const PRODUCTS: Product[] = [
  { key: "clean", name: "غسول لطيف للوجه", size: "150 مل", cat: "الغسولات", short: "الغسول", price: 2500, art: { kind: "pump", body: LILAC, cap: MAUVE } },
  { key: "hyal", name: "سيروم الهيالورونيك", size: "30 مل", cat: "السيرومات", short: "السيروم", price: 1100, art: { kind: "dropper", body: ["#F6E9F9", "#D3ACDC"], cap: MAUVE } },
  { key: "spf", name: "واقي شمس SPF 50", size: "50 مل", cat: "الحماية", short: "الواقي", price: 2000, art: { kind: "tube", body: ["#FFFAF3", "#F0DCC8"], cap: GOLD } },
  { key: "vitc", name: "سيروم فيتامين C", size: "30 مل", cat: "السيرومات", short: "السيروم", price: 2000, art: { kind: "dropper", body: ["#FFF6E6", "#F1CF9C"], cap: MAUVE } },
  { key: "moist", name: "مرطب خفيف للوجه", size: "50 مل", cat: "الترطيب", short: "المرطب", price: 1700, art: { kind: "jar", body: LILAC, cap: MAUVE } },
  { key: "mask", name: "ماسك مهدّئ", size: "100 مل", cat: "الأقنعة", short: "الماسك", price: null, art: { kind: "jar", body: ["#FFFAF3", "#F0DCC8"], cap: GOLD } },
];
export const PRODUCT = Object.fromEntries(PRODUCTS.map((p) => [p.key, p])) as Record<ProductKey, Product>;

export const STORE_CATS = ["الكل", "السيرومات", "الحماية", "الترطيب", "الأقنعة", "الغسولات"];
/** Products shown under «الكل». */
export const STORE_DEFAULT: ProductKey[] = ["spf", "vitc", "moist", "mask"];

/** Morning routine recommended by فاطمة طيبة. */
export const ROUTINE: ProductKey[] = ["clean", "hyal", "spf"];
export const ROUTINE_PRICE = ROUTINE.reduce((s, k) => s + (PRODUCT[k].price ?? 0), 0); // 5,600

/** The product shown on P_Product. */
export const FEATURED: ProductKey = "spf";
export const FEATURED_INFO = {
  tags: ["الحجم 50 مل", "حماية واسعة الطيف"],
  routineTag: "ضمن روتينكِ الصباحي",
  steps: [
    "آخر خطوة في روتينكِ الصباحي، بعد السيروم.",
    "كمية كافية للوجه والرقبة قبل الخروج بربع ساعة.",
    "جدّديه كل ساعتين عند البقاء في الخارج.",
  ],
  suits: ["البشرة المختلطة", "بعد جلسات التقشير", "الاستخدام اليومي"],
};

/** Sample order shown on P_OrderTrack. */
export const ORDER = {
  no: 2041,
  items: ROUTINE.map((k) => ({ key: k, qty: 1 })),
  steps: [
    { title: "تم الطلب", sub: "استلمنا طلبكِ وتأكّدنا من المنتجات" },
    { title: "قيد التجهيز", sub: "يجهّز فريق المركز طلبكِ الآن" },
    { title: "خرج للتوصيل", sub: "سنرسل لكِ رسالة عند خروج المندوب" },
    { title: "سُلِّم", sub: "الدفع نقداً عند الاستلام" },
  ],
  current: 1,
};

/* ---------- cart store (client, persisted in localStorage) ---------- */

export type Cart = Partial<Record<ProductKey, number>>;
const DEFAULT_CART: Cart = { clean: 1, hyal: 1, spf: 1 };
const KEY = "fb.c1.cart";
let cart: Cart = DEFAULT_CART;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) cart = JSON.parse(raw) as Cart;
  } catch { /* ignore */ }
}
function save() {
  try { window.localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export const cartStore = {
  set(k: ProductKey, qty: number) {
    load();
    const next = { ...cart };
    if (qty <= 0) delete next[k]; else next[k] = Math.min(9, qty);
    cart = next;
    save();
  },
  add(k: ProductKey, n = 1) { load(); cartStore.set(k, (cart[k] ?? 0) + n); },
};

export function useCart(): Cart {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => { subs.delete(f); }; },
    () => { load(); return cart; },
    () => DEFAULT_CART,
  );
}

export function cartLines(c: Cart) {
  return PRODUCTS.filter((p) => (c[p.key] ?? 0) > 0 && p.price !== null).map((p) => ({ p, qty: c[p.key] as number, line: (c[p.key] as number) * (p.price as number) }));
}
export function cartTotals(c: Cart) {
  const lines = cartLines(c);
  return { lines, count: lines.reduce((s, l) => s + l.qty, 0), sub: lines.reduce((s, l) => s + l.line, 0) };
}

/** Delivery mode chosen in the cart, reused on checkout. */
export type Mode = "d" | "p";
let mode: Mode = "d";
const msubs = new Set<() => void>();
export function setMode(m: Mode) { mode = m; msubs.forEach((f) => f()); }
export function useMode(): Mode {
  return useSyncExternalStore((f) => { msubs.add(f); return () => { msubs.delete(f); }; }, () => mode, () => "d");
}
