"use client";

import ac from "../../adminPages.module.css";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Logo, SubmitButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useSession } from "@/lib/supabase/session";
import { getPatient, listConditions } from "@/lib/db/patients";
import { listPrescriptions, rxItems, savePrescription, WHEN_LABEL, type RxItem } from "@/lib/db/clinical";
import { C, SH_SOFT } from "@/lib/tokens";
import { arErr, BackLink, chip, displayName, fileHref, Initials, outlineBtn, Panel, PILL_DANGER, PILL_GRAY, PLUS } from "../kit";

const BLANK: RxItem = { name: "", how: "", when: "pm" };
const norm = (s: string) => s.trim().replace(/^ال/, "").replace(/[ًٌٍَُِّْ]/g, "").replace(/ة$/, "ه");

/** True when a product line mentions one of her allergies. */
function clash(item: RxItem, allergies: string[]) {
  const text = norm(`${item.name} ${item.how}`);
  return allergies.find((a) => { const n = norm(a).replace(/ات$/, ""); return n.length >= 3 && text.includes(n); }) ?? null;
}

/** W_Prescription.dc.html */
export default function PrescriptionPage() {
  return <Suspense><Prescription /></Suspense>;
}

function Prescription() {
  const patientId = useSearchParams().get("patient") ?? "";
  const { data: p, loading } = useQuery(["patients", "one", patientId], () => getPatient(patientId), { enabled: !!patientId });
  const { data: conds } = useQuery(["conditions", patientId], () => listConditions(patientId), { enabled: !!patientId });
  const { data: last } = useQuery(["clinical", "rx", patientId], () => listPrescriptions(patientId), { enabled: !!patientId });
  const { staff } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<RxItem[]>([{ ...BLANK }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const shell = (body: React.ReactNode) => (
    <AdminShell active="جدولي" title="وصفة جديدة" subtitle="تُرسل لتطبيق المراجعة وتُحفظ في سجلّها" actions={patientId ? <BackLink href={fileHref(R.W_Record, "id", patientId)}>العودة للملف</BackLink> : undefined}>{body}</AdminShell>
  );
  if (!patientId) return shell(<EmptyState icon="pill" title="اختاري مراجعة أولاً" text="افتحي الوصفة من ملف المراجعة." action={<Link href={R.W_Patients} style={outlineBtn()}>العميلات</Link>} />);
  if (loading) return shell(<Loading />);
  if (!p) return shell(<EmptyState icon="users" title="لم يُعثر على هذا الملف" />);

  const allergies = (conds ?? []).filter((c) => c.kind === "allergy").map((c) => c.name);
  const filled = items.filter((x) => x.name.trim());
  const clashes = filled.map((x) => clash(x, allergies)).filter(Boolean) as string[];
  const set = (i: number, patch: Partial<RxItem>) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const input = { height: 42, borderRadius: 14, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 13.5, color: C.ink, outline: "none", minWidth: 0 } as const;

  async function save() {
    setBusy(true); setErr("");
    try { await savePrescription(p!.id, staff?.id ?? null, filled.map((x) => ({ ...x, name: x.name.trim(), how: x.how.trim() }))); router.push(fileHref(R.W_Record, "id", p!.id)); }
    catch (e) { setErr(arErr(e)); setBusy(false); }
  }

  return shell(
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
      <div style={{ borderRadius: 20, padding: "12px 18px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Initials name={p.name} size={40} />
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{displayName(p.name)}</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>ملف <span className="latin">{p.file_no}</span></div>
        </div>
        <span style={{ flex: 1 }} />
        {allergies.map((a) => <span key={a} style={PILL_DANGER}>حساسية: {a}</span>)}
        {p.pregnant && <span style={PILL_DANGER}>حامل</span>}
        {p.breastfeeding && <span style={PILL_DANGER}>مرضع</span>}
        {p.skin_type && <span style={PILL_GRAY}>{p.skin_type}</span>}
      </div>

      <div className={ac.split}>
        <Panel title="المستحضرات" sub="أنواع عامة بدون علامات تجارية" className={ac.grow}
          right={<button type="button" onClick={() => setItems([...items, { ...BLANK }])} style={outlineBtn(34)}><Icon name={PLUS} size={16} color={C.accent} stroke={1.9} />إضافة مستحضر</button>}>
          {clashes.length > 0 && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 16, background: "#FBEAF1", color: C.danger, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              <Icon name="alert" size={18} color={C.danger} />تحذير: مستحضر قد يتعارض مع حساسية المراجعة ({[...new Set(clashes)].join("، ")}). راجعيه قبل الإرسال.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((x, i) => {
              const bad = x.name.trim() && clash(x, allergies);
              return (
                <div key={i} className={ac.rxRow} style={{ display: "flex", gap: 8, alignItems: "center", padding: 10, borderRadius: 18, background: bad ? "#FBEAF1" : "#FAF5FB" }}>
                  <span className="latin" style={{ width: 22, textAlign: "center", fontWeight: 700, color: C.accent }}>{i + 1}</span>
                  <input aria-label="المستحضر" value={x.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="مثل: غسول لطيف للبشرة المختلطة" style={{ ...input, flex: 1.3, minWidth: 0 }} />
                  <input aria-label="طريقة الاستعمال" value={x.how} onChange={(e) => set(i, { how: e.target.value })} placeholder="طريقة الاستعمال" style={{ ...input, flex: 1.5, minWidth: 0 }} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {(Object.keys(WHEN_LABEL) as RxItem["when"][]).map((w) => <button key={w} type="button" onClick={() => set(i, { when: w })} style={{ ...chip(x.when === w, 34), fontSize: 12, padding: "0 10px" }}>{WHEN_LABEL[w]}</button>)}
                  </div>
                  <button type="button" aria-label="حذف" onClick={() => setItems(items.length > 1 ? items.filter((_, j) => j !== i) : [{ ...BLANK }])} style={{ border: "none", background: "transparent", display: "flex" }}><Icon name="trash" size={17} color={C.sub2} /></button>
                </div>
              );
            })}
          </div>
          {err && <ErrorNote style={{ marginTop: 12 }}>{err}</ErrorNote>}
          <div style={{ marginTop: 14 }}><SubmitButton onClick={save} busy={busy} disabled={!filled.length}>إرسال الوصفة للمراجعة</SubmitButton></div>
        </Panel>

        <div className={ac.side} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel title="معاينة">
            <div style={{ borderRadius: 18, border: "1px solid #EFE4F2", padding: 14, background: "#FFFDFE" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Logo height={34} /><span style={{ fontSize: 12, color: C.sub2 }}>{arDate(new Date(), { year: true })}</span></div>
              <div style={{ fontSize: 13, marginTop: 10, fontWeight: 700 }}>{displayName(p.name)}</div>
              {!filled.length ? <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>أضيفي مستحضراً لتظهر المعاينة.</div> : filled.map((x, i) => (
                <div key={i} style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}><b>{x.name}</b><div style={{ color: C.sub }}>{WHEN_LABEL[x.when]}{x.how ? ` · ${x.how}` : ""}</div></div>
              ))}
            </div>
          </Panel>
          {!!last?.length && (
            <Panel title="آخر وصفة" right={<button type="button" onClick={() => setItems(rxItems(last[0]))} style={outlineBtn(32)}>نسخها</button>}>
              <div style={{ fontSize: 12, color: C.sub2, marginBottom: 6 }}>{arDate(new Date(last[0].created_at), { day: false, year: true })}</div>
              {rxItems(last[0]).map((x, i) => <div key={i} style={{ fontSize: 12.5, lineHeight: 1.7 }}>{x.name} · {WHEN_LABEL[x.when]}</div>)}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
