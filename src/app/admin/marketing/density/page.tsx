"use client";

/**
 * كثافة الحجز — when to post marketing stories.
 * 1) occupancy of the coming 7 / 14 days per section with a clear advice, 2) a day × hour heat map of free time,
 * 3) new bookings per day (all + booking link) with «نشرتُ ستوري» markers to see what each story brought.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, EmptyState, ErrorNote, Icon, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, dayKey } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { addPost, advice, getDensity, getPace, listPosts, removePost, type DensityCell, type Grp } from "@/lib/db/density";
import { C, SH } from "@/lib/tokens";
import { MarketingTabs } from "../tabs";

const PANEL: CSSProperties = { borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, minWidth: 0 };
const LATIN: CSSProperties = { fontFamily: "var(--font-rubik), sans-serif", unicodeBidi: "isolate" };
const GRP_LABEL: Record<Grp, string> = { skin: "جلسات البشرة", hair: "جلسات الشعر", consult: "الاستشارات" };
const TONE = {
  green: { bg: "#E7F5EC", fg: "#1F7A3D", dot: "#3BA466" },
  amber: { bg: "#FCF1DE", fg: "#8A5A12", dot: "#D9A13B" },
  red: { bg: "#FBEAF1", fg: "#A23A5C", dot: "#C9557A" },
};
const pctOf = (cells: DensityCell[]) => {
  const cap = cells.reduce((s, c) => s + c.cap, 0);
  return cap ? Math.round((cells.reduce((s, c) => s + c.booked, 0) / cap) * 100) : 0;
};
/** heat colour: free (light) → full (deep mauve) */
const heat = (p: number) => p >= 80 ? "#7B4687" : p >= 60 ? "#A673B4" : p >= 40 ? "#C9A2D6" : p >= 20 ? "#E3C9EC" : "#F6EEF8";
const addDays = (k: string, n: number) => dayKey(new Date(new Date(`${k}T12:00:00`).getTime() + n * 864e5));
const short = (k: string) => arDate(new Date(`${k}T12:00:00`), { day: true });

