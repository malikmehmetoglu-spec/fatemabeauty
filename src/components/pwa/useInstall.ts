"use client";

import { useEffect, useState } from "react";
import { APP_ORIGIN, DOMAIN, isNativeApp } from "@/lib/hosts";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The browser fires `beforeinstallprompt` once per page load; keep it for every component that asks.
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIPEvent; listeners.forEach((f) => f()); });
  window.addEventListener("appinstalled", () => { deferred = null; listeners.forEach((f) => f()); });
}

export function isInstalled() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || !!(navigator as unknown as { standalone?: boolean }).standalone || isNativeApp();
}

/**
 * On fatema.beauty / www installing must happen on app.fatema.beauty — send people there.
 * store.fatema.beauty installs itself (its own origin; the shared manifest starts at "/", which opens the store there).
 */
export function mustGoToApp() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  if (window.location.pathname.startsWith("/admin")) return false;
  return h.endsWith(DOMAIN) && h !== `app.${DOMAIN}` && h !== `store.${DOMAIN}` && h !== `admin.${DOMAIN}`;
}
export const APP_INSTALL_URL = `${APP_ORIGIN}/home/?install=1`;

/**
 * Install state for the patient app.
 * - canPrompt: Android/Chrome native install dialog is available.
 * - ios: Safari on iPhone/iPad → show the “Share → Add to Home Screen” steps.
 */
export function useInstall() {
  const [state, setState] = useState({ ready: false, installed: false, canPrompt: false, ios: false });
  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const update = () => setState({ ready: true, installed: isInstalled(), canPrompt: !!deferred, ios });
    update();
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  async function install(): Promise<"prompted" | "ios" | "redirect" | "unavailable"> {
    if (mustGoToApp()) { window.location.href = APP_INSTALL_URL; return "redirect"; }
    if (deferred) { await deferred.prompt(); await deferred.userChoice; deferred = null; return "prompted"; }
    if (state.ios) return "ios";
    return "unavailable";
  }
  return { ...state, install };
}
