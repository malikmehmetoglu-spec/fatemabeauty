"use client";

/**
 * «تسجيل الوصول» at reception — one guided panel:
 *   1. الجلسة   — only when the session / specialist is not set yet (open booking «تُحدَّد عند الوصول»):
 *                 service → level → specialist (only those who provide it, with her live status). rpc assign_visit.
 *   2. الدفع    — embedded cashier for this appointment (cash / card / package / discount or code) → rpc create_invoice,
 *                 then check-in (random queue number). The pay gate means the session can start only after this.
 *   3. الطباعة  — invoice receipt + queue ticket in ONE print job (80mm thermal printer, same mechanism as InvoicePrint).
 * Reception never sees «بدء الجلسة» here: specialists start from the room tablet.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal, flushSync } from "react-dom";
import { Chip, ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listServices, listSpecialists } from "@/lib/db/catalog";
import {
  assignVisit, endsAt, getAppointment, isOpenVisit, listRange, personName, provides, serviceProviders, setStatus, timeOf, type Appointment,
} from "@/lib/db/appointments";
import { isPaid, levelsOf, listLevels } from "@/lib/db/levels";
import {
  createInvoice, financeError, getInvoice, getPolicies, listPatientPackages, offerDiscount, type AppliedOffer, type CartLine, type InvoiceRow, type PayMethod,
} from "@/lib/db/finance";
import { clock, dayKey, money } from "@/lib/format";
import { permsOf } from "@/lib/permissions";
import { useSession } from "@/lib/supabase/session";
import { C, ICON_FILL, SELECTED } from "@/lib/tokens";
import { loadTicket, TicketSheet, type TicketData } from "@/components/ticket/QueueTicket";
import { ReceiptSheet } from "../finance/InvoicePrint";
import { OfferCodeField } from "../finance/OfferCode";
import { levelPrice } from "../settings/services/levels";

type Step = 1 | 2 | 3;
const OFF: CSSProperties = { background: C.white, border: "1px solid #EADCF0" };
const box: CSSProperties = { borderRadius: 18, padding: "12px 14px", background: C.tint2 };
const warn: CSSProperties = { borderRadius: 16, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 700, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.55 };

/** Live status of a specialist right now, from today's appointments. */
export function specialistStatus(list: Appointment[], spId: string, except?: string) {
  const mine = list.filter((x) => x.specialist_id === spId && x.id !== except);
  const cur = mine.find((x) => x.status === "in_session");
  const waiting = mine.filter((x) => x.status === "checked_in").length;
  const now = Date.now();
  const soon = mine.find((x) => (x.status === "confirmed" || x.status === "pending") && new Date(x.starts_at).getTime() - now < 45 * 60000 && endsAt(x).getTime() > now);
  return { cur, waiting, soon, free: !cur && !waiting };
}

export function ArrivalPanel({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const { staff } = useSession();
  const mine = permsOf(staff);
  const canPay = mine.has("cashier");
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";
  const [a, setA] = useState<Appointment>(appt);
  const needSession = isOpenVisit(a) || !a.specialist_id;
  const [step, setStep] = useState<Step>(needSession ? 1 : isPaid(a) ? 3 : 2);
  const [inv, setInv] = useState<InvoiceRow | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => { const x = await getAppointment(a.id); if (x) setA(x); return x ?? a; };
  /** check-in (random queue number) if not yet. */
  const checkIn = async (x: Appointment) => { if (x.status === "confirmed" || x.status === "pending") { await setStatus(x.id, "checked_in"); return refresh(); } return x; };

  const steps = ["الجلسة", "الدفع", "الطباعة"];
  return (
    <Modal open onClose={onClose} title={`تسجيل الوصول — ${personName(a)}`} width={680}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const n = (i + 1) as Step, on = n === step, done = n < step;
          return (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px 0 8px", borderRadius: 18, fontSize: 13.5, fontWeight: 700, ...(on ? SELECTED : OFF), color: done ? C.okDeep : on ? C.accent : C.sub2, opacity: n === 1 && !needSession && !done && !on ? 0.5 : 1 }}>
              <span className="latin" style={{ width: 24, height: 24, borderRadius: 12, background: done ? "#DDF0E5" : ICON_FILL, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12.5 }}>{done ? "✓" : n}</span>{s}
            </span>
          );
        })}
      </div>
      {step === 1 && <SessionStep a={a} busy={busy} setBusy={setBusy} onDone={async () => { const x = await refresh(); setStep(isPaid(x) ? 3 : 2); if (isPaid(x)) await checkIn(x); }} />}
      {step === 2 && (canPay
        ? <PayStep a={a} isAdmin={isAdmin} onIssued={async (i) => { setInv(i); setErr(""); try { await checkIn(await refresh()); } catch (e) { setErr(financeError(e)); } setStep(3); }} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={warn}><Icon name="lock" size={17} color="#8A5A12" />لا تملكين صلاحية الكاشير. سجّلي الوصول الآن، ثم تُدفع الجلسة من الكاشير قبل البدء.</div>
            <SubmitButton busy={busy} onClick={async () => { setBusy(true); setErr(""); try { await checkIn(a); setStep(3); } catch (e) { setErr(financeError(e)); } finally { setBusy(false); } }}>تسجيل الوصول وطباعة التذكرة</SubmitButton>
          </div>
        ))}
      {step === 3 && <PrintStep a={a} inv={inv} onClose={onClose} onEnsureCheckIn={async () => { await checkIn(a); }} />}
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}

