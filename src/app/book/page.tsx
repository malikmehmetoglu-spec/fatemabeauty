"use client";

/**
 * Public booking link — https://fatema.beauty/book/ and https://book.fatema.beauty/ (for Instagram).
 * No login: visitors only reach rpc public_booking_info / public_slots / public_book. Bookings land in the same
 * appointments table as «بانتظار التأكيد» (source 'public'), so staff see them in the calendar and queue.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { appHref, DOMAIN } from "@/lib/hosts";
import { AR_DAYS, AR_MONTHS, initials } from "@/lib/data";
import { clock, dayKey, money } from "@/lib/format";
import {
  getBookingWeekdays, getPublicInfo, getPublicSlots, icsFile, localPhone, nextDays, normalisePhone, publicBook, publicError,
  durationLabel, levelsOfService, pubPrice, type PubInfo, type PubLevel, type PubPerson, type PubResult, type PubService, type PubSlot,
} from "@/lib/db/publicBooking";
import LevelPicker from "./LevelPicker";
import { C } from "@/lib/tokens";
import s from "./book.module.css";
import { PregnancyNotice } from "@/app/services/PregnancyNotice";
import CardFlow, { FlowPending, usePhoneCards } from "./CardFlow";

type Kind = "session" | "consult";
const DAYS_AHEAD = 14;
const PLACE = "فاطمة بيوتي — مركز العناية بالبشرة";
const dateOf = (k: string) => new Date(`${k}T12:00:00+03:00`);
const weekday = (k: string) => dateOf(k).getUTCDay();
const dayLabel = (k: string) => { const d = dateOf(k); return `${AR_DAYS[weekday(k)]} ${d.getUTCDate()} ${AR_MONTHS[d.getUTCMonth()]}`; };
const hourOf = (iso: string) => Number(clock(iso).slice(0, 2));

function Ava({ p, size = 38 }: { p: PubPerson; size?: number }) {
  return (
    <span className={s.ava} style={{ width: size, height: size, borderRadius: size / 2 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {p.photo_url ? <img src={p.photo_url} alt="" /> : initials(p.name)}
    </span>
  );
}

function StepHead({ n, title, sub, done }: { n: number; title: string; sub?: string; done?: boolean }) {
  return (
    <div className={s.stepHead}>
      <span className={`${s.stepNo} ${done ? s.stepNoDone : ""}`}>{done ? <Icon name="check" color="#fff" size={18} stroke={2.4} /> : n}</span>
      <div>
        <div className={s.stepTitle}>{title}</div>
        {sub && <div className={s.stepSub}>{sub}</div>}
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  const [info, setInfo] = useState<PubInfo | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  const [kind, setKind] = useState<Kind | null>(null);
  const [service, setService] = useState<PubService | null>(null);
  const [specialist, setSpecialist] = useState<string | null>(null); // null = any
  const [day, setDay] = useState<string | null>(null);
  const [slots, setSlots] = useState<PubSlot[] | null>(null);
  const [slotErr, setSlotErr] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<PubResult | null>(null);
  const phoneCards = usePhoneCards();

  const refs = { 1: useRef<HTMLElement>(null), 2: useRef<HTMLElement>(null), 3: useRef<HTMLElement>(null), 4: useRef<HTMLElement>(null), top: useRef<HTMLDivElement>(null) };
  const goTo = (r: React.RefObject<HTMLElement | HTMLDivElement | null>) => setTimeout(() => r.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

  const load = useCallback(() => {
    setLoadErr("");
    getPublicInfo().then(setInfo).catch((e) => setLoadErr(publicError(e)));
  }, []);
  useEffect(() => {
    load();
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [load]);

  const sessionServices = useMemo(() => (info?.services ?? []).filter((x) => !x.is_consultation), [info]);
  const consultServices = useMemo(() => (info?.services ?? []).filter((x) => x.is_consultation), [info]);
  const consultReady = !!info?.consultant && consultServices.length > 0;
  const [pubCat, setPubCat] = useState<string | null>(null);
  const sessionCats = useMemo(() => (info?.categories ?? []).filter((c) => sessionServices.some((x) => x.category_id === c.key)), [info, sessionServices]);
  const otherSessions = sessionServices.filter((x) => !sessionCats.some((c) => c.key === x.category_id));
  const curPubCat = pubCat ?? (service && !service.is_consultation ? (sessionCats.some((c) => c.key === service.category_id) ? service.category_id : "") : null) ?? sessionCats[0]?.key ?? "";
  const kindServices = kind === "consult" ? consultServices
    : sessionCats.length ? sessionServices.filter((x) => (curPubCat ? x.category_id === curPubCat : !sessionCats.some((c) => c.key === x.category_id))) : sessionServices;
  // step-1 cards: the consultation category (consultant flow) + each other category (specialists flow)
  const consultCat = (info?.categories ?? []).find((c) => consultServices.some((x) => x.category_id === c.key)) ?? null;
  const cards: { kind: Kind; key: string; name: string; sub: string; icon: string; count: number; ready: boolean }[] = [
    ...(consultServices.length || info?.consultant ? [{ kind: "consult" as const, key: consultCat?.key ?? "", name: consultCat?.name ?? "استشارة", sub: consultCat?.short_description ?? "", icon: consultCat?.icon ?? "face", count: consultServices.length, ready: consultReady }] : []),
    ...sessionCats.map((c) => ({ kind: "session" as const, key: c.key, name: c.name, sub: c.short_description, icon: c.icon, count: sessionServices.filter((x) => x.category_id === c.key).length, ready: true })),
    ...(otherSessions.length || !sessionCats.length ? [{ kind: "session" as const, key: "", name: sessionCats.length ? "جلسات أخرى" : "جلسة عناية", sub: "", icon: "sparkle", count: sessionCats.length ? otherSessions.length : sessionServices.length, ready: sessionServices.length > 0 }] : []),
  ];
  const svcCat = (info?.categories ?? []).find((c) => c.key === (service?.category_id ?? (kind === "session" ? curPubCat : null))) ?? null;
  // only the specialists who provide the chosen service (from «الخدمات التي تقدّمها» in admin; empty there = all)
  const people = (info?.specialists ?? []).filter((p) => !service || !p.services || p.services.includes(service.key));
  const noProvider = kind === "session" && !!service && (info?.specialists.length ?? 0) > 0 && people.length === 0;
  const chosenPerson = kind === "consult" ? info?.consultant ?? null : people.find((p) => p.id === specialist) ?? null;

  // «مدة الجلسة»: active levels of the chosen service (default = the first, «عادية»); the step shows only when there are 2+
  const levels = levelsOfService(service);
  const level: PubLevel | null = levels.find((l) => l.id === levelId) ?? levels[0] ?? null;
  const hasLevels = levels.length > 1;
  const minutes = level?.minutes ?? service?.minutes ?? 0;
  const priceText = service ? (level ? money(level.price) : pubPrice(service)) : null;
  const serviceText = service ? `${service.name}${hasLevels && level ? ` · ${level.name}` : ""} · ${durationLabel(minutes)}` : null;
  function pickLevel(id: string) { setLevelId(id); setTime(null); setErr(""); }

  const days = useMemo(() => (now ? nextDays(DAYS_AHEAD) : []), [now?.toDateString()]); // eslint-disable-line react-hooks/exhaustive-deps
  // availability of the chosen day
  const specialistParam = kind === "consult" ? info?.consultant?.id ?? null : specialist;
  // open weekdays follow the team's «أوقات الدوام»: a day is open when someone who does this service works it
  const [wdays, setWdays] = useState<{ key: string; days: number[] } | null>(null);
  const wKey = service ? `${service.key}|${specialistParam ?? ""}` : "";
  useEffect(() => {
    if (!service) return;
    let live = true;
    getBookingWeekdays(service.key, specialistParam).then((d) => live && setWdays({ key: wKey, days: d })).catch(() => {});
    return () => { live = false; };
  }, [wKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const openWd = wdays && wdays.key === wKey ? wdays.days : info?.hours.days ?? [];
  const isOpen = (k: string) => openWd.includes(weekday(k));
  // the chosen day closed for this choice (e.g. another specialist) → move to the first open day
  useEffect(() => {
    if (!wdays || wdays.key !== wKey || !service) return;
    if (!day || !wdays.days.includes(weekday(day))) { setDay(days.find((k) => wdays.days.includes(weekday(k))) ?? null); setTime(null); }
  }, [wdays]); // eslint-disable-line react-hooks/exhaustive-deps
  const fetchSlots = useCallback(async () => {
    if (!service || !day) return;
    setSlots(null); setSlotErr("");
    try { setSlots(await getPublicSlots(day, service.key, specialistParam, level?.id ?? null)); }
    catch (e) { setSlotErr(publicError(e)); }
  }, [service, day, specialistParam, level?.id]);
  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const visibleSlots = (slots ?? []).filter((x) => !now || new Date(x.starts_at).getTime() > now.getTime());
  const freeCount = visibleSlots.filter((x) => x.available).length;
  const parts = [
    { label: "صباحاً", list: visibleSlots.filter((x) => hourOf(x.starts_at) < 12) },
    { label: "بعد الظهر", list: visibleSlots.filter((x) => hourOf(x.starts_at) >= 12 && hourOf(x.starts_at) < 17) },
    { label: "مساءً", list: visibleSlots.filter((x) => hourOf(x.starts_at) >= 17) },
  ].filter((p) => p.list.length);

  function pickCard(k: Kind, cat: string) {
    setKind(k); setTime(null); setErr("");
    if (k === "session") setPubCat(cat);
    const list = k === "consult" ? consultServices : sessionCats.length ? sessionServices.filter((x) => (cat ? x.category_id === cat : !sessionCats.some((c) => c.key === x.category_id))) : sessionServices;
    const only = list.length === 1 ? list[0] : null;
    setService(only); setSpecialist(null); setLevelId(levelsOfService(only)[0]?.id ?? null);
    if (only) { if (!day) setDay(days.find(isOpen) ?? null); goTo(k === "consult" ? refs[2] : refs[1]); }
    else goTo(refs[1]);
  }
  function pickService(x: PubService) {
    if (x.key !== service?.key) setLevelId(levelsOfService(x)[0]?.id ?? null);
    setService(x); setTime(null); setErr("");
    const sp = info?.specialists.find((p) => p.id === specialist);
    if (sp?.services && !sp.services.includes(x.key)) setSpecialist(null);
    if (!day) setDay(days.find(isOpen) ?? null);
    if (kind === "consult" || !(info?.specialists ?? []).some((p) => !p.services || p.services.includes(x.key))) goTo(refs[2]);
  }
  function pickSpecialist(id: string | null) { setSpecialist(id); setTime(null); goTo(refs[2]); }
  function pickDay(k: string) { setDay(k); setTime(null); setErr(""); goTo(refs[3]); }
  function pickTime(iso: string) { setTime(iso); setErr(""); goTo(refs[4]); }

  async function submit() {
    setErr("");
    if (!service || !time) return;
    if (name.trim().length < 2) { setErr("اكتبي اسمكِ (حرفان على الأقل)."); return; }
    const ph = normalisePhone(phone);
    if (!ph) { setErr("اكتبي رقم موبايل سوري صحيحاً، مثل 0991 234 567."); return; }
    setBusy(true);
    try {
      const r = await publicBook({ service: service.key, starts: time, specialist: specialistParam, name: name.trim(), phone: ph, note: note.trim(), level: level?.id ?? null });
      setResult(r);
      goTo(refs.top);
    } catch (e) {
      const m = publicError(e);
      setErr(m);
      if (/taken|slot taken/.test(e instanceof Error ? e.message : "")) { setTime(null); fetchSlots(); }
    } finally { setBusy(false); }
  }

  function downloadIcs() {
    if (!result) return;
    const blob = new Blob([icsFile(result, PLACE)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "fatema-beauty-appointment.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function restart() {
    setResult(null); setKind(null); setService(null); setLevelId(null); setSpecialist(null); setDay(null); setTime(null); setNote(""); setErr("");
    fetchSlots();
  }

  const step1Done = !!service;
  const summary: [string, string, string | null][] = [
    ["sparkle", "نوع الموعد", kind ? (kind === "consult" ? consultCat?.name ?? "استشارة" : sessionCats.find((c) => c.key === curPubCat)?.name ?? "جلسة عناية") : null],
    ["drop", "الخدمة", serviceText],
    ["user", kind === "consult" ? "الاستشارية" : "الأخصائية", kind === "consult" ? info?.consultant?.name ?? null : service ? (chosenPerson?.name ?? "أي أخصائية متاحة") : null],
    ["cal", "اليوم", day && service ? dayLabel(day) : null],
    ["clock", "الساعة", time ? `${clock(time)} بتوقيت دمشق` : null],
    ["wallet", "السعر", priceText],
  ];

  const contact = info?.centre?.whatsapp || info?.centre?.phone || null;
  const waLink = info?.centre?.whatsapp ? `https://wa.me/${info.centre.whatsapp.replace(/\D/g, "")}` : null;
  const siteHref = typeof window !== "undefined" && window.location.hostname.endsWith(DOMAIN) ? `https://${DOMAIN}/` : R.Site;

  // phones: card deck (CardFlow.tsx) — same state and rules; BOOKING_MOBILE_FLOW = "classic" or ?classic=1 restores the layout below
  const cardView = <CardFlow ctx={{
    info, loadErr, load, now, kind, service, levels, level, hasLevels, minutes, priceText, pickLevel, specialist, day, time, slots, slotErr, name, setName, phone, setPhone, note, setNote, busy, err, setErr, result,
    cards, curPubCat, consultCat, sessionCats, sessionServices, consultServices, kindServices, svcCat, people, noProvider, chosenPerson,
    days, isOpen, visibleSlots, freeCount, parts, pickCard, pickService, pickSpecialist, pickDay, pickTime, submit, downloadIcs, restart, fetchSlots,
    contact, waLink, siteHref,
  }} />;
  if (phoneCards) return cardView;

  const classicView = (
    <div className={s.page} dir="rtl">
      <div className={s.halo1} aria-hidden />
      <div className={s.halo2} aria-hidden />
      <div className={s.wrap} ref={refs.top}>
        <header className={s.nav}>
          <a href={siteHref} aria-label="فاطمة بيوتي"><Logo height={54} /></a>
          {now && <span className={s.clockChip}><Icon name="clock" size={17} color={C.accentMid} /><span>الآن في دمشق</span><b className="latin">{clock(now)}</b></span>}
        </header>

        {result ? (
          <section className={s.done} aria-live="polite">
            <div className={s.doneMark}><Icon name="check" color="#fff" size={40} stroke={2.4} /></div>
            <h1 className={s.doneTitle}>تم استلام طلب حجزكِ</h1>
            <p className={s.doneText}>الموعد <b style={{ color: C.accent }}>بانتظار تأكيد المركز</b>، وستصلكِ رسالة واتساب لتأكيد الحجز على الرقم <b className="latin" dir="ltr" style={{ unicodeBidi: "isolate", whiteSpace: "nowrap" }}>{localPhone(result.phone || phone)}</b></p>
            <div className={`${s.miniSum} ${s.doneCard}`}>
              <div className={s.miniRow}><span>الحالة</span><span style={{ color: C.accent, fontWeight: 700 }}>بانتظار التأكيد</span></div>
              <div className={s.miniRow}><span>الخدمة</span><span>{result.service}</span></div>
              <div className={s.miniRow}><span>اليوم</span><span>{dayLabel(dayKey(new Date(result.starts_at)))}</span></div>
              {result.level && hasLevels && <div className={s.miniRow}><span>مدة الجلسة</span><span>{result.level}</span></div>}
              <div className={s.miniRow}><span>الساعة</span><span>{clock(result.starts_at)} · {durationLabel(result.minutes)}</span></div>
              {result.price != null && result.price > 0 && <div className={s.miniRow}><span>السعر</span><span>{money(result.price)}</span></div>}
              {result.specialist && <div className={s.miniRow}><span>مع</span><span>{result.specialist}</span></div>}
            </div>
            {result.consult && (
              <a href={appHref(R.P_Appointments)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "start", margin: "14px 0 0", padding: "14px 16px", borderRadius: 22, color: "#fff", background: "linear-gradient(140deg,#9C64AA,#7B4687 60%,#5E2F6B)", boxShadow: "0 12px 26px rgba(123,70,135,0.28)" }}>
                <span style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)" }}><Icon name="file" color="#fff" size={21} /></span>
                <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b style={{ display: "block", fontSize: 15 }}>جهّزي استشارتكِ</b><span style={{ fontSize: 12.5, opacity: 0.88 }}>من التطبيق: أخبري المستشارة عن بشرتكِ قبل الموعد — دقائق قليلة فقط</span></span>
                <Icon name="chev" color="#fff" size={18} />
              </a>
            )}
            <div className={s.doneBtns}>
              <button type="button" className={s.btnPrimary} onClick={downloadIcs}><Icon name="calcheck" color="#fff" size={19} />أضيفي إلى التقويم (مبدئياً)</button>
              <a className={s.btnGhost} href={appHref(R.P_Appointments)}><Icon name="phone" color={C.accent} size={19} />أديري موعدكِ من التطبيق</a>
            </div>
            <p className={s.stepSub} style={{ marginTop: 14 }}>ادخلي إلى التطبيق برقم الموبايل نفسه لتجدي موعدكِ وتتابعي دوركِ يوم الزيارة.</p>
            <button type="button" className={s.again} onClick={restart}>حجز موعد آخر</button>
          </section>
        ) : (
          <>
            <section className={s.hero}>
              <h1 className={s.h1}>احجزي <em>موعدكِ</em> في دقيقة</h1>
              <p className={s.lead}>اختاري الجلسة واليوم والساعة التي تناسبكِ — الأوقات المعروضة حقيقية ومحدّثة لحظة بلحظة بتوقيت دمشق.</p>
            </section>

            {loadErr && (
              <div className={s.empty}>
                <div className={s.stepTitle}>تعذّر تحميل المواعيد</div>
                <p className={s.doneText} style={{ marginTop: 8 }}>{loadErr}</p>
                <button type="button" className={s.btnPrimary} style={{ marginTop: 18, flex: "none", width: "100%" }} onClick={load}><Icon name="refresh" color="#fff" size={18} />أعيدي المحاولة</button>
              </div>
            )}
            {!info && !loadErr && <div className={s.empty}><div className={s.stepSub}>جارٍ تحميل الخدمات والأوقات…</div></div>}

            {info && info.services.length === 0 && (
              <div className={s.empty}>
                <span className={s.stepNo} style={{ margin: "0 auto 14px", width: 56, height: 56, borderRadius: 28 }}><Icon name="cal" size={26} color={C.accent} /></span>
                <div className={s.stepTitle}>الحجز من الرابط يفتح قريباً</div>
                <p className={s.doneText} style={{ marginTop: 8 }}>نجهّز قائمة الجلسات وأوقاتها. {contact ? "إلى ذلك الحين يسعدنا حجز موعدكِ عبر الهاتف أو واتساب." : "عودي إلينا قريباً، أو زوري موقعنا لمعرفة المزيد."}</p>
                <div className={s.doneBtns}>
                  {waLink && <a className={s.btnPrimary} href={waLink} target="_blank" rel="noreferrer"><Icon name="msg" color="#fff" size={19} />راسلينا على واتساب</a>}
                  {info.centre?.phone && <a className={s.btnGhost} href={`tel:${info.centre.phone}`}><Icon name="phone" color={C.accent} size={19} /><span className="latin" dir="ltr">{info.centre.phone}</span></a>}
                  {!contact && <a className={s.btnGhost} href={siteHref}><Icon name="home" color={C.accent} size={19} />موقع المركز</a>}
                </div>
              </div>
            )}

            {info && info.services.length > 0 && (
              <div className={s.grid}>
                <aside className={s.aside} aria-label="ملخص الحجز">
                  <Summary rows={summary} />
                  <div className={s.trust}>
                    <span><Icon name="shield" size={17} />نستخدم رقمكِ لتأكيد الموعد فقط</span>
                    <span><Icon name="msg" size={17} />تصلكِ رسالة واتساب لتأكيد الحجز</span>
                  </div>
                </aside>

                <div className={s.main}>
                  {/* 1 — kind, service, specialist */}
                  <section className={s.step} ref={refs[1]}>
                    <StepHead n={1} title="اختاري نوع الموعد" sub="استشارة لتحديد ما يناسبكِ، أو جلسة من فئات العناية مع أخصائيات المركز" done={step1Done} />
                    <div className={s.kinds}>
                      {cards.map((c) => {
                        const on = kind === c.kind && (c.kind === "consult" || curPubCat === c.key);
                        const dark = c.kind === "consult";
                        const n = c.count;
                        return (
                          <button key={c.kind + c.key} type="button" className={`${s.kind} ${dark ? s.kindDark : ""} ${on ? s.kindOn : ""}`} onClick={() => pickCard(c.kind, c.key)} disabled={!c.ready} aria-pressed={on}>
                            {on && <span className={s.kindCheck}><Icon name="check" color={dark ? C.accent : "#fff"} size={16} stroke={2.6} /></span>}
                            <span className={s.kindIcon}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {dark && info.consultant?.photo_url ? <img src={info.consultant.photo_url} alt="" /> : <Icon name={c.icon} size={24} color={dark ? "#fff" : C.accentMid} />}
                            </span>
                            <div>
                              <div className={s.kindTitle}>{c.name}</div>
                              <div className={s.kindText}>{!c.ready ? "غير متاحة حالياً" : dark && info.consultant ? `مع ${info.consultant.name}${c.sub ? ` — ${c.sub}` : ""}` : c.sub || `${n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : `${n} ${n < 11 ? "خدمات" : "خدمة"}`} مع أخصائيات المركز`}</div>
                            </div>
                            {!c.ready && <span className={s.soonTag}>قريباً</span>}
                          </button>
                        );
                      })}
                    </div>

                    {kind && kindServices.length > 1 && (
                      <>
                        <div className={s.subHead}>{kind === "consult" ? "اختاري نوع الاستشارة" : "اختاري الجلسة"}</div>
                        <div className={s.services}>
                          {kindServices.map((x) => (
                            <button key={x.key} type="button" className={`${s.svc} ${service?.key === x.key ? s.svcOn : ""}`} onClick={() => pickService(x)} aria-pressed={service?.key === x.key}>
                              <span className={s.svcName}>{x.name}</span>
                              {x.description && <span className={s.svcDesc}>{x.description}</span>}
                              <span className={s.svcMeta}><span>{x.minutes} دقيقة</span><b>{pubPrice(x)}</b></span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {service && hasLevels && (
                      <>
                        <div className={s.subHead}>مدة الجلسة</div>
                        <LevelPicker levels={levels} value={level?.id ?? null} onChange={pickLevel} />
                      </>
                    )}
                    {svcCat?.not_for_pregnant && <PregnancyNotice style={{ marginTop: 14 }} />}
                    {kind === "session" && service && people.length > 0 && (
                      <>
                        <div className={s.subHead}>مع من تفضّلين؟</div>
                        <div className={s.people}>
                          <button type="button" className={`${s.person} ${specialist === null ? s.personOn : ""}`} onClick={() => pickSpecialist(null)}>
                            <span className={s.ava}><Icon name="users" size={19} color={C.accent} /></span><span className={s.personName}>أي أخصائية متاحة</span>
                          </button>
                          {people.map((p) => (
                            <button key={p.id} type="button" className={`${s.person} ${specialist === p.id ? s.personOn : ""}`} onClick={() => pickSpecialist(p.id)}>
                              <Ava p={p} /><span className={s.personName}>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {noProvider && (
                      <div className={s.note} style={{ marginTop: 18 }}>
                        لا تتوفّر أخصائية لهذه الجلسة حالياً. اختاري جلسة أخرى{contact ? " أو تواصلي معنا لنرتّب موعدكِ" : ""}.
                      </div>
                    )}
                    {kind === "consult" && info.consultant && service && (
                      <div className={s.fixed} style={{ marginTop: 18 }}>
                        <Ava p={info.consultant} size={44} />
                        <div><div className={s.svcName}>{info.consultant.name}</div><div className={s.stepSub}>{info.consultant.title || "استشارية العناية بالبشرة"} · {service.name}</div></div>
                      </div>
                    )}
                  </section>

                  {/* 2 — day */}
                  {service && !noProvider && (
                    <section className={s.step} ref={refs[2]}>
                      <StepHead n={2} title="اختاري اليوم" sub="خلال الأسبوعين القادمين" done={!!day && !!time} />
                      <div className={s.days}>
                        {days.map((k) => {
                          const open = isOpen(k);
                          const d = dateOf(k);
                          return (
                            <button key={k} type="button" disabled={!open} className={`${s.day} ${day === k ? s.dayOn : ""}`} onClick={() => pickDay(k)} aria-pressed={day === k}>
                              <span className={s.dayName}>{k === dayKey(now ?? new Date()) ? "اليوم" : AR_DAYS[weekday(k)]}</span>
                              <span className={`${s.dayNum} latin`}>{d.getUTCDate()}</span>
                              {open ? <span className={s.dayMon}>{AR_MONTHS[d.getUTCMonth()]}</span> : <span className={s.closedTag}>مغلق</span>}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* 3 — time */}
                  {service && !noProvider && day && (
                    <section className={s.step} ref={refs[3]}>
                      <StepHead n={3} title="اختاري الساعة" sub={`${dayLabel(day)} · مدة الجلسة ${durationLabel(minutes)}`} done={!!time} />
                      <div className={s.legend}><span><i className={s.lgFree} />متاح</span><span><i className={s.lgBusy} />محجوز</span></div>
                      {slotErr && <div className={s.err}>{slotErr}</div>}
                      {!slots && !slotErr && <div className={s.stepSub}>جارٍ التحقق من الأوقات…</div>}
                      {slots && visibleSlots.length === 0 && <div className={s.note}>انتهت مواعيد هذا اليوم. اختاري يوماً آخر.</div>}
                      {slots && visibleSlots.length > 0 && freeCount === 0 && <div className={s.note} style={{ marginBottom: 12 }}>هذا اليوم مكتمل الحجز{kind === "session" && specialist ? " مع الأخصائية المختارة — جرّبي «أي أخصائية متاحة» أو" : "،"} اختاري يوماً آخر.</div>}
                      {parts.map((p) => (
                        <div key={p.label}>
                          <div className={s.part}>{p.label}</div>
                          <div className={s.slots}>
                            {p.list.map((x) => (
                              <button key={x.starts_at} type="button" disabled={!x.available} className={`${s.slot} ${time === x.starts_at ? s.slotOn : ""}`}
                                onClick={() => pickTime(x.starts_at)} aria-pressed={time === x.starts_at} aria-label={x.available ? `الساعة ${clock(x.starts_at)}` : `الساعة ${clock(x.starts_at)} محجوزة`}>
                                <span className={`${s.slotT} latin`}>{clock(x.starts_at)}</span>
                                {!x.available && <span className={s.slotBusy}>محجوز</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  )}

                  {/* 4 — details */}
                  {service && !noProvider && day && time && (
                    <section className={s.step} ref={refs[4]}>
                      <StepHead n={4} title="بياناتكِ" sub="نحتاج اسمكِ ورقمكِ لتأكيد الموعد معكِ" />
                      <div className={s.mobileSummary}>
                        <div className={s.miniSum}>
                          {summary.filter((r) => r[2]).map((r) => <div key={r[1]} className={s.miniRow}><span>{r[1]}</span><span>{r[2]}</span></div>)}
                        </div>
                      </div>
                      <div className={s.form}>
                        <label className={s.field}>
                          <span className={s.label}>الاسم الكامل</span>
                          <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="اكتبي اسمكِ" />
                        </label>
                        <label className={s.field}>
                          <span className={s.label}>رقم الموبايل</span>
                          <input className={`${s.input} latin`} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" inputMode="tel" type="tel" autoComplete="tel" placeholder="09xx xxx xxx" maxLength={20} style={{ textAlign: "right" }} />
                        </label>
                        <label className={`${s.field} ${s.fieldWide}`}>
                          <span className={s.label}>ملاحظة (اختياري)</span>
                          <textarea className={s.area} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="أي شيء تودّين أن نعرفه قبل الجلسة" />
                        </label>
                      </div>
                      {err && <div className={s.err} role="alert">{err}</div>}
                      <button type="button" className={s.confirm} onClick={submit} disabled={busy}>
                        {busy ? "جارٍ الحجز…" : <><Icon name="calcheck" color="#fff" size={21} />ثبّتي الموعد</>}
                      </button>
                      <div className={s.hint} style={{ textAlign: "center", marginTop: 10 }}>بالضغط على «ثبّتي الموعد» يُسجَّل حجزكِ بانتظار تأكيد المركز.</div>
                    </section>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <footer className={s.foot}>
          <span>© {now?.getFullYear() ?? ""} Fatema Beauty — Skin Care Center</span>
          <a href={siteHref}>موقع المركز</a>
        </footer>
      </div>
    </div>
  );
  // before mount the width is unknown: CSS shows the deck on phones and the classic layout above 768px (no flash)
  return phoneCards === null ? <FlowPending cards={cardView} classic={classicView} /> : classicView;
}

function Summary({ rows }: { rows: [string, string, string | null][] }) {
  return (
    <div className={s.sum}>
      <div className={s.sumGlow} aria-hidden />
      <div className={s.sumTitle}>ملخص موعدكِ</div>
      <div className={s.sumRows}>
        {rows.map(([icon, label, value]) => (
          <div key={label} className={s.sumRow}>
            <span className={s.sumIcon}><Icon name={icon} color="#fff" size={17} /></span>
            <div style={{ minWidth: 0 }}>
              <div className={s.sumLabel}>{label}</div>
              <div className={`${s.sumValue} ${value ? "" : s.sumEmpty}`}>{value ?? "—"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.sumFoot}>يبقى الموعد بانتظار تأكيد المركز، وتصلكِ رسالة واتساب لتأكيده.</div>
    </div>
  );
}

