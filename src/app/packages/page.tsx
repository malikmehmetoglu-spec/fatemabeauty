"use client";

/** Packages.dc.html — my packages & loyalty points. */
import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Circ, DarkGlow, Icon, Progress, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { PACKAGES, PACKAGE_RULE, PERSONA } from "@/lib/data";
import { money } from "@/lib/format";
import { C, CARD, DARK, SOFT_PANEL } from "@/lib/tokens";

const PKG_ICON: Record<string, string> = { clean: "drop", hydra: "drop", peel: "sparkle" };
const PKG_NAME: Record<string, string> = { clean: "التنظيف العميق", hydra: "الهيدرافيشل", peel: "التقشير" };

export default function PackagesPage() {
  const pct = (PERSONA.points / (PERSONA.points + PERSONA.toNextTier)) * 100;
  const total = PERSONA.sessionsDone + PERSONA.sessionsLeft;
  const suggested = PACKAGES.filter((p) => p.service !== PERSONA.packageService);

  return (
    <PhoneScreen>
      <TopBar title="باقاتي ونقاطي" back={R.Main} />

      <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
        <DarkGlow style={{ top: -70, left: -50, bottom: "auto", right: "auto", width: 220, height: 220, borderRadius: 110 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div style={{ fontSize: 13, color: C.onDark }}>رصيد نقاطكِ</div>
            <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>{PERSONA.points}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(145deg, #FFFFFF, #CFCBD6)", color: "#4A4452", borderRadius: 16, padding: "5px 12px", fontSize: 13, fontWeight: 700, boxShadow: "0 6px 14px rgba(0,0,0,0.18)" }}>
            <Icon name="star" color="#4A4452" size={14} stroke={2} />العضوية {PERSONA.tier}
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 12 }}>
          <Progress pct={pct} dark />
          <div style={{ fontSize: 12, color: C.onDark, marginTop: 6 }}>{PERSONA.toNextTier} نقطة وتصلين إلى العضوية الذهبية</div>
        </div>
      </div>

      <Card radius={26} padding={16} style={{ border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>باقتي الحالية</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{PERSONA.package}</div>
          </div>
          <Tag kind="pink" style={{ height: "auto", padding: "3px 10px", borderRadius: 14 }}>متبقٍ {PERSONA.sessionsLeft}</Tag>
        </div>
        <div role="progressbar" aria-label="الجلسات المنجزة" aria-valuenow={PERSONA.sessionsDone} aria-valuemin={0} aria-valuemax={total} style={{ display: "flex", gap: 5, margin: "12px 0 8px" }}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < PERSONA.sessionsDone ? "linear-gradient(90deg,#C9A2D8,#7B4687)" : "#ECE2EF" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.sub2 }}>اشتريتِها بسعر 5 جلسات: {money(PERSONA.packagePrice)}</div>
      </Card>

      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>باقات مقترحة لكِ</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        {suggested.map((p) => (
          <Link key={p.service} href={`${R.P_PackageDetail}?s=${p.service}`} style={{ ...CARD, borderRadius: 22, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <Circ icon={PKG_ICON[p.service]} size={40} iconSize={19} />
            <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>باقة {PKG_NAME[p.service]}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{PACKAGE_RULE}</div>
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.3 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{money(p.price, false)}</div>
              <div style={{ fontSize: 11, color: C.sub2 }}>ل.س</div>
            </div>
          </Link>
        ))}
      </div>

      <Link href={R.P_GiftCard} style={{ ...SOFT_PANEL, marginTop: "auto", position: "relative", borderRadius: 26, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Circ icon="gift" size={44} iconSize={19} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>أهدي صديقتكِ جلسة</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>بطاقة هدية رقمية تصلها على هاتفها</div>
        </div>
        <span aria-hidden style={{ ...DARK, width: 44, height: 44, borderRadius: 22, boxShadow: "0 8px 18px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="arrow" color="#FFFFFF" size={16} stroke={2} />
        </span>
      </Link>
    </PhoneScreen>
  );
}
