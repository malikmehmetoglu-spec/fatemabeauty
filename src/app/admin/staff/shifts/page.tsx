"use client";

/**
 * أوقات الدوام — fixed weekly working hours per staff member (Supabase `staff_hours`).
 * Replaces the old dated «الورديات» grid (table staff_shifts is kept but no longer shown).
 * Bookings follow these hours exactly, on any weekday (database: private.staff_available / slot_grid — no clinic clipping).
 * A member with no hours follows the default hours «الدوام الافتراضي» (settings.hours, edited at the top of this page,
 * together with the slot length).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminShell } from "@/components/shell";
import { Card, Chip, EmptyState, ErrorNote, Icon, Loading, Tag, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { getHours, saveHours, type Hours } from "@/lib/db/appointments";
import { listStaffHours, saveStaffHours, type HourRange, type Staff, type StaffHour } from "@/lib/db/staff";
import { ROLE_LABEL, useSession } from "@/lib/supabase/session";
import { AR_DAYS } from "@/lib/data";
import { C, SHB } from "@/lib/tokens";
import { StaffAvatar, TeamTabs, errText, useTeam } from "../team-ui";
import css from "./hours.module.css";
import { ConsultTemplate } from "./ConsultTemplate";
import { getReserveSettings, saveReserveSettings, GOLD, GOLD_DEEP, type ReserveSettings } from "@/lib/db/vip";

/** Syrian week: Saturday first. */
const WEEK = [6, 0, 1, 2, 3, 4, 5];
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const hm = (t: string) => t.slice(0, 5);
/** Pickers span the whole working day: 06:00 … 24:00 in slot steps. */
const DAY_FROM = 6 * 60, DAY_TO = 24 * 60;
const dayTimes = (step: number) => { const out: string[] = []; for (let t = DAY_FROM; t <= DAY_TO; t += step) out.push(hhmm(t)); return out; };
const SLOT_CHOICES = [5, 10, 15, 20, 30, 45, 60];

type Range = { from: string; to: string };
type Week = Record<number, Range[]>; // weekday → ranges (empty = day off)

const emptyWeek = (): Week => Object.fromEntries(WEEK.map((d) => [d, []])) as unknown as Week;

function weekOf(rows: StaffHour[], staffId: string): Week | null {
  const mine = rows.filter((r) => r.staff_id === staffId);
  if (!mine.length) return null;
  const w = emptyWeek();
  for (const r of mine) w[r.weekday].push({ from: hm(r.starts), to: hm(r.ends) });
  for (const d of WEEK) w[d].sort((a, b) => a.from.localeCompare(b.from));
  return w;
}

const sameRanges = (a: Range[], b: Range[]) => a.length === b.length && a.every((r, i) => r.from === b[i].from && r.to === b[i].to);

/** «السبت–الخميس 10:00–13:00 · الجمعة 16:00–18:00» */
function summary(w: Week | null): ReactNode {
  if (!w) return "يتبع الدوام الافتراضي (لم يُحدَّد جدول بعد)";
  const parts: { days: string; times: string }[] = [];
  let i = 0;
  while (i < WEEK.length) {
    const r = w[WEEK[i]];
    if (!r.length) { i++; continue; }
    let j = i;
    while (j + 1 < WEEK.length && w[WEEK[j + 1]].length && sameRanges(w[WEEK[j + 1]], r)) j++;
    const days = i === j ? AR_DAYS[WEEK[i]] : `${AR_DAYS[WEEK[i]]}–${AR_DAYS[WEEK[j]]}`;
    parts.push({ days, times: r.map((x) => `${x.from}–${x.to}`).join(" , ") });
    i = j + 1;
  }
  if (!parts.length) return "لا أيام عمل محدّدة";
  return parts.map((x, i) => (
    <span key={i}>{i > 0 && " · "}{x.days} <span className="latin" dir="ltr" style={{ unicodeBidi: "isolate", whiteSpace: "nowrap" }}>{x.times}</span></span>
  ));
}

const ORDER = (s: Staff) => (s.is_consultant ? 0 : s.role === "specialist" ? 1 : s.role === "owner" || s.role === "admin" ? 2 : 3);

