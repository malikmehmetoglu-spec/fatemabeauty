"use client";

/** W_Roles.dc.html — الأدوار والصلاحيات. */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { css } from "@/app/admin/_h/css";
import { ROLE_MATRIX } from "@/lib/mock/h";

export default function Page() {
  const [mat, setMat] = useState(ROLE_MATRIX);
  const PF = "M5 12l5 5L20 7", PL = "M5 12h14", PX = "M18 6L6 18M6 6l12 12";
  const v = {
    m: mat.map((row, pi) => row.map((val, ci) => ({
      val,
      st: "width:28px;height:28px;border-radius:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;" +
        (val === 2 ? "border:none;background:linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 5px 10px rgba(123,70,135,0.28)" : val === 1 ? "border:1px solid #DEC6E8;background:#F3EAF6" : "border:none;background:#F4F1F5"),
      col: val === 2 ? "#FFFFFF" : val === 1 ? C.accentMid : "#C3B6C6",
      p: val === 2 ? PF : val === 1 ? PL : PX,
      c: () => { const m = mat.map((r) => r.slice()); m[pi][ci] = (m[pi][ci] + 2) % 3; setMat(m); },
    }))),
  };
  return (
    <AdminShell
      active="الإعدادات"
      title="الأدوار والصلاحيات"
      subtitle="اضغطي على أي خانة للتبديل بين كاملة · محدودة · لا صلاحية"
      actions={
        <>
          <Link href={R.W_Audit} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
            سجل التدقيق
          </Link>
          <button type="button" style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, border: "none", padding: "0 20px", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            حفظ الصلاحيات
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12.5, color: C.sub }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            كاملة
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: C.tint, border: "1px solid #DEC6E8", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "content-box" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
              </svg>
            </span>
            محدودة (ما يخصها فقط)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: 11, background: "#F4F1F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C3B6C6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
            لا صلاحية
          </span>
          <span style={{ marginInlineStart: "auto", fontStyle: "normal", color: C.accent, fontWeight: 700 }}>«كل موظفة ترى ما تحتاجه لعملها، ولا شيء أكثر»</span>
        </div>
        <div style={{ borderRadius: 26, padding: "14px 22px 12px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "0 0 8px" }}>
            <div style={{ flex: 2.4, fontSize: 12, color: C.sub2, fontWeight: 600 }}>الصلاحية</div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>المديرة العامة</div>
              <div style={{ fontSize: 11, color: C.onDark, marginTop: 6, height: 26, lineHeight: "26px" }}>لم تُسند بعد</div>
              <div style={{ fontSize: 10.5, marginTop: 3, visibility: "hidden" }}>-</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>مديرة التشغيل</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6, height: 26, lineHeight: "26px" }}>لم تُسند بعد</div>
              <div style={{ fontSize: 10.5, marginTop: 3, visibility: "hidden" }}>-</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>الأخصائية</div>
              <div style={{ display: "flex", justifyContent: "center", paddingInlineStart: 8, marginTop: 6, height: 26, boxSizing: "content-box" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 26, height: 26, borderRadius: 13, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0, marginInlineStart: -8 }} />
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, marginInlineStart: -8, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ر ا</span>
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, marginInlineStart: -8, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ه ا</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.sub2, marginTop: 3 }}>3 موظفات</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>المحاسبة</div>
              <div style={{ display: "flex", justifyContent: "center", paddingInlineStart: 8, marginTop: 6, height: 26, boxSizing: "content-box" }}>
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, marginInlineStart: -8, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>س ح</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.sub2, marginTop: 3 }}>1 موظفة</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>الاستقبال</div>
              <div style={{ display: "flex", justifyContent: "center", paddingInlineStart: 8, marginTop: 6, height: 26, boxSizing: "content-box" }}>
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, marginInlineStart: -8, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.accent, boxSizing: "content-box" }}>ل خ</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.sub2, marginTop: 3 }}>1 موظفة</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: "10px 8px", textAlign: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", boxSizing: "content-box" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>مسؤولة المخزون</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6, height: 26, lineHeight: "26px" }}>لم تُسند بعد</div>
              <div style={{ fontSize: 10.5, marginTop: 3, visibility: "hidden" }}>-</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22, marginTop: 0, fontSize: 11.5, fontWeight: 700, color: C.accentMid }}>
            المواعيد
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>الحجز والتعديل والإلغاء</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — المديرة العامة" onClick={v.m[0][0].c} style={css(v.m[0][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — مديرة التشغيل" onClick={v.m[0][1].c} style={css(v.m[0][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — الأخصائية" onClick={v.m[0][2].c} style={css(v.m[0][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — المحاسبة" onClick={v.m[0][3].c} style={css(v.m[0][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — الاستقبال" onClick={v.m[0][4].c} style={css(v.m[0][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الحجز والتعديل والإلغاء — مسؤولة المخزون" onClick={v.m[0][5].c} style={css(v.m[0][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[0][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[0][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>إدارة الطابور والنداء</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — المديرة العامة" onClick={v.m[1][0].c} style={css(v.m[1][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — مديرة التشغيل" onClick={v.m[1][1].c} style={css(v.m[1][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — الأخصائية" onClick={v.m[1][2].c} style={css(v.m[1][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — المحاسبة" onClick={v.m[1][3].c} style={css(v.m[1][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — الاستقبال" onClick={v.m[1][4].c} style={css(v.m[1][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إدارة الطابور والنداء — مسؤولة المخزون" onClick={v.m[1][5].c} style={css(v.m[1][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[1][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[1][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22, marginTop: 2, fontSize: 11.5, fontWeight: 700, color: C.accentMid }}>
            المراجعات
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>البيانات التعريفية</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — المديرة العامة" onClick={v.m[2][0].c} style={css(v.m[2][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — مديرة التشغيل" onClick={v.m[2][1].c} style={css(v.m[2][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — الأخصائية" onClick={v.m[2][2].c} style={css(v.m[2][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — المحاسبة" onClick={v.m[2][3].c} style={css(v.m[2][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — الاستقبال" onClick={v.m[2][4].c} style={css(v.m[2][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="البيانات التعريفية — مسؤولة المخزون" onClick={v.m[2][5].c} style={css(v.m[2][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[2][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[2][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>الملف الطبي والصور والملاحظات</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — المديرة العامة" onClick={v.m[3][0].c} style={css(v.m[3][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — مديرة التشغيل" onClick={v.m[3][1].c} style={css(v.m[3][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — الأخصائية" onClick={v.m[3][2].c} style={css(v.m[3][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — المحاسبة" onClick={v.m[3][3].c} style={css(v.m[3][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — الاستقبال" onClick={v.m[3][4].c} style={css(v.m[3][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الملف الطبي والصور والملاحظات — مسؤولة المخزون" onClick={v.m[3][5].c} style={css(v.m[3][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[3][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[3][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>إنشاء الوصفات وتوقيعها</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — المديرة العامة" onClick={v.m[4][0].c} style={css(v.m[4][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — مديرة التشغيل" onClick={v.m[4][1].c} style={css(v.m[4][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — الأخصائية" onClick={v.m[4][2].c} style={css(v.m[4][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — المحاسبة" onClick={v.m[4][3].c} style={css(v.m[4][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — الاستقبال" onClick={v.m[4][4].c} style={css(v.m[4][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إنشاء الوصفات وتوقيعها — مسؤولة المخزون" onClick={v.m[4][5].c} style={css(v.m[4][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[4][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[4][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22, marginTop: 2, fontSize: 11.5, fontWeight: 700, color: C.accentMid }}>
            المالية
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>القبض وإصدار الفواتير</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — المديرة العامة" onClick={v.m[5][0].c} style={css(v.m[5][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — مديرة التشغيل" onClick={v.m[5][1].c} style={css(v.m[5][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — الأخصائية" onClick={v.m[5][2].c} style={css(v.m[5][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — المحاسبة" onClick={v.m[5][3].c} style={css(v.m[5][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — الاستقبال" onClick={v.m[5][4].c} style={css(v.m[5][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="القبض وإصدار الفواتير — مسؤولة المخزون" onClick={v.m[5][5].c} style={css(v.m[5][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[5][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[5][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>الخصم الاستثنائي والاسترداد</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — المديرة العامة" onClick={v.m[6][0].c} style={css(v.m[6][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — مديرة التشغيل" onClick={v.m[6][1].c} style={css(v.m[6][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — الأخصائية" onClick={v.m[6][2].c} style={css(v.m[6][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — المحاسبة" onClick={v.m[6][3].c} style={css(v.m[6][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — الاستقبال" onClick={v.m[6][4].c} style={css(v.m[6][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخصم الاستثنائي والاسترداد — مسؤولة المخزون" onClick={v.m[6][5].c} style={css(v.m[6][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[6][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[6][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>المصاريف والسندات</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — المديرة العامة" onClick={v.m[7][0].c} style={css(v.m[7][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — مديرة التشغيل" onClick={v.m[7][1].c} style={css(v.m[7][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — الأخصائية" onClick={v.m[7][2].c} style={css(v.m[7][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — المحاسبة" onClick={v.m[7][3].c} style={css(v.m[7][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — الاستقبال" onClick={v.m[7][4].c} style={css(v.m[7][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المصاريف والسندات — مسؤولة المخزون" onClick={v.m[7][5].c} style={css(v.m[7][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[7][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[7][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>الربحية والرواتب</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — المديرة العامة" onClick={v.m[8][0].c} style={css(v.m[8][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — مديرة التشغيل" onClick={v.m[8][1].c} style={css(v.m[8][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — الأخصائية" onClick={v.m[8][2].c} style={css(v.m[8][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — المحاسبة" onClick={v.m[8][3].c} style={css(v.m[8][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — الاستقبال" onClick={v.m[8][4].c} style={css(v.m[8][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الربحية والرواتب — مسؤولة المخزون" onClick={v.m[8][5].c} style={css(v.m[8][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[8][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[8][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22, marginTop: 2, fontSize: 11.5, fontWeight: 700, color: C.accentMid }}>
            التشغيل
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>المخزون والمشتريات والموردون</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — المديرة العامة" onClick={v.m[9][0].c} style={css(v.m[9][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — مديرة التشغيل" onClick={v.m[9][1].c} style={css(v.m[9][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — الأخصائية" onClick={v.m[9][2].c} style={css(v.m[9][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — المحاسبة" onClick={v.m[9][3].c} style={css(v.m[9][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — الاستقبال" onClick={v.m[9][4].c} style={css(v.m[9][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="المخزون والمشتريات والموردون — مسؤولة المخزون" onClick={v.m[9][5].c} style={css(v.m[9][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[9][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[9][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>إعدادات الأجهزة</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — المديرة العامة" onClick={v.m[10][0].c} style={css(v.m[10][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — مديرة التشغيل" onClick={v.m[10][1].c} style={css(v.m[10][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — الأخصائية" onClick={v.m[10][2].c} style={css(v.m[10][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — المحاسبة" onClick={v.m[10][3].c} style={css(v.m[10][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — الاستقبال" onClick={v.m[10][4].c} style={css(v.m[10][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="إعدادات الأجهزة — مسؤولة المخزون" onClick={v.m[10][5].c} style={css(v.m[10][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[10][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[10][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>التقارير ولوحة القيادة</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — المديرة العامة" onClick={v.m[11][0].c} style={css(v.m[11][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — مديرة التشغيل" onClick={v.m[11][1].c} style={css(v.m[11][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — الأخصائية" onClick={v.m[11][2].c} style={css(v.m[11][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — المحاسبة" onClick={v.m[11][3].c} style={css(v.m[11][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — الاستقبال" onClick={v.m[11][4].c} style={css(v.m[11][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="التقارير ولوحة القيادة — مسؤولة المخزون" onClick={v.m[11][5].c} style={css(v.m[11][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[11][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[11][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22, marginTop: 2, fontSize: 11.5, fontWeight: 700, color: C.accentMid }}>
            الإدارة
            <span style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>الخدمات والسياسات والإعدادات</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — المديرة العامة" onClick={v.m[12][0].c} style={css(v.m[12][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — مديرة التشغيل" onClick={v.m[12][1].c} style={css(v.m[12][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — الأخصائية" onClick={v.m[12][2].c} style={css(v.m[12][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — المحاسبة" onClick={v.m[12][3].c} style={css(v.m[12][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — الاستقبال" onClick={v.m[12][4].c} style={css(v.m[12][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="الخدمات والسياسات والإعدادات — مسؤولة المخزون" onClick={v.m[12][5].c} style={css(v.m[12][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[12][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[12][5].p} />
                </svg>
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 33 }}>
            <div style={{ flex: 2.4, fontSize: 13.5, fontWeight: 600 }}>سجل التدقيق</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — المديرة العامة" onClick={v.m[13][0].c} style={css(v.m[13][0].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][0].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][0].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — مديرة التشغيل" onClick={v.m[13][1].c} style={css(v.m[13][1].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][1].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][1].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — الأخصائية" onClick={v.m[13][2].c} style={css(v.m[13][2].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][2].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][2].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — المحاسبة" onClick={v.m[13][3].c} style={css(v.m[13][3].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][3].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][3].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — الاستقبال" onClick={v.m[13][4].c} style={css(v.m[13][4].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][4].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][4].p} />
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <button type="button" aria-label="سجل التدقيق — مسؤولة المخزون" onClick={v.m[13][5].c} style={css(v.m[13][5].st, "button")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={v.m[13][5].col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={v.m[13][5].p} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

