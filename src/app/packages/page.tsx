"use client";

/**
 * Packages.dc.html — my packages & loyalty points.
 * Live data: points and bought packages of the signed-in patient, package offers from Supabase `packages`.
 */
import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Circ, DarkGlow, EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listMyPackages, listPackages, listServices, serviceIcon } from "@/lib/db/catalog";
import { useSession } from "@/lib/supabase/session";
import { myPendingPackageRequests } from "@/lib/db/packageRequests";
import { money } from "@/lib/format";
import { C, CARD, DARK, SOFT_PANEL } from "@/lib/tokens";

export default function PackagesPage() {
  const { patient } = useSession();
  const { data: offers, loading, error } = useQuery(["catalog", "packages"], () => listPackages());
  const { data: services } = useQuery(["catalog", "services"], listServices);
  const { data: mine } = useQuery(["catalog", "my-packages", patient?.id], () => listMyPackages(patient!.id), { enabled: !!patient });
  const { data: pend } = useQuery(["pkgreq", "mine", patient?.id], myPendingPackageRequests, { enabled: !!patient });
  const isPending = (id: string) => !!pend?.some((r) => r.package_id === id);
  const current = mine?.find((p) => p.sessions_used < p.sessions_total);
  const svcOf = (key: string) => services?.find((x) => x.key === key);
  const suggested = (offers ?? []).filter((p) => p.id !== current?.package_id);

  return (
    <PhoneScreen>
      <TopBar title="باقاتي ونقاطي" back={R.Main} />

      {patient && (
        <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
          <DarkGlow style={{ top: -70, left: -50, bottom: "auto", right: "auto", width: 220, height: 220, borderRadius: 110 }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 13, color: C.onDark }}>رصيد نقاطكِ</div>
            <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>{patient.points}</div>
          </div>
        </div>
      )}

      {current && (
        <Card radius={26} padding={16} style={{ border: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 12, color: C.sub2 }}>باقتي الحالية</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{(current as unknown as { packages: { name: string } | null }).packages?.name ?? "باقة"}</div>
            </div>
            <Tag kind="pink" style={{ height: "auto", padding: "3px 10px", borderRadius: 14 }}>متبقٍ {current.sessions_total - current.sessions_used}</Tag>
          </div>
          <div role="progressbar" aria-label="الجلسات المنجزة" aria-valuenow={current.sessions_used} aria-valuemin={0} aria-valuemax={current.sessions_total} style={{ display: "flex", gap: 5, margin: "12px 0 8px" }}>
            {Array.from({ length: current.sessions_total }, (_, i) => (
              <span key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: i < current.sessions_used ? "linear-gradient(90deg,#C9A2D8,#7B4687)" : "#ECE2EF" }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.sub2 }}>اشتريتِها بـ {money(current.price_paid)}</div>
        </Card>
      )}

      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>{current ? "باقات مقترحة لكِ" : "باقات الجلسات"}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الباقات: {error}</ErrorNote> : suggested.length === 0 ? (
          <EmptyState compact icon="gift" title="لا باقات متاحة حالياً" text="ستظهر هنا باقات الجلسات بأسعارها المخفّضة فور إضافتها من الإدارة." />
        ) : suggested.map((p) => (
          <Link key={p.id} href={`${R.P_PackageDetail}?id=${p.id}`} style={{ ...CARD, borderRadius: 22, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <Circ icon={serviceIcon(svcOf(p.service_key)?.name ?? p.name)} size={40} iconSize={19} />
            <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{p.sessions} جلسات</div>
              {isPending(p.id) && <Tag kind="amber" style={{ marginTop: 4, height: 24, fontSize: 11.5 }}>طلبكِ قيد الانتظار</Tag>}
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
