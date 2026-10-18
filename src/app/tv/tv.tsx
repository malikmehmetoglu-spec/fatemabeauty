"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CALL_DEFAULT, TV_DEFAULT, getSetting, lastCalled, speakCall, useLiveQueue, useNow, useOnNewCall, type CallSettings, type TvContent, type TvRow } from "@/lib/db/queue";
import { arDate, clock, dayName } from "@/lib/format";
import { C, SHB } from "@/lib/tokens";

/** Damascus calendar date as a local Date (for arDate / dayName). */
function damascusDate(now: Date) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Live data for the waiting-room TV — numbers and rooms only (public rpc today_queue, polled every 5 s).
 * Rooms come from the public rooms list; settings rows 'call' and 'tv_content' are public-readable.
 */
export function useTv() {
  const { rows, error } = useLiveQueue(5000);
  const now = useNow(10000);
  const [rooms, setRooms] = useState<string[]>([]);
  const [call, setCall] = useState<CallSettings>(CALL_DEFAULT);
  const [content, setContent] = useState<TvContent>(TV_DEFAULT);
  useEffect(() => {
    const load = () => {
      supabase.from("rooms").select("name").eq("active", true).order("sort").order("name").then(({ data }) => data && setRooms(data.map((r) => r.name)));
      getSetting("call", CALL_DEFAULT).then(setCall).catch(() => {});
      getSetting("tv_content", TV_DEFAULT).then(setContent).catch(() => {});
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);
  const list = rows ?? [];
  const names = rooms.length ? rooms : [...new Set(list.map((r) => r.room).filter(Boolean) as string[])];
  const waiting = list.filter((r) => r.status === "checked_in").sort((a, b) => a.queue_no - b.queue_no);
  const board = names.map((room) => ({
    room,
    cur: list.filter((r) => r.room === room && r.status === "in_session").sort((a, b) => b.queue_no - a.queue_no)[0]?.queue_no ?? "—",
    next: waiting.find((r) => r.room === room)?.queue_no ?? "—",
  }));
  const tips = (content.tips ?? []).filter((t) => t && (t.title || t.body));
  return {
    rows, error, board, next: waiting, call, content, tips, last: lastCalled(rows),
    time: now ? clock(now) : "", day: now ? dayName(damascusDate(now)) : "", date: now ? arDate(damascusDate(now), { day: false, year: true }) : "",
  };
}

/** Rotating index for tips. */
export function useRotate(n: number, seconds: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), Math.max(4, seconds) * 1000);
    return () => clearInterval(t);
  }, [n, seconds]);
  return n ? i % n : 0;
}

/** On a new call: switch to the call screen (from board/content). */
export function useJumpToCall(rows: TvRow[] | null, back: string) {
  const router = useRouter();
  useOnNewCall(rows, () => router.push(`/tv/call/?back=${encodeURIComponent(back)}`));
}

/** Browsers block speech until the screen has been touched once — this button unlocks it. */
export function SoundUnlock({ settings }: { settings: CallSettings }) {
  const [need, setNeed] = useState(false);
  useEffect(() => {
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    setNeed(!!ua && !ua.hasBeenActive && "speechSynthesis" in window);
  }, []);
  if (!need) return null;
  return (
    <button type="button" onClick={() => { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis.speak(u); setNeed(false); void settings; }}
      style={{ position: "absolute", bottom: 24, left: 24, zIndex: 5, height: 56, padding: "0 24px", borderRadius: 28, border: "none", background: "rgba(255,255,255,0.85)", boxShadow: SHB, color: C.accent, fontSize: 22, fontWeight: 700, fontFamily: "inherit" }}>
      المسي الشاشة لتفعيل صوت النداء
    </button>
  );
}

export { speakCall };
