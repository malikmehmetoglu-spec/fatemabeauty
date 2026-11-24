"use client";

/** «تفاصيل المبيعات والخدمات» — compares & filters today's revenue between services and products from non-void invoices. */
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useQuery, must } from "@/lib/db/query";
import { dayRange, money } from "@/lib/format";
import { C, SH } from "@/lib/tokens";

type ItemRow = {
  kind: string | null;
  label: string;
  qty: number;
  unit_price: number;
};

type Filter = "all" | "service" | "product";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "service", label: "الخدمات" },
  { key: "product", label: "المستحضرات" },
];

async function fetchDayItems(day: string): Promise<ItemRow[]> {
  const r = dayRange(day);
  const rows = must(
    await supabase
      .from("invoice_items")
      .select("kind, label, qty, unit_price, invoices!inner(created_at, void)")
      .eq("invoices.void", false)
      .gte("invoices.created_at", r.from)
      .lt("invoices.created_at", r.to),
  );
  return (rows ?? []) as unknown as ItemRow[];
}

export function RevenueBreakdown({ day, isToday }: { day: string; isToday: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const q = useQuery(["finance", "day-items", day], () => fetchDayItems(day));
  const items = q.data ?? [];

  const svcItems = items.filter((x) => x.kind !== "product");
  const prodItems = items.filter((x) => x.kind === "product");
  const svcTotal = svcItems.reduce((s, x) => s + x.qty * x.unit_price, 0);
  const prodTotal = prodItems.reduce((s, x) => s + x.qty * x.unit_price, 0);
  const grandTotal = svcTotal + prodTotal;

  const shown = filter === "all" ? items : filter === "service" ? svcItems : prodItems;
  const byLabel = new Map<string, { name: string; kind: string; count: number; total: number }>();
  for (const x of shown) {
    const k = `${x.kind ?? "service"}:${x.label}`;
    const cur = byLabel.get(k) ?? { name: x.label, kind: x.kind ?? "service", count: 0, total: 0 };
    cur.count += x.qty;
    cur.total += x.qty * x.unit_price;
    byLabel.set(k, cur);
  }
  const rows = [...byLabel.values()].sort((a, b) => b.total - a.total);
  const maxRow = Math.max(1, ...rows.map((r) => r.total));
  const shownTotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div style={{ borderRadius: 26, padding: "14px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, flex: 1.55, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>تفاصيل المبيعات والخدمات</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>
            {isToday ? "فواتير اليوم حتى الآن" : "فواتير هذا اليوم"} · المجموع {money(shownTotal)}
          </div>
        </div>
        <div role="tablist" aria-label="تصفية المبيعات" style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              style={{
                height: 30, borderRadius: 15, padding: "0 12px", fontSize: 12.5,
                fontWeight: filter === f.key ? 700 : 500, cursor: "pointer",
                border: filter === f.key ? "none" : "1px solid #EADCF0",
                background: filter === f.key ? C.accent : C.white,
                color: filter === f.key ? C.white : C.accent,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === "all" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, padding: "10px 12px", borderRadius: 16, background: "#FAF6FB", border: "1px solid #F0E6F3" }}>
          <div>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>الخدمات ({grandTotal ? Math.round((svcTotal / grandTotal) * 100) : 0}%)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>{money(svcTotal)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>المستحضرات ({grandTotal ? Math.round((prodTotal / grandTotal) * 100) : 0}%)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, marginTop: 2 }}>{money(prodTotal)}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        {q.loading ? (
          <div style={{ fontSize: 13, color: C.sub2 }}>جارٍ التحميل…</div>
        ) : rows.length === 0 ? (
          <div style={{ fontSize: 13, color: C.sub2 }}>
            {filter === "product" ? "لا مبيعات مستحضرات مسجّلة." : filter === "service" ? "لا خدمات مفوترة." : "لا فواتير مسجّلة."}
          </div>
        ) : (
          rows.map((r) => (
            <div key={`${r.kind}:${r.name}`} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 150, lineHeight: 1.3, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>
                  {r.kind === "product" ? "مستحضر" : "خدمة"} · <span className="latin">{r.count}</span>
                </div>
              </div>
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#ECE2EF", overflow: "hidden" }}>
                <div style={{ width: `${Math.floor((r.total / maxRow) * 100)}%`, height: 12, borderRadius: 6, background: r.kind === "product" ? "linear-gradient(90deg,#E6A4C4,#C8507F)" : "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
              </div>
              <div style={{ width: 110, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{money(r.total)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