export default function WorkingHoursPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin";
  const team = useTeam();
  const hours = useQuery(["appointments", "hours"], getHours);
  const rows = useQuery(["staff_hours", "all"], listStaffHours);
  const members = useMemo(() => [...team.active].sort((a, b) => ORDER(a) - ORDER(b)), [team.active]);

  const loading = team.loading || hours.loading || rows.loading;
  const error = team.error || hours.error || rows.error;
  return (
    <AdminShell active="فريق العمل" title="أوقات الدوام" subtitle="جدول أسبوعي ثابت لكل موظفة — الحجوزات تتبعه تلقائياً">
      <TeamTabs />
      <div className={css.hint}>
        <Icon name="clock" size={20} color={C.accent} />
        <div>
          <b>الحجوزات تتبع هذه الأوقات.</b> لكل أخصائية ومستشارة دوامها الخاص في أي يوم من الأسبوع (حتى الجمعة والمساء)، ولا تظهر للمراجِعات
          (في التطبيق ورابط الحجز) إلا الأوقات التي تداوم فيها. يُفتح اليوم للحجز إذا كانت إحداهن تداوم فيه.
          الموظفة التي لم يُحدَّد لها جدول تتبع «الدوام الافتراضي». يمكن للاستقبال الحجز خارج الدوام عند الحاجة مع تنبيه.
        </div>
      </div>
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل أوقات الدوام: {error}</ErrorNote> : members.length === 0 ? (
        <EmptyState icon="users" title="لا يوجد فريق بعد" text="أضيفي الموظفات من صفحة الفريق أولاً، ثم حدّدي أوقات دوام كل واحدة هنا." />
      ) : (
        <div className={css.list}>
          {canManage && <DefaultHoursCard hours={hours.data!} />}
          {canManage && <ReserveCard />}
          {members.map((s) => (
            <MemberCard key={s.id} s={s} clinic={hours.data!} saved={weekOf(rows.data ?? [], s.id)} canManage={canManage} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function MemberCard({ s, clinic, saved, canManage }: { s: Staff; clinic: Hours; saved: Week | null; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [week, setWeek] = useState<Week>(() => saved ?? emptyWeek());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const savedKey = JSON.stringify(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setWeek(saved ?? emptyWeek()); }, [savedKey]);

  const step = Math.max(5, clinic.slot || 15);
  const times = useMemo(() => dayTimes(step), [step]);
  const clinicRange: Range = { from: hhmm(toMin(clinic.from)), to: hhmm(toMin(clinic.to)) };
  const isDefaultDay = (d: number) => clinic.days.includes(d);
  const dirty = JSON.stringify(week) !== JSON.stringify(saved ?? emptyWeek());

  const setDay = (d: number, r: Range[]) => { setWeek((w) => ({ ...w, [d]: r })); setMsg(null); };
  const firstWorking = WEEK.find((d) => week[d].length);

  function validate(): string | null {
    for (const d of WEEK) {
      const r = week[d];
      for (const x of r) if (x.to <= x.from) return `${AR_DAYS[d]}: وقت النهاية يجب أن يكون بعد البداية.`;
      if (r.length === 2 && r[1].from < r[0].to) return `${AR_DAYS[d]}: الفترتان متداخلتان.`;
    }
    return null;
  }

  async function save(w: Week) {
    const err = validate();
    if (err) { setMsg({ ok: false, text: err }); return; }
    const ranges: HourRange[] = WEEK.flatMap((d) => w[d].map((x) => ({ weekday: d, starts: x.from, ends: x.to })));
    if (!ranges.length && saved && !confirm(`لا أيام عمل في الجدول — ستتبع ${s.name} الدوام الافتراضي. متابعة؟`)) return;
    setBusy(true); setMsg(null);
    try {
      await saveStaffHours(s.id, ranges);
      setMsg({ ok: true, text: ranges.length ? "حُفظت أوقات الدوام." : "أُلغي الجدول — تتبع الآن الدوام الافتراضي." });
    } catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); }
  }

  const roleTag = s.is_consultant ? <Tag kind="plum">مستشارة</Tag> : <Tag kind={s.role === "specialist" ? "pink" : s.role === "owner" || s.role === "admin" ? "lilac" : "gray"}>{ROLE_LABEL[s.role]}</Tag>;
  const shown: Week | null = open ? week : saved;

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div className={css.head}>
        <StaffAvatar s={s} size={46} />
        <div className={css.who}>
          <div className={css.name}><b>{s.name}</b>{roleTag}{!saved && <Tag kind="silver">الدوام الافتراضي</Tag>}</div>
          <div className={css.sum}>{summary(saved)}</div>
        </div>
        <button type="button" className={css.toggleBtn} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <Icon name={canManage ? "edit" : "eye"} size={15} color={C.accent} />{open ? "إغلاق" : canManage ? "تعديل الدوام" : "عرض"}
        </button>
      </div>

      {open && (
        <div className={css.body}>
          {canManage && (
            <div className={css.quick}>
              <button type="button" className={css.chip} onClick={() => setWeek(Object.fromEntries(WEEK.map((d) => [d, isDefaultDay(d) ? [{ ...clinicRange }] : []])) as unknown as Week)}>الدوام الافتراضي</button>
              <button type="button" className={css.chip} disabled={firstWorking === undefined}
                onClick={() => firstWorking !== undefined && setWeek(Object.fromEntries(WEEK.map((d) => [d, week[d].length || isDefaultDay(d) ? week[firstWorking].map((x) => ({ ...x })) : []])) as unknown as Week)}>
                نسخ {firstWorking !== undefined ? `دوام ${AR_DAYS[firstWorking]}` : ""} إلى كل الأيام
              </button>
              {saved && <button type="button" className={css.chip} onClick={() => { if (!confirm(`إلغاء جدول ${s.name}؟ ستتبع الدوام الافتراضي.`)) return; setWeek(emptyWeek()); void saveStaffHours(s.id, []).then(() => setMsg({ ok: true, text: "أُلغي الجدول — تتبع الآن الدوام الافتراضي." })).catch((e) => setMsg({ ok: false, text: errText(e) })); }}>إلغاء الجدول (اتباع الدوام الافتراضي)</button>}
            </div>
          )}
          <div className={css.days}>
            {WEEK.map((d) => {
              const r = (shown ?? emptyWeek())[d];
              const on = r.length > 0;
              return (
                <div key={d} className={css.day} data-off={!on ? "1" : undefined}>
                  <div className={css.dayName}>{AR_DAYS[d]}</div>
                  {(
                    <>
                      <label className={css.work}>
                        <Toggle on={on} label={`يوم عمل — ${AR_DAYS[d]}`} onChange={canManage ? (v) => setDay(d, v ? [{ ...(WEEK.map((x) => week[x]).find((x) => x.length)?.[0] ?? clinicRange) }] : []) : undefined} />
                        <span>{on ? "يوم عمل" : "عطلة"}</span>
                      </label>
                      <div className={css.ranges}>
                        {r.map((x, i) => (
                          <div key={i} className={css.range}>
                            <TimeSel label="من" value={x.from} times={times.slice(0, -1)} disabled={!canManage} onChange={(v) => setDay(d, r.map((y, k) => (k === i ? { ...y, from: v } : y)))} />
                            <span className={css.dash}>—</span>
                            <TimeSel label="إلى" value={x.to} times={times.slice(1)} disabled={!canManage} onChange={(v) => setDay(d, r.map((y, k) => (k === i ? { ...y, to: v } : y)))} />
                            {canManage && i === 1 && <button type="button" className={css.x} aria-label="حذف الفترة الثانية" onClick={() => setDay(d, r.slice(0, 1))}><Icon name="x" size={14} color={C.sub2} /></button>}
                          </div>
                        ))}
                        {canManage && r.length === 1 && (
                          <button type="button" className={css.add} onClick={() => setDay(d, [...r, { from: r[0].to < "23:00" ? r[0].to : "06:00", to: hhmm(Math.min(DAY_TO, toMin(r[0].to < "23:00" ? r[0].to : "06:00") + 180)) }])}>
                            <Icon name="plus" size={13} color={C.accent} /> فترة ثانية
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {canManage && (
            <div className={css.foot}>
              {msg && <span style={{ color: msg.ok ? C.okDeep : C.danger, fontSize: 13.5, fontWeight: 600 }}>{msg.text}</span>}
              <button type="button" className={css.save} disabled={busy || !dirty} onClick={() => save(week)}>{busy ? "جارٍ الحفظ…" : "حفظ الدوام"}</button>
            </div>
          )}
        </div>
      )}
      {s.is_consultant && (
        <div className={css.body}>
          <ConsultTemplate staffId={s.id} name={s.name} canManage={canManage} />
        </div>
      )}
    </Card>
  );
}

function TimeSel({ label, value, times, onChange, disabled }: { label: string; value: string; times: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  const opts = times.includes(value) ? times : [value, ...times];
  return (
    <select aria-label={label} className={`${css.time} latin`} dir="ltr" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ boxShadow: SHB }}>
      {opts.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

/** «الدوام الافتراضي ومدة الموعد» — settings.hours: fallback hours for members without their own schedule + slot length. */
function DefaultHoursCard({ hours }: { hours: Hours }) {
  const [h, setH] = useState(hours);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const key = JSON.stringify(hours);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setH(hours); }, [key]);
  const times = useMemo(() => dayTimes(Math.max(5, h.slot || 15)), [h.slot]);
  const dirty = JSON.stringify(h) !== key;
  async function save() {
    if (!/^\d{2}:\d{2}$/.test(h.from) || !/^\d{2}:\d{2}$/.test(h.to) || toMin(h.to) <= toMin(h.from)) { setMsg({ ok: false, text: "تحقّقي من وقت البداية والنهاية." }); return; }
    setBusy(true); setMsg(null);
    try { await saveHours(h); setMsg({ ok: true, text: "حُفظ الدوام الافتراضي ومدة الموعد." }); }
    catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); }
  }
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div className={css.defHead}>
        <div className={css.who}>
          <div className={css.name}><b>الدوام الافتراضي ومدة الموعد</b></div>
          <div className={css.sum}>يُطبَّق فقط على من ليس لها جدول خاص بها أدناه. مدة الموعد هي الفاصل بين أوقات الحجز للجميع.</div>
        </div>
      </div>
      <div className={css.body}>
        <div className={css.quick} role="group" aria-label="أيام الدوام الافتراضي">
          {WEEK.map((d) => (
            <Chip key={d} selected={h.days.includes(d)} onClick={() => { setMsg(null); setH({ ...h, days: h.days.includes(d) ? h.days.filter((x) => x !== d) : [...h.days, d].sort() }); }}>{AR_DAYS[d]}</Chip>
          ))}
        </div>
        <div className={css.defRow}>
          <span className={css.range}>
            <TimeSel label="من" value={h.from} times={times.slice(0, -1)} onChange={(v) => { setMsg(null); setH({ ...h, from: v }); }} />
            <span className={css.dash}>—</span>
            <TimeSel label="إلى" value={h.to} times={times.slice(1)} onChange={(v) => { setMsg(null); setH({ ...h, to: v }); }} />
          </span>
          <label className={css.work}>مدة الموعد
            <select aria-label="مدة الموعد (دقيقة)" className={`${css.time} latin`} dir="ltr" value={h.slot} style={{ boxShadow: SHB }}
              onChange={(e) => { setMsg(null); setH({ ...h, slot: Number(e.target.value) }); }}>
              {(SLOT_CHOICES.includes(h.slot) ? SLOT_CHOICES : [h.slot, ...SLOT_CHOICES]).map((n) => <option key={n} value={n}>{n} د</option>)}
            </select>
          </label>
        </div>
        <div className={css.foot}>
          {msg && <span style={{ color: msg.ok ? C.okDeep : C.danger, fontSize: 13.5, fontWeight: 600 }}>{msg.text}</span>}
          <button type="button" className={css.save} disabled={busy || !dirty} onClick={save}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button>
        </div>
      </div>
    </Card>
  );
}

const PCT_CHOICES = [0, 5, 10, 15, 20, 25, 30];
const LAST_CHOICES = [0, 1, 2, 3, 4];

/** «احتياطي VIP» — settings vip_reserve_pct / vip_reserve_last_hours (server: private.reserve_ok, book_vip). */
function ReserveCard() {
  const q = useQuery(["reserve", "settings"], getReserveSettings);
  const [v, setV] = useState<ReserveSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (q.data) setV(q.data); }, [q.data]);
  if (!v) return null;
  const dirty = !!q.data && (v.pct !== q.data.pct || v.lastHours !== q.data.lastHours);
  async function save() {
    setBusy(true); setMsg(null);
    try { await saveReserveSettings(v!); setMsg({ ok: true, text: "حُفظ احتياطي VIP." }); }
    catch (e) { setMsg({ ok: false, text: errText(e) }); } finally { setBusy(false); }
  }
  const sel = (label: string, value: number, choices: number[], unit: (n: number) => string, on: (n: number) => void) => (
    <label className={css.work}>{label}
      <select aria-label={label} className={`${css.time} latin`} dir="ltr" value={value} style={{ boxShadow: SHB }} onChange={(e) => { setMsg(null); on(Number(e.target.value)); }}>
        {(choices.includes(value) ? choices : [value, ...choices]).map((n) => <option key={n} value={n}>{unit(n)}</option>)}
      </select>
    </label>
  );
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div className={css.defHead}>
        <div className={css.who}>
          <div className={css.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" fill={GOLD} stroke={GOLD_DEEP} strokeWidth={1.2} /></svg>
            <b>احتياطي VIP والحالات الطارئة</b>
          </div>
          <div className={css.sum}>نسبة من وقت كل غرفة يومياً لا تظهر في رابط الحجز ولا في التطبيق، ويحجز فيها الاستقبال والإدارة فقط. في آخر الساعات المحدّدة من الدوام يُستخدم ما تبقّى لأي حالة دون موعد.</div>
        </div>
      </div>
      <div className={css.body}>
        <div className={css.defRow}>
          {sel("نسبة الاحتياطي", v.pct, PCT_CHOICES, (n) => `${n}%`, (n) => setV({ ...v, pct: n }))}
          {sel("مفتوح لأي حالة في آخر", v.lastHours, LAST_CHOICES, (n) => (n === 0 ? "لا" : `${n} س`), (n) => setV({ ...v, lastHours: n }))}
        </div>
        <div className={css.foot}>
          {msg && <span style={{ color: msg.ok ? C.okDeep : C.danger, fontSize: 13.5, fontWeight: 600 }}>{msg.text}</span>}
          <button type="button" className={css.save} disabled={busy || !dirty} onClick={save}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button>
        </div>
      </div>
    </Card>
  );
}
