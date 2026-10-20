"use client";

import { useEffect, useState } from "react";
import { APP_ORIGIN, DOMAIN, isNativeApp } from "@/lib/hosts";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The browser fires `beforeinstallprompt` once per page load; keep it for every component that asks.
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIPEvent; listeners.forEach((f) => f()); });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    if (isStoreContext()) { try { localStorage.setItem(STORE_FLAG, "1"); } catch {} }
    listeners.forEach((f) => f());
  });
}

export type AppKind = "patient" | "store";
const STORE_FLAG = "fb-store-installed";
const STORE_SESSION = "fb-store-app";
export const STORE_ORIGIN = `https://store.${DOMAIN}`;
const STORE_PATHS = ["/store", "/cart", "/checkout", "/orders"];

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || !!(navigator as unknown as { standalone?: boolean }).standalone;
}

/** Store pages (any host) or the store host itself — these belong to the separate store app. */
export function isStoreContext(pathname?: string) {
  if (typeof window === "undefined") return false;
  if (window.location.hostname === `store.${DOMAIN}`) return true;
  const p = pathname ?? window.location.pathname;
  return STORE_PATHS.some((s) => p === s || p.startsWith(s + "/"));
}

/**
 * The store app is installed (or we are running inside it). The store manifests start at `?app=store`, so a
 * standalone launch with that marker is the store app; remembered for the session and on the device.
 * On store.fatema.beauty any standalone window is the store app (it is the only app on that origin).
 */
export function isStoreInstalled() {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return true;
  const sa = standalone();
  try {
    if (sa && new URLSearchParams(window.location.search).get("app") === "store") {
      sessionStorage.setItem(STORE_SESSION, "1"); localStorage.setItem(STORE_FLAG, "1");
    }
    if (sa && (window.location.hostname === `store.${DOMAIN}` || sessionStorage.getItem(STORE_SESSION))) return true;
    return localStorage.getItem(STORE_FLAG) === "1";
  } catch { return sa && window.location.hostname === `store.${DOMAIN}`; }
}

/** Running inside the installed store app right now (not just "installed on this device"). */
export function inStoreApp() {
  if (typeof window === "undefined" || isNativeApp() || !standalone()) return false;
  isStoreInstalled(); // records the ?app=store launch marker
  try { return window.location.hostname === `store.${DOMAIN}` || !!sessionStorage.getItem(STORE_SESSION); } catch { return false; }
}

/** On production, the store installs from store.fatema.beauty (its scope covers cart/checkout/orders too). */
export function mustGoToStore() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h.endsWith(DOMAIN) && h !== `store.${DOMAIN}`;
}
export const STORE_INSTALL_URL = `${STORE_ORIGIN}/?install=1`;

/** The patient app is installed / running (standalone outside the store app). */
export function isInstalled() {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return true;
  if (!standalone()) return false;
  try { if (sessionStorage.getItem(STORE_SESSION) || new URLSearchParams(window.location.search).get("app") === "store") return false; } catch {}
  return window.location.hostname !== `store.${DOMAIN}`;
}

/**
 * On fatema.beauty / www installing must happen on app.fatema.beauty — send people there.
 * store.fatema.beauty installs itself (its own origin; the shared manifest starts at "/", which opens the store there).
 */
export function mustGoToApp() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  if (window.location.pathname.startsWith("/admin") || isStoreContext()) return false;
  return h.endsWith(DOMAIN) && h !== `app.${DOMAIN}` && h !== `store.${DOMAIN}` && h !== `admin.${DOMAIN}`;
}
export const APP_INSTALL_URL = `${APP_ORIGIN}/home/?install=1`;

/**
 * Install state for the patient app (default) or the store app (`useInstall("store")`).
 * - canPrompt: Android/Chrome native install dialog is available.
 * - ios: Safari on iPhone/iPad → show the “Share → Add to Home Screen” steps.
 */
export function useInstall(app: AppKind = "patient") {
  const [state, setState] = useState({ ready: false, installed: false, canPrompt: false, ios: false });
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const update = () => setState({ ready: true, installed: app === "store" ? isStoreInstalled() : isInstalled(), canPrompt: !!deferred, ios });
    update();
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, [app]);

  async function install(): Promise<"prompted" | "ios" | "redirect" | "unavailable"> {
    if (app === "store" && mustGoToStore()) { window.location.href = STORE_INSTALL_URL; return "redirect"; }
    if (app === "patient" && mustGoToApp()) { window.location.href = APP_INSTALL_URL; return "redirect"; }
    if (deferred) { await deferred.prompt(); await deferred.userChoice; deferred = null; return "prompted"; }
    if (state.ios) return "ios";
    return "unavailable";
  }
  return { ...state, install };
}
