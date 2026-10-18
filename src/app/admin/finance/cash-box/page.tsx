"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, ICON_FILL, SH, SHB } from "@/lib/tokens";

/** W_CashBox.dc.html — الصندوق اليومي. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"counted": 7300, "closed": false}; }
  renderVals() {
    const A = this.props.accent ?? '#7B4687';

    const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const SELST = 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687';
    const OFFST = 'background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)';
    const TAGST = {pink:'background:#F3EAF6;color:#B03D6A', green:'background:#E6F4EC;color:#2E7D50', amber:'background:#FCF1DE;color:#8A5A12', gray:'background:#F0EDF0;color:#695D6B', plum:'background:#7B4687;color:#FFFFFF'};
    const tagStyle = k => 'display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;' + TAGST[k];
    const EXP = 7350;
    const s = this.state, d = s.counted - EXP;
    const st = d === 0 ? 'background:#E6F4EC;color:#2E6B47' : (d < 0 ? 'background:#F3EAF6;color:#B03D6A' : 'background:#FCF1DE;color:#8A5A12');
    return { accent: A, counted: fmt(s.counted), diff: (d > 0 ? '+' : d < 0 ? '−' : '') + fmt(Math.abs(d)),
      diffStyle: 'display:flex;align-items:center;justify-content:space-between;border-radius:16px;padding:10px 14px;' + st,
      diffHint: d === 0 ? 'الصندوق مطابق.' : (d < 0 ? 'عجز — يُطلب ذكر السبب عند الإغلاق ويُرسل تنبيه للإدارة.' : 'زيادة — تُسجَّل في تقرير الإغلاق.'),
      dec: () => this.setState({ counted: s.counted - 50 }), inc: () => this.setState({ counted: s.counted + 50 }),
      open: !s.closed, closed: s.closed, close: () => this.setState({ closed: true }) };
  }
}
</script>
  */
  return (
    <AdminShell active="المالية" title="الصندوق اليومي" subtitle="الثلاثاء 13 تشرين الأول · وردية الصباح منذ 10:00 · الآن 12:30" actions={<>
        <Link href={R.W_Cashier} style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
          <Icon name="receipt" color={C.accent} size={17} stroke={1.9} />
          الكاشير
        </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1, minWidth: "0" }}>
          <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, color: C.onDark }}>النقد المتوقع في الدرج</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1.25 }}>7,350</span>
                  <span>ل.س</span>
                </div>
                <div style={{ fontSize: 12, color: C.onDark }}>500 افتتاحي + 7,000 مقبوضات − 150 مصروف</div>
              </div>
              <div style={{ textAlign: "left", fontSize: 12, color: C.onDark, lineHeight: 1.6 }}>
                مدفوعات البطاقة
                <br />
                <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 18, color: C.white, fontWeight: 700 }}>10,500</span>
                {" ل.س"}
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: C.accent }}>ل خ</span>
                <div style={{ flex: 1, lineHeight: 1.45 }}>
                  <div style={{ fontSize: 15 }}>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>لينا خوري</span>
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>الاستقبال · وردية الصباح</div>
                </div>
                {open && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مفتوحة منذ 10:00</span>
                </>)}
                {closed && (<>
                  <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>أُغلقت 12:30</span>
                </>)}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ flex: 1, borderRadius: 18, padding: "12px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ fontSize: 12, color: C.sub2 }}>رصيد الافتتاح</div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>500</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 18, padding: "12px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ fontSize: 12, color: C.sub2 }}>مقبوضات نقدية</div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: C.ok }}>7,000</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 18, padding: "12px 14px", background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <div style={{ fontSize: 12, color: C.sub2 }}>مصروفات نثرية</div>
                  <div style={{ marginTop: 2 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 18, color: "#B07A1E" }}>150</span>
                      <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>عدّ النقد الفعلي</div>
                <span style={{ fontSize: 12, color: C.sub2 }}>اضغطي −/+ للتعديل بفئة 50</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={dec} aria-label="إنقاص" style={{ width: 46, height: 46, borderRadius: 23, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="minus" color={C.accent} size={18} />
                </button>
                <div style={{ flex: 1, height: 58, borderRadius: 20, border: "1.5px solid #E2CEE6", background: "#FEFCFE", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 28, fontWeight: 700 }}>{counted}</span>
                  <span style={{ fontSize: 13, color: C.sub2 }}>ل.س</span>
                </div>
                <button onClick={inc} aria-label="زيادة" style={{ width: 46, height: 46, borderRadius: 23, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="plus" color={C.accent} size={18} />
                </button>
              </div>
              <div style={diffStyle}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>الفرق عن المتوقع</span>
                <span>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 18, fontWeight: 700 }}>{diff}</span>
                  <span style={{ fontSize: 12 }}>ل.س</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{diffHint}</div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "14px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>توزيع مقبوضات اليوم</div>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ink }}>17,500</span>
                  <span style={{ fontSize: 11, color: C.sub2, marginInlineStart: 4 }}>ل.س</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                <div title="نقدي" style={{ flex: 7000, height: 12, borderRadius: 4, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }}></div>
                <div title="بطاقة" style={{ flex: 10500, height: 12, borderRadius: 4, background: "#DFD5E1" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.sub }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: C.accent }}></span>
                  نقدي 7,000 · 4 فواتير
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: "#DFD5E1" }}></span>
                  بطاقة 10,500 · 3 فواتير
                </span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
            {open && (<>
              <button onClick={close} style={{ height: 56, borderRadius: 28, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="lock" color={C.white} size={18} />
                إغلاق الوردية وتسليم الصندوق
              </button>
            </>)}
            {closed && (<>
              <div style={{ height: 56, borderRadius: 28, background: "#E6F4EC", color: "#2E6B47", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="check" color={C.ok} size={18} />
                أُغلقت الوردية — تقرير الإغلاق جاهز للطباعة
              </div>
            </>)}
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative", flex: 1.25, minWidth: "0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>حركات الصندوق اليوم</div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>9 حركة</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="lock" color={C.accentMid} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>10:00</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    فتح الصندوق
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · لينا خوري"}
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>رصيد افتتاحي</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ink }}>+500</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: "#F0EDF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="card" color={"#8A7A84"} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>10:45</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-01</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>لمى حداد</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>جلسة ليزر · بطاقة (خارج الدرج)</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.muted }}>3,500</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="cash" color={C.accentMid} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>11:00</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-02</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>ريم سالم</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>تنظيف عميق للبشرة</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ok }}>+1,500</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="cash" color={C.accentMid} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>11:00</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-03</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>نور الأحمد</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>تقشير البشرة</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ok }}>+2,000</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: "#F0EDF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="card" color={"#8A7A84"} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>11:30</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-04</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>سارة يوسف</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>جلسة ليزر · بطاقة (خارج الدرج)</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.muted }}>3,500</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: "#FCF1DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="minus" color={"#B07A1E"} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>11:40</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    مصروف نثري
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · لينا خوري"}
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>مستلزمات ضيافة · مع إيصال</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: "#B07A1E" }}>−150</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="cash" color={C.accentMid} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>12:00</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-05</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>رنا خليل</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>هيدرافيشل</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ok }}>+2,000</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ position: "absolute", right: 15, top: 47, bottom: -23, width: 2, background: "#EEE2F0" }}></div>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: "#F0EDF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="card" color={"#8A7A84"} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>12:15</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-06</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>ميس عيسى</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>جلسة ليزر · بطاقة (خارج الدرج)</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.muted }}>3,500</div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <Icon name="cash" color={C.accentMid} size={15} />
                </span>
                <div style={{ width: 46 }}>
                  <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: C.sub2, whiteSpace: "nowrap" }}>12:30</span>
                </div>
                <div style={{ flex: 1, minWidth: "0", lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.ink, whiteSpace: "nowrap" }}>INV-1013-07</span>
                    <span style={{ fontWeight: 400, color: C.sub2, fontSize: 12.5 }}>
                      {" · "}
                      <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>ديما شاهين</span>
                      <ExampleTag />
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>تنظيف عميق للبشرة</div>
                </div>
                <div dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 14, color: C.ok }}>+1,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
