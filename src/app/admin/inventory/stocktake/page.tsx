"use client";

/**
 * W_Stocktake.dc.html — الجرد (live). Count every item, compare with the system quantity,
 * then apply: each difference is written through adjust_stock (logged as «تعديل جرد»).
 */
import { arError } from "@/lib/arError";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, SubmitButton, Tag, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { applyStocktake, KIND_ICON, listInventory, qtyAt, type LocationKind, type Product } from "@/lib/db/products";
import { useLocations } from "../dialogs";
import css from "../inventory.module.css";

type Filter = "all" | "retail" | "consumable" | "diff" | "uncounted";

export default function Page() {
  const { data, loading, error } = useQuery(["products", "inventory"], listInventory);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState("");
  const L = useLocations();
  const [locSel, setLocSel] = useState("");
  const loc = (locSel && L.all.some((l) => l.id === locSel) ? locSel : L.def?.id) ?? "";
  const sys = (p: Product) => (loc ? qtyAt(L.map, p, loc) : Number(p.stock));
  const switchLoc = (id: string) => {
    if (id === loc) return;
    if (Object.values(counts).some((v) => v.trim() !== "") && !confirm("تغيير الموقع يمسح الأعداد المكتوبة لهذا الجرد. متابعة؟")) return;
    setCounts({}); setDone(""); setLocSel(id);
  };

  const list = useMemo(() => data ?? [], [data]);
  const parsed = (k: string) => { const s = counts[k]; if (s == null || s.trim() === "") return null; const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : null; };
  const counted = list.filter((p) => parsed(p.key) != null);
  const diffs = counted.filter((p) => parsed(p.key) !== sys(p));
  const diffValue = diffs.reduce((s, p) => s + ((parsed(p.key) as number) - sys(p)) * (p.cost ?? 0), 0);

  const shown = list.filter((p) => {
    const needle = q.trim().toLowerCase();
    if (needle && ![p.name, p.sku ?? "", p.category].some((t) => t.toLowerCase().includes(needle))) return false;
    if (filter === "retail") return p.kind === "retail";
    if (filter === "consumable") return p.kind === "consumable";
    if (filter === "diff") return diffs.includes(p);
    if (filter === "uncounted") return parsed(p.key) == null;
    return true;
  });

  async function apply() {
    if (!diffs.length) return;
    if (!loc) { setErr("لا يوجد موقع للجرد."); return; }
    if (!confirm(`اعتماد الجرد لـ ${diffs.length} صنف${locName && L.multi ? ` في «${locName}»` : ""}؟ ستُعدَّل كميات النظام لتطابق العدّ.`)) return;
    setBusy(true); setErr(""); setDone("");
    try {
      const n = await applyStocktake(diffs.map((p) => ({ key: p.key, counted: parsed(p.key) as number, current: sys(p) })), note.trim() || "جرد دوري", loc);
      setCounts({}); setNote(""); setDone(`اعتُمد الجرد: عُدِّلت كميات ${n} صنف.`);
    } catch (e) { setErr(arError(e, "تعذّر اعتماد الجرد")); } finally { setBusy(false); }
  }

  const locName = L.all.find((l) => l.id === loc)?.name ?? "";
  const fillSystem = () => setCounts(Object.fromEntries(shown.map((p) => [p.key, counts[p.key] ?? String(sys(p))])));

  return (
    <AdminShell active="المخزون والأجهزة" title="الجرد" subtitle={L.multi ? "الجرد لكل موقع على حدة: اختاري الموقع، اكتبي الكمية المعدودة لكل صنف، ثم اعتمدي الفروقات" : "اكتبي الكمية المعدودة لكل صنف، ثم اعتمدي الفروقات"}
      actions={<Link href={R.W_Inventory} style={{ height: 40, borderRadius: 20, padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, background: C.white, color: C.accent, boxShadow: "0 6px 18px rgba(123,70,135,0.12)" }}>
        <Icon name="box" color={C.accent} size={16} />المخزون
      </Link>}>
      {L.multi && (
        <div role="group" aria-label="موقع الجرد" style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.sub, flexShrink: 0 }}>موقع الجرد:</span>
          {L.all.filter((l) => l.active || Object.values(L.map ?? {}).some((m) => (m[l.id] ?? 0) > 0)).map((l) => (
            <Chip key={l.id} selected={loc === l.id} onClick={() => switchLoc(l.id)}>
              <Icon name={KIND_ICON[l.kind as LocationKind] ?? "box"} size={15} color={loc === l.id ? C.white : C.accent} />{l.name}
            </Chip>
          ))}
        </div>
      )}
      <div className="adm-row">
        <Kpi dark label="تم عدّها" value={`${counted.length} / ${list.length}`} sub={L.multi && locName ? `صنف في جرد «${locName}»` : "صنف في هذا الجرد"} icon="clip" />
        <Kpi label="أصناف بفرق" value={diffs.length} sub="بين العدّ والنظام" icon="alert" />
        <Kpi label="قيمة الفرق" value={money(diffValue)} sub="بسعر الكلفة المسجّل" icon="wallet" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {([["all", "الكل"], ["retail", "منتجات البيع"], ["consumable", "مواد الجلسات"], ["uncounted", "لم تُعدّ"], ["diff", "بفرق"]] as [Filter, string][]).map(([k, t]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{t}</Chip>
        ))}
        <GhostButton icon="check" onClick={fillSystem}>مطابقة المعروض لكمية النظام</GhostButton>
        <input aria-label="بحث" placeholder="ابحثي باسم الصنف أو الرمز" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ marginInlineStart: "auto", height: 40, width: "min(240px, 100%)", boxSizing: "border-box", borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 16px", fontSize: 13.5 }} />
      </div>

      {done && <div role="status" style={{ fontSize: 13.5, fontWeight: 600, color: C.okDeep, background: "#E6F4EC", borderRadius: 14, padding: "10px 14px" }}>{done}</div>}
      {err && <ErrorNote>{err}</ErrorNote>}

      {loading || (!L.map && list.length > 0) ? <Loading /> : error ? <ErrorNote>تعذّر تحميل المخزون: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="clip" title="لا أصناف للجرد" text="أضيفي أصناف المخزون أولاً، ثم عودي لعدّها هنا."
          action={<Link href={R.W_Inventory} style={{ color: C.accent, fontWeight: 700 }}>المخزون</Link>} />
      ) : shown.length === 0 ? <EmptyState compact icon="search" title="لا أصناف تطابق هذا الاختيار" /> : (
        <>
        <div className={css.cards}>
          {shown.map((p) => {
            const c = parsed(p.key);
            const d = c == null ? null : c - sys(p);
            return (
              <article key={p.key} className={css.card}>
                <div className={css.head}>
                  <div style={{ lineHeight: 1.35, minWidth: 0, flex: 1 }}>
                    <b style={{ fontSize: 14.5 }}>{p.name}</b>
                    <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size, p.sku].filter(Boolean).join(" · ") || "—"}</div>
                  </div>
                  <Tag kind={p.kind === "retail" ? "lilac" : "gray"}>{p.kind === "retail" ? "للبيع" : "للجلسات"}</Tag>
                </div>
                <div className={css.meta}>
                  <span>النظام: <b className="latin">{sys(p).toLocaleString("en-US")}</b> <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}</span></span>
                  <input type="number" inputMode="decimal" min={0} aria-label={`الكمية المعدودة من ${p.name} (جوال)`} value={counts[p.key] ?? ""} placeholder="العدّ"
                    onChange={(e) => setCounts((x) => ({ ...x, [p.key]: e.target.value }))} className="latin"
                    style={{ width: 110, height: 38, borderRadius: 14, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 14, textAlign: "center" }} />
                  {d != null && <b className="latin" style={{ color: d < 0 ? C.danger : d > 0 ? C.okDeep : C.sub2 }}>{d > 0 ? "+" : ""}{d}</b>}
                </div>
              </article>
            );
          })}
        </div>
        <div className={css.table}>
        <DataTable minWidth={680}
          headers={["الصنف", "النوع", "كمية النظام", "الكمية المعدودة", "الفرق"]}
          widths={[2.6, 0.9, 1, 1.3, 1]}
          rowHeight={60}
          rows={shown.map((p) => {
            const c = parsed(p.key);
            const d = c == null ? null : c - sys(p);
            return [
              <div key="n" style={{ lineHeight: 1.35 }}>
                <b style={{ fontSize: 14 }}>{p.name}</b>
                <div style={{ fontSize: 12, color: C.sub2 }}>{[p.category, p.size, p.sku].filter(Boolean).join(" · ") || "—"}</div>
              </div>,
              <Tag key="k" kind={p.kind === "retail" ? "lilac" : "gray"}>{p.kind === "retail" ? "للبيع" : "للجلسات"}</Tag>,
              <span key="s"><b className="latin">{sys(p).toLocaleString("en-US")}</b> <span style={{ fontSize: 12, color: C.sub2 }}>{p.unit}</span></span>,
              <input key="i" type="number" inputMode="decimal" min={0} aria-label={`الكمية المعدودة من ${p.name}`} value={counts[p.key] ?? ""} placeholder="—"
                onChange={(e) => setCounts((x) => ({ ...x, [p.key]: e.target.value }))} className="latin"
                style={{ width: 110, height: 38, borderRadius: 14, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 14, textAlign: "center" }} />,
              d == null ? <span key="d" style={{ color: C.muted }}>—</span>
                : <b key="d" className="latin" style={{ color: d < 0 ? C.danger : d > 0 ? C.okDeep : C.sub2 }}>{d > 0 ? "+" : ""}{d}</b>,
            ];
          })}
        />
        </div>
        </>
      )}

      {list.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <TextInput label="ملاحظة الجرد (تُحفظ مع كل تعديل)" value={note} onChange={setNote} placeholder="جرد آخر الشهر، تالف، منتهي…" style={{ flex: "1 1 260px" }} />
          <SubmitButton onClick={apply} busy={busy} disabled={!diffs.length}>اعتماد الجرد ({diffs.length})</SubmitButton>
        </div>
      )}
    </AdminShell>
  );
}