/* ---------- 1. session ---------- */

function SessionStep({ a, busy, setBusy, onDone }: { a: Appointment; busy: boolean; setBusy: (b: boolean) => void; onDone: () => Promise<void> }) {
  const services = useQuery(["catalog", "services"], listServices);
  const levels = useQuery(["levels", "all"], listLevels);
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const prov = useQuery(["appointments", "providers"], serviceProviders);
  const today = useQuery(["appointments", "day", dayKey()], () => listRange(dayKey()));
  const [svcKey, setSvcKey] = useState(isOpenVisit(a) ? "" : a.service_key);
  const [lv, setLv] = useState("");
  const [sp, setSp] = useState(a.specialist_id ?? "");
  const [err, setErr] = useState("");
  const [conflict, setConflict] = useState(false);
  useEffect(() => { setLv(""); setConflict(false); }, [svcKey]);
  useEffect(() => { setConflict(false); }, [sp, lv]);

  const svcLevels = levelsOf(levels.data, svcKey);
  const lvl = svcLevels.find((l) => l.id === lv) ?? (svcKey === a.service_key ? svcLevels.find((l) => l.id === a.level_id) : null) ?? svcLevels[0] ?? null;
  const doers = useMemo(() => (team.data ?? []).filter((t) => svcKey && provides(prov.data, t.id, svcKey)), [team.data, prov.data, svcKey]);
  const list = today.data ?? [];

  async function save(force: boolean) {
    if (!svcKey) { setErr("اختاري الجلسة."); return; }
    if (!sp) { setErr("اختاري الأخصائية."); return; }
    setBusy(true); setErr("");
    try { await assignVisit(a.id, svcKey, lvl?.id ?? null, sp, force); await onDone(); }
    catch (e) { const m = (e as Error)?.message ?? ""; if (/حُجز للتو/.test(m)) setConflict(true); else setErr(m); }
    finally { setBusy(false); }
  }

  if (services.loading || team.loading) return <Loading />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>الجلسة</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 168, overflowY: "auto" }}>
          {(services.data ?? []).filter((s) => !s.is_online).map((s) => (
            <Chip key={s.key} height={40} selected={svcKey === s.key} onClick={() => setSvcKey(s.key)}>{s.short_name}</Chip>
          ))}
        </div>
      </div>
      {svcLevels.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>المستوى</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {svcLevels.map((l) => (
              <Chip key={l.id} height={40} selected={lvl?.id === l.id} onClick={() => setLv(l.id)}>{l.name} · <span className="latin">{l.minutes}</span> د · {levelPrice(l)}</Chip>
            ))}
          </div>
        </div>
      )}
      {svcKey && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>الأخصائية <span style={{ fontWeight: 500, fontSize: 12.5, color: C.sub2 }}>· من تقدّم هذه الجلسة، وحالتها الآن</span></div>
          {doers.length === 0 ? <div style={{ fontSize: 13, color: C.sub2 }}>لا أخصائية تقدّم هذه الجلسة. عدّلي «الخدمات التي تقدّمها» من فريق العمل.</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 8 }}>
              {doers.map((t) => {
                const st = specialistStatus(list, t.id, a.id);
                const on = sp === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setSp(t.id)} style={{ textAlign: "right", borderRadius: 18, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4, fontFamily: "inherit", color: C.ink, ...(on ? SELECTED : OFF) }}>
                    <b style={{ fontSize: 14 }}>{t.name}</b>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: st.cur ? "#9C2F5C" : st.free && !st.soon ? C.okDeep : "#8A5A12" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: st.cur ? "#C8507F" : st.free && !st.soon ? "#3FA46A" : "#E0A23A" }} />
                      {st.cur ? <>في جلسة حتى <span className="latin">{clock(endsAt(st.cur))}</span></> : st.soon ? <>لديها موعد <span className="latin">{timeOf(st.soon)}</span></> : "متاحة الآن"}
                    </span>
                    {st.waiting > 0 && <span style={{ fontSize: 12, color: C.sub2 }}>ينتظرها <span className="latin">{st.waiting}</span></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {conflict && (
        <div style={warn}><Icon name="clock" size={17} color="#8A5A12" />
          <span>لا يوجد وقت فارغ الآن لهذه الأخصائية أو لا يوجد سرير فارغ في الغرفة. يمكن الحفظ رغم ذلك، وتبدأ الجلسة لاحقاً عند فراغها.</span>
        </div>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {conflict
          ? <SubmitButton busy={busy} onClick={() => save(true)}>حفظ والمتابعة رغم ذلك</SubmitButton>
          : <SubmitButton busy={busy} disabled={!svcKey || !sp} onClick={() => save(false)}>حفظ الجلسة والمتابعة إلى الدفع</SubmitButton>}
      </div>
    </div>
  );
}

/* ---------- 2. payment ---------- */

type Mode = "cash" | "card" | "package";
function PayStep({ a, isAdmin, onIssued }: { a: Appointment; isAdmin: boolean; onIssued: (inv: InvoiceRow | null) => void }) {
  const policies = useQuery(["finance", "policies"], getPolicies);
  const pkgs = useQuery(["patients", "packages", a.patient_id], () => listPatientPackages(a.patient_id as string), { enabled: !!a.patient_id });
  const usable = (pkgs.data ?? []).filter((p) => p.sessions_used < p.sessions_total && p.packages?.service_key === a.service_key);
  const [mode, setMode] = useState<Mode>("cash");
  const [pkgId, setPkgId] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [offer, setOffer] = useState<AppliedOffer | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const base: CartLine = { kind: "service", ref: a.service_key, qty: 1, label: (a.service?.name ?? "جلسة") + (a.level && a.level.level > 1 ? ` — ${a.level.name}` : ""), unit_price: a.price || 0 };
  const pkg = usable.find((p) => p.id === pkgId) ?? null;
  const lines: CartLine[] = [mode === "package" && pkg ? { ...base, unit_price: 0 } : base];
  const sub = lines[0].unit_price;
  const maxPct = policies.data?.maxDiscount ?? 0;
  const pcts = [0, 5, 10, 15, 20].filter((p) => isAdmin || p <= maxPct);
  const dAmt = offer ? offerDiscount(offer, lines) : Math.round((sub * pct) / 100);
  const total = sub - dAmt;
  const payments: { method: PayMethod; amount: number }[] = mode === "package" ? [{ method: "package", amount: 0 }, { method: "cash", amount: total }] : [{ method: mode, amount: total }];

  async function issue() {
    if (mode === "package" && !pkg) { setErr("اختاري الباقة."); return; }
    setBusy(true); setErr("");
    try {
      const inv = await createInvoice({ patientId: a.patient_id, appointmentId: a.id, lines, discount: dAmt, offerCode: offer?.code ?? null, payments, patientPackageId: mode === "package" ? pkgId : null });
      onIssued(inv ? await getInvoice(inv.id).catch(() => null) : null);
    } catch (e) { setErr(financeError(e)); } finally { setBusy(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...box, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ lineHeight: 1.45 }}>
          <b style={{ fontSize: 15 }}>{base.label}</b>
          <div style={{ fontSize: 12.5, color: C.sub2 }}><span className="latin">{a.minutes}</span> د · {a.specialist?.name ?? "—"} · {a.room?.name ?? "—"}</div>
        </div>
        <b className="latin" style={{ fontSize: 16 }}>{money(sub)}</b>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>طريقة الدفع</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip height={42} selected={mode === "cash"} onClick={() => setMode("cash")}>نقدي</Chip>
          <Chip height={42} selected={mode === "card"} onClick={() => setMode("card")}>بطاقة</Chip>
          {usable.length > 0 && <Chip height={42} selected={mode === "package"} onClick={() => { setMode("package"); setPkgId(usable[0].id); }}>رصيد باقة</Chip>}
        </div>
        {mode === "package" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {usable.map((p) => (
              <Chip key={p.id} height={40} selected={pkgId === p.id} onClick={() => setPkgId(p.id)}>{p.packages?.name ?? "باقة"} · متبقٍ <span className="latin">{p.sessions_total - p.sessions_used}</span></Chip>
            ))}
          </div>
        )}
      </div>
      {mode !== "package" && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>الخصم</div>
          <OfferCodeField lines={lines} offer={offer} onChange={setOffer} />
          {!offer && pcts.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {pcts.map((p) => <Chip key={p} height={38} selected={pct === p} onClick={() => setPct(p)}>{p === 0 ? "بدون خصم" : `${p}%`}</Chip>)}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
        <span style={{ fontSize: 14, color: C.sub2 }}>المطلوب{dAmt ? ` (بعد خصم ${money(dAmt)})` : ""}</span>
        <b className="latin" style={{ fontSize: 26 }}>{money(total)}</b>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <SubmitButton busy={busy} onClick={issue}><Icon name="receipt" color="#FFFFFF" size={18} />إصدار الفاتورة وتسجيل الوصول</SubmitButton>
    </div>
  );
}

/* ---------- 3. print ---------- */

function PrintStep({ a, inv, onClose, onEnsureCheckIn }: { a: Appointment; inv: InvoiceRow | null; onClose: () => void; onEnsureCheckIn: () => Promise<void> }) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onEnsureCheckIn().catch(() => {}).finally(() => setReady(true)); }, []);
  const t = useQuery(["queue", "ticket", a.id, ready], () => loadTicket(a.id), { enabled: ready });
  const [job, setJob] = useState<{ inv: InvoiceRow | null; t: TicketData | null } | null>(null);
  const print = (j: { inv: InvoiceRow | null; t: TicketData | null }) => { flushSync(() => setJob(j)); window.print(); setJob(null); };
  const { staff } = useSession();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...box, background: "#EAF6EF", color: C.okDeep, fontWeight: 700, fontSize: 14.5, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Icon name="check" color={C.okDeep} size={18} />
        {inv ? <>صدرت الفاتورة <span className="latin" dir="ltr">{inv.no}</span> · </> : null}تمّ تسجيل الوصول{t.data?.queue_no ? <> — الرقم <span className="latin">{t.data.queue_no}</span></> : null}
      </div>
      {!ready || t.loading ? <Loading /> : t.error ? <ErrorNote>{t.error}</ErrorNote> : t.data && <TicketSheet t={t.data} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <SubmitButton disabled={!t.data} onClick={() => print({ inv, t: t.data ?? null })}><Icon name="print" color="#FFFFFF" size={18} />{inv ? "طباعة الفاتورة والتذكرة" : "طباعة التذكرة"}</SubmitButton>
        {inv && <GhostButton icon="print" onClick={() => print({ inv: null, t: t.data ?? null })}>التذكرة فقط</GhostButton>}
        <GhostButton onClick={onClose}>تم</GhostButton>
      </div>
      <div style={{ fontSize: 12.5, color: C.sub2 }}>تنتظر في الصالة؛ نادي رقمها من «شاشة الاستقبال» عندما تفرغ الأخصائية.</div>
      {job && typeof document !== "undefined" && createPortal(
        <div data-print-receipt="">
          <style>{"@media print { @page { size: 80mm auto; margin: 0; } }"}</style>
          {job.inv && <ReceiptSheet inv={job.inv} extras={{ staff: staff?.name }} />}
          {job.t && <div style={job.inv ? { breakBefore: "page", pageBreakBefore: "always" } : undefined}><TicketSheet t={job.t} print /></div>}
        </div>, document.body)}
    </div>
  );
}
