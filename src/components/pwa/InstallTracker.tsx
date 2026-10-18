"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";
import { isInstalled } from "./useInstall";
import { isNativeApp } from "@/lib/hosts";

const DEVICE_KEY = "fb-device-id";

function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
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
    if (loading || !isInstalled()) return;
    const id = deviceId();
    if (!id) return;
    const p = platform();
    const channel = isNativeApp() ? (p === "ios" ? "app_store" : "play_store") : "web";
    const key = `fb-open-${patient?.id ?? "anon"}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch {}
    supabase.rpc("track_app_open", { p_device_id: id, p_platform: p, p_channel: channel }).then(() => {}, () => {});
  }, [loading, patient?.id]);
  return null;
}
