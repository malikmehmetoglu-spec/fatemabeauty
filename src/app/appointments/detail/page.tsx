"use client";

/** P_AppointmentDetail.dc.html — details of one of the patient's appointments (?id=, live). */
import Link from "next/link";
import type { CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, EmptyState, ErrorNote, Icon, IconButton, Loading, PrimaryButton, SecondaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { freeChangeHours, getAppointment, STATUS_KIND, STATUS_LABEL, timeOf, useSearch } from "@/lib/db/appointments";
import { GuestCard } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { AR_DAYS, AR_MONTHS } from "@/lib/data";
import { dayKey, money } from "@/lib/format";
import { C, CARD, DARK, SH_SOFT, SHB } from "@/lib/tokens";
import { downloadIcs, SpecialistAvatar } from "../../booking/SpecialistAvatar";

const GLASS_PILL: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600 };
const ROW: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "11px 0" };

export default function AppointmentDetailPage() {
  const s = useRequirePatient();
  const q = useSearch();
  const id = q?.get("id") ?? "";
  const { data: a, loading } = useQuery(["appointments", "one", id], () => getAppointment(id), { enabled: !!id && !!s.patient });
  const policy = useQuery(["appointments", "policy"], freeChangeHours);

  if (s.guest) return <PhoneScreen><TopBar title="تفاصيل الموعد" back={R.P_Appointments} /><GuestCard icon="cal" what="مواعيدكِ" /></PhoneScreen>;
  if (s.loading || !s.patient || !q || (id && loading)) return <PhoneScreen><Loading /></PhoneScreen>;
  if (!a) return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الموعد" back={R.P_Appointments} />
      <EmptyState icon="cal" title="لم نجد هذا الموعد" text="تجدين كل مواعيدكِ في «مواعيدي»." action={<PrimaryButton href={R.P_Appointments} height={50}>مواعيدي</PrimaryButton>} />
    </PhoneScreen>
  );

  const d = new Date(a.starts_at);
  const today = dayKey(d) === dayKey();
  const canCancel = (a.status === "pending" || a.status === "confirmed") && d.getTime() > Date.now();
  const days = Math.round((new Date(`${dayKey(d)}T00:00:00+03:00`).getTime() - new Date(`${dayKey()}T00:00:00+03:00`).getTime()) / 864e5);

  return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الموعد" back={R.P_Appointments} />
      {q.get("moved") && canCancel && (
        <ErrorNote>حُجز موعدكِ الجديد، لكن تعذّر إلغاء هذا الموعد تلقائياً. ألغيه من الأسفل أو تواصلي مع المركز.</ErrorNote>
      )}

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 600 }}>
                <Icon name={a.status === "pending" ? "clock" : a.status === "cancelled" || a.status === "no_show" ? "x" : "check"} color="#FFFFFF" size={13} stroke={2.4} />{STATUS_LABEL[a.status]}
              </div>
              <div style={{ fontSize: 25, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" }}>{d.getDate()} {AR_MONTHS[d.getMonth()]}</div>
              <div style={{ fontSize: 13.5, color: C.onDark }}>{AR_DAYS[d.getDay()]} {d.getFullYear()}{days === 1 ? " · غداً" : days === 2 ? " · بعد يومين" : days > 2 ? ` · بعد ${days} ${days <= 10 ? "أيام" : "يوماً"}` : today ? " · اليوم" : ""}</div>
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.1 }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>الساعة</div>
              <div dir="ltr" className="latin" style={{ fontSize: 38, fontWeight: 700 }}>{timeOf(a)}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {a.room && <span style={GLASS_PILL}><Icon name="door" color="#FFFFFF" size={15} />{a.room.name}</span>}
            <span style={GLASS_PILL}><Icon name="clock" color="#FFFFFF" size={15} />{a.minutes} دقيقة</span>
          </div>
        </div>
      </div>

      {canCancel || a.status === "checked_in" || a.status === "in_session" ? (
        <Link href={today && (a.status === "checked_in" || a.status === "in_session") ? R.Queue : `${R.P_CheckinQR}?id=${a.id}`} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px", background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: SH_SOFT }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="qr" color={C.accent} size={26} stroke={1.6} />
          </span>
          <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{a.status === "checked_in" || a.status === "in_session" ? "رقم دوركِ اليوم" : "تسجيل الوصول السريع"}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{a.status === "checked_in" || a.status === "in_session" ? "تابعي دوركِ مباشرة" : "اعرضي الرمز عند الاستقبال يوم الجلسة"}</div>
          </div>
          <Icon name="chev" size={18} stroke={2} />
        </Link>
      ) : null}

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "2px 16px" }}>
        <div style={ROW}>
          <Circ icon="sparkle" size={42} iconSize={19} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الجلسة</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{a.service?.name}</div>
          </div>
        </div>
        <div style={{ ...ROW, borderTop: `1px solid ${C.line}` }}>
          <SpecialistAvatar sp={a.specialist} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الأخصائية</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{a.specialist?.name ?? "تُحدَّد في المركز"}</div>
          </div>
        </div>
        <div style={{ ...ROW, borderTop: `1px solid ${C.line}` }}>
          <Circ icon="wallet" size={42} iconSize={19} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>القيمة</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{a.patient_package_id ? "من باقتكِ" : money(a.price)}</div>
          </div>
          <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 10 }}>
        <SecondaryButton icon="calcheck" height={48} style={{ flex: 1, fontSize: 14, padding: "0 12px" }}
          onClick={() => downloadIcs({ id: a.id, starts_at: a.starts_at, minutes: a.minutes, title: a.service?.name ?? "جلسة", location: a.room?.name })}>إضافة إلى التقويم</SecondaryButton>
        <IconButton icon="msg" label="مراسلة المركز" size={48} href={R.P_Chat} />
      </div>

      {canCancel && (
        <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Link href={`${R.Booking}?service=${a.service_key}&replace=${a.id}`} style={{ height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, color: C.accent, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 20px", alignSelf: "stretch", border: `1.5px solid ${C.accent}`, fontSize: 16 }}>
            <Icon name="edit" color={C.accent} size={18} stroke={1.9} />تغيير الموعد
          </Link>
          <Link href={`${R.P_CancelConfirm}?id=${a.id}`} style={{ height: 40, display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: C.danger }}>
            <Icon name="calx" color={C.danger} size={17} />إلغاء الموعد
          </Link>
          <div style={{ fontSize: 12, color: C.sub2, textAlign: "center", lineHeight: 1.6 }}>
            عند الإلغاء يعود الموعد متاحاً لمراجعة أخرى
            {policy.data != null && <><br />التعديل والإلغاء مجانيان حتى {policy.data} {policy.data >= 3 && policy.data <= 10 ? "ساعات" : "ساعة"} قبل الموعد</>}
          </div>
        </div>
      )}
    </PhoneScreen>
  );
}
