"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listActivePackages, listLapsed } from "@/lib/db/clinical";
import { maskPhone } from "@/lib/db/patients";
import { C, ICON_FILL } from "@/lib/tokens";
import { Bar, chip, displayName, fileHref, Initials, outlineBtn, Panel } from "../patients/kit";

const GAPS = [30, 45, 60, 90];
const CONTACTED_KEY = "fb.care.contacted";

/** W_CarePlans.dc.html — خطط العناية. */
export default function CarePlansPage() {
  const { data: plans, loading, error } = useQuery(["clinical", "care-plans"], listActivePackages);
  const [gap, setGap] = useState(45);
  const { data: lapsed, loading: ll } = useQuery(["clinical", "lapsed", gap], () => listLapsed(gap));
  const [contacted, setContacted] = useState<Record<string, string>>({});
  useEffect(() => { try { setContacted(JSON.parse(localStorage.getItem(CONTACTED_KEY) || "{}")); } catch { /* ignore */ } }, []);
  function markContacted(id: string) {
    const next = { ...contacted, [id]: dayKey() };
    setContacted(next);
    try { localStorage.setItem(CONTACTED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  const today = dayKey();
  const all = useMemo(() => plans ?? [], [plans]);
  const todayCount = all.filter((p) => p.next && dayKey(new Date(p.next)) === today).length;
  const byService = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of all) { const n = p.packages?.name ?? "باقة"; m.set(n, (m.get(n) ?? 0) + 1); }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);

  const kpi = (icon: string, label: string, value: number | string, sub: string) => (
    <Panel style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={20} /></span>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>{label}</div>
          <div className="latin" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>{sub}</div>
        </div>
      </div>
    </Panel>
  );

  return (
    <AdminShell active="جدولي" title="خطط العناية" subtitle="متابعة الباقات والجلسات المتبقية لكل مراجعة"
      actions={<Link href={R.W_MyDay} style={outlineBtn()}><Icon name="cal" color={C.accent} size={16} stroke={1.9} />جدولي اليوم</Link>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {kpi("layers", "خطط نشطة", all.length, "باقات قيد التنفيذ")}
          {kpi("calcheck", "جلسات خطط اليوم", todayCount, "ضمن مواعيد اليوم")}
          {kpi("alert", "منقطعات", lapsed?.length ?? 0, `لم يزرن منذ ${gap} يوماً أو أكثر`)}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Panel title="باقات قيد التنفيذ" style={{ flex: 1, minWidth: 560 }}>
            {error ? <ErrorNote>{error}</ErrorNote> : loading ? <Loading /> : !all.length ? (
              <EmptyState compact icon="layers" title="لا باقات نشطة" text="عندما تشتري مراجعة باقة جلسات تظهر هنا مع تقدّمها وموعدها القادم." />
            ) : (
              <>
                <div style={{ display: "flex", gap: 12, height: 34, alignItems: "center", fontSize: 12, color: C.sub2, fontWeight: 600 }}>
                  <span style={{ flex: 1.4 }}>المراجعة</span><span style={{ flex: 1.2 }}>الخطة</span><span style={{ flex: 1 }}>التقدم</span><span style={{ flex: 1 }}>الموعد القادم</span><span style={{ flex: 0.8 }}>الحالة</span>
                </div>
                {all.map((p) => {
                  const left = p.sessions_total - p.sessions_used;
                  const stale = !p.next && p.last && Date.now() - new Date(p.last).getTime() > 30 * 864e5;
                  return (
                    <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", minHeight: 56, borderTop: "1px solid #EDE2F1", fontSize: 13.5 }}>
                      <Link href={fileHref(R.W_Record, "id", p.patient_id)} style={{ flex: 1.4, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <Initials name={p.patients?.name ?? ""} size={32} /><span style={{ fontWeight: 700 }}>{displayName(p.patients?.name)}</span>
                      </Link>
                      <span style={{ flex: 1.2 }}>{p.packages?.name ?? "باقة"}</span>
                      <div style={{ flex: 1, lineHeight: 1.4 }}><div className="latin" style={{ fontSize: 12.5, fontWeight: 600 }}>{p.sessions_used}/{p.sessions_total}</div><Bar done={p.sessions_used} total={p.sessions_total} /></div>
                      <span style={{ flex: 1, color: C.sub }}>{p.next ? (dayKey(new Date(p.next)) === today ? `اليوم ${clock(p.next)}` : arDate(new Date(p.next))) : "—"}</span>
                      <span style={{ flex: 0.8 }}>
                        {left === 1 ? <Tag kind="amber">الأخيرة</Tag> : stale ? <Tag kind="pink">يحتجن متابعة</Tag> : p.sessions_used === 0 ? <Tag kind="lilac">بدأت حديثاً</Tag> : <Tag kind="green">منتظمة</Tag>}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </Panel>

          <div style={{ width: 360, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel title="منقطعات يحتجن اتصالاً" right={<div style={{ display: "flex", gap: 4 }}>{GAPS.map((g) => <button key={g} type="button" onClick={() => setGap(g)} className="latin" style={{ ...chip(gap === g, 30), padding: "0 10px", fontSize: 12 }}>{g}</button>)}</div>}>
              {ll ? <Loading /> : !lapsed?.length ? <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>لا مراجعات انقطعن أكثر من {gap} يوماً بدون موعد قادم.</div> : lapsed.map((l) => (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #EDE2F1" }}>
                  <Initials name={l.name} size={32} />
                  <Link href={fileHref(R.W_Record, "id", l.id)} style={{ flex: 1, lineHeight: 1.35, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{displayName(l.name)}</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>منذ <span className="latin">{l.days}</span> يوماً{l.service ? ` · ${l.service}` : ""} · <span dir="ltr" className="latin">{maskPhone(l.phone)}</span></div>
                  </Link>
                  {contacted[l.id] ? <Tag kind="green">تم التواصل</Tag> : <button type="button" onClick={() => markContacted(l.id)} style={outlineBtn(32)}><Icon name="phone" size={14} color={C.accent} />تم التواصل</button>}
                </div>
              ))}
            </Panel>
            <Panel title="الخطط النشطة حسب الخدمة">
              {!byService.length ? <div style={{ fontSize: 13, color: C.muted }}>—</div> : byService.map(([n, c]) => (
                <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid #EDE2F1", fontSize: 13.5 }}><span>{n}</span><span className="latin" style={{ fontWeight: 700, color: C.accent }}>{c}</span></div>
              ))}
            </Panel>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
