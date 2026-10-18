"use client";

/** W_Reports.dc.html — التقارير. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, LOGO } from "@/lib/tokens";
import { css, fmt } from "@/app/admin/_h/css";

export default function Page() {
  // LOGIC
  return (
    <AdminShell
      active="التقارير"
      title="التقارير"
      subtitle="نظرة تحليلية على المواعيد والغياب والخدمات والرضا"
      actions={
        <>
          <button type="button" style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
            </svg>
            تصدير PDF
          </button>
          <button type="button" style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, border: "none", padding: "0 20px", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
            </svg>
            تصدير Excel
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>إيراد اليوم حتى الآن</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" />
              </svg>
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: "1.25", marginTop: 6 }}>17,500 ل.س</div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>من 58,000 ل.س متوقعة</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>مواعيد اليوم</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25", marginTop: 4, color: C.ink }}>26</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>7 انتهت · 3 في الجلسة</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>نسبة الغياب اليوم</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25", marginTop: 4, color: C.ink }}>12%</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>1 من 8 مواعيد حتى 12:30</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>متوسط التقييم</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25", marginTop: 4, color: C.ink }}>4.4</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>من 7 تقييمات اليوم</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {v.per.map((p, pI) => (
            <Fragment key={pI}>
              <button type="button" onClick={p.pick} style={css(p.style, "button")}>{p.name}</button>
            </Fragment>
          ))}
          <span style={{ marginInlineStart: "auto", fontSize: 12, color: C.sub2, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#866F8D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
            </svg>
            {"الرسوم الموسومة "}
            <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
            {" بيانات توضيحية حتى يتراكم سجل المركز الفعلي"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "16px 20px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1.45, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>المواعيد أسبوعياً</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>آخر 8 أسابيع · تبدأ الأسابيع يوم الإثنين</div>
                </div>
              </div>
              <span>
                <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
              </span>
            </div>
            <div style={{ marginTop: 14 }}>
              <svg width="100%" height="182" viewBox="0 0 560 182" preserveaspectratio="none" style={{ overflow: "visible" }}>
                <defs>
                  <lineargradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#C9A2D8" stopOpacity="0.55" />
                    <stop offset="1" stopColor="#C9A2D8" stopOpacity="0" />
                  </lineargradient>
                </defs>
                <line x1="0" x2="560" y1="117.5" y2="117.5" stroke="#EDE2F1" strokeWidth="1" />
                <text x="558" y="113.5" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">110</text>
                <line x1="0" x2="560" y1="85.0" y2="85.0" stroke="#EDE2F1" strokeWidth="1" />
                <text x="558" y="81.0" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">120</text>
                <line x1="0" x2="560" y1="52.5" y2="52.5" stroke="#EDE2F1" strokeWidth="1" />
                <text x="558" y="48.5" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">130</text>
                <line x1="0" x2="560" y1="20.0" y2="20.0" stroke="#EDE2F1" strokeWidth="1" />
                <text x="558" y="16.0" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">140</text>
                <path d="M540.0,160 L540.0,111.0 L465.7,91.5 L391.4,81.8 L317.1,94.8 L242.9,65.5 L168.6,49.2 L94.3,59.0 L20.0,33.0 L20.0,160 Z" fill="url(#ag)" />
                <polyline points="540.0,111.0 465.7,91.5 391.4,81.8 317.1,94.8 242.9,65.5 168.6,49.2 94.3,59.0 20.0,33.0" fill="none" stroke="#7B4687" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="540.0" cy="111.0" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="465.7" cy="91.5" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="391.4" cy="81.8" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="317.1" cy="94.8" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="242.9" cy="65.5" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="168.6" cy="49.2" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="94.3" cy="59.0" r="3.5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2" />
                <circle cx="20.0" cy="33.0" r="5" fill="#FFFFFF" stroke="#7B4687" strokeWidth="2.5" />
                <text x="540.0" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">17/8</text>
                <text x="465.7" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">24/8</text>
                <text x="391.4" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">31/8</text>
                <text x="317.1" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">7/9</text>
                <text x="242.9" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">14/9</text>
                <text x="168.6" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">21/9</text>
                <text x="94.3" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">28/9</text>
                <text x="20.0" y="176" font-size="10.5" fill="#866F8D" text-anchor="middle" font-family="El Messiri">5/10</text>
                <g transform="translate(20.0,17.0)">
                  <rect x="-22" y="-20" width="44" height="22" rx="11" fill="#7B4687" />
                  <text x="0" y="-5" font-size="12" fill="#FFFFFF" text-anchor="middle" font-family="Rubik" font-weight="700">136</text>
                </g>
              </svg>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM15 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>توزيع الخدمات</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>مواعيد اليوم 26</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#7B4687" strokeWidth="22" strokeDasharray="115.4 339.3" strokeDashoffset="0.0" transform="rotate(-90 70 70)" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#7B4687" strokeWidth="22" strokeDasharray="89.3 339.3" strokeDashoffset="-117.4" transform="rotate(-90 70 70)" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#C997D4" strokeWidth="22" strokeDasharray="50.2 339.3" strokeDashoffset="-208.8" transform="rotate(-90 70 70)" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#E3C4EA" strokeWidth="22" strokeDasharray="50.2 339.3" strokeDashoffset="-261.0" transform="rotate(-90 70 70)" />
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#E3D5E6" strokeWidth="22" strokeDasharray="24.1 339.3" strokeDashoffset="-313.2" transform="rotate(-90 70 70)" />
                </svg>
                <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: "1.1" }}>
                  <span style={{ fontSize: 26, fontWeight: 700 }}>26</span>
                  <span style={{ fontSize: 11, color: C.sub2 }}>موعداً</span>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>جلسة ليزر</span>
                  <span style={{ fontWeight: 700 }}>9</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accent }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>تنظيف عميق للبشرة</span>
                  <span style={{ fontWeight: 700 }}>7</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#C997D4" }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>هيدرافيشل</span>
                  <span style={{ fontWeight: 700 }}>4</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#E3C4EA" }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>تقشير البشرة</span>
                  <span style={{ fontWeight: 700 }}>4</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: "#E3D5E6" }} />
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>استشارة في المركز</span>
                  <span style={{ fontWeight: 700 }}>2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>جديدات مقابل عائدات</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>أسبوعياً</div>
                </div>
              </div>
              <span>
                <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.sub, marginTop: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#C9A2D8" }} />
                جديدات
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accent }} />
                عائدات
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 15, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 79, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>17/8</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 18, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 81, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>24/8</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 15, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 87, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>31/8</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 17, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 81, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>7/9</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 21, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 85, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>14/9</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 19, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 91, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>21/9</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 16, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 91, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>28/9</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ height: 120, width: 22, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ height: 21, borderRadius: "7px 7px 0 0", background: "linear-gradient(180deg,#E8CFEE,#C9A2D8)" }} />
                  <div style={{ height: 93, marginTop: 2, borderRadius: "0 0 7px 7px", background: "linear-gradient(180deg,#7B4687,#7B4687)" }} />
                </div>
                <span style={{ fontSize: 10.5, color: C.sub2, whiteSpace: "nowrap" }}>5/10</span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>رضا المراجعات</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>متوسط التقييم أسبوعياً</div>
                </div>
              </div>
              <span>
                <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: C.accent, lineHeight: "1" }}>4.4</span>
              <span style={{ display: "inline-flex", gap: 1 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#DFCFE2" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
              </span>
              <span style={{ fontSize: 11.5, color: C.sub2, marginInlineStart: "auto" }}>هذا الأسبوع حتى الآن</span>
            </div>
            <svg width="100%" height="150" viewBox="0 0 300 150" preserveaspectratio="none" style={{ marginTop: 6 }}>
              <line x1="0" x2="274" y1="136.0" y2="136.0" stroke="#EDE2F1" />
              <text direction="ltr" x="300" y="140.0" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">4.0</text>
              <line x1="0" x2="274" y1="75.0" y2="75.0" stroke="#EDE2F1" />
              <text direction="ltr" x="300" y="79.0" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">4.5</text>
              <line x1="0" x2="274" y1="14.0" y2="14.0" stroke="#EDE2F1" />
              <text direction="ltr" x="300" y="18.0" font-size="10" fill="#A595AC" text-anchor="end" font-family="Rubik">5.0</text>
              <polyline points="262.0,75.0 225.7,62.8 189.4,87.2 153.1,62.8 116.9,75.0 80.6,50.6 44.3,62.8 8.0,87.2" fill="none" stroke="#A877B6" strokeWidth="2.4" strokeLinejoin="round" />
              <circle cx="262.0" cy="75.0" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="225.7" cy="62.8" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="189.4" cy="87.2" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="153.1" cy="62.8" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="116.9" cy="75.0" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="80.6" cy="50.6" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="44.3" cy="62.8" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
              <circle cx="8.0" cy="87.2" r="3.5" fill="#FFFFFF" stroke="#A877B6" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* SCRIPT
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"p": 1}; }

  tg(on) {
    return 'width:52px;height:30px;border-radius:15px;padding:3px;box-sizing:border-box;border:none;flex-shrink:0;display:flex;justify-content:' + (on ? 'flex-end' : 'flex-start') +
      ';background:' + (on ? 'linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)' : '#E6DDE8');
  }
  ch(on, h) {
    h = h || 36;
    return 'height:' + h + 'px;padding:0 14px;border-radius:' + (h / 2) + 'px;font-family:inherit;font-size:13px;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid ' + (on ? '#FFFFFF' : '#EADCF0') +
      ';background:' + (on ? 'linear-gradient(160deg,#F1E3F6,#D9BCE5)' : '#FFFFFF') + ';color:' + (on ? '#7B4687' : '#866F8D') +
      ';box-shadow:' + (on ? '0 6px 14px rgba(150,100,170,0.25)' : '0 3px 10px rgba(123,70,135,0.05)');
  }
  fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }


  renderVals() {
    const s = this.state; const v = { accent: this.props.accent ?? '#7B4687' };

    v.per = ['اليوم', 'آخر 8 أسابيع', 'هذا الشهر', 'فترة مخصصة'].map((name, i) => ({ name, style: this.ch(s.p === i, 34), pick: () => this.setState({ p: i }) }));

    return v;
  }
}

*/

