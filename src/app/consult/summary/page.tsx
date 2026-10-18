"use client";

/** P_ConsultSummary.dc.html — summary of a finished online consultation (her own data only). */
import { useEffect, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, EmptyState, Icon, IconButton, Loading, PrimaryButton, SectionTitle } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey, dayRange } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { getConsultService, myConsults, myPrescriptionsBetween } from "@/lib/db/consult";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD } from "@/lib/tokens";

type RxItem = { name?: string; product?: string; how?: string; usage?: string; note?: string };

export default function ConsultSummaryPage() {
  const { patient, loading: sLoading } = useRequirePatient();
  const [apptId, setApptId] = useState<string | null | undefined>(undefined);
  useEffect(() => { setApptId(new URLSearchParams(window.location.search).get("appointment")); }, []);
  const { data: svc, loading: l1 } = useQuery(["consult", "service"], getConsultService);
  const { data: list, loading: l2 } = useQuery(["consult", "mine", svc?.key, patient?.id], () => myConsults(svc!.key), { enabled: !!svc && !!patient });
  const appt = (list ?? []).find((a) => (apptId ? a.id === apptId : a.status === "done"));
  const range = appt ? dayRange(dayKey(new Date(appt.starts_at))) : null;
  const { data: rx } = useQuery(["consult", "rx", range?.from], () => myPrescriptionsBetween(range!.from, range!.to), { enabled: !!range });

  if (sLoading || !patient || l1 || (svc && (l2 || apptId === undefined))) return <PhoneScreen><TopBar title="ملخص الاستشارة" back={R.Consult} /><Loading /></PhoneScreen>;

  if (!appt) return (
    <PhoneScreen>
      <TopBar title="ملخص الاستشارة" back={R.Consult} />
      <EmptyState icon="clip" title="لا يوجد ملخص بعد" text="يظهر هنا ملخص استشارتكِ الأونلاين وما تنصحكِ به الأخصائية بعد انتهائها."
        action={<PrimaryButton href={R.Consult}>استشاراتي</PrimaryButton>} />
    </PhoneScreen>
  );

  const items = (rx ?? []).flatMap((r) => (Array.isArray(r.items) ? (r.items as RxItem[]) : []));
  return (
    <PhoneScreen>
      <TopBar title="ملخص الاستشارة" back={R.Consult} />
      <DarkCard padding="18px 20px">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>استشارة أونلاين{appt.staff?.name ? " مع" : ""}</div>
            {appt.staff?.name && <div style={{ fontSize: 19, fontWeight: 700 }}>{appt.staff.name}</div>}
            <div style={{ fontSize: 12.5, color: C.onDark }}>{arDate(new Date(appt.starts_at))} · <span className="latin">{clock(appt.starts_at)}</span></div>
          </div>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="clip" color="#E8D6F0" size={20} />
          </span>
        </div>
      </DarkCard>

      <SectionTitle>ما نصحتكِ به الأخصائية</SectionTitle>
      {items.length === 0 ? (
        <EmptyState compact icon="clip" title="لم تُضف توصيات مكتوبة لهذه الاستشارة" text="إن أرسلت الأخصائية روتيناً أو منتجات ستظهر هنا، ويمكنكِ سؤالها عبر المحادثة." />
      ) : (
        <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
              <Circ icon="drop" size={36} iconSize={16} />
              <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{it.name ?? it.product ?? "—"}</div>
                {(it.how ?? it.usage ?? it.note) && <div style={{ fontSize: 12, color: C.sub2 }}>{it.how ?? it.usage ?? it.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
        <IconButton icon="msg" label="مراسلة المركز" size={58} href={R.P_Chat} />
        <PrimaryButton icon="calendar" href={R.Booking} style={{ flexGrow: 1 }}>حجز جلسة في المركز</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
