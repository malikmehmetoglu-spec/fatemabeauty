"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Chip, Circ } from "@/components/ui";
import { arDate, clock, dayKey } from "@/lib/format";
import { C, DARK, SH } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listMyNotifications, markNotificationsRead, useMe, type Notification } from "@/lib/db/patients";
import { Wait } from "../account/Wait";

type Kind = "appt" | "offer" | "care";
type Note = { id: string; icon: string; title: string; time: string; body: string; kind: string; highlight?: boolean; link?: string | null };
const ICON: Record<string, string> = { appt: "cal", offer: "gift", care: "drop", queue: "clock", waitlist: "refresh", order: "bag", written_consult: "msg", session_note: "clip", intake: "clip" };

function toNote(n: Notification): Note {
  const mins = Math.round((Date.now() - new Date(n.created_at).getTime()) / 60000);
  const time = mins < 1 ? "الآن" : mins < 60 ? `منذ ${mins} د` : dayKey(new Date(n.created_at)) === dayKey() ? clock(n.created_at) : arDate(new Date(n.created_at), { day: false });
  return { id: n.id, icon: ICON[n.kind] ?? "bell", title: n.title, body: n.body, kind: n.kind, time, highlight: !n.read_at, link: n.link };
}
const FILTERS: [string, Kind | null][] = [["الكل", null], ["المواعيد", "appt"], ["العروض", "offer"]];

function NoteCard({ n }: { n: Note }) {
  return (
    <div style={{
      borderRadius: 24, padding: "13px 14px", display: "flex", gap: 12, position: "relative",
      ...(n.highlight
        ? { background: "linear-gradient(145deg, #FFFFFF 0%, #F7EDF9 100%)", border: "1.5px solid #DEC6E8", boxShadow: "0 12px 28px rgba(150,100,170,0.18)" }
        : { background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: "0 12px 30px rgba(123,70,135,0.07), 0 2px 6px rgba(123,70,135,0.05)" }),
    }}>
      <Circ icon={n.icon} size={40} iconSize={19} />
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.45 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{n.title}</div>
          <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{n.time}</div>
        </div>
        <div style={{ fontSize: 12.5, color: C.sub }}>{n.body}</div>
        {n.link && n.link.startsWith("/") && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Link href={n.link} style={{ ...DARK, height: 38, padding: "0 18px", borderRadius: 19, boxShadow: "0 8px 16px rgba(123,70,135,0.28)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>فتح</Link>
          </div>
        )}
      </div>
      {n.highlight && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#9B4FB0", flexShrink: 0, marginTop: 6 }} />}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div style={{ fontSize: 13, color: C.sub2, position: "relative" }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>{children}</div>
    </>
  );
}

/** Notifications.dc.html — patient notifications. */
export default function NotificationsPage() {
  const [filter, setFilter] = useState<Kind | null>(null);
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data, loading: ln, error: le } = useQuery(["notifications", id], () => listMyNotifications(id), { enabled: !!id });
  const unread = (data ?? []).some((n) => !n.read_at);
  useEffect(() => { if (id && unread) { const t = setTimeout(() => markNotificationsRead(id), 2500); return () => clearTimeout(t); } }, [id, unread]);
  const GROUP: Record<Kind, string[]> = { appt: ["appt", "queue", "waitlist"], offer: ["offer"], care: ["care"] };
  const notes = (data ?? []).filter((n) => !filter || GROUP[filter].includes(n.kind));
  const groups = new Map<string, Notification[]>();
  const today = dayKey(), yest = dayKey(new Date(Date.now() - 864e5));
  for (const n of notes) {
    const k = dayKey(new Date(n.created_at));
    const label = k === today ? "اليوم" : k === yest ? "أمس" : arDate(new Date(n.created_at));
    groups.set(label, [...(groups.get(label) ?? []), n]);
  }
  return (
    <PhoneScreen>
      <TopBar title="الإشعارات" />
      {!me ? <Wait loading={loading} error={error} /> : ln || le ? <Wait loading={ln} error={le ?? undefined} /> : (<>
      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        {FILTERS.map(([t, k]) => (
          <Chip key={t} height={34} selected={filter === k} onClick={() => setFilter(k)} style={{ padding: "0 16px", fontWeight: filter === k ? 700 : 600, ...(filter === k ? { boxShadow: "0 6px 14px rgba(150,100,170,0.25)" } : { boxShadow: "none" }) }}>{t}</Chip>
        ))}
      </div>
      {[...groups.entries()].map(([label, list]) => <Group key={label} label={label}>{list.map((n) => <NoteCard key={n.id} n={toNote(n)} />)}</Group>)}
      {notes.length === 0 && (
        <div style={{ background: C.white, borderRadius: 24, padding: "26px 20px", textAlign: "center", color: C.sub2, fontSize: 13, lineHeight: 1.8, boxShadow: SH, position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><Circ icon="bell" size={48} iconSize={22} /></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 8 }}>لا توجد إشعارات {filter ? "هنا" : "بعد"}</div>
          تصلكِ هنا تذكيرات مواعيدكِ ودوركِ في الانتظار وتعليمات ما بعد الجلسة والعروض.
        </div>
      )}
      </>)}
    </PhoneScreen>
  );
}
