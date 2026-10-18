"use client";

/** W_Orders.dc.html — الطلبات والتوصيل (live board: new → preparing → ready / out for delivery → delivered). */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, EmptyState, ErrorNote, Icon, Kpi, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listOrders, nextStatus, setOrderStatus, STATUS_LABEL, type OrderFull, type OrderStatus } from "@/lib/db/orders";

type F = "all" | "d" | "p" | "cancelled";
const COLS: { title: string; has: OrderStatus[]; icon: string }[] = [
  { title: "طلبات جديدة", has: ["new"], icon: "bell" },
  { title: "قيد التجهيز", has: ["preparing"], icon: "box" },
  { title: "جاهز / خرج للتوصيل", has: ["ready", "out_for_delivery"], icon: "truck" },
  { title: "سُلِّمت", has: ["delivered"], icon: "check" },
];
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  preparing: "بدء التجهيز", ready: "جاهز للاستلام", out_for_delivery: "خرج للتوصيل", delivered: "تم التسليم",
};

export default function Page() {
  const { data, loading, error } = useQuery(["orders", "all"], listOrders);
  const [f, setF] = useState<F>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const all = data ?? [];
  const list = all.filter((o) => (f === "cancelled" ? o.status === "cancelled" : o.status !== "cancelled" && (f === "all" || (f === "d") === o.delivery)));
  const open = all.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const today = dayKey();
  const deliveredToday = all.filter((o) => o.status === "delivered" && dayKey(new Date(o.created_at)) === today);

  async function move(o: OrderFull, s: OrderStatus) {
    if (s === "cancelled" && !confirm(`إلغاء الطلب #${o.no}؟ تعود المنتجات إلى المخزون.`)) return;
    setBusy(o.id); setErr("");
    try { await setOrderStatus(o.id, s); } catch (e) { setErr("تعذّر تحديث الطلب: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(null); }
  }

  return (
    <AdminShell active="المتجر" title="الطلبات والتوصيل" subtitle="طلبات متجر التطبيق — توصيل للمنزل أو استلام من المركز"
      actions={<Link href={R.W_Products} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: C.white, color: C.accent, boxShadow: "0 6px 18px rgba(123,70,135,0.12)" }}>
        <Icon name="bag" color={C.accent} size={16} />المنتجات
      </Link>}>
      <div style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="طلبات قيد العمل" value={open.length} sub="لم تُسلَّم بعد" icon="bag" />
        <Kpi label="توصيل للمنزل" value={open.filter((o) => o.delivery).length} sub="من الطلبات المفتوحة" icon="truck" />
        <Kpi label="استلام من المركز" value={open.filter((o) => !o.delivery).length} sub="من الطلبات المفتوحة" icon="home" />
        <Kpi label="قيمة الطلبات المفتوحة" value={money(open.reduce((s, o) => s + o.total, 0))} sub={`سُلِّم اليوم: ${deliveredToday.length}`} icon="wallet" />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {([["all", "كل الطلبات"], ["d", "توصيل للمنزل"], ["p", "استلام من المركز"], ["cancelled", "الملغاة"]] as [F, string][]).map(([k, t]) => (
          <Chip key={k} selected={f === k} height={36} onClick={() => setF(k)}>{t}</Chip>
        ))}
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الطلبات: {error}</ErrorNote> : all.length === 0 ? (
        <EmptyState icon="bag" title="لا طلبات بعد"
          text="حين تطلب مراجِعة منتجات من متجر التطبيق يظهر طلبها هنا فوراً، وتُخصم الكميات من المخزون. تأكّدي أن المنتجات ظاهرة في المتجر ولها أسعار."
          action={<Link href={R.W_Products} style={{ color: C.accent, fontWeight: 700 }}>إدارة المنتجات</Link>} />
      ) : f === "cancelled" ? (
        list.length === 0 ? <EmptyState compact icon="check" title="لا طلبات ملغاة" /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {list.map((o) => <OrderCard key={o.id} o={o} busy={busy === o.id} onMove={move} />)}
          </div>
        )
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, alignItems: "start" }}>
          {COLS.map((c) => {
            const items = list.filter((o) => c.has.includes(o.status));
            const shown = c.has.includes("delivered") ? items.slice(0, 12) : items;
            return (
              <section key={c.title} style={{ borderRadius: 26, padding: 12, background: "rgba(255,255,255,0.5)", border: "1px solid #F0E6F3", display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                <header style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
                  <Icon name={c.icon} color={C.accentMid} size={17} />
                  <h2 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, flex: 1 }}>{c.title}</h2>
                  <span className="latin" style={{ minWidth: 24, height: 24, borderRadius: 12, background: C.white, fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{items.length}</span>
                </header>
                {shown.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted, padding: "14px 6px", textAlign: "center" }}>لا طلبات</div>
                  : shown.map((o) => <OrderCard key={o.id} o={o} busy={busy === o.id} onMove={move} />)}
                {shown.length < items.length && <div style={{ fontSize: 12, color: C.sub2, textAlign: "center" }}>وأقدم {items.length - shown.length} طلبات</div>}
              </section>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function OrderCard({ o, busy, onMove }: { o: OrderFull; busy: boolean; onMove: (o: OrderFull, s: OrderStatus) => void }) {
  const next = nextStatus(o);
  const d = new Date(o.created_at);
  return (
    <article style={{ ...CARD, borderRadius: 20, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <b className="latin" style={{ fontSize: 15 }}>#{o.no}</b>
        <span style={{ height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", ...(o.delivery ? { background: "#F3EAF6", color: "#B03D6A" } : { background: "#E6F4EC", color: "#2E7D50" }) }}>{o.delivery ? "توصيل" : "استلام"}</span>
      </div>
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.patients?.name ?? "مراجِعة"}{o.patients && <span className="latin" style={{ fontSize: 11.5, color: C.sub2, fontWeight: 500 }}> · ملف {o.patients.file_no}</span>}</div>
        {o.patients?.phone && <div className="latin" dir="ltr" style={{ fontSize: 12, color: C.sub2, textAlign: "right" }}>{o.patients.phone}</div>}
        <div style={{ fontSize: 11.5, color: C.muted }}>{dayKey(d) === dayKey() ? "اليوم" : arDate(d)} · <span className="latin">{clock(d)}</span></div>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: 12.5, color: C.sub }}>
        {o.order_items.map((it) => <li key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}><span>{it.name}</span><span className="latin">×{it.qty}</span></li>)}
      </ul>
      {o.address && <div style={{ fontSize: 12, color: C.sub2, background: "#F8F2FA", borderRadius: 12, padding: "6px 10px" }}>{o.address}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <b className="latin" style={{ color: C.accent }}>{money(o.total)}</b>
        {o.status === "cancelled" && <Tag kind="pink">{STATUS_LABEL.cancelled}</Tag>}
      </div>
      {o.status !== "cancelled" && o.status !== "delivered" && (
        <div style={{ display: "flex", gap: 6 }}>
          {next && <button type="button" disabled={busy} onClick={() => onMove(o, next)} style={{ flex: 1, height: 34, borderRadius: 17, border: "none", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", color: C.white, fontSize: 12.5, fontWeight: 700 }}>{NEXT_LABEL[next]}</button>}
          <button type="button" disabled={busy} onClick={() => onMove(o, "cancelled")} title="إلغاء الطلب وإعادة المنتجات للمخزون" style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #EADCF0", background: C.white, color: C.danger, fontSize: 12.5, fontWeight: 600 }}>إلغاء</button>
        </div>
      )}
    </article>
  );
}
