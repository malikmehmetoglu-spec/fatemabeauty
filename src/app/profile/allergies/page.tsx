"use client";

import { useState, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { useRouter } from "next/navigation";
import { Card, Circ, ErrorNote, Icon, PrimaryButton, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { addCondition, listConditions, removeCondition, updatePatient, useMe, type Condition, type ConditionKind } from "@/lib/db/patients";
import { Wait } from "../../account/Wait";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SHB, SOFT_PANEL } from "@/lib/tokens";

/** P_Allergies.dc.html — allergies, medications, pregnancy flags. */
const SHIELD = "M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4";
const HEART = "M19.5 12.6L12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6";

function Head({ icon, title, onAdd }: { icon: string; title: string; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Circ icon={icon} size={38} iconSize={17} />
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
      </div>
      <button type="button" onClick={onAdd} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #FFFFFF", background: ICON_FILL, color: C.accent, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 4px 10px rgba(150,100,170,0.15)" }}>
        <Icon name="plus" color={C.accent} size={15} stroke={2.2} />إضافة
      </button>
    </div>
  );
}

function Items({ rows, empty, emptySub }: { rows: Condition[]; empty: string; emptySub?: string }) {
  if (!rows.length) return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 18, border: "1.5px dashed #E3D3E7", textAlign: "center", lineHeight: 1.5 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: C.sub }}>{empty}</div>
      {emptySub && <div style={{ fontSize: 12, color: C.muted }}>{emptySub}</div>}
    </div>
  );
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((c) => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px 0 8px", borderRadius: 16, background: "#F8F2FA", border: "1px solid #EEE0F1" }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#9B4FB0", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{c.name}</span>
          <button type="button" aria-label={`حذف ${c.name}`} onClick={() => removeCondition(c.id)} style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <Icon name="x" color={C.danger} size={14} stroke={2.2} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SwitchRow({ icon, title, sub, on, set, first }: { icon: string; title: string; sub: ReactNode; on: boolean; set: (v: boolean) => void; first?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: first ? undefined : `1px solid ${C.line}` }}>
      <Circ icon={icon} size={38} iconSize={17} />
      <div style={{ flex: 1, lineHeight: 1.35 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={set} label={title} />
    </div>
  );
}

export default function AllergiesPage() {
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: conds } = useQuery(["conditions", id], () => listConditions(id), { enabled: !!id });
  const [adding, setAdding] = useState<ConditionKind | null>(null);
  const [name, setName] = useState("");
  const [edits, setEdits] = useState<{ preg?: boolean; bf?: boolean; notes?: string }>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const preg = edits.preg ?? me?.pregnant ?? false;
  const bf = edits.bf ?? me?.breastfeeding ?? false;
  const notes = edits.notes ?? me?.notes ?? "";
  const allergies = (conds ?? []).filter((c) => c.kind === "allergy");
  const meds = (conds ?? []).filter((c) => c.kind === "medication");

  async function add() {
    if (!adding || !name.trim() || !me) return;
    try { await addCondition(me.id, adding, name); setName(""); setAdding(null); } catch { setErr("تعذّرت الإضافة."); }
  }
  async function save() {
    if (!me) return;
    setBusy(true); setErr("");
    try { await updatePatient(me.id, { pregnant: preg, breastfeeding: bf, notes: notes.trim() || null }); router.push(R.Account); }
    catch { setErr("تعذّر الحفظ. حاولي مرة أخرى."); setBusy(false); }
  }

  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="الحساسية والأدوية" back={R.Account} />
      <div style={{ ...SOFT_PANEL, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 20, position: "relative" }}>
        <Circ icon={SHIELD} size={36} iconSize={16} />
        <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.45 }}>تظهر هذه المعلومات للأخصائية قبل كل جلسة، لتختار ما يناسب بشرتكِ بأمان.</div>
      </div>
      {!me ? <Wait loading={loading} error={error} /> : (
        <>
          <Card radius={24} padding="14px 16px" style={{ flexShrink: 0 }}>
            <Head icon="alert" title="الحساسية" onAdd={() => { setAdding("allergy"); setName(""); }} />
            {allergies.length ? <Items rows={allergies} empty="" /> : (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", borderRadius: 16, background: "#F3FAF6", border: "1px solid #DCEFE4" }}>
                <Icon name="check" color={C.ok} size={18} stroke={2.2} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.okDeep }}>لا توجد حساسية معروفة</span>
              </div>
            )}
          </Card>

          <Card radius={24} padding="14px 16px" style={{ flexShrink: 0 }}>
            <Head icon="pill" title="الأدوية الحالية" onAdd={() => { setAdding("medication"); setName(""); }} />
            <Items rows={meds} empty="لا توجد أدوية مسجّلة" emptySub="أضيفي أي دواء أو مكمّل تتناولينه، خاصة أدوية حب الشباب أو الهرمونات" />
          </Card>

          {adding && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
              <input autoFocus aria-label={adding === "allergy" ? "اسم الحساسية" : "اسم الدواء"} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder={adding === "allergy" ? "حساسية من…" : "اسم الدواء أو المكمّل"} style={{ flex: 1, minWidth: 0, height: 46, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, padding: "0 14px", fontSize: 14, color: C.ink, outline: "none" }} />
              <button type="button" onClick={add} style={{ height: 46, padding: "0 16px", borderRadius: 23, border: "none", background: C.accent, color: C.white, fontSize: 14, fontWeight: 600 }}>إضافة</button>
              <button type="button" aria-label="إلغاء" onClick={() => setAdding(null)} style={{ width: 40, height: 40, borderRadius: 20, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" color={C.sub2} size={15} /></button>
            </div>
          )}

          <Card radius={24} padding="4px 16px" style={{ flexShrink: 0 }}>
            <SwitchRow first icon={HEART} title="حامل حالياً" sub="بعض الجلسات تؤجَّل خلال الحمل" on={preg} set={(v) => setEdits({ ...edits, preg: v })} />
            <SwitchRow icon="drop" title="مرضعة" sub="تساعد الأخصائية على اختيار المنتجات" on={bf} set={(v) => setEdits({ ...edits, bf: v })} />
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, position: "relative" }}>
            <label htmlFor="anote" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>ملاحظات أخرى للأخصائية (اختياري)</label>
            <textarea id="anote" rows={2} value={notes} onChange={(e) => setEdits({ ...edits, notes: e.target.value })} placeholder="مثلاً: تهيّج سابق بعد منتج معيّن" style={{ height: 58, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, padding: "11px 14px", fontSize: 14, color: C.ink, boxShadow: "inset 0 2px 4px rgba(123,70,135,0.04)", outline: "none", width: "100%", boxSizing: "border-box", resize: "none", lineHeight: 1.5 }} />
          </div>
          {err && <ErrorNote>{err}</ErrorNote>}
          <PrimaryButton onClick={save} disabled={busy} style={{ marginTop: "auto", flexShrink: 0 }}>{busy ? "جارٍ الحفظ…" : "حفظ"}</PrimaryButton>
        </>
      )}
    </PhoneScreen>
  );
}
