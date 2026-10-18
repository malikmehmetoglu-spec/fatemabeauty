"use client";

/** P_CheckinQR.dc.html — check-in QR code shown at the reception tablet. The QR encodes the real appointment id. */
import { useMemo, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, IconButton, Loading, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { getAppointment, myToday, timeOf, useSearch } from "@/lib/db/appointments";
import { useRequirePatient } from "@/lib/supabase/session";
import { arDate, dayKey } from "@/lib/format";
import { C, CARD, GLASS, SH_SOFT } from "@/lib/tokens";
import { SpecialistAvatar } from "../booking/SpecialistAvatar";
import { qrMatrix } from "./qr";

const corner = (pos: CSSProperties): CSSProperties => ({ position: "absolute", width: 22, height: 22, ...pos });
const B = "3px solid #A877B6";

function Qr({ text }: { text: string }) {
  const m = useMemo(() => qrMatrix(text), [text]);
  const n = m.length, q = 2, size = n + q * 2;
  return (
    <svg width={234} height={234} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="رمز تسجيل الوصول" shapeRendering="crispEdges" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
      <rect width={size} height={size} fill="#FFFFFF" />
      <path fill={C.accent} d={m.flatMap((row, y) => row.map((v, x) => (v ? `M${x + q} ${y + q}h1v1h-1z` : ""))).join("")} />
    </svg>
  );
}

export default function CheckinPage() {
  const s = useRequirePatient();
  const q = useSearch();
  const id = q?.get("id") ?? "";
  const byId = useQuery(["appointments", "one", id], () => getAppointment(id), { enabled: !!id && !!s.patient });
  const today = useQuery(["appointments", "today", s.patient?.id], () => myToday(s.patient!.id), { enabled: !id && !!q && !!s.patient });
  const a = id ? byId.data : today.data;

  if (s.loading || !s.patient || !q || (id ? byId.loading : today.loading)) return <PhoneScreen><Loading /></PhoneScreen>;
  const back = a ? `${R.P_AppointmentDetail}?id=${a.id}` : R.P_Appointments;
  if (!a || a.status === "cancelled" || a.status === "done" || a.status === "no_show") return (
    <PhoneScreen>
      <TopBar title="تسجيل الوصول" back={back} />
      <EmptyState icon="qr" title="لا موعد لتسجيل الوصول" text="يظهر هنا رمز تسجيل الوصول لموعدكِ القادم. احجزي موعداً أو افتحي الموعد من «مواعيدي»."
        action={<PrimaryButton href={R.P_Appointments} height={50}>مواعيدي</PrimaryButton>} />
    </PhoneScreen>
  );
  const isToday = dayKey(new Date(a.starts_at)) === dayKey();

  return (
    <PhoneScreen>
      <TopBar title="تسجيل الوصول" back={back} />

      <div style={{ ...GLASS, borderRadius: 34, padding: "22px 22px 20px", boxShadow: "0 18px 40px rgba(123,70,135,0.14), inset 0 1px 0 #FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -70, left: -60, width: 220, height: 220, borderRadius: 110, background: "radial-gradient(circle, rgba(190,150,215,0.45) 0%, rgba(190,150,215,0) 70%)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Tag kind="pink">{isToday ? "صالح اليوم" : "صالح يوم موعدكِ فقط"}</Tag>
          <Tag kind="gray">ملف رقم {s.patient.file_no}</Tag>
        </div>
        <div style={{ position: "relative", padding: 18, borderRadius: 30, background: C.white, boxShadow: "0 14px 30px rgba(123,70,135,0.14), inset 0 0 0 1px #F0E6F3" }}>
          <Qr text={a.id} />
          <span style={{ ...corner({ top: 8, left: 8 }), borderTop: B, borderLeft: B, borderTopLeftRadius: 10 }} />
          <span style={{ ...corner({ top: 8, right: 8 }), borderTop: B, borderRight: B, borderTopRightRadius: 10 }} />
          <span style={{ ...corner({ bottom: 8, left: 8 }), borderBottom: B, borderLeft: B, borderBottomLeftRadius: 10 }} />
          <span style={{ ...corner({ bottom: 8, right: 8 }), borderBottom: B, borderRight: B, borderBottomRightRadius: 10 }} />
        </div>
        <div style={{ position: "relative", textAlign: "center", lineHeight: 1.4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{a.status === "checked_in" || a.status === "in_session" ? "تم تسجيل وصولكِ" : "امسحيه على تابلت الاستقبال عند وصولكِ"}</div>
          <div style={{ fontSize: 13, color: C.sub }}>يُسجَّل وصولكِ ويظهر رقم دوركِ فوراً في التطبيق</div>
        </div>
      </div>

      <div style={{ ...CARD, borderRadius: 26, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <SpecialistAvatar sp={a.specialist} size={50} />
        <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{a.service?.name}</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>{isToday ? "اليوم" : arDate(new Date(a.starts_at))} · {timeOf(a)}{a.room ? ` · ${a.room.name}` : ""}</div>
        </div>
        {isToday && <IconButton icon="back" label="موعدي اليوم" size={40} href={R.Queue} />}
      </div>

      <div style={{ borderRadius: 22, padding: "12px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 12 }}>
        <Circ icon="sun" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>ارفعي سطوع الشاشة</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يُقرأ الرمز أسرع عندما تكون الشاشة مضيئة</div>
        </div>
      </div>

      {isToday && <PrimaryButton href={R.Queue} icon="users" style={{ marginTop: "auto" }}>رقم دوري اليوم</PrimaryButton>}
    </PhoneScreen>
  );
}
