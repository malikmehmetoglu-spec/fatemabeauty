"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { C, SH, SHB, SH_SOFT, ICON_FILL } from "@/lib/tokens";

/** T_WalkIn.dc.html */
export default function Page() {
  // ROOT: width: 1194px; height: 834px; box-sizing: border-box; background: linear-gradient(170deg, #ECDDF2 0%, #F2E8F5 40%, #F9F5FB 100%); font-family: 'El Messiri', serif; color: #35213D; overflow: hidden; display: flex; flex-direction: column; padding: 36px 40px 32px; gap: 24px; position: relative; isolation: isolate
  return (
    <Stage width={1194} height={834} padding="" direction="row" gap={0}>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <Link href={R.T_Welcome} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        <div style={{ lineHeight: 1.3, flexGrow: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>حجز حضوري
          </div>
          <div style={{ fontSize: 16, color: C.sub2 }}>بدون موعد مسبق؟ اختاري جلستكِ وخذي رقماً
          </div>
        </div>
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
      <div style={{ display: "flex", gap: 26, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>اختاري الخدمة
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>الأوقات حسب جدول اليوم الفعلي
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "1fr 1fr", gap: 16, flexGrow: 1, minHeight: "0" }}>
            <button onClick={svcs[0].pick} aria-label="تنظيف عميق للبشرة" style={svcs[0].style}>
              <span style={svcs[0].checkStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" />
                </svg>
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>تنظيف عميق للبشرة
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                <b style={{ color: C.accent, fontSize: 18 }}>1,500 ل.س
                </b>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />60 دقيقة
              </span>
              <span style={{ marginTop: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>مكتمل اليوم
              </span>
            </button>
            <button onClick={svcs[1].pick} aria-label="هيدرافيشل" style={svcs[1].style}>
              <span style={svcs[1].checkStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                </svg>
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>هيدرافيشل
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                <b style={{ color: C.accent, fontSize: 18 }}>2,000 ل.س
                </b>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />60 دقيقة
              </span>
              <span style={{ marginTop: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>مكتمل اليوم
              </span>
            </button>
            <button onClick={svcs[2].pick} aria-label="تقشير البشرة" style={svcs[2].style}>
              <span style={svcs[2].checkStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4L4 8l8 4 8-4-8-4M4 12l8 4 8-4M4 16l8 4 8-4" />
                </svg>
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>تقشير البشرة
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                <b style={{ color: C.accent, fontSize: 18 }}>2,000 ل.س
                </b>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />45 دقيقة
              </span>
              <span style={{ marginTop: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>مكتمل اليوم
              </span>
            </button>
            <button onClick={svcs[3].pick} aria-label="جلسة ليزر" style={svcs[3].style}>
              <span style={svcs[3].checkStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
                </svg>
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>جلسة ليزر
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                <b style={{ color: C.accent, fontSize: 18 }}>من 3,500 ل.س
                </b>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />45 دقيقة
              </span>
              <span style={{ marginTop: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>مكتمل اليوم
              </span>
            </button>
            <button onClick={svcs[4].pick} aria-label="استشارة في المركز" style={svcs[4].style}>
              <span style={svcs[4].checkStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
                </svg>
              </span>
              <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>استشارة في المركز
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                <b style={{ color: C.accent, fontSize: 18 }}>مجانية
                </b>
                <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />20 دقيقة
              </span>
              <span style={{ marginTop: "auto" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>16:50 · غرفة 2
              </span>
            </button>
            <div style={{ borderRadius: 30, padding: 22, border: "1.5px dashed #DFCBE4", background: "rgba(255,255,255,0.45)", display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
              <span style={{ width: 50, height: 50, borderRadius: 25, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                </svg>
              </span>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الخدمة مكتملة؟
              </div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>اختاريها وانضمي لقائمة الانتظار، ونراسلكِ إن تفرّغ وقت اليوم.
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ borderRadius: 32, padding: 24, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                </svg>
              </span>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 14, color: C.sub2 }}>الخدمة المختارة
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{cur.name}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6, padding: "12px 16px", borderRadius: 18, background: "#F8F2FA" }}>{note}
            </div>
            {cur.ok && (<>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.sub }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>مع الأخصائية{" "}
                <b style={{ color: C.ink }}>{cur.spec}
                </b>
                <span style={{ display: "inline-flex", alignItems: "center", height: 19, padding: "0 7px", borderRadius: 9, fontSize: 11, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 6, verticalAlign: "middle", lineHeight: 1 }}>مثال
                </span>
              </div>
            </>)}
          </div>
          <div style={{ borderRadius: 32, padding: "22px 24px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <label htmlFor="wphone" style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>رقم هاتفكِ
            </label>
            <div dir="ltr" style={{ display: "flex", alignItems: "center", height: 62, background: C.white, border: "1.5px solid #E3CEE8", borderRadius: 31, padding: "0 10px 0 20px", boxShadow: "0 0 0 5px rgba(222,190,229,0.25)" }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: C.accent, paddingRight: 12, borderRight: "1px solid #E9DCEE", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>+963
              </span>
              <input id="wphone" type="tel" inputMode="tel" placeholder="9XX XXX XXX" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 20, padding: "0 12px", color: C.ink, fontFamily: "var(--font-rubik), Rubik, sans-serif", letterSpacing: 1 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14, color: C.sub }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3FA46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
              </svg>سنرسل رقم دوركِ على واتساب أيضاً
            </div>
          </div>
          <div style={{ borderRadius: 28, padding: "18px 22px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600 }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>رقم دور فوري على هذه الشاشة
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600 }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                </svg>
              </span>ننادي رقمكِ على شاشة الانتظار
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href={R.T_CheckedIn} style={{ height: 66, borderRadius: 33, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
              </svg>{btn}
            </Link>
            <div style={{ textAlign: "center", fontSize: 14, color: C.sub2 }}>الدفع في الاستقبال بعد الجلسة
            </div>
          </div>
        </div>
      </div>

    </Stage>
  );
}

/* SCRIPT
 data-props='{"accent":{"editor":"color","default":"#7B4687","options":["#7B4687","#5E3369","#8A5A99","#A0569E"]},"$preview":{"width":1194,"height":834}}'>
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { sel: 4 }; }
  renderVals() {
    const S = [{"key": "clean", "name": "تنظيف عميق للبشرة", "price": "1,500 ل.س", "minutes": "60 دقيقة", "ok": false, "slot": "مكتمل اليوم", "spec": ""}, {"key": "hydra", "name": "هيدرافيشل", "price": "2,000 ل.س", "minutes": "60 دقيقة", "ok": false, "slot": "مكتمل اليوم", "spec": ""}, {"key": "peel", "name": "تقشير البشرة", "price": "2,000 ل.س", "minutes": "45 دقيقة", "ok": false, "slot": "مكتمل اليوم", "spec": ""}, {"key": "laser", "name": "جلسة ليزر", "price": "من 3,500 ل.س", "minutes": "45 دقيقة", "ok": false, "slot": "مكتمل اليوم", "spec": ""}, {"key": "consult", "name": "استشارة في المركز", "price": "مجانية", "minutes": "20 دقيقة", "ok": true, "slot": "16:50 · غرفة 2", "spec": "هبة العلي"}];
    const icons = {};
    const svcs = S.map((s, i) => {
      const on = this.state.sel === i;
      return Object.assign({}, s, {
        pick: () => this.setState({ sel: i }),
        aria: s.name,
        style: 'border-radius:30px;padding:22px 22px 20px;text-align:right;font-family:inherit;display:flex;flex-direction:column;gap:10px;position:relative;box-sizing:border-box;' +
          (on ? 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 12px 26px rgba(150,100,170,0.30);color:#7B4687'
              : 'background:#FFFFFF;border:1px solid #F0E6F3;box-shadow:0 12px 30px rgba(123,70,135,0.10),0 2px 6px rgba(123,70,135,0.05);color:#35213D'),
        slotStyle: 'display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:17px;font-size:15px;font-weight:700;align-self:flex-start;' +
          (s.ok ? 'background:#E6F4EC;color:#2E7D50' : 'background:' + (on ? 'rgba(255,255,255,0.7)' : '#F0EDF0') + ';color:#695D6B'),
        checkStyle: 'position:absolute;top:18px;left:18px;width:30px;height:30px;border-radius:15px;display:flex;align-items:center;justify-content:center;' +
          (on ? 'background:linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 12px rgba(123,70,135,0.30)' : 'background:#FFFFFF;border:1.5px solid #E4D6E7;box-sizing:border-box'),
        on: on
      });
    });
    const cur = S[this.state.sel];
    return { accent: this.props.accent ?? '#7B4687', svcs, cur,
      btn: cur.ok ? 'احجزي وخذي رقماً' : 'أضيفيني لقائمة الانتظار',
      note: cur.ok ? ('أقرب وقت شاغر اليوم: ' + cur.slot) : 'لا يوجد وقت شاغر اليوم لهذه الخدمة — سنراسلكِ فور توفّر مكان.' };
  }
}

*/
