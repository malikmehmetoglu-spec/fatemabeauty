"use client";

/**
 * VIP: gold star, «حجز VIP» button, per-room reserve chips and the booking dialog (nearest free time today, ×1.7 price,
 * optional check-in) with the admin-only «إدخال فوق موعد قائم» override. Used by the admin calendar, kiosk desk / quick-book and queue.
 */
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ErrorNote, GhostButton, Loading, Modal, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listServices } from "@/lib/db/catalog";
import { levelsOf, listLevels, patientLevels } from "@/lib/db/levels";
import { createPatient } from "@/lib/db/appointments";
import { getCentre } from "@/lib/db/bookingRequests";
import { useSession } from "@/lib/supabase/session";
import { atDamascus, clock, dayKey, money } from "@/lib/format";
import { C, SH } from "@/lib/tokens";
import {
  bookReserveWalkIn, bookVip, displacedText, GOLD, GOLD_DEEP, GOLD_LINE, GOLD_SOFT, overridePreview, reserveChipText, reserveStatus,
  searchClients, setPatientVip, vipError, vipNextSlots, vipOverride, type OverridePlan, type VipClient, type VipSlot,
} from "@/lib/db/vip";
import { WaButton } from "./whatsapp";

const STAR = "M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z";
export const GOLD_GRAD = "linear-gradient(145deg, #E2C277 0%, #C9A24B 48%, #A88130 100%)";

/** Filled gold star (VIP). */
export function VipStar({ size = 15, title = "عميلة VIP", style }: { size?: number; title?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={title} style={{ flexShrink: 0, verticalAlign: "-2px", ...style }}>
      <title>{title}</title>
      <path d={STAR} fill={GOLD} stroke={GOLD_DEEP} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}

/** Is this appointment / patient VIP? (appointment booked as VIP, or the client's file is flagged) */
export const isVip = (a: { vip?: boolean | null; patient?: { vip?: boolean | null } | null; patients?: { vip?: boolean | null } | null } | null | undefined) =>
  !!a && !!(a.vip || a.patient?.vip || a.patients?.vip);

/** Gold «حجز VIP» pill. */
export function VipButton({ onClick, label = "حجز VIP", height = 46, style }: { onClick: () => void; label?: string; height?: number; style?: CSSProperties }) {
  return (
    <button type="button" onClick={onClick} style={{
      height, borderRadius: height / 2, padding: "0 18px", border: "1px solid rgba(255,255,255,0.6)", background: GOLD_GRAD, color: "#FFFFFF",
      fontSize: height > 50 ? 16 : 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap", flexShrink: 0,
      boxShadow: "0 12px 26px rgba(169,129,48,0.32), inset 0 1px 0 rgba(255,255,255,0.35)", fontFamily: "inherit", ...style,
    }}>
      <svg width={17} height={17} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} fill="#FFFFFF" /></svg>{label}
    </button>
  );
}

