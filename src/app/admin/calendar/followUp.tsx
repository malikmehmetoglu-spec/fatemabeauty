"use client";
/**
 * «موعد المراجعة» — one tap after a consultation/session: books a follow-up (service `follow-up`, 10 min, with the
 * consultant, in her room) N days from today, on the first FREE time of that day (or the next open day).
 */
import { useEffect, useState } from "react";
import { addDays } from "./followUpDate";
import { book, bookingError, busyRanges, freeSlots, getHours, isOpen } from "@/lib/db/appointments";
import { invalidate } from "@/lib/db/query";
import { arDate, atDamascus, clock, dayKey } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { C } from "@/lib/tokens";

const SERVICE = "follow-up";
const OPTIONS = [15, 30, 40, 60];

type Next = { id: string; starts_at: string };

async function nextFollowUp(patientId: string): Promise<Next | null> {
  const { data } = await supabase.from("appointments").select("id,starts_at").eq("patient_id", patientId).eq("service_key", SERVICE)
    .gt("starts_at", new Date().toISOString()).not("status", "in", "(cancelled,no_show)").order("starts_at").limit(1);
  return (data?.[0] as Next | undefined) ?? null;
}

async function bookFollowUp(patientId: string, days: number): Promise<string> {
  const [h, svcR, spR] = await Promise.all([
    getHours(),
    supabase.from("services").select("minutes,room_id").eq("key", SERVICE).single(),
    supabase.from("staff").select("id").eq("is_consultant", true).eq("active", true).order("created_at").limit(1),
  ]);
  const minutes = svcR.data?.minutes ?? 10;
  const room = svcR.data?.room_id ?? null;
  const sp = spR.data?.[0]?.id ?? null;
  for (let i = 0; i < 21; i++) {
    const key = addDays(dayKey(), days + i);
    if (!isOpen(h, key)) continue;
    const t = freeSlots(h, key, minutes, await busyRanges(key), room, sp, 1)[0];
    if (!t) continue;
    await book({ service: SERVICE, day: key, time: t, specialist: sp, room, patient: patientId, source: "reception", level: null });
    invalidate("appointments");
    return atDamascus(key, t);
  }
  throw new Error("لا يوجد وقت فارغ قريب من هذا التاريخ.");
}

export function FollowUpPicker({ patientId }: { patientId: string | null | undefined }) {
  const [next, setNext] = useState<Next | null | undefined>(undefined);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!patientId) return;
    let live = true;
    nextFollowUp(patientId).then((n) => live && setNext(n)).catch(() => live && setNext(null));
    return () => { live = false; };
  }, [patientId]);
  if (!patientId || next === undefined) return null;

  if (next) {
    const d = new Date(next.starts_at);
    return (
      <div style={{ borderRadius: 16, padding: "9px 12px", background: "#E3F3EA", color: "#2F6E4A", fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>
        موعد المراجعة: {arDate(d, { year: false })} · الساعة <span className="latin">{clock(next.starts_at)}</span>
      </div>
    );
  }

  async function pick(n: number) {
    if (busy != null || !patientId) return;
    setBusy(n); setErr("");
    try { const at = await bookFollowUp(patientId, n); setNext({ id: "", starts_at: at }); }
    catch (e) { setErr(e instanceof Error && /لا يوجد/.test(e.message) ? e.message : bookingError(e)); }
    finally { setBusy(null); }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub }}>حجز مراجعة بعد:</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {OPTIONS.map((n) => (
          <button key={n} type="button" disabled={busy != null} onClick={() => pick(n)}
            style={{ flex: "1 1 0", minWidth: 56, height: 40, borderRadius: 20, border: `1px solid ${C.accent}`, background: busy === n ? C.accent : C.white, color: busy === n ? C.white : C.accent, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: busy != null && busy !== n ? 0.5 : 1 }}>
            {busy === n ? "…" : <><span className="latin">{n}</span> يوم</>}
          </button>
        ))}
      </div>
      {err && <div style={{ fontSize: 12.5, color: C.danger }}>{err}</div>}
    </div>
  );
}
