"use client";

/**
 * Guest mode («المتابعة كزائرة»): browse the patient app without an account.
 * Only a local flag — no database access is granted; pages simply skip patient-only fetches
 * and ask for sign-in (askLogin) before any action that needs an account.
 */
export const GUEST_KEY = "fb.guest";

export function readGuest(): boolean {
  try { return typeof window !== "undefined" && window.localStorage.getItem(GUEST_KEY) === "1"; } catch { return false; }
}
export function setGuestFlag(on: boolean) {
  try { if (on) window.localStorage.setItem(GUEST_KEY, "1"); else window.localStorage.removeItem(GUEST_KEY); } catch {}
}

/** /login/?next=<this page> */
export function loginHref(next?: string) {
  let n = next;
  if (!n && typeof window !== "undefined") n = window.location.pathname + window.location.search;
  return n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/login") ? `/login/?next=${encodeURIComponent(n)}` : "/login/";
}

/* ---- «هذه الخطوة تحتاج تسجيل الدخول» sheet, opened from anywhere ---- */
export type AskLogin = { text?: string; booking?: boolean };
type Listener = (a: AskLogin | null) => void;
const listeners = new Set<Listener>();
export function askLogin(opts: AskLogin = {}) { listeners.forEach((f) => f(opts)); }
export function closeAskLogin() { listeners.forEach((f) => f(null)); }
export function onAskLogin(f: Listener) { listeners.add(f); return () => { listeners.delete(f); }; }
