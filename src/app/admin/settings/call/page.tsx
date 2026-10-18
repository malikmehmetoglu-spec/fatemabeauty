"use client";

/** W_CallSettings.dc.html — إعدادات النداء والشاشة. */
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
      active="الإعدادات"
      title="إعدادات النداء والشاشة"
      subtitle="الصوت وطريقة النداء ومحتوى شاشة الصالة"
      actions={
        <>
        </>
      }
    >
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", flex: 1 }}>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>صوت النداء</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>يُشغَّل على شاشة الصالة</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>الصوت</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {v.voices.map((c, cI) => (
                      <Fragment key={cI}>
                        <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>اللغة والترتيب</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {v.langs.map((c, cI) => (
                      <Fragment key={cI}>
                        <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>عدد مرات التكرار</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" aria-label="إنقاص" onClick={v.dec} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "content-box" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, width: 24, textAlign: "center" }}>{v.rep}</span>
                    <button type="button" aria-label="زيادة" onClick={v.inc} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "content-box" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>نغمة التنبيه قبل النداء</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" aria-label="نغمة التنبيه" role="switch" onClick={v.tch} style={css(v.tgc)}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                    </button>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {v.chimes.map((c, cI) => (
                        <Fragment key={cI}>
                          <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>مستوى الصوت</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{v.vol}%</span>
                </div>
                <div style={{ position: "relative", height: 26, display: "flex", alignItems: "center", marginTop: 4 }}>
                  <div style={{ position: "absolute", inset: "9px 0", borderRadius: 4, background: "#ECE2EF" }} />
                  <div style={{ position: "absolute", top: 9, bottom: 9, right: "0", width: v.volw, borderRadius: 4, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }} />
                  <div style={{ position: "absolute", top: 1, right: v.volk, width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 3px 8px rgba(123,70,135,0.25)", border: "2px solid #C9A2D8" }} />
                  <input aria-label="مستوى الصوت" type="range" min="0" max="100" value={v.vol} onChange={v.setvol} style={{ position: "absolute", inset: "0", width: "100%", opacity: 0, cursor: "pointer", margin: "0", direction: "rtl" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>سرعة النطق</div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, boxSizing: "content-box" }}>هادئة</span>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>عادية</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>يُشغَّل على</div>
                  <div style={{ display: "flex", gap: 7 }}>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, boxSizing: "content-box" }}>شاشة الصالة</span>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>سماعة الاستقبال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>طريقة النداء</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>قرار معتمد للخصوصية</div>
                </div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>معتمد</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 18, padding: "10px 14px", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <div style={{ lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>النداء بالرقم فقط</div>
                  <div style={{ fontSize: 11.5, color: C.sub }}>«الرقم 11، غرفة 2»</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
                  </svg>
                  <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 18, padding: "10px 14px", background: "#F6F3F7", border: "1px dashed #E1D6E3", opacity: 0.8 }}>
                <div style={{ lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.sub }}>النداء بالاسم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>معطّل — لا يُذكر اسم المراجعة صوتاً أو على الشاشة</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
                  </svg>
                  <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-start", background: "#E6DDE8" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: C.sub, lineHeight: "1.6" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
                </svg>
                الأرقام 1–200 مسجّلة مسبقاً كملفات صوتية كاملة، فيعمل النداء بنطق عربي صحيح ودون إنترنت.
              </div>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>ما يظهر على شاشة الصالة</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  رقم الدور
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  الغرفة
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  الرقم التالي
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#F4F1F5", color: C.muted, textDecoration: "line-through", boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  اسم المراجعة
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#F4F1F5", color: C.muted, textDecoration: "line-through", boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  الخدمة
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", width: 470, flexShrink: 0 }}>
          <div style={{ width: 470, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ borderRadius: 22, padding: 8, background: "#281B2B", boxShadow: "0 22px 44px rgba(53,33,61,0.35)" }}>
              <div style={{ height: 254, borderRadius: 15, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>فاطمة بيوتي</span>
                  <span style={{ fontSize: 13, fontFamily: "Rubik, sans-serif", color: C.onDark }}>12:30</span>
                </div>
                <div style={{ position: "relative", display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, borderRadius: 16, padding: "10px 8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", textAlign: "center", lineHeight: "1.2" }}>
                    <div style={{ fontSize: 11, color: C.onDark }}>غرفة 1</div>
                    <div style={{ fontSize: 34, fontWeight: 700 }}>9</div>
                    <div style={{ fontSize: 10.5, color: C.onDark }}>التالي 12</div>
                  </div>
                  <div style={{ flex: 1, borderRadius: 16, padding: "10px 8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", textAlign: "center", lineHeight: "1.2" }}>
                    <div style={{ fontSize: 11, color: C.onDark }}>غرفة 2</div>
                    <div style={{ fontSize: 34, fontWeight: 700 }}>11</div>
                    <div style={{ fontSize: 10.5, color: C.onDark }}>التالي 14</div>
                  </div>
                  <div style={{ flex: 1, borderRadius: 16, padding: "10px 8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", textAlign: "center", lineHeight: "1.2" }}>
                    <div style={{ fontSize: 11, color: C.onDark }}>غرفة 3</div>
                    <div style={{ fontSize: 34, fontWeight: 700 }}>10</div>
                    <div style={{ fontSize: 10.5, color: C.onDark }}>التالي 13</div>
                  </div>
                </div>
                <div style={{ position: "relative", borderRadius: 14, padding: "9px 12px", background: "rgba(255,255,255,0.92)", color: C.accent, display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                  </svg>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{v.now}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span style={{ width: 90, height: 8, borderRadius: 4, background: "#D3C6D6" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={v.test} style={{ flex: 1, height: 48, borderRadius: 24, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxSizing: "content-box" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                </svg>
                تجربة النداء
              </button>
              <Link href={R.TV_Board} style={{ height: 48, padding: "0 18px", borderRadius: 24, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: C.accent, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, boxSizing: "content-box" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
                </svg>
                فتح الشاشة
              </Link>
            </div>
            <div style={css(v.annst)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
              </svg>
              <span>{v.ann}</span>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>محتوى الشاشة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>بين النداءات · اسحبي لإعادة الترتيب</div>
                </div>
              </div>
              <button type="button" style={{ height: 32, borderRadius: 16, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.tint, color: C.accent, border: "1px solid #EFE0F2" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                إضافة
              </button>
            </div>
            <div style={{ marginTop: 6 }}>
              {v.pl.map((p, pI) => (
                <Fragment key={pI}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
                    <span style={{ color: "#CABACE", fontSize: 16, letterSpacing: -2, width: 14 }}>⋮⋮</span>
                    <span style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={p.icon} />
                      </svg>
                    </span>
                    <div style={{ flex: 1, minWidth: "0", lineHeight: "1.35" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>{p.kind}{" · "}{p.dur}{" ثانية"}</div>
                    </div>
                    <button type="button" aria-label="تفعيل المحتوى" role="switch" onClick={p.t} style={css(p.tg)}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                    </button>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

/* SCRIPT
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"v": 0, "l": 0, "rep": 2, "chime": true, "cs": 0, "vol": 70, "pl": [true, true, true, true, false], "tested": false}; }

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

    const PL = [{"name": "عرض الخريف على جلسات الليزر", "kind": "عرض", "icon": "M17 17m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0M7 7m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0M6 18L18 6", "dur": 15}, {"name": "باقات 6 جلسات بسعر 5", "kind": "عرض", "icon": "M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5", "dur": 15}, {"name": "نصيحة: واقي الشمس يومياً حتى في الشتاء", "kind": "نصيحة", "icon": "M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0", "dur": 10}, {"name": "نصيحة: ترطيب البشرة بعد التقشير", "kind": "نصيحة", "icon": "M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z", "dur": 10}, {"name": "فيديو تعريفي بالمركز (بانتظار الرفع)", "kind": "فيديو", "icon": "M15 10l4.6-2.3A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.4.9L15 14zM3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "dur": 45}];
    v.voices = ['نسائي هادئ', 'رجالي'].map((name, i) => ({ name, style: this.ch(s.v === i, 34), pick: () => this.setState({ v: i }) }));
    v.langs = ['العربية ثم الإنجليزية', 'العربية فقط'].map((name, i) => ({ name, style: this.ch(s.l === i, 34), pick: () => this.setState({ l: i }) }));
    v.rep = s.rep; v.inc = () => this.setState({ rep: Math.min(3, s.rep + 1) }); v.dec = () => this.setState({ rep: Math.max(1, s.rep - 1) });
    v.tgc = this.tg(s.chime); v.tch = () => this.setState({ chime: !s.chime });
    v.chimes = ['ناعمة', 'جرس خفيف'].map((name, i) => ({ name, style: this.ch(s.chime && s.cs === i, 32) + (s.chime ? '' : ';opacity:0.5'), pick: () => this.setState({ cs: i }) }));
    v.vol = s.vol; v.volw = s.vol + '%'; v.volk = 'calc(' + s.vol + '% - ' + (s.vol * 0.24) + 'px)';
    v.setvol = (e) => this.setState({ vol: +e.target.value });
    v.pl = PL.map((p, i) => ({ ...p, tg: this.tg(s.pl[i]), t: () => { const a = s.pl.slice(); a[i] = !a[i]; this.setState({ pl: a }); } }));
    const first = PL.find((p, i) => s.pl[i]);
    v.now = first ? first.name : 'لا يوجد محتوى مفعّل';
    v.test = () => this.setState({ tested: true });
    const n = 11, room = 'غرفة 2', rn = room.replace('غرفة ', '');
    v.ann = (s.chime ? 'نغمة · ' : '') + 'الرقم ' + n + '، ' + room + (s.l === 0 ? ' — Number ' + n + ', Room ' + rn : '') + (s.rep > 1 ? ' (×' + s.rep + ')' : '');
    v.annst = 'display:flex;align-items:center;gap:8px;border-radius:16px;padding:10px 14px;font-size:13px;font-weight:600;color:#7B4687;background:#FFFFFF;border:1px solid #DEC6E8;' + (s.tested ? '' : 'opacity:0.55');

    return v;
  }
}

*/

