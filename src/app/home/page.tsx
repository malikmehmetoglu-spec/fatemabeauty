"use client";

import Link from "next/link";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PhoneScreen } from "@/components/shell";
import { Circ, EmptyState, ErrorNote, Icon, IconButton, Loading, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { useSession } from "@/lib/supabase/session";
import { C, CARD, DARK, GLASS, SH, SHB } from "@/lib/tokens";

/**
 * Main.dc.html — patient home.
 * Live data: services from Supabase `services`, the specialist card from `staff`, greeting from the signed-in patient.
 */
export default function HomePage() {
  const { data: services, loading, error } = useQuery(["catalog", "services"], listServices);
  const { data: team } = useQuery(["catalog", "specialists"], listSpecialists);
  const { patient } = useSession();
  const first = patient?.name.trim().split(/\s+/)[0];
  const spec = team?.[0];
  const cards = (services ?? []).filter((s) => s.price > 0 || !/استشارة/.test(s.name));
  return (
    <PhoneScreen tab="الرئيسية" padding="0" gap={0}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(env(safe-area-inset-top, 0px) + 22px) 22px 16px", position: "relative" }}>
        <Logo height={54} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <IconButton icon="msg" label="الرسائل" size={48} href={R.P_Chat} />
          <IconButton icon="bell" label="الإشعارات" size={48} href={R.Notifications} badge />
          <Link href={R.Account} aria-label="حسابي" style={{
            width: 48, height: 48, borderRadius: 24, border: "2px solid #FFFFFF", background: "linear-gradient(145deg, #EEDBF2, #DABBE1)",
            boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="user" color={C.accent} size={20} />
          </Link>
        </div>
      </header>

      <p style={{ margin: 0, padding: "0 22px 6px", fontSize: 15, color: C.sub, position: "relative" }}>{first ? `أهلاً ${first}، ` : "أهلاً بكِ، "}بشرتكِ تستحق يوماً جميلاً</p>
      <InstallPrompt style={{ margin: "10px 22px 0" }} />

      <div style={{ display: "flex", gap: 12, padding: "10px 22px 20px", overflowX: "auto", position: "relative" }}>
        {spec && (
        <div style={{ width: 214, height: 214, flexShrink: 0, borderRadius: 30, background: "#EAD7EE", position: "relative", overflow: "hidden", boxShadow: SH }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {spec.photo_url && <img src={spec.photo_url} alt={spec.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />}
          <div style={{ ...GLASS, position: "absolute", bottom: 10, left: 10, right: 10, borderRadius: 22, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{spec.name}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{spec.title || "أخصائية عناية بالبشرة"}</div>
            </div>
            <Link href={R.Booking} aria-label={`احجزي مع ${spec.name}`} style={{ ...DARK, width: 42, height: 42, borderRadius: 21, boxShadow: "0 8px 18px rgba(123,70,135,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrow" color="#FFFFFF" size={16} stroke={2} />
            </Link>
          </div>
        </div>
        )}
        <Link href={R.Consult} style={{
          width: 214, height: 214, flexShrink: 0, borderRadius: 30, background: "linear-gradient(160deg, #FFFFFF 0%, #FAF3FB 100%)",
          border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <span style={{ boxShadow: "0 6px 14px rgba(150,100,170,0.18)", borderRadius: 26, width: 52 }}><Circ icon="cam" size={52} iconSize={24} /></span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>استشارة أونلاين</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>جلسة فيديو مع الأخصائية وأنتِ في بيتكِ</div>
          </div>
        </Link>
      </div>

      <section style={{
        flexGrow: 1, background: C.white, borderRadius: "38px 38px 0 0", padding: "12px 22px calc(env(safe-area-inset-bottom, 0px) + 104px)",
        display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 -14px 34px rgba(123,70,135,0.08)",
      }}>
        <div aria-hidden style={{ width: 44, height: 4, borderRadius: 2, background: "#DFC9E4", alignSelf: "center", marginBottom: 16 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ margin: 0, lineHeight: 1.25, fontWeight: 500 }}>
            <span style={{ display: "block", fontSize: 22, color: C.ink }}>لنجد جلستكِ</span>
            <span style={{ display: "block", fontSize: 25, fontWeight: 700, color: C.accent }}>المثالية</span>
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            <IconButton icon="search" label="بحث" size={50} href={R.P_Services} style={{ border: "1px solid #EEE4F1" }} />
            <IconButton icon="filter" label="تصفية" size={50} href={R.P_Services} style={{ border: "1px solid #EEE4F1" }} />
          </div>
        </div>

        {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الخدمات: {error}</ErrorNote> : cards.length === 0 ? (
          <EmptyState compact icon="sparkle" title="لا خدمات منشورة بعد" text="ستظهر هنا جلسات المركز وأسعارها فور إضافتها من الإدارة." />
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          {cards.map((s, i) => {
            const dark = i === cards.length - 1 && cards.length % 2 === 0;
            return (
              <Link key={s.key} href={`${R.P_ServiceDetail}?key=${encodeURIComponent(s.key)}`} style={{
                height: 116, borderRadius: 26, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between",
                position: "relative", overflow: "hidden",
                ...(dark ? DARK : { ...CARD, background: "linear-gradient(180deg, #FFFFFF 0%, #FBF6FC 100%)" }),
              }}>
                {dark && <div aria-hidden style={{ position: "absolute", top: -40, left: -40, width: 120, height: 120, borderRadius: 60, background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%)" }} />}
                <div style={{ fontSize: 16, fontWeight: 600, color: dark ? C.white : C.ink, position: "relative" }}>{s.short_name || s.name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ lineHeight: 1.3 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: dark ? C.white : C.ink }}>{priceLabel(s)}</div>
                    <div style={{ fontSize: 11, color: dark ? C.onDark : C.sub2 }}>للجلسة</div>
                  </div>
                  <span style={{
                    width: dark ? 48 : 38, height: dark ? 48 : 38, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center",
                    background: dark ? "linear-gradient(145deg, #FFFFFF, #E8D0ED)" : C.white, boxShadow: dark ? "0 6px 16px rgba(0,0,0,0.18)" : SHB,
                  }}>
                    <Icon name="arrow" color={C.accent} size={dark ? 16 : 15} stroke={2} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </section>
    </PhoneScreen>
  );
}
