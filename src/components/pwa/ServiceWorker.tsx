"use client";

import { useEffect } from "react";
import { isNativeApp } from "@/lib/hosts";

/** Registers /sw.js (offline support) on the web. Skipped in development and inside the store app. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || isNativeApp() || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
