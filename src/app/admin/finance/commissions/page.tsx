"use client";

import { Fragment } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_Commissions.dc.html — العمولات. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"m": 0}; }
  renderVals() {
    const A = this.props.accent ?? '#7B4687';

    const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const SELST = 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687';
    const OFFST = 'background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)';
    const TAGST = {pink:'background:#F3EAF6;color:#B03D6A', green:'background:#E6F4EC;color:#2E7D50', amber:'background:#FCF1DE;color:#8A5A12', gray:'background:#F0EDF0;color:#695D6B', plum:'background:#7B4687;color:#FFFFFF'};
    const tagStyle = k => 'display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;' + TAGST[k];
    const D = {"oct": [{"name": "فاطمة طيبة", "ex": false, "ini": "ف ط", "sessions": 92, "revenue": 161000, "rate": 0, "comm": 0, "breakdown": [{"l": "تنظيف 46"}, {"l": "هيدرافيشل 29"}, {"l": "تقشير 17"}]}, {"name": "ريم الحسن", "ex": true, "ini": "ر ا", "sessions": 80, "revenue": 280000, "rate": 10, "comm": 28000, "breakdown": [{"l": "ليزر 80"}]}, {"name": "هبة العلي", "ex": true, "ini": "ه ا", "sessions": 89, "revenue": 127000, "rate": 10, "comm": 12700, "breakdown": [{"l": "تنظيف 34"}, {"l": "هيدرافيشل 13"}, {"l": "تقشير 25"}, {"l": "استشارة 17"}]}], "sep": [{"name": "فاطمة طيبة", "ex": false, "ini": "ف ط", "sessions": 220, "revenue": 385000, "rate": 0, "comm": 0, "breakdown": [{"l": "تنظيف 110"}, {"l": "هيدرافيشل 70"}, {"l": "تقشير 40"}]}, {"name": "ريم الحسن", "ex": true, "ini": "ر ا", "sessions": 190, "revenue": 665000, "rate": 10, "comm": 66500, "breakdown": [{"l": "ليزر 190"}]}, {"name": "هبة العلي", "ex": true, "ini": "ه ا", "sessions": 210, "revenue": 300000, "rate": 10, "comm": 30000, "breakdown": [{"l": "تنظيف 80"}, {"l": "هيدرافيشل 30"}, {"l": "تقشير 60"}, {"l": "استشارة 40"}]}]};
    const s = this.state, list = s.m === 0 ? D.oct : D.sep;
    const tabs = ['تشرين الأول 2026 (حتى اليوم)', 'أيلول 2026'].map((l, i) => ({ label: l, pick: () => this.setState({ m: i }),
      style: 'height:40px;padding:0 18px;border-radius:20px;font-size:13.5px;font-weight:600;font-family:inherit;' + (s.m === i ? SELST : OFFST) }));
    const rows = list.map(r => Object.assign({}, r, { fat: !r.ex, sessions: r.sessions, revenue: fmt(r.revenue), comm: r.rate ? fmt(r.comm) : '—',
      rateLabel: r.rate ? r.rate + '%' : 'غير مفعّلة', rateStyle: r.rate ? 'font-family:Rubik,sans-serif;font-weight:600' : tagStyle('gray'),
      status: !r.rate ? '—' : (s.m === 0 ? 'قيد الاحتساب' : 'صُرفت مع الراتب'), stStyle: !r.rate ? 'color:#A595AC' : tagStyle(s.m === 0 ? 'amber' : 'green') }));
    const tc = list.reduce((a, r) => a + r.comm, 0), ts = list.reduce((a, r) => a + r.sessions, 0), tr = list.reduce((a, r) => a + r.revenue, 0);
    return { accent: A, tabs, rows, totalComm: fmt(tc), totalSessions: ts, totalRev: fmt(tr),
      monthLabel: s.m === 0 ? 'تشرين الأول حتى اليوم' : 'أيلول 2026',
      heroSub: s.m === 0 ? 'تقديرية — تُعتمد في نهاية الشهر' : 'مُعتمدة · صُرفت في 1 تشرين الأول',
      sessionsSub: s.m === 0 ? '11 يوم عمل حتى اليوم' : '26 يوم عمل',
      payText: s.m === 0 ? 'تُعتمد عمولات تشرين الأول بعد إغلاق الشهر وتُضاف إلى مسير رواتبه.' : 'صُرفت عمولات أيلول ضمن مسير رواتب أيلول يوم الخميس 1 تشرين الأول 2026.' };
  }
}
</script>
  */
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
