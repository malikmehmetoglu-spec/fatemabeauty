"use client";

/** W_Policies.dc.html — سياسات الحجز والإلغاء. */
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
      title="سياسات الحجز والإلغاء"
      subtitle="المهل والتذكيرات وقائمة الانتظار — تُطبّق على كل القنوات"
      actions={
        <>
        </>
      }
    >
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
            <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M10 14l4 4M14 14l-4 4" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>تعديل الموعد وإلغاؤه</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>من تطبيق المراجعة</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>مسموح حتى قبل الموعد بـ</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {v.wins.map((c, cI) => (
                    <Fragment key={cI}>
                      <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                    </Fragment>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub, borderRadius: 16, padding: "8px 12px", background: "#F9F5FB" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
                  </svg>
                  بعد انتهاء المهلة: التعديل والإلغاء عبر الاستقبال فقط
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ lineHeight: "1.35" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>إعادة الموعد الملغى للحجز فوراً</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>يصبح الوقت متاحاً في نفس اللحظة</div>
                  </div>
                  <button type="button" aria-label="إعادة الموعد الملغى" role="switch" onClick={v.trel} style={css(v.tgr)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>عدم الحضور</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>تسجيل تلقائي للغياب + قاعدة اختيارية</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {v.ns.map((o, oI) => (
                    <Fragment key={oI}>
                      <button type="button" onClick={o.pick} style={css(o.style)}>
                        <span style={css(o.dot)} />
                        <span>{o.name}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                    <label htmlFor="late" style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>
                      يُعدّ غياباً بعد تأخير
                      <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                    </label>
                    <div style={{ height: 38, borderRadius: 19, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                      <input id="late" defaultValue="15" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: C.ink, textAlign: "right", boxSizing: "content-box" }} />
                      <span style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
            <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 8V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6M20 12v4h-4a2 2 0 0 1 0-4z" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>العربون</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>اختياري لحجز الموعد</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ lineHeight: "1.35" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>طلب عربون عند الحجز</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>يُدفع من التطبيق ويُخصم من الفاتورة</div>
                  </div>
                  <button type="button" aria-label="طلب عربون" role="switch" onClick={v.tdep} style={css(v.tgd)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={css(v.depst)}>
                  <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", minWidth: "0" }}>
                      <label htmlFor="dep" style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>
                        قيمة العربون
                        <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                      </label>
                      <div style={{ height: 38, borderRadius: 19, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
                        <input id="dep" defaultValue="20" style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 14, fontWeight: 600, color: C.ink, textAlign: "right", boxSizing: "content-box" }} />
                        <span style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap" }}>% من السعر</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, margin: "8px 0 6px" }}>يُطبّق على</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {v.depon.map((c, cI) => (
                      <Fragment key={cI}>
                        <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>قائمة الانتظار</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>عند شغور موعد</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ lineHeight: "1.35" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>عرض الموعد الشاغر تلقائياً</div>
                    <div style={{ fontSize: 11.5, color: C.sub2 }}>يُرسل لأول مراجعة في القائمة، وأول من تقبل تأخذه</div>
                  </div>
                  <button type="button" aria-label="العرض التلقائي" role="switch" onClick={v.twait} style={css(v.tgw)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>مهلة الرد قبل الانتقال للتالية</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {v.resp.map((c, cI) => (
                    <Fragment key={cI}>
                      <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                    </svg>
                  </span>
                  <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>التذكيرات</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>تلقائية مع أزرار تأكيد وإلغاء</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ lineHeight: "1.35" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>قبل الموعد بيوم</div>
                  </div>
                  <button type="button" aria-label="تذكير قبل يوم" role="switch" onClick={v.tr1} style={css(v.tg1)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ lineHeight: "1.35" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>قبل الموعد بساعتين</div>
                  </div>
                  <button type="button" aria-label="تذكير قبل ساعتين" role="switch" onClick={v.tr2} style={css(v.tg2)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>القنوات</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {v.chans.map((c, cI) => (
                    <Fragment key={cI}>
                      <button type="button" onClick={c.pick} style={css(c.style)}>{c.name}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: 320, flexShrink: 0, borderRadius: 30, padding: "22px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14, boxSizing: "content-box" }}>
          <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
          <div style={{ position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: 100, background: "radial-gradient(circle, rgba(200,160,220,0.28) 0%, rgba(200,160,220,0) 70%)" }} />
          <div style={{ position: "relative", lineHeight: "1.3" }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>كما تظهر في تطبيق المراجعة</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>سياسة الحجز</div>
          </div>
          {v.pv.map((p, pI) => (
            <Fragment key={pI}>
              <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "flex-start", borderRadius: 18, padding: "11px 13px", background: "rgba(255,255,255,0.11)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ width: 26, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                <span style={{ fontSize: 13, lineHeight: "1.6" }}>{p}</span>
              </div>
            </Fragment>
          ))}
          <button type="button" style={{ position: "relative", marginTop: "auto", height: 50, borderRadius: 25, border: "none", background: C.white, color: C.accent, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.18)", boxSizing: "content-box" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            حفظ السياسات
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

/* SCRIPT
class Component extends DCLogic {
  constructor(props) { super(props); this.state = {"win": 1, "rel": true, "ns": 2, "dep": false, "depon": 0, "wait": true, "resp": 1, "r1": true, "r2": true, "ch": [true, true, true]}; }

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

    const W = [2, 6, 12, 24];
    v.wins = W.map((h, i) => ({ name: h + ' ساعات', style: this.ch(s.win === i, 34), pick: () => this.setState({ win: i }) }));
    v.wins[0].name = 'ساعتين'; v.wins[2].name = '12 ساعة'; v.wins[3].name = '24 ساعة';
    v.tgr = this.tg(s.rel); v.trel = () => this.setState({ rel: !s.rel });
    const NS = ['تسجيل الغياب فقط', 'تنبيه لطيف بعد الغياب الأول', 'طلب عربون بعد غيابين', 'إيقاف الحجز من التطبيق بعد 3 غيابات'];
    v.ns = NS.map((name, i) => { const on = s.ns === i; return { name, pick: () => this.setState({ ns: i }),
      style: 'display:flex;align-items:center;gap:10px;height:36px;padding:0 12px;border-radius:18px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;text-align:right;' +
        (on ? 'background:linear-gradient(160deg,#F7EDF9,#E8D0ED);border:1px solid #FFFFFF;color:#7B4687;box-shadow:0 6px 14px rgba(150,100,170,0.20)' : 'background:#FFFFFF;border:1px solid #EDE2F1;color:#76607E'),
      dot: 'width:16px;height:16px;border-radius:8px;flex-shrink:0;box-sizing:border-box;' + (on ? 'border:5px solid #7B4687;background:#FFFFFF' : 'border:1.5px solid #D2C3D5;background:#FFFFFF') }; });
    v.tgd = this.tg(s.dep); v.tdep = () => this.setState({ dep: !s.dep });
    v.depst = s.dep ? '' : 'opacity:0.45;pointer-events:none';
    v.depon = ['جلسات الليزر', 'كل الخدمات'].map((name, i) => ({ name, style: this.ch(s.depon === i, 32), pick: () => this.setState({ depon: i }) }));
    v.tgw = this.tg(s.wait); v.twait = () => this.setState({ wait: !s.wait });
    const R = [15, 30, 60];
    v.resp = R.map((m, i) => ({ name: m + ' دقيقة', style: this.ch(s.resp === i, 34), pick: () => this.setState({ resp: i }) }));
    v.tg1 = this.tg(s.r1); v.tr1 = () => this.setState({ r1: !s.r1 });
    v.tg2 = this.tg(s.r2); v.tr2 = () => this.setState({ r2: !s.r2 });
    const CH = ['واتساب', 'SMS', 'إشعار التطبيق'];
    v.chans = CH.map((name, i) => ({ name, style: this.ch(s.ch[i], 32), pick: () => { const a = s.ch.slice(); a[i] = !a[i]; this.setState({ ch: a }); } }));
    const wl = ['ساعتين', '6 ساعات', '12 ساعة', '24 ساعة'][s.win];
    const pv = ['يمكنكِ تعديل موعدكِ أو إلغاؤه من التطبيق حتى ' + wl + ' قبل الموعد، وبعدها عبر الاستقبال.'];
    const rem = [s.r1 ? 'قبل الموعد بيوم' : '', s.r2 ? 'قبله بساعتين' : ''].filter((x) => x);
    if (rem.length) pv.push('نذكّركِ ' + rem.join(' و') + ' عبر ' + CH.filter((c, i) => s.ch[i]).join(' و') + '.');
    if (s.wait) pv.push('عند شغور موعد نرسله لقائمة الانتظار، والرد خلال ' + R[s.resp] + ' دقيقة.');
    pv.push(s.dep ? 'يُطلب عربون عند الحجز ويُخصم من فاتورتكِ.' : 'لا يُطلب عربون عادةً لحجز الموعد.');
    if (s.ns > 0) pv.push(['', 'نرسل تنبيهاً لطيفاً عند الغياب عن الموعد.', 'بعد غيابين يُطلب عربون للحجز التالي.', 'بعد 3 غيابات يكون الحجز عبر الاستقبال فقط.'][s.ns]);
    v.pv = pv;

    return v;
  }
}

*/

