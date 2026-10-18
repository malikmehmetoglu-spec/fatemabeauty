"use client";

import { Fragment } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SHB, SH_SOFT } from "@/lib/tokens";

/** W_Cashier.dc.html — الكاشير. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"disc": 0, "method": 0, "split": false, "issued": false}; }
  renderVals() {
    const A = this.props.accent ?? '#7B4687';

    const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const SELST = 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687';
    const OFFST = 'background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)';
    const TAGST = {pink:'background:#F3EAF6;color:#B03D6A', green:'background:#E6F4EC;color:#2E7D50', amber:'background:#FCF1DE;color:#8A5A12', gray:'background:#F0EDF0;color:#695D6B', plum:'background:#7B4687;color:#FFFFFF'};
    const tagStyle = k => 'display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;' + TAGST[k];

    const s = this.state, sub = 1500;
    const pcts = [0, 5, 10, 15];
    const discs = pcts.map((p, i) => ({ label: p === 0 ? 'بدون خصم' : p + '%', pick: () => this.setState({ disc: i }),
      style: 'height:38px;padding:0 16px;border-radius:19px;font-size:13px;font-weight:600;font-family:inherit;' + (s.disc === i ? SELST : OFFST) }));
    const pct = pcts[s.disc], dAmt = Math.round(sub * pct / 100), total = sub - dAmt;
    const names = ['نقدي', 'بطاقة', 'رصيد باقة', 'نقاط الولاء'];
    let amounts = [0, 0, 0, 0];
    if (s.split) { const half = Math.round(total / 2 / 50) * 50; amounts[0] = half; amounts[1] = total - half; }
    else amounts[s.method] = total;
    const methods = names.map((n, i) => {
      const on = amounts[i] > 0;
      return { label: n, amount: on ? fmt(amounts[i]) : '—', pick: () => this.setState({ method: i, split: false }),
        style: 'width:calc(50% - 5px);box-sizing:border-box;height:46px;border-radius:23px;padding:0 14px;display:flex;align-items:center;gap:10px;font-family:inherit;color:#35213D;' + (on ? SELST : OFFST),
        dot: 'width:14px;height:14px;border-radius:7px;flex-shrink:0;box-sizing:border-box;' + (on ? 'background:#7B4687;border:3px solid #F1E3F6;box-shadow:0 0 0 1.5px #7B4687' : 'border:1.5px solid #D1C0D5;background:#FFFFFF') };
    });
    const payLabel = s.split ? 'نقدي + بطاقة' : names[s.method];
    return { accent: A, discs, subtotal: fmt(sub), discPct: pct, discAmt: fmt(dAmt), total: fmt(total), methods,
      needApproval: pct > 10, okNote: pct <= 10, toggleSplit: () => this.setState({ split: !s.split }),
      splitLabel: s.split ? 'دفع بطريقة واحدة' : 'تقسيم الدفع', splitHint: s.split ? 'قُسِّم المبلغ مناصفة بين النقدي والبطاقة — يمكن تعديل الحصص.' : 'اختاري طريقة واحدة أو قسّمي المبلغ بين طريقتين.',
      issue: () => { if (pct <= 10) this.setState({ issued: true }); }, issueLabel: pct > 10 ? 'بانتظار موافقة الإدارة' : 'إصدار الفاتورة',
      issued: s.issued, payLabel, reset: () => this.setState({ issued: false, disc: 0, method: 0, split: false }) };
  }
}
</script>
  */
  return (
    <AdminShell active="المالية" title="الكاشير" subtitle="الثلاثاء 13 تشرين الأول · 12:30 · الصندوق مفتوح منذ 10:00" actions={<>
        <Link href={R.W_CashBox} style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="cash" color={C.accent} size={17} stroke={1.9} />
          الصندوق اليومي
        </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", width: 310, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>جلسات بانتظار الدفع</div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>1 جاهزة</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 20, padding: 12, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.accent }}>د ش</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.5 }}>
                  <div style={{ fontSize: 14.5, whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>ديما شاهين</span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: "#795481", whiteSpace: "nowrap" }}>
                    {"تنظيف عميق · انتهت "}
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12, color: "#795481", whiteSpace: "nowrap" }}>12:30</span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: C.accent, color: C.white }}>جاهزة</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.sub2, padding: "4px 4px 0" }}>في الجلسة الآن</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 20, padding: "10px 12px", background: C.white, border: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ج ا</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.5 }}>
                  <div style={{ fontSize: 13.5, whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>جود الحلبي</span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>
                    {"تنظيف عميق · تنتهي "}
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>13:00</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 20, padding: "10px 12px", background: C.white, border: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ت ن</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.5 }}>
                  <div style={{ fontSize: 13.5, whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>تالا ناصر</span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>
                    {"ليزر · تنتهي "}
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>13:00</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 20, padding: "10px 12px", background: C.white, border: "1px solid #EDE2F1" }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.accent }}>ل ع</span>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.5 }}>
                  <div style={{ fontSize: 13.5, whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>لين عبود</span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>
                    {"تقشير · تنتهي "}
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>13:15</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.muted, padding: "2px 4px" }}>تظهر الجلسة هنا تلقائياً عند انتهائها.</div>
            </div>
            <div style={{ marginTop: "auto", borderTop: "1px solid #EDE2F1", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: C.sub2 }}>
              <span>صدرت اليوم 6 فواتير</span>
              <Link href={R.W_Invoices} style={{ color: C.accentMid, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                {"كل الفواتير "}
                <Icon name="chev" color={C.accentMid} size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 54, height: 54, borderRadius: 27, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: C.accent }}>د ش</span>
              <div style={{ flex: 1, lineHeight: 1.5 }}>
                <div style={{ fontSize: 18 }}>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>ديما شاهين</span>
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>
                  {"ملف "}
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>1042</span>
                  {" · غرفة 2 · هبة العلي"}
                  <ExampleTag />
                </div>
              </div>
              <div style={{ textAlign: "left", lineHeight: 1.5 }}>
                <div style={{ fontSize: 12, color: C.sub2 }}>رقم الفاتورة</div>
                <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 14, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-07</span>
              </div>
            </div>
            <div style={{ height: 1, background: C.line }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", gap: 10, fontSize: 12, color: C.sub2, padding: "0 4px 6px", borderBottom: "1px solid #EDE2F1" }}>
                <div style={{ flex: 3 }}>البند</div>
                <div style={{ flex: 1, textAlign: "center" }}>الكمية</div>
                <div style={{ flex: 1.3, textAlign: "left" }}>السعر</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 4px", borderBottom: "1px solid #EDE2F1" }}>
                <div style={{ flex: 3, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="sparkle" color={C.accentMid} size={16} />
                  </span>
                  <div style={{ lineHeight: 1.4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>تنظيف عميق للبشرة</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>
                      {"جلسة "}
                      <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>11:30</span>
                      {" · 60 دقيقة"}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: "center", fontFamily: "Rubik, sans-serif" }}>1</div>
                <div style={{ flex: 1.3, textAlign: "left" }}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: C.ink }}>1,500</span>
                    <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
              <label htmlFor="prod" style={{ flex: 1, height: 44, borderRadius: 22, border: "1.5px dashed #DFCBE3", background: "#FEFCFE", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", color: C.muted, fontSize: 13 }}>
                <Icon name="search" color={C.muted} size={17} />
                <input id="prod" aria-label="إضافة منتج" placeholder="أضيفي منتجاً من المتجر (ماسك، واقي شمس...)" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13, color: C.ink }} />
              </label>
              <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
                <Icon name="plus" color={C.accent} size={17} stroke={1.9} />
                إضافة منتج
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الخصم</div>
                <span style={{ fontSize: 12, color: C.sub2 }}>الصلاحية الحالية: الاستقبال حتى 10%</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {discs.map((d, i) => (<Fragment key={i}>
                  <button onClick={d.pick} style={d.style}>{d.label}</button>
                </Fragment>))}
              </div>
              {needApproval && (<>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, borderRadius: 16, padding: "10px 12px", background: "#FCF1DE", color: "#7A4F10", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="lock" color={"#B07A1E"} size={18} />
                  <span style={{ flex: 1 }}>
                    الخصم فوق 10% يحتاج موافقة الإدارة — سيُرسل طلب موافقة إلى فاطمة طيبة قبل إصدار الفاتورة.
                  </span>
                  <span style={{ height: 30, padding: "0 12px", borderRadius: 15, background: C.white, display: "flex", alignItems: "center", color: "#8A5A12" }}>بانتظار الموافقة</span>
                </div>
              </>)}
              {okNote && (<>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", background: C.tint, color: "#74457F", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="info" color={C.accentMid} size={17} />
                  <span>الخصم فوق 10% يحتاج موافقة الإدارة. حتى 10% يُطبَّق مباشرة.</span>
                </div>
              </>)}
            </div>
            <div style={{ height: 1, background: C.line }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>طريقة الدفع</div>
                <button onClick={toggleSplit} style={{ border: "none", background: "none", color: C.accentMid, fontSize: 13, fontWeight: 700 }}>{splitLabel}</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {methods.map((p, i) => (<Fragment key={i}>
                  <button onClick={p.pick} style={p.style}>
                    <span style={p.dot}></span>
                    <span style={{ flex: 1, textAlign: "right", fontSize: 14, fontWeight: 700 }}>{p.label}</span>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 14, fontWeight: 700 }}>{p.amount}</span>
                  </button>
                </Fragment>))}
              </div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{splitHint}</div>
            </div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.sub2 }}>
                ملاحظة على الفاتورة (اختياري)
                <textarea aria-label="ملاحظة على الفاتورة" rows="2" placeholder="تظهر في نسخة المراجعة" style={{ borderRadius: 16, border: "1px solid #E7D9EB", background: "#FEFCFE", padding: "10px 12px", fontSize: 13, color: C.ink, resize: "none", outline: "none" }} />
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.sub2 }}>
                <Icon name="shield" color={C.accentMid} size={16} />
                <span>
                  تُسجَّل باسم لينا خوري
                  <ExampleTag />
                  {" وتظهر في الصندوق اليومي."}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", width: 310, flexShrink: 0 }}>
          <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontSize: 13, color: C.onDark }}>
              <span>المجموع الفرعي</span>
              <span style={{ fontFamily: "Rubik, sans-serif" }}>{subtotal}{" ل.س"}</span>
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontSize: 13, color: C.onDark, marginTop: 6 }}>
              <span>الخصم ({discPct}%)</span>
              <span style={{ fontFamily: "Rubik, sans-serif" }}>{"− "}{discAmt}{" ل.س"}</span>
            </div>
            <div style={{ position: "relative", height: 1, background: "rgba(255,255,255,0.18)", margin: "12px 0" }}></div>
            <div style={{ position: "relative", fontSize: 13, color: C.onDark }}>المطلوب</div>
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>{total}</span>
              <span style={{ fontSize: 15 }}>ل.س</span>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>ملخص الفاتورة</div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>رقم الفاتورة</span>
                  <span style={{ fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-07</span>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>التاريخ</span>
                  <span style={{ fontWeight: 700 }}>الثلاثاء 13 تشرين الأول · 12:30</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>الخدمة</span>
                  <span style={{ fontWeight: 700 }}>تنظيف عميق للبشرة</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>الأخصائية</span>
                  <span style={{ fontWeight: 700 }}>
                    هبة العلي
                    <ExampleTag />
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>طريقة الدفع</span>
                  <span style={{ fontWeight: 700 }}>{payLabel}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 36, borderTop: "1px solid #EDE2F1", fontSize: 13 }}>
                  <span style={{ color: C.sub2 }}>الخصم</span>
                  <span style={{ fontWeight: 700 }}>{discPct}%</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 22, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="receipt" color={C.accentMid} size={16} />
              </span>
              <div style={{ flex: 1, lineHeight: 1.45 }}>
                <div style={{ fontSize: 12, color: C.sub2 }}>
                  {"الفاتورة السابقة · "}
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>INV-1013-06</span>
                  {" · 12:15"}
                </div>
                <div style={{ fontSize: 13.5 }}>
                  <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>ميس عيسى</span>
                  <ExampleTag />
                </div>
              </div>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13, color: C.ink }}>3,500</span>
                <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
              </span>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={issue} style={{ height: 58, borderRadius: 29, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="receipt" color={C.white} size={19} />
              {issueLabel}
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                <Icon name="print" color={C.accent} size={17} stroke={1.9} />
                طباعة
              </button>
              <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                <Icon name="send" color={C.accent} size={17} stroke={1.9} />
                إرسال واتساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
