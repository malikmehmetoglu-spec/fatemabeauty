"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stage } from "@/components/shell";
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { useRequireStaff } from "@/lib/supabase/session";
import { getAppointment, listToday, personName, prepFor, serviceName, STATUS_AR, useNow, type Prep, type QueueAppt } from "@/lib/db/queue";
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
  { href: R.T_Eligibility, label: "تجهيز الجلسة", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2M9 14l2 2 4-4" },
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
export function StepHeader({ back, title, sub, flow }: { back: string; title: ReactNode; sub?: ReactNode; flow?: { step: number; skip?: string } }) {
  return (
    <div className={K.hdr} style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
      <Link href={back} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </Link>
      <div style={{ lineHeight: 1.3, flex: "1 1 200px", minWidth: 0 }}>
        <div className={K.title} style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 15, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      {flow ? <FlowActions {...flow} /> : <DatePill />}
    </div>
  );
}

const FLOW_STEPS = ["الأهلية", "الموافقة", "الصور"];
const ghostBtn = { height: 52, padding: "0 18px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 };

/** Session-prep header actions: step indicator, «تخطّي» (to the next step) and «العودة إلى الاستقبال». */
function FlowActions({ step, skip }: { step: number; skip?: string }) {
  return (
    <div className={K.flowAct} style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {step > 0 && <span className={K.flowStep} style={{ fontSize: 14, color: C.sub2, fontWeight: 600, whiteSpace: "nowrap" }}>
        الخطوة <b className="latin" style={{ color: C.accent }}>{step}</b> من 3 · {FLOW_STEPS[step - 1]}
      </span>}
      {skip && <Link href={skip} style={{ ...ghostBtn, color: C.sub }}>تخطّي
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
      </Link>}
      <Link href={R.T_Desk} style={{ ...ghostBtn, color: C.accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" /></svg>
        العودة إلى الاستقبال
      </Link>
    </div>
  );
}

/* ---------- session preparation (eligibility → consent → before photos; after photos) ---------- */

/** Prep progress (eligibility / consent / photos) for a list of today's appointments. */
export function usePrep(appts: QueueAppt[], enabled = true) {
  const ids = appts.map((a) => `${a.id}:${a.eligibility_at ? 1 : 0}`).join(",");
  const q = useQuery(["queue", "prep", ids], () => prepFor(appts), { enabled: enabled && appts.length > 0 });
  return q.data ?? {};
}

/** Where «تجهيز الجلسة» should open: the first missing step (eligibility if everything is already done). */
export function prepHref(id: string, p?: Prep) {
  if (p?.elig && !p.consent) return `${R.T_Consent}?id=${id}`;
  if (p?.elig && p.consent && !p.before) return `${R.T_Photos}?id=${id}`;
  return `${R.T_Eligibility}?id=${id}`;
}
export const prepDone = (p?: Prep) => !!p && p.elig && p.consent && p.before;
export const afterHref = (id: string) => `${R.T_Photos}?id=${id}&kind=after`;

/** «الأهلية ✓ · الموافقة ✓ · الصور ✓» — green when done, grey when missing. */
export function PrepMarks({ p, after }: { p?: Prep; after?: boolean }) {
  const items: [string, boolean][] = [["الأهلية", !!p?.elig], ["الموافقة", !!p?.consent], ["الصور", !!p?.before]];
  if (after) items.push(["صور بعد", !!p?.after]);
  return (
    <span aria-label="تقدّم تجهيز الجلسة" style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: "2px 6px", fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
      {items.map(([t, ok], i) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 3, color: ok ? C.okDeep : C.muted, whiteSpace: "nowrap" }}>
          {i > 0 && <span style={{ color: "#CDB9D3", marginInlineEnd: 3 }}>·</span>}
          {t}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={ok ? 2.6 : 2} strokeLinecap="round" strokeLinejoin="round" aria-label={ok ? "تم" : "لم يتم"}>
            {ok ? <path d="M5 12l5 5L20 7" /> : <path d="M8 12h8" />}
          </svg>
        </span>
      ))}
    </span>
  );
}

/** Pill link used for «تجهيز الجلسة» / «صور بعد». */
export function PrepLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Link href={href} style={{ height: 44, padding: "0 16px", borderRadius: 22, fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0,
      ...(primary ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.25)", color: C.accent }
        : { background: C.white, border: "1px solid #EADCF0", color: C.accent }) }}>{children}</Link>
  );
}

