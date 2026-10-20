"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Stage } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { initials } from "@/lib/data";
import { listRooms, listServices, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { listToday, quickBook, searchPatients, type PatientHit } from "@/lib/db/queue";
import { dayWindows, listStaffHours, rangesOn } from "@/lib/db/staff";
import { DEFAULT_HOURS, getHours, provides, serviceProviders, weekday } from "@/lib/db/appointments";
import { useQuery } from "@/lib/db/query";
import { clock, dayKey } from "@/lib/format";
import { css } from "../css";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL } from "@/lib/tokens";
import { DatePill, KC, KioskNav, kioskError, useKiosk } from "../kiosk";

/** T_QuickBook.dc.html */
const fmt = (m: number) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const toMin = (hm: string) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const SEL = "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687";

/** Candidate start times on the timeline [D0, END] (minutes), every `step` minutes, plus the end of each booking. */
function slotsFor(b: [number, number][], dur: number, NOW: number, D0: number, END: number, step: number) {
  const set = new Set<number>();
  for (let t = Math.max(D0, Math.ceil((NOW + step) / step) * step); t <= END - step; t += step) set.add(t);
  b.forEach((x) => { if (x[1] > NOW && x[1] < END) set.add(x[1]); });
  return [...set].sort((x, y) => x - y).map((t) => {
    const taken = b.some((x) => t >= x[0] && t < x[1]);
    const nextStart = Math.min(...b.filter((x) => x[0] >= t).map((x) => x[0]), END);
    return { t, taken, fits: !taken && t + dur <= nextStart };
  });
}

