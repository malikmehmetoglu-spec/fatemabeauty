"use client";

import { Fragment } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_Invoices.dc.html — الفواتير. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"f": 0}; }
  renderVals() {
    const A = this.props.accent ?? '#7B4687';

    const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const SELST = 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687';
    const OFFST = 'background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)';
    const TAGST = {pink:'background:#F3EAF6;color:#B03D6A', green:'background:#E6F4EC;color:#2E7D50', amber:'background:#FCF1DE;color:#8A5A12', gray:'background:#F0EDF0;color:#695D6B', plum:'background:#7B4687;color:#FFFFFF'};
    const tagStyle = k => 'display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;' + TAGST[k];
    const ALL = [{"inv": "INV-1013-01", "time": "10:45", "name": "لمى حداد", "service": "جلسة ليزر", "sp": "ريم الحسن", "method": "بطاقة", "amount": 3500, "ini": "ل ح", "ex": true}, {"inv": "INV-1013-02", "time": "11:00", "name": "ريم سالم", "service": "تنظيف عميق للبشرة", "sp": "فاطمة طيبة", "method": "نقدي", "amount": 1500, "ini": "ر س", "ex": false}, {"inv": "INV-1013-03", "time": "11:00", "name": "نور الأحمد", "service": "تقشير البشرة", "sp": "هبة العلي", "method": "نقدي", "amount": 2000, "ini": "ن ا", "ex": true}, {"inv": "INV-1013-04", "time": "11:30", "name": "سارة يوسف", "service": "جلسة ليزر", "sp": "ريم الحسن", "method": "بطاقة", "amount": 3500, "ini": "س ي", "ex": true}, {"inv": "INV-1013-05", "time": "12:00", "name": "رنا خليل", "service": "هيدرافيشل", "sp": "فاطمة طيبة", "method": "نقدي", "amount": 2000, "ini": "ر خ", "ex": false}, {"inv": "INV-1013-06", "time": "12:15", "name": "ميس عيسى", "service": "جلسة ليزر", "sp": "ريم الحسن", "method": "بطاقة", "amount": 3500, "ini": "م ع", "ex": true}, {"inv": "INV-1013-07", "time": "12:30", "name": "ديما شاهين", "service": "تنظيف عميق للبشرة", "sp": "هبة العلي", "method": "نقدي", "amount": 1500, "ini": "د ش", "ex": true}];
    const F = ['الكل', 'نقدي', 'بطاقة'];
    const chips = F.map((f, i) => ({ label: f + ' (' + (i === 0 ? ALL.length : ALL.filter(r => r.method === f).length) + ')', pick: () => this.setState({ f: i }),
      style: 'height:40px;padding:0 16px;border-radius:20px;font-size:13px;font-weight:600;font-family:inherit;' + (this.state.f === i ? SELST : OFFST) }));
    const list = ALL.filter(r => this.state.f === 0 || r.method === F[this.state.f]);
    const rows = list.map(r => Object.assign({}, r, { amount: fmt(r.amount), mstyle: tagStyle(r.method === 'نقدي' ? 'pink' : 'gray') }));
    const sum = list.reduce((a, r) => a + r.amount, 0);
    return { accent: A, chips, rows, total: fmt(sum), countLabel: list.length + ' فواتير' };
  }
}
</script>
  */
  return (
    <AdminShell active="المالية" title="الفواتير" subtitle="الثلاثاء 13 تشرين الأول · آخر تحديث 12:30" actions={<>
        <Link href={R.W_Cashier} style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
          <Icon name="plus" color={C.white} size={17} stroke={1.9} />
          فاتورة جديدة
        </Link>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>فواتير اليوم</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="receipt" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>7</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>من 8 مواعيد حتى الآن</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>نقدي</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="cash" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>
              {"7,000 "}
              <span style={{ fontSize: 14 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>4 فواتير · في الصندوق</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>بطاقة</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="card" color={C.accentMid} size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>
              {"10,500 "}
              <span style={{ fontSize: 14 }}>ل.س</span>
            </div>
            <div style={{ fontSize: 12, color: C.sub2 }}>3 فواتير</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>إجمالي المقبوض</div>
              <Icon name="wallet" color={"#E8D6F0"} size={20} />
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>
              {"17,500 "}
              <span style={{ fontSize: 15 }}>ل.س</span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>المتوقع لنهاية اليوم 58,000 ل.س</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {chips.map((c, i) => (<Fragment key={i}>
              <button onClick={c.pick} style={c.style}>{c.label}</button>
            </Fragment>))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
              <Icon name="cal" color={C.accent} size={17} stroke={1.9} />
              اليوم · 13 تشرين الأول
            </button>
            <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
              <Icon name="filter" color={C.accent} size={17} stroke={1.9} />
              كل الأخصائيات
            </button>
            <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
              <Icon name="download" color={C.accent} size={17} stroke={1.9} />
              تصدير
            </button>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "8px 20px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
            <div style={{ flex: 1.3, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>رقم الفاتورة</div>
            <div style={{ flex: 0.8, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الوقت</div>
            <div style={{ flex: 1.7, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المراجعة</div>
            <div style={{ flex: 1.6, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الخدمة</div>
            <div style={{ flex: 1.3, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الأخصائية</div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الدفع</div>
            <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>المبلغ</div>
            <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>الحالة</div>
            <div style={{ flex: 0.5, minWidth: "0", fontSize: 12, color: C.sub2, fontWeight: 600 }}></div>
          </div>
          {rows.map((r, i) => (<Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 52, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, fontWeight: 500 }}>{r.inv}</span>
              </div>
              <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.sub }}>{r.time}</span>
              </div>
              <div style={{ flex: 1.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>{r.ini}</span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{r.name}</span>
                <ExampleTag />
              </div>
              <div style={{ flex: 1.6, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>{r.service}</div>
              <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: C.sub, whiteSpace: "nowrap" }}>{r.sp}</span>
                {r.ex && (<>
                  <ExampleTag />
                </>)}
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={r.mstyle}>{r.method}</span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700 }}>{r.amount}</span>
                <span style={{ fontSize: 11, color: C.sub2 }}>ل.س</span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مدفوعة</span>
              </div>
              <div style={{ flex: 0.5, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <Link href={R.W_Cashier} aria-label="عرض الفاتورة" style={{ width: 32, height: 32, borderRadius: 16, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="eye" color={C.accent} size={16} />
                </Link>
              </div>
            </div>
          </Fragment>))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 54, margin: "4px -12px 0", padding: "0 12px", borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#F2E4F5)" }}>
            <div style={{ flex: 1.3, fontWeight: 700, fontSize: 14 }}>الإجمالي</div>
            <div style={{ flex: 0.8 }}></div>
            <div style={{ flex: 1.7, fontSize: 13, color: C.sub }}>{countLabel}</div>
            <div style={{ flex: 1.6 }}></div>
            <div style={{ flex: 1.3 }}></div>
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 1.1, display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 16, color: C.accent }}>{total}</span>
              <span style={{ fontSize: 11, color: C.sub2 }}>ل.س</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <div style={{ flex: 0.5 }}></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: C.tint, color: "#74457F" }}>
          <Icon name="info" color={C.accentMid} size={17} />
          <span>
            موعد واحد بدون فاتورة: استشارة في المركز الساعة 11:00 — هالة منصور
            <ExampleTag />
            {" (لم تحضر). الاستشارة في المركز مجانية."}
          </span>
        </div>
      </div>
    </AdminShell>
  );
}
