"use client";

import { Fragment, useState, type CSSProperties } from "react";
import { money, arDate } from "@/lib/format";
import { TODAY } from "@/lib/data";
import { COMMISSIONS } from "@/lib/mock/f";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, ICON_FILL, SH, SHB , SELECTED } from "@/lib/tokens";

/** W_Commissions.dc.html — العمولات. */
const OFF: CSSProperties = { background: "#FFFFFF", border: "1px solid #EADCF0", color: "#866F8D", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" };

export default function Page() {
  const [m, setM] = useState(0);
  const fmt = (n: number) => money(n, false);
  const list = m === 0 ? COMMISSIONS.oct : COMMISSIONS.sep;
  const tabs = [`${arDate(TODAY, { day: false }).split(" ").slice(1).join(" ")} ${TODAY.getFullYear()} (حتى اليوم)`, "أيلول 2026"].map((l, i) => ({ label: l, pick: () => setM(i),
    style: { height: 40, padding: "0 18px", borderRadius: 20, fontSize: 13.5, fontWeight: 600, ...(m === i ? SELECTED : OFF) } as CSSProperties }));
  const tag = (bg: string, color: string): CSSProperties => ({ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: bg, color });
  const rows = list.map((r) => ({ ...r, fat: !r.ex, revenue: fmt(r.revenue), comm: r.rate ? fmt(r.comm) : "—",
    rateLabel: r.rate ? `${r.rate}%` : "غير مفعّلة", rateStyle: r.rate ? { fontFamily: "Rubik, sans-serif", fontWeight: 600 } : tag("#F0EDF0", "#695D6B"),
    status: !r.rate ? "—" : m === 0 ? "قيد الاحتساب" : "صُرفت مع الراتب",
    stStyle: !r.rate ? { color: C.muted } : m === 0 ? tag("#FCF1DE", "#8A5A12") : tag("#E6F4EC", C.okDeep) }));
  const totalComm = fmt(list.reduce((a, r) => a + r.comm, 0)), totalSessions = list.reduce((a, r) => a + r.sessions, 0), totalRev = fmt(list.reduce((a, r) => a + r.revenue, 0));
  const monthLabel = m === 0 ? "تشرين الأول حتى اليوم" : "أيلول 2026";
  const heroSub = m === 0 ? "تقديرية — تُعتمد في نهاية الشهر" : "مُعتمدة · صُرفت في 1 تشرين الأول";
  const sessionsSub = m === 0 ? "11 يوم عمل حتى اليوم" : "26 يوم عمل";
  const payText = m === 0 ? "تُعتمد عمولات تشرين الأول بعد إغلاق الشهر وتُضاف إلى مسير رواتبه." : `صُرفت عمولات أيلول ضمن مسير رواتب أيلول يوم ${arDate(new Date(2026, 9, 1), { year: true })}.`;
  return (
    <AdminShell active="المالية" title="العمولات" subtitle="عمولات الأخصائيات على الجلسات المنتهية">
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", minHeight: "0", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {tabs.map((t, i) => (<Fragment key={i}>
              <button onClick={t.pick} style={t.style}>{t.label}</button>
            </Fragment>))}
          </div>
          <div style={{ fontSize: 12, color: C.sub2 }}>
            النسب والمبالغ أمثلة توضيحية
            <ExampleTag />
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1.2, borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>{"إجمالي العمولات · "}{monthLabel}</div>
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>{totalComm}</span>
              <span>ل.س</span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>{heroSub}</div>
          </div>
          <div style={{ flex: 1, borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>الجلسات المنتهية</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="calcheck" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontFamily: "Rubik, sans-serif", fontSize: 28, fontWeight: 700 }}>{totalSessions}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{sessionsSub}</div>
          </div>
          <div style={{ flex: 1, borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>إيراد الجلسات</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="wallet" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 28, fontWeight: 700 }}>{totalRev}</span>
              <span style={{ fontSize: 13 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>أساس احتساب العمولة</div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "8px 20px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>الأخصائية</div>
            <div style={{ flex: 2.7, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>توزيع الجلسات</div>
            <div style={{ flex: 0.7, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>الجلسات</div>
            <div style={{ flex: 1.2, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>إيراد الجلسات</div>
            <div style={{ flex: 0.9, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>
              النسبة
              <ExampleTag />
            </div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>العمولة</div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", alignItems: "center" }}>الحالة</div>
          </div>
          {rows.map((r, i) => (<Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 92, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                {r.fat && (<>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 38, height: 38, borderRadius: 19, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                </>)}
                {r.ex && (<>
                  <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>{r.ini}</span>
                </>)}
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.name}</span>
                {r.ex && (<>
                  <ExampleTag />
                </>)}
              </div>
              <div style={{ flex: 2.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.breakdown.map((b, i) => (<Fragment key={i}>
                    <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "#F8F2FA", border: "1px solid #EDE2F1", fontSize: 12, color: C.sub, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>{b.l}</span>
                  </Fragment>))}
                </div>
              </div>
              <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>{r.sessions}</span>
              </div>
              <div style={{ flex: 1.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>{r.revenue}</span>
                <span style={{ fontSize: 11, color: C.sub2 }}>ل.س</span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={r.rateStyle}>{r.rateLabel}</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, color: C.accent, fontSize: 15 }}>{r.comm}</span>
                {r.rate && (<>
                  <span style={{ fontSize: 11, color: C.sub2 }}>ل.س</span>
                </>)}
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={r.stStyle}>{r.status}</span>
              </div>
            </div>
          </Fragment>))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>قواعد الاحتساب</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>هيكل قابل للتعديل</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={10} stroke={2.4} />
                </span>
                <span>نسبة من سعر الجلسة المنتهية والمدفوعة فقط</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={10} stroke={2.4} />
                </span>
                <span>تُحتسب بعد الخصم، ولا تشمل الاستشارات المجانية</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={10} stroke={2.4} />
                </span>
                <span>جلسات الباقات تُحتسب بسعر الجلسة داخل الباقة</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={10} stroke={2.4} />
                </span>
                <span>تُصرف مع راتب الشهر التالي</span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", width: 360, flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الصرف</div>
              </div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>{payText}</div>
              <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
                <Link href={R.W_Payroll} style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="file" color={C.accent} size={17} stroke={1.9} />
                  مسير الرواتب
                </Link>
                <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="download" color={C.accent} size={17} stroke={1.9} />
                  تصدير
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
