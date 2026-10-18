"use client";

import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, FatemaAvatar, Icon, IconButton, PrimaryButton, SectionTitle } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, SERVICE } from "@/lib/data";
import { arDate, money } from "@/lib/format";
import { C, CARD, SELECTED, SOFT_PANEL } from "@/lib/tokens";

const NOTES: [string, string, string][] = [
  ["drop", "لمعان في منطقة الجبهة والأنف", "إفراز دهني أعلى من باقي الوجه"],
  ["sun", "جفاف خفيف على الخدّين", "يحتاج ترطيباً لطيفاً صباحاً ومساءً"],
  ["eye", "مسام ظاهرة قليلاً حول الأنف", "تتحسن مع التنظيف المنتظم"],
];

/** P_ConsultSummary.dc.html — summary after an online consultation. */
export default function ConsultSummaryPage() {
  const hydra = SERVICE.hydra;
  return (
    <PhoneScreen>
      <TopBar title="ملخص الاستشارة" back={R.P_Appointments} />

      <DarkCard padding="18px 20px">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FatemaAvatar size={52} />
          <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>استشارة أونلاين مع</div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>فاطمة طيبة</div>
            <div style={{ fontSize: 12.5, color: C.onDark }}>{arDate(new Date(2026, 9, 14))} · 16:00</div>
          </div>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="clip" color="#E8D6F0" size={20} />
          </span>
        </div>
      </DarkCard>

      <SectionTitle>ما لاحظته الأخصائية</SectionTitle>
      <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
        {NOTES.map(([ic, t, s], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Circ icon={ic} size={36} iconSize={16} />
            <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{t}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "2px 6px" }}>
        <FatemaAvatar size={30} />
        <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, borderRadius: "4px 18px 18px 18px", background: "rgba(255,255,255,0.75)", padding: "8px 12px", border: "1px solid #FFFFFF" }}>
          «اغسلي وجهكِ مرتين يومياً بلطف ودون فرك، ولا تنسي واقي الشمس حتى في الأيام الغائمة.»
        </div>
      </div>

      <Link href={R.Routine} style={{ ...SOFT_PANEL, display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" }}>
        <Circ icon="sparkle" size={40} iconSize={18} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>روتينكِ المقترح</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>غسول لطيف · سيروم مرطب · واقي شمس</div>
        </div>
        <Icon name="chev" color={C.accentMid} size={18} stroke={2} />
      </Link>

      <div style={{ ...CARD, borderRadius: 26, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 12, color: C.sub2 }}>جلسة مقترحة في المركز</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{hydra.name}</div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>
            {money(hydra.price)} <span style={{ fontSize: 11.5, color: C.sub2, fontWeight: 400 }}>للجلسة · لترطيب أعمق</span>
          </div>
        </div>
        <Link href={R.Booking} style={{ ...SELECTED, height: 44, padding: "0 20px", borderRadius: 22, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 700 }}>احجزي</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 4px" }}>
        <Circ icon="calcheck" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>المتابعة القادمة</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>مع جلستكِ {arDate(PERSONA.nextSession)} · {PERSONA.nextTime}</div>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
        <IconButton icon="msg" label="مراسلة الأخصائية" size={58} href={R.P_Chat} />
        <PrimaryButton icon="download" style={{ flexGrow: 1 }}>حفظ الملخص PDF</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
