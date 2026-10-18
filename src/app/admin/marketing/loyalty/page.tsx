"use client";

import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { PERSONA, TODAY } from "@/lib/data";

/** W_Loyalty.dc.html — النقاط والعضويات. */
export default function Page() {

  return (
    <AdminShell active="التسويق والولاء" title="النقاط والعضويات" subtitle="شرائح العضوية وقواعد النقاط وبطاقات الهدايا" actions={<>
      <button style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", border: "none", padding: "0 20px", fontSize: 14 }}>
        <Icon name="check" color="#FFFFFF" size={16} stroke={1.9} />
        حفظ التغييرات
      </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", height: 268 }}>
          <div style={{ borderRadius: 26, padding: "16px 18px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", width: 340, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="settings" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                    قواعد كسب النقاط
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    قيم قابلة للتعديل
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                  <label htmlFor="r1" style={{ fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    نقطة واحدة لكل
                    <ExampleTag />
                  </label>
                  <div style={{ height: 40, borderRadius: 20, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                    <input id="r1" defaultValue="100" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: "#35213D", textAlign: "right" }} />
                    <span style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                      ل.س
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                  <label htmlFor="r4" style={{ fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    صلاحية النقاط
                    <ExampleTag />
                  </label>
                  <div style={{ height: 40, borderRadius: 20, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                    <input id="r4" defaultValue="12" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: "#35213D", textAlign: "right" }} />
                    <span style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                      شهراً
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                  <label htmlFor="r2" style={{ fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    استبدال
                    <ExampleTag />
                  </label>
                  <div style={{ height: 40, borderRadius: 20, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                    <input id="r2" defaultValue="100" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: "#35213D", textAlign: "right" }} />
                    <span style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                      نقطة
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                  <label htmlFor="r3" style={{ fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    بخصم قيمته
                    <ExampleTag />
                  </label>
                  <div style={{ height: 40, borderRadius: 20, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                    <input id="r3" defaultValue="100" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: "#35213D", textAlign: "right" }} />
                    <span style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                      ل.س
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 34 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  نقاط على مشتريات المتجر والباقات
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
                </span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", background: "linear-gradient(145deg,#FFFFFF,#DCD8E2)", border: "1px solid #FFFFFF", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "absolute", top: -60, left: -40, width: 180, height: 180, borderRadius: 90, background: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="star" color="#7B4687" size={22} />
                <span style={{ fontSize: 18, fontWeight: 700, color: "#35213D" }}>
                  العضوية الفضية
                </span>
              </div>
              <button aria-label="تعديل العضوية الفضية" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" color="#7B4687" size={15} />
              </button>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, borderRadius: 18, padding: "8px 12px", background: "rgba(255,255,255,0.75)", border: "1px solid #FFFFFF" }}>
              <label htmlFor="t1" style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                تبدأ من
              </label>
              <input id="t1" defaultValue="0" style={{ width: 70, border: "none", background: "transparent", outline: "none", fontSize: 20, fontWeight: 700, color: "#35213D", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#866F8D" }}>
                نقطة
              </span>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#35213D" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)" }}>
                  <Icon name="check" color="#A877B6" size={13} stroke={2.2} />
                </span>
                نقاط على كل إنفاق
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#35213D" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)" }}>
                  <Icon name="check" color="#A877B6" size={13} stroke={2.2} />
                </span>
                عروض خاصة بالأعضاء
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", background: "linear-gradient(145deg,#FFF6E4,#EBCF8F)", border: "1px solid #FFFFFF", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "absolute", top: -60, left: -40, width: 180, height: 180, borderRadius: 90, background: "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="star" color="#7B4687" size={22} />
                <span style={{ fontSize: 18, fontWeight: 700, color: "#35213D" }}>
                  العضوية الذهبية
                </span>
              </div>
              <button aria-label="تعديل العضوية الذهبية" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" color="#7B4687" size={15} />
              </button>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, borderRadius: 18, padding: "8px 12px", background: "rgba(255,255,255,0.75)", border: "1px solid #FFFFFF" }}>
              <label htmlFor="t2" style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                تبدأ من
              </label>
              <input id="t2" defaultValue="500" style={{ width: 70, border: "none", background: "transparent", outline: "none", fontSize: 20, fontWeight: 700, color: "#35213D", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#866F8D" }}>
                نقطة
              </span>
              <span style={{ marginInlineStart: "auto" }}>
                <ExampleTag />
              </span>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#35213D" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)" }}>
                  <Icon name="check" color="#A877B6" size={13} stroke={2.2} />
                </span>
                مضاعفة النقاط ×1.5
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#35213D" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.8)" }}>
                  <Icon name="check" color="#A877B6" size={13} stroke={2.2} />
                </span>
                أولوية في قائمة الانتظار
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="star" color="#E8D6F0" size={22} />
                <span style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>
                  العضوية البلاتينية
                </span>
              </div>
              <button aria-label="تعديل العضوية البلاتينية" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" color="#FFFFFF" size={15} />
              </button>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, borderRadius: 18, padding: "8px 12px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <label htmlFor="t3" style={{ fontSize: 12, color: "#ECDBF0", whiteSpace: "nowrap" }}>
                تبدأ من
              </label>
              <input id="t3" defaultValue="1,500" style={{ width: 70, border: "none", background: "transparent", outline: "none", fontSize: 20, fontWeight: 700, color: "#FFFFFF", textAlign: "center" }} />
              <span style={{ fontSize: 12, color: "#ECDBF0" }}>
                نقطة
              </span>
              <span style={{ marginInlineStart: "auto" }}>
                <ExampleTag />
              </span>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)" }}>
                  <Icon name="check" color="#E8D6F0" size={13} stroke={2.2} />
                </span>
                مضاعفة النقاط ×2
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)" }}>
                  <Icon name="check" color="#E8D6F0" size={13} stroke={2.2} />
                </span>
                استشارة أونلاين دون رسوم
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0", flex: 1.55 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="history" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                    سجل حركة النقاط
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    اليوم · {arDate(TODAY)}
                  </div>
                </div>
              </div>
              <button style={{ height: 34, borderRadius: 17, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#F3EAF6", color: "#7B4687", border: "1px solid #EFE0F2" }}>
                <Icon name="list" color="#7B4687" size={16} stroke={1.9} />
                كل الحركات
              </button>
            </div>
            <div style={{ borderRadius: 26, padding: "8px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                  الوقت
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                  المراجعة
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                  السبب
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                  النقاط
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                  الرصيد
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    12:32
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      د ش
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          ديما شاهين
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف 1042
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    تنظيف عميق للبشرة
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2E7D50" }}>
                    +15
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    95
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    12:17
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      م ع
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          ميس عيسى
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف 1049
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    جلسة ليزر
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2E7D50" }}>
                    +35
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    340
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    12:02
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      ر خ
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          رنا خليل
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف 1028
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    هيدرافيشل
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2E7D50" }}>
                    +20
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    230
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    11:32
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      س ي
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          سارة يوسف
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف 1021
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    جلسة ليزر
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2E7D50" }}>
                    +35
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    590
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    11:20
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      ل ع
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          لين عبود
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف 1070
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    استبدال · خصم 100 ل.س
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#B03D6A" }}>
                    −100
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    210
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#866F8D", fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5 }}>
                    11:02
                  </span>
                </div>
                <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      ر س
                    </span>
                    <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                      <div style={{ whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#35213D", whiteSpace: "nowrap" }}>
                          ريم سالم
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        ملف {PERSONA.fileNo}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#76607E" }}>
                    تنظيف عميق للبشرة
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, color: "#2E7D50" }}>
                    +15
                  </span>
                </div>
                <div style={{ flex: 0.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>
                    415
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                    بطاقات الهدايا الصادرة
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    تُرسل رقمياً من تطبيق المراجعة
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      جلسة تنظيف عميق
                    </span>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                      GC-4821
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                    من بتول درويش
                    <ExampleTag />
                    {" "}إلى يارا حمدان
                    <ExampleTag />
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  فعّالة
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      2,000 ل.س
                    </span>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                      GC-4817
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                    من ماريا جرجس
                    <ExampleTag />
                    {" "}إلى آية الشامي
                    <ExampleTag />
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>
                  استُخدمت
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      جلسة هيدرافيشل
                    </span>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                      GC-4809
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                    من سلاف موسى
                    <ExampleTag />
                    {" "}إلى دانة عطار
                    <ExampleTag />
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  فعّالة
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      1,500 ل.س
                    </span>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                      GC-4802
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                    من رهف زين
                    <ExampleTag />
                    {" "}إلى شام العمر
                    <ExampleTag />
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                  لم تُفتح بعد
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="gift" color="#A877B6" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                      جلسة تقشير
                    </span>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                      GC-4796
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D", whiteSpace: "nowrap" }}>
                    من ولاء نجار
                    <ExampleTag />
                    {" "}إلى كندة سعيد
                    <ExampleTag />
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>
                  استُخدمت
                </span>
              </div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button style={{ height: 44, borderRadius: 22, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", border: "none", width: "100%", fontSize: 14 }}>
                <Icon name="plus" color="#FFFFFF" size={16} stroke={1.9} />
                إصدار بطاقة هدية
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
