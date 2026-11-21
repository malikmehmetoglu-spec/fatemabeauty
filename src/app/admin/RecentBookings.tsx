"use client";

/** «آخر الحجوزات» — the latest booked appointments (by creation time) and where they came from: booking link, app,
 * reception or walk-in (with the staff member who entered it). Live via useLiveAppointments on the dashboard. */
import { useEffect, useState } from "react";
import { Icon, Tag } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { useQuery, must } from "@/lib/db/query";
import { personName, timeOf, STATUS_KIND, STATUS_LABEL, type Appointment } from "@/lib/db/appointments";
import { arDate } from "@/lib/format";
import { C, SH, ICON_FILL } from "@/lib/tokens";

const SEL = "*, service:services(name,short_name,minutes,is_consultation,category_id), room:rooms(name), specialist:staff(id,name,title,photo_url), patient:patients(id,name,file_no,phone,vip)";

type Src = "public" | "app" | "reception" | "walk_in" | "admin" | "other";
const SRC: Record<Src, { label: string; bg: string; fg: string }> = {
  public: { label: "رابط الحجز", bg: "#E6F4EC", fg: "#2D7A4F" },
  app: { label: "التطبيق", bg: "#E8EEFB", fg: "#3A5BA8" },
  reception: { label: "الاستقبال", bg: "#F4EAF7", fg: "#7B4687" },
  walk_in: { label: "حضور مباشر", bg: "#FCF1DE", fg: "#8A5A12" },
  admin: { label: "الإدارة", bg: "#F0EDF0", fg: "#695D6B" },
  other: { label: "غير معروف", bg: "#F0EDF0", fg: "#695D6B" },
};
const srcOf = (s: string | null): Src => (s && s in SRC ? (s as Src) : "other");
const FILTERS: { key: "all" | "public" | "staff" | "app"; label: string }[] = [
  { key: "all", label: "الكل" }, { key: "public", label: "رابط الحجز" }, { key: "staff", label: "الاستقبال" }, { key: "app", label: "التطبيق" },
];

async function listRecent(): Promise<{ rows: Appointment[]; who: Record<string, string> }> {
  const [rows, staff] = await Promise.all([
    supabase.from("appointments").select(SEL).order("created_at", { ascending: false }).limit(40).then(must),
    supabase.from("staff").select("user_id,name").then(must),
  ]);
  const who: Record<string, string> = {};
  for (const s of staff ?? []) if (s.user_id) who[s.user_id] = s.name;
  return { rows: (rows ?? []) as unknown as Appointment[], who };
}

function ago(iso: string, now: number) {
  const m = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "الآن";
  if (m < 60) return m === 1 ? "قبل دقيقة" : m === 2 ? "قبل دقيقتين" : m <= 10 ? `قبل ${m} دقائق` : `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "قبل ساعة" : h === 2 ? "قبل ساعتين" : h <= 10 ? `قبل ${h} ساعات` : `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  return d === 1 ? "أمس" : d === 2 ? "قبل يومين" : d <= 10 ? `قبل ${d} أيام` : `قبل ${d} يوماً`;
}

export function RecentBookings() {
  const q = useQuery(["appointments", "recent"], listRecent);
  const [f, setF] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const all = q.data?.rows ?? [];
  const rows = all.filter((a) => {
    const s = srcOf(a.source);
    return f === "all" || (f === "public" && s === "public") || (f === "app" && s === "app") || (f === "staff" && (s === "reception" || s === "walk_in" || s === "admin"));
  }).slice(0, 10);
  const today = all.filter((a) => now - new Date(a.created_at).getTime() < 864e5);
  const count = (pred: (s: Src) => boolean) => today.filter((a) => pred(srcOf(a.source))).length;

  return (
    <div style={{ borderRadius: 26, padding: "14px 20px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>آخر الحجوزات</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>
            آخر 24 ساعة: {count((s) => s === "public")} من رابط الحجز · {count((s) => s === "reception" || s === "walk_in" || s === "admin")} من الاستقبال · {count((s) => s === "app")} من التطبيق
          </div>
        </div>
        <div role="tablist" aria-label="مصدر الحجز" style={{ display: "flex", gap: 6 }}>
          {FILTERS.map((x) => (
            <button key={x.key} type="button" role="tab" aria-selected={f === x.key} onClick={() => setF(x.key)}
              style={{ height: 30, borderRadius: 15, padding: "0 12px", fontSize: 12.5, fontWeight: f === x.key ? 700 : 500, cursor: "pointer",
                border: f === x.key ? "none" : "1px solid #EADCF0", background: f === x.key ? C.accent : C.white, color: f === x.key ? C.white : C.accent }}>{x.label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        {q.loading ? <div style={{ fontSize: 13, color: C.sub2, padding: "14px 0" }}>جارٍ التحميل…</div>
          : q.error ? <div style={{ fontSize: 13, color: C.danger, padding: "14px 0" }}>تعذّر تحميل آخر الحجوزات.</div>
          : rows.length === 0 ? <div style={{ fontSize: 13, color: C.sub2, padding: "14px 0", borderTop: "1px solid #EDE2F1" }}>لا حجوزات من هذا المصدر بعد.</div>
          : rows.map((a) => {
            const s = SRC[srcOf(a.source)];
            const by = a.created_by ? q.data?.who[a.created_by] : null;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 14, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={srcOf(a.source) === "public" ? "M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5" : "M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16"} size={17} color={C.accentMid} />
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{personName(a)}</div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.service?.short_name ?? a.service_key} · {arDate(new Date(a.starts_at))} <span className="latin">{timeOf(a)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 11, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>
                    {s.label}{by ? ` · ${by}` : ""}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>{ago(a.created_at, now)}</span>
                </div>
                {a.status === "cancelled" && <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>}
              </div>
            );
          })}
      </div>
    </div>
  );
}
