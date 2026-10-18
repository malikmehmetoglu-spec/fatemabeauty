"use client";

/** W_Loyalty.dc.html — loyalty rules (settings «loyalty») and members (patients.points). Live, Supabase. */
import { arError } from "@/lib/arError";
import ac from "../../adminPages.module.css";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, NumberInput, SubmitButton, Tag, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { getLoyalty, listMembers, saveSetting, tierOf, type Loyalty, type Tier } from "@/lib/db/marketing";
import { C } from "@/lib/tokens";
import { MarketingTabs } from "../tabs";

export default function LoyaltyPage() {
  const { data: rules, loading, error } = useQuery(["settings", "loyalty"], getLoyalty);
  const { data: members, loading: lm, error: em } = useQuery(["loyalty", "members"], listMembers);
  const list = members ?? [];
  const total = list.reduce((s, m) => s + m.points, 0);

  return (
    <AdminShell active="التسويق والولاء" title="النقاط والعضويات" subtitle="قواعد احتساب النقاط وشرائح العضوية والمراجعات اللواتي لديهن نقاط">
      <MarketingTabs active={R.W_Loyalty} />
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="عضوات لديهن نقاط" value={list.length} icon="users" />
        <Kpi label="مجموع النقاط القائمة" value={total.toLocaleString("en-US")} icon="sparkle" />
        <Kpi label="شرائح العضوية" value={rules?.tiers.length ?? 0} icon="badge" />
      </div>

      <div className={ac.stack} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل القواعد: {error}</ErrorNote> : rules && <RulesCard rules={rules} />}
        </div>
        <div style={{ flex: 1.4, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>العضوات</div>
          {lm ? <Loading /> : em ? <ErrorNote>{em}</ErrorNote> : list.length === 0 ? (
            <EmptyState compact icon="users" title="لا توجد مراجعات لديهن نقاط بعد" text="تظهر هنا المراجعات حسب رصيد نقاطهن وشريحتهن بعد احتساب أول نقاط." />
          ) : (
            <DataTable headers={["المراجعة", "رقم الملف", "النقاط", "الشريحة"]} widths={[2, 1, 1, 1]}
              rows={list.map((m) => {
                const t = rules ? tierOf(m.points, rules.tiers) : null;
                return [
                  <span key="n" style={{ fontWeight: 700 }}>{m.name || "—"}</span>,
                  <span key="f" className="latin">{m.file_no}</span>,
                  <b key="p" className="latin" style={{ color: C.accent }}>{m.points.toLocaleString("en-US")}</b>,
                  t ? <Tag key="t" kind="plum">{t.name}</Tag> : <span key="t" style={{ color: C.muted }}>—</span>,
                ];
              })} />
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function RulesCard({ rules }: { rules: Loyalty }) {
  const [per, setPer] = useState(String(rules.points_per));
  const [val, setVal] = useState(String(rules.points_value));
  const [tiers, setTiers] = useState<{ name: string; min: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    setPer(String(rules.points_per)); setVal(String(rules.points_value));
    setTiers(rules.tiers.map((t) => ({ name: t.name, min: String(t.min) })));
  }, [rules]);

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const clean: Tier[] = tiers.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), min: Number(t.min) || 0 })).sort((a, b) => a.min - b.min);
      await saveSetting("loyalty", { points_per: Number(per) || 0, points_value: Number(val) || 0, tiers: clean });
      setMsg("تم الحفظ");
    } catch (e) { setMsg(arError(e)); }
    finally { setBusy(false); }
  };

  return (
    <Card radius={26} padding={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>قواعد النقاط</div>
      <NumberInput label="نقطة واحدة لكل" value={per} onChange={setPer} suffix="ل.س" hint="المبلغ المدفوع الذي يمنح نقطة واحدة" />
      <NumberInput label="قيمة النقطة عند الاستبدال" value={val} onChange={setVal} suffix="ل.س" hint="0 = الاستبدال غير مفعّل" />
      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>شرائح العضوية</div>
      {tiers.length === 0 && <div style={{ fontSize: 13, color: C.sub2 }}>لا توجد شرائح. أضيفي شريحة بحد أدنى من النقاط.</div>}
      {tiers.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <TextInput label="اسم الشريحة" value={t.name} onChange={(v) => setTiers(tiers.map((x, j) => (j === i ? { ...x, name: v } : x)))} style={{ flex: 1.3 }} />
          <NumberInput label="من نقطة" value={t.min} onChange={(v) => setTiers(tiers.map((x, j) => (j === i ? { ...x, min: v } : x)))} style={{ flex: 1 }} />
          <button type="button" aria-label="حذف الشريحة" onClick={() => setTiers(tiers.filter((_, j) => j !== i))} style={{ width: 46, height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" color={C.sub2} size={16} />
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <GhostButton icon="plus" onClick={() => setTiers([...tiers, { name: "", min: "" }])}>شريحة</GhostButton>
        <SubmitButton onClick={save} busy={busy}>حفظ القواعد</SubmitButton>
        {msg && <span style={{ fontSize: 13, color: msg === "تم الحفظ" ? C.ok : C.danger }}>{msg}</span>}
      </div>
    </Card>
  );
}