export default function DensityPage() {
  const dens = useQuery(["density", "grid"], () => getDensity(14));
  const pace = useQuery(["density", "pace"], () => getPace(45));
  const posts = useQuery(["density", "posts"], listPosts);
  const [grp, setGrp] = useState<Grp | "all">("all");
  const today = dayKey();
  const week = addDays(today, 7);

  const cells = dens.data ?? [];
  const sections = (["skin", "hair", "consult"] as Grp[]).map((g) => {
    const all = cells.filter((c) => c.grp === g);
    return { g, w1: pctOf(all.filter((c) => c.day < week)), w2: pctOf(all.filter((c) => c.day >= week)), has: all.length > 0 };
  }).filter((s) => s.has);
  const overall = pctOf(cells.filter((c) => c.day < week));
  const top = advice(overall);

  // heat map: day × hour
  const shown = grp === "all" ? cells : cells.filter((c) => c.grp === grp);
  const days = [...new Set(shown.map((c) => c.day))].sort();
  const hours = [...new Set(shown.map((c) => c.hour))].sort((a, b) => a - b);
  const at = (d: string, h: number) => pctOf(shown.filter((c) => c.day === d && c.hour === h));
  const emptiest = useMemo(() => days.map((d) => ({ d, p: pctOf(shown.filter((c) => c.day === d)) })).filter((x) => x.d > today).sort((a, b) => a.p - b.p).slice(0, 3), [days, shown, today]);

  return (
    <AdminShell active="التسويق والولاء" title="كثافة الحجز" subtitle="متى تنشرين ستوري، ومتى تخفّفين">
      <MarketingTabs active={R.W_Density} />
      {dens.loading && !dens.data ? <Loading /> : dens.error ? <ErrorNote>{dens.error}</ErrorNote> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ---------- 1) occupancy + advice ---------- */}
          <div style={{ ...PANEL, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: TONE[top.tone].bg, border: "1px solid #FFFFFF" }}>
            <span style={{ width: 54, height: 54, borderRadius: 27, background: C.white, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="megaphone" size={24} color={TONE[top.tone].fg} /></span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 13, color: TONE[top.tone].fg, fontWeight: 600 }}>الأيام السبعة القادمة · امتلاء <span style={LATIN}>{overall}%</span></div>
              <div style={{ fontSize: 20, fontWeight: 800, color: TONE[top.tone].fg }}>{top.tip}</div>
              {top.tone !== "red" && emptiest.length > 0 && <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>أكثر الأيام فراغاً: {emptiest.map((x) => `${short(x.d)} (${x.p}%)`).join("، ")}</div>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {sections.map((s) => {
              const a = advice(s.w1);
              return (
                <div key={s.g} style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b style={{ fontSize: 15 }}>{GRP_LABEL[s.g]}</b>
                    <span style={{ height: 26, padding: "0 10px", borderRadius: 13, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: TONE[a.tone].bg, color: TONE[a.tone].fg }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: TONE[a.tone].dot }} />{a.label}
                    </span>
                  </div>
                  {[["هذا الأسبوع", s.w1], ["الأسبوع القادم", s.w2]].map(([l, p]) => (
                    <div key={l as string}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.sub2, marginBottom: 5 }}><span>{l}</span><b style={{ ...LATIN, color: C.ink }}>{p}%</b></div>
                      <div style={{ height: 10, borderRadius: 5, background: "#F3EAF6", overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", borderRadius: 5, background: TONE[advice(p as number).tone].dot }} /></div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* ---------- 2) heat map ---------- */}
          <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 16 }}>خريطة الأوقات</b>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>الفاتح = أوقات فارغة تحتاج نشراً · الغامق = محجوز</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["all", "skin", "hair", "consult"] as const).map((g) => <Chip key={g} height={34} selected={grp === g} onClick={() => setGrp(g)}>{g === "all" ? "الكل" : GRP_LABEL[g]}</Chip>)}
              </div>
            </div>
            {!days.length ? <EmptyState icon="cal" title="لا بيانات" text="لا دوام مسجّل للأيام القادمة." style={{ boxShadow: "none", border: "none" }} /> : (
              <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: 4, minWidth: 520, width: "100%" }}>
                  <thead><tr><th />{hours.map((h) => <th key={h} style={{ ...LATIN, fontSize: 11.5, color: C.sub2, fontWeight: 600 }}>{h > 12 ? h - 12 : h}{h >= 12 ? "م" : "ص"}</th>)}<th style={{ fontSize: 11.5, color: C.sub2, fontWeight: 600 }}>اليوم</th></tr></thead>
                  <tbody>
                    {days.map((d) => (
                      <tr key={d}>
                        <td style={{ fontSize: 12.5, fontWeight: d === today ? 800 : 600, color: d === today ? C.accent : C.ink, whiteSpace: "nowrap", paddingInlineEnd: 6 }}>{d === today ? "اليوم" : short(d)}</td>
                        {hours.map((h) => {
                          const any = shown.some((c) => c.day === d && c.hour === h);
                          const p = at(d, h);
                          return <td key={h} title={any ? `${p}% محجوز` : "خارج الدوام"} style={{ height: 30, borderRadius: 8, background: any ? heat(p) : "transparent", border: any ? "none" : "1px dashed #EEE4F1", textAlign: "center", fontSize: 10.5, color: p >= 60 ? C.white : C.sub2, ...LATIN }}>{any && p > 0 ? p : ""}</td>;
                        })}
                        <td style={{ ...LATIN, fontSize: 12, fontWeight: 700, textAlign: "center", color: TONE[advice(pctOf(shown.filter((c) => c.day === d))).tone].fg }}>{pctOf(shown.filter((c) => c.day === d))}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---------- 3) booking pace + story markers ---------- */}
          <PaceCard pace={pace.data ?? []} posts={posts.data ?? []} loading={pace.loading && !pace.data} error={pace.error} />
        </div>
      )}
    </AdminShell>
  );
}

function PaceCard({ pace, posts, loading, error }: { pace: { day: string; total: number; public_link: number }[]; posts: { id: string; posted_on: string; note: string }[]; loading: boolean; error?: string | null }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const today = dayKey();
  const last30 = pace.slice(-30);
  const max = Math.max(4, ...last30.map((p) => p.total));
  const byDay = new Map(pace.map((p) => [p.day, p]));
  const avg = pace.length ? pace.reduce((s, p) => s + p.total, 0) / pace.length : 0;
  const postDays = new Set(posts.map((p) => p.posted_on));
  const after = (d: string) => [0, 1, 2].reduce((s, i) => s + (byDay.get(addDays(d, i))?.total ?? 0), 0);
  const save = async () => {
    setBusy(true); setErr(null);
    try { await addPost(today, note); setNote(""); } catch (e) { setErr(e instanceof Error ? e.message : "تعذّر الحفظ"); } finally { setBusy(false); }
  };
  return (
    <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <b style={{ fontSize: 16 }}>الحجوزات الجديدة كل يوم</b>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>آخر 30 يوماً · المتوسط <span style={LATIN}>{avg.toFixed(1)}</span> حجز يومياً · النجمة = يوم نُشر فيه ستوري</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="عن ماذا كان الستوري؟ (اختياري)" aria-label="وصف الستوري"
            style={{ height: 40, borderRadius: 20, border: "1px solid #EADCF0", padding: "0 14px", fontSize: 13, minWidth: 200, outline: "none", fontFamily: "inherit" }} />
          <button type="button" disabled={busy || postDays.has(today)} onClick={save} style={{ height: 40, borderRadius: 20, border: "none", background: C.accent, color: C.white, fontSize: 13.5, fontWeight: 700, padding: "0 16px", opacity: busy || postDays.has(today) ? 0.55 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="megaphone" size={16} color={C.white} />{postDays.has(today) ? "سُجّل ستوري اليوم" : "نشرتُ ستوري اليوم"}
          </button>
        </div>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 170, paddingTop: 18, overflowX: "auto", scrollbarWidth: "none" }}>
          {last30.map((p) => (
            <div key={p.day} title={`${short(p.day)}: ${p.total} حجز (${p.public_link} من الرابط)`} style={{ flex: "1 0 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
              {postDays.has(p.day) && <Icon name="star" size={13} color={C.accent} />}
              <div style={{ width: "100%", maxWidth: 22, height: `${(p.total / max) * 120}px`, minHeight: p.total ? 4 : 2, borderRadius: 6, background: "#E3C9EC", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, insetInline: 0, height: `${p.total ? (p.public_link / p.total) * 100 : 0}%`, background: C.accent }} />
              </div>
              <span style={{ ...LATIN, fontSize: 9.5, color: C.muted }}>{Number(p.day.slice(8))}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.sub2 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.accent }} />من رابط الحجز</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#E3C9EC" }} />من الاستقبال والتطبيق</span>
      </div>
      {posts.length > 0 && (
        <div style={{ borderTop: "1px solid #F0E6F3", paddingTop: 12 }}>
          <b style={{ fontSize: 14 }}>أثر كل ستوري</b>
          <div style={{ fontSize: 12, color: C.sub2, marginBottom: 6 }}>حجوزات يوم النشر واليومين التاليين، مقارنة بالمعدّل المعتاد لثلاثة أيام (<span style={LATIN}>{(avg * 3).toFixed(0)}</span>)</div>
          {posts.slice(0, 10).map((p) => {
            const n = after(p.posted_on);
            const up = n - avg * 3;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, borderTop: "1px solid #F6EFF8", fontSize: 13 }}>
                <span style={{ width: 92, color: C.sub }}>{short(p.posted_on)}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.note || "ستوري"}</span>
                <b style={LATIN}>{n}</b><span style={{ color: C.sub2 }}>حجز</span>
                <span style={{ ...LATIN, fontSize: 12, fontWeight: 700, color: up >= 0 ? "#1F7A3D" : "#A23A5C", minWidth: 44, textAlign: "left" }}>{up >= 0 ? "+" : "−"}{Math.abs(Math.round(up))}</span>
                <button type="button" aria-label="حذف" onClick={() => removePost(p.id)} style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "transparent" }}><Icon name="trash" size={14} color={C.muted} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
