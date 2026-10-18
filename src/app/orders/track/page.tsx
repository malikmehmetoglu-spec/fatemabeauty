"use client";

/**
 * P_OrderTrack.dc.html — order tracking timeline (live).
 * ?id=<order id> shows one order; without it the page lists the patient's orders («طلباتي»).
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkCard, DoneDot, EmptyState, ErrorNote, Icon, Loading, SecondaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, money } from "@/lib/format";
import { C, CARD, SHB } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { cancelOrder, getOrder, listMyOrders, orderSteps, STATUS_LABEL, type OrderFull } from "@/lib/db/orders";
import { useRequirePatient } from "@/lib/supabase/session";

export default function OrderTrackPage() {
  return <Suspense fallback={<PhoneScreen><Loading /></PhoneScreen>}><Router /></Suspense>;
}

function Router() {
  const id = useSearchParams().get("id");
  const s = useRequirePatient();
  if (s.loading || (!s.patient && !s.staff)) return <PhoneScreen><TopBar title="طلباتي" back={R.P_Store} /><Loading /></PhoneScreen>;
  return id ? <Track id={id} /> : <MyOrders />;
}

const TAG: Record<string, "lilac" | "amber" | "green" | "gray" | "pink"> = {
  new: "lilac", preparing: "amber", ready: "green", out_for_delivery: "amber", delivered: "gray", cancelled: "pink",
};

function MyOrders() {
  const { data, loading, error } = useQuery(["orders", "mine"], listMyOrders);
  return (
    <PhoneScreen>
      <TopBar title="طلباتي" back={R.P_Store} />
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الطلبات: {error}</ErrorNote> : !data?.length ? (
        <EmptyState icon="box" title="لا طلبات بعد" text="حين تطلبين منتجات من المتجر ستظهر طلباتكِ هنا مع حالة كل طلب." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((o) => (
            <Link key={o.id} href={`${R.P_OrderTrack}?id=${o.id}`} style={{ ...CARD, borderRadius: 22, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="box" color={C.accent} size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>طلب <span className="latin">#{o.no}</span></div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{arDate(new Date(o.created_at))} · {o.order_items.length} منتجات · {o.delivery ? "توصيل" : "استلام"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <Tag kind={TAG[o.status]}>{STATUS_LABEL[o.status]}</Tag>
                <span className="latin" style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{money(o.total, false)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <SecondaryButton href={R.P_Store} icon="bag" style={{ marginTop: "auto", flexShrink: 0 }}>المتجر</SecondaryButton>
    </PhoneScreen>
  );
}

function Track({ id }: { id: string }) {
  const { data: o, loading, error } = useQuery(["orders", "one", id], () => getOrder(id));
  if (loading) return <PhoneScreen><TopBar title="تتبع الطلب" back={R.P_OrderTrack} /><Loading /></PhoneScreen>;
  if (error || !o) {
    return (
      <PhoneScreen>
        <TopBar title="تتبع الطلب" back={R.P_OrderTrack} />
        {error ? <ErrorNote>تعذّر تحميل الطلب: {error}</ErrorNote> : <EmptyState icon="box" title="الطلب غير موجود" text="تأكّدي من الرابط، أو افتحي قائمة طلباتكِ." />}
        <SecondaryButton href={R.P_OrderTrack} icon="box" style={{ marginTop: "auto" }}>طلباتي</SecondaryButton>
      </PhoneScreen>
    );
  }
  return <TrackView o={o} />;
}

function TrackView({ o }: { o: OrderFull }) {
  const steps = orderSteps(o.delivery);
  const cancelled = o.status === "cancelled";
  const current = cancelled ? -1 : o.status === "delivered" ? steps.length : Math.max(0, steps.findIndex((s) => s.s === o.status));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm("إلغاء هذا الطلب؟")) return;
    setBusy(true); setError("");
    try { await cancelOrder(o.id); } catch (e) { setError("تعذّر الإلغاء: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(false); }
  }

  return (
    <PhoneScreen>
      <TopBar title="تتبع الطلب" back={R.P_OrderTrack} />

      <DarkCard radius={30} padding="18px 20px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>رقم الطلب</div>
            <div className="latin" style={{ fontSize: 34, fontWeight: 700, direction: "ltr", textAlign: "right" }}>#{o.no}</div>
          </div>
          <span style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="box" color="#E8D6F0" size={26} stroke={1.7} />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ height: 28, padding: "0 12px", borderRadius: 14, background: C.white, color: cancelled ? C.danger : C.accent, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: cancelled ? C.danger : "#9B4FB0" }} />{STATUS_LABEL[o.status]}
          </span>
          <span style={{ fontSize: 12.5, color: C.onDark }}>{arDate(new Date(o.created_at))} · <span className="latin">{clock(o.created_at)}</span> · {o.delivery ? "توصيل للمنزل" : "استلام من المركز"}</span>
        </div>
      </DarkCard>

      {cancelled ? (
        <EmptyState compact icon="x" title="أُلغي هذا الطلب" text="أُعيدت المنتجات إلى المخزون. يمكنكِ الطلب من جديد في أي وقت." />
      ) : (
        <ol style={{ ...CARD, listStyle: "none", margin: 0, borderRadius: 24, padding: "18px 18px 12px", flexShrink: 0 }}>
          {steps.map((s, i) => {
            const done = i < current || (i === steps.length - 1 && current === steps.length), cur = i === current, last = i === steps.length - 1;
            return (
              <li key={s.title} aria-current={cur ? "step" : undefined} style={{ position: "relative", display: "flex", gap: 12, alignItems: "flex-start", height: last ? 40 : 58 }}>
                {done ? <DoneDot size={30} /> : cur ? (
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: C.white, border: `2px solid ${C.accentMid}`, boxShadow: "0 0 0 6px rgba(200,160,220,0.30)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accentMid }} />
                  </span>
                ) : (
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: C.white, border: "1.5px solid #E4D6E7", boxSizing: "border-box" }} />
                )}
                {!last && <span aria-hidden style={{ position: "absolute", top: 34, right: 14, width: 2, height: 26, borderRadius: 1, background: done ? "linear-gradient(180deg,#C9A2D8,#7B4687)" : "#E4D6E7" }} />}
                <div style={{ lineHeight: 1.35, paddingTop: 3 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: i > current ? C.muted : C.ink }}>
                    {s.title}{cur && <span style={{ fontSize: 11, fontWeight: 600, color: C.accentMid }}> · الآن</span>}
                  </div>
                  <div style={{ fontSize: 12, color: i > current ? C.muted : C.sub2 }}>{s.sub}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 2 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>المنتجات</h2>
          <div style={{ fontSize: 13, color: C.sub2 }}><span className="latin" style={{ fontWeight: 700, color: C.accent }}>{money(o.total, false)}</span> ل.س{o.delivery ? " + التوصيل" : ""}</div>
        </div>
        {o.order_items.map((it, i) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <span style={{ width: 40, height: 40, borderRadius: 14, background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F3EAF6 75%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="bottle" color={C.accentMid} size={18} />
            </span>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{it.name}</div>
            <span className="latin" style={{ fontSize: 12, color: C.sub2 }}>×{it.qty}</span>
          </div>
        ))}
        {o.address && <div style={{ fontSize: 12.5, color: C.sub2, padding: "8px 0", borderTop: `1px solid ${C.line}` }}>العنوان: {o.address}</div>}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        {o.status === "new" && <SecondaryButton icon="x" color={C.danger} onClick={busy ? undefined : cancel}>{busy ? "جارٍ الإلغاء…" : "إلغاء الطلب"}</SecondaryButton>}
        <SecondaryButton href={R.P_Chat} icon="msg">تواصلي مع المركز</SecondaryButton>
      </div>
    </PhoneScreen>
  );
}
