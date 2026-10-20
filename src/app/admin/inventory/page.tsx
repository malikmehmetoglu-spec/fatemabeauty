"use client";

/**
 * المخزون — one inventory for the centre (live, Supabase).
 * Retail items appear in the store automatically; each can be hidden from the store.
 * Consumables (used in sessions) never appear in the store.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveRefresh } from "@/lib/db/orders";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Toggle, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { isLow, KIND_ICON, listExpiring, listInventory, productImage, qtyAt, setShowInStore, stockError, type LocationKind, type Product } from "@/lib/db/products";
import { money, arDate, dayKey } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { ProductDialog, ReceiveDialog, AdjustDialog, WasteDialog, WasteItemDialog, TransferDialog, useLocations } from "./dialogs";
import css from "./inventory.module.css";

type Filter = "all" | "retail" | "consumable" | "low" | "hidden";
type WasteBatch = { id: string; product_key: string; qty_left: number; expires_on: string | null; name: string; unit: string; location?: string | null };
type ExpRow = { products?: { name: string; unit: string } | null; stock_locations?: { name: string } | null };
const expLoc = (b: unknown) => (b as ExpRow).stock_locations?.name ?? null;
const expName = (b: unknown) => (b as ExpRow).products?.name ?? "—";
const expUnit = (b: unknown) => (b as ExpRow).products?.unit ?? "";

export default function InventoryPage() {
  const inv = useQuery(["products", "inventory"], listInventory);
  const { data: items, loading, error } = inv;
  const exp = useQuery(["products", "expiring"], () => listExpiring(60));
  const expiring = exp.data;
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [receiving, setReceiving] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [wasting, setWasting] = useState<WasteBatch | null>(null);
  const [wastingItem, setWastingItem] = useState<Product | null>(null);
  const [moving, setMoving] = useState<Product | null>(null);
  const [locSel, setLocSel] = useState<string | null>(null);
  const L = useLocations();
  // Store orders, cashier sales and other devices change stock: re-read on open, on focus and every 30 s.
  const refreshAll = () => { void inv.refresh(); void exp.refresh(); void L.refresh(); };
  useLiveRefresh(refreshAll);
  const refreshRef = useRef(refreshAll);
  refreshRef.current = refreshAll;
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") refreshRef.current(); }, 30000);
    return () => clearInterval(t);
  }, []);
  const router = useRouter();
  const loc = locSel && L.all.some((l) => l.id === locSel) ? locSel : null;
  const qty = (p: Product) => qtyAt(L.map, p, loc);
  /** "المستودع 12 · المركز 3" — only the locations that hold the item. */
  const breakdown = (p: Product) => L.all.map((l) => ({ l, n: Number(L.map?.[p.key]?.[l.id] ?? 0) })).filter((x) => x.n > 0);
  const [showExp, setShowExp] = useState(false);
  const [err, setErr] = useState("");

  const list = useMemo(() => items ?? [], [items]);
  const stats = useMemo(() => ({
    total: list.length,
    retail: list.filter((p) => p.kind === "retail").length,
    inStore: list.filter((p) => p.kind === "retail" && p.show_in_store).length,
    low: list.filter(isLow).length,
    value: list.reduce((s, p) => s + qtyAt(L.map, p, loc) * (p.cost ?? 0), 0),
  }), [list, L.map, loc]);
  const locName = loc ? L.all.find((l) => l.id === loc)?.name : null;

  const expiredCount = (expiring ?? []).filter((b) => (b.expires_on as string) < dayKey()).length;
  const needle = q.trim().toLowerCase();
  const shown = list.filter((p) => {
    if (needle && ![p.name, p.sku ?? "", p.category].some((t) => t.toLowerCase().includes(needle))) return false;
    if (filter === "retail") return p.kind === "retail";
    if (filter === "consumable") return p.kind === "consumable";
    if (filter === "low") return isLow(p);
    if (filter === "hidden") return p.kind === "retail" && !p.show_in_store;
    return true;
  });

  const toggleStore = async (p: Product) => {
    setBusyKey(p.key);
    setErr("");
    try { await setShowInStore(p.key, !p.show_in_store); }
    catch (e) { setErr("تعذّر الحفظ: " + stockError(e)); }
    finally { setBusyKey(null); }
  };

  return (
    <AdminShell active="المخزون والأجهزة" title="المخزون" subtitle={L.multi ? "الكميات في كل المواقع: المستودع والمحل والمركز — منتجات البيع تظهر في المتجر من المواقع التي تغذّيه" : "كل ما في المركز: منتجات البيع تظهر في المتجر تلقائياً، ومواد الجلسات لا تظهر"}
      actions={<>
        {L.multi && <GhostButton icon="refresh" onClick={() => router.push("/admin/inventory/locations/")}>نقل بين المواقع</GhostButton>}
        <GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة صنف</GhostButton>
      </>}>
      <div className="adm-row">
        <Kpi dark label="الأصناف" value={stats.total} sub={`${stats.retail} للبيع · ${stats.total - stats.retail} للجلسات`} icon="box" />
        <Kpi label="ظاهرة في المتجر" value={stats.inStore} sub={`من ${stats.retail} منتج بيع`} icon="bag" />
        <Kpi label="تحتاج إعادة طلب" value={stats.low} sub="وصلت إلى الحد الأدنى أو أقل" icon="alert" />
        <Kpi label="قيمة المخزون" value={money(stats.value)} sub={locName ? `في «${locName}» بسعر الكلفة` : "بسعر الكلفة المسجّل"} icon="wallet" />
      </div>

      {!!expiring?.length && (
        <div style={{ borderRadius: 22, padding: "12px 16px", background: "#FCF1DE", color: "#8A5A12", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Icon name="clock" color="#8A5A12" size={20} />
            <div style={{ fontSize: 13.5, fontWeight: 600, flex: "1 1 220px" }}>
              {expiring.length} دفعة {expiredCount ? `(منها ${expiredCount} منتهية) ` : ""}تنتهي صلاحيتها خلال 60 يوماً — أقربها: {expName(expiring[0])} ({arDate(new Date(expiring[0].expires_on as string), { day: false, year: true })})
            </div>
            <button type="button" onClick={() => setShowExp((v) => !v)} style={{ border: "none", background: "rgba(255,255,255,0.7)", color: "#8A5A12", borderRadius: 16, height: 32, padding: "0 12px", fontSize: 12.5, fontWeight: 700 }}>
              {showExp ? "إخفاء الدفعات" : "عرض الدفعات"}
            </button>
          </div>
          {showExp && expiring.map((b) => {
            const past = (b.expires_on as string) < dayKey();
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "8px 12px", fontSize: 13 }}>
                <b style={{ flex: "1 1 160px", minWidth: 0 }}>{expName(b)}{L.multi && expLoc(b) ? <span style={{ fontWeight: 500, fontSize: 12, color: "#8A5A12" }}> · {expLoc(b)}</span> : null}</b>
                <span className="latin">{Number(b.qty_left)} {expUnit(b)}</span>
                <span style={{ color: past ? C.danger : "#8A5A12", fontWeight: 600 }}>{past ? "انتهت " : "تنتهي "}{arDate(new Date(b.expires_on as string), { day: false, year: true })}</span>
                <button type="button" onClick={() => setWasting({ id: b.id, product_key: b.product_key, qty_left: Number(b.qty_left), expires_on: b.expires_on, name: expName(b), unit: expUnit(b), location: expLoc(b) })}
                  style={{ border: "1px solid #EADCF0", background: C.white, color: C.danger, borderRadius: 15, height: 30, padding: "0 12px", fontSize: 12.5, fontWeight: 600 }}>إتلاف</button>
              </div>
            );
          })}
        </div>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}

      {L.all.length > 1 && (
        <div role="group" aria-label="الموقع" style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          <Chip selected={!loc} onClick={() => setLocSel(null)}><Icon name="map" size={15} color={!loc ? C.white : C.accent} />كل المواقع</Chip>
          {L.all.filter((l) => l.active || Object.values(L.map ?? {}).some((m) => (m[l.id] ?? 0) > 0)).map((l) => (
            <Chip key={l.id} selected={loc === l.id} onClick={() => setLocSel(l.id)}>
              <Icon name={KIND_ICON[l.kind as LocationKind] ?? "box"} size={15} color={loc === l.id ? C.white : C.accent} />{l.name}
            </Chip>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {([["all", "الكل"], ["retail", "منتجات البيع"], ["consumable", "مواد الجلسات"], ["low", "تحتاج إعادة طلب"], ["hidden", "مخفية من المتجر"]] as [Filter, string][]).map(([k, t]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{t}</Chip>
        ))}
        <input aria-label="بحث في المخزون" placeholder="ابحثي بالاسم أو الفئة أو الرمز" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ marginInlineStart: "auto", height: 40, width: "min(260px, 100%)", boxSizing: "border-box", borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 16px", fontSize: 13.5 }} />
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المخزون: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="box" title="المخزون فارغ"
          text="أضيفي أول صنف: منتج للبيع (يظهر في المتجر تلقائياً) أو مادة تُستهلك في الجلسات. يمكنكِ إدخال الكمية الأولى وتاريخ الصلاحية مباشرة."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة صنف</GhostButton>} />
      ) : shown.length === 0 ? (
        <EmptyState compact icon="search" title="لا أصناف تطابق هذا الاختيار" />
      ) : (
        <>
        <div className={css.cards}>
          {shown.map((p) => {
            const img = productImage(p);
            const low = isLow(p);
            return (
              <article key={p.key} className={css.card}>
                <div className={css.head}>
                  <span style={{ width: 48, height: 48, borderRadius: 15, flexShrink: 0, background: ICON_FILL, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name={p.kind === "retail" ? "bottle" : "box"} size={20} />}
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: 0, flex: 1 }}>
                    <button type="button" onClick={() => setEditing(p)} style={{ border: "none", background: "none", padding: 0, fontSize: 14.5, fontWeight: 700, color: C.ink, textAlign: "right" }}>{p.name}</button>
                    <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size, p.sku].filter(Boolean).join(" · ") || "—"}</div>
                  </div>
                  <Tag kind={p.kind === "retail" ? "lilac" : "gray"}>{p.kind === "retail" ? "للبيع" : "للجلسات"}</Tag>
                </div>
                <div className={css.meta}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <b className="latin" style={{ fontSize: 16, color: low ? C.danger : C.ink }}>{qty(p).toLocaleString("en-US")}</b>
                    <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}{loc && <> · من {Number(p.stock).toLocaleString("en-US")}</>}</span>
                    {Number(p.stock) <= 0 ? <Tag kind="pink">نفد</Tag> : low && <Tag kind="amber">منخفض</Tag>}
                  </span>
                  {p.kind === "retail" && <span>{p.price != null ? money(p.price) : <span style={{ color: C.muted }}>بلا سعر</span>}</span>}
                  {p.kind === "retail" && (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, marginInlineStart: "auto", fontSize: 12.5, color: C.sub2 }}>
                      في المتجر <Toggle on={p.show_in_store} label={`إظهار ${p.name} في المتجر`} onChange={() => busyKey !== p.key && toggleStore(p)} />
                    </span>
                  )}
                </div>
                {L.multi && !loc && <Breakdown items={breakdown(p)} />}
                <div className={css.actions}>
                  <RowBtn icon="plus" label="استلام" onClick={() => setReceiving(p)} />
                  {L.multi && <RowBtn icon="refresh" label="نقل" onClick={() => setMoving(p)} />}
                  <RowBtn icon="clip" label="جرد" onClick={() => setAdjusting(p)} />
                  <RowBtn icon="trash" label="إتلاف" onClick={() => setWastingItem(p)} />
                  <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(p)} />
                </div>
              </article>
            );
          })}
        </div>
        <div className={css.table}>
        <DataTable minWidth={1040}
          headers={["الصنف", "النوع", "الكمية", "سعر البيع", "في المتجر", ""]}
          widths={[2.1, 0.7, 2, 0.9, 0.7, 3.1]}
          rowHeight={L.multi && !loc ? 76 : 64}
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
              <span key="s" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b className="latin" style={{ fontSize: 15, color: low ? C.danger : C.ink }}>{qty(p).toLocaleString("en-US")}</b>
                  <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}{loc && <> · من {Number(p.stock).toLocaleString("en-US")}</>}</span>
                  {Number(p.stock) <= 0 ? <Tag kind="pink">نفد</Tag> : low && <Tag kind="amber">منخفض</Tag>}
                </span>
                {L.multi && !loc && <Breakdown items={breakdown(p)} />}
              </span>,
              p.kind === "retail" ? (p.price != null ? money(p.price) : <span style={{ color: C.muted }}>بلا سعر</span>) : <span style={{ color: C.muted }}>—</span>,
              p.kind === "retail"
                ? <Toggle key="t" on={p.show_in_store} label={`إظهار ${p.name} في المتجر`} onChange={() => busyKey !== p.key && toggleStore(p)} />
                : <span style={{ fontSize: 12, color: C.muted }}>لا يظهر</span>,
              <span key="a" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginInlineStart: "auto" }}>
                <RowBtn icon="plus" label="استلام" onClick={() => setReceiving(p)} />
                {L.multi && <RowBtn icon="refresh" label="نقل" onClick={() => setMoving(p)} />}
                <RowBtn icon="clip" label="جرد" onClick={() => setAdjusting(p)} />
                <RowBtn icon="trash" label="إتلاف" onClick={() => setWastingItem(p)} />
                <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(p)} />
              </span>,
            ];
          })}
        />
        </div>
        </>
      )}

      <ProductDialog open={!!editing} product={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      <ReceiveDialog product={receiving} location={loc} onClose={() => setReceiving(null)} />
      <AdjustDialog product={adjusting} location={loc} onClose={() => setAdjusting(null)} />
      <WasteDialog batch={wasting} onClose={() => setWasting(null)} />
      <WasteItemDialog product={wastingItem} location={loc} onClose={() => setWastingItem(null)} />
      <TransferDialog product={moving} from={loc} onClose={() => setMoving(null)} />
    </AdminShell>
  );
}

function RowBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={label} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: `1px solid #EADCF0`, background: C.white, fontSize: 12.5, fontWeight: 600, color: C.accent, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0 }}>
      <Icon name={icon} color={C.accent} size={14} stroke={2} />{label}
    </button>
  );
}

function Breakdown({ items }: { items: { l: { id: string; name: string; kind: string }; n: number }[] }) {
  if (!items.length) return <span style={{ fontSize: 11.5, color: C.muted }}>لا كمية في أي موقع</span>;
  return (
    <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {items.map(({ l, n }) => (
        <span key={l.id} title={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 8px", borderRadius: 11, background: C.tint2, color: C.sub, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}>
          <Icon name={KIND_ICON[l.kind as LocationKind] ?? "box"} size={12} color={C.accentMid} />{l.name} <b className="latin" style={{ color: C.ink }}>{n.toLocaleString("en-US")}</b>
        </span>
      ))}
    </span>
  );
}
