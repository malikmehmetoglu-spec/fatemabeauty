"use client";

/** Checkout state & order placement — shared by the phone checkout and the desktop checkout. */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { placeOrder } from "@/lib/db/products";
import { cartLines, cartStore, getProductsByKeys, useLiveRefresh, orderError, rememberReturn, useCart, useMode } from "@/lib/db/orders";
import { useSession } from "@/lib/supabase/session";

export function useCheckout() {
  const mode = useMode();
  const cart = useCart();
  const keys = Object.keys(cart).sort();
  const { data, loading, refresh } = useQuery(["products", "cart", keys.join(",")], () => getProductsByKeys(keys), { enabled: keys.length > 0 });
  // Prices and stock are always live: re-read when the page opens and when the tab comes back into focus.
  useLiveRefresh(keys.length > 0 ? refresh : null);
  const { lines, missing, count, sub, canOrder } = cartLines(cart, data);
  // Items hidden / removed since they were added leave the cart (same as on the cart page).
  useEffect(() => { if (data) missing.forEach((k) => cartStore.set(k, 0)); }, [data, missing]);
  const d = mode === "d";
  const session = useSession();
  const router = useRouter();
  const [addr, setAddr] = useState({ city: "", area: "", street: "", near: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const setA = (k: keyof typeof addr) => (v: string) => setAddr((a) => ({ ...a, [k]: v }));

  function login() {
    rememberReturn(R.P_Checkout);
    window.location.href = `${R.Login}?next=${encodeURIComponent(R.P_Checkout)}`;
  }

  async function submit() {
    setError("");
    if (d && (!addr.city.trim() || !addr.street.trim())) { setError("اكتبي المدينة والشارع ليصل المندوب."); return; }
    setBusy(true);
    try {
      const address = d ? [addr.city, addr.area, addr.street, addr.near && `قرب ${addr.near}`].map((x) => x.trim()).filter(Boolean).join("، ") : undefined;
      const order = await placeOrder(lines.map((l) => ({ product_key: l.p.key, qty: l.qty })), d, address);
      cartStore.clear();
      router.push(order ? `${R.P_OrderTrack}?id=${order.id}` : R.P_OrderTrack);
    } catch (e) { setError(orderError(e)); setBusy(false); }
  }

  const empty = !busy && (keys.length === 0 || (!!data && lines.length === 0));
  return { mode, d, keys, data, loading, lines, count, sub, canOrder, session, addr, setA, busy, error, login, submit, empty };
}
