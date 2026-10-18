"use client";

/** W_Rooms.dc.html — الغرف والأجهزة. */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { APPOINTMENTS_TODAY, DEVICES, PERSONA, TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { css, tg } from "@/app/admin/_h/css";

export default function Page() {
  const [r, setR] = useState([true, true, true]);
  const [d, setD] = useState([true, true]);
  const v = {
    rm: [0, 1, 2].map((i) => {
      const on = r[i];
      return {
        on, tg: tg(on), toggle: () => { const a = r.slice(); a[i] = !a[i]; setR(a); },
        label: on ? "متاحة للحجز" : "مغلقة للحجز",
        bst: "height:26px;padding:0 11px;border-radius:13px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;" + (on ? "background:#E6F4EC;color:#2E7D50" : "background:#F3EAF6;color:#B03D6A"),
      };
    }),
    dv: [0, 1].map((i) => ({ on: d[i], tg: tg(d[i]), toggle: () => { const a = d.slice(); a[i] = !a[i]; setD(a); } })),
    avail: r.filter((x) => x).length, davail: d.filter((x) => x).length,
  };
  return (
    <AdminShell
      active="الإعدادات"
      title="الغرف والأجهزة"
      subtitle={`إسناد الخدمات والأجهزة لكل غرفة وإتاحتها للحجز · ${arDate(TODAY)}`}
      actions={
        <>
          <button type="button" style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, border: "none", padding: "0 20px", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            غرفة جديدة
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: C.sub2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 10, borderRadius: 3, background: "#E0CDE5" }} />
            انتهت
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 10, borderRadius: 3, background: "linear-gradient(90deg,#A877B6,#7B4687)" }} />
            في الجلسة
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 10, borderRadius: 3, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
            قادمة
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 10, borderRadius: 3, background: "repeating-linear-gradient(45deg,#EDDFF0,#EDDFF0 3px,#FFFFFF 3px,#FFFFFF 6px)" }} />
            لم تحضر
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 2, height: 14, background: C.danger }} />
            الآن 12:30
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
            <div style={{ position: "absolute", top: -70, left: -60, width: 200, height: 200, borderRadius: 100, background: "radial-gradient(circle, rgba(190,150,215,0.25) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <div style={{ flex: 1, lineHeight: "1.3" }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>غرفة 1</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>8 جلسات اليوم · إشغال 97%</div>
                <span style={{ display: "inline-block", marginTop: 4, ...css(v.rm[0].bst) }}>{v.rm[0].label}</span>
              </div>
              <button type="button" aria-label="إتاحة غرفة 1" role="switch" aria-checked={v.rm[0].on} onClick={v.rm[0].toggle} style={css(v.rm[0].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الآن</div>
              <div style={{ borderRadius: 20, padding: "12px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ج ا</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: "1.4" }}>
                  <div style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>جود الحلبي</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق للبشرة · فاطمة طيبة</div>
                </div>
                <div style={{ textAlign: "left", lineHeight: "1.3" }}>
                  <div style={{ fontSize: 11, color: C.sub2 }}>حتى</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: "Rubik, sans-serif" }}>13:00</div>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>جدول اليوم</div>
              <div>
                <div style={{ position: "relative", height: 26, borderRadius: 9, background: "#F5EFF7" }}>
                  <span title="10:00" style={{ position: "absolute", top: "0", bottom: "0", right: "0.00%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="11:00" style={{ position: "absolute", top: "0", bottom: "0", right: "12.50%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="12:00" style={{ position: "absolute", top: "0", bottom: "0", right: "25.00%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#A877B6,#7B4687)" }} />
                  <span title="13:00" style={{ position: "absolute", top: "0", bottom: "0", right: "37.50%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="14:00" style={{ position: "absolute", top: "0", bottom: "0", right: "50.00%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="15:00" style={{ position: "absolute", top: "0", bottom: "0", right: "62.50%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="16:00" style={{ position: "absolute", top: "0", bottom: "0", right: "75.00%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="17:00" style={{ position: "absolute", top: "0", bottom: "0", right: "87.50%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span style={{ position: "absolute", top: -4, bottom: -4, right: "31.25%", width: 2, background: C.danger, borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, marginTop: 4, fontFamily: "Rubik, sans-serif" }}>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الخدمات المُسندة اليوم</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>تنظيف عميق للبشرة</span>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>هيدرافيشل</span>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>تقشير البشرة</span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 2 }}>القادمات</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>13:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>{PERSONA.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>14:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>غنى صباغ</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>15:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>نغم إبراهيم</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تقشير البشرة</span>
              </div>
            </div>
            <div style={{ position: "relative", marginTop: "auto" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الأجهزة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.tint, fontSize: 12, fontWeight: 700, color: C.accent, display: "inline-flex", alignItems: "center", gap: 6, boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" />
                  </svg>
                  جهاز الهيدرافيشل
                </span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
            <div style={{ position: "absolute", top: -70, left: -60, width: 200, height: 200, borderRadius: 100, background: "radial-gradient(circle, rgba(190,150,215,0.25) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <div style={{ flex: 1, lineHeight: "1.3" }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>غرفة 2</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>9 جلسات اليوم · إشغال 82%</div>
                <span style={{ display: "inline-block", marginTop: 4, ...css(v.rm[1].bst) }}>{v.rm[1].label}</span>
              </div>
              <button type="button" aria-label="إتاحة غرفة 2" role="switch" aria-checked={v.rm[1].on} onClick={v.rm[1].toggle} style={css(v.rm[1].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الآن</div>
              <div style={{ borderRadius: 20, padding: "12px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ل ع</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: "1.4" }}>
                  <div style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>لين عبود</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>
                    تقشير البشرة · هبة العلي
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                </div>
                <div style={{ textAlign: "left", lineHeight: "1.3" }}>
                  <div style={{ fontSize: 11, color: C.sub2 }}>حتى</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: "Rubik, sans-serif" }}>13:15</div>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>جدول اليوم</div>
              <div>
                <div style={{ position: "relative", height: 26, borderRadius: 9, background: "#F5EFF7" }}>
                  <span title="10:15" style={{ position: "absolute", top: "0", bottom: "0", right: "3.12%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="11:00" style={{ position: "absolute", top: "0", bottom: "0", right: "12.50%", width: "calc(4.17% - 2px)", borderRadius: 6, background: "repeating-linear-gradient(45deg,#EDDFF0,#EDDFF0 3px,#FFFFFF 3px,#FFFFFF 6px)" }} />
                  <span title="11:30" style={{ position: "absolute", top: "0", bottom: "0", right: "18.75%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="12:30" style={{ position: "absolute", top: "0", bottom: "0", right: "31.25%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#A877B6,#7B4687)" }} />
                  <span title="13:15" style={{ position: "absolute", top: "0", bottom: "0", right: "40.62%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="14:15" style={{ position: "absolute", top: "0", bottom: "0", right: "53.12%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="15:30" style={{ position: "absolute", top: "0", bottom: "0", right: "68.75%", width: "calc(12.50% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="16:30" style={{ position: "absolute", top: "0", bottom: "0", right: "81.25%", width: "calc(4.17% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="17:15" style={{ position: "absolute", top: "0", bottom: "0", right: "90.62%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span style={{ position: "absolute", top: -4, bottom: -4, right: "31.25%", width: 2, background: C.danger, borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, marginTop: 4, fontFamily: "Rubik, sans-serif" }}>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الخدمات المُسندة اليوم</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>تقشير البشرة</span>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>استشارة في المركز</span>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>تنظيف عميق للبشرة</span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 2 }}>القادمات</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>13:15</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>يارا حمدان</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>14:15</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>آية الشامي</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>15:30</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>دانة عطار</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>تنظيف عميق</span>
              </div>
            </div>
            <div style={{ position: "relative", marginTop: "auto" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الأجهزة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 12.5, color: C.muted }}>لا يوجد جهاز مخصص</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
            <div style={{ position: "absolute", top: -70, left: -60, width: 200, height: 200, borderRadius: 100, background: "radial-gradient(circle, rgba(190,150,215,0.25) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                </svg>
              </span>
              <div style={{ flex: 1, lineHeight: "1.3" }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>غرفة 3</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>9 جلسات اليوم · إشغال 84%</div>
                <span style={{ display: "inline-block", marginTop: 4, ...css(v.rm[2].bst) }}>{v.rm[2].label}</span>
              </div>
              <button type="button" aria-label="إتاحة غرفة 3" role="switch" aria-checked={v.rm[2].on} onClick={v.rm[2].toggle} style={css(v.rm[2].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الآن</div>
              <div style={{ borderRadius: 20, padding: "12px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ت ن</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: "1.4" }}>
                  <div style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>تالا ناصر</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>
                    جلسة ليزر · ريم الحسن
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                </div>
                <div style={{ textAlign: "left", lineHeight: "1.3" }}>
                  <div style={{ fontSize: 11, color: C.sub2 }}>حتى</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: "Rubik, sans-serif" }}>13:00</div>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>جدول اليوم</div>
              <div>
                <div style={{ position: "relative", height: 26, borderRadius: 9, background: "#F5EFF7" }}>
                  <span title="10:00" style={{ position: "absolute", top: "0", bottom: "0", right: "0.00%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="10:45" style={{ position: "absolute", top: "0", bottom: "0", right: "9.38%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="11:30" style={{ position: "absolute", top: "0", bottom: "0", right: "18.75%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "#E0CDE5" }} />
                  <span title="12:15" style={{ position: "absolute", top: "0", bottom: "0", right: "28.12%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#A877B6,#7B4687)" }} />
                  <span title="13:00" style={{ position: "absolute", top: "0", bottom: "0", right: "37.50%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="14:00" style={{ position: "absolute", top: "0", bottom: "0", right: "50.00%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="15:00" style={{ position: "absolute", top: "0", bottom: "0", right: "62.50%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="16:00" style={{ position: "absolute", top: "0", bottom: "0", right: "75.00%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span title="17:00" style={{ position: "absolute", top: "0", bottom: "0", right: "87.50%", width: "calc(9.38% - 2px)", borderRadius: 6, background: "linear-gradient(90deg,#E8CFEE,#C9A2D8)" }} />
                  <span style={{ position: "absolute", top: -4, bottom: -4, right: "31.25%", width: 2, background: C.danger, borderRadius: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.muted, marginTop: 4, fontFamily: "Rubik, sans-serif" }}>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الخدمات المُسندة اليوم</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.white, border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: C.sub, display: "inline-flex", alignItems: "center", boxSizing: "content-box" }}>جلسة ليزر</span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 2 }}>القادمات</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>13:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>بتول درويش</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>جلسة ليزر</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>14:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>ماريا جرجس</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>جلسة ليزر</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 44, fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>15:00</span>
                <div style={{ flex: 1, minWidth: "0", whiteSpace: "nowrap", overflow: "hidden" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>سلاف موسى</span>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                </div>
                <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>جلسة ليزر</span>
              </div>
            </div>
            <div style={{ position: "relative", marginTop: "auto" }}>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الأجهزة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <span style={{ height: 28, padding: "0 11px", borderRadius: 14, background: C.tint, fontSize: 12, fontWeight: 700, color: C.accent, display: "inline-flex", alignItems: "center", gap: 6, boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" />
                  </svg>
                  جهاز الليزر
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <span style={{ position: "relative", width: 44, height: 44, borderRadius: 22, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
              </svg>
            </span>
            <div style={{ position: "relative", lineHeight: "1.35" }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>متاحة للحجز الآن</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{v.avail}{" غرف · "}{v.davail}{" أجهزة"}</div>
            </div>
            <Link href={R.W_Devices} style={{ position: "relative", marginInlineStart: "auto", fontSize: 12.5, fontWeight: 700, color: "#E8D6F0" }}>صيانة الأجهزة ‹</Link>
          </div>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" />
              </svg>
            </span>
            <div style={{ flex: 1, lineHeight: "1.4" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>جهاز الهيدرافيشل</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{DEVICES[0].room} · {APPOINTMENTS_TODAY.filter((a) => a.service === "hydra").length} جلسات اليوم</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>يعمل</span>
            <button type="button" aria-label="إتاحة جهاز الهيدرافيشل" role="switch" aria-checked={v.dv[0].on} onClick={v.dv[0].toggle} style={css(v.dv[0].tg)}>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
            </button>
          </div>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10h3V7L6.5 3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1-3 3l-6-6a6 6 0 0 1-8-8z" />
              </svg>
            </span>
            <div style={{ flex: 1, lineHeight: "1.4" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>جهاز الليزر</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>غرفة 3 · 9 جلسات اليوم</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>يعمل</span>
            <button type="button" aria-label="إتاحة جهاز الليزر" role="switch" aria-checked={v.dv[1].on} onClick={v.dv[1].toggle} style={css(v.dv[1].tg)}>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

