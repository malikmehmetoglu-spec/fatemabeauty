"use client";

/**
 * المخزون — one inventory for the centre (live, Supabase).
 * Retail items appear in the store automatically; each can be hidden from the store.
 * Consumables (used in sessions) never appear in the store.
 */
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Toggle, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { isLow, listExpiring, listInventory, productImage, setShowInStore, type Product } from "@/lib/db/products";
import { money, arDate } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { ProductDialog, ReceiveDialog, AdjustDialog } from "./dialogs";

type Filter = "all" | "retail" | "consumable" | "low" | "hidden";

export default function InventoryPage() {
  const { data: items, loading, error } = useQuery(["products", "inventory"], listInventory);
  const { data: expiring } = useQuery(["products", "expiring"], () => listExpiring(60));
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [receiving, setReceiving] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const list = items ?? [];
  const stats = useMemo(() => ({
    total: list.length,
    retail: list.filter((p) => p.kind === "retail").length,
    inStore: list.filter((p) => p.kind === "retail" && p.show_in_store).length,
    low: list.filter(isLow).length,
    value: list.reduce((s, p) => s + Number(p.stock) * (p.cost ?? 0), 0),
  }), [list]);

  const shown = list.filter((p) => {
    if (q && !p.name.includes(q) && !(p.sku ?? "").includes(q)) return false;
    if (filter === "retail") return p.kind === "retail";
    if (filter === "consumable") return p.kind === "consumable";
    if (filter === "low") return isLow(p);
    if (filter === "hidden") return p.kind === "retail" && !p.show_in_store;
    return true;
  });

  const toggleStore = async (p: Product) => {
    setBusyKey(p.key);
    try { await setShowInStore(p.key, !p.show_in_store); } finally { setBusyKey(null); }
  };

  return (
    <AdminShell active="المخزون والأجهزة" title="المخزون" subtitle="كل ما في المركز: منتجات البيع تظهر في المتجر تلقائياً، ومواد الجلسات لا تظهر"
      actions={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة صنف</GhostButton>}>
      <div style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="الأصناف" value={stats.total} sub={`${stats.retail} للبيع · ${stats.total - stats.retail} للجلسات`} icon="box" />
        <Kpi label="ظاهرة في المتجر" value={stats.inStore} sub={`من ${stats.retail} منتج بيع`} icon="bag" />
        <Kpi label="تحتاج إعادة طلب" value={stats.low} sub="وصلت إلى الحد الأدنى أو أقل" icon="alert" />
        <Kpi label="قيمة المخزون" value={money(stats.value)} sub="بسعر الكلفة المسجّل" icon="wallet" />
      </div>

      {!!expiring?.length && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "12px 16px", background: "#FCF1DE", color: "#8A5A12" }}>
          <Icon name="clock" color="#8A5A12" size={20} />
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>
            {expiring.length} دفعة تنتهي صلاحيتها خلال 60 يوماً — أقربها: {(expiring[0] as unknown as { products: { name: string } }).products?.name} ({arDate(new Date(expiring[0].expires_on as string), { day: false, year: true })})
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {([["all", "الكل"], ["retail", "منتجات البيع"], ["consumable", "مواد الجلسات"], ["low", "تحتاج إعادة طلب"], ["hidden", "مخفية من المتجر"]] as [Filter, string][]).map(([k, t]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{t}</Chip>
        ))}
        <input aria-label="بحث في المخزون" placeholder="ابحثي باسم الصنف أو الرمز" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ marginInlineStart: "auto", height: 40, width: 260, borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 16px", fontSize: 13.5 }} />
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المخزون: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="box" title="المخزون فارغ"
          text="أضيفي أول صنف: منتج للبيع (يظهر في المتجر تلقائياً) أو مادة تُستهلك في الجلسات. يمكنكِ إدخال الكمية الأولى وتاريخ الصلاحية مباشرة."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة صنف</GhostButton>} />
      ) : shown.length === 0 ? (
        <EmptyState compact icon="search" title="لا أصناف تطابق هذا الاختيار" />
      ) : (
        <DataTable
          headers={["الصنف", "النوع", "الكمية", "سعر البيع", "في المتجر", ""]}
          widths={[2.6, 1, 1.2, 1, 0.9, 1.6]}
          rowHeight={64}
          rows={shown.map((p) => {
            const img = productImage(p);
            const low = isLow(p);
            return [
              <>
                <span style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name={p.kind === "retail" ? "bottle" : "box"} size={20} />}
                </span>
                <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                  <button type="button" onClick={() => setEditing(p)} style={{ border: "none", background: "none", padding: 0, fontSize: 14, fontWeight: 700, color: C.ink, textAlign: "right" }}>{p.name}</button>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size, p.sku].filter(Boolean).join(" · ") || "—"}</div>
                </div>
              </>,
              <Tag key="k" kind={p.kind === "retail" ? "lilac" : "gray"}>{p.kind === "retail" ? "للبيع" : "للجلسات"}</Tag>,
              <span key="s" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <b className="latin" style={{ fontSize: 15, color: low ? C.danger : C.ink }}>{Number(p.stock).toLocaleString("en-US")}</b>
                <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}</span>
                {low && <Tag kind="pink">منخفض</Tag>}
              </span>,
              p.kind === "retail" ? (p.price != null ? money(p.price) : <span style={{ color: C.muted }}>بلا سعر</span>) : <span style={{ color: C.muted }}>—</span>,
              p.kind === "retail"
                ? <Toggle key="t" on={p.show_in_store} label={`إظهار ${p.name} في المتجر`} onChange={() => busyKey !== p.key && toggleStore(p)} />
                : <span style={{ fontSize: 12, color: C.muted }}>لا يظهر</span>,
              <span key="a" style={{ display: "flex", gap: 6 }}>
                <RowBtn icon="plus" label="استلام" onClick={() => setReceiving(p)} />
                <RowBtn icon="clip" label="جرد" onClick={() => setAdjusting(p)} />
                <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(p)} />
              </span>,
            ];
          })}
        />
      )}

      <ProductDialog open={!!editing} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      <ReceiveDialog product={receiving} onClose={() => setReceiving(null)} />
      <AdjustDialog product={adjusting} onClose={() => setAdjusting(null)} />
    </AdminShell>
  );
}

function RowBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: `1px solid #EADCF0`, background: C.white, fontSize: 12.5, fontWeight: 600, color: C.accent, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <Icon name={icon} color={C.accent} size={14} stroke={2} />{label}
    </button>
  );
}
