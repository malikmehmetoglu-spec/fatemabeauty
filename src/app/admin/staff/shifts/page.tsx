"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { SN } from "@/lib/mock/g";

/** W_Shifts.dc.html — الورديات. */
export default function Page() {

  return (
    <AdminShell active="فريق العمل" title="الورديات" subtitle="أسبوع العمل من السبت إلى الخميس" actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Attendance}>
        <Icon name="calcheck" color="#7B4687" size={17} stroke={1.9} />
        الحضور
      </Link>
      <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
        <Icon name="send" color="#FFFFFF" size={17} stroke={1.9} />
        نشر الجدول
      </button>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                أسبوع 10 – 15 تشرين الأول 2026
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button aria-label="الأسبوع السابق" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="back" color="#7B4687" size={13} stroke={1.9} />
                </button>
                <button aria-label="الأسبوع التالي" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="fwd" color="#7B4687" size={13} stroke={1.9} />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170 }} />
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    السبت
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    10 تشرين الأول
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    الأحد
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    11 تشرين الأول
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    الإثنين
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    12 تشرين الأول
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: "#7B4687" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    الثلاثاء
                  </div>
                  <div style={{ fontSize: 12, color: "#7B4687" }}>
                    13 تشرين الأول
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    الأربعاء
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    14 تشرين الأول
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", borderRadius: 16, padding: "6px 0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    الخميس
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    15 تشرين الأول
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, display: "flex", alignItems: "center", gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {SN.fatema}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      أخصائية عناية بالبشرة
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", border: "1px solid #FFFFFF", boxShadow: "0 6px 14px rgba(150,100,170,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                    ر ا
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {SN.reem}
                      </span>
                      <ExampleTag />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      أخصائية ليزر
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, border: "1.5px dashed #DAC7DF", background: "repeating-linear-gradient(45deg, #FDF9FE 0 8px, #F8F1F9 8px 16px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: "#866F8D" }}>
                  إجازة
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", border: "1px solid #FFFFFF", boxShadow: "0 6px 14px rgba(150,100,170,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FCF1DE", border: "1px solid #F3DDB5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    12:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#8A5A12" }}>
                    طلب تعديل
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                    ه ا
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {SN.hiba}
                      </span>
                      <ExampleTag />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      أخصائية عناية بالبشرة
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, border: "1.5px dashed #DAC7DF", background: "repeating-linear-gradient(45deg, #FDF9FE 0 8px, #F8F1F9 8px 16px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, color: "#866F8D" }}>
                  إجازة
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", border: "1px solid #FFFFFF", boxShadow: "0 6px 14px rgba(150,100,170,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                    ل خ
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {SN.lina}
                      </span>
                      <ExampleTag />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      الاستقبال
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", border: "1px solid #FFFFFF", boxShadow: "0 6px 14px rgba(150,100,170,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    كاملة
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FCF1DE", border: "1px solid #F3DDB5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    09:30–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#8A5A12" }}>
                    طلب تعديل
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                    س ح
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {SN.salma}
                      </span>
                      <ExampleTag />
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      المحاسبة
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    صباحية
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    صباحية
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    صباحية
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#E6D3EE)", border: "1px solid #FFFFFF", boxShadow: "0 6px 14px rgba(150,100,170,0.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    صباحية
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FFFFFF", border: "1px solid #E9DCEE", boxShadow: "0 4px 12px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    10:00–16:00
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D" }}>
                    صباحية
                  </span>
                </div>
                <div style={{ flex: 1, height: 78, borderRadius: 18, background: "#FCF1DE", border: "1px solid #F3DDB5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.3 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 500, color: "#35213D", whiteSpace: "nowrap", letterSpacing: -0.2 }}>
                    12:00–18:00
                  </span>
                  <span style={{ fontSize: 11, color: "#8A5A12" }}>
                    طلب تعديل
                  </span>
                </div>
              </div>
              <div style={{ height: 1, background: "#EDE2F1", margin: "4px 0" }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 170, fontSize: 13, fontWeight: 700 }}>
                  التغطية اليومية
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#A877B6" }}>
                    4/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    2 أخصائيات
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#A877B6" }}>
                    4/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    2 أخصائيات
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#7B4687" }}>
                    5/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    3 أخصائيات
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#7B4687" }}>
                    5/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    3 أخصائيات
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#7B4687" }}>
                    5/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    3 أخصائيات
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", lineHeight: 1.4 }}>
                  <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 16, fontWeight: 700, color: "#7B4687" }}>
                    5/5
                  </div>
                  <div style={{ fontSize: 11, color: "#866F8D" }}>
                    3 أخصائيات
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#866F8D", borderTop: "1px solid #EDE2F1", paddingTop: 12 }}>
              <span>
                الجمعة عطلة المركز
              </span>
              <span>
                ·
              </span>
              <span>
                ساعات المركز 10:00–18:00
              </span>
              <span>
                ·
              </span>
              <span>
                الاستقبال يبدأ 09:30
              </span>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", width: 320, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                طلبات التعديل والتبديل
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                2
              </span>
            </div>
            <div style={{ borderRadius: 22, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                  ر ا
                </span>
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {SN.reem}
                    </span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    تأخير بداية الوردية
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                  جديد
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {arDate(new Date(2026, 9, 14))}: 12:00 بدل 10:00
              </div>
              <div style={{ fontSize: 12, color: "#76607E" }}>
                تُنقل مواعيد الليزر الصباحية إن وُجدت
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ height: 36, borderRadius: 18, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="check" color="#FFFFFF" size={17} stroke={1.9} />
                  موافقة
                </button>
                <button style={{ height: 36, borderRadius: 18, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="x" color="#7B4687" size={17} stroke={1.9} />
                  رفض
                </button>
              </div>
            </div>
            <div style={{ borderRadius: 22, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687" }}>
                  ل خ
                </span>
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {SN.lina}
                    </span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    تبديل وردية مع {SN.salma}
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                  جديد
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {arDate(new Date(2026, 9, 15))}: تنتهي 16:00
              </div>
              <div style={{ fontSize: 12, color: "#76607E" }}>
                {SN.salma} تغطي الاستقبال 16:00–18:00
                <ExampleTag />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ height: 36, borderRadius: 18, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="check" color="#FFFFFF" size={17} stroke={1.9} />
                  موافقة
                </button>
                <button style={{ height: 36, borderRadius: 18, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="x" color="#7B4687" size={17} stroke={1.9} />
                  رفض
                </button>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
              طلبات هذا الأسبوع المعتمدة
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" color="#FFFFFF" size={11} stroke={2.4} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, fontSize: 12.5 }}>
                <div>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    {SN.hiba}
                  </span>
                  <ExampleTag />
                </div>
                <div style={{ color: "#866F8D", fontSize: 12 }}>
                  إجازة {arDate(new Date(2026, 9, 11))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, borderTop: "1px solid #EDE2F1" }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" color="#FFFFFF" size={11} stroke={2.4} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, fontSize: 12.5 }}>
                <div>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    {SN.reem}
                  </span>
                  <ExampleTag />
                </div>
                <div style={{ color: "#866F8D", fontSize: 12 }}>
                  إجازة {arDate(new Date(2026, 9, 10))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: "#F3EAF6", color: "#74457F" }}>
                <Icon name="info" color="#A877B6" size={17} />
                <span>
                  أي تعديل يتعارض مع مواعيد محجوزة يُعرض قبل الموافقة.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
