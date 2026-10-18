"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Tables } from "./client";

type State = { loading: boolean; session: Session | null; staff: Tables<"staff"> | null; patient: Tables<"patients"> | null };

let cache: State = { loading: true, session: null, staff: null, patient: null };
const subs = new Set<(s: State) => void>();
let started = false;

async function resolve(session: Session | null) {
  if (!session) { cache = { loading: false, session: null, staff: null, patient: null }; }
  else {
    const { data: staff } = await supabase.from("staff").select("*").eq("user_id", session.user.id).eq("active", true).maybeSingle();
    let patient: Tables<"patients"> | null = null;
    if (!staff) {
      const { data } = await supabase.from("patients").select("*").eq("user_id", session.user.id).maybeSingle();
      patient = data;
    }
    cache = { loading: false, session, staff: staff ?? null, patient };
  }
  subs.forEach((f) => f(cache));
}

function start() {
  if (started) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => resolve(data.session));
  supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => resolve(session), 0); });
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
  admin: "الإدارة", specialist: "أخصائية", reception: "الاستقبال", accountant: "المحاسبة",
};
