"use client";

/** W_ConsultCall.dc.html — الاستشارة أونلاين. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ExampleTag } from "@/components/ui";
import { SERVICE, TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { ch, css } from "@/app/admin/_h/css";

export default function Page() {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [rs, setRs] = useState([true, true, true, false, true]);
  const RECS = ["تقشير البشرة", "واقي شمس SPF 50", "سيروم فيتامين C", "غسول لطيف", "جلسة متابعة بعد 4 أسابيع"];
  const cb = (on: boolean) => "width:52px;height:52px;border-radius:26px;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;" +
    (on ? "background:#FFFFFF;box-shadow:0 6px 18px rgba(123,70,135,0.12)" : "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);box-shadow:0 6px 14px rgba(150,100,170,0.30)");
  const v = {
    recs: RECS.map((name, i) => ({ name, on: rs[i], style: ch(rs[i], 34), t: () => { const a = rs.slice(); a[i] = !a[i]; setRs(a); } })),
    micst: cb(mic), camst: cb(cam), micc: mic ? C.accent : C.danger, camc: cam ? C.accent : C.danger,
    micp: mic ? "M9 5a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0zM5 10a7 7 0 0 0 14 0M8 21h8M12 17v4" : "M3 3l18 18M9 5a3 3 0 0 1 6 0v5a3 3 0 0 1-.6 1.8M5 10a7 7 0 0 0 11.5 5.3M8 21h8M12 17v4",
    tmic: () => setMic(!mic), tcam: () => setCam(!cam), timer: "08:42",
  };
  return (
    <AdminShell
      active="جدولي"
      title="الاستشارة أونلاين"
      subtitle={`مكالمة فيديو مع مراجعة · ${arDate(TODAY)}`}
      actions={
        <>
          <Link href={R.W_MyDay} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16" />
            </svg>
            جدولي
          </Link>
        </>
      }
    >
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ flex: 1, minWidth: "0", borderRadius: 34, position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #E1CBE6 0%, #CAABD1 45%, #A682AE 100%)", boxShadow: "0 20px 44px rgba(123,70,135,0.22)" }}>
          <div style={{ position: "absolute", top: -120, right: -80, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 70%)" }} />
          <div style={{ position: "absolute", bottom: -140, left: -60, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(123,70,135,0.35) 0%, rgba(123,70,135,0) 70%)" }} />
          <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ width: 170, height: 170, borderRadius: 85, background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 18px rgba(255,255,255,0.12), 0 0 0 40px rgba(255,255,255,0.06)" }}>
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>كاميرا المراجعة تعمل · جودة الاتصال جيدة</div>
          </div>
          <div style={{ position: "absolute", top: 20, right: 20, left: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.accent }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: C.ok, boxShadow: "0 0 0 4px rgba(63,164,106,0.2)" }} />
              {"مباشر · "}
              <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif" }}>{v.timer}</span>
            </span>
            <span style={{ height: 36, padding: "0 14px", borderRadius: 18, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: C.accent }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
              </svg>
              مكالمة مشفّرة
            </span>
          </div>
          <div style={{ position: "absolute", top: 20, left: 20, width: 190, height: 140, borderRadius: 24, overflow: "hidden", border: "3px solid #FFFFFF", boxShadow: "0 12px 28px rgba(123,70,135,0.30)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
            <span style={{ position: "absolute", bottom: 8, right: 8, height: 24, padding: "0 10px", borderRadius: 12, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center" }}>أنتِ</span>
          </div>
          <div style={{ position: "absolute", bottom: 104, right: 22, borderRadius: 22, padding: "10px 16px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", lineHeight: "1.35" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>دانة عطار</span>
              <ExampleTag />
            </div>
            <div style={{ fontSize: 12, color: C.sub }}>استشارة أونلاين · {SERVICE.consult.minutes} دقيقة</div>
          </div>
          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 40, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 14px 30px rgba(123,70,135,0.20)" }}>
            <button type="button" aria-label="الميكروفون" aria-pressed={!mic} onClick={v.tmic} style={css(v.micst)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v.micc} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d={v.micp} />
              </svg>
            </button>
            <button type="button" aria-label="الكاميرا" aria-pressed={!cam} onClick={v.tcam} style={css(v.camst)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={v.camc} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 10l4.6-2.3A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.4.9L15 14zM3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
            <button type="button" aria-label="عرض صور البشرة" style={{ width: 52, height: 52, borderRadius: 26, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 16l5-5c.9-.9 2.1-.9 3 0l5 5M14 14l1-1c.9-.9 2.1-.9 3 0l3 3" />
              </svg>
            </button>
            <button type="button" aria-label="المحادثة" style={{ width: 52, height: 52, borderRadius: 26, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
              </svg>
            </button>
            <button type="button" aria-label="إنهاء المكالمة" style={{ height: 52, padding: "0 22px", borderRadius: 26, border: "none", background: "linear-gradient(145deg,#B067C1,#884397)", boxShadow: "0 10px 22px rgba(145,77,160,0.40), inset 0 1px 0 rgba(255,255,255,0.3)", color: C.white, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21L21 3M5.7 18.3A16 16 0 0 1 3 6a2 2 0 0 1 2-2h4l2 5-2.5 1.5a11 11 0 0 0 1.8 2.4M15 13l5 2v4a2 2 0 0 1-2 2 16 16 0 0 1-7.3-2.3" />
              </svg>
              إنهاء
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0", width: 380, flexShrink: 0 }}>
          <div style={{ borderRadius: 26, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: C.accent }}>د ع</span>
              <div style={{ lineHeight: "1.35", flex: 1 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.ink, whiteSpace: "nowrap" }}>دانة عطار</span>
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12, color: C.sub2 }}>ملف 1133</div>
              </div>
              <Link href={R.W_Record} style={{ fontSize: 12.5, fontWeight: 700, color: C.accentMid }}>الملف الكامل ‹</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                <span style={{ color: C.sub2, whiteSpace: "nowrap" }}>نوع البشرة (استبيان)</span>
                <span style={{ fontWeight: 600, textAlign: "left" }}>مختلطة</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                <span style={{ color: C.sub2, whiteSpace: "nowrap" }}>سبب الاستشارة</span>
                <span style={{ fontWeight: 600, textAlign: "left" }}>آثار داكنة بعد الحبوب</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                <span style={{ color: C.sub2, whiteSpace: "nowrap" }}>الحساسية</span>
                <span style={{ fontWeight: 600, textAlign: "left" }}>لا يوجد</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                <span style={{ color: C.sub2, whiteSpace: "nowrap" }}>موعدها في المركز</span>
                <span style={{ fontWeight: 600, textAlign: "left" }}>اليوم 15:30 · تنظيف عميق للبشرة</span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>صور البشرة المرفوعة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>قبل الاستشارة · من تطبيقها</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <div style={{ flex: 1, minWidth: "0" }}>
                <div style={{ height: 74, borderRadius: 18, background: "linear-gradient(150deg,#EAD7EF,#CFB0D6)", border: "2px solid #FFFFFF", boxShadow: "0 6px 14px rgba(123,70,135,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 16l5-5c.9-.9 2.1-.9 3 0l5 5M14 14l1-1c.9-.9 2.1-.9 3 0l3 3" />
                  </svg>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub2, textAlign: "center", marginTop: 4 }}>الجبهة</div>
              </div>
              <div style={{ flex: 1, minWidth: "0" }}>
                <div style={{ height: 74, borderRadius: 18, background: "linear-gradient(150deg,#E6CFEB,#C4A2CC)", border: "2px solid #FFFFFF", boxShadow: "0 6px 14px rgba(123,70,135,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 16l5-5c.9-.9 2.1-.9 3 0l5 5M14 14l1-1c.9-.9 2.1-.9 3 0l3 3" />
                  </svg>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub2, textAlign: "center", marginTop: 4 }}>الخد الأيمن</div>
              </div>
              <div style={{ flex: 1, minWidth: "0" }}>
                <div style={{ height: 74, borderRadius: 18, background: "linear-gradient(150deg,#EEDEF1,#D3B7D9)", border: "2px solid #FFFFFF", boxShadow: "0 6px 14px rgba(123,70,135,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 16l5-5c.9-.9 2.1-.9 3 0l5 5M14 14l1-1c.9-.9 2.1-.9 3 0l3 3" />
                  </svg>
                </div>
                <div style={{ fontSize: 11.5, color: C.sub2, textAlign: "center", marginTop: 4 }}>الخد الأيسر</div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <label htmlFor="cnotes" style={{ fontSize: 14, fontWeight: 700 }}>ملاحظات الأخصائية</label>
            <textarea id="cnotes" style={{ marginTop: 8, width: "100%", height: 96, resize: "none", borderRadius: 18, background: "#F9F5FB", border: "1px solid #EADCF0", padding: "10px 14px", fontSize: 13, lineHeight: "1.6", color: C.ink, outline: "none" }} defaultValue={"آثار سطحية على الخدين، البشرة مختلطة. يُقترح تقشير لطيف مع حماية يومية من الشمس."} />
            <div style={{ fontSize: 13, fontWeight: 700, margin: "10px 0 8px" }}>التوصيات</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {v.recs.map((r, rI) => (
                <Fragment key={rI}>
                  <button type="button" aria-pressed={r.on} onClick={r.t}
 style={css(r.style)}>{r.name}</button>
                </Fragment>
              ))}
            </div>
          </div>
          <button type="button" style={{ height: 54, borderRadius: 27, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px", fontSize: 16, marginTop: "auto" }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 14L21 3M21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1z" />
            </svg>
            إرسال التوصيات
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

