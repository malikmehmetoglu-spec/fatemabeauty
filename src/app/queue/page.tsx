"use client";

/** Queue.dc.html — «موعدي اليوم»: the patient's live queue number via rpc my_queue (her number only — no position or ahead count). */
import Link from "next/link";
import { useEffect } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { invalidate, useQuery } from "@/lib/db/query";
import { getAppointment, myQueue, timeOf } from "@/lib/db/appointments";
import { supabase } from "@/lib/supabase/client";
import { GuestCard } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, DARK, SH } from "@/lib/tokens";
import { SpecialistAvatar } from "../booking/SpecialistAvatar";

export default function QueuePage() {
  const s = useRequirePatient();
  const q = useQuery(["appointments", "myqueue", s.patient?.id], myQueue, { enabled: !!s.patient });
  const id = q.data?.appointment_id ?? "";
  const a = useQuery(["appointments", "one", id], () => getAppointment(id), { enabled: !!id });

  // live: refresh on any appointment change (RLS limits the events to her rows) + every 30 s
  useEffect(() => {
    if (!s.patient) return;
    const ch = supabase.channel("my-queue").on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => invalidate("appointments")).subscribe();
    const t = setInterval(() => invalidate("appointments"), 30000);
    return () => { clearInterval(t); supabase.removeChannel(ch); };
  }, [s.patient]);

  if (s.guest) return <PhoneScreen><TopBar title="موعدي اليوم" back={R.Main} /><GuestCard icon="clock" what="دوركِ في المركز" /></PhoneScreen>;
  if (s.loading || !s.patient || q.loading) return <PhoneScreen><Loading /></PhoneScreen>;
  const me = q.data;
  if (!me) return (
    <PhoneScreen>
      <TopBar title="موعدي اليوم" back={R.P_Appointments} />
      <EmptyState icon="users" title="لم يُسجَّل وصولكِ اليوم بعد" text="عند وصولكِ إلى المركز امسحي رمز تسجيل الوصول على تابلت الاستقبال، وسيظهر رقم دوركِ هنا مباشرة."
        action={<PrimaryButton href={R.P_CheckinQR} icon="qr" height={50}>رمز تسجيل الوصول</PrimaryButton>} />
    </PhoneScreen>
  );

  const called = me.status === "in_session" || !!me.called_at;
  const appt = a.data;
  const rows = [
    { icon: "sparkle", label: "الجلسة", value: appt?.service?.name ?? "" },
    { sp: true, label: "الأخصائية", value: appt?.specialist?.name ?? "تُحدَّد في المركز" },
    { icon: "clock", label: "الموعد", value: `اليوم · ${timeOf({ starts_at: me.starts_at })}` },
  ];
  return (
    <PhoneScreen>
      <TopBar title="موعدي اليوم" back={`${R.P_CheckinQR}?id=${me.appointment_id}`} />

      <div style={{ ...DARK, borderRadius: 34, padding: "22px 22px 20px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
        <svg aria-hidden width={160} height={160} viewBox="0 0 160 160" style={{ position: "absolute", top: -40, left: -40 }}>
          <circle cx={80} cy={80} r={78} fill="none" stroke="#7C5485" strokeWidth={1} />
          <circle cx={80} cy={80} r={56} fill="none" stroke="#7C5485" strokeWidth={1} />
        </svg>
        <div style={{ position: "relative", fontSize: 14, color: C.onDark }}>رقم دوركِ</div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div className="latin" style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{me.queue_no}</div>
          {me.room && <div style={{ background: "linear-gradient(145deg, #FFFFFF, #E8D0ED)", boxShadow: "0 6px 16px rgba(0,0,0,0.18)", color: C.accent, borderRadius: 18, padding: "6px 14px", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{me.room}</div>}
        </div>
        <div style={{ position: "relative", height: 1, background: "#7C5485", margin: "12px 0 14px" }} />
        {called ? (
          <div style={{ position: "relative", fontSize: 17, fontWeight: 700 }}>{me.status === "in_session" ? "جلستكِ جارية الآن" : `حان دوركِ — تفضّلي إلى ${me.room ?? "الغرفة"}`}</div>
        ) : (
          <div style={{ position: "relative", fontSize: 17, fontWeight: 700 }}>سننادي رقمكِ قريباً</div>
        )}
      </div>

      <div style={{ background: C.white, borderRadius: 28, padding: "6px 18px", position: "relative", border: "1px solid #FFFFFF", boxShadow: SH }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : undefined }}>
            {r.sp ? <SpecialistAvatar sp={appt?.specialist} /> : <Circ icon={r.icon!} size={42} iconSize={19} />}
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: 12, color: C.sub2 }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.75), rgba(243,234,246,0.75))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", borderRadius: 22, padding: "12px 16px", position: "relative", display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="bell" size={22} />
        <div style={{ fontSize: 13, color: C.accent, lineHeight: 1.5 }}>خذي راحتكِ، تتحدّث هذه الصفحة تلقائياً ويظهر رقمكِ على شاشة الانتظار عند دوركِ.</div>
      </div>

      <Link href={`${R.P_AppointmentDetail}?id=${me.appointment_id}`} style={{ marginTop: "auto", height: 56, borderRadius: 28, border: `1.5px solid ${C.accent}`, background: C.white, boxShadow: "0 8px 20px rgba(123,70,135,0.10)", color: C.accent, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>تفاصيل الموعد</Link>
    </PhoneScreen>
  );
}
