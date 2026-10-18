"use client";

/** W_Reports.dc.html — التقارير (live): appointments, no-shows, new vs returning patients, top services, satisfaction — all computed. */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { dayOf, daysRange, financeData, opsData, shiftDay, sumBy } from "@/lib/db/finance";
import { AR_DAYS } from "@/lib/data";
import { arDate, dayKey, money } from "@/lib/format";
import { C } from "@/lib/tokens";
import { Bars, Big, Donut, LATIN, PANEL, PanelTitle, Pill, ShareList, StatCard } from "../finance/parts";

type P = "today" | "week" | "month" | "w8";
const P_LABEL: Record<P, string> = { today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر", w8: "آخر 8 أسابيع" };

/** Monday of the week containing `key`. */
function monday(key: string) {
  const dow = new Date(`${key}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return shiftDay(key, -((dow + 6) % 7));
}
function periodRange(p: P) {
  const t = dayKey();
  const from = p === "today" ? t : p === "week" ? monday(t) : p === "month" ? `${t.slice(0, 7)}-01` : shiftDay(monday(t), -49);
  return daysRange(from, shiftDay(t, 1));
}

export default function Page() {
  const [p, setP] = useState<P>("w8");
  const r = periodRange(p);
  const ops = useQuery(["finance", "ops", r.fromDay, r.toDay], () => opsData(r.from, r.to));
  const fin = useQuery(["finance", "range", r.fromDay, r.toDay], () => financeData(r));
  const today = dayKey();

  const appts = ops.data?.appointments ?? [];
  const past = appts.filter((a) => dayOf(a.starts_at) <= today && a.status !== "cancelled");
  const noShows = past.filter((a) => a.status === "no_show").length;
  const attended = past.filter((a) => ["done", "checked_in", "in_session"].includes(a.status));
  const cancelled = appts.filter((a) => a.status === "cancelled").length;
  const concluded = noShows + attended.length;
  const noShowRate = concluded ? Math.round((noShows / concluded) * 100) : 0;
  const reviews = ops.data?.reviews ?? [];
  const avgStars = reviews.length ? reviews.reduce((s, x) => s + x.stars, 0) / reviews.length : 0;
  const revenue = (fin.data?.invoices ?? []).reduce((s, i) => s + i.total, 0);

  // new vs returning among attending patients
  const attendees = [...new Set(attended.map((a) => a.patient_id).filter(Boolean))] as string[];
  const returning = attendees.filter((id) => ops.data?.returning.has(id)).length;
  const fresh = attendees.length - returning;
  const walkIns = attended.filter((a) => !a.patient_id).length;

  // buckets: days for today/week, weeks otherwise
  const daily = p === "today" || p === "week";
  const keys: string[] = [];
  if (daily) for (let d = r.fromDay; d < r.toDay; d = shiftDay(d, 1)) keys.push(d);
  else for (let d = monday(r.fromDay); d < r.toDay; d = shiftDay(d, 7)) keys.push(d);
  const bucketOf = (ts: string) => (daily ? dayOf(ts) : monday(dayOf(ts)));
  const label = (k: string) => (daily ? AR_DAYS[new Date(`${k}T12:00:00Z`).getUTCDay()] : `${Number(k.slice(8))}/${Number(k.slice(5, 7))}`);
  const count = (rows: { ts: string }[]) => keys.map((k) => ({ label: label(k), value: rows.filter((x) => bucketOf(x.ts) === k).length, title: arDate(new Date(`${k}T12:00:00`)) }));
  const apptBars = count(appts.filter((a) => a.status !== "cancelled").map((a) => ({ ts: a.starts_at })));
  const newBars = count((ops.data?.newPatients ?? []).map((x) => ({ ts: x.created_at })));
  const starBars = keys.map((k) => {
    const rs = reviews.filter((x) => bucketOf(x.created_at) === k);
    return { label: label(k), value: rs.length ? Math.round((rs.reduce((s, x) => s + x.stars, 0) / rs.length) * 10) / 10 : 0, title: `${rs.length} تقييم` };
  });
  const services = sumBy(attended, (a) => a.services?.name ?? a.service_key, () => 1);
  const sources = sumBy(appts, (a) => ({ app: "التطبيق", reception: "الاستقبال", walk_in: "بدون موعد", admin: "الإدارة" }[a.source] ?? a.source), () => 1);
  const loading = ops.loading || fin.loading;
  const error = ops.error || fin.error;

  return (
    <AdminShell active="التقارير" title="التقارير" subtitle={`نظرة تحليلية على المواعيد والغياب والخدمات والرضا · ${P_LABEL[p]}`} actions={
      <div style={{ display: "flex", gap: 8 }}>{(Object.keys(P_LABEL) as P[]).map((k) => <Pill key={k} on={p === k} onClick={() => setP(k)} style={{ height: 44 }}>{P_LABEL[k]}</Pill>)}</div>}>
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل التقارير: {error}</ErrorNote> : (<>
        <div style={{ display: "flex", gap: 14 }}>
          <StatCard dark label={`المواعيد · ${P_LABEL[p]}`} value={appts.length - cancelled} sub={`${attended.length} حضرت · ${cancelled} ملغاة`} icon="cal" />
          <StatCard label="نسبة الغياب" value={<>{noShowRate}<span style={{ fontSize: 16 }}>%</span></>} sub={`${noShows} لم تحضر من ${concluded} موعداً مضى`} icon="calx" />
          <StatCard label="مراجعات جديدات" value={(ops.data?.newPatients ?? []).length} sub={`ملفات فُتحت ${P_LABEL[p]}`} icon="users" />
          <StatCard label="الإيراد" value={<Big n={revenue} />} sub={`${(fin.data?.invoices ?? []).length} فاتورة`} icon="wallet" />
          <StatCard label="متوسط التقييم" value={reviews.length ? <span style={LATIN}>{avgStars.toFixed(1)}</span> : "—"} sub={`من ${reviews.length} تقييم`} icon="star" />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ ...PANEL, flex: 1.5 }}>
            <PanelTitle right={daily ? "يومياً" : "أسبوعياً · تبدأ الأسابيع يوم الإثنين"}>المواعيد</PanelTitle>
            <Bars data={apptBars} fmt={(n) => `${n} موعد`} highlight={apptBars.length - 1} />
          </div>
          <div style={{ ...PANEL, flex: 1 }}>
            <PanelTitle right={`${attended.length} جلسة`}>توزيع الخدمات</PanelTitle>
            <ShareList data={services.slice(0, 6)} fmt={(n) => `${n} جلسة`} empty="لا جلسات حضرت في هذه الفترة" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ ...PANEL, flex: 1 }}>
            <PanelTitle right="بين من حضرن">جديدات مقابل عائدات</PanelTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Donut size={130} data={[["عائدات", returning], ["جديدات", fresh], ["بدون ملف", walkIns]]} center={<><b style={{ ...LATIN, fontSize: 18 }}>{attendees.length ? Math.round((returning / attendees.length) * 100) : 0}%</b><span style={{ fontSize: 11, color: C.sub2 }}>احتفاظ</span></>} />
              <div style={{ flex: 1 }}><ShareList data={[["عائدات", returning], ["جديدات", fresh], ["بدون ملف", walkIns]]} fmt={(n) => String(n)} empty="لا زيارات بعد" /></div>
            </div>
          </div>
          <div style={{ ...PANEL, flex: 1 }}>
            <PanelTitle right={daily ? "يومياً" : "أسبوعياً"}>ملفات جديدة</PanelTitle>
            <Bars data={newBars} height={130} fmt={(n) => `${n} ملف`} />
          </div>
          <div style={{ ...PANEL, flex: 1 }}>
            <PanelTitle right={reviews.length ? `${reviews.length} تقييم` : undefined}>رضا المراجعات</PanelTitle>
            <Bars data={starBars} height={130} fmt={(n) => `${n} / 5`} />
          </div>
        </div>

        <div style={PANEL}>
          <PanelTitle>مصدر الحجز</PanelTitle>
          <ShareList data={sources} fmt={(n) => `${n} موعد`} empty="لا مواعيد في هذه الفترة" />
          {revenue > 0 && attended.length > 0 && <div style={{ marginTop: 12, fontSize: 12.5, color: C.sub2 }}>متوسط الإيراد لكل زيارة: {money(Math.round(revenue / attended.length))}</div>}
        </div>
      </>)}
    </AdminShell>
  );
}
