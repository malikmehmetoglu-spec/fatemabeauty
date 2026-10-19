"use client";

/**
 * W_Products.dc.html — المنتجات (live). The retail items of the same inventory:
 * show/hide in the store, specialist recommendation, price and stock. Editing reuses the inventory dialog.
 */
import { arError } from "@/lib/arError";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Tag, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { isLow, listInventory, productImage, setRecommended, setShowInStore, type Product } from "@/lib/db/products";
import { ProductDialog, ReceiveDialog, useLocations } from "@/app/admin/inventory/dialogs";
import css from "@/app/admin/inventory/inventory.module.css";

type Filter = "all" | "shown" | "hidden" | "rec" | "out";

export default function Page() {
  const { data, loading, error } = useQuery(["products", "inventory"], listInventory);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [receiving, setReceiving] = useState<Product | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  // the store sells only from the locations that feed it
  const L = useLocations();
  const feeds = L.active.filter((l) => l.sells_online);
  const onl = (p: Product) => (L.multi ? feeds.reduce((s, l) => s + Number(L.map?.[p.key]?.[l.id] ?? 0), 0) : Number(p.stock));

  const list = useMemo(() => (data ?? []).filter((p) => p.kind === "retail"), [data]);
  const shown = list.filter((p) => {
    const needle = q.trim().toLowerCase();
    if (needle && ![p.name, p.category, p.sku ?? ""].some((t) => t.toLowerCase().includes(needle))) return false;
    if (filter === "shown") return p.show_in_store;
    if (filter === "hidden") return !p.show_in_store;
    if (filter === "rec") return p.recommended;
    if (filter === "out") return onl(p) <= 0;
    return true;
  });

  async function run(key: string, f: () => Promise<void>) {
    setBusy(key); setErr("");
    try { await f(); } catch (e) { setErr(arError(e)); } finally { setBusy(null); }
  }

  return (
    <AdminShell active="المتجر" title="المنتجات" subtitle="منتجات البيع من المخزون نفسه — تظهر في متجر التطبيق ما لم تُخفَ"
      actions={<>
        <Link href={R.W_Orders} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: C.white, color: C.accent, boxShadow: "0 6px 18px rgba(123,70,135,0.12)" }}>
          <Icon name="truck" color={C.accent} size={16} />الطلبات
        </Link>
        <GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة منتج</GhostButton>
      </>}>
      <div className="adm-row">
        <Kpi dark label="منتجات البيع" value={list.length} sub="في المخزون" icon="bag" />
        <Kpi label="ظاهرة في المتجر" value={list.filter((p) => p.show_in_store).length} sub="تراها المراجِعات الآن" icon="eye" />
        <Kpi label="توصية الأخصائية" value={list.filter((p) => p.recommended).length} sub="تظهر بشارة في المتجر" icon="sparkle" />
        <Kpi label="نفدت الكمية" value={list.filter((p) => onl(p) <= 0).length} sub="تظهر «غير متوفر حالياً»" icon="alert" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {([["all", "الكل"], ["shown", "ظاهرة"], ["hidden", "مخفية"], ["rec", "موصى بها"], ["out", "نفدت"]] as [Filter, string][]).map(([k, t]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{t}</Chip>
        ))}
        <input aria-label="بحث في المنتجات" placeholder="ابحثي باسم المنتج أو الفئة" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ marginInlineStart: "auto", height: 40, width: "min(260px, 100%)", boxSizing: "border-box", borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 16px", fontSize: 13.5 }} />
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المنتجات: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="bag" title="لا منتجات للبيع بعد"
          text="أضيفي منتجاً للبيع مع سعره وصورته وكميته؛ يظهر في متجر التطبيق تلقائياً ويُخصم من المخزون عند كل طلب."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة منتج</GhostButton>} />
      ) : shown.length === 0 ? <EmptyState compact icon="search" title="لا منتجات تطابق هذا الاختيار" /> : (
        <>
        <div className={css.cards}>
          {shown.map((p) => {
            const img = productImage(p);
            const stock = onl(p);
            return (
              <article key={p.key} className={css.card}>
                <div className={css.head}>
                  <span style={{ width: 48, height: 48, borderRadius: 15, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="bottle" size={20} />}
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: 0, flex: 1 }}>
                    <button type="button" onClick={() => setEditing(p)} style={{ border: "none", background: "none", padding: 0, fontSize: 14.5, fontWeight: 700, color: C.ink, textAlign: "right" }}>{p.name}</button>
                    <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size].filter(Boolean).join(" · ") || "—"}</div>
                  </div>
                  {p.price != null ? <b className="latin">{money(p.price)}</b> : <Tag kind="pink">بلا سعر</Tag>}
                </div>
                <div className={css.meta}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <b className="latin" style={{ color: stock <= 0 ? C.danger : C.ink }}>{stock.toLocaleString("en-US")}</b>
                    <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}</span>
                    {stock <= 0 ? <Tag kind="pink">نفد</Tag> : isLow(p) && <Tag kind="amber">منخفض</Tag>}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, marginInlineStart: "auto", fontSize: 12.5, color: C.sub2 }}>
                    في المتجر <Toggle on={p.show_in_store} label={`إظهار ${p.name} في المتجر`} onChange={() => busy !== p.key && run(p.key, () => setShowInStore(p.key, !p.show_in_store))} />
                  </span>
                </div>
                <div className={css.actions}>
                  <button type="button" aria-pressed={p.recommended} onClick={() => busy !== p.key && run(p.key, () => setRecommended(p.key, !p.recommended))} style={{
                    height: 34, padding: "0 12px", borderRadius: 17, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: p.recommended ? "#A86A12" : C.sub2,
                    border: `1px solid ${p.recommended ? "#FFFFFF" : "#EADCF0"}`, background: p.recommended ? "linear-gradient(160deg,#FFF3DC,#F6D9A0)" : C.white,
                  }}><Icon name="star" color={p.recommended ? "#D98F26" : "#D2C3D5"} size={14} />{p.recommended ? "موصى به" : "توصية"}</button>
                  <RowBtn icon="plus" label="استلام" onClick={() => setReceiving(p)} />
                  <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(p)} />
                </div>
              </article>
            );
          })}
        </div>
        <div className={css.table}>
        <DataTable minWidth={880}
          headers={["المنتج", "السعر", "الكمية", "في المتجر", "توصية", ""]}
          widths={[2.6, 1, 1.3, 0.8, 0.7, 1.4]}
          rowHeight={64}
          rows={shown.map((p) => {
            const img = productImage(p);
            const stock = onl(p);
            return [
              <>
                <span style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="bottle" size={20} />}
                </span>
                <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                  <button type="button" onClick={() => setEditing(p)} style={{ border: "none", background: "none", padding: 0, fontSize: 14, fontWeight: 700, color: C.ink, textAlign: "right" }}>{p.name}</button>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size].filter(Boolean).join(" · ") || "—"}</div>
                </div>
              </>,
              p.price != null ? <b key="p" className="latin">{money(p.price)}</b> : <Tag key="p" kind="pink">بلا سعر</Tag>,
              <span key="s" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <b className="latin" style={{ color: stock <= 0 ? C.danger : C.ink }}>{stock.toLocaleString("en-US")}</b>
                <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}</span>
                {stock <= 0 ? <Tag kind="pink">نفد</Tag> : isLow(p) && <Tag kind="amber">منخفض</Tag>}
              </span>,
              <Toggle key="v" on={p.show_in_store} label={`إظهار ${p.name} في المتجر`} onChange={() => busy !== p.key && run(p.key, () => setShowInStore(p.key, !p.show_in_store))} />,
              <button key="r" type="button" aria-pressed={p.recommended} title="توصية الأخصائية" onClick={() => busy !== p.key && run(p.key, () => setRecommended(p.key, !p.recommended))} style={{
                width: 34, height: 34, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${p.recommended ? "#FFFFFF" : "#EADCF0"}`, background: p.recommended ? "linear-gradient(160deg,#FFF3DC,#F6D9A0)" : C.white,
              }}><Icon name="star" color={p.recommended ? "#D98F26" : "#D2C3D5"} size={16} /></button>,
              <span key="a" style={{ display: "flex", gap: 6, flexWrap: "nowrap", marginInlineStart: "auto" }}>
                <RowBtn icon="plus" label="استلام" onClick={() => setReceiving(p)} />
                <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(p)} />
              </span>,
            ];
          })}
        />
        </div>
        </>
      )}

      <ProductDialog open={!!editing} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      <ReceiveDialog product={receiving} onClose={() => setReceiving(null)} />
    </AdminShell>
  );
}

function RowBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color: C.accent, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0 }}>
      <Icon name={icon} color={C.accent} size={14} stroke={2} />{label}
    </button>
  );
}
