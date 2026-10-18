"use client";

/**
 * تثبيت التطبيق — who installed the patient app (web install, Google Play, App Store).
 * Live data from Supabase `app_installs` (written by the installed app on every launch).
 */
import ac from "../../adminPages.module.css";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Avatar, Card, Chip, DataTable, Icon, Kpi, SectionTitle, Tag } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { C, CARD } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { initials } from "@/lib/data";

type Row = {
  device_id: string; platform: string; channel: string; installed_at: string; last_open_at: string; opens: number;
  patients: { name: string; file_no: number; phone: string | null } | null;
};

const CHANNEL: Record<string, string> = { web: "من المتصفح", play_store: "Google Play", app_store: "App Store" };
const PLATFORM: Record<string, string> = { android: "أندرويد", ios: "آيفون", desktop: "حاسوب", other: "جهاز آخر" };
const DAY = 864e5;

function ago(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  if (d <= 0) return "اليوم";
  if (d === 1) return "أمس";
  if (d < 30) return `قبل ${d} يوماً`;
  return arDate(new Date(iso), { day: false });
}

export default function InstallsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [patientsCount, setPatientsCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "linked" | "inactive">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data, error: e }, { count }] = await Promise.all([
        supabase.from("app_installs").select("device_id,platform,channel,installed_at,last_open_at,opens,patients(name,file_no,phone)").order("installed_at", { ascending: false }),
        supabase.from("patients").select("id", { count: "exact", head: true }),
      ]);
      if (e) setError("تعذّر تحميل البيانات.");
      setRows((data as unknown as Row[]) ?? []);
      setPatientsCount(count ?? 0);
    })();
  }, []);

  const stats = useMemo(() => {
    const list = rows ?? [];
    const now = Date.now();
    const linked = list.filter((r) => r.patients);
    const active7 = list.filter((r) => now - new Date(r.last_open_at).getTime() < 7 * DAY);
    const week = list.filter((r) => now - new Date(r.installed_at).getTime() < 7 * DAY);
    const byChannel = ["web", "play_store", "app_store"].map((c) => ({ c, n: list.filter((r) => r.channel === c).length }));
    const byPlatform = ["android", "ios", "desktop"].map((p) => ({ p, n: list.filter((r) => r.platform === p).length }));
    const days = Array.from({ length: 30 }, (_, i) => {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (29 - i));
      const end = start.getTime() + DAY;
      return { d: start, n: list.filter((r) => { const t = new Date(r.installed_at).getTime(); return t >= start.getTime() && t < end; }).length };
    });
    return { total: list.length, linked: linked.length, active7: active7.length, week: week.length, byChannel, byPlatform, days };
  }, [rows]);

  const shown = (rows ?? []).filter((r) =>
    filter === "all" ? true : filter === "linked" ? !!r.patients : Date.now() - new Date(r.last_open_at).getTime() > 30 * DAY);
  const pct = patientsCount ? Math.round((stats.linked / patientsCount) * 100) : 0;
  const maxDay = Math.max(1, ...stats.days.map((d) => d.n));

  return (
    <AdminShell active="تثبيت التطبيق" title="تثبيت التطبيق" subtitle="من ثبّتت تطبيق المراجِعة، ومن أين، ومتى فتحته آخر مرة">
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="إجمالي التثبيتات" value={stats.total} sub={`${stats.week} هذا الأسبوع`} icon="download" />
        <Kpi label="مراجِعات ثبّتن التطبيق" value={`${pct}%`} sub={`${stats.linked} من ${patientsCount} مراجِعة`} icon="users" />
        <Kpi label="فتحن التطبيق آخر 7 أيام" value={stats.active7} sub="مستخدمات نشطات" icon="refresh" />
        <Kpi label="دون تسجيل دخول" value={stats.total - stats.linked} sub="ثبّتن ولم يدخلن بعد" icon="user" />
      </div>

      <div className={ac.stack} style={{ display: "flex", gap: 14 }}>
        <Card radius={26} padding="18px 20px" style={{ flex: 2, minWidth: 0 }}>
          <SectionTitle>التثبيتات آخر 30 يوماً</SectionTitle>
          <div role="img" aria-label="عدد التثبيتات يومياً" style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 150, marginTop: 16 }}>
            {stats.days.map(({ d, n }, i) => (
              <div key={i} title={`${arDate(d, { day: false })}: ${n}`} style={{ flex: 1, height: `${Math.max(4, (n / maxDay) * 100)}%`, borderRadius: 6,
                background: n ? "linear-gradient(180deg,#C9A2D8,#7B4687)" : "#EFE6F2" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.muted, marginTop: 8 }}>
            <span>{arDate(stats.days[0].d, { day: false })}</span><span>اليوم</span>
          </div>
        </Card>
        <Card radius={26} padding="18px 20px" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionTitle>المصدر</SectionTitle>
          {stats.byChannel.map(({ c, n }) => (
            <Bar key={c} label={CHANNEL[c]} n={n} total={stats.total} />
          ))}
          <div style={{ height: 1, background: C.line }} />
          {stats.byPlatform.map(({ p, n }) => (
            <Bar key={p} label={PLATFORM[p]} n={n} total={stats.total} />
          ))}
        </Card>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>الكل · {stats.total}</Chip>
        <Chip selected={filter === "linked"} onClick={() => setFilter("linked")}>مراجِعات معروفات · {stats.linked}</Chip>
        <Chip selected={filter === "inactive"} onClick={() => setFilter("inactive")}>لم يفتحن منذ 30 يوماً</Chip>
      </div>

      {rows === null ? (
        <Card radius={26} padding={30} style={{ textAlign: "center", color: C.sub2 }}>جارٍ التحميل…</Card>
      ) : error ? (
        <Card radius={26} padding={30} style={{ textAlign: "center", color: C.danger }}>{error}</Card>
      ) : shown.length === 0 ? (
        <div style={{ ...CARD, borderRadius: 26, padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <span style={{ width: 64, height: 64, borderRadius: 32, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="download" size={28} /></span>
          <div style={{ fontSize: 17, fontWeight: 700 }}>لا توجد تثبيتات بعد</div>
          <div style={{ fontSize: 13.5, color: C.sub, maxWidth: 420, lineHeight: 1.8 }}>ستظهر هنا كل مراجِعة تثبّت التطبيق من المتصفح أو من المتجرين، ويُربط اسمها تلقائياً عند تسجيل دخولها.</div>
        </div>
      ) : (
        <DataTable
          headers={["المراجِعة", "الجهاز", "المصدر", "تاريخ التثبيت", "آخر فتح", "مرات الفتح"]}
          widths={[2.2, 1, 1.1, 1.2, 1, 0.8]} minWidth={760}
          rows={shown.map((r) => [
            r.patients
              ? <><Avatar initials={initials(r.patients.name || "؟")} size={34} /><div style={{ lineHeight: 1.3 }}><div style={{ fontWeight: 700 }}>{r.patients.name || "دون اسم"}</div><div style={{ fontSize: 12, color: C.sub2 }}>ملف {r.patients.file_no}</div></div></>
              : <><Avatar initials="؟" size={34} /><span style={{ color: C.sub2 }}>لم تسجّل دخولها بعد</span></>,
            PLATFORM[r.platform] ?? r.platform,
            <Tag key="c" kind={r.channel === "web" ? "lilac" : "green"}>{CHANNEL[r.channel] ?? r.channel}</Tag>,
            arDate(new Date(r.installed_at), { day: false }),
            ago(r.last_open_at),
            r.opens,
          ])}
        />
      )}
    </AdminShell>
  );
}

function Bar({ label, n, total }: { label: string; n: number; total: number }) {
  const p = total ? Math.round((n / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
        <span>{label}</span><span style={{ color: C.sub2 }}>{n} · {p}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: 7, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
      </div>
    </div>
  );
}
