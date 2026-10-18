"use client";

/** W_Dashboard.dc.html — today's real KPIs (Damascus day). Everything is zero/empty when there is no data. */
import Link from "next/link";
import { type ReactNode } from "react";
import { AdminShell } from "@/components/shell";
import { Icon, Loading, ErrorNote, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listDevices, listRooms } from "@/lib/db/catalog";
import { isLow, listInventory } from "@/lib/db/products";
import { getHours, listRange, personName, revenueToday, STATUS_KIND, STATUS_LABEL, timeOf, useLiveAppointments } from "@/lib/db/appointments";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import css from "./calendar/appts.module.css";
import { C, SH, ICON_FILL } from "@/lib/tokens";
import { NEW_BTN } from "./calendar/CalendarBoard";

const CARD = { borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" } as const;
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + (m || 0); };

function IconDot({ d }: { d: string }) {
  return <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={d} size={16} color={C.accentMid} /></span>;
}
function Head({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div style={{ lineHeight: 1.3 }}><div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{title}</div>{sub && <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>}</div>
      {right}
    </div>
  );
}

export default function DashboardPage() {
  useLiveAppointments("dashboard");
  const { staff } = useSession();
  const today = dayKey();
  const appts = useQuery(["appointments", "range", today, today], () => listRange(today));
  const revenue = useQuery(["appointments", "revenue", today], revenueToday);
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const hours = useQuery(["appointments", "hours"], getHours);
  const canStock = staff && ["owner", "admin", "reception"].includes(staff.role);
  const stock = useQuery(["products", "inventory"], listInventory, { enabled: !!canStock });
  const devices = useQuery(["catalog", "devices"], listDevices);

  const all = (appts.data ?? []).filter((a) => a.status !== "cancelled");
  const by = (s: string) => all.filter((a) => a.status === s);
  const done = by("done"), inSession = by("in_session"), checkedIn = by("checked_in"), noShow = by("no_show"), pending = by("pending");
  const upcoming = all.filter((a) => a.status === "confirmed" || a.status === "pending");
  const nowMs = Date.now();
  const due = all.filter((a) => new Date(a.starts_at).getTime() <= nowMs);
  const nowM = toMin(clock());

  const h = hours.data;
  const openMin = h ? Math.max(0, toMin(h.to) - toMin(h.from)) : 0;
  const occ = (rooms.data ?? []).map((r) => {
    const booked = all.filter((a) => a.room_id === r.id && a.status !== "no_show").reduce((s, a) => s + a.minutes, 0);
    return { name: r.name, pct: openMin ? Math.min(100, Math.round((booked / openMin) * 100)) : 0 };
  });

  // opening hours, widened to include any booking/walk-in outside them so the bars always add up to the day's total
  const apptH = all.map((a) => Math.floor(toMin(timeOf(a)) / 60));
  const firstH = Math.min(h ? Math.floor(toMin(h.from) / 60) : 10, ...apptH), lastH = Math.max(h ? Math.ceil(toMin(h.to) / 60) : 18, ...apptH.map((x) => x + 1));
  const hourBars = Array.from({ length: Math.max(0, lastH - firstH) }, (_, i) => {
    const hr = firstH + i;
    const n = all.filter((a) => Math.floor(toMin(timeOf(a)) / 60) === hr).length;
    return { label: `${hr}`, n, state: hr * 60 + 60 <= nowM ? "past" : hr * 60 <= nowM ? "now" : "next" };
  });
  const maxBar = Math.max(1, ...hourBars.map((b) => b.n));

  const queue = [...checkedIn].sort((a, b) => (a.queue_no ?? 0) - (b.queue_no ?? 0)).slice(0, 5);
  const nextList = queue.length ? queue : upcoming.filter((a) => new Date(a.starts_at).getTime() >= nowMs - 15 * 60000).slice(0, 5);

  const bySvc = new Map<string, { name: string; count: number; total: number }>();
  done.forEach((a) => { const k = a.service_key; const e = bySvc.get(k) ?? { name: a.service?.short_name ?? k, count: 0, total: 0 }; e.count++; e.total += a.price; bySvc.set(k, e); });
  const svcRows = [...bySvc.values()].sort((a, b) => b.total - a.total);
  const svcMax = Math.max(1, ...svcRows.map((r) => r.total));

  const low = (stock.data ?? []).filter(isLow).length;
  const devDue = (devices.data ?? []).filter((d) => d.in_maintenance || (d.next_service_at && d.next_service_at <= today));

  const loading = appts.loading || hours.loading;
  return (
    <AdminShell active="لوحة القيادة" title="لوحة القيادة" subtitle={arDate(new Date(), { year: true })}
      actions={<Link href={R.W_BookingModal} style={NEW_BTN}><Icon name="M12 5v14M5 12h14" size={19} color={C.white} stroke={1.9} />موعد جديد</Link>}>
      {appts.error && <ErrorNote>تعذّر تحميل مواعيد اليوم: {appts.error}</ErrorNote>}
      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
          <div className="adm-row" style={{ gap: 16 }}>
            <div style={{ borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
              <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>إيراد اليوم حتى الآن</div>
              <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>{revenue.error ? "—" : money(revenue.data ?? 0)}</div>
              <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>من فواتير اليوم{upcoming.length ? ` · المواعيد المتبقية ${money(upcoming.reduce((s, a) => s + a.price, 0))}` : ""}</div>
            </div>
            <div style={{ ...CARD }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 13, color: C.sub2 }}>مواعيد اليوم</div><IconDot d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" /></div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4 }}>{all.length}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{done.length} انتهت · {inSession.length} في الجلسة · {checkedIn.length} وصلت · {upcoming.length} قادمة{noShow.length ? ` · ${noShow.length} لم تحضر` : ""}</div>
            </div>
            <div style={{ ...CARD }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 13, color: C.sub2 }}>الإشغال المحجوز لكل غرفة</div><IconDot d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
                {occ.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted }}>لم تُضف غرف بعد</div> : occ.map((r) => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.sub2 }}>
                    <span style={{ width: 54, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}><div style={{ width: `${r.pct}%`, height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} /></div>
                    <span className="latin" style={{ width: 34, fontWeight: 700, color: C.ink }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...CARD }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ fontSize: 13, color: C.sub2 }}>نسبة الغياب اليوم</div><IconDot d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" /></div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4 }}>{due.length ? Math.round((noShow.length / due.length) * 100) : 0}%</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{noShow.length} من {due.length} مواعيد مستحقة حتى الآن</div>
            </div>
          </div>

          <div className={css.split}>
            <div style={{ ...CARD, flex: 1.55, minWidth: 0 }}>
              <Head title="المواعيد حسب الساعة" sub={all.length ? `من ${timeOf(all[0])} حتى ${timeOf(all[all.length - 1])}` : "لا مواعيد اليوم بعد"}
                right={<div style={{ display: "flex", gap: 14, fontSize: 12, color: C.sub2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "linear-gradient(180deg,#C9A2D8,#7B4687)" }} />مضت</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent }} />الساعة الحالية</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "#E5CCEA" }} />قادمة</span>
                </div>} />
              <div style={{ display: "flex", gap: 10, height: 194, marginTop: 10, paddingTop: 6, borderTop: "1px dashed #EDE2F1", overflowX: "auto" }}>
                {hourBars.map((b) => (
                  <div key={b.label} style={{ flex: 1, minWidth: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, height: "100%" }}>
                    <div className="latin" style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{b.n}</div>
                    <div style={{ width: "70%", maxWidth: 46, height: Math.max(4, Math.floor((b.n / maxBar) * 142)), borderRadius: "14px 14px 8px 8px", background: b.state === "past" ? "linear-gradient(180deg,#C9A2D8,#7B4687)" : b.state === "now" ? C.accent : "linear-gradient(180deg,#F2E4F5,#E5CCEA)", boxShadow: b.n ? "0 8px 16px rgba(123,70,135,0.18)" : "none" }} />
                    <div className="latin" style={{ fontSize: 12, color: b.state === "now" ? C.accent : b.state === "past" ? C.sub2 : C.muted, fontWeight: b.state === "now" ? 700 : 400 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...CARD, flex: 1, minWidth: 0 }}>
              <Head title={queue.length ? "التالي في الأدوار" : "المواعيد القادمة"} right={
                <Link href={R.W_Queue} style={{ height: 34, borderRadius: 17, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                  <Icon name="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" size={16} color={C.accent} stroke={1.9} />فتح الأدوار
                </Link>} />
              <div style={{ marginTop: 8 }}>
                {nextList.length === 0 ? <div style={{ fontSize: 13, color: C.sub2, padding: "14px 0" }}>لا أحد في الانتظار ولا مواعيد قادمة اليوم.</div> : nextList.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
                    <span className="latin" style={{ width: 40, height: 40, borderRadius: 14, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: a.queue_no != null ? 15 : 12, fontWeight: 700, color: C.accent, flexShrink: 0 }}>{a.queue_no ?? timeOf(a)}</span>
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{personName(a)}</div>
                      <div style={{ fontSize: 12, color: C.sub2 }}>{timeOf(a)} · {a.service?.short_name}{a.room ? ` · ${a.room.name}` : ""}</div>
                    </div>
                    <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={css.split}>
            <div style={{ ...CARD, padding: "14px 20px", flex: 1.55, minWidth: 0 }}>
              <Head title="إيراد اليوم حسب الخدمة" sub={`من الجلسات المنتهية حتى ${clock()}`}
                right={<span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: "#FBEAF1", color: C.danger }}>المجموع {money(svcRows.reduce((s, r) => s + r.total, 0))}</span>} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                {svcRows.length === 0 ? <div style={{ fontSize: 13, color: C.sub2 }}>لم تنتهِ أي جلسة اليوم بعد.</div> : svcRows.map((r) => (
                  <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 120, lineHeight: 1.3 }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 11.5, color: C.sub2 }}>{r.count} جلسات منجزة</div></div>
                    <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#ECE2EF", overflow: "hidden" }}><div style={{ width: `${Math.floor((r.total / svcMax) * 100)}%`, height: 12, borderRadius: 6, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} /></div>
                    <div style={{ width: 110, textAlign: "left", fontSize: 14, fontWeight: 700 }}>{money(r.total)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...CARD, padding: "14px 20px 8px", flex: 1, minWidth: 0 }}>
              <Head title="تنبيهات" />
              <div style={{ marginTop: 4 }}>
                {low > 0 && <Alert href={R.W_Inventory} icon="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" title="مخزون منخفض" sub={`${low} أصناف بلغت حدّ إعادة الطلب`} tag="يحتاج طلب شراء" tone="amber" />}
                {devDue.slice(0, 2).map((d) => <Alert key={d.id} href={R.W_Devices} icon="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" title={d.in_maintenance ? "جهاز في الصيانة" : "صيانة جهاز مستحقة"} sub={d.name} tag={d.in_maintenance ? "متوقف" : "مستحقة"} tone="pink" />)}
                {pending.length > 0 && <Alert href={R.W_Calendar} icon="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" title="مواعيد بانتظار التأكيد" sub={`${pending.length} مواعيد اليوم لم تُؤكَّد بعد`} tag={String(pending.length)} tone="gray" />}
                {low === 0 && devDue.length === 0 && pending.length === 0 && <div style={{ fontSize: 13, color: C.sub2, padding: "14px 0", borderTop: "1px solid #EDE2F1" }}>لا تنبيهات الآن.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Alert({ href, icon, title, sub, tag, tone }: { href: string; icon: string; title: string; sub: string; tag: string; tone: "amber" | "pink" | "gray" }) {
  const t = tone === "amber" ? { background: "#FCF1DE", color: "#8A5A12" } : tone === "pink" ? { background: "#FBEAF1", color: C.danger } : { background: "#F0EDF0", color: "#695D6B" };
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderTop: "1px solid #EDE2F1" }}>
      <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={17} color={C.accentMid} /></span>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div></div>
      <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", ...t }}>{tag}</span>
      <Icon name="M15 6l-6 6 6 6" size={16} color={C.muted} />
    </Link>
  );
}
