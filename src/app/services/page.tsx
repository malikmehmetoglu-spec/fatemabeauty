"use client";

import Link from "next/link";
import { useState } from "react";
import { PhoneScreen, TopBar, deskGrid } from "@/components/shell";
import { Chip, Circ, DarkGlow, EmptyState, ErrorNote, Icon, IconButton, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listCategories, listPackages, listServices, type Category, type Service } from "@/lib/db/catalog";
import { money } from "@/lib/format";
import { C, CARD, DARK, SHB } from "@/lib/tokens";

/**
 * P_Services.dc.html — service catalogue with category tabs.
 * Live data: services, their categories (service_categories) and packages from Supabase. Prices are SYP only.
 */
function ServiceRow({ s, icon }: { s: Service; icon: string }) {
  return (
    <Link href={`${R.P_ServiceDetail}?key=${encodeURIComponent(s.key)}`} style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px 12px 12px" }}>
      <Circ icon={icon} size={48} iconSize={22} />
      <span style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.ink }}>{s.name}</span>
        {s.description && <span style={{ display: "block", fontSize: 12, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.description}</span>}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: C.muted, marginTop: 1 }}>
          <Icon name="clock" color={C.muted} size={13} />{s.minutes} دقيقة
        </span>
      </span>
      <span style={{ flexShrink: 0, textAlign: "left", lineHeight: 1.25 }}>
        {s.price_syp == null ? <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.accent, maxWidth: 70, textAlign: "center" }}>السعر عند الاستفسار</span> : <>
          <span style={{ display: "block", fontSize: 11, color: C.sub2, minHeight: 13 }}>{s.price_from ? "من" : ""}</span>
          <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: C.accent }}>{s.price ? money(s.price, false) : "مجانية"}</span>
          <span style={{ display: "block", fontSize: 11, color: C.sub2, minHeight: 13 }}>{s.price ? "ل.س" : ""}</span>
        </>}
      </span>
      <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="arrow" color={C.accent} size={15} stroke={2} />
      </span>
    </Link>
  );
}

function CatHead({ c }: { c: Category }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
      <div style={{ lineHeight: 1.4, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.ink }}>{c.name}</h2>
        {c.short_description && <div style={{ fontSize: 12.5, color: C.sub2 }}>{c.short_description}</div>}
      </div>
      {c.not_for_pregnant && <span style={{ marginInlineStart: "auto", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#9A6418", background: "#FBF0DC", borderRadius: 12, padding: "3px 10px" }}>لا تناسب الحامل</span>}
    </div>
  );
}

export default function ServicesPage() {
  const [cat, setCat] = useState("all");
  const { data: services, loading, error } = useQuery(["catalog", "services"], listServices);
  const { data: catData } = useQuery(["catalog", "categories"], () => listCategories());
  const { data: packages } = useQuery(["catalog", "packages"], () => listPackages());
  const all = services ?? [];
  const cats = (catData ?? []).filter((c) => all.some((s) => s.category_id === c.key));
  const other = all.filter((s) => !cats.some((c) => c.key === s.category_id));
  const shown = cat === "all" ? cats : cats.filter((c) => c.key === cat);
  const items = cat === "all" ? all : all.filter((s) => s.category_id === cat);
  const n = items.length;
  const countText = n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : `${n} خدمات`;
  const pkg = packages?.[0];

  return (
    <PhoneScreen padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="خدماتنا" back={R.Main} right={<IconButton icon="search" label="البحث في الخدمات" />} />
      <div role="tablist" aria-label="تصنيف الخدمات" style={{ position: "relative", display: "flex", gap: 8, margin: "0 -20px -14px", padding: "2px 20px 22px", overflowX: "auto" }}>
        {[{ key: "all", name: "الكل" }, ...cats].map((t) => (
          <Chip key={t.key} selected={cat === t.key} onClick={() => setCat(t.key)} style={{ padding: "0 15px", fontWeight: cat === t.key ? 700 : 600, whiteSpace: "nowrap", flexShrink: 0 }}>{t.name}</Chip>
        ))}
      </div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: -6 }}>
        <div style={{ fontSize: 13, color: C.sub2 }}>{countText}</div>
        <div style={{ fontSize: 12, color: C.muted }}>الأسعار للجلسة الواحدة</div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الخدمات: {error}</ErrorNote> : all.length === 0 ? (
          <EmptyState icon="sparkle" title="لا خدمات منشورة بعد" text="ستظهر هنا جلسات المركز ومدتها وأسعارها فور إضافتها من الإدارة." />
        ) : <>
          {shown.map((c) => (
            <section key={c.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <CatHead c={c} />
              <div className={deskGrid} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {all.filter((s) => s.category_id === c.key).map((s) => <ServiceRow key={s.key} s={s} icon={c.icon} />)}
              </div>
            </section>
          ))}
          {cat === "all" && other.length > 0 && <div className={deskGrid} style={{ display: "flex", flexDirection: "column", gap: 10 }}>{other.map((s) => <ServiceRow key={s.key} s={s} icon="sparkle" />)}</div>}
        </>}
      </div>
      {pkg && <Link href={R.Packages} style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 28, padding: "16px 18px", display: "block", marginTop: "auto" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="gift" color="#E8D6F0" size={22} />
          </span>
          <div style={{ flexGrow: 1, lineHeight: 1.45 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>باقات الجلسات</div>
            <div style={{ fontSize: 12.5, color: C.onDark }}>{pkg.name} بـ <span style={{ whiteSpace: "nowrap" }}>{money(pkg.price)}</span></div>
          </div>
          <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="arrow" color={C.accent} size={16} stroke={2} />
          </span>
        </div>
      </Link>}
    </PhoneScreen>
  );
}
