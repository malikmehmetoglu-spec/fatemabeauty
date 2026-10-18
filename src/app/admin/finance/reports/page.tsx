"use client";

import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_FinanceReports.dc.html — التقارير المالية. */
export default function Page() {
  return (
    <AdminShell active="المالية" title="التقارير المالية" subtitle="أيلول 2026 · الأرقام الشهرية أمثلة متسقة مع أسعار الخدمات" actions={<>
        <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="cal" color={C.accent} size={17} stroke={1.9} />
          أيلول 2026
        </button>
        <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="download" color={C.accent} size={17} stroke={1.9} />
          PDF
        </button>
        <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
          <Icon name="download" color={C.white} size={17} stroke={1.9} />
          Excel
        </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>إيرادات أيلول 2026</div>
              <Icon name="wallet" color={"#E8D6F0"} size={20} />
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>
              {"1,350,000 "}
              <span style={{ fontSize: 15 }}>ل.س</span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>620 جلسة · 26 يوم عمل</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>المصاريف</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="receipt" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>
              {"607,500 "}
              <span style={{ fontSize: 14 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>رواتب، مواد، إيجار وغيرها</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>صافي الربح</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="trend" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>
              {"742,500 "}
              <span style={{ fontSize: 14 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>هامش 55%</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>متوسط اليوم</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="cal" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>
              {"51,923 "}
              <span style={{ fontSize: 14 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>أيام العمل فقط (الجمعة عطلة)</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1.6, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الإيراد اليومي — أيلول 2026</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: C.sub2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accentMid }}></span>
                    الإيراد
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 16, borderTop: "1.5px dashed #7B4687" }}></span>
                    المتوسط 51,923
                  </span>
                </div>
              </div>
              <div style={{ position: "relative", paddingRight: 32 }}>
                <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 10.5, color: C.muted, position: "absolute", right: "0", top: 243 }}>0k</div>
                <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 10.5, color: C.muted, position: "absolute", right: "0", top: 172 }}>20k</div>
                <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 10.5, color: C.muted, position: "absolute", right: "0", top: 100 }}>40k</div>
                <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 10.5, color: C.muted, position: "absolute", right: "0", top: 29 }}>60k</div>
                <svg width="100%" height="276" viewBox="0 0 700 276" preserveAspectRatio="none" style={{ display: "block", direction: "ltr" }}>
                  <line x1="0" x2="700" y1="250.0" y2="250.0" stroke="#EFE5F1" strokeWidth="1" />
                  <line x1="0" x2="700" y1="178.6" y2="178.6" stroke="#EFE5F1" strokeWidth="1" />
                  <line x1="0" x2="700" y1="107.1" y2="107.1" stroke="#EFE5F1" strokeWidth="1" />
                  <line x1="0" x2="700" y1="35.7" y2="35.7" stroke="#EFE5F1" strokeWidth="1" />
                  <rect x="681.3" y="60.7" width="14.0" height="189.3" rx="4" fill="url(#gb)" />
                  <title>الثلاثاء 1 أيلول: 53,000 ل.س</title>
                  <text x="688.3" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">1</text>
                  <rect x="658.0" y="62.5" width="14.0" height="187.5" rx="4" fill="url(#gb)" />
                  <title>الأربعاء 2 أيلول: 52,500 ل.س</title>
                  <rect x="634.7" y="58.9" width="14.0" height="191.1" rx="4" fill="url(#gb)" />
                  <title>الخميس 3 أيلول: 53,500 ل.س</title>
                  <rect x="611.3" y="247" width="14.0" height="3" rx="1.5" fill="#E3D6E6" />
                  <title>الجمعة 4 أيلول: عطلة</title>
                  <rect x="588.0" y="57.1" width="14.0" height="192.9" rx="4" fill="url(#gb)" />
                  <title>السبت 5 أيلول: 54,000 ل.س</title>
                  <text x="595.0" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">5</text>
                  <rect x="564.7" y="78.6" width="14.0" height="171.4" rx="4" fill="url(#gb)" />
                  <title>الأحد 6 أيلول: 48,000 ل.س</title>
                  <rect x="541.3" y="67.9" width="14.0" height="182.1" rx="4" fill="url(#gb)" />
                  <title>الإثنين 7 أيلول: 51,000 ل.س</title>
                  <rect x="518.0" y="66.1" width="14.0" height="183.9" rx="4" fill="url(#gb)" />
                  <title>الثلاثاء 8 أيلول: 51,500 ل.س</title>
                  <rect x="494.7" y="67.9" width="14.0" height="182.1" rx="4" fill="url(#gb)" />
                  <title>الأربعاء 9 أيلول: 51,000 ل.س</title>
                  <rect x="471.3" y="64.3" width="14.0" height="185.7" rx="4" fill="url(#gb)" />
                  <title>الخميس 10 أيلول: 52,000 ل.س</title>
                  <text x="478.3" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">10</text>
                  <rect x="448.0" y="247" width="14.0" height="3" rx="1.5" fill="#E3D6E6" />
                  <title>الجمعة 11 أيلول: عطلة</title>
                  <rect x="424.7" y="35.7" width="14.0" height="214.3" rx="4" fill="url(#gb)" />
                  <title>السبت 12 أيلول: 60,000 ل.س</title>
                  <rect x="401.3" y="83.9" width="14.0" height="166.1" rx="4" fill="url(#gb)" />
                  <title>الأحد 13 أيلول: 46,500 ل.س</title>
                  <rect x="378.0" y="71.4" width="14.0" height="178.6" rx="4" fill="url(#gb)" />
                  <title>الإثنين 14 أيلول: 50,000 ل.س</title>
                  <rect x="354.7" y="71.4" width="14.0" height="178.6" rx="4" fill="url(#gb)" />
                  <title>الثلاثاء 15 أيلول: 50,000 ل.س</title>
                  <text x="361.7" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">15</text>
                  <rect x="331.3" y="71.4" width="14.0" height="178.6" rx="4" fill="url(#gb)" />
                  <title>الأربعاء 16 أيلول: 50,000 ل.س</title>
                  <rect x="308.0" y="44.6" width="14.0" height="205.4" rx="4" fill="url(#gb)" />
                  <title>الخميس 17 أيلول: 57,500 ل.س</title>
                  <rect x="284.7" y="247" width="14.0" height="3" rx="1.5" fill="#E3D6E6" />
                  <title>الجمعة 18 أيلول: عطلة</title>
                  <rect x="261.3" y="41.1" width="14.0" height="208.9" rx="4" fill="url(#gb)" />
                  <title>السبت 19 أيلول: 58,500 ل.س</title>
                  <rect x="238.0" y="87.5" width="14.0" height="162.5" rx="4" fill="url(#gb)" />
                  <title>الأحد 20 أيلول: 45,500 ل.س</title>
                  <text x="245.0" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">20</text>
                  <rect x="214.7" y="75.0" width="14.0" height="175.0" rx="4" fill="url(#gb)" />
                  <title>الإثنين 21 أيلول: 49,000 ل.س</title>
                  <rect x="191.3" y="51.8" width="14.0" height="198.2" rx="4" fill="url(#gb)" />
                  <title>الثلاثاء 22 أيلول: 55,500 ل.س</title>
                  <rect x="168.0" y="76.8" width="14.0" height="173.2" rx="4" fill="url(#gb)" />
                  <title>الأربعاء 23 أيلول: 48,500 ل.س</title>
                  <rect x="144.7" y="48.2" width="14.0" height="201.8" rx="4" fill="url(#gb)" />
                  <title>الخميس 24 أيلول: 56,500 ل.س</title>
                  <rect x="121.3" y="247" width="14.0" height="3" rx="1.5" fill="#E3D6E6" />
                  <title>الجمعة 25 أيلول: عطلة</title>
                  <text x="128.3" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">25</text>
                  <rect x="98.0" y="46.4" width="14.0" height="203.6" rx="4" fill="url(#gb)" />
                  <title>السبت 26 أيلول: 57,000 ل.س</title>
                  <rect x="74.7" y="71.4" width="14.0" height="178.6" rx="4" fill="url(#gb)" />
                  <title>الأحد 27 أيلول: 50,000 ل.س</title>
                  <rect x="51.3" y="80.4" width="14.0" height="169.6" rx="4" fill="url(#gb)" />
                  <title>الإثنين 28 أيلول: 47,500 ل.س</title>
                  <rect x="28.0" y="57.1" width="14.0" height="192.9" rx="4" fill="url(#gb)" />
                  <title>الثلاثاء 29 أيلول: 54,000 ل.س</title>
                  <rect x="4.7" y="80.4" width="14.0" height="169.6" rx="4" fill="url(#gb)" />
                  <title>الأربعاء 30 أيلول: 47,500 ل.س</title>
                  <text x="11.7" y="268" textAnchor="middle" fontSize="11" fill="#A595AC" fontFamily="Rubik">30</text>
                  <line x1="0" x2="700" y1="64.6" y2="64.6" stroke="#7B4687" strokeWidth="1.2" strokeDasharray="4 4" />
                  <defs>
                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#A877B6" />
                      <stop offset="1" stopColor="#D9BCE5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>لقطة الربح</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>أيلول</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 700, height: 32 }}>
                <span>الإيرادات</span>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 15, color: C.ok }}>1,350,000</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ borderTop: "1px solid #EDE2F1", paddingTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>رواتب</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>221,500</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>مواد</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>96,000</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>إيجار</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>200,000</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>كهرباء</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>35,000</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>صيانة</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>25,000</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, height: 30 }}>
                  <span style={{ color: C.sub }}>تسويق</span>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>30,000</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 16, padding: "10px 14px", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <span style={{ fontWeight: 700 }}>صافي الربح</span>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 17, color: C.accent }}>742,500</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1.15, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>حسب الخدمة</div>
              </div>
              <div>
                <div title="جلسة ليزر: 665,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                  <div style={{ width: 118, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>جلسة ليزر</div>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#F2E9F4" }}>
                    <div style={{ width: "100.0%", height: 12, borderRadius: 6, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 92, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>665,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 54, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>190 جلسة</div>
                </div>
                <div title="تنظيف عميق للبشرة: 285,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                  <div style={{ width: 118, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>تنظيف عميق للبشرة</div>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#F2E9F4" }}>
                    <div style={{ width: "42.9%", height: 12, borderRadius: 6, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 92, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>285,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 54, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>190 جلسة</div>
                </div>
                <div title="هيدرافيشل: 200,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                  <div style={{ width: 118, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>هيدرافيشل</div>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#F2E9F4" }}>
                    <div style={{ width: "30.1%", height: 12, borderRadius: 6, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 92, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>200,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 54, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>100 جلسة</div>
                </div>
                <div title="تقشير البشرة: 200,000 ل.س" style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                  <div style={{ width: 118, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>تقشير البشرة</div>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#F2E9F4" }}>
                    <div style={{ width: "30.1%", height: 12, borderRadius: 6, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 92, textAlign: "left" }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>200,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                  <div style={{ width: 54, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>100 جلسة</div>
                </div>
                <div title="استشارة في المركز: 0 ل.س" style={{ display: "flex", alignItems: "center", gap: 10, height: 34 }}>
                  <div style={{ width: 118, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>استشارة في المركز</div>
                  <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#F2E9F4" }}>
                    <div style={{ width: "0.5%", height: 12, borderRadius: 6, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                  <div style={{ width: 92, textAlign: "left" }}>
                    <span style={{ fontSize: 12, color: C.muted }}>مجانية</span>
                  </div>
                  <div style={{ width: 54, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>40 جلسة</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1.05, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>حسب الأخصائية</div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", minHeight: "0" }}>
                <svg width="160" height="160" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#7B4687" strokeWidth="18" strokeDasharray="80.4 208.6" strokeDashoffset="0.0" transform="rotate(-90 60 60)" />
                  <title>فاطمة طيبة: 385,000 ل.س</title>
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#A877B6" strokeWidth="18" strokeDasharray="140.4 148.7" strokeDashoffset="-82.4" transform="rotate(-90 60 60)" />
                  <title>ريم الحسن: 665,000 ل.س</title>
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#D9BCE5" strokeWidth="18" strokeDasharray="62.2 226.8" strokeDashoffset="-224.8" transform="rotate(-90 60 60)" />
                  <title>هبة العلي: 300,000 ل.س</title>
                </svg>
                <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accent, flexShrink: 0 }}></span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>فاطمة طيبة</span>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>385,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                    <span style={{ width: 34, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>29%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accentMid, flexShrink: 0 }}></span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                      ريم الحسن
                      <ExampleTag />
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>665,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                    <span style={{ width: 34, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>49%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: "#D9BCE5", flexShrink: 0 }}></span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                      هبة العلي
                      <ExampleTag />
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 12.5, color: C.ink }}>300,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                    <span style={{ width: 34, textAlign: "left", fontSize: 11.5, color: C.sub2 }}>22%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
