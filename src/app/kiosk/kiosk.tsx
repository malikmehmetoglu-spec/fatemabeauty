"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stage } from "@/components/shell";
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { useRequireStaff } from "@/lib/supabase/session";
import { getAppointment, listToday, personName, serviceName, STATUS_AR, useNow, type QueueAppt } from "@/lib/db/queue";
import { useQuery } from "@/lib/db/query";
import { R } from "@/lib/routes";
import { arDate, clock } from "@/lib/format";
import { BG, C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** Reception tablet guard: staff session required; shows a loader on the tablet canvas meanwhile. */
export function useKiosk() {
  const s = useRequireStaff();
  const gate = s.loading || !s.staff
    ? <Stage width={1194} height={834} background={BG} padding="36px 40px"><Loading style={{ margin: "auto" }} /></Stage>
    : null;
  return { ...s, gate };
}

/** "الأحد 18 تشرين الأول" + "13:05" — real Damascus date & time, refreshed live. */
export function NowText({ part }: { part: "date" | "time" }): ReactNode {
  const now = useNow();
  if (!now) return "";
  if (part === "time") return clock(now);
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return arDate(new Date(y, m - 1, d));
}

/** Today's appointment picked for a step of the session flow (eligibility → consent → photos), via ?id=. */
export function useApptParam(enabled: boolean) {
  const id = useSearchParams().get("id") ?? "";
  const q = useQuery(["queue", "flow", id], async () => {
    const [appt, today] = await Promise.all([id ? getAppointment(id) : Promise.resolve(null), listToday()]);
    return { appt, today };
  }, { enabled });
  return { id, appt: q.data?.appt ?? null, today: q.data?.today ?? [], loading: q.loading, error: q.error };
}

/** Full-screen chooser shown when no appointment is selected for a flow step. */
export function ApptPicker({ title, today, loading, error, path }: { title: string; today: QueueAppt[]; loading: boolean; error?: string; path: string }) {
  const list = today.filter((a) => a.status === "checked_in" || a.status === "in_session" || a.status === "confirmed" || a.status === "done");
  return (
    <Stage width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <Link href={R.T_Desk} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </Link>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{title}</div>
          <div style={{ fontSize: 15, color: C.sub2 }}>اختاري موعد المراجِعة من مواعيد اليوم</div>
        </div>
      </div>
      <div style={{ flexGrow: 1, minHeight: 0, overflowY: "auto", borderRadius: 32, padding: "10px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
        {loading && <Loading />}
        {error && <ErrorNote>{error}</ErrorNote>}
        {!loading && !error && list.length === 0 && <EmptyState title="لا مواعيد اليوم بعد" text="تظهر هنا مواعيد اليوم بعد حجزها أو تسجيل وصول المراجِعة." />}
        {list.map((a) => (
          <Link key={a.id} href={`${path}?id=${a.id}`} style={{ display: "flex", alignItems: "center", gap: 14, height: 66, borderTop: "1px solid #EDE2F1", color: C.ink }}>
            <span className="latin" style={{ width: 56, fontSize: 17, fontWeight: 500 }}>{clock(a.starts_at)}</span>
            <span style={{ width: 44, height: 44, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent }}>{a.queue_no ?? "—"}</span>
            <div style={{ flex: 1, lineHeight: 1.3 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{personName(a)}</div>
              <div style={{ fontSize: 13, color: C.sub2 }}>{serviceName(a)}{a.rooms ? ` · ${a.rooms.name}` : ""}</div>
            </div>
            <span style={{ fontSize: 14, color: C.sub }}>{STATUS_AR[a.status]}</span>
          </Link>
        ))}
      </div>
    </Stage>
  );
}

/** Header subtitle for the selected appointment: name · service · room · time · specialist. */
export function apptLine(a: QueueAppt) {
  return [personName(a), serviceName(a), a.rooms?.name, clock(a.starts_at), a.staff ? `مع ${a.staff.name}` : null].filter(Boolean).join(" · ");
}
