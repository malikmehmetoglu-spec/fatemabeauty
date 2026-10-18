"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { APPOINTMENTS_TODAY, NOW as NOW_HM, SERVICES, toMinutes } from "@/lib/data";
import { money } from "@/lib/format";
import { css } from "../css";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL, LOGO, FATEMA_PHOTO } from "@/lib/tokens";

/** T_QuickBook.dc.html */
const fmt = (m: number) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const SV = SERVICES;
const SP = [
  { name: "فاطمة طيبة", room: "غرفة 1", can: ["clean", "hydra", "peel", "consult"] },
  { name: "هبة العلي", room: "غرفة 2", can: ["clean", "hydra", "peel", "consult"] },
  { name: "ريم الحسن", room: "غرفة 3", can: ["laser"] },
];
/** Booked [start, end) minutes per room, from today's schedule. */
const B: Record<string, [number, number][]> = Object.fromEntries(SP.map((p) => [p.room,
  APPOINTMENTS_TODAY.filter((a) => a.room === p.room && a.status !== "لم تحضر").map((a) => [toMinutes(a.time), toMinutes(a.time) + a.minutes] as [number, number])]));
const NOW = toMinutes(NOW_HM), END = 18 * 60, D0 = 600, DL = END - D0;
const pc = (m: number) => ((m - D0) / DL * 100).toFixed(2) + "%";
const SEL = "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687";

function slotsFor(sp: number, svc: number) {
  const b = B[SP[sp].room], dur = SV[svc].minutes;
  const set = new Set<number>();
  for (let t = NOW + 15; t <= END - 15; t += 15) set.add(t);
  b.forEach((x) => { if (x[1] > NOW && x[1] < END) set.add(x[1]); });
  return [...set].sort((x, y) => x - y).map((t) => {
    const taken = b.some((x) => t >= x[0] && t < x[1]);
    const nextStart = Math.min(...b.filter((x) => x[0] >= t).map((x) => x[0]), END);
    return { t, taken, fits: !taken && t + dur <= nextStart };
  });
}