/** Day header chips: «الاحتياطي: بقي X من Y دقيقة» per room (staff only). */
export function ReserveChips({ day, compact = false }: { day: string; compact?: boolean }) {
  const q = useQuery(["reserve", day], () => reserveStatus(day));
  const rows = (q.data ?? []).filter((r) => r.capacity > 0);
  if (!rows.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="الاحتياطي اليومي لكل غرفة">
      {rows.map((r) => {
        const empty = r.reserve_left <= 0;
        return (
          <span key={r.room_id} title={`١٠٪ من وقت الغرفة محجوز لحالات VIP والطوارئ — لا يظهر في رابط الحجز ولا في التطبيق.${r.walk_in_open ? " آخر ساعتين: متاح لأي حالة دون موعد." : ""}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: compact ? 32 : 36, padding: "4px 12px", borderRadius: 18, fontSize: compact ? 12.5 : 13, fontWeight: 600, lineHeight: 1.35,
              background: empty ? "#F6F1F7" : GOLD_SOFT, border: `1px solid ${empty ? "#E7DDEA" : GOLD_LINE}`, color: empty ? C.sub2 : GOLD_DEEP }}>
            <VipStar size={13} title="الاحتياطي" />
            <span><b style={{ color: C.ink, fontWeight: 700 }}>{r.room_name}</b> · {reserveChipText(r)}</span>
            {r.walk_in_open && !empty && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2F6E4A", background: "#E6F4EC", borderRadius: 10, padding: "1px 8px", whiteSpace: "nowrap" }}>مفتوح لأي حالة</span>}
          </span>
        );
      })}
    </div>
  );
}

/** Destructive confirm: enabled after a 10-second countdown. */
export function CountdownButton({ children, onClick, busy, disabled, seconds = 10 }: { children: ReactNode; onClick: () => void; busy?: boolean; disabled?: boolean; seconds?: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const off = busy || disabled || left > 0;
  return (
    <button type="button" onClick={onClick} disabled={off} style={{
      height: 50, padding: "0 22px", borderRadius: 25, border: "none", background: off ? "#E3D6E6" : "linear-gradient(145deg, #D0679A, #A63F6E)",
      color: off ? C.sub2 : "#FFFFFF", fontSize: 15, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: off ? "none" : "0 12px 26px rgba(166,63,110,0.30)", whiteSpace: "nowrap", fontFamily: "inherit",
    }}>
      {busy ? "جارٍ التنفيذ…" : left > 0 ? <>{children} <span className="latin" style={{ minWidth: 22 }}>({left})</span></> : children}
    </button>
  );
}

const card: CSSProperties = { borderRadius: 22, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 };
const stepTitle = (n: number, t: string, extra?: ReactNode) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
    <span className="latin" style={{ width: 26, height: 26, borderRadius: 13, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, color: GOLD_DEEP, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
    <b style={{ fontSize: 15.5 }}>{t}</b>{extra}
  </div>
);
const pill = (on: boolean): CSSProperties => ({
  minHeight: 42, padding: "6px 14px", borderRadius: 21, fontSize: 14, fontWeight: 600, fontFamily: "inherit", textAlign: "center", lineHeight: 1.35,
  background: on ? GOLD_SOFT : C.white, border: on ? `1.5px solid ${GOLD}` : "1px solid #EADCF0", color: on ? GOLD_DEEP : C.sub, boxShadow: on ? "0 6px 14px rgba(169,129,48,0.18)" : "none",
});
const input: CSSProperties = { height: 46, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, padding: "0 14px", fontSize: 14.5, color: C.ink, outline: "none", minWidth: 0, fontFamily: "inherit" };
const actions: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "flex-start", paddingTop: 4 };

/** Next grid time (15 min) from now, "HH:MM". */
function nextGrid() {
  const [h, m] = clock().split(":").map(Number);
  const t = Math.ceil((h * 60 + m + 1) / 15) * 15;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

type Done = { id: string; starts_at: string; price: number; vip: boolean; plan?: OverridePlan | null };

/** «حجز VIP»: client → service → level → nearest free times today → confirm (or admin override on top of a booking). */
export function VipBookingDialog({ open, onClose, initialClient }: { open: boolean; onClose: () => void; initialClient?: VipClient | null }) {
  const { staff } = useSession();
  const canOverride = staff?.role === "owner" || staff?.role === "admin";
  const services = useQuery(["catalog", "services"], listServices, { enabled: open });
  const levels = useQuery(["levels", "all"], listLevels, { enabled: open });
  const centre = useQuery(["booking-requests", "centre"], getCentre, { enabled: open });

  const [client, setClient] = useState<VipClient | null>(initialClient ?? null);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<VipClient[] | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [svc, setSvc] = useState<string>("");
  const [lvPick, setLvPick] = useState<string | null>(null);
  const [slotPick, setSlotPick] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [mode, setMode] = useState<"book" | "override">("book");
  const [ovTime, setOvTime] = useState(nextGrid());
  const [plan, setPlan] = useState<OverridePlan | null>(null);

  useEffect(() => {
    if (!open) return;
    setClient(initialClient ?? null); setTerm(""); setHits(null); setNewName(""); setNewPhone(""); setSvc(""); setLvPick(null); setSlotPick(null);
    setCheckIn(true); setBusy(false); setErr(null); setDone(null); setMode("book"); setPlan(null); setOvTime(nextGrid());
    // reset only when the dialog opens (callers may pass a fresh initialClient object on every render)
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pLevels = useQuery(["levels", "patient", client?.id], () => patientLevels(client!.id), { enabled: open && !!client });
  const LV = levelsOf(levels.data, svc);
  const assigned = (pLevels.data ?? []).find((x) => x.service_key === svc)?.level_id;
  const lvl = LV.find((l) => l.id === lvPick) ?? LV.find((l) => l.id === assigned) ?? LV[0] ?? null;
  const slots = useQuery(["appointments", "vip-slots", svc, lvl?.id ?? ""], () => vipNextSlots(svc, lvl?.id ?? null), { enabled: open && !!svc && !!lvl });
  const reserve = useQuery(["reserve", dayKey()], () => reserveStatus(dayKey()), { enabled: open });
  const S = slots.data ?? [];
  const picked: VipSlot | undefined = S.find((s) => s.starts_at === slotPick) ?? S[0];
  const room = reserve.data?.find((r) => r.room_id === picked?.room_id);
  const svcRow = (services.data ?? []).find((s) => s.key === svc);
  const walkInOpen = !!room?.walk_in_open && !!client && !client.vip;

  if (!open) return null;

  const search = async () => {
    setErr(null);
    try { setHits(await searchClients(term)); } catch (e) { setErr(vipError(e)); }
  };
  const create = async () => {
    setBusy(true); setErr(null);
    try {
      const p = await createPatient(newName, newPhone);
      if (!p) throw new Error("no patient");
      setClient({ id: p.id, name: p.name, phone: p.phone, file_no: p.file_no, vip: false }); setHits(null);
    } catch (e) { setErr(vipError(e)); }
    setBusy(false);
  };
  const book = async (asVip: boolean) => {
    if (!client || !picked || !lvl) return;
    setBusy(true); setErr(null);
    try {
      const fn = asVip ? bookVip : bookReserveWalkIn;
      const a = await fn({ patient: client.id, service: svc, level: lvl.id, starts: picked.starts_at, specialist: picked.specialist_id, checkIn });
      if (!a) throw new Error("no appointment");
      setDone({ id: a.id, starts_at: a.starts_at, price: a.price ?? 0, vip: asVip });
    } catch (e) { setErr(vipError(e)); }
    setBusy(false);
  };
  const preview = async () => {
    if (!client || !lvl) return;
    setBusy(true); setErr(null); setPlan(null);
    try { setPlan(await overridePreview({ patient: client.id, service: svc, level: lvl.id, starts: atDamascus(dayKey(), ovTime) })); } catch (e) { setErr(vipError(e)); }
    setBusy(false);
  };
  const applyOverride = async () => {
    if (!client || !lvl) return;
    setBusy(true); setErr(null);
    try {
      const r = await vipOverride({ patient: client.id, service: svc, level: lvl.id, starts: atDamascus(dayKey(), ovTime), checkIn });
      setDone({ id: r.appointment_id ?? "", starts_at: r.starts_at, price: r.price, vip: true, plan: r });
    } catch (e) { setErr(vipError(e)); }
    setBusy(false);
  };

  const title = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <VipStar size={20} title="VIP" />{mode === "override" && !done ? "إدخال فوق موعد قائم" : "حجز VIP"}
      <span style={{ fontSize: 12.5, fontWeight: 700, color: GOLD_DEEP, background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}`, borderRadius: 12, padding: "2px 10px" }}>السعر <span className="latin">×1.7</span></span>
    </span>
  );

  /* ---------- done ---------- */
  if (done) {
    const moved = done.plan?.conflicts ?? [];
    return (
      <Modal open onClose={onClose} title={title} width={600}>
        <div style={{ borderRadius: 22, padding: "16px 18px", background: done.vip ? GOLD_SOFT : "#EAF7EF", border: `1px solid ${done.vip ? GOLD_LINE : "#CDE8D7"}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <b style={{ fontSize: 16, color: done.vip ? GOLD_DEEP : "#2F6E4A" }}>{done.vip ? "تم حجز موعد VIP" : "تم الحجز من الاحتياطي"} — {client?.name}</b>
          <span style={{ fontSize: 14, color: C.sub }}>
            {svcRow?.name}{lvl && lvl.level > 1 ? ` · ${lvl.name}` : ""} · الساعة <span className="latin">{clock(done.starts_at)}</span> · {money(done.price)}{checkIn ? " · سُجّل وصولها" : ""}
          </span>
        </div>
        {moved.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <b style={{ fontSize: 15 }}>المواعيد التي تأثّرت</b>
            {moved.map((c) => (
              <div key={c.id} style={{ ...card, gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <b style={{ fontSize: 14.5 }}>{c.name ?? "مراجِعة"}</b>
                  <span style={{ fontSize: 13, color: c.moved ? "#2F6E4A" : "#9A6A1E", fontWeight: 700 }}>{c.moved && c.alt_starts_at ? <>نُقل إلى <span className="latin">{clock(c.alt_starts_at)}</span>{dayKey(new Date(c.alt_starts_at)) !== dayKey() ? ` (${c.alt_starts_at.slice(0, 10)})` : ""}</> : "بقي للمعالجة اليدوية"}</span>
                </div>
                <span style={{ fontSize: 13, color: C.sub2 }}>{c.service} · كان <span className="latin">{clock(c.starts_at)}</span></span>
                <div style={actions}>
                  <WaButton phone={c.phone} text={displacedText(c, centre.data ?? {})}>رسالة اعتذار وإعادة جدولة</WaButton>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={actions}>
          {done.id && <Link href={`${R.T_Cashier}?appointment=${done.id}`} style={{ height: 46, padding: "0 18px", borderRadius: 23, background: GOLD_GRAD, color: "#fff", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>الدفع في الكاشير</Link>}
          <GhostButton onClick={onClose}>إغلاق</GhostButton>
        </div>
      </Modal>
    );
  }

  /* ---------- client + service (shared by both modes) ---------- */
  const clientStep = (
    <div style={card}>
      {stepTitle(1, "العميلة")}
      {client ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 18, background: client.vip ? GOLD_SOFT : "#F8F2FA", border: `1px solid ${client.vip ? GOLD_LINE : "#EDE2F1"}` }}>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>{client.vip && <VipStar />}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name || "بدون اسم"}</span></div>
            <div style={{ fontSize: 12.5, color: C.sub2 }}>ملف <span className="latin">{client.file_no}</span>{client.phone ? <> · <span className="latin" dir="ltr">{client.phone}</span></> : ""}{client.vip ? " · عميلة VIP" : ""}</div>
          </div>
          <GhostButton onClick={() => { setClient(null); setSlotPick(null); setPlan(null); }} style={{ height: 38, padding: "0 14px" }}>تغيير</GhostButton>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input aria-label="بحث عن عميلة" value={term} onChange={(e) => { setTerm(e.target.value); setHits(null); }} onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="الاسم أو رقم الهاتف أو رقم الملف" style={{ ...input, flex: 1 }} />
            <GhostButton onClick={search} style={{ height: 46 }}>بحث</GhostButton>
          </div>
          {hits && hits.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {hits.map((h) => (
                <button key={h.id} type="button" onClick={() => { setClient(h); setHits(null); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 44, padding: "6px 14px", borderRadius: 16, border: `1px solid ${h.vip ? GOLD_LINE : "#EADCF0"}`, background: h.vip ? GOLD_SOFT : C.white, fontFamily: "inherit", fontSize: 14.5, color: C.ink, textAlign: "right" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>{h.vip && <VipStar size={14} />}<b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name || "بدون اسم"}</b></span>
                  <span className="latin" style={{ color: C.sub2, fontSize: 13 }}>{h.file_no}</span>
                </button>
              ))}
            </div>
          )}
          {hits && hits.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 13.5, color: C.sub }}>لا يوجد ملف بهذا البحث — افتحي ملفاً جديداً:</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
                <input aria-label="اسم العميلة" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="الاسم" style={input} />
                <input aria-label="رقم الهاتف" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="رقم الهاتف (اختياري)" dir="ltr" style={{ ...input, textAlign: "right" }} />
              </div>
              <div style={actions}><GhostButton onClick={() => newName.trim().length >= 2 && !busy && create()} icon="plus">فتح ملف جديد</GhostButton></div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const serviceStep = (
    <div style={card}>
      {stepTitle(2, "الخدمة والمستوى")}
      {services.loading ? <Loading /> : (
        <select aria-label="الخدمة" value={svc} onChange={(e) => { setSvc(e.target.value); setLvPick(null); setSlotPick(null); setPlan(null); }} style={{ ...input, width: "100%", appearance: "none" }}>
          <option value="">اختاري الخدمة…</option>
          {(services.data ?? []).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
        </select>
      )}
      {LV.length > 1 && (
        <div role="radiogroup" aria-label="مستوى الجلسة" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LV.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={lvl?.id === l.id} onClick={() => { setLvPick(l.id); setSlotPick(null); setPlan(null); }} style={pill(lvl?.id === l.id)}>
              {l.name} · <span className="latin">{l.minutes}</span> د{l.id === assigned ? " · ملفها" : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const checkInRow = (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 18, background: "#F8F2FA", fontSize: 14, fontWeight: 600 }}>
      <span>العميلة في المركز الآن — تسجيل وصولها مباشرة</span>
      <Toggle on={checkIn} onChange={setCheckIn} label="تسجيل الوصول مباشرة" />
    </label>
  );

  /* ---------- override ---------- */
  if (mode === "override") {
    return (
      <Modal open onClose={onClose} title={title} width={640}>
        {clientStep}
        {serviceStep}
        <div style={card}>
          {stepTitle(3, "الوقت المطلوب اليوم")}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input type="time" step={900} aria-label="الوقت" value={ovTime} onChange={(e) => { setOvTime(e.target.value); setPlan(null); }} dir="ltr" style={{ ...input, width: 140 }} />
            <GhostButton onClick={() => client && svc && !busy && preview()} icon="search">عرض التعارضات</GhostButton>
          </div>
          {!client || !svc ? <span style={{ fontSize: 13, color: C.sub2 }}>اختاري العميلة والخدمة أولاً.</span> : null}
          {plan && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 13.5, color: C.sub }}>
                موعد VIP: <span className="latin">{clock(plan.starts_at)}–{clock(plan.ends_at)}</span>{plan.specialist ? ` · ${plan.specialist}` : ""} · {money(plan.price)}
              </span>
              {plan.conflicts.length === 0 ? (
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#2F6E4A" }}>لا يوجد تعارض في هذا الوقت — سيُحجز مباشرة.</span>
              ) : plan.conflicts.map((c) => (
                <div key={c.id} style={{ borderRadius: 18, padding: "10px 14px", background: c.movable ? "#FFF9EF" : "#FDECEF", border: `1px solid ${c.movable ? "#F2D8AA" : "#F2C4CF"}`, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <b style={{ fontSize: 14.5 }}>{c.name ?? "مراجِعة"}</b>
                    <span style={{ fontSize: 13, color: C.sub2 }}>{c.service} · <span className="latin">{clock(c.starts_at)}</span>{c.specialist ? ` · ${c.specialist}` : ""}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: !c.movable ? "#B03D6A" : c.alt_starts_at ? "#7A4F12" : "#9A6A1E" }}>
                    {!c.movable ? "وصلت أو بدأت جلستها — لا يمكن نقلها"
                      : c.alt_starts_at ? <>الموعد البديل المقترح: <span className="latin">{clock(c.alt_starts_at)}</span>{dayKey(new Date(c.alt_starts_at)) !== dayKey() ? <> يوم <span className="latin">{c.alt_starts_at.slice(0, 10)}</span></> : " اليوم"}{c.alt_specialist ? ` · ${c.alt_specialist}` : ""}</>
                      : "لا يوجد وقت بديل قريب — يبقى للمعالجة اليدوية"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {checkInRow}
        {err && <ErrorNote>{err}</ErrorNote>}
        <div style={actions}>
          {plan && !plan.blocked && client && (
            <CountdownButton key={`${plan.starts_at}-${plan.conflicts.length}`} busy={busy} onClick={applyOverride}>
              {plan.conflicts.length ? "تأكيد الإدخال ونقل الموعد" : "تأكيد حجز VIP"}
            </CountdownButton>
          )}
          <GhostButton onClick={() => { setMode("book"); setPlan(null); setErr(null); }}>رجوع</GhostButton>
        </div>
      </Modal>
    );
  }

  /* ---------- book ---------- */
  return (
    <Modal open onClose={onClose} title={title} width={640}>
      {clientStep}
      {serviceStep}
      <div style={card}>
        {stepTitle(3, "أقرب الأوقات اليوم", picked && <span style={{ marginInlineStart: "auto", fontSize: 13.5, color: C.sub2 }}>
          <s className="latin" style={{ color: C.muted }}>{picked.base_price.toLocaleString("en-US")}</s>{" "}
          <b className="latin" style={{ color: GOLD_DEEP, fontSize: 15 }}>{picked.price.toLocaleString("en-US")}</b> ل.س
        </span>)}
        {!svc ? <span style={{ fontSize: 13.5, color: C.sub2 }}>اختاري الخدمة لعرض أقرب وقت شاغر في الغرفة المناسبة مع أخصائية متاحة.</span>
          : slots.loading ? <Loading />
          : slots.error ? <ErrorNote>{vipError(new Error(slots.error))}</ErrorNote>
          : S.length === 0 ? (
            <div style={{ borderRadius: 18, padding: "12px 14px", background: "#FFF9EF", border: "1px solid #F2D8AA", display: "flex", flexDirection: "column", gap: 8 }}>
              <b style={{ fontSize: 14.5, color: "#7A4F12" }}>لا يوجد وقت شاغر اليوم لهذه الخدمة — حتى من الاحتياطي.</b>
              <span style={{ fontSize: 13.5, color: C.sub }}>{canOverride ? "يمكنكِ إدخالها فوق موعد قائم: نعرض المواعيد المتعارضة ونقترح لها وقتاً بديلاً قبل التأكيد." : "اطلبي من الإدارة إدخالها فوق موعد قائم."}</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
              {S.map((s) => {
                const on = picked?.starts_at === s.starts_at;
                return (
                  <button key={s.starts_at} type="button" aria-pressed={on} onClick={() => setSlotPick(s.starts_at)} style={{ ...pill(on), display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, padding: "8px 12px", borderRadius: 18, textAlign: "right" }}>
                    <span className="latin" style={{ fontSize: 16, fontWeight: 700, color: on ? GOLD_DEEP : C.ink }} dir="ltr">{clock(s.starts_at)}–{clock(s.ends_at)}</span>
                    <span style={{ fontSize: 12.5, color: C.sub2, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{s.specialist_name ?? "أي أخصائية"}</span>
                    {s.in_reserve && <span style={{ fontSize: 11.5, fontWeight: 700, color: GOLD_DEEP }}>من الاحتياطي</span>}
                  </button>
                );
              })}
            </div>
          )}
        {room && <span style={{ fontSize: 12.5, color: C.sub2 }}>{room.room_name} · {reserveChipText(room)}{room.walk_in_open ? " · آخر ساعتين: متاح لأي حالة دون موعد" : ""}</span>}
      </div>
      {stepTitle(4, "التأكيد")}
      {checkInRow}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={actions}>
        <button type="button" disabled={!client || !picked || busy} onClick={() => book(true)} style={{
          height: 50, padding: "0 22px", borderRadius: 25, border: "none", background: GOLD_GRAD, color: "#fff", fontSize: 15.5, fontWeight: 700, fontFamily: "inherit",
          display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", opacity: !client || !picked || busy ? 0.55 : 1, boxShadow: "0 12px 26px rgba(169,129,48,0.30)",
        }}>
          <svg width={17} height={17} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} fill="#FFFFFF" /></svg>
          {busy ? "جارٍ الحجز…" : picked ? <>تأكيد حجز VIP · <span className="latin">{clock(picked.starts_at)}</span></> : "تأكيد حجز VIP"}
        </button>
        {walkInOpen && picked && <GhostButton onClick={() => !busy && book(false)}>حجز عادي من الاحتياطي</GhostButton>}
        {canOverride && svc && <GhostButton color="#A63F6E" onClick={() => { setMode("override"); setErr(null); }}>إدخال فوق موعد قائم</GhostButton>}
      </div>
    </Modal>
  );
}


/** Admin/owner: who may flag a client as VIP. */
export const useCanSetVip = () => { const { staff } = useSession(); return staff?.role === "owner" || staff?.role === "admin"; };

async function flipVip(p: { id: string; name: string | null; vip?: boolean | null }) {
  const on = !p.vip;
  if (!on && !window.confirm(`إزالة تمييز VIP عن ${p.name || "هذه العميلة"}؟`)) return false;
  await setPatientVip(p.id, on);
  return true;
}

/** Record header row: «عميلة VIP» switch (admin/owner) or a read-only badge for others. */
export function VipToggleRow({ patient, onChanged }: { patient: { id: string; name: string | null; vip?: boolean | null }; onChanged?: () => void }) {
  const can = useCanSetVip();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!can && !patient.vip) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderRadius: 18, padding: "8px 14px", background: patient.vip ? GOLD_SOFT : "#F8F2FA", border: `1px solid ${patient.vip ? GOLD_LINE : "#EDE2F1"}`, maxWidth: 520 }}>
      <VipStar size={18} title="VIP" style={{ opacity: patient.vip ? 1 : 0.45 }} />
      <span style={{ flex: "1 1 180px", fontSize: 13.5, lineHeight: 1.5 }}>
        <b style={{ color: patient.vip ? GOLD_DEEP : C.ink }}>{patient.vip ? "عميلة VIP" : "ليست عميلة VIP"}</b>
        <span style={{ display: "block", fontSize: 12.5, color: C.sub2 }}>تظهر بنجمة ذهبية في التقويم والأدوار والاستقبال والكاشير.</span>
      </span>
      {can && <Toggle on={!!patient.vip} label="عميلة VIP" onChange={async () => {
        if (busy) return; setBusy(true); setErr(null);
        try { if (await flipVip(patient)) onChanged?.(); } catch (e) { setErr(vipError(e)); }
        setBusy(false);
      }} />}
      {err && <span role="alert" style={{ flexBasis: "100%", fontSize: 12.5, color: C.danger }}>{err}</span>}
    </div>
  );
}

/** Patients list: round star button (admin/owner) — gold when VIP. */
export function VipStarButton({ patient, size = 34, className }: { patient: { id: string; name: string | null; vip?: boolean | null }; size?: number; className?: string }) {
  const can = useCanSetVip();
  const [busy, setBusy] = useState(false);
  if (!can) return null;
  const on = !!patient.vip;
  return (
    <button type="button" className={className} aria-pressed={on} aria-label={on ? "إزالة تمييز VIP" : "تمييز كعميلة VIP"} title={on ? "عميلة VIP — اضغطي للإزالة" : "تمييز كعميلة VIP"} disabled={busy}
      onClick={async () => { setBusy(true); try { await flipVip(patient); } catch (e) { window.alert(vipError(e)); } setBusy(false); }}
      style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
        border: `1px solid ${on ? GOLD_LINE : "#ECE4EE"}`, background: on ? GOLD_SOFT : C.white, opacity: busy ? 0.5 : 1 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" aria-hidden="true">
        <path d={STAR} fill={on ? GOLD : "none"} stroke={on ? GOLD_DEEP : "#B9A6BF"} strokeWidth={1.7} strokeLinejoin="round" />
      </svg>
    </button>
  );
}
