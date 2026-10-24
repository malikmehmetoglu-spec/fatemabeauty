"use client";

/** «جهّزي استشارتكِ» — card on the booking done page and the appointment detail page (consultations only). */
import Link from "next/link";
import { Icon } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { getConsultAppt, getIntake, intakeOpen } from "@/lib/db/intake";
import { C, SH_SOFT } from "@/lib/tokens";

export const INTAKE_PATH = "/appointments/intake/";

export function IntakeCard({ appointmentId }: { appointmentId: string }) {
  const a = useQuery(["intake", "appt", appointmentId], () => getConsultAppt(appointmentId), { enabled: !!appointmentId });
  const consult = !!a.data?.services?.is_consultation;
  const i = useQuery(["intake", "one", appointmentId], () => getIntake(appointmentId), { enabled: consult });
  if (!a.data || !consult || i.loading) return null;
  const open = intakeOpen(a.data);
  const done = !!i.data;
  if (!open && !done) return null;
  return (
    <Link href={`${INTAKE_PATH}?id=${appointmentId}`} style={{
      position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "14px 14px",
      background: done ? "linear-gradient(135deg,#FFFFFF,#EEF7F1)" : "linear-gradient(135deg,#7B4687,#A06AAE)",
      border: done ? "1px solid #CFE6D7" : "1px solid rgba(255,255,255,0.4)", boxShadow: SH_SOFT, color: done ? C.ink : "#FFFFFF",
    }}>
      <span style={{ width: 46, height: 46, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: done ? "#FFFFFF" : "rgba(255,255,255,0.18)", border: done ? "1px solid #CFE6D7" : "1px solid rgba(255,255,255,0.3)" }}>
        <Icon name={done ? "check" : "file"} color={done ? C.okDeep : "#FFFFFF"} size={22} stroke={done ? 2.4 : 1.7} />
      </span>
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.45 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{done ? "استشارتكِ جاهزة" : "جهّزي استشارتكِ"}</div>
        <div style={{ fontSize: 12.5, color: done ? C.sub2 : "rgba(255,255,255,0.86)" }}>
          {done ? (open ? "وصلت إجاباتكِ — يمكنكِ تعديلها حتى موعدكِ" : "وصلت إجاباتكِ إلى المستشارة")
            : "دقائق قليلة تساعد المستشارة على التحضير لكِ قبل الموعد"}
        </div>
      </div>
      <Icon name="chev" size={18} stroke={2} color={done ? C.ink : "#FFFFFF"} />
    </Link>
  );
}
