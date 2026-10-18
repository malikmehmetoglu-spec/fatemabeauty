"use client";

/** P_CancelConfirm.dc.html — cancel-appointment bottom sheet (?id=) → rpc cancel_my_appointment. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, EmptyState, ErrorNote, Icon, Loading, PrimaryButton, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { bookingError, cancelMine, getAppointment, timeOf, useSearch } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD, DARK, SH_SOFT, SHEEN } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { SpecialistAvatar } from "../../booking/SpecialistAvatar";

const REASONS = ["تغيّر جدولي", "ظرف صحي", "سفر", "سأحجز وقتاً آخر", "سبب آخر"];
const TILE: CSSProperties = { borderRadius: 18, padding: "10px 12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" };

function chip(on: boolean): CSSProperties {
  return {
    height: 38, padding: "0 14px", borderRadius: 19, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
    color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 3px 10px rgba(123,70,135,0.05)",
  };
}

function InfoRow({ icon, title, sub, first, size = 40 }: { icon: string; title: string; sub: string; first?: boolean; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: size === 40 ? "12px 0" : "11px 0", borderTop: first ? undefined : `1px solid ${C.line}` }}>
      <Circ icon={icon} size={size} iconSize={size === 40 ? 18 : 16} />
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function CancelConfirmPage() {
  const s = useRequirePatient();
  const router = useRouter();
  const q = useSearch();
  const id = q?.get("id") ?? "";
  const { data: a, loading } = useQuery(["appointments", "one", id], () => getAppointment(id), { enabled: !!id && !!s.patient });
  const [reason, setReason] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (s.loading || !s.patient || !q || (id && loading)) return <PhoneScreen><Loading /></PhoneScreen>;
  const can = a && (a.status === "pending" || a.status === "confirmed") && new Date(a.starts_at).getTime() > Date.now();
  if (!a || !can) return (
    <PhoneScreen>
      <TopBar title="إلغاء الموعد" back={R.P_Appointments} />
      <EmptyState icon="calx" title={a ? "لا يمكن إلغاء هذا الموعد" : "لم نجد هذا الموعد"} text="يمكن إلغاء المواعيد القادمة فقط. للمساعدة تواصلي مع المركز."
        action={<PrimaryButton href={R.P_Appointments} height={50}>مواعيدي</PrimaryButton>} />
    </PhoneScreen>
  );

  const back = `${R.P_AppointmentDetail}?id=${a.id}`;
  async function cancel() {
    setBusy(true); setError("");
    try { await cancelMine(a!.id, reason >= 0 ? REASONS[reason] : ""); router.replace(R.P_Appointments); }
    catch (e) { setError(bookingError(e)); setBusy(false); }
  }

  const sheet = (
    <>
      <Link href={back} aria-label="تراجع" style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(53,33,61,0.35)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-modal="true" aria-labelledby="cx-title" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 11, borderRadius: "38px 38px 0 0", background: "linear-gradient(180deg, #FFFFFF 0%, #FBF6FC 100%)",
        boxShadow: "0 -18px 40px rgba(53,33,61,0.22)", padding: "12px 20px calc(env(safe-area-inset-bottom, 0px) + 26px)", display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: "#E3D3E7", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: 27, flexShrink: 0, background: "linear-gradient(145deg,#F7ECF9,#EAD0F0)", boxShadow: "0 8px 18px rgba(145,77,160,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="calx" color={C.danger} size={25} />
          </span>
          <div style={{ lineHeight: 1.35 }}>
            <div id="cx-title" style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>إلغاء الموعد؟</div>
            <div style={{ fontSize: 13, color: C.sub }}>{arDate(new Date(a.starts_at), { year: true })} · {timeOf(a)}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.sub2, marginBottom: -4 }}>ما سبب الإلغاء؟ (اختياري)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REASONS.map((r, i) => (
            <button key={r} type="button" aria-pressed={reason === i} onClick={() => setReason(reason === i ? -1 : i)} style={chip(reason === i)}>{r}</button>
          ))}
        </div>
        <div style={{ borderRadius: 22, padding: "4px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
          <InfoRow first size={36} icon="refresh" title="يعود الوقت متاحاً" sub="يُعرض موعدكِ فوراً على مراجعات أخريات في قائمة الانتظار" />
        </div>
        {error && <ErrorNote>{error}</ErrorNote>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
          <button type="button" onClick={cancel} disabled={busy} style={{
            height: 56, borderRadius: 28, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.white, fontSize: 16, fontWeight: 600,
            backgroundColor: C.danger, backgroundImage: SHEEN, boxShadow: "0 14px 28px rgba(145,77,160,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", opacity: busy ? 0.6 : 1,
          }}>
            <Icon name="calx" color="#FFFFFF" size={19} />{busy ? "جارٍ الإلغاء…" : "نعم، ألغي الموعد"}
          </button>
          <SecondaryButton href={back} height={52}>تراجعت</SecondaryButton>
        </div>
      </div>
    </>
  );

  return (
    <PhoneScreen overlay={sheet}>
      <TopBar title="تفاصيل الموعد" back={R.P_Appointments} />
      <div style={{ ...DARK, borderRadius: 32, padding: 22, position: "relative", overflow: "hidden" }}>
        <DarkGlow />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <SpecialistAvatar sp={a.specialist} size={52} />
          <div style={{ lineHeight: 1.35 }}>
            {a.specialist && <div style={{ fontSize: 13, color: C.onDark }}>مع {a.specialist.name}</div>}
            <div style={{ fontSize: 21, fontWeight: 700 }}>{a.service?.name}</div>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 18 }}>
          <div style={{ ...TILE, flex: 1 }}>
            <div style={{ fontSize: 11, color: C.onDark }}>اليوم</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{arDate(new Date(a.starts_at))}</div>
          </div>
          <div style={{ ...TILE, width: 92 }}>
            <div style={{ fontSize: 11, color: C.onDark }}>الساعة</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{timeOf(a)}</div>
          </div>
        </div>
      </div>
      <div style={{ ...CARD, borderRadius: 26, padding: "4px 18px" }}>
        <InfoRow first icon="door" title={a.room?.name ?? "الغرفة تُحدَّد في المركز"} sub="يصلكِ رقم دوركِ عند تسجيل الوصول" />
      </div>
    </PhoneScreen>
  );
}
