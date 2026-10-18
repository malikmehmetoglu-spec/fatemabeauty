"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { TODAY } from "@/lib/data";
import { css, tagStyle } from "@/lib/mock/g";

/** W_Devices.dc.html — الأجهزة والصيانة. */
export default function Page() {
  const [m, setM] = useState([false, false]);
  const UP = [3, 5];
  const mk = (k: number) => {
    const on = m[k];
    return {
      tag: on ? "تحت الصيانة" : "يعمل", tagStyle: tagStyle(on ? "amber" : "green"),
      toggle: () => setM((x) => x.map((y, i) => (i === k ? !y : y))),
      hint: on ? "الحجز مقفل تلقائياً — " + UP[k] + " مواعيد اليوم تحتاج إعادة جدولة" : "غير مفعّل — الحجز متاح",
      rowStyle: "display:flex;align-items:center;gap:12px;border-radius:20px;padding:12px 14px;font-family:inherit;width:100%;" + (on ? "background:#FCF1DE;border:1px solid #F3DDB5" : "background:#FFFFFF;border:1px solid #E9DCEE"),
      track: "width:52px;height:30px;border-radius:15px;padding:3px;flex-shrink:0;display:flex;justify-content:" + (on ? "flex-end;background:linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)" : "flex-start;background:#E6DDE8"),
    };
  };
  const v = { d0: mk(0), d1: mk(1) };
  return (
    <AdminShell active="المخزون والأجهزة" title="الأجهزة والصيانة" subtitle="العدّادات وتواريخ الصيانة قيم مثال" actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Inventory}>
        <Icon name="box" color="#7B4687" size={17} stroke={1.9} />
        المخزون
      </Link>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 20, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 50, height: 50, borderRadius: 25, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="drop" color="#A877B6" size={23} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.45 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  جهاز الهيدرافيشل
                </div>
                <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                  غرفة 1 · آخر صيانة 8 تشرين الأول
                </div>
              </div>
              <span style={css(v.d0.tagStyle)}>
                {v.d0.tag}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1.2, borderRadius: 20, padding: "12px 16px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  العدّاد
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 28, fontWeight: 700 }}>
                    412
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    ساعة تشغيل
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "82%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D", marginTop: 4 }}>
                  الصيانة القادمة عند 500 ساعة تشغيل · 82%
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 20, padding: "12px 16px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  جلسات اليوم
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#35213D" }}>
                      1
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      منتهية
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#35213D" }}>
                      0
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      جارية
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#35213D" }}>
                      3
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      متبقية
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={v.d0.toggle} style={css(v.d0.rowStyle)}>
              <Icon name="tool" color="#7B4687" size={20} />
              <div style={{ flex: 1, textAlign: "right", lineHeight: 1.45 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#35213D" }}>
                  تحت الصيانة
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  {v.d0.hint}
                </div>
              </div>
              <span style={css(v.d0.track)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </button>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 20, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 50, height: 50, borderRadius: 25, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkle" color="#A877B6" size={23} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.45 }}>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  جهاز الليزر
                </div>
                <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                  غرفة 3 · آخر صيانة 22 أيلول
                </div>
              </div>
              <span style={css(v.d1.tagStyle)}>
                {v.d1.tag}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1.2, borderRadius: 20, padding: "12px 16px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  العدّاد
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 28, fontWeight: 700 }}>
                    186,420
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    نبضة
                  </span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "93%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D", marginTop: 4 }}>
                  الصيانة القادمة عند 200,000 نبضة · 93%
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 20, padding: "12px 16px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  جلسات اليوم
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#35213D" }}>
                      3
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      منتهية
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#7B4687" }}>
                      1
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      جارية
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", lineHeight: 1.3 }}>
                    <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700, color: "#35213D" }}>
                      5
                    </div>
                    <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                      متبقية
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={v.d1.toggle} style={css(v.d1.rowStyle)}>
              <Icon name="tool" color="#7B4687" size={20} />
              <div style={{ flex: 1, textAlign: "right", lineHeight: 1.45 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#35213D" }}>
                  تحت الصيانة
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  {v.d1.hint}
                </div>
              </div>
              <span style={css(v.d1.track)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: "#F3EAF6", color: "#74457F" }}>
          <Icon name="lock" color="#A877B6" size={17} />
          <span>
            عند تفعيل «تحت الصيانة» يُقفل الحجز تلقائياً على خدمات الجهاز، وتُبلَّغ المراجعات المتأثرات لإعادة الجدولة.
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1.5, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  جدول الصيانة
                </div>
                <div style={{ fontSize: 12, color: "#A877B6", fontWeight: 700 }}>
                  اليوم: {arDate(TODAY)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="check" color="#FFFFFF" size={12} stroke={2.4} />
                    </span>
                    <div style={{ flex: 1, height: 2, background: "#C9A2D8", margin: "0 6px" }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                    {arDate(new Date(2026, 8, 22))}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>
                    صيانة دورية — جهاز الليزر
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      تمت
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="check" color="#FFFFFF" size={12} stroke={2.4} />
                    </span>
                    <div style={{ flex: 1, height: 2, background: "#C9A2D8", margin: "0 6px" }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                    {arDate(new Date(2026, 9, 8))}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>
                    صيانة دورية — جهاز الهيدرافيشل
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      تمت
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, background: "#FFFFFF", border: "2px solid #C9A2D8", flexShrink: 0, boxShadow: "0 0 0 4px rgba(200,160,220,0.25)" }}></span>
                    <div style={{ flex: 1, height: 2, background: "#C9A2D8", margin: "0 6px" }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                    {arDate(new Date(2026, 9, 27))}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>
                    فحص المعايرة — جهاز الليزر
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                      مجدولة
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, background: "#FFFFFF", border: "2px solid #C9A2D8", flexShrink: 0, boxShadow: "0 0 0 4px rgba(200,160,220,0.25)" }}></span>
                    <div style={{ flex: 1, height: 2, background: "transparent", margin: "0 6px" }} />
                  </div>
                  <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                    {arDate(new Date(2026, 10, 24))}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>
                    صيانة دورية — جهاز الهيدرافيشل
                  </div>
                  <div>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                      مجدولة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  سجل الأعطال
                </div>
                <button style={{ height: 34, borderRadius: 17, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
                  <Icon name="plus" color="#7B4687" size={17} stroke={1.9} />
                  إبلاغ عن عطل
                </button>
              </div>
              <div>
                <div style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="alert" color="#A877B6" size={15} />
                  </span>
                  <div style={{ flex: 1, lineHeight: 1.45 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                      ضعف في الشفط أثناء الجلسة
                    </div>
                    <div style={{ fontSize: 12, color: "#866F8D" }}>
                      جهاز الهيدرافيشل · 6 تشرين الأول
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                    حُلّت بالصيانة 8 تشرين الأول
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="alert" color="#A877B6" size={15} />
                  </span>
                  <div style={{ flex: 1, lineHeight: 1.45 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                      تنبيه حرارة — توقف مؤقت 10 دقائق
                    </div>
                    <div style={{ fontSize: 12, color: "#866F8D" }}>
                      جهاز الليزر · 29 أيلول
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                    حُلّت
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "16px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                المواعيد المتبقية اليوم على الأجهزة
              </div>
              <span style={{ fontSize: 12, color: "#866F8D" }}>
                تتأثر عند تفعيل الصيانة
              </span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1, minWidth: "0", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="drop" color="#A877B6" size={16} />
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  جهاز الهيدرافيشل{" "}
                  <span style={{ fontWeight: 400, color: "#866F8D" }}>
                    (3)
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      13:00
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      14:15
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      16:00
                    </span>
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "0", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="sparkle" color="#A877B6" size={16} />
                </span>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  جهاز الليزر{" "}
                  <span style={{ fontWeight: 400, color: "#866F8D" }}>
                    (5)
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      13:00
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      14:00
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      15:00
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      16:00
                    </span>
                  </span>
                  <span style={{ height: 34, padding: "0 12px", borderRadius: 17, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, whiteSpace: "nowrap" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                      17:00
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
