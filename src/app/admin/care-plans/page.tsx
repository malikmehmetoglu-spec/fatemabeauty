"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH } from "@/lib/tokens";

/** W_CarePlans.dc.html — خطط العناية. */
export default function Page() {
  const [d, setD] = useState([false, false, false, false]);
  const [c0, c1, c2, c3] = [0, 1, 2, 3].map((i) => ({
    todo: !d[i], ok: d[i], done: () => setD((v) => v.map((x, j) => (j === i ? true : x))),
  }));
  return (
    <AdminShell active="جدولي" title="خطط العناية" subtitle="متابعة الباقات والجلسات المتبقية لكل مراجعة" actions={<>
        <Link href={R.W_MyDay} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
          <Icon name="cal" color={C.accent} size={16} stroke={1.9} />
          جدولي اليوم
        </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, flexGrow: 1, minHeight: "0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1.7, minWidth: "0" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.onDark }}>خطط نشطة</div>
                <Icon name="clip" color={"#E8D6F0"} size={20} />
              </div>
              <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>7</div>
              <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>باقات قيد التنفيذ</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>جلسات خطط اليوم</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="calcheck" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>3</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>ضمن مواعيد اليوم</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>منقطعات</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="phone" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>4</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>يحتجن متابعة</div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المراجعة</div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الخطة</div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>التقدم</div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الموعد القادم</div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الحالة</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ر س</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      ريم سالم
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تنظيف عميق</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "50%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>3/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>الثلاثاء 10 تشرين الثاني</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>10:30</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>منتظمة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ج ا</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      جود الحلبي
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تنظيف عميق</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "66%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>4/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>الثلاثاء 10 تشرين الثاني</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>12:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>منتظمة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ر ق</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      روان قاسم
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تنظيف عميق</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>6/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>10:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>الأخيرة اليوم</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ر خ</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      رنا خليل
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة هيدرافيشل</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "33%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>2/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>الثلاثاء 3 تشرين الثاني</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>11:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>منتظمة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>س ي</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      سارة يوسف
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تنظيف عميق</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "16%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>1/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>الأربعاء 14 تشرين الأول</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>11:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>بدأت حديثاً</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>غ ص</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      غنى صباغ
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تنظيف عميق</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "33%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>2/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>14:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>منتظمة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 72, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.35, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>ن إ</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      نغم إبراهيم
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600 }}>باقة تقشير</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                      <div style={{ width: "66%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: "var(--font-rubik), sans-serif" }}>4/6</span>
                </div>
              </div>
              <div style={{ flex: 1.25, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>15:00</div>
                </div>
              </div>
              <div style={{ flex: 0.85, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>منتظمة</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", flex: 1 }}>
          <div style={{ borderRadius: 28, padding: "20px 22px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>منقطعات يحتجن اتصالاً</div>
                <div style={{ fontSize: 12, color: C.sub2, fontWeight: 400 }}>لا جلسات منذ أكثر من 45 يوماً وباقتهن غير مكتملة</div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>4</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ه م</span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    هالة منصور
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>باقة تنظيف عميق · 2/6 · آخر جلسة قبل 49 يوماً</div>
                </div>
                {c0.todo && (<>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button aria-label="اتصال" onClick={c0.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="phone" color={C.accentMid} size={17} />
                    </button>
                    <button aria-label="واتساب" onClick={c0.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "#E6F4EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="msg" color={C.ok} size={17} />
                    </button>
                  </div>
                </>)}
                {c0.ok && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>تم التواصل</span>
                </>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>د ش</span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    ديما شاهين
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>باقة هيدرافيشل · 3/6 · آخر جلسة قبل 63 يوماً</div>
                </div>
                {c1.todo && (<>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button aria-label="اتصال" onClick={c1.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="phone" color={C.accentMid} size={17} />
                    </button>
                    <button aria-label="واتساب" onClick={c1.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "#E6F4EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="msg" color={C.ok} size={17} />
                    </button>
                  </div>
                </>)}
                {c1.ok && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>تم التواصل</span>
                </>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ل ع</span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    لين عبود
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>باقة تقشير · 1/6 · آخر جلسة قبل 77 يوماً</div>
                </div>
                {c2.todo && (<>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button aria-label="اتصال" onClick={c2.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="phone" color={C.accentMid} size={17} />
                    </button>
                    <button aria-label="واتساب" onClick={c2.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "#E6F4EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="msg" color={C.ok} size={17} />
                    </button>
                  </div>
                </>)}
                {c2.ok && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>تم التواصل</span>
                </>)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ي ح</span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    يارا حمدان
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>باقة تنظيف عميق · 4/6 · آخر جلسة قبل 70 يوماً</div>
                </div>
                {c3.todo && (<>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button aria-label="اتصال" onClick={c3.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="phone" color={C.accentMid} size={17} />
                    </button>
                    <button aria-label="واتساب" onClick={c3.done} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "#E6F4EC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="msg" color={C.ok} size={17} />
                    </button>
                  </div>
                </>)}
                {c3.ok && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>تم التواصل</span>
                </>)}
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 16, background: "#F9F5FB", fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
              رسالة واتساب مقترحة: «اشتقنا لكِ! بقيت لكِ جلسات في باقتكِ، احجزي موعدكِ القادم من التطبيق.»
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الخطط النشطة حسب الخدمة</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>باقة تنظيف عميق</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "70%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                </div>
                <span style={{ width: 20, fontWeight: 700 }}>5</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>باقة هيدرافيشل</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "14%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                </div>
                <span style={{ width: 20, fontWeight: 700 }}>1</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>باقة تقشير</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "14%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }}></div>
                  </div>
                </div>
                <span style={{ width: 20, fontWeight: 700 }}>1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