const FLASH = "kiosk-flash";
/** Message shown as a toast on the next screen (desk) after a flow finishes. */
export function setFlash(msg: string) { try { sessionStorage.setItem(FLASH, msg); } catch { /* storage unavailable */ } }

/** Success toast for a message left by setFlash(); hides after a few seconds. */
export function FlashToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let m: string | null = null;
    try { m = sessionStorage.getItem(FLASH); sessionStorage.removeItem(FLASH); } catch { /* storage unavailable */ }
    if (m) setMsg(m);
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4500);
    return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div role="status" style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 50, maxWidth: "calc(100vw - 32px)", boxSizing: "border-box", padding: "14px 22px", borderRadius: 26, background: "#E6F4EC", border: "1px solid #CBE7D6", boxShadow: "0 16px 34px rgba(46,125,80,0.20)", color: C.okDeep, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>{msg}
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

/**
 * «تجهيز الجلسة» list (also the chooser of each flow step when no ?id= is given): today's arrived clients with their
 * prep marks, a button to start/continue the flow and, after the session, «صور بعد».
 */
export function ApptPicker({ title, today, loading, error, path }: { title: string; today: QueueAppt[]; loading: boolean; error?: string; path: string }) {
  const list = today.filter((a) => a.status === "checked_in" || a.status === "in_session" || a.status === "done")
    .sort((x, y) => { const r = (a: QueueAppt) => (a.status === "in_session" ? 0 : a.status === "checked_in" ? 1 : 2); return r(x) - r(y) || (x.queue_no ?? 999) - (y.queue_no ?? 999); });
  const prep = usePrep(list, !loading);
  const generic = path === R.T_Eligibility;
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>
      <KioskNav active={R.T_Eligibility} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className={K.hdr} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ lineHeight: 1.3, minWidth: 0 }}>
            <div className={K.title} style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{generic ? "تجهيز الجلسة" : title}</div>
            <div style={{ fontSize: 15, color: C.sub2 }}>الأهلية ← الموافقة ← صور قبل · لمن وصلن اليوم</div>
          </div>
          <DatePill />
        </div>
        <div className={K.scroll} style={{ flexGrow: 1, minHeight: 0, overflowY: "auto", borderRadius: 32, padding: "8px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
          {loading && <Loading />}
          {error && <ErrorNote>{error}</ErrorNote>}
          {!loading && !error && list.length === 0 && <EmptyState title="لا مراجِعات في الصالة بعد" text="تظهر هنا من سجّلت وصولها اليوم لتجهيز جلستها قبل الدخول." />}
          {list.map((a, i) => {
            const p = prep[a.id], post = a.status === "in_session" || a.status === "done";
            const go = generic ? prepHref(a.id, p) : `${path}?id=${a.id}`;
            return (
              <div key={a.id} className={K.prow} style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 78, padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid #EDE2F1" }}>
                <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent, fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>{a.queue_no ?? "—"}</span>
                <div className={K.pname} style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{personName(a)}</div>
                  <div style={{ fontSize: 13, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{serviceName(a)}{a.rooms ? ` · ${a.rooms.name}` : ""} · {STATUS_AR[a.status]}</div>
                  <PrepMarks p={p} after={post} />
                </div>
                <div className={K.pact} style={{ display: "flex", gap: 8, flexShrink: 0, justifyContent: "flex-end" }}>
                  {a.status !== "done" && <PrepLink href={go} primary={!prepDone(p)}>{prepDone(p) ? "مراجعة التجهيز" : p && (p.elig || p.consent || p.before) ? "متابعة التجهيز" : "تجهيز الجلسة"}</PrepLink>}
                  {post && <PrepLink href={afterHref(a.id)} primary={prepDone(p) && !p?.after}>صور بعد</PrepLink>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}

/** Header subtitle for the selected appointment: name · service · room · time · specialist. */
export function apptLine(a: QueueAppt) {
  return [personName(a), serviceName(a), a.rooms?.name, clock(a.starts_at), a.staff ? `مع ${a.staff.name}` : null].filter(Boolean).join(" · ");
}
