"use client";
import { phoneOk, PHONE_ERR } from "@/lib/phone";
import { BirthDateSelect, isoBirth } from "../../patients/basicInfo";

/** W_BookingModal.dc.html — new appointment over the calendar. One form for every client: typing a name/phone suggests existing files; a matching phone selects the file automatically, otherwise a new file is opened on save. Or walk-in (live). */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, ErrorNote, Icon, Loading, Modal, Segment, Select, SubmitButton, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listRooms, listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import {
  book, bookingError, busyRanges, OPEN_VISIT, OPEN_VISIT_MIN, OPEN_VISIT_ROOM, createPatient, staffSlots, overlapHint, getHours, provides, searchPatients, serviceProviders, useSearch, type PatientHit,
} from "@/lib/db/appointments";
import { getPatient } from "@/lib/db/patients";
import { listStaffHours, worksAt } from "@/lib/db/staff";
import { weekday } from "@/lib/db/appointments";
import { arDate, atDamascus, clock, dayKey } from "@/lib/format";
import { consultWarnings } from "@/lib/db/consultTime";
import { C, ICON_FILL } from "@/lib/tokens";
import { CalendarBody } from "../CalendarBoard";
import { GOLD_DEEP, GOLD_LINE, GOLD_SOFT } from "@/lib/db/vip";
import { VipBookingDialog, VipButton } from "../vip";
import css from "../appts.module.css";
import { levelsOf, listLevels, patientLevels } from "@/lib/db/levels";
import { levelPrice } from "../../settings/services/levels";
import { addDays } from "../followUpDate";
import { isOpen } from "@/lib/db/appointments";

const FOLLOW_UP = "follow-up";
const FU_DAYS = [15, 30, 40, 60];

type Mode = "book" | "walkin";
const digitsOf = (v: string) => v.replace(/\D/g, "").replace(/^(963|0)/, "");

export default function BookingModalPage() {
  const router = useRouter();
  const close = () => router.push(R.W_Calendar);
  const [vip, setVip] = useState(false);
  return (
    <AdminShell active="المواعيد" title="المواعيد" subtitle="موعد جديد">
      <CalendarBody />
      {vip ? <VipBookingDialog open onClose={close} /> : <BookingDialog onClose={close} onVip={() => setVip(true)} />}
    </AdminShell>
  );
}

