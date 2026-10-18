"use client";

/** P_PackageDetail.dc.html — package detail (default: الهيدرافيشل; `?s=peel` etc.). */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PACKAGES, PACKAGE_RULE, SERVICE, type ServiceKey } from "@/lib/data";
import { money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";

const PKG_ICON: Record<string, string> = { clean: "drop", hydra: "drop", peel: "sparkle" };
const PKG_NAME: Record<string, string> = { clean: "التنظيف العميق", hydra: "الهيدرافيشل", peel: "التقشير" };
const PKG_SESS: Record<string, string> = { clean: "جلسات تنظيف عميق", hydra: "جلسات هيدرافيشل", peel: "جلسات تقشير" };

export default function PackageDetailPage() {
  return <Suspense><Detail /></Suspense>;
}

function Detail() {
  const s = (useSearchParams().get("s") ?? "hydra") as ServiceKey;
  const pkg = PACKAGES.find((p) => p.service === s) ?? PACKAGES.find((p) => p.service === "hydra")!;
  const svc = SERVICE[pkg.service];
  const full = svc.price * pkg.sessions;

  const includes = [
    { icon: PKG_ICON[pkg.service], t: `${pkg.sessions} ${PKG_SESS[pkg.service]}`, d: `${svc.minutes} دقيقة لكل جلسة` },
    { icon: "gift", t: "الجلسة السادسة هدية", d: "تدفعين ثمن 5 جلسات فقط" },
    { icon: "sparkle", t: "متابعة بعد كل جلسة", d: "صور قبل وبعد ونصائح العناية في رحلتي" },
  ];
  const how = [
    { icon: "cal", t: "احجزي كالمعتاد" },
    { icon: "calcheck", t: "تُخصم تلقائياً عند حضوركِ" },
    { icon: "layers", t: "تابعي رصيدكِ في باقاتي" },
  ];

  return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الباقة" back={R.Packages} />

      <DarkCard radius={32} padding="20px 22px" style={{ flexShrink: 0 }}>
        <div aria-hidden style={{ position: "absolute", top: -60, left: -52, width: 160, height: 160, borderRadius: 80, background: "radial-gradient(circle, rgba(239,221,243,0.18) 0%, rgba(239,221,243,0) 70%)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, color: C.onDark }}>باقة</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{PKG_NAME[pkg.service]}</h1>
            <div style={{ fontSize: 14, color: "#E8D6F0", marginTop: 2 }}>{PACKAGE_RULE}</div>
          </div>
          <span style={{ width: 54, height: 54, borderRadius: 27, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={PKG_ICON[pkg.service]} color="#E8D6F0" size={26} stroke={1.7} />
          </span>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12, gap: 8 }}>
          <div style={{ lineHeight: 1.1, whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 13, color: C.onDark, textDecoration: "line-through" }}><span className="latin">{money(full, false)}</span> ل.س</div>
            <div style={{ fontSize: 34, fontWeight: 700 }}><span className="latin">{money(pkg.price, false)}</span> <span style={{ fontSize: 15, fontWeight: 600 }}>ل.س</span></div>
          </div>
          <span style={{ height: 30, padding: "0 12px", whiteSpace: "nowrap", marginBottom: 4, borderRadius: 15, background: C.white, color: C.accent, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>
            توفّرين {money(pkg.saving)}
          </span>
        </div>
        <div style={{ position: "relative", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.16)", fontSize: 12.5, color: C.onDark }}>
          مقارنةً بـ {pkg.sessions} جلسات منفردة × <span className="latin">{money(svc.price, false)}</span> ل.س = <span className="latin">{money(full, false)}</span> ل.س
        </div>
      </DarkCard>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 6px", flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700 }}>ماذا تتضمن الباقة</h2>
        {includes.map((r, i) => (
          <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Circ icon={r.icon} size={36} iconSize={16} />
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{r.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 12px", flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>كيف تُستخدم الباقة؟</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          {how.map((h) => (
            <div key={h.t} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              <Circ icon={h.icon} size={40} iconSize={18} />
              <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.4 }}>{h.t}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.sub2, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="info" color={C.accentMid} size={16} />صلاحية الباقة حسب سياسة المركز
        </div>
      </div>

      <PrimaryButton href={R.Payments} style={{ marginTop: "auto", flexShrink: 0 }}>اشتري الباقة</PrimaryButton>
    </PhoneScreen>
  );
}
