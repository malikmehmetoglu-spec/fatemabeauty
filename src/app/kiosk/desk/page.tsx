"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { C, SH, SHB, ICON_FILL, LOGO } from "@/lib/tokens";

/** T_Desk.dc.html */
export default function Page() {
  // ROOT: width: 1194px; height: 834px; box-sizing: border-box; background: linear-gradient(170deg, #ECDDF2 0%, #F2E8F5 40%, #F9F5FB 100%); font-family: 'El Messiri', serif; color: #35213D; overflow: hidden; display: flex; flex-direction: row; padding: 28px 28px 28px 32px; gap: 24px; position: relative; isolation: isolate
  return (
    <Stage width={1194} height={834} padding="" direction="row" gap={0}>

      <nav aria-label="وضع الاستقبال" style={{ width: 96, flexShrink: 0, borderRadius: 34, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: "22px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative" }}>
        <div style={{ display: "flex" }}>
          <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 44, width: "auto", display: "block" }} />
        </div>
        <div style={{ width: 44, height: 1, background: C.line }} />
        <Link href={R.T_Desk} aria-current="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.accent }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
            </svg>
          </span>الاستقبال
        </Link>
        <Link href={R.T_QuickBook} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.sub2 }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#957D9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>استقبال اليوم
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>لينا خوري
              <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
              </span>{" "}· الاستقبال
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label htmlFor="q" style={{ height: 56, width: 270, maxWidth: "100%", borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", boxSizing: "border-box", position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 10m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6" />
              </svg>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>بحث
              </span>
              <input id="q" type="search" value="" placeholder="ابحثي بالاسم أو رقم الدور" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 15, color: C.ink }} />
            </label>
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
        <div style={{ display: "flex", gap: 14 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>مواعيد اليوم
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16" />
              </svg>
            </div>
            <div style={{ position: "relative", fontSize: 36, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>26
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>7 انتهت حتى الآن
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>حضرن
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>12
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>من 13 حتى الآن
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>في الانتظار
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>2
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>في الصالة الآن
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>في الجلسة
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>3
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>الغرف الثلاث
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>لم تحضر
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>1
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>تحتاج إعادة حجز
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexGrow: 1, minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 32, padding: "18px 16px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px 10px" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>الدور الآن والقادمات
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ height: 40, padding: "0 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>الكل
                </span>
                <span style={{ height: 40, padding: "0 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>في الانتظار
                </span>
                <span style={{ height: 40, padding: "0 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>لم يؤكَّد
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: "1px solid transparent" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>12:30
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>11
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>لين عبود
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>تقشير البشرة · غرفة 2
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.accent, color: C.white }}>في الجلسة
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 14, color: C.sub2 }}>تنتهي 13:15
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, background: "linear-gradient(270deg, rgba(243,234,246,0.95) 0%, rgba(243,234,246,0) 100%)", borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>13:00
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>12
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>روان قاسم
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>هيدرافيشل · غرفة 1
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>في الانتظار
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={rows[1].call} style={rows[1].style}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                  </svg>{rows[1].label}
                </button>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, background: "linear-gradient(270deg, rgba(243,234,246,0.95) 0%, rgba(243,234,246,0) 100%)", borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>13:00
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>13
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>بتول درويش
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>جلسة ليزر · غرفة 3
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>في الانتظار
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={rows[2].call} style={rows[2].style}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                  </svg>{rows[2].label}
                </button>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>13:15
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>14
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>يارا حمدان
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>تنظيف عميق للبشرة · غرفة 2
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 14, color: C.muted }}>—
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>14:00
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>15
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>غنى صباغ
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>تنظيف عميق للبشرة · غرفة 1
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 14, color: C.muted }}>—
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>14:00
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>16
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>ماريا جرجس
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>جلسة ليزر · غرفة 3
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 14, color: C.muted }}>—
                </span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 62, padding: "0 12px", borderRadius: 20, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 50, fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 500, color: C.ink }}>14:15
              </span>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 17, fontWeight: 700, color: C.accent }}>17
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>آية الشامي
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>هيدرافيشل · غرفة 2
                </div>
              </div>
              <span style={{ width: 118 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>بانتظار التأكيد
                </span>
              </span>
              <span style={{ width: 124, display: "flex", justifyContent: "flex-end" }}>
                <button style={{ height: 48, padding: "0 18px", borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3FA46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
                  </svg>تذكير
                </button>
              </span>
            </div>
          </div>
          <div style={{ width: 330, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "18px 22px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6 }}>الغرف الآن
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 58 }}>غرفة 1
                  </span>
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: C.accent, width: 30 }}>9
                  </span>
                  <span style={{ fontSize: 13, color: C.sub2, flexGrow: 1, whiteSpace: "nowrap" }}>تنتهي 13:00
                  </span>
                  <span style={{ fontSize: 13, color: C.sub }}>التالي{" "}
                    <b style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, fontSize: 15 }}>12
                    </b>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "50%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 58 }}>غرفة 2
                  </span>
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: C.accent, width: 30 }}>11
                  </span>
                  <span style={{ fontSize: 13, color: C.sub2, flexGrow: 1, whiteSpace: "nowrap" }}>تنتهي 13:15
                  </span>
                  <span style={{ fontSize: 13, color: C.sub }}>التالي{" "}
                    <b style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, fontSize: 15 }}>14
                    </b>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "4%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 58 }}>غرفة 3
                  </span>
                  <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: C.accent, width: 30 }}>10
                  </span>
                  <span style={{ fontSize: 13, color: C.sub2, flexGrow: 1, whiteSpace: "nowrap" }}>تنتهي 13:00
                  </span>
                  <span style={{ fontSize: 13, color: C.sub }}>التالي{" "}
                    <b style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, fontSize: 15 }}>13
                    </b>
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "33%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 30, padding: "18px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>تنبيهات
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 22, background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8" }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: "nowrap" }}>هالة منصور
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>استشارة 11:00 · لم تحضر
                  </div>
                </div>
                <Link href={R.T_QuickBook} style={{ height: 48, padding: "0 14px", borderRadius: 24, background: C.white, boxShadow: SHB, fontSize: 14, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>إعادة حجز
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 22, background: "#FCF6EE", border: "1px solid #F5E6CF" }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>3 مواعيد بانتظار التأكيد
                  </div>
                  <div style={{ fontSize: 12.5, color: C.sub2, fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>14:15 · 16:00 · 17:00
                  </div>
                </div>
              </div>
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
  constructor(props) { super(props); this.state = { called: {} }; }
  renderVals() {
    const W = [false, true, true, false, false, false, false];
    const acc = this.props.accent ?? '#7B4687';
    const rows = W.map((w, i) => {
      const c = !!this.state.called[i];
      return { call: () => this.setState({ called: Object.assign({}, this.state.called, { [i]: !c }) }),
        label: c ? 'تم النداء' : 'استدعاء',
        style: 'height:48px;padding:0 18px;border-radius:24px;border:none;font-size:15px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:6px;' +
          (c ? 'background:#E6F4EC;color:#2E7D50' : 'background-color:' + acc + ';background-image:linear-gradient(145deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0) 45%,rgba(0,0,0,0.20) 100%);color:#FFFFFF;box-shadow:0 10px 22px rgba(123,70,135,0.28),inset 0 1px 0 rgba(255,255,255,0.25)') };
    });
    return { accent: acc, rows };
  }
}

*/
