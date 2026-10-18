"use client";

/** W_Reviews.dc.html — patient reviews after sessions (live, Supabase). */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DarkCard, DataTable, EmptyState, ErrorNote, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listReviews } from "@/lib/db/marketing";
import { C } from "@/lib/tokens";
import { MarketingTabs } from "../tabs";

const STAR = "M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z";
function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }} aria-label={`${n} من 5`}>
      {[1, 2, 3, 4, 5].map((k) => (
        <svg key={k} width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d={STAR} fill={k <= n ? "#E9A23B" : "#FFFFFF"} stroke={k <= n ? "#D98F26" : "#DFCFE2"} strokeWidth={1.6} strokeLinejoin="round" /></svg>
      ))}
    </span>
  );
}

type F = "all" | "low" | "5" | "4";

export default function ReviewsPage() {
  const { data, loading, error } = useQuery(["reviews", "all"], listReviews);
  const [f, setF] = useState<F>("all");
  const list = data ?? [];
  const avg = list.length ? list.reduce((s, r) => s + r.stars, 0) / list.length : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.stars === s).length }));
  const shown = list.filter((r) => f === "all" || (f === "low" ? r.stars <= 3 : r.stars === Number(f)));

  return (
    <AdminShell active="التسويق والولاء" title="التقييمات" subtitle="تقييمات المراجعات بعد كل جلسة — داخلية أولاً">
      <MarketingTabs active={R.W_Reviews} />
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل التقييمات: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="star" title="لا توجد تقييمات بعد" text="بعد كل جلسة تستطيع المراجعة تقييم تجربتها من التطبيق، وتظهر التقييمات هنا مع اسمها والخدمة والأخصائية." />
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <DarkCard style={{ width: 320, flexShrink: 0 }}>
            <div style={{ fontSize: 13, color: C.onDark }}>متوسط التقييمات</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              <span className="latin" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>{avg.toFixed(1)}</span>
              <div style={{ lineHeight: 1.5 }}>
                <Stars n={Math.round(avg)} size={18} />
                <div style={{ fontSize: 12, color: C.onDark }}>من {list.length} تقييم</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
              {dist.map(({ s, n }) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <span className="latin" style={{ width: 14 }}>{s}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                    <div style={{ width: `${(n / list.length) * 100}%`, height: 6, background: "#E8D6F0" }} />
                  </div>
                  <span className="latin" style={{ width: 22, textAlign: "left" }}>{n}</span>
                </div>
              ))}
            </div>
          </DarkCard>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {([["all", "الكل"], ["low", "تحتاج متابعة"], ["5", "5 نجوم"], ["4", "4 نجوم"]] as [F, string][]).map(([k, t]) => (
                <Chip key={k} selected={f === k} onClick={() => setF(k)}>{t}</Chip>
              ))}
            </div>
            {shown.length === 0 ? <EmptyState compact icon="search" title="لا تقييمات في هذا الاختيار" /> : (
              <DataTable headers={["المراجعة", "التقييم", "الخدمة والأخصائية", "ما أعجبها / ملاحظتها", "التاريخ"]} widths={[1.3, 1, 1.5, 2.6, 1]} rowHeight={68}
                rows={shown.map((r) => [
                  <div key="p" style={{ lineHeight: 1.35 }}>
                    <div style={{ fontWeight: 700 }}>{r.patients?.name || "—"}</div>
                    {r.patients && <div className="latin" style={{ fontSize: 12, color: C.sub2 }}>{r.patients.file_no}</div>}
                  </div>,
                  <span key="s" style={{ display: "flex", flexDirection: "column", gap: 4 }}><Stars n={r.stars} />{r.stars <= 3 && <Tag kind="pink">تحتاج متابعة</Tag>}</span>,
                  <div key="sv" style={{ lineHeight: 1.35, fontSize: 13 }}>
                    <div>{r.appointments?.services?.name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>{r.appointments?.staff?.name ?? ""}</div>
                  </div>,
                  <div key="n" style={{ lineHeight: 1.5, fontSize: 13, minWidth: 0 }}>
                    {r.tags.length > 0 && <div style={{ color: C.accent, fontWeight: 600 }}>{r.tags.join(" · ")}</div>}
                    {r.note && <div style={{ color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.note}>{r.note}</div>}
                    {!r.tags.length && !r.note && <span style={{ color: C.muted }}>—</span>}
                  </div>,
                  <span key="d" style={{ fontSize: 12.5 }}>{arDate(new Date(r.created_at), { day: false })}</span>,
                ])} />
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
