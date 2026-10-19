"use client";

/** «طلباتي» and order tracking on tablets/desktop (≥768px), inside the store chrome. Phones keep the PhoneScreen layout. */
import Link from "next/link";
import type { ReactNode } from "react";
import { EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { orderSteps, STATUS_LABEL, itemsLabel, type OrderFull } from "@/lib/db/orders";
import { StoreChrome } from "../../store/desk/StoreChrome";
import d from "../../store/desk/desk.module.css";
import o_ from "./orders.module.css";

export const TAG: Record<string, "lilac" | "amber" | "green" | "gray" | "pink"> = {
  new: "lilac", preparing: "amber", ready: "green", out_for_delivery: "amber", delivered: "gray", cancelled: "pink",
};

/** Index of the current step (steps.length when delivered, -1 when cancelled). */
export function stepIndex(o: Pick<OrderFull, "status" | "delivery">) {
  const steps = orderSteps(o.delivery);
  if (o.status === "cancelled") return -1;
  if (o.status === "delivered") return steps.length;
  return Math.max(0, steps.findIndex((s) => s.s === o.status));
}

function Crumbs({ here, mid }: { here: string; mid?: boolean }) {
  return (
    <nav aria-label="مسار الصفحة" className={d.crumbs}>
      <Link href={R.P_Store}>المتجر</Link><Icon name="fwd" color={C.muted} size={14} />
      {mid && <><Link href={R.P_OrderTrack}>طلباتي</Link><Icon name="fwd" color={C.muted} size={14} /></>}
      <span aria-current="page">{here}</span>
    </nav>
  );
}

export function DeskShell({ title, sub, mid, children }: { title: string; sub?: ReactNode; mid?: boolean; children: ReactNode }) {
  return (
    <StoreChrome>
      <Crumbs here={title} mid={mid} />
      <div className={d.pageHead}>
        <div>
          <h1 className={d.h1}>{title}</h1>
          {sub && <div className={d.secSub}>{sub}</div>}
        </div>
      </div>
      {children}
    </StoreChrome>
  );
}

/** Horizontal status timeline. */
export function Timeline({ o, big = false }: { o: Pick<OrderFull, "status" | "delivery">; big?: boolean }) {
  const steps = orderSteps(o.delivery);
  const cur = stepIndex(o);
  return (
    <ol className={`${o_.tl} ${big ? o_.tlBig : ""}`} aria-label="مراحل الطلب">
      {steps.map((s, i) => {
        const done = i < cur || (i === steps.length - 1 && cur === steps.length);
        const now = i === cur;
        return (
          <li key={s.title} className={`${done ? o_.done : ""} ${now ? o_.now : ""}`} aria-current={now ? "step" : undefined}>
            <span className={o_.dot}>{done && <Icon name="check" color="#FFFFFF" size={big ? 16 : 12} stroke={2.6} />}</span>
            <b>{s.title}</b>
            {big && <small>{s.sub}</small>}
          </li>
        );
      })}
    </ol>
  );
}

type Row = OrderFull;
export function DeskOrderList({ data, loading, error }: { data?: Row[] | null; loading: boolean; error?: string | null }) {
  return (
    <DeskShell title="طلباتي" sub={data?.length ? `${data.length === 1 ? "طلب واحد" : data.length === 2 ? "طلبان" : `${data.length} طلبات`} · تابعي حالة كل طلب خطوة بخطوة` : "كل طلباتكِ من المتجر وحالتها"}>
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الطلبات: {error}</ErrorNote> : !data?.length ? (
        <div className={d.empty}>
          <Icon name="box" color={C.accentMid} size={34} />
          <h3>لا طلبات بعد</h3>
          <p>حين تطلبين منتجات من المتجر ستظهر طلباتكِ هنا مع حالة كل طلب.</p>
          <Link href={R.P_Store} className={d.btn}><Icon name="bag" color="#FFFFFF" size={18} />تسوّقي الآن</Link>
        </div>
      ) : (
        <div className={o_.list}>
          {data.map((o) => {
            const qty = o.order_items.reduce((s, i) => s + Number(i.qty), 0);
            return (
              <Link key={o.id} href={`${R.P_OrderTrack}?id=${o.id}`} className={o_.card}>
                <div className={o_.cardHead}>
                  <span className={o_.cardIcon}><Icon name="box" color={C.accent} size={22} /></span>
                  <div className={o_.cardTitle}>
                    <b>طلب <span className="latin">#{o.no}</span></b>
                    <small>{arDate(new Date(o.created_at))} · {itemsLabel(qty)} · {o.delivery ? "توصيل للمنزل" : "استلام من المركز"}</small>
                  </div>
                  <Tag kind={TAG[o.status]}>{STATUS_LABEL[o.status]}</Tag>
                </div>
                {o.status === "cancelled"
                  ? <div className={o_.cancelNote}>أُلغي هذا الطلب وأُعيدت المنتجات إلى المخزون.</div>
                  : <Timeline o={o} />}
                <div className={o_.cardFoot}>
                  <span className={o_.names}>{o.order_items.slice(0, 3).map((i) => i.name).join("، ")}{o.order_items.length > 3 ? "…" : ""}</span>
                  <span className={o_.total}><span className="latin">{money(o.total, false)}</span> ل.س</span>
                  <span className={o_.more}>تفاصيل الطلب<Icon name="fwd" color={C.accent} size={15} stroke={2} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DeskShell>
  );
}

export function DeskTrack({ o, error, busy, onCancel }: { o: OrderFull; error: string; busy: boolean; onCancel: () => void }) {
  const cancelled = o.status === "cancelled";
  return (
    <DeskShell mid title={`طلب رقم ${o.no}`} sub={<>{arDate(new Date(o.created_at))} · <span className="latin">{clock(o.created_at)}</span> · {o.delivery ? "توصيل للمنزل" : "استلام من المركز"}</>}>
      <div className={d.two}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
          <section className={`${d.panel} ${d.panelPad}`}>
            <h2 className={d.panelTitle}><Icon name="truck" color={C.accentMid} size={20} />حالة الطلب
              <span style={{ marginInlineStart: "auto" }}><Tag kind={TAG[o.status]}>{STATUS_LABEL[o.status]}</Tag></span>
            </h2>
            {cancelled
              ? <EmptyState compact icon="x" title="أُلغي هذا الطلب" text="أُعيدت المنتجات إلى المخزون. يمكنكِ الطلب من جديد في أي وقت." />
              : <Timeline o={o} big />}
          </section>
          <section className={`${d.panel} ${d.panelPad}`}>
            <h2 className={d.panelTitle}><Icon name="bag" color={C.accentMid} size={20} />المنتجات</h2>
            <div>
              {o.order_items.map((it, i) => (
                <div key={it.id} className={o_.item} style={{ borderTop: i ? `1px solid ${C.line}` : undefined }}>
                  <span className={o_.itemPic}><Icon name="bottle" color={C.accentMid} size={20} /></span>
                  <span className={o_.itemName}>{it.name}</span>
                  <span className="latin" style={{ fontSize: 14, color: C.sub2 }}>×{it.qty}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className={d.summary}>
          <h2 className={d.panelTitle}>ملخّص الطلب</h2>
          <div className={d.sumRow}><span>رقم الطلب</span><b className="latin">#{o.no}</b></div>
          <div className={d.sumRow}><span>طريقة الاستلام</span><b>{o.delivery ? "توصيل للمنزل" : "استلام من المركز"}</b></div>
          {o.address && <div className={d.sumRow} style={{ alignItems: "flex-start" }}><span>العنوان</span><b style={{ textAlign: "left" }}>{o.address}</b></div>}
          <div className={d.sumRow}><span>الدفع</span><b>نقداً عند الاستلام</b></div>
          <div className={d.sumTotal}><span>المجموع</span><span className={d.price}><span className="latin">{money(o.total, false)}</span> <span className={d.cur}>ل.س</span></span></div>
          {o.delivery && <div className={d.sumHint}>تُضاف أجرة التوصيل عند التسليم.</div>}
          {error && <ErrorNote>{error}</ErrorNote>}
          {o.status === "new" && (
            <button type="button" className={d.btnGhost} style={{ color: C.danger }} onClick={busy ? undefined : onCancel}>
              <Icon name="x" color={C.danger} size={18} />{busy ? "جارٍ الإلغاء…" : "إلغاء الطلب"}
            </button>
          )}
          <Link href={R.P_Chat} className={d.btnGhost}><Icon name="msg" color={C.accent} size={18} />تواصلي مع المركز</Link>
          <Link href={R.P_OrderTrack} className={d.linkBtn} style={{ textAlign: "center" }}>كل طلباتي</Link>
        </aside>
      </div>
    </DeskShell>
  );
}
