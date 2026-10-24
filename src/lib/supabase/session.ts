"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Tables } from "./client";
import { readGuest, setGuestFlag } from "@/lib/guest";

type State = {
  loading: boolean; session: Session | null; staff: Tables<"staff"> | null; patient: Tables<"patients"> | null;
  /** Browsing as a guest («المتابعة كزائرة»): nobody signed in, no patient data. */
  guest: boolean;
};

let cache: State = { loading: true, session: null, staff: null, patient: null, guest: false };
const subs = new Set<(s: State) => void>();
let started = false;

async function resolve(session: Session | null) {
  if (!session) { cache = { loading: false, session: null, staff: null, patient: null, guest: readGuest() }; }
  else {
    const { data: staff } = await supabase.from("staff").select("*").eq("user_id", session.user.id).eq("active", true).maybeSingle();
    let patient: Tables<"patients"> | null = null;
    if (!staff) {
      const { data } = await supabase.from("patients").select("*").eq("user_id", session.user.id).maybeSingle();
      patient = data;
    }
    // signing in ends guest mode
    if (staff || patient) setGuestFlag(false);
    cache = { loading: false, session, staff: staff ?? null, patient, guest: !staff && !patient && readGuest() };
  }
  subs.forEach((f) => f(cache));
}

function start() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => resolve(data.session));
  supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => resolve(session), 0); });
}

/** Re-reads the signed-in staff/patient row (e.g. after the patient saved her profile). */
export async function refreshSession() {
  const { data } = await supabase.auth.getSession();
  await resolve(data.session);
}

/** Turns guest mode on/off and updates every screen. */
export function setGuest(on: boolean) {
  setGuestFlag(on);
  cache = { ...cache, guest: on && !cache.staff && !cache.patient };
  subs.forEach((f) => f(cache));
}

/** Signed-in user, and whether she is a staff member or a patient. */
export function useSession() {
  const [state, setState] = useState<State>(cache);
  useEffect(() => {
    start();
    subs.add(setState);
    setState(cache);
    return () => { subs.delete(setState); };
  }, []);
  return state;
}

export const ROLE_LABEL: Record<Tables<"staff">["role"], string> = {
  owner: "المدير العام", admin: "الإدارة", specialist: "أخصائية", reception: "خدمة العملاء", accountant: "المحاسبة",
};

/**
 * Patient-only page: redirects to the login screen when nobody is signed in — except in guest mode,
 * where it returns `guest: true` (no patient) and the page shows a guest state instead of personal data.
 */
export function useRequirePatient(loginPath = "/login/") {
  const s = useSession();
  useEffect(() => {
    if (!s.loading && !s.patient && !s.staff && !s.guest) window.location.replace(loginPath);
  }, [s.loading, s.patient, s.staff, s.guest, loginPath]);
  return s;
}

/** Staff-only screen outside AdminShell (reception tablet): redirects to the staff login. */
export function useRequireStaff(loginPath = "/admin/login/") {
  const s = useSession();
  useEffect(() => {
    if (!s.loading && !s.staff) window.location.replace(loginPath);
  }, [s.loading, s.staff, loginPath]);
  return s;
}
