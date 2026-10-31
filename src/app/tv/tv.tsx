"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CALL_DEFAULT, TV_DEFAULT, autoplayBlocked, enableSound, getSetting, lastCalled, playCall, soundEnabled, useLiveQueue, useNow, useOnNewCall, type CallSettings, type TvContent, type TvRow } from "@/lib/db/queue";
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
  // numbers are random labels: never shown in an order that hints at positions — only numbers already called, newest first
  const called = list.filter((r) => r.status === "checked_in" && r.called_at).sort((a, b) => b.called_at!.localeCompare(a.called_at!));
  const board = names.map((room) => ({
    room,
    cur: list.filter((r) => r.room === room && r.status === "in_session").at(0)?.queue_no ?? "—",
    next: called.find((r) => r.room === room)?.queue_no ?? "—",
  }));
  const tips = (content.tips ?? []).filter((t) => t && (t.title || t.body));
  return {
    rows, error, board, next: called, call, content, tips, last: lastCalled(rows),
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

/**
 * Browsers block autoplay until the screen is tapped once: a full-screen «تفعيل الصوت» overlay, remembered in
 * localStorage. It comes back only if the browser still refuses audio after a reload.
 */
export function SoundUnlock({ settings }: { settings: CallSettings }) {
  const [need, setNeed] = useState(false);
  useEffect(() => {
    if (!soundEnabled()) { setNeed(true); return; }
    autoplayBlocked().then(setNeed);
  }, []);
  if (!need) return null;
  return (
    <button type="button" onClick={() => { enableSound(); setNeed(false); void settings; }}
      style={{ position: "absolute", inset: 0, zIndex: 50, border: "none", background: "rgba(43,26,48,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", cursor: "pointer" }}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "48px 72px", borderRadius: 48, background: C.white, boxShadow: SHB }}>
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
        </svg>
        <span style={{ fontSize: 56, fontWeight: 700, color: C.accent }}>تفعيل الصوت</span>
        <span style={{ fontSize: 26, color: C.sub }}>المسي الشاشة مرة واحدة ليُسمع نداء الأرقام</span>
      </span>
    </button>
  );
}

export { playCall };
