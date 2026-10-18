"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Chip, Circ, DarkGlow, Icon, IconButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PACKAGE_RULE, type ServiceKey } from "@/lib/data";
import { useCatalog } from "@/lib/supabase/catalog";
import { money } from "@/lib/format";
import { C, CARD, DARK, SHB } from "@/lib/tokens";

/** P_Services.dc.html — service catalogue with category tabs. */
const CAT: Record<ServiceKey, string> = { clean: "تنظيف", hydra: "تنظيف", peel: "تقشير", laser: "ليزر", consult: "استشارة" };
const ICON: Record<ServiceKey, string> = { clean: "sparkle", hydra: "drop", peel: "layers", laser: "sun", consult: "msg" };
const CATS = ["الكل", "تنظيف", "تقشير", "ليزر", "استشارة"];

export default function ServicesPage() {
  const [cat, setCat] = useState("الكل");
  const { services: SERVICES, packages: PACKAGES } = useCatalog();
  const items = SERVICES.filter((s) => cat === "الكل" || CAT[s.key] === cat);
  const n = items.length;
  const countText = n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : `${n} خدمات`;
  const pkg = PACKAGES[0];

  return (
    <PhoneScreen padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="خدماتنا" back={R.Main} right={<IconButton icon="search" label="البحث في الخدمات" />} />
      <div role="tablist" aria-label="تصنيف الخدمات" style={{ position: "relative", display: "flex", gap: 8, margin: "0 -20px -14px", padding: "2px 20px 22px", overflowX: "auto" }}>
        {CATS.map((t) => (
          <Chip key={t} selected={cat === t} onClick={() => setCat(t)} style={{ padding: "0 15px", fontWeight: cat === t ? 700 : 600 }}>{t}</Chip>
        ))}
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -6 }}>
        <div style={{ fontSize: 13, color: C.sub2 }}>{countText}</div>
        <div style={{ fontSize: 12, color: C.muted }}>الأسعار للجلسة الواحدة</div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((s) => (
          <Link key={s.key} href={R.P_ServiceDetail} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px 12px 12px" }}>
            <Circ icon={ICON[s.key]} size={48} iconSize={22} />
            <span style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.ink }}>{s.name}</span>
              <span style={{ display: "block", fontSize: 12, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.desc}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: C.muted, marginTop: 1 }}>
                <Icon name="clock" color={C.muted} size={13} />{s.minutes} دقيقة
              </span>
            </span>
            <span style={{ flexShrink: 0, textAlign: "left", lineHeight: 1.25 }}>
              <span style={{ display: "block", fontSize: 11, color: C.sub2, minHeight: 13 }}>{s.from ? "من" : ""}</span>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: C.accent }}>{s.price ? money(s.price, false) : "مجانية"}</span>
              <span style={{ display: "block", fontSize: 11, color: C.sub2, minHeight: 13 }}>{s.price ? "ل.س" : ""}</span>
            </span>
            <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrow" color={C.accent} size={15} stroke={2} />
            </span>
          </Link>
        ))}
      </div>
      <Link href={R.Packages} style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 28, padding: "16px 18px", display: "block", marginTop: "auto" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="gift" color="#E8D6F0" size={22} />
          </span>
          <div style={{ flexGrow: 1, lineHeight: 1.45 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>باقات {PACKAGE_RULE}</div>
            <div style={{ fontSize: 12.5, color: C.onDark }}>باقة التنظيف العميق بـ <span style={{ whiteSpace: "nowrap" }}>{money(pkg.price)}</span></div>
          </div>
          <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="arrow" color={C.accent} size={16} stroke={2} />
          </span>
        </div>
      </Link>
    </PhoneScreen>
  );
}
