"use client";

import { AdminShell } from "@/components/shell";
import { Icon } from "@/components/ui";
import { C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_Expenses.dc.html — المصاريف. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  renderVals() {
    return { accent: this.props.accent ?? '#7B4687' };
  }
}
</script>
  */
  return (
    <AdminShell active="المالية" title="المصاريف" subtitle="أيلول 2026 وتشرين الأول حتى 13 تشرين الأول · القيم أمثلة توضيحية" actions={<>
        <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="cal" color={C.accent} size={17} stroke={1.9} />
          أيلول 2026
        </button>
        <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
          <Icon name="plus" color={C.white} size={17} stroke={1.9} />
          إضافة مصروف
        </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1.15, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>مصاريف أيلول 2026 حسب الفئة</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>قيم مثال</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div title="رواتب: 221,500 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="users" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>رواتب</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "100.0%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>221,500</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>36%</div>
                </div>
                <div title="إيجار: 200,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="home" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>إيجار</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "90.3%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>200,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>33%</div>
                </div>
                <div title="مواد: 96,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bottle" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>مواد</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "43.3%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>96,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>16%</div>
                </div>
                <div title="كهرباء: 35,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="sparkle" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>كهرباء</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "15.8%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>35,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>6%</div>
                </div>
                <div title="تسويق: 30,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="megaphone" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>تسويق</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "13.5%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>30,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>5%</div>
                </div>
                <div title="صيانة: 25,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 12, height: 44 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="tool" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ width: 64, fontSize: 13.5, fontWeight: 700 }}>صيانة</div>
                  <div style={{ flex: 1, height: 14, borderRadius: 7, background: "#F2E9F4", position: "relative" }}>
                    <div style={{ width: "11.3%", height: 14, borderRadius: 7, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 108, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>25,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 40, textAlign: "left", fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2 }}>4%</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", width: 360, flexShrink: 0 }}>
            <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
              <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>إجمالي مصاريف أيلول</div>
              <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 38, fontWeight: 700, lineHeight: 1.25 }}>607,500</span>
                <span>ل.س</span>
              </div>
              <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>45% من إيرادات الشهر (1,350,000 ل.س)</div>
            </div>
            <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>تشرين الأول حتى اليوم</div>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>6 مصاريف</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 26, color: C.ink }}>324,150</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: "#FCF1DE", color: "#7A4F10" }}>
                    <Icon name="alert" color={"#B07A1E"} size={17} />
                    <span>مصروف واحد بلا إيصال — أرفقي صورته لإغلاق الشهر.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>آخر المصاريف</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>الكل</span>
              <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>مواد</span>
              <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>صيانة</span>
              <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>تسويق</span>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>التاريخ</div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>البند</div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الفئة</div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الدفع</div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المبلغ</div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الإيصال</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الثلاثاء 13 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>مستلزمات ضيافة (من الصندوق)</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>مواد</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>نقدي</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>150</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button aria-label="عرض الإيصال" style={{ height: 30, borderRadius: 15, border: "none", background: C.tint, color: C.accent, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="clip" color={C.accentMid} size={15} />
                  إيصال
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الأحد 11 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>إعلانات ممولة على وسائل التواصل</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>تسويق</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>بطاقة</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>15,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button style={{ height: 30, borderRadius: 15, border: "1.5px dashed #DFCBE3", background: C.white, color: C.sub2, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="upload" color={C.muted} size={14} />
                  إرفاق
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الخميس 8 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>صيانة دورية — جهاز الهيدرافيشل</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>صيانة</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>نقدي</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>12,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button aria-label="عرض الإيصال" style={{ height: 30, borderRadius: 15, border: "none", background: C.tint, color: C.accent, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="clip" color={C.accentMid} size={15} />
                  إيصال
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الأربعاء 7 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>استلام طلب الشراء PO-2026-039</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>مواد</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>تحويل</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>62,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button aria-label="عرض الإيصال" style={{ height: 30, borderRadius: 15, border: "none", background: C.tint, color: C.accent, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="clip" color={C.accentMid} size={15} />
                  إيصال
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الإثنين 5 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>فاتورة الكهرباء — أيلول</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>كهرباء</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>نقدي</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>35,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button aria-label="عرض الإيصال" style={{ height: 30, borderRadius: 15, border: "none", background: C.tint, color: C.accent, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="clip" color={C.accentMid} size={15} />
                  إيصال
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 46, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>الخميس 1 تشرين الأول</span>
              </div>
              <div style={{ flex: 2.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>إيجار المركز — تشرين الأول</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>إيجار</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub }}>تحويل</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>200,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <button aria-label="عرض الإيصال" style={{ height: 30, borderRadius: 15, border: "none", background: C.tint, color: C.accent, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="clip" color={C.accentMid} size={15} />
                  إيصال
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
