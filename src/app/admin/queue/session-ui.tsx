"use client";

/**
 * Pay-before-start gate, session countdown and prepaid extensions — shared by «جدولي», «الأدوار» and the cashier.
 * Server rules: migration 0140 (appointment_rules refuses in_session until paid; extensions are charged before they count).
 */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ErrorNote, GhostButton, Icon, Modal, SubmitButton, TextArea } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import {
  chargeExtension, declineExtension, listPendingExtensions, mmss, overrideStart, requestExtension, secondsLeft, useLiveExtensions, useNow,
  type PendingExtension,
} from "@/lib/db/levels";
import { C } from "@/lib/tokens";

export const cashierHref = (a: { id: string; patient_id: string | null }) =>
  `${R.W_Cashier}?appointment=${a.id}${a.patient_id ? `&patient=${a.patient_id}` : ""}`;

/** «بانتظار الدفع» chip. */
export function UnpaidTag({ style }: { style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 11px", borderRadius: 13, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      background: "#FFF3E0", color: "#A3621A", border: "1px solid #F6DDB9", ...style }}>
      <Icon name="M12 8v4l2 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18" size={14} color="#A3621A" stroke={2} />بانتظار الدفع
    </span>
  );
}

/** Link button to the cashier with the appointment preselected. */
export function ToCashier({ a, small }: { a: { id: string; patient_id: string | null }; small?: boolean }) {
  return (
    <Link href={cashierHref(a)} style={{ height: small ? 36 : 46, padding: small ? "0 12px" : "0 18px", borderRadius: small ? 18 : 23, background: C.white, border: "1px solid #EADCF0",
      color: C.accent, fontSize: small ? 12.5 : 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
      <Icon name="receipt" size={small ? 15 : 17} color={C.accent} stroke={1.9} />إلى الكاشير
    </Link>
  );
}

/** Admin/owner only: start without payment, with a reason (audit-logged). */
export function OverrideStartButton({ apptId, name, small, onDone }: { apptId: string; name: string; small?: boolean; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const go = async () => {
    setBusy(true); setErr("");
    try { await overrideStart(apptId, reason); setOpen(false); setReason(""); onDone?.(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  return <>
    <button type="button" onClick={() => setOpen(true)} style={{ height: small ? 36 : 46, padding: small ? "0 12px" : "0 16px", borderRadius: small ? 18 : 23, border: "1px dashed #E3C9A6",
      background: "transparent", color: "#9A5B14", fontSize: small ? 12.5 : 13.5, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>بدء دون دفع</button>
    <Modal open={open} onClose={() => setOpen(false)} title="بدء الجلسة دون دفع" width={460}
      footer={<div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <GhostButton onClick={() => setOpen(false)}>إلغاء</GhostButton>
        <SubmitButton busy={busy} disabled={reason.trim().length < 3} onClick={go}>بدء الجلسة</SubmitButton>
      </div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.7 }}>ستبدأ جلسة <b style={{ color: C.ink }}>{name}</b> قبل دفعها. يُسجَّل السبب واسمكِ في سجلّ العمليات، وتبقى الفاتورة مستحقة في الكاشير.</div>
        <TextArea label="السبب" value={reason} onChange={setReason} placeholder="مثلاً: عميلة دائمة ستدفع بعد الجلسة" rows={3} />
        {err && <ErrorNote>{err}</ErrorNote>}
      </div>
    </Modal>
  </>;
}

type TimerAppt = { started_at: string | null; starts_at: string; minutes: number; extension_minutes?: number | null };

/** Countdown of the booked time (+ paid extensions): normal → amber at ≤ 10 min → red «+mm:ss تجاوز». */
export function SessionTimer({ a, dark, compact }: { a: TimerAppt; dark?: boolean; compact?: boolean }) {
  const now = useNow();
  const left = secondsLeft(a, now);
  const over = left < 0, warn = !over && left <= 600;
  const bg = over ? "#C2415B" : warn ? "#F2A93B" : dark ? "rgba(255,255,255,0.16)" : "#F4ECF7";
  const fg = over || warn ? "#FFFFFF" : dark ? "#FFFFFF" : C.accent;
  return (
    <span role="timer" aria-label={over ? "تجاوزت الجلسة وقتها" : "الوقت المتبقي"} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: compact ? 28 : 34,
      padding: compact ? "0 10px" : "0 14px", borderRadius: 17, background: bg, color: fg, fontWeight: 700, fontSize: compact ? 13 : 15, whiteSpace: "nowrap", flexShrink: 0,
      border: dark && !over && !warn ? "1px solid rgba(255,255,255,0.35)" : "none" }}>
      <Icon name="M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18" size={compact ? 14 : 16} color={fg} stroke={2} />
      <span className="latin" dir="ltr">{over ? "+" : ""}{mmss(left)}</span>
      <span style={{ fontSize: compact ? 11.5 : 12.5, fontWeight: 600 }}>{over ? "تجاوز" : warn ? "قاربت على الانتهاء" : "متبقٍ"}</span>
    </span>
  );
}

/** Pending extension for one appointment (from the live list). */
export function usePendingExtensions(channel: string) {
  useLiveExtensions(channel);
  return useQuery(["extensions", "pending"], listPendingExtensions);
}

/** Specialist: «طلب تمديد» +30 / +60 on the in-session card; shows the waiting state once requested. */
export function ExtendRequest({ apptId, pending, dark, onError }: { apptId: string; pending?: PendingExtension; dark?: boolean; onError?: (m: string) => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const ask = async (m: 30 | 60) => {
    setBusy(m);
    try { await requestExtension(apptId, m); } catch (e) { onError?.(e instanceof Error ? e.message : String(e)); } finally { setBusy(null); }
  };
  const line = dark ? "rgba(255,255,255,0.45)" : "#EADCF0";
  const fg = dark ? "#FFFFFF" : C.accent;
  if (pending) return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "6px 14px", borderRadius: 20, border: `1px dashed ${line}`, color: fg, fontSize: 13, fontWeight: 600 }}>
      <Icon name="M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18" size={15} color={fg} />
      طلب تمديد {pending.minutes} دقيقة بانتظار الدفع في الاستقبال
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, color: dark ? "#F2E6F4" : C.sub2, fontWeight: 600 }}>طلب تمديد</span>
      {([30, 60] as const).map((m) => (
        <button key={m} type="button" disabled={busy !== null} onClick={() => ask(m)} style={{ height: 40, padding: "0 14px", borderRadius: 20, border: `1px solid ${line}`, background: "transparent",
          color: fg, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", opacity: busy !== null && busy !== m ? 0.5 : 1 }}>
          {busy === m ? "…" : <span className="latin" dir="ltr">+{m}</span>} د
        </button>
      ))}
    </span>
  );
}

const who = (e: PendingExtension) => e.appointment?.patient?.name || e.appointment?.walk_in_name || "مراجِعة";

/** Reception: highlighted list of extension requests waiting for payment — charge (cash/card) or decline. */
export function ExtensionRequests({ list, title = "طلبات تمديد بانتظار الدفع" }: { list: PendingExtension[]; title?: string }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  if (!list.length) return null;
  const run = async (key: string, f: () => Promise<unknown>) => {
    setBusy(key); setErr("");
    try { await f(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };
  return (
    <div role="region" aria-label={title} style={{ borderRadius: 24, padding: "14px 16px", background: "linear-gradient(160deg,#FFF6EA,#FDEBD6)", border: "1px solid #F6DDB9",
      boxShadow: "0 10px 24px rgba(190,130,60,0.16)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#8A4F12" }}>
        <Icon name="M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18" size={18} color="#8A4F12" stroke={2} />{title}
        <span className="latin" style={{ height: 22, minWidth: 22, padding: "0 7px", borderRadius: 11, background: "#B8741F", color: "#fff", fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{list.length}</span>
      </div>
      {list.map((e) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "rgba(255,255,255,0.75)", borderRadius: 18, padding: "10px 12px" }}>
          <div style={{ flex: "1 1 200px", minWidth: 0, lineHeight: 1.45 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{who(e)} · تمديد <span className="latin">{e.minutes}</span> دقيقة</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{[e.appointment?.service?.name, e.appointment?.room?.name, e.appointment?.specialist?.name].filter(Boolean).join(" · ")}</div>
          </div>
          <b style={{ fontSize: 15, color: C.accent, whiteSpace: "nowrap" }}>{money(e.price)}</b>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SubmitButton busy={busy === e.id + "cash"} disabled={!!busy} onClick={() => run(e.id + "cash", () => chargeExtension(e.id, "cash"))} style={{ height: 38, padding: "0 14px", fontSize: 13 }}>تحصيل نقداً</SubmitButton>
            <GhostButton onClick={() => !busy && run(e.id + "card", () => chargeExtension(e.id, "card"))} style={{ height: 38, padding: "0 14px", fontSize: 13 }}>{busy === e.id + "card" ? "…" : "بطاقة"}</GhostButton>
            <GhostButton color={C.danger} onClick={() => !busy && run(e.id + "no", () => declineExtension(e.id))} style={{ height: 38, padding: "0 14px", fontSize: 13 }}>{busy === e.id + "no" ? "…" : "رفض"}</GhostButton>
          </div>
        </div>
      ))}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ fontSize: 12, color: "#8A5A26" }}>يُمدَّد وقت الجلسة فور التحصيل. عند الرفض تنتهي الجلسة في وقتها.</div>
    </div>
  );
}
