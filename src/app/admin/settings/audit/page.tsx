"use client";

/** W_Audit.dc.html — سجل التدقيق. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO, LOGO } from "@/lib/tokens";
import { css, fmt } from "@/app/admin/_h/css";

export default function Page() {
  // LOGIC
  return (
    <AdminShell
      active="الإعدادات"
      title="سجل التدقيق"
      subtitle="من فعل ماذا ومتى — للمديرة العامة فقط"
      actions={
        <>
          <button type="button" style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
            </svg>
            تصدير PDF
          </button>
          <button type="button" style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
            </svg>
            تصدير Excel
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ borderRadius: 22, padding: "12px 18px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
          <span style={{ position: "relative", width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
            </svg>
          </span>
          <div style={{ position: "relative", lineHeight: "1.45" }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>سجل دائم لا يمكن تعديله أو حذفه</div>
            <div style={{ fontSize: 12.5, color: C.onDark }}>كل فتح ملف، تعديل فاتورة، خصم أو حذف يُسجَّل باسم منفذته ووقته وتفاصيله</div>
          </div>
          <span style={{ position: "relative", marginInlineStart: "auto", fontSize: 13, color: C.onDark }}>الثلاثاء 13 تشرين الأول · 11 حركة حتى 12:30</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {v.filters.map((f, fI) => (
            <Fragment key={fI}>
              <button type="button" onClick={f.pick} style={css(f.style)}>{f.name}</button>
            </Fragment>
          ))}
          <span style={{ marginInlineStart: "auto", height: 36, padding: "0 14px", borderRadius: 18, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.accent, boxSizing: "content-box" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9" />
            </svg>
            كل الموظفات
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          <span style={{ height: 36, padding: "0 14px", borderRadius: 18, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: C.accent, boxSizing: "content-box" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16" />
            </svg>
            اليوم
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        <div style={{ borderRadius: 26, padding: "4px 22px 6px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40, fontSize: 12, color: C.sub2, fontWeight: 600 }}>
            <div style={{ width: 56 }}>الوقت</div>
            <div style={{ flex: 1.5 }}>المستخدمة</div>
            <div style={{ flex: 0.8 }}>النوع</div>
            <div style={{ flex: 1.2 }}>الإجراء</div>
            <div style={{ flex: 2 }}>التفاصيل</div>
            <div style={{ flex: 0.9 }}>المصدر</div>
          </div>
          {v.rows.map((r, rI) => (
            <Fragment key={rI}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 48, borderTop: "1px solid #EDE2F1", boxSizing: "content-box" }}>
                <div style={{ width: 56, fontFamily: "Rubik, sans-serif", fontSize: 13, color: C.sub }}>{r.t}</div>
                <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  {r.fat && (
                    <>
                      <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 30, height: 30, borderRadius: 15, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                    </>
                  )}
                  {r.nf && (
                    <>
                      <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>{r.ini}</span>
                    </>
                  )}
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{r.u}</span>
                      {r.nf && (
                        <>
                          <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.sub2 }}>{r.role}</div>
                  </div>
                </div>
                <div style={{ flex: 0.8 }}>
                  <span style={css(r.kst)}>{r.kl}</span>
                </div>
                <div style={{ flex: 1.2, fontSize: 13.5, fontWeight: 700 }}>{r.a}</div>
                <div style={{ flex: 2, fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.d}</div>
                <div style={{ flex: 0.9, fontSize: 12, color: C.sub2, display: "flex", alignItems: "center", gap: 6 }}>{r.src}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

/* SCRIPT
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"f": 0}; }

  tg(on) {
    return 'width:52px;height:30px;border-radius:15px;padding:3px;box-sizing:border-box;border:none;flex-shrink:0;display:flex;justify-content:' + (on ? 'flex-end' : 'flex-start') +
      ';background:' + (on ? 'linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 14px rgba(123,70,135,0.30)' : '#E6DDE8');
  }
  ch(on, h) {
    h = h || 36;
    return 'height:' + h + 'px;padding:0 14px;border-radius:' + (h / 2) + 'px;font-family:inherit;font-size:13px;font-weight:600;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid ' + (on ? '#FFFFFF' : '#EADCF0') +
      ';background:' + (on ? 'linear-gradient(160deg,#F1E3F6,#D9BCE5)' : '#FFFFFF') + ';color:' + (on ? '#7B4687' : '#866F8D') +
      ';box-shadow:' + (on ? '0 6px 14px rgba(150,100,170,0.25)' : '0 3px 10px rgba(123,70,135,0.05)');
  }
  fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }


  renderVals() {
    const s = this.state; const v = { accent: this.props.accent ?? '#7B4687' };

    const R = [{"t": "12:29", "u": "فاطمة طيبة", "ini": "ف ط", "fat": true, "role": "الأخصائية", "k": "file", "kl": "فتح ملف", "a": "فتح ملف 1056", "d": "جلسة تنظيف عميق للبشرة · غرفة 1", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#7B4687;color:#FFFFFF"}, {"t": "12:27", "u": "لينا خوري", "ini": "ل خ", "fat": false, "role": "الاستقبال", "k": "queue", "kl": "الحضور", "a": "تسجيل وصول", "d": "ملف 1077 · رقم الدور 12", "src": "تابلت الاستقبال", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F0EDF0;color:#695D6B"}, {"t": "12:22", "u": "هبة العلي", "ini": "ه ا", "fat": false, "role": "الأخصائية", "k": "file", "kl": "فتح ملف", "a": "فتح ملف 1070", "d": "جلسة تقشير البشرة · غرفة 2", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#7B4687;color:#FFFFFF"}, {"t": "12:18", "u": "سلمى حداد", "ini": "س ح", "fat": false, "role": "المحاسبة", "k": "invoice", "kl": "فاتورة", "a": "تعديل فاتورة", "d": "ملف 1049 · طريقة الدفع من نقد إلى بطاقة", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#FCF1DE;color:#8A5A12"}, {"t": "11:58", "u": "فاطمة طيبة", "ini": "ف ط", "fat": true, "role": "الأخصائية", "k": "file", "kl": "فتح ملف", "a": "فتح ملف 1024", "d": "مراجعة خطة العناية · الجلسة 3 من 6", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#7B4687;color:#FFFFFF"}, {"t": "11:41", "u": "ريم الحسن", "ini": "ر ا", "fat": false, "role": "الأخصائية", "k": "file", "kl": "فتح ملف", "a": "فتح ملف 1049", "d": "جلسة ليزر · غرفة 3", "src": "تابلت الغرفة", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#7B4687;color:#FFFFFF"}, {"t": "11:32", "u": "فاطمة طيبة", "ini": "ف ط", "fat": true, "role": "الأخصائية", "k": "export", "kl": "تصدير", "a": "تصدير صورة قبل/بعد", "d": "ملف 1000 · بموافقة تصوير موثقة", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F3EAF6;color:#B03D6A"}, {"t": "11:20", "u": "لينا خوري", "ini": "ل خ", "fat": false, "role": "الاستقبال", "k": "discount", "kl": "خصم", "a": "خصم", "d": "100 ل.س باستبدال 100 نقطة · ملف 1070", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F3EAF6;color:#B03D6A"}, {"t": "11:16", "u": "لينا خوري", "ini": "ل خ", "fat": false, "role": "الاستقبال", "k": "queue", "kl": "الحضور", "a": "تسجيل غياب", "d": "ملف 1035 · موعد 11:00", "src": "تابلت الاستقبال", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F0EDF0;color:#695D6B"}, {"t": "10:52", "u": "سلمى حداد", "ini": "س ح", "fat": false, "role": "المحاسبة", "k": "delete", "kl": "حذف", "a": "حذف بند يدوي", "d": "فاتورة ملف 1007 · بند مكرر", "src": "لوحة الويب", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F3EAF6;color:#B03D6A"}, {"t": "10:31", "u": "ريم الحسن", "ini": "ر ا", "fat": false, "role": "الأخصائية", "k": "settings", "kl": "إعدادات", "a": "تعديل إعداد جهاز", "d": "جهاز الليزر · غرفة 3", "src": "تابلت الغرفة", "kst": "display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;background:#F0EDF0;color:#695D6B"}];
    const F = [['الكل', null], ['فتح ملف', ['file']], ['الفواتير والخصومات', ['invoice', 'discount']], ['الحذف والتصدير', ['delete', 'export']], ['الحضور', ['queue']], ['الإعدادات', ['settings']]];
    v.filters = F.map((f, i) => ({ name: f[0], style: this.ch(s.f === i, 36), pick: () => this.setState({ f: i }) }));
    const keep = F[s.f][1];
    v.rows = R.filter((r) => !keep || keep.includes(r.k)).map((r) => ({ ...r, nf: !r.fat }));

    return v;
  }
}

*/

