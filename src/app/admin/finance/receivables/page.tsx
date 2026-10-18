"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SHB, SH_SOFT } from "@/lib/tokens";

/** W_Receivables.dc.html — الذمم والأقساط. */
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
    <AdminShell active="المالية" title="الذمم والأقساط" subtitle="أقساط الباقات (6 جلسات بسعر 5) · حتى الثلاثاء 13 تشرين الأول 2026" actions={<>
        <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="download" color={C.accent} size={17} stroke={1.9} />
          تصدير
        </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ width: 330, flexShrink: 0, borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>إجمالي الذمم المفتوحة</div>
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>21,500</span>
              <span>ل.س</span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>6 مراجعات بأقساط باقات · 4 متأخرة</div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>أعمار الذمم</div>
                <span style={{ fontSize: 12, color: C.sub2 }}>حسب تاريخ القسط المستحق</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                <div title="غير مستحق: 6,500 ل.س" style={{ flex: 6500, height: 16, background: "#8FCBA6", borderRadius: 4 }}></div>
                <div title="حتى 30 يوماً: 7,500 ل.س" style={{ flex: 7500, height: 16, background: "#E9C27A", borderRadius: 4 }}></div>
                <div title="31 إلى 60 يوماً: 5,000 ل.س" style={{ flex: 5000, height: 16, background: "#C9A2D8", borderRadius: 4 }}></div>
                <div title="أكثر من 60 يوماً: 2,500 ل.س" style={{ flex: 2500, height: 16, background: C.accent, borderRadius: 4 }}></div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "#8FCBA6" }}></span>
                    غير مستحق
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>6,500</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "#E9C27A" }}></span>
                    حتى 30 يوماً
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>7,500</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "#C9A2D8" }}></span>
                    31 إلى 60 يوماً
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>5,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accent }}></span>
                    أكثر من 60 يوماً
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>2,500</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المراجعة</div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الباقة</div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المدفوع</div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المتبقي</div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>القسط القادم</div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>العمر</div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>إجراء</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>س ي</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>سارة يوسف</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة هيدرافيشل · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>6,000 من 10,000</span>
                  <span>60%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>4,000</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>20 تشرين الأول</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 7 أيام</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>غير مستحق</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ن إ</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>نغم إبراهيم</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة هيدرافيشل · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>7,500 من 10,000</span>
                  <span>75%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "75%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>2,500</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>3 تشرين الثاني</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 21 أيام</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>غير مستحق</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ك س</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>كندة سعيد</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة تقشير · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>7,500 من 10,000</span>
                  <span>75%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "75%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>2,500</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>8 تشرين الأول</div>
                <div style={{ fontSize: 11.5, color: C.danger }}>متأخر 5 يوماً</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>حتى 30 يوماً</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ر خ</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>رنا خليل</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة تقشير · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>5,000 من 10,000</span>
                  <span>50%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "50%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>5,000</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>1 تشرين الأول</div>
                <div style={{ fontSize: 11.5, color: C.danger }}>متأخر 12 يوماً</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>حتى 30 يوماً</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ت ن</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>تالا ناصر</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة تنظيف عميق · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>2,500 من 7,500</span>
                  <span>33%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "33%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>5,000</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>5 أيلول</div>
                <div style={{ fontSize: 11.5, color: C.danger }}>متأخر 38 يوماً</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>31 إلى 60 يوماً</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 68, borderTop: "1px solid #EDE2F1" }}>
            <div style={{ flex: 1.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ش ا</span>
              <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>شام العمر</span>
              <ExampleTag />
            </div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.sub }}>باقة تنظيف عميق · 6 جلسات</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.sub2, marginBottom: 4 }}>
                  <span>5,000 من 7,500</span>
                  <span>67%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "67%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                </div>
              </div>
            </div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.accent }}>2,500</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>10 آب</div>
                <div style={{ fontSize: 11.5, color: C.danger }}>متأخر 64 يوماً</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: C.accent, color: C.white }}>أكثر من 60 يوماً</span>
            </div>
            <div style={{ flex: 1.4, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ height: 32, borderRadius: 16, border: "none", background: C.tint, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="send" color={C.accentMid} size={14} />
                  تذكير
                </button>
                <Link href={R.W_Cashier} style={{ height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, color: C.accent, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}>
                  <Icon name="cash" color={C.accent} size={14} />
                  تحصيل
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 24, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", minHeight: "0" }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="bell" color={C.accentMid} size={18} />
            </span>
            <div style={{ flex: 1, lineHeight: 1.45 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>تذكير تلقائي بالأقساط</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>
                رسالة واتساب أو SMS قبل موعد القسط بـ 3 أيام، وتذكير ثانٍ بعد التأخر بأسبوع.
              </div>
            </div>
            <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
            </span>
            <button style={{ height: 40, borderRadius: 20, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
              <Icon name="send" color={C.white} size={17} stroke={1.9} />
              إرسال تذكير لكل المتأخرات (4)
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
