"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Circ, DarkGlow, FatemaAvatar, Icon, IconButton, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PACKAGES, SERVICE } from "@/lib/data";
import { money } from "@/lib/format";
import { C, DARK, DONE_GRAD, SOFT_PANEL } from "@/lib/tokens";

/** P_ServiceDetail.dc.html — deep-cleansing service detail. */
const HEART = "M19.5 12.6L12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6";
const STEPS = ["تنظيف", "تقشير لطيف", "استخراج الرؤوس", "ماسك مهدئ", "ترطيب وواقي"];
const BEFORE = ["تجنّبي المقشّرات المنزلية قبلها بأيام", "تعالي دون مكياج إن أمكن", "أخبرينا بأي دواء جديد"];
const AFTER = ["لا مكياج في اليوم الأول", "واقي الشمس كل صباح", "تجنّبي الساونا والمسبح ليومين"];

const pill = { minWidth: 0, borderRadius: 18, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", lineHeight: 1.35 } as const;

function Tips({ icon, title, items }: { icon: string; title: ReactNode; items: string[] }) {
  return (
    <Card radius={24} padding="13px 14px" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <Circ icon={icon} size={30} iconSize={14} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      </div>
      {items.map((t) => (
        <div key={t} style={{ display: "flex", gap: 6, fontSize: 12, color: C.sub, lineHeight: 1.5, marginTop: 3 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: "#C9A2D8", flexShrink: 0, marginTop: 7 }} />{t}
        </div>
      ))}
    </Card>
  );
}

export default function ServiceDetailPage() {
  const s = SERVICE.clean;
  const pkg = PACKAGES.find((p) => p.service === "clean")!;
  const [fav, setFav] = useState(false);
  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="تفاصيل الخدمة" back={R.P_Services}
        right={<IconButton icon={HEART} label="إضافة إلى المفضلة" onClick={() => setFav(!fav)} style={fav ? { background: "#F3EAF6" } : undefined} />} />

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 18px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ lineHeight: 1.4 }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>جلسة عناية بالبشرة</div>
              <h1 style={{ margin: "2px 0 0", fontSize: 24, fontWeight: 700 }}>{s.name}</h1>
              <div style={{ fontSize: 13, color: C.onDark, marginTop: 4 }}>تنظيف المسام وإزالة الرؤوس السوداء،<br />لبشرة أنقى وأكثر إشراقاً</div>
            </div>
            <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="sparkle" color="#E8D6F0" size={24} />
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <div style={{ ...pill, flex: 1, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: C.onDark }}>المدة</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{s.minutes} دقيقة</div>
            </div>
            <div style={{ ...pill, flex: 1, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: C.onDark }}>السعر</div>
              <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>{money(s.price)}</div>
            </div>
            <div style={{ ...pill, flex: 1.25, padding: "6px 8px", display: "flex", alignItems: "center", gap: 7 }}>
              <FatemaAvatar size={34} />
              <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.onDark }}>الأخصائية</div>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>فاطمة طيبة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card padding="14px 12px">
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, padding: "0 4px 12px" }}>ماذا تتضمن الجلسة؟</h2>
        <ol style={{ position: "relative", display: "flex", margin: 0, padding: 0, listStyle: "none" }}>
          <div aria-hidden style={{ position: "absolute", top: 16, left: "9%", right: "9%", height: 2, background: "linear-gradient(90deg,#DEC6E8,#C9A2D8)" }} />
          {STEPS.map((t, i) => (
            <li key={t} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative", textAlign: "center" }}>
              <span className="latin" style={{ ...DONE_GRAD, width: 34, height: 34, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.white, position: "relative", zIndex: 1 }}>{i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{t}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div style={{ position: "relative", display: "flex", gap: 10 }}>
        <Tips icon="calcheck" title="قبل الجلسة" items={BEFORE} />
        <Tips icon="drop" title="بعد الجلسة" items={AFTER} />
      </div>

      <Link href={R.Packages} style={{ ...SOFT_PANEL, position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" }}>
        <Circ icon="gift" size={40} iconSize={18} />
        <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>وفّري مع باقة {pkg.sessions} جلسات</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>{money(pkg.price)} بدلاً من {money(s.price * pkg.sessions)}</div>
        </div>
        <Icon name="fwd" color={C.accentMid} size={18} stroke={2} />
      </Link>

      <div style={{ marginTop: "auto", position: "relative" }}>
        <PrimaryButton href={R.Booking} icon="cal">احجزي هذه الخدمة</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
