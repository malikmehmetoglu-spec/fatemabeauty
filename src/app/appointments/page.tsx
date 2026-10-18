"use client";

/** P_Appointments.dc.html — «مواعيدي» root tab: the signed-in patient's upcoming / past appointments (live, Supabase). */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Circ, DarkGlow, EmptyState, ErrorNote, Icon, IconButton, Loading, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { ACTIVE, listMine, STATUS_KIND, STATUS_LABEL, timeOf, type Appointment } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { AR_DAYS, AR_MONTHS } from "@/lib/data";
import { arDate, dayKey } from "@/lib/format";
import { C, CARD, DARK, SELECTED, SH_SOFT, SHB } from "@/lib/tokens";
import { SpecialistAvatar } from "../booking/SpecialistAvatar";

const TAB_ON: CSSProperties = { flex: 1, height: 40, borderRadius: 20, border: "none", fontSize: 14, fontWeight: 700, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: C.accent, boxShadow: "0 8px 18px rgba(150,100,170,0.25)" };
const TAB_OFF: CSSProperties = { flex: 1, height: 40, borderRadius: 20, border: "none", fontSize: 14, fontWeight: 600, background: "transparent", color: C.sub2 };
const ROW: CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" };
const PILL: CSSProperties = { height: 34, padding: "0 14px", borderRadius: 17, fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 5 };
const PILL_OFF: CSSProperties = { ...PILL, background: C.white, border: "1px solid #EADCF0", color: C.sub2, fontWeight: 600 };

const daysUntil = (iso: string) => {
  const a = new Date(`${dayKey()}T00:00:00+03:00`).getTime(), b = new Date(`${dayKey(new Date(iso))}T00:00:00+03:00`).getTime();
  return Math.round((b - a) / 864e5);
};
const whenLabel = (iso: string) => { const n = daysUntil(iso); return n <= 0 ? "اليوم" : n === 1 ? "غداً" : n === 2 ? "بعد يومين" : n <= 10 ? `بعد ${n} أيام` : `بعد ${n} يوماً`; };
const detail = (a: Appointment) => `${R.P_AppointmentDetail}?id=${a.id}`;

export default function AppointmentsPage() {
  const s = useRequirePatient();
  const [tab, setTab] = useState<"up" | "past">("up");
  const { data, loading, error } = useQuery(["appointments", "mine", s.patient?.id], () => listMine(s.patient!.id), { enabled: !!s.patient });

  const now = Date.now();
  const all = data ?? [];
  const upcoming = all.filter((a) => ACTIVE.includes(a.status) && (new Date(a.starts_at).getTime() + a.minutes * 60000 > now || a.status === "checked_in" || a.status === "in_session"))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = all.filter((a) => !upcoming.includes(a));
  const next = upcoming[0];

  return (
    <PhoneScreen tab="مواعيدي">
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ lineHeight: 1.3 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink }}>مواعيدي</h1>
          <div style={{ fontSize: 13, color: C.sub2 }}>{arDate(new Date())}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconButton icon="bell" label="الإشعارات" href={R.Notifications} />
          <IconButton icon="plus" label="حجز موعد جديد" href={R.Booking} />
        </div>
      </div>

      <div role="tablist" aria-label="المواعيد" style={{ position: "relative", display: "flex", gap: 4, padding: 4, borderRadius: 24, background: "rgba(255,255,255,0.7)", border: "1px solid #FFFFFF", boxShadow: SHB }}>
        {([["up", `القادمة · ${upcoming.length}`], ["past", `السابقة · ${past.length}`]] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={tab === k ? TAB_ON : TAB_OFF}>{t}</button>
        ))}
      </div>

      {s.loading || loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل مواعيدكِ: {error}</ErrorNote> : tab === "up" ? (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
          {!next ? (
            <EmptyState icon="cal" title="لا مواعيد قادمة" text="احجزي جلستكِ القادمة وستظهر هنا مع تفاصيلها ورمز تسجيل الوصول."
              action={<PrimaryButton href={R.Booking} height={50}>حجز موعد</PrimaryButton>} />
          ) : (
            <>
              <Link href={detail(next)} style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px", display: "block" }}>
                <DarkGlow />
                <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: C.onDark }}>موعدكِ القادم</div>
                      <div style={{ fontSize: 21, fontWeight: 700, marginTop: 2 }}>{arDate(new Date(next.starts_at))}</div>
                      <div style={{ fontSize: 14, color: "#F2E6F4" }}>الساعة {timeOf(next)}{next.room ? ` · ${next.room.name}` : ""}</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{whenLabel(next.starts_at)}</span>
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "14px 0 12px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <SpecialistAvatar sp={next.specialist} size={40} />
                    <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{next.service?.name}</div>
                      <div style={{ fontSize: 12.5, color: C.onDark }}>{next.specialist ? `مع ${next.specialist.name} · ` : ""}{next.minutes} دقيقة</div>
                    </div>
                    <span style={{ width: 40, height: 40, borderRadius: 20, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="arrow" color={C.accent} size={16} stroke={2} />
                    </span>
                  </div>
                </div>
              </Link>
              {next.status === "pending" && (
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "0 6px", fontSize: 12.5, color: C.sub }}>
                  <Icon name="clock" size={17} />سيؤكّد المركز موعدكِ قريباً
                </div>
              )}
              {upcoming.slice(1).map((a) => (
                <Link key={a.id} href={detail(a)} style={{ ...CARD, ...ROW }}>
                  <DateTile iso={a.starts_at} />
                  <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{a.service?.name}</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>{AR_DAYS[new Date(a.starts_at).getDay()]} · {timeOf(a)}{a.specialist ? ` · ${a.specialist.name}` : ""}</div>
                  </div>
                  <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
                </Link>
              ))}
            </>
          )}
          <Link href={R.Booking} style={{ ...ROW, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
            <Circ icon="plus" size={40} iconSize={18} />
            <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>احجزي جلسة أخرى</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>اختاري الخدمة واليوم والوقت المتاح</div>
            </div>
            <Icon name="chev" size={18} stroke={2} />
          </Link>
        </div>
      ) : past.length === 0 ? (
        <EmptyState compact icon="cal" title="لا مواعيد سابقة بعد" text="بعد كل جلسة يظهر هنا سجلّها وتستطيعين تقييمها." />
      ) : (
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
          {past.map((a, i) => (
            <div key={a.id} style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <DateTile iso={a.starts_at} />
                <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{a.service?.name}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{AR_DAYS[new Date(a.starts_at).getDay()]} · {timeOf(a)}{a.specialist ? ` · ${a.specialist.name}` : ""}</div>
                </div>
                <Tag kind={STATUS_KIND[a.status]}>{a.status === "confirmed" || a.status === "pending" ? "فات" : STATUS_LABEL[a.status]}</Tag>
              </div>
              {a.status === "done" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                  <Link href={`${R.Review}?appointment=${a.id}`} style={i === 0 ? { ...PILL, ...SELECTED, fontWeight: 700 } : PILL_OFF}><Icon name="star" color={i === 0 ? C.accent : undefined} size={15} />قيّمي الجلسة</Link>
                  <Link href={R.Routine} style={PILL_OFF}><Icon name="clip" size={15} />الروتين</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PhoneScreen>
  );
}

function DateTile({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div style={{ width: 64, height: 56, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.15 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{d.getDate()}</span>
      <span style={{ fontSize: 10.5, color: C.accentMid, whiteSpace: "nowrap" }}>{AR_MONTHS[d.getMonth()]}</span>
    </div>
  );
}
