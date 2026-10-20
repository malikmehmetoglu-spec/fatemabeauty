"use client";

import Link from "next/link";
import { useState } from "react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { DeskHeading, PhoneScreen, phoneOnly } from "@/components/shell";
import hm from "./home.module.css";
import { Circ, EmptyState, ErrorNote, Icon, IconButton, Loading, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { staffPhoto } from "@/lib/db/staff";
import { listCategories, listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { useSession } from "@/lib/supabase/session";
import { GuestPill } from "@/components/guest";
import { ACTIVE, listMine, STATUS_LABEL } from "@/lib/db/appointments";
import { listMyNotifications } from "@/lib/db/patients";
import { arDate, clock } from "@/lib/format";
import { C, CARD, DARK, GLASS, SH, SHB } from "@/lib/tokens";

/**
 * Main.dc.html — patient home.
 * Live data: services from Supabase `services`, the specialist card from `staff`, greeting from the signed-in patient.
 */
export default function HomePage() {
  const { data: services, loading, error } = useQuery(["catalog", "services"], listServices);
  const { data: team } = useQuery(["catalog", "specialists"], listSpecialists);
  const { patient, guest } = useSession();
  const first = (patient?.name ?? "").trim().split(/\s+/)[0];
  const pid = patient?.id ?? "";
  const { data: mine } = useQuery(["appointments", "mine", pid], () => listMine(pid), { enabled: !!pid });
  const { data: notes } = useQuery(["notifications", pid], () => listMyNotifications(pid), { enabled: !!pid });
  const unread = (notes ?? []).some((n) => !n.read_at);
  const now = Date.now();
  const next = (mine ?? []).filter((a) => ACTIVE.includes(a.status) && new Date(a.starts_at).getTime() + a.minutes * 60000 > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
  const spec = team?.[0];
  const { data: catData } = useQuery(["catalog", "categories"], () => listCategories());
  const [hcat, setHcat] = useState<string | null>(null);
  const cats = (catData ?? []).filter((c) => (services ?? []).some((s) => s.category_id === c.key));
  const curCat = (hcat && cats.some((c) => c.key === hcat) ? hcat : null) ?? cats.find((c) => c.key !== "consult")?.key ?? cats[0]?.key ?? null;
  const cards = (services ?? []).filter((s) => !curCat || s.category_id === curCat);
  return (
    <PhoneScreen tab="الرئيسية" padding="0" gap={0}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(env(safe-area-inset-top, 0px) + 22px) 22px 16px", position: "relative" }}>
        <span className={phoneOnly}><Logo height={54} /></span>
        <DeskHeading title={first ? `أهلاً ${first}` : "أهلاً بكِ"} sub="بشرتكِ تستحق يوماً جميلاً" />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <IconButton icon="msg" label="الرسائل" size={48} href={R.P_Chat} />
          <IconButton icon="bell" label={unread ? "الإشعارات (جديدة)" : "الإشعارات"} size={48} href={R.Notifications} badge={unread} />
          <Link href={R.Account} aria-label="حسابي" style={{
            width: 48, height: 48, borderRadius: 24, border: "2px solid #FFFFFF", background: "linear-gradient(145deg, #EEDBF2, #DABBE1)",
            boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="user" color={C.accent} size={20} />
          </Link>
        </div>
      </header>

      <p className={phoneOnly} style={{ margin: 0, padding: "0 22px 6px", fontSize: 15, color: C.sub, position: "relative" }}>{first ? `أهلاً ${first}، ` : "أهلاً بكِ، "}بشرتكِ تستحق يوماً جميلاً</p>
      {guest && <div className={phoneOnly} style={{ margin: "8px 22px 0", position: "relative" }}><GuestPill /></div>}
      {next && (
        <Link href={`${R.P_AppointmentDetail}?id=${next.id}`} style={{ ...DARK, margin: "10px 22px 0", borderRadius: 26, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, position: "relative", boxShadow: "0 14px 30px rgba(123,70,135,0.30)" }}>
          <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="cal" color="#FFFFFF" size={21} />
          </span>
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.45 }}>
            <div style={{ fontSize: 12, color: C.onDark }}>موعدكِ القادم · {STATUS_LABEL[next.status]}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.white, overflowWrap: "anywhere" }}>{next.service?.short_name || next.service?.name || "جلسة"}</div>
            <div style={{ fontSize: 12.5, color: C.onDark }}>{arDate(new Date(next.starts_at))} · <span className="latin">{clock(next.starts_at)}</span></div>
          </div>
          <Icon name="arrow" color="#FFFFFF" size={16} stroke={2} />
        </Link>
      )}
      <InstallPrompt style={{ margin: "10px 22px 0" }} />

      <div className={hm.hero} style={{ display: "flex", gap: 12, padding: "10px 22px 20px", overflowX: "auto", position: "relative" }}>
        {(team ?? []).map((spec) => (
        <div key={spec.id} style={{ width: 214, height: 214, flexShrink: 0, borderRadius: 30, background: "#EAD7EE", position: "relative", overflow: "hidden", boxShadow: SH }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {spec.photo_url && <img src={staffPhoto(spec) ?? spec.photo_url} alt={spec.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />}
          <div style={{ ...GLASS, position: "absolute", bottom: 10, left: 10, right: 10, borderRadius: 22, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{spec.name}</div>
              <div style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{spec.title || "أخصائية عناية بالبشرة"}</div>
            </div>
            <Link href={R.Booking} aria-label={`احجزي مع ${spec.name}`} style={{ ...DARK, width: 42, height: 42, flexShrink: 0, borderRadius: 21, boxShadow: "0 8px 18px rgba(123,70,135,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="arrow" color="#FFFFFF" size={16} stroke={2} />
            </Link>
          </div>
        </div>
        ))}
        <Link href={R.Consult} style={{
          width: spec ? 214 : "100%", height: spec ? 214 : 150, flexShrink: 0, borderRadius: 30, background: "linear-gradient(160deg, #FFFFFF 0%, #FAF3FB 100%)",
          border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <span style={{ boxShadow: "0 6px 14px rgba(150,100,170,0.18)", borderRadius: 26, width: 52 }}><Circ icon="cam" size={52} iconSize={24} /></span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>استشارة أونلاين</div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>جلسة فيديو مع الأخصائية وأنتِ في بيتكِ</div>
          </div>
        </Link>
      </div>

      <section className={hm.sheet} style={{
        flexGrow: 1, background: C.white, borderRadius: "38px 38px 0 0", padding: "12px 22px calc(env(safe-area-inset-bottom, 0px) + 104px)",
        display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 -14px 34px rgba(123,70,135,0.08)",
      }}>
        <div aria-hidden className={hm.grab} style={{ width: 44, height: 4, borderRadius: 2, background: "#DFC9E4", alignSelf: "center", marginBottom: 16 }} />
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
        <>
        {cats.length > 1 && (
          <div role="tablist" aria-label="فئات الخدمات" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "-6px -22px 14px", padding: "2px 22px 6px" }}>
            {cats.map((c) => {
              const on = c.key === curCat;
              return (
                <button key={c.key} type="button" role="tab" aria-selected={on} onClick={() => setHcat(c.key)} style={{
                  flexShrink: 0, height: 38, padding: "0 14px", borderRadius: 19, whiteSpace: "nowrap", fontSize: 13, fontWeight: on ? 700 : 600,
                  display: "inline-flex", alignItems: "center", gap: 6,
                  border: `1px solid ${on ? "#FFFFFF" : "#EEE4F1"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.white,
                  color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.24)" : "0 4px 12px rgba(123,70,135,0.06)",
                }}><Icon name={c.icon} size={15} color={on ? C.accent : C.muted} />{c.name}</button>
              );
            })}
          </div>
        )}
        <div className={hm.grid} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
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
        </>
        )}
      </section>
    </PhoneScreen>
  );
}
