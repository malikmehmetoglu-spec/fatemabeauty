"use client";

/**
 * W_Purchases.dc.html — المشتريات والموردون (live).
 * Receiving goods = stock batches. Each «استلام» adds a batch (qty, expiry, unit cost, supplier as free text).
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, Chip, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Modal, Select, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { KIND_ICON, listAllBatches, listInventory, type LocationKind, type Product } from "@/lib/db/products";
import { ReceiveDialog, useLocations } from "../dialogs";

const value = (b: { qty_received: number; unit_cost: number | null }) => Number(b.qty_received) * (b.unit_cost ?? 0);

export default function Page() {
  const { data: batches, loading, error } = useQuery(["products", "batches"], () => listAllBatches(300));
  const { data: items } = useQuery(["products", "inventory"], listInventory);
  const [picking, setPicking] = useState(false);
  const [receiving, setReceiving] = useState<Product | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [loc, setLoc] = useState<string | null>(null);
  const L = useLocations();

  const list = useMemo(() => batches ?? [], [batches]);
  const month = dayKey().slice(0, 7);
  const thisMonth = list.filter((b) => dayKey(new Date(b.received_at)).slice(0, 7) === month);
  const soon = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
  const expiring = list.filter((b) => Number(b.qty_left) > 0 && b.expires_on && b.expires_on <= soon);

  const suppliers = useMemo(() => {
    const m = new Map<string, { n: number; value: number; last: string }>();
    for (const b of list) {
      const s = b.supplier?.trim();
      if (!s) continue;
      const e = m.get(s) ?? { n: 0, value: 0, last: b.received_at };
      e.n++; e.value += value(b); if (b.received_at > e.last) e.last = b.received_at;
      m.set(s, e);
    }
    return [...m.entries()].sort((a, b) => b[1].last.localeCompare(a[1].last));
  }, [list]);

  const shown = list.filter((b) => (!supplier || b.supplier?.trim() === supplier) && (!loc || b.location_id === loc));

  return (
    <AdminShell active="المخزون والأجهزة" title="المشتريات والموردون" subtitle="كل استلام بضاعة يُسجَّل دفعةً بتاريخ انتهائها وكلفتها ومورّدها"
      actions={<>
        <Link href={R.W_Inventory} style={{ height: 40, borderRadius: 20, padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: C.white, color: C.accent, boxShadow: "0 6px 18px rgba(123,70,135,0.12)" }}>
          <Icon name="box" color={C.accent} size={16} />المخزون
        </Link>
        <GhostButton icon="plus" onClick={() => setPicking(true)}>استلام بضاعة</GhostButton>
      </>}>
      <div className="adm-row">
        <Kpi dark label="استلامات هذا الشهر" value={thisMonth.length} sub="دفعة مسجّلة" icon="download" />
        <Kpi label="قيمة المستلم هذا الشهر" value={money(thisMonth.reduce((s, b) => s + value(b), 0))} sub="بكلفة الوحدة المسجّلة" icon="wallet" />
        <Kpi label="الموردون" value={suppliers.length} sub="من سجلّ الاستلام" icon="users" />
        <Kpi label="دفعات تنتهي خلال 60 يوماً" value={expiring.length} sub="ما زال منها كمية" icon="clock" />
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>سجلّ الاستلام</h2>
            {supplier && <Tag kind="lilac">{supplier} <button type="button" aria-label="إزالة التصفية" onClick={() => setSupplier(null)} style={{ border: "none", background: "none", padding: 0, marginInlineStart: 4, color: C.accent }}>×</button></Tag>}
          </div>
          {L.all.length > 1 && (
            <div role="group" aria-label="الموقع" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              <Chip selected={!loc} onClick={() => setLoc(null)}>كل المواقع</Chip>
              {L.all.map((l) => (
                <Chip key={l.id} selected={loc === l.id} onClick={() => setLoc(l.id)}>
                  <Icon name={KIND_ICON[l.kind as LocationKind] ?? "box"} size={15} color={loc === l.id ? C.white : C.accent} />{l.name}
                </Chip>
              ))}
            </div>
          )}
          {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل السجل: {error}</ErrorNote> : list.length === 0 ? (
            <EmptyState icon="download" title="لم تُستلم بضاعة بعد"
              text="عند وصول بضاعة اضغطي «استلام بضاعة»، اختاري الصنف واكتبي الكمية وتاريخ الانتهاء والمورّد. تُضاف الكمية إلى المخزون ويُصرف الأقرب انتهاءً أولاً."
              action={<GhostButton icon="plus" onClick={() => setPicking(true)}>استلام بضاعة</GhostButton>} />
          ) : (
            <DataTable minWidth={L.all.length > 1 ? 880 : 760}
              headers={["التاريخ", "الصنف", ...(L.all.length > 1 ? ["الموقع"] : []), "الكمية", "المتبقي", "الانتهاء", "كلفة الوحدة", "المورّد"]}
              widths={[1.1, 2, ...(L.all.length > 1 ? [1.1] : []), 0.8, 0.8, 1.1, 1, 1.2]}
              rows={shown.map((b) => {
                const exp = b.expires_on;
                const expSoon = exp && exp <= soon && Number(b.qty_left) > 0;
                return [
                  <span key="d" style={{ fontSize: 12.5 }}>{arDate(new Date(b.received_at), { day: false })}</span>,
                  <b key="n" style={{ fontSize: 13.5 }}>{b.products?.name ?? "—"}</b>,
                  ...(L.all.length > 1 ? [<span key="w" style={{ fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name={KIND_ICON[(b.stock_locations?.kind ?? "center") as LocationKind]} size={14} color={C.accentMid} />{b.stock_locations?.name ?? "—"}</span>] : []),
                  <span key="q" className="latin">{Number(b.qty_received)} <span style={{ fontSize: 11.5, color: C.sub2 }}>{b.products?.unit}</span></span>,
                  <span key="l" className="latin" style={{ color: Number(b.qty_left) <= 0 ? C.muted : C.ink }}>{Number(b.qty_left)}</span>,
                  exp ? <span key="e" style={{ fontSize: 12.5, color: expSoon ? C.danger : C.ink, fontWeight: expSoon ? 700 : 400 }}>{arDate(new Date(exp), { day: false, year: true })}</span> : <span key="e" style={{ color: C.muted }}>—</span>,
                  b.unit_cost != null ? <span key="c" className="latin">{money(b.unit_cost)}</span> : <span key="c" style={{ color: C.muted }}>—</span>,
                  <span key="s" style={{ fontSize: 12.5 }}>{b.supplier || <span style={{ color: C.muted }}>—</span>}</span>,
                ];
              })}
            />
          )}
        </div>

        <Card style={{ flex: "1 1 280px", minWidth: 0 }} padding={18}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700 }}>الموردون</h2>
          {suppliers.length === 0 ? (
            <div style={{ fontSize: 13, color: C.sub2, lineHeight: 1.8 }}>تظهر هنا أسماء الموردين كما تكتبينها عند الاستلام، مع عدد الاستلامات وقيمتها.</div>
          ) : suppliers.map(([name, s]) => (
            <button key={name} type="button" onClick={() => setSupplier(supplier === name ? null : name)} style={{
              width: "100%", textAlign: "right", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 14, border: "none",
              background: supplier === name ? C.tint : "transparent", borderTop: `1px solid ${C.line}`,
            }}>
              <Icon name="truck" color={C.accentMid} size={18} />
              <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.ink }}>{name}</span>
                <span style={{ display: "block", fontSize: 11.5, color: C.sub2 }}>{s.n} استلام · آخرها {arDate(new Date(s.last), { day: false })}</span>
              </span>
              {s.value > 0 && <span className="latin" style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{money(s.value, false)}</span>}
            </button>
          ))}
        </Card>
      </div>

      <PickProduct open={picking} items={items ?? []} onClose={() => setPicking(false)} onPick={(p) => { setPicking(false); setReceiving(p); }} />
      <ReceiveDialog product={receiving} location={loc} onClose={() => setReceiving(null)} />
    </AdminShell>
  );
}

function PickProduct({ open, items, onClose, onPick }: { open: boolean; items: Product[]; onClose: () => void; onPick: (p: Product) => void }) {
  const [key, setKey] = useState("");
  const p = items.find((x) => x.key === key) ?? null;
  return (
    <Modal open={open} onClose={onClose} title="استلام بضاعة — اختاري الصنف" width={480}
      footer={<SubmitButton disabled={!p} onClick={() => p && onPick(p)}>متابعة</SubmitButton>}>
      {items.length === 0 ? (
        <div style={{ fontSize: 13.5, color: C.sub }}>لا أصناف في المخزون بعد. أضيفي الصنف أولاً من <Link href={R.W_Inventory} style={{ color: C.accent, fontWeight: 700 }}>المخزون</Link>.</div>
      ) : (
        <Select label="الصنف" value={key} onChange={setKey}
          options={[{ value: "", label: "اختاري صنفاً…" }, ...items.map((x) => ({ value: x.key, label: `${x.name}${x.size ? ` · ${x.size}` : ""} (${x.kind === "retail" ? "للبيع" : "للجلسات"})` }))]} />
      )}
    </Modal>
  );
}
