"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SH_SOFT } from "@/lib/tokens";

/** W_Consents.dc.html — الموافقات. */
export default function Page() {
  return (
    <AdminShell active="المراجعات" title="الموافقات" subtitle="نماذج الموافقة لكل إجراء وسجلّ التواقيع" actions={<>
        <Link href={R.T_Consent} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
          <Icon name="tablet" color={C.accent} size={16} stroke={1.9} />
          توقيع على التابلت
        </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, flexGrow: 1, minHeight: "0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>وُقّعت اليوم</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="sign" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>5</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>على التابلت أو التطبيق</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>بانتظار التوقيع</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clock" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>2</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>قبل مواعيد 13:00</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>الكل</span>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>اليوم</span>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>بانتظار التوقيع</span>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>رفضت</span>
            <span style={{ marginInlineStart: "auto" }}>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="download" color={C.accent} size={16} stroke={1.9} />
                تصدير السجل
              </button>
            </span>
          </div>
          <div style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المراجعة</div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>النموذج</div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>التاريخ</div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الطريقة</div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الشاهدة</div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الحالة</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ج ا</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      جود الحلبي
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>التنظيف العميق</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>11:52</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="tablet" color={C.accentMid} size={15} />
                  التابلت
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  لينا خوري
                  <ExampleTag />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>موقّعة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ج ا</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      جود الحلبي
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>التصوير الطبي</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>11:53</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="tablet" color={C.accentMid} size={15} />
                  التابلت
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  لينا خوري
                  <ExampleTag />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>موقّعة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ت ن</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      تالا ناصر
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>جلسة الليزر</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>12:08</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="tablet" color={C.accentMid} size={15} />
                  التابلت
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  لينا خوري
                  <ExampleTag />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>موقّعة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ل ع</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      لين عبود
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>تقشير البشرة</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>12:24</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="phone" color={C.accentMid} size={15} />
                  التطبيق
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>—</span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>موقّعة</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ر س</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      ريم سالم
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>التنظيف العميق</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>12:21</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="phone" color={C.accentMid} size={15} />
                  التطبيق
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>—</span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>بانتظار التوقيع</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ب د</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      بتول درويش
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>جلسة الليزر</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>—</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="tablet" color={C.accentMid} size={15} />
                  التابلت
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>—</span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>بانتظار التوقيع</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>ر س</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      ريم سالم
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>الصور للتسويق</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>18 آب</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>10:41</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="tablet" color={C.accentMid} size={15} />
                  التابلت
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  لينا خوري
                  <ExampleTag />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>رفضت</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>م ع</span>
                  <div style={{ lineHeight: 1.35, minWidth: "0" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      ميس عيسى
                      <ExampleTag />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, lineHeight: 1.35 }}>جلسة الليزر</span>
              </div>
              <div style={{ flex: 0.55, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div>اليوم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2, fontFamily: "var(--font-rubik), sans-serif" }}>11:24</div>
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, whiteSpace: "nowrap" }}>
                  <Icon name="phone" color={C.accentMid} size={15} />
                  التطبيق
                </span>
              </div>
              <div style={{ flex: 0.95, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.muted }}>—</span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>موقّعة</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", width: 400, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>مكتبة نماذج الموافقة</div>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 400 }}>لكل إجراء نموذجه · بالعربية والإنجليزية</div>
            </div>
            <button style={{ height: 34, borderRadius: 17, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
              <Icon name="plus" color={C.accent} size={16} stroke={1.9} />
              نموذج جديد
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkle" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>التنظيف العميق</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>قبل أول جلسة من الخدمة</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="drop" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>الهيدرافيشل</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>قبل أول جلسة من الخدمة</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="layers" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>تقشير البشرة</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>قبل كل جلسة</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sun" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>جلسة الليزر</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>قبل كل جلسة + اختبار بقعة</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="camera" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>التصوير الطبي</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>مرة واحدة · للسجل فقط</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 20, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="megaphone" color={C.accentMid} size={18} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>الصور للتسويق</div>
                <div style={{ fontSize: 11.5, color: C.sub2 }}>اختيارية · يمكن سحبها</div>
              </div>
              <button aria-label="معاينة" style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)", width: 36, padding: "0" }}>
                <Icon name="eye" color={C.accent} size={16} stroke={1.9} />
              </button>
              <button style={{ height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="send" color={C.accent} size={16} stroke={1.9} />
                إرسال
              </button>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: C.sub2 }}>
            <Icon name="shield" color={C.ok} size={16} />
            يُحفظ كل توقيع مع التاريخ والوقت والجهاز
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
