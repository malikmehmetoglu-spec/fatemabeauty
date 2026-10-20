"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";
import { inStoreApp, isInstalled } from "./useInstall";
import { isNativeApp } from "@/lib/hosts";

const DEVICE_KEY = "fb-device-id";

// The store app is a separate install on the same device: it gets its own id (app_installs is keyed by device_id).
function deviceId(store: boolean) {
  try {
    const k = store ? `${DEVICE_KEY}-store` : DEVICE_KEY;
    let id = localStorage.getItem(k);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
    return id;
  } catch { return null; }
}

function platform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return /windows|macintosh|linux/i.test(ua) ? "desktop" : "other";
}

/** Reports each launch of the installed app (once per launch, and again after sign-in to attach the patient). */
export function InstallTracker() {
  const { loading, patient } = useSession();
  useEffect(() => {
    if (loading) return;
    // Inside the store app (or the store host's standalone window) count a store launch; otherwise the patient app.
    const store = inStoreApp();
    if (!store && !isInstalled()) return;
    const id = deviceId(store);
    if (!id) return;
    const p = platform();
    const channel = isNativeApp() ? (p === "ios" ? "app_store" : "play_store") : "web";
    const key = `fb-open-${store ? "store-" : ""}${patient?.id ?? "anon"}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    supabase.rpc("track_app_open", { p_device_id: id, p_platform: p, p_channel: channel, p_app: store ? "store" : "patient" }).then(() => {}, () => {});
  }, [loading, patient?.id]);
  return null;
}
