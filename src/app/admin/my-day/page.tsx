"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { ExampleTag, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, ICON_FILL, SH } from "@/lib/tokens";

/** W_MyDay.dc.html — جدولي. */
export default function Page() {
  /* DESIGN LOGIC:
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { called: false }; }

  cs(on, h) { h = h || 38;
    return 'height:' + h + 'px;padding:0 14px;border-radius:' + (h/2) + 'px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;font-family:inherit;cursor:pointer;' +
      (on ? 'background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687'
          : 'background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)'); }
  tg(on) { return 'width:52px;height:30px;border-radius:15px;padding:3px;box-sizing:border-box;flex-shrink:0;border:none;cursor:pointer;display:flex;justify-content:' + (on ? 'flex-end' : 'flex-start') + ';background:' +
      (on ? 'linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)' : '#E6DDE8'); }
  renderVals() {
    const s = this.state;
    return { accent: this.props.accent ?? '#7B4687', idle: !s.called, called: s.called, call: () => this.setState({ called: true }), recall: () => this.setState({ called: true }) };
  }
}
</script>
  */
  return (
    <AdminShell active="جدولي" title="جدولي" subtitle="فاطمة طيبة · أخصائية عناية بالبشرة · الآن 12:30" actions={<>
        <Link href={R.W_CarePlans} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
          <Icon name="clip" color={C.accent} size={16} stroke={1.9} />
          خطط العناية
        </Link>
    </>}>
      <div style={{ display: "flex", gap: 18, flexGrow: 1, minHeight: "0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", flex: 1.15, minWidth: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 64, height: 64, borderRadius: 32, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>الثلاثاء 13 تشرين الأول 2026</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>نهاركِ سعيد يا فاطمة</div>
              <div style={{ fontSize: 13, color: C.sub }}>8 مواعيد اليوم في غرفة 1 · 2 انتهت · 5 متبقية</div>
            </div>
          </div>
          <div style={{ borderRadius: 30, padding: "22px 24px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }}></div>
            <svg width="200" height="200" viewbox="0 0 200 200" style={{ position: "absolute", top: -60, left: -50 }}>
              <circle cx="100" cy="100" r="98" fill="none" stroke="#7C5485" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#7C5485" />
            </svg>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>الجلسة الحالية · غرفة 1 · الرقم 9</div>
              <span style={{ height: 26, padding: "0 12px", borderRadius: 13, background: "rgba(255,255,255,0.16)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: "#E8D6F0" }}></span>
                جارية منذ 30 دقيقة
              </span>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
              <span style={{ width: 58, height: 58, borderRadius: 29, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>ج ا</span>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  جود الحلبي
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 14, color: C.onDark }}>تنظيف عميق للبشرة · ملف 1056 · حساسية: العطور</div>
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "50%", height: 8, borderRadius: 4, background: "linear-gradient(90deg, #E8D6F0, #FFFFFF)" }}></div>
                </div>
              </div>
              <span dir="ltr" style={{ fontSize: 13, fontFamily: "Rubik, sans-serif", unicodeBidi: "isolate" }}>12:00 – 13:00</span>
            </div>
            <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 18 }}>
              <Link href={R.W_SessionNote} style={{ flex: 1, height: 46, borderRadius: 23, background: "linear-gradient(145deg,#FFFFFF,#E8D0ED)", color: C.accent, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 18px rgba(0,0,0,0.18)" }}>
                <Icon name="edit" color={C.accent} size={17} />
                كتابة الملاحظة
              </Link>
              <Link href={R.W_Record} style={{ flex: 1, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: C.white, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="file" color={C.white} size={17} />
                فتح الملف
              </Link>
              <Link href={R.W_Prescription} style={{ flex: 1, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: C.white, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="pill" color={C.white} size={17} />
                وصفة
              </Link>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 64, height: 64, borderRadius: 22, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, fontFamily: "Rubik, sans-serif" }}>12</span>
              <div style={{ flex: 1, lineHeight: 1.4 }}>
                <div style={{ fontSize: 12.5, color: C.sub2 }}>المراجعة التالية · 13:00</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  روان قاسم
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 13, color: C.sub }}>هيدرافيشل · غرفة 1</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>في الانتظار</span>
                <span style={{ fontSize: 12, color: C.sub2 }}>وصلت 12:20</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {idle && (<>
                <button onClick={call} style={{ flex: 1, height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="speaker" color={C.accent} size={18} />
                  استدعاء التالي (12)
                </button>
              </>)}
              {called && (<>
                <div style={{ flex: 1, height: 46, borderRadius: 23, background: "#EEF8F1", color: C.okDeep, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="check" color={C.ok} size={18} stroke={2.2} />
                  تم النداء على الرقم 12 إلى غرفة 1
                </div>
                <button onClick={recall} style={{ height: 46, padding: "0 16px", borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="refresh" color={C.accent} size={16} />
                  إعادة النداء
                </button>
              </>)}
              <Link href={R.W_Record} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="file" color={C.accent} size={16} stroke={1.9} />
                فتح ملفها
              </Link>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>قبل دخول المراجعة 12</div>
              </div>
              <Link href={R.W_Record} style={{ height: 32, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 14px", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(123,70,135,0.07)" }}>
                <Icon name="history" color={C.accent} size={16} stroke={1.9} />
                السجل
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid #EDE2F1", marginTop: 8 }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="gift" color={C.accentMid} size={14} />
              </span>
              <span style={{ width: 110, fontSize: 12.5, color: C.sub2 }}>الباقة</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>هيدرافيشل · هذه الجلسة 6 من 6 (الأخيرة)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid #EDE2F1", marginTop: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="history" color={C.accentMid} size={14} />
              </span>
              <span style={{ width: 110, fontSize: 12.5, color: C.sub2 }}>آخر جلسة</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>الثلاثاء 15 أيلول · ترطيب جيد، جفاف خفيف حول الفم</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid #EDE2F1", marginTop: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sign" color={C.accentMid} size={14} />
              </span>
              <span style={{ width: 110, fontSize: 12.5, color: C.sub2 }}>الموافقة</span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>بانتظار توقيعها على التطبيق</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>انتهت</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>2</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>جلسات اليوم</div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>متبقية</div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clock" color={C.accentMid} size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: C.ink }}>5</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>آخرها 17:00</div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>جدولي اليوم</div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: C.danger }}>8 مواعيد</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.muted }}>10:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={13} stroke={2.4} />
                </span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 0.7 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    ريم سالم
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تنظيف عميق للبشرة · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>انتهت</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.muted }}>11:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color={C.white} size={13} stroke={2.4} />
                </span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 0.7 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    رنا خليل
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>هيدرافيشل · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>انتهت</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>12:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #A877B6", boxShadow: "0 0 0 5px rgba(150,100,170,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accentMid }}></span>
                </span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    جود الحلبي
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تنظيف عميق للبشرة · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: C.accent, color: C.white }}>في الجلسة</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>13:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #EADCF0" }}></span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    روان قاسم
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>هيدرافيشل · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>في الانتظار</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>14:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #EADCF0" }}></span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    غنى صباغ
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تنظيف عميق للبشرة · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>15:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #EADCF0" }}></span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    نغم إبراهيم
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تقشير البشرة · 45 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>16:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #EADCF0" }}></span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    رهف زين
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>هيدرافيشل · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>بانتظار التأكيد</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 18 }}>
                <span style={{ width: 46, fontSize: 13, fontWeight: 700, fontFamily: "Rubik, sans-serif", color: C.ink }}>17:00</span>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, border: "2px solid #EADCF0" }}></span>
                <div style={{ flex: 1, lineHeight: 1.35, minWidth: "0", opacity: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    كندة سعيد
                    <ExampleTag />
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تنظيف عميق للبشرة · 60 د</div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep }}>مؤكد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
