"use client";

/** Consult.dc.html — online consultation: her booked consultations (video calling is not connected yet). */
import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { getConsultService, myConsults } from "@/lib/db/consult";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, DARK, SH } from "@/lib/tokens";

const STATUS: Record<string, string> = { pending: "بانتظار التأكيد", confirmed: "مؤكدة", checked_in: "حاضرة", in_session: "جارية", done: "منتهية", no_show: "لم تحضر" };

export default function ConsultPage() {
  const { patient, guest, loading: sLoading } = useRequirePatient();
  const { data: svc, loading: l1, error: e1 } = useQuery(["consult", "service"], getConsultService);
  const { data: list, loading: l2, error: e2 } = useQuery(["consult", "mine", svc?.key, patient?.id], () => myConsults(svc!.key), { enabled: !!svc && !!patient });

  if (sLoading || (!patient && !guest) || l1 || (svc && l2)) return <PhoneScreen><TopBar title="استشارة أونلاين" /><Loading /></PhoneScreen>;
  const now = Date.now();
  const upcoming = (list ?? []).filter((a) => new Date(a.starts_at).getTime() + a.minutes * 6e4 > now && a.status !== "done").reverse();
  const past = (list ?? []).filter((a) => !upcoming.includes(a));
  const next = upcoming[0];

  return (
    <PhoneScreen>
      <TopBar title="استشارة أونلاين" />
      {(e1 || e2) && <ErrorNote>تعذّر التحميل: {e1 || e2}</ErrorNote>}

      {!svc ? (
        <EmptyState icon="cam" title="الاستشارة الأونلاين غير متاحة حالياً" text="لم يُضف المركز خدمة الاستشارة عن بُعد بعد. يمكنكِ حجز استشارة في المركز أو مراسلتنا."
          action={<PrimaryButton href={R.P_Chat}>مراسلة المركز</PrimaryButton>} />
      ) : next ? (
        <div style={{ ...DARK, borderRadius: 30, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10, boxShadow: SH }}>
          <div style={{ fontSize: 12.5, color: C.onDark }}>استشارتكِ القادمة</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{arDate(new Date(next.starts_at))} · <span className="latin">{clock(next.starts_at)}</span></div>
          <div style={{ fontSize: 13, color: "#E8D6F0" }}>{next.staff?.name ? `مع ${next.staff.name}` : "ستحدد الأخصائية لاحقاً"} · {STATUS[next.status] ?? next.status}</div>
          <Link href={R.P_InCall} style={{ marginTop: 6, height: 48, borderRadius: 24, background: C.white, color: C.accent, fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="cam" size={18} />غرفة الاستشارة
          </Link>
        </div>
      ) : (
        <EmptyState icon="cam" title="لا توجد استشارة محجوزة" text={`${svc.name} · نحو ${svc.minutes} دقيقة من بيتكِ.`}
          action={<PrimaryButton href={R.P_ConsultBook}>احجزي استشارة</PrimaryButton>} />
      )}

      {svc && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 6px" }}>
          <Icon name="info" size={18} />
          <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>الاتصال المرئي داخل التطبيق غير مفعّل بعد؛ سيتواصل معكِ المركز في موعد الاستشارة لترتيب المكالمة.</div>
        </div>
      )}

      <Link href={R.P_WrittenConsult} style={{ background: C.white, borderRadius: 26, padding: "14px 16px", boxShadow: SH, display: "flex", alignItems: "center", gap: 12, color: C.ink }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: "#F4EAF7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="msg" size={20} color={C.accent} /></span>
        <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.45 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>استشارة مكتوبة بلا موعد</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>اكتبي سؤالكِ وأرفقي صوراً، وتصلكِ الإجابة خلال 48 ساعة.</div>
        </div>
        <Icon name="back" size={16} color={C.accentMid} />
      </Link>

      {past.length > 0 && (
        <div style={{ background: C.white, borderRadius: 26, padding: "6px 16px", boxShadow: SH }}>
          <div style={{ fontSize: 13, color: C.sub2, paddingTop: 8 }}>استشارات سابقة</div>
          {past.map((a, i) => (
            <Link key={a.id} href={`${R.P_ConsultSummary}?appointment=${a.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : undefined, color: C.ink }}>
              <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{arDate(new Date(a.starts_at))}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{a.staff?.name ?? "—"}</div>
              </div>
              <Tag kind={a.status === "done" ? "green" : "gray"}>{STATUS[a.status] ?? a.status}</Tag>
            </Link>
          ))}
        </div>
      )}

      {svc && next && <PrimaryButton href={R.P_ConsultBook} style={{ marginTop: "auto" }}>حجز استشارة أخرى</PrimaryButton>}
    </PhoneScreen>
  );
}
