"use client";

import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Chip, Circ, DarkCard, FatemaAvatar, Icon, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, CARD, SOFT_PANEL } from "@/lib/tokens";

/** P_SkinType.dc.html — the patient's skin type (read-only, set by the specialist). */
const TONES = [["I", "#F9E3D6"], ["II", "#F1CFB4"], ["III", "#DDB08A"], ["IV", "#C08A60"], ["V", "#8F5E3B"], ["VI", "#5A3A25"]];
const CURRENT = "III";
const HISTORY = "M12 8v4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5";
const SHINE = "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)";

export default function SkinTypePage() {
  return (
    <PhoneScreen gap={13} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="نوع بشرتي" back={R.Account} />
      <DarkCard padding="18px 20px">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 58, height: 58, borderRadius: 29, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="face" color="#E8D6F0" size={28} stroke={1.7} />
          </span>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>نوع البشرة</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>مختلطة</div>
            <div style={{ fontSize: 12.5, color: "#E8D6F0" }}>دهنية في منطقة T، وأجفّ على الخدين</div>
          </div>
        </div>
      </DarkCard>

      <Card radius={24} padding="14px 16px" style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>النمط الضوئي للبشرة</div>
          <Tag kind="pink">فيتزباتريك III</Tag>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", height: 64, marginTop: 10 }}>
          {TONES.map(([n, col]) => {
            const on = n === CURRENT;
            return (
              <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                <span style={on
                  ? { width: 40, height: 40, borderRadius: "50%", background: `${SHINE}, ${col}`, boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 5px #A877B6, 0 8px 16px rgba(150,100,170,0.30)" }
                  : { width: 34, height: 34, borderRadius: "50%", background: `${SHINE}, ${col}`, boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.08), 0 3px 8px rgba(123,70,135,0.10)", border: "2px solid #FFFFFF", boxSizing: "border-box" }} />
                <span className="latin" style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: on ? C.accent : C.muted }}>{n}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 14, background: "#F8F2FA", fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
          تسمرّ تدريجي وقد تحمرّ أحياناً — يحدد هذا شدّة جلسات الليزر والتقشير المناسبة لكِ.
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>الاهتمامات الرئيسية</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["مسام واسعة", "لمعان منطقة T", "جفاف الخدين"].map((t) => <Chip key={t} selected height={34}>{t}</Chip>)}
        </div>
      </div>

      <Card radius={24} padding="14px 16px" style={{ flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FatemaAvatar size={40} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>ملاحظات الأخصائية</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>فاطمة طيبة</div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 13.5, color: C.sub, lineHeight: 1.65 }}>
          غسول لطيف صباحاً ومساءً، وسيروم مرطب على بشرة رطبة. واقي الشمس يومياً حتى في الأيام الغائمة، وتجنّبي المقشّرات القوية في المنزل بين الجلسات.
        </div>
      </Card>

      <Link href={R.Routine} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 22, flexShrink: 0, position: "relative" }}>
        <Circ icon="bottle" size={40} iconSize={18} />
        <div style={{ flex: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>روتينكِ المناسب لبشرتكِ</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>غسول لطيف، سيروم مرطب، واقي شمس</div>
        </div>
        <Icon name="fwd" color={C.muted} size={18} />
      </Link>

      <div style={{ ...SOFT_PANEL, display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderRadius: 20, marginTop: "auto", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub }}>
          <Icon name={HISTORY} color={C.accentMid} size={17} />آخر تحديث: {arDate(PERSONA.sessions[0], { year: true })} · فاطمة طيبة
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub }}>
          <Icon name="lock" color={C.accentMid} size={17} />تُحدَّث من قبل الأخصائية — للتعديل اسأليها في جلستكِ
        </div>
      </div>
    </PhoneScreen>
  );
}
