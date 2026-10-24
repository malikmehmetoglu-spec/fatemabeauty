"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { ErrorNote, Loading, Tag } from "@/components/ui";
import { listRooms } from "@/lib/db/catalog";
import { callPatient, checkIn, endTime, listToday, personName, serviceName, setStatus, STATUS_AR, STATUS_KIND, type QueueAppt } from "@/lib/db/queue";
import { invalidate, useQuery } from "@/lib/db/query";
import { ROLE_LABEL } from "@/lib/supabase/session";
import { clock } from "@/lib/format";
import { css } from "../css";
import { BG, C, SH, SHB, ICON_FILL } from "@/lib/tokens";
import { DatePill, KC, KioskNav, kioskError, useKiosk } from "../kiosk";
import { isPaid } from "@/lib/db/levels";
import { isVip, VipBookingDialog, VipButton, VipStar } from "../../admin/calendar/vip";

/** T_Desk.dc.html */
const FILTERS = ["الكل", "في الانتظار", "لم يؤكَّد"] as const;
type Filter = (typeof FILTERS)[number];

/** Reception tablet: today's front-desk board (queue, rooms, alerts) — live from Supabase. */
export default function Page() {
  const k = useKiosk();
  const q = useQuery(["queue", "desk"], async () => ({ today: await listToday(), rooms: await listRooms() }), { enabled: !k.gate });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("الكل");
  const [query, setQuery] = useState("");
  const [vipOpen, setVipOpen] = useState(false);
  useEffect(() => { const t = setInterval(() => invalidate("queue"), 20000); return () => clearInterval(t); }, []);
  if (k.gate) return k.gate;
  const today = q.data?.today ?? [];
  const rooms = q.data?.rooms ?? [];
  const by = (st: QueueAppt["status"]) => today.filter((a) => a.status === st);
  const nowIso = new Date().toISOString();
  const K = {
    total: today.length, done: by("done").length,
    waiting: by("checked_in").length, inSession: by("in_session").length, noShow: by("no_show"), pending: by("pending"),
    arrived: by("done").length + by("in_session").length + by("checked_in").length,
    due: today.filter((a) => a.starts_at <= nowIso).length,
  };
  const t = query.trim();
  const list = today
    .filter((a) => !t || personName(a).includes(t) || String(a.queue_no ?? "") === t || String(a.patients?.file_no ?? "") === t)
    .filter((a) => (filter === "الكل" ? a.status !== "done" && a.status !== "no_show" : filter === "في الانتظار" ? a.status === "checked_in" : a.status === "pending"))
    .sort((x, y) => {
      const rank = (a: QueueAppt) => (a.status === "in_session" ? 0 : a.status === "checked_in" ? 1 : 2);
      return rank(x) - rank(y) || (x.queue_no ?? 999) - (y.queue_no ?? 999) || x.starts_at.localeCompare(y.starts_at);
    });
  const act = async (id: string, f: () => Promise<unknown>) => {
    setBusyId(id); setErr(null);
    try { await f(); } catch (e) { setErr(kioskError(e)); }
    setBusyId(null);
  };
  const rowState = (a: QueueAppt) => {
    const c = !!a.called_at;
    return {
      call: () => act(a.id, () => callPatient(a.id)),
      label: busyId === a.id ? "…" : c ? `نداء مجدداً (${clock(a.called_at!)})` : "استدعاء",
      style: css("height:48px;padding:0 18px;border-radius:24px;border:none;font-size:15px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:6px;white-space:nowrap;" +
        (c ? "background:#E6F4EC;color:#2E7D50" : "background-color:#7B4687;background-image:linear-gradient(145deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0) 45%,rgba(0,0,0,0.20) 100%);color:#FFFFFF;box-shadow:0 10px 22px rgba(123,70,135,0.28),inset 0 1px 0 rgba(255,255,255,0.25)")),
    };
  };
  const roomNow = rooms.map((r) => {
    const cur = today.find((a) => a.room_id === r.id && a.status === "in_session");
    const next = today.filter((a) => a.room_id === r.id && a.status === "checked_in").sort((x, y) => (x.queue_no ?? 0) - (y.queue_no ?? 0))[0];
    let pct = 0;
    if (cur) { const st = new Date(cur.started_at ?? cur.starts_at).getTime(); pct = Math.min(100, Math.max(2, ((Date.now() - st) / (cur.minutes * 60000)) * 100)); }
    return { r, cur, next, pct };
  });
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>

      <KioskNav active={R.T_Desk} />
      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div className={KC.hdr} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div className={KC.title} style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>استقبال اليوم
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>{k.staff!.name}{" "}· {ROLE_LABEL[k.staff!.role]}
            </div>
          </div>
          <div className={KC.wrap} style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 auto", justifyContent: "flex-end", minWidth: 0 }}>
            <label htmlFor="q" className={KC.search} style={{ height: 56, width: 270, flex: "0 1 270px", minWidth: 200, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", boxSizing: "border-box", position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 10m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6" />
              </svg>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>بحث</span>
              <input id="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحثي بالاسم أو الدور أو الملف" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 15, color: C.ink }} />
            </label>
            <VipButton onClick={() => setVipOpen(true)} height={56} />
            <DatePill />
          </div>
        </div>
        <VipBookingDialog open={vipOpen} onClose={() => setVipOpen(false)} />
        <div className={KC.kpis} style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>مواعيد اليوم
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16" />
              </svg>
            </div>
            <div style={{ position: "relative", fontSize: 36, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{K.total}
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>{K.done} انتهت حتى الآن
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>حضرن
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{K.arrived}
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>من {K.total - K.noShow.length} موعداً اليوم
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>في الانتظار
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{K.waiting}
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>في الصالة الآن
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>في الجلسة
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{K.inSession}
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{rooms.length ? `${rooms.length} غرف` : "لا غرف بعد"}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>لم تحضر
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{K.noShow.length}
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>تحتاج إعادة حجز
            </div>
          </div>
        </div>
        <div className={KC.cols} style={{ display: "flex", gap: 18, flexGrow: 1, minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 32, padding: "18px 16px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "0 8px 10px" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>الدور الآن والقادمات
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {FILTERS.map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} style={{ height: 40, padding: "0 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", ...(filter === f ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent } : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }) }}>{f}</button>
                ))}
              </div>
            </div>
            {err && <ErrorNote style={{ margin: "0 8px 8px" }}>{err}</ErrorNote>}
            {q.loading && <Loading />}
            {q.error && <ErrorNote>{q.error}</ErrorNote>}
            {!q.loading && !q.error && list.length === 0 && (
              <div style={{ margin: "auto", textAlign: "center", color: C.sub, fontSize: 16, lineHeight: 1.7, padding: 20 }}>
                {today.length === 0 ? <>لا مواعيد اليوم بعد.<br />تظهر هنا حجوزات اليوم وزيارات بدون موعد فور تسجيلها.</> : "لا نتائج في هذا التصنيف."}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
                  <Link href={R.T_QuickBook} style={{ color: C.accent, fontWeight: 700 }}>حجز سريع</Link>·<Link href={R.T_WalkIn} style={{ color: C.accent, fontWeight: 700 }}>زيارة بدون موعد</Link>
                </div>
              </div>
            )}
            <div className={KC.scroll} style={{ overflowY: "auto", minHeight: 0, flex: list.length ? 1 : undefined }}>
            {list.map((a, i) => {
              const waiting = a.status === "checked_in", inSession = a.status === "in_session";
              const r = rowState(a);
              return (
                <div key={a.id} className={KC.drow} style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: i === 0 ? "1px solid transparent" : "1px solid #EDE2F1", ...(waiting ? { background: "linear-gradient(270deg, rgba(243,234,246,0.95) 0%, rgba(243,234,246,0) 100%)" } : {}) }}>
                  <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>{clock(inSession ? (a.started_at ?? a.starts_at) : a.starts_at)}</span>
                  <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>{a.queue_no ?? "—"}</span>
                  <div className={KC.dname} style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isVip(a) && <VipStar size={16} style={{ marginInlineEnd: 5 }} />}{personName(a)}</div>
                    <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{serviceName(a)}{a.rooms ? ` · ${a.rooms.name}` : ""}</div>
                  </div>
                  <span className={KC.dtag} style={{ width: 118 }}>
                    <Tag kind={STATUS_KIND[a.status]} style={{ height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13 }}>{STATUS_AR[a.status]}</Tag>
                  </span>
                  <span className={KC.dact} style={{ width: 150, display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    {inSession ? (
                      <button type="button" onClick={() => act(a.id, () => setStatus(a.id, "done"))} style={{ height: 44, padding: "0 14px", borderRadius: 22, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" }}>إنهاء · {endTime(a)}</button>
                    ) : waiting ? (<>
                      <button type="button" onClick={r.call} aria-label={r.label} title={r.label} disabled={busyId === a.id} style={r.style}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                        </svg>{a.called_at ? "" : r.label}
                      </button>
                      {a.called_at && !isPaid(a) && <Link href={`${R.T_Cashier}?appointment=${a.id}`} title="بانتظار الدفع — الجلسة تبدأ بعد الدفع" style={{ height: 48, padding: "0 14px", borderRadius: 24, border: "1px solid #F6DDB9", background: "#FFF3E0", color: "#9A5B14", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>الدفع</Link>}
                      {a.called_at && isPaid(a) && <button type="button" onClick={() => act(a.id, () => setStatus(a.id, "in_session"))} style={{ height: 48, padding: "0 14px", borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 14, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap" }}>دخلت</button>}
                    </>) : a.status === "pending" || a.status === "confirmed" ? (
                      <button type="button" onClick={() => act(a.id, () => checkIn(a.id))} style={{ height: 48, padding: "0 16px", borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 14, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3FA46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>{busyId === a.id ? "…" : "وصلت"}
                      </button>
                    ) : (
                      <span style={{ fontSize: 14, color: C.muted }}>—</span>
                    )}
                  </span>
                </div>
              );
            })}
            </div>
          </div>
          <div className={KC.side} style={{ width: 330, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "18px 22px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>الغرف الآن
              </div>
              {roomNow.length === 0 && <div style={{ fontSize: 14, color: C.sub2, padding: "10px 0 14px", borderTop: "1px solid #EDE2F1" }}>أضيفي الغرف من لوحة الإدارة لتظهر حالتها هنا.</div>}
              {roomNow.map(({ r, cur, next, pct }) => (
              <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: 7, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 58, whiteSpace: "nowrap" }}>{r.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: C.accent, width: 30 }}>{cur?.queue_no ?? "—"}
                  </span>
                  <span style={{ fontSize: 13, color: C.sub2, flexGrow: 1, whiteSpace: "nowrap" }}>{cur ? `تنتهي ${endTime(cur)}` : "شاغرة"}
                  </span>
                  <span style={{ fontSize: 13, color: C.sub }}>التالي{" "}
                    <b style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, fontSize: 15 }}>{next?.queue_no ?? "—"}
                    </b>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
              </div>
              ))}
            </div>
            <div style={{ borderRadius: 30, padding: "18px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>تنبيهات
              </div>
              {K.noShow.length === 0 && K.pending.length === 0 && <div style={{ fontSize: 14, color: C.sub2, lineHeight: 1.6 }}>لا تنبيهات الآن. تظهر هنا المواعيد غير المؤكدة ومن لم تحضر.</div>}
              {K.noShow.slice(0, 2).map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 22, background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8" }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isVip(a) && <VipStar size={14} style={{ marginInlineEnd: 5 }} />}{personName(a)}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>{a.services?.short_name ?? serviceName(a)} {clock(a.starts_at)} · لم تحضر
                  </div>
                </div>
                <Link href={R.T_QuickBook} style={{ height: 48, padding: "0 14px", borderRadius: 24, background: C.white, boxShadow: SHB, fontSize: 14, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>إعادة حجز
                </Link>
              </div>
              ))}
              {K.pending.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 22, background: "#FCF6EE", border: "1px solid #F5E6CF" }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{K.pending.length} مواعيد بانتظار التأكيد
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub2, fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>{K.pending.map((a) => clock(a.starts_at)).join(" · ")}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </Stage>
  );
}

