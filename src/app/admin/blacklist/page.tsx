"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Kpi, Loading, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { supabase } from "@/lib/supabase/client";
import { arDate } from "@/lib/format";
import { R } from "@/lib/routes";
import { C, CARD } from "@/lib/tokens";

type NoShowRow = {
  id: string;
  starts_at: string;
  source: string | null;
  patient_id: string | null;
  walk_in_name: string | null;
  walk_in_phone: string | null;
  patient: { id: string; name: string | null; file_no: number; phone: string | null } | null;
};

type BlacklistEntry = {
  key: string;
  patientId: string | null;
  fileNo: number | null;
  name: string;
  phone: string;
  total: number;
  fromLink: number;
  lastAt: string;
  blocked: boolean;
};

async function fetchNoShows(): Promise<NoShowRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, starts_at, source, patient_id, walk_in_name, walk_in_phone, patient:patients(id, name, file_no, phone)")
    .eq("status", "no_show")
    .order("starts_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as NoShowRow[];
}

export default function BlacklistPage() {
  const { data, loading, error } = useQuery(["appointments", "blacklist"], fetchNoShows);

  const entries = useMemo<BlacklistEntry[]>(() => {
    const map = new Map<string, BlacklistEntry>();
    for (const r of data ?? []) {
      const phone = r.patient?.phone || r.walk_in_phone || "";
      const key = r.patient_id || phone || r.id;
      const name = r.patient?.name || r.walk_in_name || "مراجِعة بدون اسم";
      const cur = map.get(key);
      if (cur) {
        cur.total += 1;
        if (r.source === "public") cur.fromLink += 1;
        if (r.starts_at > cur.lastAt) cur.lastAt = r.starts_at;
        cur.blocked = cur.total >= 3;
      } else {
        map.set(key, {
          key,
          patientId: r.patient_id,
          fileNo: r.patient?.file_no ?? null,
          name,
          phone,
          total: 1,
          fromLink: r.source === "public" ? 1 : 0,
          lastAt: r.starts_at,
          blocked: false,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total || b.lastAt.localeCompare(a.lastAt));
  }, [data]);

  const blockedCount = entries.filter((e) => e.blocked).length;
  const linkCount = entries.filter((e) => e.fromLink > 0).length;

  return (
    <AdminShell active="المواعيد" title="القائمة السوداء (عدم الحضور)" subtitle="المراجِعات اللواتي حجزن ولم يحضرن — يُحظر الحجز من الرابط تلقائياً عند 3 مرات">
      <div className="adm-row">
        <Kpi dark label="إجمالي القائمة" value={entries.length} sub="مراجِعة لم تحضر" icon="alert" />
        <Kpi label="محظورات من الرابط" value={blockedCount} sub="3 مرات عدم حضور فأكثر" icon="lock" />
        <Kpi label="حجزن من الرابط" value={linkCount} sub="مرة واحدة على الأقل" icon="link" />
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : entries.length === 0 ? (
        <EmptyState icon="check" title="القائمة السوداء فارغة" text="لا توجد أي حالة عدم حضور مسجّلة." />
      ) : (
        <div style={{ ...CARD, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e) => (
            <div key={e.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" }}>
              <div style={{ flex: 1.4, minWidth: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b style={{ fontSize: 14.5 }}>{e.name}</b>
                  {e.fileNo != null && <span className="latin" style={{ fontSize: 12, color: C.sub2 }}>#{e.fileNo}</span>}
                  {e.blocked && <Tag kind="pink">محظورة من الرابط</Tag>}
                </div>
                {e.phone && <div className="latin" dir="ltr" style={{ fontSize: 12.5, color: C.sub2, textAlign: "right" }}>{e.phone}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: C.sub2 }}>
                <span>عدم الحضور: <b className="latin" style={{ color: e.blocked ? C.danger : C.ink }}>{e.total}</b></span>
                <span>·</span>
                <span>من الرابط: <b className="latin">{e.fromLink}</b></span>
                <span>·</span>
                <span>آخر مرة: {arDate(new Date(e.lastAt))}</span>
              </div>
              {e.patientId && (
                <Link href={`${R.W_Record}?id=${e.patientId}`} style={{ fontSize: 13, fontWeight: 700, color: C.accent, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="user" size={14} color={C.accent} />ملفها
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
