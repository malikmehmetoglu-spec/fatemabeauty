"use client";

/**
 * Phone booking experience for /book (< 768px): a stacked card deck, one decision per card.
 * It owns no data logic — page.tsx passes its state, derived lists and handlers (`BookingCtx`), so the classic
 * layout and the cards always show the same services, specialists, days and slots with the same rules.
 *
 * Revert switch: set BOOKING_MOBILE_FLOW = "classic" below, or open /book/?classic=1 (forces the old phone layout).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, Logo } from "@/components/ui";
import { R } from "@/lib/routes";
import { appHref } from "@/lib/hosts";
import { AR_DAYS, AR_MONTHS, initials } from "@/lib/data";
import { clock, dayKey, money } from "@/lib/format";
import { durationLabel, levelsOfService, localPhone, normalisePhone, pubPrice, type PubCategory, type PubInfo, type PubLevel, type PubPerson, type PubResult, type PubService, type PubSlot } from "@/lib/db/publicBooking";
import LevelPicker from "./LevelPicker";
import { C } from "@/lib/tokens";
import { PregnancyNotice } from "@/app/services/PregnancyNotice";
import s from "./cardflow.module.css";

/** "cards" = new phone deck, "classic" = the original single-page phone layout. */
export const BOOKING_MOBILE_FLOW: "cards" | "classic" = "cards";

/** true when the phone card deck should render (phone width, flag on, no ?classic=1). Undecided (null) before mount. */
export function usePhoneCards() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    const classic = new URLSearchParams(window.location.search).get("classic") === "1";
    const mq = window.matchMedia("(max-width: 767.98px)");
    const set = () => setOn(BOOKING_MOBILE_FLOW === "cards" && !classic && mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return on;
}

/** Until the width is known (first paint of the static page) render both and let CSS pick, so phones never flash the classic layout. */
export function FlowPending({ cards, classic }: { cards: ReactNode; classic: ReactNode }) {
  return <><div className={s.onlyPhone}>{cards}</div><div className={s.onlyWide}>{classic}</div></>;
}

type Kind = "session" | "consult";
export type FlowCard = { kind: Kind; key: string; name: string; sub: string; icon: string; count: number; ready: boolean };
export type BookingCtx = {
  info: PubInfo | null; loadErr: string; load: () => void; now: Date | null;
  kind: Kind | null; service: PubService | null;
  levels: PubLevel[]; level: PubLevel | null; hasLevels: boolean; minutes: number; priceText: string | null; pickLevel: (id: string) => void; specialist: string | null; day: string | null; time: string | null;
  slots: PubSlot[] | null; slotErr: string;
  name: string; setName: (v: string) => void; phone: string; setPhone: (v: string) => void; note: string; setNote: (v: string) => void;
  busy: boolean; err: string; setErr: (v: string) => void; result: PubResult | null;
  cards: FlowCard[]; curPubCat: string; consultCat: PubCategory | null; sessionCats: PubCategory[];
  sessionServices: PubService[]; consultServices: PubService[]; kindServices: PubService[]; svcCat: PubCategory | null;
  people: PubPerson[]; noProvider: boolean; chosenPerson: PubPerson | null;
  days: string[]; isOpen: (k: string) => boolean; visibleSlots: PubSlot[]; freeCount: number; parts: { label: string; list: PubSlot[] }[];
  pickCard: (k: Kind, cat: string) => void; pickService: (x: PubService) => void; pickSpecialist: (id: string | null) => void;
  pickDay: (k: string) => void; pickTime: (iso: string) => void; submit: () => void; downloadIcs: () => void; restart: () => void; fetchSlots: () => void;
  contact: string | null; waLink: string | null; siteHref: string;
};

const STEPS = ["النوع", "الجلسة", "المدة", "الأخصائية", "اليوم", "الساعة", "بياناتكِ", "تأكيد"];
const LAST = STEPS.length - 1;
const dateOf = (k: string) => new Date(`${k}T12:00:00+03:00`);
const weekday = (k: string) => dateOf(k).getUTCDay();
const dayLabel = (k: string) => { const d = dateOf(k); return `${AR_DAYS[weekday(k)]} ${d.getUTCDate()} ${AR_MONTHS[d.getUTCMonth()]}`; };
const k2 = (k: string, now: Date | null) => (k === dayKey(now ?? new Date()) ? "اليوم" : AR_DAYS[weekday(k)]);
const count = (n: number) => (n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : `${n} ${n < 11 ? "خدمات" : "خدمة"}`);
const EXIT_MS = 420;

