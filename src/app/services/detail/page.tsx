"use client";

import Link from "next/link";
import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Avatar, Card, Circ, DarkGlow, EmptyState, ErrorNote, Icon, IconButton, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { initials } from "@/lib/data";
import { useQuery } from "@/lib/db/query";
import { getService, listPackages, listSpecialists, serviceIcon } from "@/lib/db/catalog";
import { money } from "@/lib/format";
import { C, DARK, SOFT_PANEL } from "@/lib/tokens";

/**
 * P_ServiceDetail.dc.html — service detail (`?key=<service key>`).
 * Live data: service, its package and the specialist from Supabase.
 */
const HEART = "M19.5 12.6L12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6";
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
  return <Suspense><Detail /></Suspense>;
}

function Detail() {
  const key = useSearchParams().get("key") ?? "";
  const { data: s, loading, error } = useQuery(["catalog", "service", key], () => getService(key), { enabled: !!key });
  const { data: packages } = useQuery(["catalog", "packages"], () => listPackages());
  const { data: team } = useQuery(["catalog", "specialists"], listSpecialists);
  const spec = team?.[0];
  const [fav, setFav] = useState(false);
  if (!s) return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="تفاصيل الخدمة" back={R.P_Services} />
      {key && loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الخدمة: {error}</ErrorNote>
        : <EmptyState icon="sparkle" title="الخدمة غير متاحة" text="ربما أُوقفت هذه الخدمة. اطّلعي على الخدمات المتاحة حالياً." />}
    </PhoneScreen>
  );
  const pkg = packages?.find((p) => p.service_key === s.key);
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
              {s.description && <div style={{ fontSize: 13, color: C.onDark, marginTop: 4 }}>{s.description}</div>}
            </div>
            <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={serviceIcon(s.name)} color="#E8D6F0" size={24} />
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <div style={{ ...pill, flex: 1, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: C.onDark }}>المدة</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{s.minutes} دقيقة</div>
            </div>
            <div style={{ ...pill, flex: 1, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: C.onDark }}>السعر</div>
              <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>{s.price ? (s.price_from ? "من " : "") + money(s.price) : "مجانية"}</div>
            </div>
            {spec && <div style={{ ...pill, flex: 1.25, padding: "6px 8px", display: "flex", alignItems: "center", gap: 7 }}>
              {spec.photo_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={spec.photo_url} alt="" style={{ width: 34, height: 34, borderRadius: 17, objectFit: "cover" }} />
                : <Avatar initials={initials(spec.name)} size={34} />}
              <div style={{ lineHeight: 1.3, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.onDark }}>الأخصائية</div>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{spec.name}</div>
              </div>
            </div>}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 10 }}>
        <Tips icon="calcheck" title="قبل الجلسة" items={BEFORE} />
        <Tips icon="drop" title="بعد الجلسة" items={AFTER} />
      </div>

      {pkg && <Link href={`${R.P_PackageDetail}?id=${pkg.id}`} style={{ ...SOFT_PANEL, position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px" }}>
        <Circ icon="gift" size={40} iconSize={18} />
        <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>وفّري مع باقة {pkg.sessions} جلسات</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>{money(pkg.price)} بدلاً من {money(s.price * pkg.sessions)}</div>
        </div>
        <Icon name="fwd" color={C.accentMid} size={18} stroke={2} />
      </Link>}

      <div style={{ marginTop: "auto", position: "relative" }}>
        <PrimaryButton href={`${R.Booking}?service=${encodeURIComponent(s.key)}`} icon="cal">احجزي هذه الخدمة</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
