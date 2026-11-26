"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Kpi, Loading, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";
import { arDate } from "@/lib/format";
import { R } from "@/lib/routes";
import { C, CARD } from "@/lib/tokens";

type ApptRow = {
  id: string;
  starts_at: string;
  status: string;
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
  linkBookings: number;
  deskBookings: number;
  noShows: number;
  lastAt: string;
  blocked: boolean;
};

async function fetchBlacklistData(): Promise<ApptRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, starts_at, status, source, patient_id, walk_in_name, walk_in_phone, patient:patients(id, name, file_no, phone)")
    .neq("status", "cancelled")
    .order("starts_at", { ascending: false })
    .limit(3000);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ApptRow[];
}

type BlacklistOverrides = { blocked: string[]; unblocked: string[] };

async function fetchOverrides(): Promise<BlacklistOverrides> {
  const { data } = await supabase.from("settings").select("value").eq("key", "booking_blacklist").maybeSingle();
  const v = (data?.value ?? {}) as Partial<BlacklistOverrides>;
  return { blocked: Array.isArray(v.blocked) ? v.blocked : [], unblocked: Array.isArray(v.unblocked) ? v.unblocked : [] };
}

export default function BlacklistPage() {
  const { staff } = useSession();
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";
  const { data, loading, error } = useQuery(["appointments", "blacklist"], fetchBlacklistData, { enabled: isAdmin });
  const ov = useQuery(["settings", "booking_blacklist"], fetchOverrides, { enabled: isAdmin });
  const [busyKey, setBusyKey] = useState("");

  const entries = useMemo<BlacklistEntry[]>(() => {
    const map = new Map<string, BlacklistEntry>();
    for (const r of data ?? []) {
      const phone = r.patient?.phone || r.walk_in_phone || "";
      const key = r.patient_id || phone || r.id;
      const name = r.patient?.name || r.walk_in_name || "مراجِعة بدون اسم";
      let cur = map.get(key);
      if (!cur) {
        cur = {
          key,
          patientId: r.patient_id,
          fileNo: r.patient?.file_no ?? null,
          name,
          phone,
          linkBookings: 0,
          deskBookings: 0,
          noShows: 0,
          lastAt: r.starts_at,
          blocked: false,
        };
        map.set(key, cur);
      }
      if (r.source === "public") cur.linkBookings += 1;
      else cur.deskBookings += 1;
      if (r.status === "no_show") {
        cur.noShows += 1;
        if (r.starts_at > cur.lastAt) cur.lastAt = r.starts_at;
      }
    }
    const blockedSet = new Set(ov.data?.blocked ?? []);
    const unblockedSet = new Set(ov.data?.unblocked ?? []);
    return [...map.values()]
      .filter((e) => e.noShows > 0 || blockedSet.has(e.phone || e.key))
      .map((e) => {
        const id = e.phone || e.key;
        const auto = e.noShows >= 3;
        return { ...e, blocked: blockedSet.has(id) || (auto && !unblockedSet.has(id)) };
      })
      .sort((a, b) => Number(b.blocked) - Number(a.blocked) || b.noShows - a.noShows || b.lastAt.localeCompare(a.lastAt));
  }, [data, ov.data]);

  async function toggleBlock(e: BlacklistEntry) {
    const id = e.phone || e.key;
    setBusyKey(e.key);
    try {
      const cur = ov.data ?? { blocked: [], unblocked: [] };
      const next: BlacklistOverrides = e.blocked
        ? { blocked: cur.blocked.filter((x) => x !== id), unblocked: [...new Set([...cur.unblocked, id])] }
        : { blocked: [...new Set([...cur.blocked, id])], unblocked: cur.unblocked.filter((x) => x !== id) };
      await supabase.from("settings").upsert({ key: "booking_blacklist", value: next, updated_at: new Date().toISOString() });
      ov.refresh();
    } finally {
      setBusyKey("");
    }
  }

  const blockedCount = entries.filter((e) => e.blocked).length;
  const linkCount = entries.filter((e) => e.linkBookings > 0).length;

  return (
    <AdminShell active="المواعيد" title="القائمة السوداء (عدم الحضور)" subtitle="المراجِعات اللواتي حجزن ولم يحضرن — يُحظر الحجز من الرابط تلقائياً عند 3 مرات">
      <div className="adm-row">
        <Kpi dark label="إجمالي القائمة" value={entries.length} sub="مراجِعة لم تحضر" icon="alert" />
        <Kpi label="محظورات من الرابط" value={blockedCount} sub="3 مرات عدم حضور فأكثر" icon="lock" />
        <Kpi label="حجزن من الرابط" value={linkCount} sub="مرة واحدة على الأقل" icon="link" />
      </div>

      {!staff ? <Loading /> : !isAdmin ? (
        <EmptyState icon="lock" title="للمدراء فقط" text="هذه الصفحة متاحة للإدارة فقط." />
      ) : loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : entries.length === 0 ? (
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
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: C.sub2, flexWrap: "wrap" }}>
                <span>من الرابط: <b className="latin">{e.linkBookings}</b></span>
                <span>·</span>
                <span>من الاستقبال/خدمة العملاء: <b className="latin">{e.deskBookings}</b></span>
                <span>·</span>
                <span>لم تحضر: <b className="latin" style={{ color: e.blocked ? C.danger : C.ink }}>{e.noShows}</b></span>
                <span>·</span>
                <span>آخر مرة: {arDate(new Date(e.lastAt))}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" disabled={busyKey === e.key || e.blocked} onClick={() => e.blocked || toggleBlock(e)}
                  style={{ height: 32, padding: "0 12px", borderRadius: 16, border: "1px solid #EBC9D6", background: "#FDF1F6", color: C.danger, fontSize: 12, fontWeight: 700, cursor: e.blocked ? "default" : "pointer", opacity: e.blocked ? 0.45 : 1 }}>
                  حظر
                </button>
                <button type="button" disabled={busyKey === e.key || !e.blocked} onClick={() => !e.blocked || toggleBlock(e)}
                  style={{ height: 32, padding: "0 12px", borderRadius: 16, border: "1px solid #CFE8E3", background: "#E6F6EF", color: "#1F6A60", fontSize: 12, fontWeight: 700, cursor: !e.blocked ? "default" : "pointer", opacity: !e.blocked ? 0.45 : 1 }}>
                  رفع الحظر
                </button>
                {e.patientId && (
                  <Link href={`${R.W_Record}?id=${e.patientId}`} style={{ fontSize: 13, fontWeight: 700, color: C.accent, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name="user" size={14} color={C.accent} />ملفها
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