function BookingDialog({ onClose, onVip }: { onClose: () => void; onVip: () => void }) {
  const services = useQuery(["catalog", "services"], listServices);
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const hours = useQuery(["appointments", "hours"], getHours);
  const staffHours = useQuery(["staff_hours", "all"], listStaffHours);
  const prov = useQuery(["appointments", "providers"], serviceProviders);
  const levels = useQuery(["levels", "all"], listLevels);

  const [mode, setMode] = useState<Mode>("book");
    const [hits, setHits] = useState<PatientHit[]>([]);
  const [patient, setPatient] = useState<PatientHit | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [checkIn, setCheckIn] = useState(true);
  // «تُحدَّد عند الوصول»: no service / specialist — holds 60 min (one bed) in the skin room
  const [later, setLater] = useState(false);
  const [svcKey, setSvcKey] = useState("");
  const [sp, setSp] = useState("");
  const [room, setRoom] = useState("");
  const [day, setDay] = useState(dayKey());
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // «خدمات إضافية في نفس الموعد»: each extra service is booked right after the previous one (same specialist)
  const [extras, setExtras] = useState<{ svc: string; lv: string }[]>([]);

  // opened from a patient file: «موعد جديد» passes ?patient=<id>
  const search = useSearch();
  const preId = search?.get("patient") ?? "";
  useEffect(() => {
    if (!preId) return;
    let live = true;
    getPatient(preId).then((p) => { if (live && p) { setMode("book"); setPatient({ id: p.id, name: p.name, phone: p.phone, file_no: p.file_no }); } }).catch(() => {});
    return () => { live = false; };
  }, [preId]);

  // suggestions from what is typed: the phone (4+ digits) wins over the name
  useEffect(() => {
    if (mode !== "book" || patient) return;
    const core = digitsOf(phone);
    const term = core.length >= 4 ? core : name.trim();
    if (term.length < 2) { setHits([]); return; }
    let live = true;
    const t = setTimeout(() => {
      searchPatients(term).then((r) => {
        if (!live) return;
        // full phone of an existing file → select it automatically
        const exact = core.length >= 9 ? r.find((h) => digitsOf(h.phone ?? "") === core) : undefined;
        if (exact) { setPatient(exact); setHits([]); } else setHits(r.slice(0, 5));
      }).catch(() => live && setHits([]));
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [name, phone, mode, patient]);

  const svc = (services.data ?? []).find((s) => s.key === svcKey) ?? services.data?.[0] ?? null;
  useEffect(() => { if (svc && !svcKey) setSvcKey(svc.key); }, [svc, svcKey]);
  useEffect(() => { setRoom(svc?.room_id ?? ""); setTime(""); }, [svc?.key, svc?.room_id]);

  // «مستوى الجلسة»: default = the level set in her file for this service, else level 1
  const pLevels = useQuery(["levels", "patient", patient?.id], () => patientLevels(patient!.id), { enabled: mode === "book" && !!patient });
  const svcLevels = levelsOf(levels.data, svc?.key);
  const assigned = mode === "book" ? (pLevels.data ?? []).find((x) => x.service_key === svc?.key)?.level_id : null;
  const [lvPick, setLvPick] = useState("");
  useEffect(() => { setLvPick(""); }, [svc?.key, patient?.id]);
  const lvl = svcLevels.find((l) => l.id === lvPick) ?? svcLevels.find((l) => l.id === assigned) ?? svcLevels[0] ?? null;
  const openV = later && mode !== "walkin";
  const lvMin = openV ? OPEN_VISIT_MIN : lvl?.minutes ?? svc?.minutes ?? 30;
  const effRoom = openV ? OPEN_VISIT_ROOM : room;
  const effSp = openV ? "" : sp;
  useEffect(() => { setTime(""); }, [lvMin, openV]);

  const busyQ = useQuery(["appointments", "busy", day, day], () => busyRanges(day), { enabled: /^\d{4}-\d{2}-\d{2}$/.test(day) });
  const roomCap = (rooms.data ?? []).find((r) => r.id === effRoom)?.capacity ?? 1;
  // staff: EVERY time within the opening hours (every 15 min) — overlaps are an amber hint, never a block
  const slots = useMemo(() => {
    if (!svc || !hours.data || !busyQ.data || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return [];
    return staffSlots(hours.data, day, lvMin, busyQ.data, effRoom || null, effSp || null, roomCap);
  }, [svc, lvMin, hours.data, busyQ.data, day, effRoom, roomCap, effSp]);
  // «مراجعة بعد N يوم»: service = follow-up with the consultant, day = first open day ≥ today+N, time = first free slot
  const [fu, setFu] = useState<{ n: number; pending: boolean } | null>(null);
  const nextOpen = (k: string) => { let d = k; for (let i = 0; i < 30 && hours.data && !isOpen(hours.data, d); i++) d = addDays(d, 1); return d; };
  function pickFollowUp(n: number) {
    const consultant = (team.data ?? []).find((t) => (t as { is_consultant?: boolean }).is_consultant);
    setLater(false); setError("");
    setSvcKey(FOLLOW_UP);
    if (consultant) setSp(consultant.id);
    setDay(nextOpen(addDays(dayKey(), n)));
    setFu({ n, pending: true });
  }
  useEffect(() => {
    if (!fu?.pending || svc?.key !== FOLLOW_UP || busyQ.loading || !busyQ.data || !hours.data) return;
    const free = slots.find((x) => !x.hint);
    if (free) { setTime(free.t); setFu({ n: fu.n, pending: false }); }
    else if (day < addDays(dayKey(), fu.n + 21)) setDay(nextOpen(addDays(day, 1)));
    else setFu({ n: fu.n, pending: false });
  }, [fu, svc?.key, slots, busyQ.loading, busyQ.data, hours.data, day]);
  const toM = (t: string) => { const [a, b] = t.split(":").map(Number); return a * 60 + (b || 0); };
  /** Does the chosen specialist work (her «أوقات الدوام», or the default hours without a schedule) for the whole visit at time t? */
  const onDuty = (t: string, d: string) => !effSp || !svc || !hours.data || !/^\d{2}:\d{2}$/.test(t) || !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
    worksAt(staffHours.data ?? [], sp, weekday(d), toM(t), toM(t) + lvMin, hours.data);
  const offDuty = !onDuty(mode === "walkin" ? clock() : time, mode === "walkin" ? dayKey() : day);
  const spName = (team.data ?? []).find((t) => t.id === sp)?.name ?? "";
  // the chosen specialist does not provide this service («الخدمات التي تقدّمها») — warn, do not block
  const notProvider = !openV && !!sp && !!svc && !!prov.data && !provides(prov.data, sp, svc.key);
  const [cw, setCw] = useState<string[]>([]);
  useEffect(() => {
    let live = true; setCw([]);
    const walk = mode === "walkin", t = walk ? clock() : time;
    if (openV || !svc?.is_consultation || !sp || !/^\d{2}:\d{2}$/.test(t)) return;
    consultWarnings(svc.key, atDamascus(walk ? dayKey() : day, t), sp, lvMin).then((w) => { if (live) setCw(w); }, () => {});
    return () => { live = false; };
  }, [openV, svc?.key, svc?.is_consultation, sp, time, day, lvMin, mode]);
  const pickT = mode === "walkin" ? clock() : time;
  const overlap = /^\d{2}:\d{2}$/.test(pickT) && busyQ.data
    ? (() => { const s0 = new Date(atDamascus(mode === "walkin" ? dayKey() : day, pickT)).getTime(); return overlapHint(s0, s0 + lvMin * 60000, busyQ.data!, effRoom || null, effSp || null, roomCap); })()
    : null;
  const warning = [notProvider && `${spName} لا تقدّم هذه الخدمة`, offDuty && `خارج دوام ${spName}`, overlap, ...cw].filter(Boolean).join(" · ");
  const teamSorted = [...(team.data ?? [])].sort((a, b) => Number(!provides(prov.data, a.id, svc?.key)) - Number(!provides(prov.data, b.id, svc?.key)));

  async function submit() {
    setError("");
    if (!svc) { setError("اختاري الخدمة."); return; }
    const walk = mode === "walkin";
    const t = walk ? clock() : time;
    if (!walk && !/^\d{2}:\d{2}$/.test(t)) { setError("اختاري الوقت."); return; }
    if (!patient && !name.trim()) { setError("اكتبي اسم المراجِعة."); return; }
    if (!patient && !phoneOk(phone)) { setError(PHONE_ERR); return; }
    if (patient && !patient.phone) { setError("هذه المراجِعة بلا رقم هاتف. أضيفي رقمها في ملفها أولاً، فالرقم إلزامي للحجز."); return; }
    // staff bookings are never blocked: not-provider / off-duty / overlap / consultation rules are one warning line
    setBusy(true);
    try {
      let pid = patient?.id ?? null;
      if (!walk && !patient) {
        // existing file with this phone? use it; otherwise open a new file automatically
        const core = digitsOf(phone);
        const found = (await searchPatients(core)).find((h) => digitsOf(h.phone ?? "") === core);
        const chosen = found ?? await createPatient(name, phone, { birth_date: isoBirth(dob) || null });
        pid = chosen?.id ?? null;
        // keep it selected so a retry after a booking error does not open a second file
        if (chosen) setPatient(chosen);
      }
      if (openV) {
        await book({ service: OPEN_VISIT, day, time: t, specialist: null, room: OPEN_VISIT_ROOM, patient: pid, source: "reception", level: null });
        onClose();
        return;
      }
      const first = await book({
        service: svc.key, day: walk ? dayKey() : day, time: t, specialist: sp || null, room: room || null, patient: pid,
        walkInName: walk ? name : undefined, walkInPhone: walk ? phone : undefined,
        source: walk ? "walk_in" : "reception", checkIn: walk && checkIn, level: lvl?.id ?? null,
      });
      // extra services in the same visit: chained back-to-back after the first one
      const d0 = walk ? dayKey() : day;
      let at = toM(t) + lvMin;
      const fp = pid ?? (first as { patient_id?: string | null } | null)?.patient_id ?? null;
      for (const x of extras) {
        const xs = (services.data ?? []).find((s) => s.key === x.svc);
        if (!xs) continue;
        const xl = levelsOf(levels.data, xs.key).find((l) => l.id === x.lv) ?? levelsOf(levels.data, xs.key)[0] ?? null;
        const hhmm = `${String(Math.floor(at / 60)).padStart(2, "0")}:${String(at % 60).padStart(2, "0")}`;
        await book({ service: xs.key, day: d0, time: hhmm, specialist: sp || null, room: xs.room_id ?? null, patient: fp,
          walkInName: walk && !fp ? name : undefined, walkInPhone: walk && !fp ? phone : undefined,
          source: walk ? "walk_in" : "reception", level: xl?.id ?? null });
        at += xl?.minutes ?? xs.minutes ?? 30;
      }
      onClose();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      setError(/patients_phone_key|duplicate key.*phone/.test(m) ? "يوجد ملف بهذا الرقم — اختاريه من الاقتراحات." : bookingError(e));
    } finally { setBusy(false); }
  }

  const loading = services.loading || rooms.loading || hours.loading;
  return (
    <Modal open onClose={onClose} title="موعد جديد" width={640}
      footer={!services.data?.length ? undefined : <SubmitButton onClick={submit} busy={busy}>{mode === "walkin" ? (checkIn ? "تسجيل الحضور وإعطاء رقم دور" : "حفظ الحضور") : "حجز الموعد"}</SubmitButton>}>
      {loading ? <Loading /> : !services.data?.length ? (
        <ErrorNote>لا توجد خدمات بعد. أضيفي الخدمات من الإعدادات أولاً.</ErrorNote>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderRadius: 20, padding: "10px 12px 10px 16px", background: GOLD_SOFT, border: `1px solid ${GOLD_LINE}` }}>
            <span style={{ flex: "1 1 220px", fontSize: 13.5, fontWeight: 600, color: GOLD_DEEP, lineHeight: 1.5 }}>عميلة VIP أو حالة طارئة دون موعد؟ أقرب وقت اليوم من الاحتياطي، بسعر <span className="latin">×1.7</span>.</span>
            <VipButton onClick={onVip} height={42} />
          </div>
          <Segment label="نوع الحجز" value={mode} onChange={(v) => { setMode(v); setError(""); }}
            options={[{ value: "book", label: "موعد" }, { value: "walkin", label: "حضور مباشر" }]} />

          {patient ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 18, padding: "10px 14px", background: C.tint2 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="users" size={18} /></span>
              <div style={{ flex: 1, lineHeight: 1.35 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{patient.name || "بدون اسم"}</div>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>لها ملف {patient.file_no}{patient.phone ? <> · <span className="latin" dir="ltr">{patient.phone}</span></> : null}</div>
              </div>
              <button type="button" onClick={() => { setPatient(null); setName(""); setPhone(""); }} style={{ border: "none", background: "none", color: C.accent, fontWeight: 700, fontSize: 13, minHeight: 36, padding: "0 8px" }}>تغيير</button>
            </div>
          ) : (
            <>
              <div className={css.grid2}>
                <TextInput label="اسم المراجِعة" required value={name} onChange={setName} />
                <TextInput label="رقم الهاتف (إلزامي)" value={phone} onChange={setPhone} dir="ltr" placeholder="09… أو +90…" hint="رقم أجنبي؟ اكتبيه بالرمز الدولي" />
              </div>
              {mode === "book" && hits.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>لها ملف؟ اضغطي على اسمها:</div>
                  {hits.map((h) => (
                    <button key={h.id} type="button" onClick={() => { setPatient(h); setHits([]); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderRadius: 14, padding: "9px 14px", border: "1px solid #EADCF0", background: C.white, fontSize: 14, textAlign: "right" }}>
                      <b>{h.name || "بدون اسم"}</b><span style={{ fontSize: 12.5, color: C.sub2 }}>ملف {h.file_no}{h.phone ? <> · <span className="latin" dir="ltr">{h.phone}</span></> : ""}</span>
                    </button>
                  ))}
                </div>
              )}
              {mode === "book" && (
                <div className={css.grid2}>
                  <BirthDateSelect value={dob} onChange={setDob} label="تاريخ الميلاد (اختياري)" />
                  <div style={{ alignSelf: "end", fontSize: 12.5, color: C.sub2, lineHeight: 1.6, paddingBottom: 6 }}>إن لم يكن لها ملف يُفتح ملفها تلقائياً عند الحجز.</div>
                </div>
              )}
            </>
          )}

          {mode === "book" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>حجز مراجعة بعد:</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FU_DAYS.map((n) => {
                  const on = fu?.n === n && svc?.key === FOLLOW_UP;
                  return (
                    <button key={n} type="button" onClick={() => pickFollowUp(n)}
                      style={{ flex: "1 1 0", minWidth: 64, height: 42, borderRadius: 21, border: `1px solid ${C.accent}`, background: on ? C.accent : C.white, color: on ? C.white : C.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <span className="latin">{n}</span> يوم
                    </button>
                  );
                })}
              </div>
              {fu && svc?.key === FOLLOW_UP && !fu.pending && (
                time ? <div style={{ fontSize: 13, fontWeight: 700, color: "#2F6E4A" }}>اختير تلقائياً: {arDate(new Date(atDamascus(day, time)), { year: false })} · الساعة <span className="latin">{time}</span> — اضغطي «حجز الموعد».</div>
                  : <div style={{ fontSize: 13, color: C.danger }}>لا يوجد وقت فارغ قريب، اختاري الوقت يدوياً.</div>
              )}
            </div>
          )}

          {mode !== "walkin" && (
            <Segment label="الجلسة" value={later ? "later" : "now"} onChange={(v) => { setLater(v === "later"); setError(""); }}
              options={[{ value: "now", label: "تحديد الجلسة الآن" }, { value: "later", label: "تُحدَّد عند الوصول" }]} />
          )}
          {openV ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 18, padding: "12px 14px", background: "#F4F0FA", border: "1.5px dashed #B9A3D0", fontSize: 13.5, fontWeight: 600, color: "#5B3F75", lineHeight: 1.55 }}>
              <Icon name="info" size={18} color="#7B4687" />
              <span>يُحجز سرير في غرفة العناية بالبشرة لمدة <span className="latin">{OPEN_VISIT_MIN}</span> دقيقة، دون أخصائية أو سعر. عند وصولها تحدّد الاستقبال الجلسة والمستوى والأخصائية ثم الدفع.</span>
            </div>
          ) : (<>
          <div className={css.grid3}>
            <Select label="الخدمة" value={svc?.key ?? ""} onChange={(v) => setSvcKey(v)} options={(services.data ?? []).map((s) => ({ value: s.key, label: `${s.short_name} · ${s.minutes} د · ${priceLabel(s)}` }))} />
            <Select label="الأخصائية" value={sp} onChange={setSp} options={[{ value: "", label: "غير محدّدة" }, ...teamSorted.map((t) => ({ value: t.id, label: provides(prov.data, t.id, svc?.key) ? t.name : `${t.name} — لا تقدّم هذه الخدمة` }))]} />
            <Select label="الغرفة" value={room} onChange={setRoom} options={[{ value: "", label: "بدون غرفة" }, ...(rooms.data ?? []).map((r) => ({ value: r.id, label: r.name }))]} />
          </div>

          {svcLevels.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>مستوى الجلسة{assigned && lvl?.id === assigned ? " · المحدّد في ملفها" : ""}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {svcLevels.map((l) => (
                  <Chip key={l.id} height={40} selected={lvl?.id === l.id} onClick={() => setLvPick(l.id)}>
                    {l.name} · <span className="latin">{l.minutes}</span> د · {levelPrice(l)}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, borderRadius: 18, padding: "12px 14px", background: C.tint2 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>خدمات إضافية في نفس الموعد</div>
            {extras.map((x, i) => {
              const xl = levelsOf(levels.data, x.svc);
              return (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "2 1 220px", minWidth: 0 }}>
                    <Select label={`الخدمة ${i + 2}`} value={x.svc} onChange={(v) => setExtras(extras.map((e, j) => j === i ? { svc: v, lv: "" } : e))}
                      options={(services.data ?? []).filter((s) => s.key !== OPEN_VISIT).map((s) => ({ value: s.key, label: `${s.short_name} · ${s.minutes} د · ${priceLabel(s)}` }))} />
                  </div>
                  {xl.length > 1 && (
                    <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                      <Select label="المستوى" value={x.lv || xl[0].id} onChange={(v) => setExtras(extras.map((e, j) => j === i ? { ...e, lv: v } : e))}
                        options={xl.map((l) => ({ value: l.id, label: `${l.name} · ${l.minutes} د · ${levelPrice(l)}` }))} />
                    </div>
                  )}
                  <button type="button" onClick={() => setExtras(extras.filter((_, j) => j !== i))} aria-label="حذف الخدمة"
                    style={{ height: 46, padding: "0 12px", border: "none", background: "none", color: C.danger, fontWeight: 700, fontFamily: "inherit" }}>حذف</button>
                </div>
              );
            })}
            <button type="button" onClick={() => setExtras([...extras, { svc: (services.data ?? []).find((s) => s.key !== svc?.key && s.key !== OPEN_VISIT)?.key ?? svc?.key ?? "", lv: "" }])}
              style={{ alignSelf: "flex-start", height: 40, padding: "0 16px", borderRadius: 20, border: `1px dashed ${C.accent}`, background: C.white, color: C.accent, fontWeight: 700, fontSize: 13.5, fontFamily: "inherit" }}>+ إضافة خدمة أخرى</button>
            {extras.length > 0 && <div style={{ fontSize: 12.5, color: C.sub2, lineHeight: 1.6 }}>تُحجز كل خدمة مباشرة بعد التي قبلها، مع الأخصائية نفسها.</div>}
          </div>

          </>)}

          {mode === "walkin" ? (
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderRadius: 18, padding: "12px 14px", background: C.tint2, fontSize: 14, fontWeight: 600 }}>
              تسجيل وصولها الآن وإعطاؤها رقم دور (الساعة <span className="latin">{clock()}</span>)
              <Toggle on={checkIn} onChange={setCheckIn} label="تسجيل الوصول الآن" />
            </label>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className={css.grid2}>
                <TextInput label="اليوم" type="date" dir="ltr" value={day} onChange={(v) => { setDay(v); setTime(""); }} />
                <TextInput label="الوقت" type="time" dir="ltr" value={time} onChange={setTime} hint="أو اختاري من الأوقات المتاحة" />
              </div>
              {busyQ.loading ? <Loading label="نحسب الأوقات المتاحة…" style={{ padding: 8 }} /> : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 168, overflowY: "auto" }}>
                  {slots.length === 0 ? <span style={{ fontSize: 13, color: C.sub2 }}>لا أوقات ضمن ساعات الدوام لهذا اليوم.</span>
                    : slots.map(({ t, hint }) => {
                      const off = !onDuty(t, day);
                      const amber = (off || hint) && time !== t;
                      const tip = [hint, off && "خارج دوام الأخصائية"].filter(Boolean).join(" · ") || undefined;
                      return <Chip key={t} height={34} selected={time === t} onClick={() => setTime(t)} style={amber ? { background: "#FFF9EF", border: `1.5px ${hint ? "solid" : "dashed"} #E8B86A`, color: "#9A6A1E" } : undefined}><span className="latin" title={tip}>{t}</span></Chip>;
                    })}
                </div>
              )}
            </div>
          )}
          {mode !== "walkin" && slots.some((x) => x.hint) && (
            <div style={{ fontSize: 12.5, color: C.sub2 }}>الأوقات ذات الإطار الذهبي متداخلة (الغرفة ممتلئة أو الأخصائية مشغولة) — يمكن اختيارها والحجز رغم ذلك.</div>
          )}
          {effSp && slots.some(({ t }) => !onDuty(t, day)) && mode !== "walkin" && (
            <div style={{ fontSize: 12.5, color: C.sub2 }}>الأوقات المنقّطة باللون الذهبي خارج دوام {spName}.</div>
          )}
          {warning && (
            <div role="status" style={{ borderRadius: 16, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 700, display: "flex", gap: 8, alignItems: "center", lineHeight: 1.6 }}>
              <Icon name="alert" size={16} color="#8A5A12" /><span style={{ minWidth: 0 }}>{warning} — يمكنكِ الحجز رغم ذلك.</span>
            </div>
          )}
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      )}
    </Modal>
  );
}
