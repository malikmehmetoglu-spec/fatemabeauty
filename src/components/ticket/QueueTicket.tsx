"use client";

/**
 * Queue ticket shown right after «تسجيل الوصول» (calendar card, kiosk desk, queue page, walk-ins), with «طباعة».
 * Printed on the same 80mm thermal printer as invoice receipts, using the same mechanism as InvoicePrint.tsx: the sheet
 * is portalled under <body> with data-print-receipt and the print CSS hides every other child of <body>. A scoped
 * @page rule (mounted only while a ticket is printing) removes browser margins/headers.
 */
import { useEffect, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Modal, Loading, ErrorNote } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, dayKey } from "@/lib/format";
import { C, LOGO, SHB } from "@/lib/tokens";
import css from "./ticket.module.css";

export type TicketData = {
  queue_no: number | null; first: string; service: string; level: string | null; specialist: string | null; starts_at: string; promo: string;
};

async function loadTicket(id: string): Promise<TicketData> {
  const [a, p] = await Promise.all([
    supabase.from("appointments").select("queue_no, starts_at, walk_in_name, patients(name), services(name), service_levels(name, level), staff:specialist_id(name)").eq("id", id).maybeSingle(),
    supabase.from("settings").select("value").eq("key", "ticket_promo").maybeSingle(),
  ]);
  if (a.error) throw new Error(a.error.message);
  if (!a.data) throw new Error("لم يُعثر على الموعد");
  const r = a.data as unknown as {
    queue_no: number | null; starts_at: string; walk_in_name: string | null; patients: { name: string | null } | null;
    services: { name: string } | null; service_levels: { name: string; level: number } | null; staff: { name: string } | null;
  };
  const full = (r.patients?.name || r.walk_in_name || "").trim();
  const v = p.data?.value as { text?: string } | string | null | undefined;
  return {
    queue_no: r.queue_no, first: full.split(/\s+/)[0] ?? "", service: r.services?.name ?? "",
    level: r.service_levels?.name ?? null,
    specialist: r.staff?.name ?? null, starts_at: r.starts_at, promo: (typeof v === "string" ? v : v?.text ?? "").trim(),
  };
}

/** The ticket itself (thermal-width, black on white). `print` = the hidden copy that only shows when printing. */
export function TicketSheet({ t, print }: { t: TicketData; print?: boolean }) {
  return (
    <div className={`${css.ticket} ${print ? css.print : css.preview}`} dir="rtl" {...(print ? { "data-print-receipt": "" } : {})}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="Fatema Beauty" style={{ height: 50, margin: "0 auto 2px", display: "block", filter: "grayscale(1) contrast(1.4)" }} />
      <div style={{ fontWeight: 700, fontSize: "11pt" }}>فاطمة بيوتي — مركز العناية بالبشرة</div>
      <div className={css.dash} />
      <div style={{ fontSize: "10pt" }}>رقمكِ</div>
      <div className={css.no}>{t.queue_no ?? "—"}</div>
      {t.first && <div style={{ fontSize: "13pt", fontWeight: 700 }}>{t.first}</div>}
      <div className={css.dash} />
      <div className={css.row}><span>الجلسة</span><b>{t.service}{t.level ? ` · ${t.level}` : ""}</b></div>
      <div className={css.row}><span>الأخصائية</span><b>{t.specialist ?? "تُحدَّد عند الدخول"}</b></div>
      <div className={css.row}><span>الموعد</span><b dir="ltr">{clock(t.starts_at)}</b></div>
      <div className={css.row}><span>التاريخ</span><b>{arDate(new Date(`${dayKey(new Date(t.starts_at))}T12:00:00`), { year: true })}</b></div>
      <div className={css.dash} />
      <div style={{ fontSize: "10pt", fontWeight: 600 }}>سننادي رقمكِ على الشاشة، يرجى الانتظار في صالة الانتظار</div>
      {t.promo && <div className={css.promo}>{t.promo}</div>}
    </div>
  );
}

const btn = { height: 48, borderRadius: 24, border: "none", fontSize: 15, fontWeight: 700, fontFamily: "inherit", padding: "0 22px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", whiteSpace: "nowrap" } as const;

function TicketModal({ id, onClose, onPrint }: { id: string; onClose: () => void; onPrint: (t: TicketData) => void }) {
  const q = useQuery(["queue", "ticket", id], () => loadTicket(id));
  return (
    <Modal open onClose={onClose} title="تمّ تسجيل الوصول — تذكرة الدور" width={420}
      footer={<>
        <button type="button" disabled={!q.data} onClick={() => q.data && onPrint(q.data)} style={{ ...btn, background: C.accent, color: C.white, boxShadow: "0 10px 22px rgba(123,70,135,0.28)", opacity: q.data ? 1 : 0.5 }}>طباعة</button>
        <button type="button" onClick={onClose} style={{ ...btn, background: C.white, color: C.accent, boxShadow: SHB }}>إغلاق</button>
      </>}>
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{q.error}</ErrorNote> : q.data && <TicketSheet t={q.data} />}
    </Modal>
  );
}

const EVT = "fb:open-ticket";
/** Opens the ticket modal from anywhere (the page must render <TicketHost /> — AdminShell and the kiosk desk do). */
export function openTicket(appointmentId: string) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT, { detail: appointmentId }));
}

/** Listens for openTicket(); `onOpenChange` lets a page pause timers while the modal is up. */
export function TicketHost({ initial, onOpenChange }: { initial?: string | null; onOpenChange?: (open: boolean) => void }) {
  const [id, setId] = useState<string | null>(initial ?? null);
  const [job, setJob] = useState<TicketData | null>(null);
  useEffect(() => {
    const on = (e: Event) => setId((e as CustomEvent<string>).detail);
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  useEffect(() => { onOpenChange?.(!!id); }, [id, onOpenChange]);
  const print = (t: TicketData) => { flushSync(() => setJob(t)); window.print(); setJob(null); };
  return (
    <>
      {id && <TicketModal id={id} onClose={() => setId(null)} onPrint={print} />}
      {job && typeof document !== "undefined" && createPortal(
        <>
          <style data-print-receipt="">{"@media print { @page { size: 80mm auto; margin: 0; } }"}</style>
          <TicketSheet t={job} print />
        </>, document.body)}
    </>
  );
}
