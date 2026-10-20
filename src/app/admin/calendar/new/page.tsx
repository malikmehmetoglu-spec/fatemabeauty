"use client";

/** W_BookingModal.dc.html — new appointment over the calendar: existing patient, new patient record, or walk-in (live). */
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, ErrorNote, Icon, Loading, Modal, Segment, Select, SubmitButton, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listRooms, listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import {
  book, bookingError, busyRanges, createPatient, freeSlots, getHours, provides, searchPatients, serviceProviders, useSearch, type PatientHit,
} from "@/lib/db/appointments";
import { getPatient } from "@/lib/db/patients";
import { dayWindows, listStaffHours, rangesOn, worksAt } from "@/lib/db/staff";
import { weekday } from "@/lib/db/appointments";
import { clock, dayKey } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { CalendarBody } from "../CalendarBoard";
import css from "../appts.module.css";

type Mode = "existing" | "new" | "walkin";
const hm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

export default function BookingModalPage() {
  const router = useRouter();
  const close = () => router.push(R.W_Calendar);
  return (
    <AdminShell active="المواعيد" title="المواعيد" subtitle="موعد جديد">
      <CalendarBody />
      <BookingDialog onClose={close} />
    </AdminShell>
  );
}

function BookingDialog({ onClose }: { onClose: () => void }) {
  const services = useQuery(["catalog", "services"], listServices);
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const hours = useQuery(["appointments", "hours"], getHours);
  const staffHours = useQuery(["staff_hours", "all"], listStaffHours);
  const prov = useQuery(["appointments", "providers"], serviceProviders);

  const [mode, setMode] = useState<Mode>("existing");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PatientHit[]>([]);
  const [patient, setPatient] = useState<PatientHit | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState(true);
  const [svcKey, setSvcKey] = useState("");
  const [sp, setSp] = useState("");
  const [room, setRoom] = useState("");
  const [day, setDay] = useState(dayKey());
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // opened from a patient file: «موعد جديد» passes ?patient=<id>
  const search = useSearch();
  const preId = search?.get("patient") ?? "";
  useEffect(() => {
    if (!preId) return;
    let live = true;
    getPatient(preId).then((p) => { if (live && p) { setMode("existing"); setPatient({ id: p.id, name: p.name, phone: p.phone, file_no: p.file_no }); } }).catch(() => {});
    return () => { live = false; };
  }, [preId]);

  useEffect(() => {
    if (mode !== "existing" || patient) return;
    let live = true;
    const t = setTimeout(() => { searchPatients(q).then((r) => live && setHits(r)).catch(() => live && setHits([])); }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [q, mode, patient]);

  const svc = (services.data ?? []).find((s) => s.key === svcKey) ?? services.data?.[0] ?? null;
  useEffect(() => { if (svc && !svcKey) setSvcKey(svc.key); }, [svc, svcKey]);
  useEffect(() => { setRoom(svc?.room_id ?? ""); setTime(""); }, [svc?.key, svc?.room_id]);

  const busyQ = useQuery(["appointments", "busy", day, day], () => busyRanges(day), { enabled: /^\d{4}-\d{2}-\d{2}$/.test(day) });
  // candidate times: the chosen specialist's own hours, or the union of everyone's hours (default hours without a schedule)
  const slots = useMemo(() => {
    if (!svc || !hours.data || !busyQ.data || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return [];
    const rows = staffHours.data ?? [], wd = weekday(day);
    // without a chosen specialist: the hours of those who provide this service (fallback: everyone)
    const doers = prov.data ? Object.keys(prov.data.map).filter((id) => provides(prov.data, id, svc.key)) : [];
    const ids = doers.length ? doers : [...new Set([...(team.data ?? []).map((t) => t.id), ...rows.map((r) => r.staff_id)])];
    const wins = sp ? rangesOn(rows, sp, wd, hours.data) ?? [] : dayWindows(rows, ids, wd, hours.data);
    const all = wins.flatMap((w) => freeSlots({ ...hours.data!, days: [0, 1, 2, 3, 4, 5, 6], from: hm(w.from), to: hm(w.to) }, day, svc.minutes, busyQ.data!, room || null, sp || null));
    return [...new Set(all)].sort();
  }, [svc, hours.data, busyQ.data, day, room, sp, staffHours.data, team.data, prov.data]);
  const toM = (t: string) => { const [a, b] = t.split(":").map(Number); return a * 60 + (b || 0); };
  /** Does the chosen specialist work (her «أوقات الدوام», or the default hours without a schedule) for the whole visit at time t? */
  const onDuty = (t: string, d: string) => !sp || !svc || !hours.data || !/^\d{2}:\d{2}$/.test(t) || !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
    worksAt(staffHours.data ?? [], sp, weekday(d), toM(t), toM(t) + svc.minutes, hours.data);
  const offDuty = !onDuty(mode === "walkin" ? clock() : time, mode === "walkin" ? dayKey() : day);
  const spName = (team.data ?? []).find((t) => t.id === sp)?.name ?? "";
  // the chosen specialist does not provide this service («الخدمات التي تقدّمها») — warn, do not block
  const notProvider = !!sp && !!svc && !!prov.data && !provides(prov.data, sp, svc.key);
  const teamSorted = [...(team.data ?? [])].sort((a, b) => Number(!provides(prov.data, a.id, svc?.key)) - Number(!provides(prov.data, b.id, svc?.key)));

  async function submit() {
    setError("");
    if (!svc) { setError("اختاري الخدمة."); return; }
    const walk = mode === "walkin";
    const t = walk ? clock() : time;
    if (!walk && !/^\d{2}:\d{2}$/.test(t)) { setError("اختاري الوقت."); return; }
    if (mode === "existing" && !patient) { setError("ابحثي عن المراجِعة واختاريها."); return; }
    if (mode !== "existing" && !name.trim()) { setError("اكتبي اسم المراجِعة."); return; }
    if (notProvider && !confirm(`${spName} لا تقدّم خدمة «${svc.short_name}» حسب «الخدمات التي تقدّمها». الحجز رغم ذلك؟`)) return;
    if (offDuty && !confirm(`خارج دوام الأخصائية: ${spName} لا تداوم في هذا الوقت حسب «أوقات الدوام». الحجز رغم ذلك؟`)) return;
    setBusy(true);
    try {
      let pid = patient?.id ?? null;
      if (mode === "new") {
        const created = await createPatient(name, phone);
        pid = created?.id ?? null;
        // keep the new file selected so a retry after a booking error does not open a second file
        if (created) { setPatient(created); setMode("existing"); }
      }
      await book({
        service: svc.key, day: walk ? dayKey() : day, time: t, specialist: sp || null, room: room || null, patient: pid,
        walkInName: walk ? name : undefined, walkInPhone: walk ? phone : undefined,
        source: walk ? "walk_in" : "reception", checkIn: walk && checkIn,
      });
      onClose();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      setError(/patients_phone_key|duplicate key.*phone/.test(m) ? "يوجد ملف بهذا الرقم — ابحثي عنه في «لها ملف»." : bookingError(e));
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
          <Segment label="نوع الحجز" value={mode} onChange={(v) => { setMode(v); setError(""); }}
            options={[{ value: "existing", label: "لها ملف" }, { value: "new", label: "ملف جديد" }, { value: "walkin", label: "حضور مباشر" }]} />

          {mode === "existing" && (patient ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 18, padding: "10px 14px", background: C.tint2 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="users" size={18} /></span>
              <div style={{ flex: 1, lineHeight: 1.35 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{patient.name || "بدون اسم"}</div>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>ملف {patient.file_no}{patient.phone ? <> · <span className="latin" dir="ltr">{patient.phone}</span></> : null}</div>
              </div>
              <button type="button" onClick={() => setPatient(null)} style={{ border: "none", background: "none", color: C.accent, fontWeight: 700, fontSize: 13, minHeight: 36, padding: "0 8px" }}>تغيير</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <TextInput label="ابحثي بالاسم أو رقم الهاتف أو رقم الملف" value={q} onChange={setQ} placeholder="حرفان على الأقل" />
              {hits.map((h) => (
                <button key={h.id} type="button" onClick={() => setPatient(h)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderRadius: 14, padding: "9px 14px", border: "1px solid #EADCF0", background: C.white, fontSize: 14, textAlign: "right" }}>
                  <b>{h.name || "بدون اسم"}</b><span style={{ fontSize: 12.5, color: C.sub2 }}>ملف {h.file_no}{h.phone ? ` · ${h.phone}` : ""}</span>
                </button>
              ))}
              {q.trim().length >= 2 && hits.length === 0 && (
                <div style={{ fontSize: 13, color: C.sub2 }}>لا نتائج. <button type="button" onClick={() => { setMode("new"); setName(/\d/.test(q) ? "" : q); setPhone(/\d/.test(q) ? q : ""); }} style={{ border: "none", background: "none", color: C.accent, fontWeight: 700 }}>فتح ملف جديد</button></div>
              )}
            </div>
          ))}

          {mode !== "existing" && (
            <div className={css.grid2}>
              <TextInput label="اسم المراجِعة" required value={name} onChange={setName} />
              <TextInput label="رقم الهاتف" value={phone} onChange={setPhone} dir="ltr" placeholder="09…" hint={mode === "new" ? "يرتبط الملف بحسابها عند الدخول للتطبيق بهذا الرقم" : undefined} />
            </div>
          )}

          <div className={css.grid3}>
            <Select label="الخدمة" value={svc?.key ?? ""} onChange={(v) => setSvcKey(v)} options={(services.data ?? []).map((s) => ({ value: s.key, label: `${s.short_name} · ${s.minutes} د · ${priceLabel(s)}` }))} />
            <Select label="الأخصائية" value={sp} onChange={setSp} options={[{ value: "", label: "غير محدّدة" }, ...teamSorted.map((t) => ({ value: t.id, label: provides(prov.data, t.id, svc?.key) ? t.name : `${t.name} — لا تقدّم هذه الخدمة` }))]} />
            <Select label="الغرفة" value={room} onChange={setRoom} options={[{ value: "", label: "بدون غرفة" }, ...(rooms.data ?? []).map((r) => ({ value: r.id, label: r.name }))]} />
          </div>

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
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 132, overflowY: "auto" }}>
                  {slots.length === 0 ? <span style={{ fontSize: 13, color: C.sub2 }}>لا أوقات فارغة ضمن ساعات الدوام لهذا اليوم.</span>
                    : slots.map((t) => {
                      const off = !onDuty(t, day);
                      return <Chip key={t} height={34} selected={time === t} onClick={() => setTime(t)} style={off && time !== t ? { background: "#FFF9EF", border: "1.5px dashed #E8B86A", color: "#9A6A1E" } : undefined}><span className="latin" title={off ? "خارج دوام الأخصائية" : undefined}>{t}</span></Chip>;
                    })}
                </div>
              )}
            </div>
          )}
          {sp && slots.some((t) => !onDuty(t, day)) && mode !== "walkin" && (
            <div style={{ fontSize: 12.5, color: C.sub2 }}>الأوقات المنقّطة باللون الذهبي خارج دوام {spName}.</div>
          )}
          {notProvider && (
            <div role="alert" style={{ borderRadius: 16, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="alert" size={16} color="#8A5A12" />{spName} لا تقدّم هذه الخدمة حسب «الخدمات التي تقدّمها». يمكنكِ الحجز رغم ذلك بعد التأكيد.
            </div>
          )}
          {offDuty && (
            <div role="alert" style={{ borderRadius: 16, padding: "10px 14px", background: "#FCF1DE", color: "#8A5A12", fontSize: 13.5, fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="clock" size={16} color="#8A5A12" />خارج دوام الأخصائية — {spName} لا تداوم في هذا الوقت. يمكنكِ الحجز رغم ذلك بعد التأكيد.
            </div>
          )}
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      )}
    </Modal>
  );
}