function Ava({ p, size = 52 }: { p: PubPerson; size?: number }) {
  return (
    <span className={s.ava} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {p.photo_url ? <img src={p.photo_url} alt="" /> : initials(p.name)}
    </span>
  );
}

export default function CardFlow({ ctx }: { ctx: BookingCtx }) {
  const c = ctx;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [leaving, setLeaving] = useState<{ step: number; dir: "fwd" | "back"; id: number } | null>(null);
  const [drag, setDrag] = useState(0);
  const dragRef = useRef<{ x: number; y: number; on: boolean; dx: number } | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // the session card is skipped when the chosen type has a single service (auto-selected by pickCard)
  const skipSession = !!c.kind && c.kindServices.length === 1;
  // the duration card is skipped for consultations and services with a single active level
  const skipLevel = !c.hasLevels;

  function go(to: number) {
    if (to === step) return;
    const d = to > step ? "fwd" : "back";
    setDir(d);
    setLeaving({ step, dir: d, id: Date.now() });
    setStep(to);
    setDrag(0);
  }
  function back() {
    if (step === 0) return;
    let to = step - 1;
    if (to === 2 && skipLevel) to = 1;
    if (to === 1 && skipSession) to = 0;
    go(to);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setLeaving(null), EXIT_MS);
    return () => clearTimeout(t);
  }, [leaving]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headRef.current?.focus({ preventScroll: true });
  }, [step]);
  // the chosen time vanished (taken while confirming) → back to the hours card
  useEffect(() => { if (step >= 6 && !c.time && !c.result) go(5); }, [c.time]); // eslint-disable-line react-hooks/exhaustive-deps
  // errors fade by themselves
  useEffect(() => {
    if (!c.err) return;
    const t = setTimeout(() => c.setErr(""), 6000);
    return () => clearTimeout(t);
  }, [c.err]); // eslint-disable-line react-hooks/exhaustive-deps

  // swipe right (towards the start in RTL) = back
  function onDown(e: React.PointerEvent) {     if (e.pointerType === "mouse" || step === 0) return;
    if ((e.target as HTMLElement).closest("[data-noswipe],input,textarea")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, on: false, dx: 0 };
  }
  function onMove(e: React.PointerEvent) {     const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { dragRef.current = null; return; }
      if (dx > 12) { d.on = true; try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {} } else return;
    }
    d.dx = Math.max(0, dx);
    setDrag(d.dx);
  }
  function onUp() {
    const d = dragRef.current;     dragRef.current = null;
    if (!d?.on) return;
    if (d.dx > 90) back(); else setDrag(0);
  }

  /* ---------- choosing ---------- */
  function chooseType(card: FlowCard) {
    c.pickCard(card.kind, card.key);
    const list = card.kind === "consult" ? c.consultServices
      : c.sessionCats.length ? c.sessionServices.filter((x) => (card.key ? x.category_id === card.key : !c.sessionCats.some((k) => k.key === x.category_id))) : c.sessionServices;
    const only = list.length === 1 ? list[0] : null;
    go(only ? (card.kind !== "consult" && levelsOfService(only).length > 1 ? 2 : 3) : 1);
  }
  function chooseService(x: PubService) { c.pickService(x); go(levelsOfService(x).length > 1 ? 2 : 3); }
  function chooseSpecialist(id: string | null) { c.pickSpecialist(id); go(4); }
  function chooseDay(k: string) { c.pickDay(k); go(5); }
  function chooseTime(iso: string) { c.pickTime(iso); go(6); }
  function reviewDetails() {
    c.setErr("");
    if (c.name.trim().length < 2) { c.setErr("اكتبي اسمكِ (حرفان على الأقل)."); return; }
    if (!normalisePhone(c.phone)) { c.setErr("اكتبي رقم موبايل سوري صحيحاً، مثل 0991 234 567."); return; }
    go(7);
  }

  const typeName = c.kind ? (c.kind === "consult" ? c.consultCat?.name ?? "استشارة" : c.sessionCats.find((k) => k.key === c.curPubCat)?.name ?? "جلسة عناية") : null;
  const personName = c.kind === "consult" ? c.info?.consultant?.name ?? null : c.service ? c.chosenPerson?.name ?? "أي أخصائية متاحة" : null;
  const chips: { step: number; icon: string; text: string }[] = [
    ...(typeName ? [{ step: 0, icon: "sparkle", text: typeName }] : []),
    ...(c.service ? [{ step: skipSession ? 0 : 1, icon: "drop", text: c.service.short_name || c.service.name }] : []),
    ...(c.service && !skipLevel && c.level && step > 2 ? [{ step: 2, icon: "history", text: c.level.name }] : []),
    ...(c.service && step > 3 && personName ? [{ step: 3, icon: "user", text: personName }] : []),
    ...(c.day && c.service && step > 4 ? [{ step: 4, icon: "cal", text: dayLabel(c.day) }] : []),
    ...(c.time && step > 5 ? [{ step: 5, icon: "clock", text: clock(c.time) }] : []),
  ];

  /* ---------- the cards ---------- */
  function head({ n, title, sub }: { n: number; title: string; sub?: ReactNode }) {
    return (
      <div className={s.head}>
        <div className={s.eyebrow}><span className="latin">{n + 1}</span> من <span className="latin">{STEPS.length}</span> · {STEPS[n]}</div>
        <h2 className={s.title} ref={n === step ? headRef : undefined} tabIndex={-1}>{title}</h2>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
    );
  }

  function renderCard(n: number): ReactNode {
    const info = c.info!;
    switch (n) {
      case 0: return (
        <>
          {head({ n: 0, title: "ما نوع موعدكِ؟", sub: "استشارة لتحديد ما يناسبكِ، أو جلسة من فئات العناية مع أخصائيات المركز." })}
          <div className={s.body}>
            <div className={s.types}>
              {c.cards.map((card, i) => {
                const dark = card.kind === "consult";
                const on = c.kind === card.kind && (dark || c.curPubCat === card.key);
                return (
                  <button key={card.kind + card.key} type="button" className={`${s.type} ${dark ? s.typeDark : ""} ${on ? s.typeOn : ""}`} style={{ animationDelay: `${i * 45}ms` }}
                    onClick={() => chooseType(card)} disabled={!card.ready} aria-pressed={on}>
                    <span className={s.typeIcon}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {dark && info.consultant?.photo_url ? <img src={info.consultant.photo_url} alt="" /> : <Icon name={card.icon} size={24} color={dark ? "#fff" : C.accentMid} />}
                    </span>
                    <span className={s.typeText}>
                      <span className={s.typeName}>{card.name}</span>
                      <span className={s.typeSub}>
                        {!card.ready ? "غير متاحة حالياً" : dark && info.consultant ? `مع ${info.consultant.name}${card.sub ? ` — ${card.sub}` : ""}` : card.sub || `${count(card.count)} مع أخصائيات المركز`}
                      </span>
                    </span>
                    {card.ready ? <span className={s.typeGo}><Icon name="chev" size={18} color={dark ? "#fff" : C.accent} /></span> : <span className={s.soon}>قريباً</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      );
      case 1: return (
        <>
          {head({ n: 1, title: c.kind === "consult" ? "اختاري نوع الاستشارة" : "اختاري الجلسة", sub: typeName ? <>ضمن <b>{typeName}</b> · {count(c.kindServices.length)}</> : undefined })}
          <div className={s.body}>
            {c.svcCat?.not_for_pregnant && <PregnancyNotice style={{ marginBottom: 12 }} />}
            <div className={s.list}>
              {c.kindServices.map((x, i) => {
                const on = c.service?.key === x.key;
                return (
                  <button key={x.key} type="button" className={`${s.svc} ${on ? s.svcOn : ""}`} style={{ animationDelay: `${i * 40}ms` }} onClick={() => chooseService(x)} aria-pressed={on}>
                    <span className={s.svcName}>{x.name}</span>
                    {x.description && <span className={s.svcDesc}>{x.description}</span>}
                    <span className={s.svcMeta}>
                      <span className={s.svcDur}><Icon name="clock" size={15} color={C.accentMid} /><span className="latin">{x.minutes}</span> دقيقة</span>
                      <b>{x.price == null ? "السعر عند الاستفسار" : pubPrice(x)}</b>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      );
      case 2: return (
        <>
          {head({ n: 2, title: "مدة الجلسة", sub: c.service ? <>لـ«{c.service.short_name || c.service.name}» {c.levels.length === 3 ? "ثلاثة مستويات" : c.levels.length === 2 ? "مستويان" : `${c.levels.length} مستويات`} — اختاري الوقت الذي تحتاجه بشرتكِ.</> : undefined })}
          <div className={s.body}>
            {skipSession && c.service && (
              <div className={s.autoNote}><Icon name="check" size={16} color={C.accent} stroke={2.4} />اخترنا لكِ «{c.service.name}» — الخدمة الوحيدة في هذا النوع.</div>
            )}
            <LevelPicker layout="stack" levels={c.levels} value={c.level?.id ?? null} onChange={c.pickLevel} />
          </div>
          <div className={s.actions}><button type="button" className={s.primary} onClick={() => go(3)}>متابعة{c.level ? ` · ${c.level.name}` : ""}<Icon name="chev" size={19} color="#fff" /></button></div>
        </>
      );
      case 3: {
        const consult = c.kind === "consult";
        return (
          <>
            {head({ n: 3, title: consult ? "استشارتكِ مع" : "مع من تفضّلين؟", sub: consult ? "الاستشارات مع استشارية المركز." : "اختاري أخصائية بعينها أو اتركيها لنا لنعرض لكِ كل الأوقات المتاحة." })}
            <div className={s.body}>
              {skipSession && skipLevel && c.service && (
                <div className={s.autoNote}><Icon name="check" size={16} color={C.accent} stroke={2.4} />اخترنا لكِ «{c.service.name}» — الخدمة الوحيدة في هذا النوع.</div>
              )}
              {c.svcCat?.not_for_pregnant && skipSession && <PregnancyNotice style={{ marginBottom: 12 }} />}
              {consult ? (
                info.consultant && (
                  <div className={s.consultant}>
                    <Ava p={info.consultant} size={64} />
                    <div style={{ minWidth: 0 }}>
                      <div className={s.personName}>{info.consultant.name}</div>
                      <div className={s.personTitle}>{info.consultant.title || "استشارية العناية بالبشرة"}</div>
                      {c.service && <div className={s.personTitle}>{c.service.name}</div>}
                    </div>
                    <span className={s.pickedMark}><Icon name="check" size={16} color="#fff" stroke={2.6} /></span>
                  </div>
                )
              ) : c.noProvider ? (
                <div className={s.note}>لا تتوفّر أخصائية لهذه الجلسة حالياً. اختاري جلسة أخرى{c.contact ? " أو تواصلي معنا لنرتّب موعدكِ" : ""}.</div>
              ) : (
                <div className={s.list}>
                  <button type="button" className={`${s.person} ${s.personAny} ${c.specialist === null ? s.personOn : ""}`} onClick={() => chooseSpecialist(null)} aria-pressed={c.specialist === null}>
                    <span className={s.ava} style={{ width: 52, height: 52 }}><Icon name="users" size={22} color={C.accent} /></span>
                    <span className={s.personText}>
                      <span className={s.personName}>أي أخصائية متاحة</span>
                      <span className={s.personTitle}>أكثر الأوقات المتاحة</span>
                    </span>
                    <span className={s.reco}>مُستحسن</span>
                  </button>
                  {c.people.map((p) => (
                    <button key={p.id} type="button" className={`${s.person} ${c.specialist === p.id ? s.personOn : ""}`} onClick={() => chooseSpecialist(p.id)} aria-pressed={c.specialist === p.id}>
                      <Ava p={p} />
                      <span className={s.personText}>
                        <span className={s.personName}>{p.name}</span>
                        {p.title && <span className={s.personTitle}>{p.title}</span>}
                      </span>
                      <span className={s.typeGo}><Icon name="chev" size={18} color={C.accent} /></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {consult && info.consultant && <div className={s.actions}><button type="button" className={s.primary} onClick={() => go(4)}>متابعة<Icon name="chev" size={19} color="#fff" /></button></div>}
            {!consult && c.noProvider && <div className={s.actions}><button type="button" className={s.ghostBtn} onClick={() => go(skipSession ? 0 : 1)}>اختاري جلسة أخرى</button></div>}
          </>
        );
      }
      case 4: return (
        <>
          {head({ n: 4, title: "أي يوم يناسبكِ؟", sub: "خلال الأسبوعين القادمين — الأيام المغلقة باهتة." })}
          <div className={s.body}>
            <div className={s.days} data-noswipe>
              {c.days.map((k) => {
                const open = c.isOpen(k);
                const d = dateOf(k);
                const on = c.day === k;
                return (
                  <button key={k} type="button" disabled={!open} className={`${s.day} ${on ? s.dayOn : ""}`} onClick={() => chooseDay(k)} aria-pressed={on} aria-label={`${dayLabel(k)}${open ? "" : " — مغلق"}`}>
                    <span className={s.dayName}>{k === dayKey(c.now ?? new Date()) ? "اليوم" : AR_DAYS[weekday(k)]}</span>
                    <span className={`${s.dayNum} latin`}>{d.getUTCDate()}</span>
                    {open ? <span className={s.dayMon}>{AR_MONTHS[d.getUTCMonth()]}</span> : <span className={s.closed}>مغلق</span>}
                  </button>
                );
              })}
            </div>
            {c.day && c.isOpen(c.day) && (
              <div className={s.peek} key={c.day}>
                <div className={s.peekHead}>
                  <span className={s.peekTitle}>أقرب الأوقات · {k2(c.day, c.now)}</span>
                  {c.slots && <span className={s.peekCount}>{c.freeCount ? <><span className="latin">{c.freeCount}</span> وقتاً متاحاً</> : "مكتمل"}</span>}
                </div>
                {!c.slots && !c.slotErr && <div className={s.peekRow}>{[0, 1, 2].map((i) => <span key={i} className={`${s.skSlot} ${s.sk}`} style={{ height: 50 }} />)}</div>}
                {c.slots && c.freeCount > 0 && (
                  <div className={s.peekRow}>
                    {c.visibleSlots.filter((x) => x.available).slice(0, 3).map((x) => (
                      <button key={x.starts_at} type="button" className={s.slot} onClick={() => chooseTime(x.starts_at)} aria-label={`الساعة ${clock(x.starts_at)}`}>
                        <span className="latin">{clock(x.starts_at)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {c.slots && c.freeCount === 0 && <div className={s.personTitle} style={{ marginTop: 8 }}>لا أوقات متاحة في هذا اليوم، اختاري يوماً آخر.</div>}
                {c.slots && c.freeCount > 3 && <button type="button" className={s.peekMore} onClick={() => go(5)}>كل أوقات اليوم<Icon name="chev" size={16} color={C.accent} /></button>}
              </div>
            )}
            <div className={s.dayHint}>
              <Icon name="info" size={16} color={C.accentMid} />
              <span>نعرض الأيام التي تداوم فيها {c.kind === "consult" ? "الاستشارية" : c.chosenPerson ? "الأخصائية المختارة" : "أخصائيات هذه الجلسة"}. الأوقات بتوقيت دمشق.</span>
            </div>
          </div>
          {c.day && c.isOpen(c.day) && (
            <div className={s.actions}><button type="button" className={s.primary} onClick={() => chooseDay(c.day!)}>{dayLabel(c.day)}<Icon name="chev" size={19} color="#fff" /></button></div>
          )}
        </>
      );
      case 5: return (
        <>
          {head({ n: 5, title: "اختاري الساعة", sub: c.day && c.service ? <>{dayLabel(c.day)} · {durationLabel(c.minutes)}</> : undefined })}
          <div className={s.body}>
            <div className={s.legend}><span><i className={s.lgFree} />متاح</span><span><i className={s.lgBusy} />محجوز</span></div>
            {c.slotErr && <div className={s.err}>{c.slotErr}<button type="button" className={s.linkBtn} onClick={c.fetchSlots}>أعيدي المحاولة</button></div>}
            {!c.slots && !c.slotErr && (
              <div aria-busy="true" aria-label="جارٍ التحقق من الأوقات">
                <div className={`${s.skLine} ${s.sk}`} />
                <div className={s.slots}>{Array.from({ length: 9 }, (_, i) => <span key={i} className={`${s.skSlot} ${s.sk}`} style={{ animationDelay: `${i * 70}ms` }} />)}</div>
              </div>
            )}
            {c.slots && c.visibleSlots.length === 0 && <div className={s.note}>انتهت مواعيد هذا اليوم. اختاري يوماً آخر.</div>}
            {c.slots && c.visibleSlots.length > 0 && c.freeCount === 0 && (
              <div className={s.note} style={{ marginBottom: 6 }}>هذا اليوم مكتمل الحجز{c.kind === "session" && c.specialist ? " مع الأخصائية المختارة — جرّبي «أي أخصائية متاحة» أو" : "،"} اختاري يوماً آخر.</div>
            )}
            {c.slots && c.parts.map((p) => (
              <div key={p.label}>
                <div className={s.part}>{p.label}</div>
                <div className={s.slots}>
                  {p.list.map((x) => (
                    <button key={x.starts_at} type="button" disabled={!x.available} className={`${s.slot} ${c.time === x.starts_at ? s.slotOn : ""}`}
                      onClick={() => chooseTime(x.starts_at)} aria-pressed={c.time === x.starts_at} aria-label={x.available ? `الساعة ${clock(x.starts_at)}` : `الساعة ${clock(x.starts_at)} محجوزة`}>
                      <span className={`${s.slotT} latin`}>{clock(x.starts_at)}</span>
                      {!x.available && <span className={s.slotBusy}>محجوز</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {c.slots && c.freeCount === 0 && <div className={s.actions}><button type="button" className={s.ghostBtn} onClick={() => go(4)}><Icon name="cal" size={18} color={C.accent} />اختاري يوماً آخر</button></div>}
        </>
      );
      case 6: return (
        <>
          {head({ n: 6, title: "بياناتكِ", sub: "نحتاج اسمكِ ورقمكِ لتأكيد الموعد معكِ فقط." })}
          <div className={s.body}>
            <form className={s.form} onSubmit={(e) => { e.preventDefault(); reviewDetails(); }} id="cf-details">
              <label className={s.field}>
                <span className={s.label}>الاسم الكامل</span>
                <input className={s.input} value={c.name} onChange={(e) => c.setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="اكتبي اسمكِ" enterKeyHint="next" />
              </label>
              <label className={s.field}>
                <span className={s.label}>رقم الموبايل</span>
                <input className={`${s.input} latin`} value={c.phone} onChange={(e) => c.setPhone(e.target.value)} dir="ltr" inputMode="tel" type="tel" autoComplete="tel" placeholder="09xx xxx xxx" maxLength={20} style={{ textAlign: "right" }} enterKeyHint="next" />
              </label>
              <label className={s.field}>
                <span className={s.label}>ملاحظة <span className={s.opt}>(اختياري)</span></span>
                <textarea className={s.area} value={c.note} onChange={(e) => c.setNote(e.target.value)} maxLength={300} placeholder="أي شيء تودّين أن نعرفه قبل الجلسة" />
              </label>
              <div className={s.trust}><Icon name="shield" size={16} color={C.accentMid} />نستخدم رقمكِ لتأكيد الموعد فقط.</div>
            </form>
          </div>
          <div className={s.actions}><button type="submit" form="cf-details" className={s.primary}>مراجعة الموعد<Icon name="chev" size={19} color="#fff" /></button></div>
        </>
      );
      case 7: {
        const rows: [string, string, string | null, number][] = [
          ["drop", "الخدمة", c.service ? (skipLevel ? `${c.service.name} · ${durationLabel(c.minutes)}` : c.service.name) : null, skipSession ? 0 : 1],
          ...(!skipLevel && c.level ? [["history", "مدة الجلسة", `${c.level.name} · ${durationLabel(c.level.minutes)}`, 2] as [string, string, string | null, number]] : []),
          ["user", c.kind === "consult" ? "الاستشارية" : "الأخصائية", personName, 3],
          ["cal", "اليوم", c.day ? dayLabel(c.day) : null, 4],
          ["clock", "الساعة", c.time ? `${clock(c.time)} بتوقيت دمشق` : null, 5],
          ["phone", "بياناتكِ", `${c.name.trim()} · ${c.phone.trim()}`, 6],
        ];
        return (
          <>
            {head({ n: 7, title: "راجعي موعدكِ", sub: "تأكّدي من التفاصيل، ويمكنكِ تعديل أي منها." })}
            <div className={s.body}>
              <div className={s.receipt}>
                <div className={s.receiptGlow} aria-hidden />
                {c.service && <div className={s.rPrice}><span>{typeName}</span><b>{c.level ? c.priceText : c.service.price == null ? "السعر عند الاستفسار" : pubPrice(c.service)}</b></div>}
                {rows.map(([icon, label, value, to]) => (
                  <div key={label} className={s.rRow}>
                    <span className={s.rIcon}><Icon name={icon} color="#fff" size={16} /></span>
                    <div className={s.rText}><div className={s.rLabel}>{label}</div><div className={s.rValue}>{value ?? "—"}</div></div>
                    <button type="button" className={s.rEdit} onClick={() => go(to)} aria-label={`تعديل ${label}`}>تعديل</button>
                  </div>
                ))}
              </div>
              <p className={s.fine}>بالضغط على «ثبّتي الموعد» يُسجَّل حجزكِ بانتظار تأكيد المركز، وسنتواصل معكِ على رقمكِ.</p>
            </div>
            <div className={s.actions}>
              <button type="button" className={s.primary} onClick={c.submit} disabled={c.busy}>
                {c.busy ? <><span className={s.spin} aria-hidden />جارٍ الحجز…</> : <><Icon name="calcheck" color="#fff" size={21} />ثبّتي الموعد</>}
              </button>
            </div>
          </>
        );
      }
    }
    return null;
  }

  /* ---------- page states ---------- */
  const ready = !!c.info && c.info.services.length > 0;
  let content: ReactNode;
  if (c.result) {
    const r = c.result;
    content = (
      <section className={`${s.card} ${s.success}`} aria-live="polite">
        <div className={s.burst} aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ["--a" as string]: `${i * 30}deg`, animationDelay: `${120 + (i % 3) * 40}ms` }} />)}</div>
        <div className={s.doneMark}><Icon name="check" color="#fff" size={40} stroke={2.4} /></div>
        <h2 className={s.doneTitle}>تم استلام طلب حجزكِ</h2>
        <p className={s.doneText}>الموعد <b>بانتظار تأكيد المركز</b>، وستصلكِ رسالة واتساب لتأكيد الحجز على الرقم <b className="latin" dir="ltr" style={{ unicodeBidi: "isolate", whiteSpace: "nowrap" }}>{localPhone(r.phone || c.phone)}</b></p>
        <div className={s.miniSum}>
          <div className={s.miniRow}><span>الحالة</span><span style={{ color: C.accent, fontWeight: 700 }}>بانتظار التأكيد</span></div>
          <div className={s.miniRow}><span>الخدمة</span><span>{r.service}</span></div>
          <div className={s.miniRow}><span>اليوم</span><span>{dayLabel(dayKey(new Date(r.starts_at)))}</span></div>
          {r.level && !skipLevel && <div className={s.miniRow}><span>مدة الجلسة</span><span>{r.level}</span></div>}
          <div className={s.miniRow}><span>الساعة</span><span><span className="latin">{clock(r.starts_at)}</span> · {durationLabel(r.minutes)}</span></div>
          {r.price != null && r.price > 0 && <div className={s.miniRow}><span>السعر</span><span>{money(r.price)}</span></div>}
          {r.specialist && <div className={s.miniRow}><span>مع</span><span>{r.specialist}</span></div>}
        </div>
        {r.consult && (
          <a href={appHref(R.P_Appointments)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "start", margin: "14px 0 0", padding: "14px 16px", borderRadius: 22, color: "#fff", background: "linear-gradient(140deg,#9C64AA,#7B4687 60%,#5E2F6B)", boxShadow: "0 12px 26px rgba(123,70,135,0.28)" }}>
            <span style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)" }}><Icon name="file" color="#fff" size={21} /></span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}><b style={{ display: "block", fontSize: 15 }}>جهّزي استشارتكِ</b><span style={{ fontSize: 12.5, opacity: 0.88 }}>من التطبيق: أخبري المستشارة عن بشرتكِ قبل الموعد — دقائق قليلة فقط</span></span>
            <Icon name="chev" color="#fff" size={18} />
          </a>
        )}
        <div className={s.doneBtns}>
          <button type="button" className={s.primary} onClick={c.downloadIcs}><Icon name="calcheck" color="#fff" size={19} />أضيفي إلى التقويم (مبدئياً)</button>
          <a className={s.ghostBtn} href={appHref(R.P_Appointments)}><Icon name="phone" color={C.accent} size={19} />أديري موعدكِ من التطبيق</a>
        </div>
        <p className={s.fine}>ادخلي إلى التطبيق برقم الموبايل نفسه لتجدي موعدكِ وتتابعي دوركِ يوم الزيارة.</p>
        <button type="button" className={s.again} onClick={() => { c.restart(); setStep(0); setLeaving(null); }}>حجز موعد آخر</button>
      </section>
    );
  } else if (c.loadErr) {
    content = (
      <section className={`${s.card} ${s.center}`}>
        <h2 className={s.title}>تعذّر تحميل المواعيد</h2>
        <p className={s.sub}>{c.loadErr}</p>
        <button type="button" className={s.primary} style={{ marginTop: 18 }} onClick={c.load}><Icon name="refresh" color="#fff" size={18} />أعيدي المحاولة</button>
      </section>
    );
  } else if (!c.info) {
    content = (
      <section className={s.card} aria-busy="true" aria-label="جارٍ تحميل الخدمات">
        <div className={`${s.sk} ${s.skEyebrow}`} /><div className={`${s.sk} ${s.skTitle}`} /><div className={`${s.sk} ${s.skLine}`} />
        {Array.from({ length: 4 }, (_, i) => <div key={i} className={`${s.sk} ${s.skTile}`} style={{ animationDelay: `${i * 90}ms` }} />)}
      </section>
    );
  } else if (!ready) {
    content = (
      <section className={`${s.card} ${s.center}`}>
        <span className={s.emptyIcon}><Icon name="cal" size={26} color={C.accent} /></span>
        <h2 className={s.title}>الحجز من الرابط يفتح قريباً</h2>
        <p className={s.sub}>نجهّز قائمة الجلسات وأوقاتها. {c.contact ? "إلى ذلك الحين يسعدنا حجز موعدكِ عبر الهاتف أو واتساب." : "عودي إلينا قريباً، أو زوري موقعنا لمعرفة المزيد."}</p>
        <div className={s.doneBtns}>
          {c.waLink && <a className={s.primary} href={c.waLink} target="_blank" rel="noreferrer"><Icon name="msg" color="#fff" size={19} />راسلينا على واتساب</a>}
          {c.info.centre?.phone && <a className={s.ghostBtn} href={`tel:${c.info.centre.phone}`}><Icon name="phone" color={C.accent} size={19} /><span className="latin" dir="ltr">{c.info.centre.phone}</span></a>}
          {!c.contact && <a className={s.ghostBtn} href={c.siteHref}><Icon name="home" color={C.accent} size={19} />موقع المركز</a>}
        </div>
      </section>
    );
  } else {
    const remaining = LAST - step;
    content = (
      <div className={s.deck}>
        {remaining >= 2 && <div className={`${s.ghost} ${s.ghost2}`} aria-hidden />}
        {remaining >= 1 && <div className={`${s.ghost} ${s.ghost1}`} aria-hidden />}
        {leaving && leaving.step !== step && (
          <section key={`l${leaving.id}`} className={`${s.card} ${leaving.dir === "fwd" ? s.exitFwd : s.exitBack}`} aria-hidden inert>
            {renderCard(leaving.step)}
          </section>
        )}
        <section key={`c${step}`} className={`${s.card} ${dir === "fwd" ? s.enterFwd : s.enterBack} ${drag ? s.dragging : ""}`}
          style={drag ? { transform: `translateX(${drag}px) rotate(${drag / 40}deg)`, opacity: Math.max(0.5, 1 - drag / 400) } : undefined}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-label={`الخطوة ${step + 1} من ${STEPS.length}: ${STEPS[step]}`}>
          {renderCard(step)}
        </section>
      </div>
    );
  }

  const toast = c.err && !c.result ? c.err : "";
  return (
    <div className={s.page} dir="rtl">
      <div className={s.halo} aria-hidden />
      <header className={s.top}>
        <div className={s.bar}>
          {ready && !c.result && step > 0
            ? <button type="button" className={s.backBtn} onClick={back} aria-label="رجوع إلى الخطوة السابقة"><Icon name="back" size={20} color={C.accent} /></button>
            : <a href={c.siteHref} className={s.backBtn} aria-label="موقع المركز"><Icon name="home" size={19} color={C.accent} /></a>}
          <a href={c.siteHref} aria-label="فاطمة بيوتي" className={s.logo}><Logo height={40} /></a>
          {c.now && <span className={s.clock} aria-label={`الآن في دمشق ${clock(c.now)}`}><Icon name="clock" size={15} color={C.accentMid} /><b className="latin">{clock(c.now)}</b></span>}
        </div>
        {ready && !c.result && (
          <>
            <ol className={s.progress} aria-label="مراحل الحجز">
              {STEPS.map((label, i) => {
                const skipped = (i === 1 && skipSession && step > 1) || (i === 2 && skipLevel && step > 2);
                return (
                  <li key={label} className={`${s.pStep} ${i < step ? s.pDone : ""} ${i === step ? s.pNow : ""} ${skipped ? s.pSkip : ""}`} aria-current={i === step ? "step" : undefined}>
                    <span className={s.pBar} />
                    <span className={s.pLabel}>{label}</span>
                  </li>
                );
              })}
            </ol>
            {step < LAST && <div className={s.chips} data-noswipe aria-label="اختياراتكِ">
              {chips.length === 0
                ? <span className={s.chipHint}>احجزي موعدكِ في دقيقة — الأوقات حقيقية ومحدّثة لحظة بلحظة.</span>
                : chips.map((ch) => (
                  <button key={ch.icon} type="button" className={s.chip} onClick={() => go(ch.step)} aria-label={`تعديل: ${ch.text}`}>
                    <Icon name={ch.icon} size={14} color={C.accent} /><span>{ch.text}</span>
                  </button>
                ))}
            </div>}
          </>
        )}
      </header>
      <main className={s.main}>{content}</main>
      {toast && (
        <div className={s.toast} role="alert" onClick={() => c.setErr("")}>
          <Icon name="alert" size={18} color="#fff" /><span>{toast}</span>
        </div>
      )}
    </div>
  );
}