/** Reception tablet: quick booking for a patient at the desk. */
export default function Page() {
  const [st, setSt] = useState<{ svc: number; sp: number; slot: number | null }>({ svc: 4, sp: 1, slot: null });
  const pickSvc = (i: number) => {
    let sp = st.sp;
    if (!SP[sp].can.includes(SV[i].key)) sp = SP.findIndex((x) => x.can.includes(SV[i].key));
    setSt({ svc: i, sp, slot: null });
  };
  const cs = slotsFor(st.sp, st.svc);
  let slot = st.slot;
  if (slot === null || !cs.some((c) => c.t === slot && c.fits)) { const f = cs.find((c) => c.fits); slot = f ? f.t : null; }
  const cells = cs.map((c) => {
    const on = c.t === slot;
    let style = "height:54px;border-radius:18px;font-family:Rubik,sans-serif;font-size:16px;font-weight:500;display:flex;align-items:center;justify-content:center;";
    if (on) style += SEL + ";font-weight:700";
    else if (c.fits) style += "background:#FFFFFF;border:1px solid #EADCF0;color:#35213D;box-shadow:0 4px 12px rgba(123,70,135,0.06)";
    else if (c.taken) style += "background:#F0EDF0;border:1px solid #F0EDF0;color:#B7ACB9;text-decoration:line-through";
    else style += "background:transparent;border:1.5px dashed #E0D2E3;color:#AF9EB3";
    return { label: fmt(c.t), style: css(style), aria: fmt(c.t) + (c.fits ? "" : " — غير متاح"), pick: () => { if (c.fits) setSt({ ...st, slot: c.t }); } };
  });
  const svcs = SV.map((_, i) => ({ pick: () => pickSvc(i),
    style: css("height:56px;padding:0 20px;border-radius:28px;font-size:16px;font-weight:600;font-family:inherit;display:flex;align-items:center;white-space:nowrap;" +
      (i === st.svc ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }));
  const sps = SP.map((p, i) => { const ok = p.can.includes(SV[st.svc].key), on = i === st.sp;
    return { pick: () => { if (ok) setSt({ ...st, sp: i, slot: null }); },
      style: css("flex:1;min-width:0;border-radius:24px;padding:16px 8px 14px;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;" + (ok ? "" : "opacity:0.4;") +
        (on ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#35213D;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }; });
  const s = SV[st.svc], p = SP[st.sp];
  const free = cs.filter((c) => c.fits).length;
  const blocks = B[p.room].map((b) => ({ style: css("position:absolute;top:0;bottom:0;right:" + pc(b[0]) + ";width:calc(" + ((b[1] - b[0]) / DL * 100).toFixed(2) + "% - 3px);border-radius:8px;background:" + (b[1] <= NOW ? "#E5DEE6" : "#D3C6D6")) }));
  const pickBlock = css(slot === null ? "display:none" : "position:absolute;top:-5px;bottom:-5px;right:" + pc(slot) + ";width:" + (s.minutes / DL * 100).toFixed(2) + "%;border-radius:9px;background:linear-gradient(160deg,#DEB3E8,#A877B6);box-shadow:0 6px 14px rgba(150,100,170,0.40);border:2px solid #FFFFFF");
  const nowStyle = css("position:absolute;top:-10px;bottom:-10px;width:2px;border-radius:1px;background:#7B4687;right:" + pc(NOW));
  const tlRoom = p.room;
  const sum = { svc: s.name, sp: p.name, room: p.room, time: slot === null ? "لا وقت شاغر اليوم" : fmt(slot) + " – " + fmt(slot + s.minutes),
    price: s.price === 0 ? "مجانية" : (s.from ? "من " : "") + money(s.price) };
  const freeTxt = free ? (free === 1 ? "وقت واحد يناسب مدة الخدمة" : free + " أوقات تناسب مدة الخدمة") : "لا يوجد وقت شاغر يناسب مدة الخدمة اليوم";
  const btn = slot === null ? "قائمة الانتظار" : "تأكيد الحجز";
  return (
    <Stage width={1194} height={834}  background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>

      <nav aria-label="وضع الاستقبال" style={{ width: 96, flexShrink: 0, borderRadius: 34, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: "22px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative" }}>
        <div style={{ display: "flex" }}>
          <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 44, width: "auto", display: "block" }} />
        </div>
        <div style={{ width: 44, height: 1, background: C.line }} />
        <Link href={R.T_Desk} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.sub2 }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#957D9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
            </svg>
          </span>الاستقبال
        </Link>
        <Link href={R.T_QuickBook} aria-current="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.accent }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
            </svg>
          </span>حجز سريع
        </Link>
        <Link href={R.T_Cashier} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.sub2 }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#957D9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" />
            </svg>
          </span>الكاشير
        </Link>
        <Link href={R.T_Welcome} style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.sub2, textAlign: "center", lineHeight: 1.3 }}>
          <span style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM11 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
            </svg>
          </span>وضع
          <br />المراجعات
        </Link>
      </nav>
      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>حجز سريع
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>موعد جديد لليوم — الأوقات محسوبة من جدول الغرف
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
              </svg>
              <span>الثلاثاء 13 تشرين الأول
              </span>
              <span style={{ width: 1, height: 20, background: C.border }} />
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}>12:30
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexGrow: 1, minHeight: "0" }}>
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
                <input id="qp" type="search" defaultValue="هالة" placeholder="ابحثي بالاسم أو رقم الهاتف أو الملف" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 15, color: C.ink }} />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 22, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: C.accent }}>ه م
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>هالة منصور
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>ملف 1035 · لم تحضر موعد 11:00 اليوم
                  </div>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              </div>
            </div>
            <div style={{ borderRadius: 30, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الخدمة
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <button type="button" aria-pressed={st.svc === 0} onClick={svcs[0].pick} style={svcs[0].style}>تنظيف عميق للبشرة
                </button>
                <button type="button" aria-pressed={st.svc === 1} onClick={svcs[1].pick} style={svcs[1].style}>هيدرافيشل
                </button>
                <button type="button" aria-pressed={st.svc === 2} onClick={svcs[2].pick} style={svcs[2].style}>تقشير البشرة
                </button>
                <button type="button" aria-pressed={st.svc === 3} onClick={svcs[3].pick} style={svcs[3].style}>جلسة ليزر
                </button>
                <button type="button" aria-pressed={st.svc === 4} onClick={svcs[4].pick} style={svcs[4].style}>استشارة في المركز
                </button>
              </div>
            </div>
            <div style={{ borderRadius: 30, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الأخصائية
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" aria-pressed={st.sp === 0} onClick={sps[0].pick} style={sps[0].style}>
                  <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 58, height: 58, borderRadius: 29, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", boxSizing: "border-box", flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.3, minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>فاطمة طيبة
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: C.sub2, whiteSpace: "nowrap", marginTop: 2 }}>غرفة 1
                    </span>
                  </span>
                </button>
                <button type="button" aria-pressed={st.sp === 1} onClick={sps[1].pick} style={sps[1].style}>
                  <span style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>ه ع
                  </span>
                  <span style={{ lineHeight: 1.3, minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>هبة العلي
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: C.sub2, whiteSpace: "nowrap", marginTop: 2 }}>غرفة 2
                      <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: 9, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 6, verticalAlign: "middle", lineHeight: 1 }}>مثال
                      </span>
                    </span>
                  </span>
                </button>
                <button type="button" aria-pressed={st.sp === 2} onClick={sps[2].pick} style={sps[2].style}>
                  <span style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>ر ح
                  </span>
                  <span style={{ lineHeight: 1.3, minWidth: "0" }}>
                    <span style={{ display: "block", fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>ريم الحسن
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: C.sub2, whiteSpace: "nowrap", marginTop: 2 }}>غرفة 3
                      <span style={{ display: "inline-flex", alignItems: "center", height: 18, padding: "0 7px", borderRadius: 9, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 6, verticalAlign: "middle", lineHeight: 1 }}>مثال
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "20px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {cells.map((c, cI) => (
                  <Fragment key={cI}>
                    <button type="button" onClick={c.pick} aria-label={c.aria} style={c.style}>{c.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              <div style={{ marginTop: "auto", borderRadius: 22, padding: "14px 16px 10px", background: "#F9F5FB", border: "1px solid #EDE2F1" }}>
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
                  <span>10:00
                  </span>
                  <span>12:00
                  </span>
                  <span>14:00
                  </span>
                  <span>16:00
                  </span>
                  <span>18:00
                  </span>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 30, padding: "16px 16px 16px 20px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.4 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>{sum.svc} ·{" "}
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}>{sum.time}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: C.sub, whiteSpace: "nowrap" }}>{sum.sp} · {sum.room} · {sum.price}
                </div>
              </div>
              <button type="button" style={{ height: 60, padding: "0 24px", borderRadius: 30, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
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

