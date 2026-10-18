"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { arDate } from "@/lib/format";
import { TODAY } from "@/lib/data";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_Inventory.dc.html — المخزون. */
export default function Page() {
  return (
    <AdminShell active="المخزون والأجهزة" title="المخزون" subtitle={`الكميات حتى ${arDate(TODAY, { year: true })} · قيم مثال`} actions={<>
        <Link href={R.W_Devices} style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="tool" color={C.accent} size={17} stroke={1.9} />
          الأجهزة
        </Link>
        <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
          <Icon name="plus" color={C.white} size={17} stroke={1.9} />
          إضافة صنف
        </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>الأصناف</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="box" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>8</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>مواد جلسات ومنتجات للبيع</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>تحت الحد الأدنى</div>
              <Icon name="alert" color={"#E8D6F0"} size={20} />
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>3</div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>تحتاج طلب شراء</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>قريبة الانتهاء</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="clock" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>2</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>خلال 60 يوماً</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>آخر جرد</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="clip" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>{arDate(TODAY, { day: false })}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>قيد الاعتماد</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", flex: 1 }}>
            <div style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الصنف</div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>رقم التشغيلة الأقرب</div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>تاريخ الانتهاء</div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الكمية</div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الحالة</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="drop" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>مصل الهيالورونيك</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · أمبولة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>HA-2607-11</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>30 تشرين الثاني 2026</div>
                    <div style={{ fontSize: 11.5, color: "#B07A1E" }}>بعد 48 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>18</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 20</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "45%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>منخفض</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>قريب الانتهاء</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bottle" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>محلول جلسات الهيدرافيشل</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>HF-2604-05</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>10 تشرين الثاني 2026</div>
                    <div style={{ fontSize: 11.5, color: "#B07A1E" }}>بعد 28 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>14</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 6</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>قريب الانتهاء</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bottle" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>مواد التقشير (محلول)</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>PL-2606-07</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>15 كانون الأول 2026</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 63 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>6</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 8</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "38%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>منخفض</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="jar" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>جل التبريد لجلسات الليزر</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>LG-2609-01</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>30 حزيران 2027</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 260 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>9</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 10</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "45%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>منخفض</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="jar" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>ماسك مهدئ</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>MS-2605-03</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>31 آذار 2027</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 169 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>24</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 10</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>متوفر</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="bottle" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>منظف رغوي للبشرة</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>CL-2607-09</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>31 كانون الثاني 2027</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 110 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>20</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 8</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>متوفر</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="sun" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>واقي شمس للبيع</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>للبيع في المتجر · عبوة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>SP-2608-02</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>31 آب 2028</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 688 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>35</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 12</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>متوفر</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 70, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="hand" color={C.accentMid} size={15} />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>قفازات طبية</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>مواد جلسات · علبة</div>
                  </div>
                </div>
                <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap" }}>GL-2608-12</span>
                </div>
                <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ lineHeight: 1.35 }}>
                    <div style={{ whiteSpace: "nowrap", fontWeight: 600 }}>31 آب 2029</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>بعد 1053 يوماً</div>
                  </div>
                </div>
                <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 14 }}>12</span>
                      <span style={{ color: C.sub2 }}>الحد الأدنى 10</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>متوفر</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", width: 330, flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الصرف حسب الأقرب انتهاءً</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>FEFO</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>عند تسجيل مواد الجلسة يقترح النظام التشغيلة الأقرب انتهاءً تلقائياً.</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>مصل الهيالورونيك · 18 أمبولة في تشغيلتين</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 18, padding: "10px 12px", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>HA-2607-11</span>
                  <div style={{ fontSize: 12, color: C.sub2 }}>ينتهي 30 تشرين الثاني 2026</div>
                </div>
                <div style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>8</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: C.accent, color: C.white }}>يُصرف أولاً</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 18, padding: "10px 12px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                <div style={{ flex: 1, lineHeight: 1.4 }}>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>HA-2609-04</span>
                  <div style={{ fontSize: 12, color: C.sub2 }}>ينتهي 31 أيار 2027</div>
                </div>
                <div style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>10</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>لاحقاً</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: "#FCF1DE", color: "#7A4F10" }}>
                <Icon name="alert" color={"#B07A1E"} size={17} />
                <span>تنبيه قبل 60 يوماً من الانتهاء، ومنع الصرف بعد تاريخ الانتهاء.</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>تنتهي قريباً</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40, borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clock" color={C.accentMid} size={14} />
                </span>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>محلول جلسات الهيدرافيشل</div>
                <span style={{ fontSize: 12, color: "#B07A1E" }}>10 تشرين الثاني</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 40, borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clock" color={C.accentMid} size={14} />
                </span>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>مصل الهيالورونيك</div>
                <span style={{ fontSize: 12, color: "#B07A1E" }}>30 تشرين الثاني</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                <Link href={R.W_Purchases} style={{ height: 40, borderRadius: 20, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="cart" color={C.white} size={17} stroke={1.9} />
                  طلب شراء
                </Link>
                <Link href={R.W_Stocktake} style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="clip" color={C.accent} size={17} stroke={1.9} />
                  الجرد
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
