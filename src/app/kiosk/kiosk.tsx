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
import { BG, C, ICON_FILL, LOGO, SH, SHB } from "@/lib/tokens";
import K from "./kiosk.module.css";

export { K as KC };

/** Arabic message for any error thrown on the reception tablet (network / unknown English errors included). */
export function kioskError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e ?? "");
  if (/failed to fetch|network|load failed|fetch failed|timeout/i.test(m)) return "تعذّر الاتصال بالخادم — تحققي من الإنترنت ثم حاولي مجدداً.";
  if (/jwt|not authenticated|session/i.test(m)) return "انتهت جلسة الدخول — سجّلي الدخول مجدداً.";
  if (/permission|row-level security|not allowed|forbidden/i.test(m)) return "لا تملكين صلاحية تنفيذ هذا الإجراء.";
  if (/storage|bucket|object/i.test(m) && /[a-z]/i.test(m) && !/[\u0600-\u06FF]/.test(m)) return "تعذّر رفع الملف — حاولي مجدداً.";
  if (m && !/[\u0600-\u06FF]/.test(m)) return "حدث خطأ غير متوقع — حاولي مجدداً.";
  return m || "حدث خطأ غير متوقع — حاولي مجدداً.";
}

/** Date + live clock pill shown in every reception header. */
export function DatePill() {
  return (
    <div className={K.pill} style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
      </svg>
      <span><NowText part="date" /></span>
      <span style={{ width: 1, height: 20, background: C.border }} />
      <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}><NowText part="time" /></span>
    </div>
  );
}

const NAV: { href: string; label: string; icon: string }[] = [
  { href: R.T_Desk, label: "الاستقبال", icon: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" },
  { href: R.T_QuickBook, label: "حجز سريع", icon: "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" },
  { href: R.T_Cashier, label: "الكاشير", icon: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" },
];

/** Staff-mode side rail (top bar on portrait / phone): desk, quick booking, cashier, back to the patient welcome screen. */
export function KioskNav({ active }: { active: string }) {
  return (
    <nav aria-label="وضع الاستقبال" className={K.nav} style={{ width: 96, flexShrink: 0, borderRadius: 34, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: "22px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative" }}>
      <div className={K.navLogo} style={{ display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 44, width: "auto", display: "block" }} />
      </div>
      <div className={K.navSep} style={{ width: 44, height: 1, background: C.line }} />
      {NAV.map((n) => {
        const on = n.href === active;
        return (
          <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined} className={K.navItem} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: on ? 700 : 600, color: on ? C.accent : C.sub2, whiteSpace: "nowrap" }}>
            <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", ...(on ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)" } : {}) }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={on ? "#7B4687" : "#957D9A"} strokeWidth={on ? 1.9 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
            </span>{n.label}
          </Link>
        );
      })}
      <Link href={R.T_Welcome} className={K.navItem} style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.sub2, textAlign: "center", lineHeight: 1.3 }}>
        <span style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM11 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
          </svg>
        </span>وضع<br /> المراجعات
      </Link>
    </nav>
  );
}

/** Back button + title/subtitle + date pill: the header of the full-screen reception steps. */
export function StepHeader({ back, title, sub }: { back: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div className={K.hdr} style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
      <Link href={back} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </Link>
      <div style={{ lineHeight: 1.3, flex: "1 1 200px", minWidth: 0 }}>
        <div className={K.title} style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 15, color: C.sub2 }}>{sub}</div>}
      </div>
      <DatePill />
    </div>
  );
}

/** Reception tablet guard: staff session required; shows a loader on the tablet canvas meanwhile. */
export function useKiosk() {
  const s = useRequireStaff();
  const gate = s.loading || !s.staff
    ? <Stage fluid width={1194} height={834} background={BG} padding="36px 40px"><Loading style={{ margin: "auto" }} /></Stage>
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
    <Stage fluid width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>
      <StepHeader back={R.T_Desk} title={title} sub="اختاري موعد المراجِعة من مواعيد اليوم" />
      <div className={K.scroll} style={{ flexGrow: 1, minHeight: 0, overflowY: "auto", borderRadius: 32, padding: "10px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
        {loading && <Loading />}
        {error && <ErrorNote>{error}</ErrorNote>}
        {!loading && !error && list.length === 0 && <EmptyState title="لا مواعيد اليوم بعد" text="تظهر هنا مواعيد اليوم بعد حجزها أو تسجيل وصول المراجِعة." />}
        {list.map((a) => (
          <Link key={a.id} href={`${path}?id=${a.id}`} style={{ display: "flex", alignItems: "center", gap: 14, height: 66, borderTop: "1px solid #EDE2F1", color: C.ink }}>
            <span className="latin" style={{ width: 52, flexShrink: 0, fontSize: 17, fontWeight: 500 }}>{clock(a.starts_at)}</span>
            <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent }}>{a.queue_no ?? "—"}</span>
            <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
              <div style={{ fontSize: 17, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{personName(a)}</div>
              <div style={{ fontSize: 13, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{serviceName(a)}{a.rooms ? ` · ${a.rooms.name}` : ""}</div>
            </div>
            <span style={{ fontSize: 14, color: C.sub, flexShrink: 0 }}>{STATUS_AR[a.status]}</span>
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