/** Reception tablet: quick booking (today) for a patient at the desk. */
export default function Page() {
  const k = useKiosk();
  const router = useRouter();
  const q = useQuery(["queue", "quick-book"], async () => {
    const [services, specialists, rooms, today, hours, clinic, prov] = await Promise.all([listServices(), listSpecialists(), listRooms(), listToday(), listStaffHours().catch(() => []), getHours().catch(() => DEFAULT_HOURS), serviceProviders().catch(() => null)]);
    return { services, specialists, rooms, today, hours, clinic, prov };
  }, { enabled: !k.gate });
  const [st, setSt] = useState<{ svc: number; sp: number; slot: number | null }>({ svc: 0, sp: -1, slot: null });
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<PatientHit[] | null>(null);
  const [pat, setPat] = useState<PatientHit | null>(null);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (k.gate) return k.gate;
  const SV = q.data?.services ?? [];
  const SV0 = q.data?.services ?? [];
  // only the specialists who provide the chosen service («الخدمات التي تقدّمها»)
  const SP = (q.data?.specialists ?? []).filter((x) => provides(q.data?.prov, x.id, SV0[st.svc]?.key));
  const rooms = q.data?.rooms ?? [];
  const today = q.data?.today ?? [];
  const NOW_HM = clock();
  const NOW = toMin(NOW_HM);
  const s = SV[st.svc];
  const p = st.sp >= 0 ? SP[st.sp] : undefined;
  const busyList = today.filter((a) => a.status !== "no_show" && (s?.room_id ? a.room_id === s.room_id : p ? a.specialist_id === p.id : false));
  const B: [number, number][] = busyList.map((a) => { const m = toMin(clock(a.starts_at)); return [m, m + a.minutes]; });
  const WD = weekday(dayKey());
  // working windows today: the chosen specialist's «أوقات الدوام» (or the default hours without a schedule),
  // otherwise everyone's hours together. The timeline spans them (default 10:00–18:00 when nobody works).
  const HR = q.data?.hours ?? [];
  const clinic = q.data?.clinic ?? DEFAULT_HOURS;
  const wins = p ? rangesOn(HR, p.id, WD, clinic) ?? [] : dayWindows(HR, [...new Set([...SP.map((x) => x.id), ...HR.map((r) => r.staff_id)])], WD, clinic);
  const D0 = Math.floor(Math.min(600, ...wins.map((w) => w.from)) / 60) * 60;
  const END = Math.ceil(Math.max(wins.length ? 0 : 1080, ...wins.map((w) => w.to)) / 60) * 60;
  const DL = Math.max(60, END - D0);
  const pc = (m: number) => ((m - D0) / DL * 100).toFixed(2) + "%";
  const ticks = Array.from({ length: 5 }, (_, i) => fmt(Math.round((D0 + (DL * i) / 4) / 15) * 15));
  // outside working hours: still bookable by staff, but flagged
  const cs = (s ? slotsFor(B, s.minutes, NOW, D0, END, Math.max(5, clinic.slot || 15)) : [])
    .map((c) => ({ ...c, off: !wins.some((w) => w.from <= c.t && w.to >= c.t + s!.minutes) }));
  let slot = st.slot;
  if (slot === null || !cs.some((c) => c.t === slot && c.fits)) { const f = cs.find((c) => c.fits && !c.off) ?? cs.find((c) => c.fits); slot = f ? f.t : null; }
  const slotOff = slot !== null && !!cs.find((c) => c.t === slot)?.off;
  const cells = cs.map((c) => {
    const on = c.t === slot;
    let style = "height:54px;border-radius:18px;font-family:var(--font-rubik),sans-serif;font-size:16px;font-weight:500;display:flex;align-items:center;justify-content:center;";
    if (on) style += SEL + ";font-weight:700";
    else if (c.fits && c.off) style += "background:#FFF9EF;border:1.5px dashed #E8B86A;color:#9A6A1E";
    else if (c.fits) style += "background:#FFFFFF;border:1px solid #EADCF0;color:#35213D;box-shadow:0 4px 12px rgba(123,70,135,0.06)";
    else if (c.taken) style += "background:#F0EDF0;border:1px solid #F0EDF0;color:#B7ACB9;text-decoration:line-through";
    else style += "background:transparent;border:1.5px dashed #E0D2E3;color:#AF9EB3";
    return { label: fmt(c.t), style: css(style), aria: fmt(c.t) + (c.fits ? (c.off ? " — خارج دوام الأخصائية" : "") : " — غير متاح"), pick: () => { if (c.fits) setSt({ ...st, slot: c.t }); } };
  });
  const svcs = SV.map((x, i) => ({ name: x.name, pick: () => setSt({ ...st, svc: i, sp: -1, slot: null }),
    style: css("height:56px;padding:0 20px;border-radius:28px;font-size:16px;font-weight:600;font-family:inherit;display:flex;align-items:center;white-space:nowrap;" +
      (i === st.svc ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }));
  const sps = SP.map((x, i) => { const on = i === st.sp;
    return { x, pick: () => setSt({ ...st, sp: on ? -1 : i, slot: null }),
      style: css("flex:1 1 120px;min-width:0;border-radius:24px;padding:16px 8px 14px;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;" +
        (on ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#35213D;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }; });
  const roomName = s?.room_id ? rooms.find((r) => r.id === s.room_id)?.name ?? "" : "";
  const free = cs.filter((c) => c.fits).length;
  const blocks = B.map((b) => ({ style: css("position:absolute;top:0;bottom:0;right:" + pc(b[0]) + ";width:calc(" + ((b[1] - b[0]) / DL * 100).toFixed(2) + "% - 3px);border-radius:8px;background:" + (b[1] <= NOW ? "#E5DEE6" : "#D3C6D6")) }));
  const pickBlock = css(slot === null || !s ? "display:none" : "position:absolute;top:-5px;bottom:-5px;right:" + pc(slot) + ";width:" + (s.minutes / DL * 100).toFixed(2) + "%;border-radius:9px;background:linear-gradient(160deg,#DEB3E8,#A877B6);box-shadow:0 6px 14px rgba(150,100,170,0.40);border:2px solid #FFFFFF");
  const nowStyle = css("position:absolute;top:-10px;bottom:-10px;width:2px;border-radius:1px;background:#7B4687;right:" + pc(Math.min(END, Math.max(D0, NOW))));
  const tlRoom = roomName || p?.name || "المركز";
  const sum = { svc: s?.name ?? "اختاري خدمة", sp: p?.name ?? "أي أخصائية", room: roomName || "—", time: slot === null ? "لا وقت شاغر اليوم" : fmt(slot) + " – " + fmt(slot + (s?.minutes ?? 0)),
    price: s ? priceLabel(s) : "" };
  const freeTxt = free ? (free === 1 ? "وقت واحد يناسب مدة الخدمة" : free + " أوقات تناسب مدة الخدمة") : "لا يوجد وقت شاغر يناسب مدة الخدمة اليوم";
  const btn = busy ? "جارٍ الحجز…" : "تأكيد الحجز";
  const search = async () => {
    setErr(null); setPat(null);
    try { setHits(await searchPatients(term)); } catch (e) { setErr(kioskError(e)); }
  };
  const isPhone = term.replace(/\D/g, "").length >= 8;
  const canBook = !!s && slot !== null && (!!pat || (isPhone && !!newName.trim()));
  const book = async () => {
    if (!s || slot === null) return;
    if (slotOff && !confirm(p ? `خارج دوام الأخصائية: ${p.name} لا تداوم في هذا الوقت. تأكيد الحجز رغم ذلك؟` : "خارج أوقات الدوام: لا أحد من الفريق يداوم في هذا الوقت. تأكيد الحجز رغم ذلك؟")) return;
    setBusy(true); setErr(null);
    try {
      await quickBook({ name: pat ? pat.name : newName, phone: pat ? (pat.phone ?? "") : term, patientId: pat?.id, service: s, day: dayKey(), time: fmt(slot), specialistId: p?.id ?? null });
      router.push(R.T_Desk);
    } catch (e) { setErr(kioskError(e)); setBusy(false); }
  };
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>

      <KioskNav active={R.T_QuickBook} />
      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div className={KC.hdr} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div className={KC.title} style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>حجز سريع
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>موعد جديد لليوم — الأوقات محسوبة من جدول الغرف
            </div>
          </div>
          <DatePill />
        </div>
        <div className={KC.cols} style={{ display: "flex", gap: 18, flexGrow: 1, minHeight: "0" }}>
          <div style={{ width: 470, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>المراجعة
              </div>
              <label htmlFor="qp" style={{ height: 56, width: 430, maxWidth: "100%", borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", boxSizing: "border-box", position: "relative" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6" />
                </svg>
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>بحث
                </span>
                <input id="qp" type="search" value={term} onChange={(e) => { setTerm(e.target.value); setHits(null); setPat(null); }} onKeyDown={(e) => { if (e.key === "Enter") search(); }} placeholder="ابحثي بالاسم أو رقم الهاتف أو الملف" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 15, color: C.ink }} />
                <button type="button" onClick={search} disabled={!term.trim()} style={{ border: "none", background: "transparent", color: C.accent, fontWeight: 700, fontSize: 15, fontFamily: "inherit" }}>بحث</button>
              </label>
              {pat ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 22, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: C.accent }}>{initials(pat.name || "؟")}
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{pat.name || "بدون اسم"}
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>ملف {pat.file_no}{pat.phone ? ` · ${pat.phone}` : ""}
                  </div>
                </div>
                <button type="button" onClick={() => setPat(null)} aria-label="إلغاء اختيار المراجعة" title="تغيير" style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, border: "none", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              ) : hits && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 130, overflowY: "auto" }}>
                  {hits.map((h) => (
                    <button key={h.id} type="button" onClick={() => setPat(h)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderRadius: 16, border: "1px solid #EADCF0", background: C.white, fontFamily: "inherit", fontSize: 15, color: C.ink }}>
                      <b>{h.name || "بدون اسم"}</b><span className="latin" style={{ color: C.sub2 }}>{h.file_no}</span>
                    </button>
                  ))}
                  {hits.length === 0 && (isPhone
                    ? <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="لا يوجد ملف — اكتبي الاسم لفتح ملف جديد" style={{ height: 46, borderRadius: 23, border: "1.5px solid #E3CEE8", padding: "0 16px", fontSize: 15, fontFamily: "inherit", outline: "none" }} />
                    : <div style={{ fontSize: 14, color: C.sub }}>لا نتائج. لفتح ملف جديد اكتبي رقم الهاتف ثم ابحثي.</div>)}
                </div>
              )}
            </div>
            <div style={{ borderRadius: 30, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الخدمة
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {svcs.map((x, i) => (
                  <button key={i} type="button" aria-pressed={st.svc === i} onClick={x.pick} style={x.style}>{x.name}
                  </button>
                ))}
                {q.loading && <Loading />}
                {q.error && <ErrorNote>{q.error}</ErrorNote>}
                {!q.loading && !SV.length && <div style={{ fontSize: 14, color: C.sub }}>لا توجد خدمات مفعّلة بعد — أضيفيها من لوحة الإدارة.</div>}
              </div>
            </div>
            <div style={{ borderRadius: 30, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الأخصائية
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {sps.map(({ x, pick, style }, i) => (
                <button key={x.id} type="button" aria-pressed={st.sp === i} onClick={pick} style={style}>
                  {x.photo_url
                    ? <img src={x.photo_url} alt={x.name} style={{ width: 58, height: 58, borderRadius: 29, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", boxSizing: "border-box", flexShrink: 0 }} />
                    : <span style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>{initials(x.name)}</span>}
                  <span style={{ lineHeight: 1.3, minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.name}
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: C.sub2, whiteSpace: "nowrap", marginTop: 2 }}>{x.title}
                    </span>
                  </span>
                </button>
                ))}
                {!q.loading && !SP.length && <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{q.data?.specialists.length ? "لا أخصائية تقدّم هذه الخدمة حسب «الخدمات التي تقدّمها». يُحجز الموعد دون تحديد أخصائية." : "لا توجد أخصائيات مسجّلات بعد. يُحجز الموعد دون تحديد أخصائية."}</div>}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "20px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>الوقت · اليوم
                  </div>
                  <div style={{ fontSize: 13, color: C.sub2 }}>{freeTxt}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.sub2 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 6, boxSizing: "border-box", background: C.white, border: "1px solid #EADCF0" }} />متاح
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.sub2 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 6, boxSizing: "border-box", background: "#F0EDF0" }} />محجوز
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.sub2 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 6, boxSizing: "border-box", border: "1.5px dashed #E0D2E3" }} />وقت قصير
                  </span>
                  {!!p && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.sub2 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 6, boxSizing: "border-box", background: "#FFF9EF", border: "1.5px dashed #E8B86A" }} />خارج الدوام
                  </span>}
                </div>
              </div>
              <div className={`${KC.slots} ${KC.scroll}`} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridAutoRows: 54, gap: 10, flex: "1 1 0", minHeight: 0, overflowY: "auto", alignContent: "start", padding: 2 }}>
                {cells.map((c, cI) => (
                  <Fragment key={cI}>
                    <button type="button" onClick={c.pick} aria-label={c.aria} style={c.style}>{c.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              <div style={{ flexShrink: 0, borderRadius: 22, padding: "14px 16px 10px", background: "#F9F5FB", border: "1px solid #EDE2F1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.sub2, marginBottom: 14 }}>
                  <span>يوم {tlRoom}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent }} />الآن {NOW_HM}
                  </span>
                </div>
                <div style={{ position: "relative", height: 22 }}>
                  {blocks.map((b, bI) => (
                    <Fragment key={bI}>
                      <span style={b.style} />
                    </Fragment>
                  ))}
                  <span style={pickBlock} />
                  <span style={nowStyle} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 12, color: C.muted, marginTop: 8 }}>
                  {ticks.map((t, i) => <span key={i}>{t}</span>)}
                </div>
              </div>
            </div>
            {err && <ErrorNote>{err}</ErrorNote>}
            <div className={KC.stack} style={{ borderRadius: 30, padding: "16px 16px 16px 20px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 14 }}>
              <span className={KC.hideNarrow} style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.4 }}>
                <div style={{ fontSize: 17, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sum.svc} ·{" "}
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}>{sum.time}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sum.sp} · {sum.room} · {sum.price}
                </div>
                {slotOff && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: "#9A6A1E" }}>{p ? "خارج دوام الأخصائية" : "خارج أوقات الدوام"}</div>}
              </div>
              <button type="button" onClick={book} disabled={!canBook || busy} style={{ opacity: canBook && !busy ? 1 : 0.55, fontFamily: "inherit", height: 60, padding: "0 24px", borderRadius: 30, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>{btn}
              </button>
            </div>
          </div>
        </div>
      </div>

    </Stage>
  );
}

