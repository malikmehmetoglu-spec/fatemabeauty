"use client";

import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Chip, Circ, DarkCard, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listConditions, useMe } from "@/lib/db/patients";
import { listPrescriptions, rxItems } from "@/lib/db/clinical";
import { C, CARD, SOFT_PANEL } from "@/lib/tokens";
import { Wait } from "../../account/Wait";

/** P_SkinType.dc.html — the patient's skin type (read-only, set by the specialist). */
const HISTORY = "M12 8v4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5";
const DESC: Record<string, string> = {
  "دهنية": "لمعان وإفراز زيوت أكثر، ومسام أوضح",
  "جافة": "شدّ وقشور خفيفة، وتحتاج ترطيباً أكثر",
  "مختلطة": "دهنية في منطقة T، وأجفّ على الخدين",
  "عادية": "متوازنة بدون دهون أو جفاف واضح",
  "حساسة": "تحمرّ وتتهيّج بسهولة، وتحتاج مستحضرات لطيفة",
};

export default function SkinTypePage() {
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: conds } = useQuery(["conditions", id], () => listConditions(id), { enabled: !!id });
  const { data: rx } = useQuery(["clinical", "rx", id], () => listPrescriptions(id), { enabled: !!id });
  const concerns = (conds ?? []).filter((c) => c.kind === "concern");
  const latest = rx?.[0];
  const items = rxItems(latest);

  return (
    <PhoneScreen gap={13} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="نوع بشرتي" back={R.Account} />
      {!me ? <Wait loading={loading} error={error} /> : (
        <>
          <DarkCard padding="18px 20px">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 58, height: 58, borderRadius: 29, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="face" color="#E8D6F0" size={28} stroke={1.7} />
              </span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12.5, color: C.onDark }}>نوع البشرة</div>
                <div style={{ fontSize: me.skin_type ? 28 : 20, fontWeight: 700 }}>{me.skin_type ?? "لم يُحدَّد بعد"}</div>
                <div style={{ fontSize: 12.5, color: "#E8D6F0" }}>{me.skin_type ? DESC[me.skin_type] ?? "" : "تحدده الأخصائية في أول جلسة بعد فحص بشرتكِ"}</div>
              </div>
            </div>
          </DarkCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>الاهتمامات الرئيسية</div>
            {concerns.length ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{concerns.map((c) => <Chip key={c.id} selected height={34}>{c.name}</Chip>)}</div>
            ) : <div style={{ fontSize: 13, color: C.sub2 }}>لم تختاري اهتمامات بعد. يمكنكِ إضافتها من <Link href={R.P_Profile} style={{ color: C.accent, fontWeight: 600 }}>ملفكِ</Link>.</div>}
          </div>

          {latest && (
            <Card radius={24} padding="14px 16px" style={{ flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Circ icon="file" size={40} iconSize={18} />
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>توصيات الأخصائية</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{latest.staff?.name ?? "فريق المركز"} · {arDate(new Date(latest.created_at), { day: false, year: true })}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>{items.map((x) => x.name).join("، ")}</div>
            </Card>
          )}

          {items.length > 0 && (
            <Link href={R.Routine} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 22, flexShrink: 0, position: "relative" }}>
              <Circ icon="bottle" size={40} iconSize={18} />
              <div style={{ flex: 1, lineHeight: 1.35 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>روتينكِ المناسب لبشرتكِ</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{items.slice(0, 3).map((x) => x.name).join("، ")}</div>
              </div>
              <Icon name="fwd" color={C.muted} size={18} />
            </Link>
          )}

          <div style={{ ...SOFT_PANEL, display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderRadius: 20, marginTop: "auto", position: "relative" }}>
            {latest && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub }}>
                <Icon name={HISTORY} color={C.accentMid} size={17} />آخر تحديث: {arDate(new Date(latest.created_at), { year: true })}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub }}>
              <Icon name="lock" color={C.accentMid} size={17} />تُحدَّث من قبل الأخصائية — للتعديل اسأليها في جلستكِ
            </div>
          </div>
        </>
      )}
    </PhoneScreen>
  );
}
