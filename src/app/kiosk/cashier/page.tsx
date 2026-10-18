"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useState } from "react";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { R } from "@/lib/routes";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL, LOGO } from "@/lib/tokens";

/** T_Cashier.dc.html */
export default function Page() {
  return (
    <Stage width={1194} height={834}  background={BG} padding="28px 28px 28px 32px" direction="row" gap={24}>

      <nav aria-label="وضع الاستقبال" style={{ width: 96, flexShrink: 0, borderRadius: 34, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH, padding: "22px 0", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative" }}>
        <div style={{ display: "flex" }}>
          <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 44, width: "auto", display: "block" }} />
        </div>
        <div style={{ width: 44, height: 1, background: C.line }} />
        <Link href={R.T_Desk} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.sub2 }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#957D9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
            </svg>
          </span>الاستقبال
        </Link>
        <Link href={R.T_QuickBook} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.sub2 }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#957D9A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
            </svg>
          </span>حجز سريع
        </Link>
        <Link href={R.T_Cashier} aria-current="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.accent }}>
          <span style={{ width: 60, height: 60, borderRadius: 30, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" />
            </svg>
          </span>الكاشير
        </Link>
        <Link href={R.T_Welcome} style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.sub2, textAlign: "center", lineHeight: 1.3 }}>
          <span style={{ width: 56, height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM11 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
            </svg>
          </span>وضع
          <br />المراجعات
        </Link>
      </nav>
      <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>الكاشير
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>جلسة منتهية بانتظار الدفع · 7 جلسات انتهت اليوم
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
              </svg>
              <span>الثلاثاء 13 تشرين الأول
              </span>
              <span style={{ width: 1, height: 20, background: C.border }} />
              <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}>12:30
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: "0" }}>
          <div style={{ width: 420, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 30, padding: "20px 22px 6px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14 }}>
                <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, color: C.accent }}>ر س
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 19, fontWeight: 700 }}>ريم سالم
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle" }}>مثال
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: C.sub2 }}>ملف 1000 · دور 1 · 10:00
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>انتهت
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 46, height: 46, borderRadius: 23, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" />
                  </svg>
                </span>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>تنظيف عميق للبشرة
                  </div>
                  <div style={{ fontSize: 13, color: C.sub2 }}>فاطمة طيبة · غرفة 1 · 60 دقيقة
                  </div>
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap" }}>1,500 ل.س
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderTop: "1px solid #EDE2F1", fontSize: 16 }}>
                <span style={{ color: C.sub }}>المجموع
                </span>
                <span style={{ fontWeight: 700 }}>1,500 ل.س
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderTop: "1px solid #EDE2F1", fontSize: 16 }}>
                <span style={{ color: C.sub }}>الخصم
                </span>
                <span style={{ fontWeight: 700 }}>لا يوجد
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", borderRadius: 30, padding: "20px 26px", color: C.white, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
              <svg width="220" height="220" viewBox="0 0 160 160" style={{ position: "absolute", top: -60, left: -60 }}>
                <circle cx="80" cy="80" r="78" fill="none" stroke="#7C5485" strokeWidth="1" />
                <circle cx="80" cy="80" r="56" fill="none" stroke="#7C5485" strokeWidth="1" />
              </svg>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 15, color: C.onDark }}>المطلوب دفعه
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.2, fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>{due}
                    </span>
                    <span style={{ fontSize: 18, color: C.onDark }}>ل.س
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: C.onDark, paddingBottom: 10 }}>{dueNote}
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 26, padding: "6px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, fontSize: 16, fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3FA46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
                    </svg>
                  </span>إرسال الفاتورة على واتساب
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, boxSizing: "border-box", flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, fontSize: 16, fontWeight: 600, borderTop: "1px solid #EDE2F1" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2M17 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4M7 13h10v8H7z" />
                    </svg>
                  </span>طباعة إيصال ورقي
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, boxSizing: "border-box", flexShrink: 0, display: "flex", justifyContent: "flex-start", background: "#E6DDE8" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                </span>
              </div>
            </div>
            <button style={{ marginTop: "auto", height: 64, borderRadius: 32, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2M9 7h6M9 11h6M13 15h2" />
              </svg>إصدار الفاتورة
            </button>
          </div>
          <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>طريقة الدفع
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={methods[0].pick} style={methods[0].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 12m-2.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M6 9v.01M18 15v.01" />
                </svg>نقداً
              </button>
              <button onClick={methods[1].pick} style={methods[1].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M7 15h2" />
                </svg>بطاقة
              </button>
              <button onClick={methods[2].pick} style={methods[2].style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                </svg>من الباقة
              </button>
            </div>
            {cash && (<>
              <div style={{ display: "flex", gap: 16, flexGrow: 1, minHeight: "0" }}>
                <div style={{ width: 250, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ borderRadius: 26, padding: "14px 18px", background: C.white, border: "1.5px solid #E3CEE8", boxShadow: "0 0 0 5px rgba(222,190,229,0.22)" }}>
                    <div style={{ fontSize: 14, color: C.sub2 }}>المبلغ المستلم
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-rubik), Rubik, sans-serif", color: C.ink, lineHeight: 1.3 }}>{recv}
                      </span>
                      <span style={{ fontSize: 15, color: C.sub2 }}>ل.س
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: C.sub2, padding: "0 6px" }}>مبالغ سريعة
                  </div>
                  {quick.map((q, qI) => (
                    <Fragment key={qI}>
                      <button onClick={q.set} style={q.style}>{q.label}
                      </button>
                    </Fragment>
                  ))}
                  <div style={{ marginTop: "auto", borderRadius: 26, padding: "12px 18px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT }}>
                    <div style={{ fontSize: 14, color: C.sub2 }}>{changeLabel}
                    </div>
                    <div style={changeStyle}>{change}
                    </div>
                  </div>
                </div>
                <div dir="ltr" style={{ flex: 1, minWidth: "0", borderRadius: 30, padding: 16, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "1fr", gap: 10 }}>
                  {keys.map((k, kI) => (
                    <Fragment key={kI}>
                      <button onClick={k.press} aria-label={k.aria} style={{ borderRadius: 20, border: "1px solid #F0E6F3", background: "linear-gradient(180deg,#FFFFFF,#FAF4FB)", boxShadow: "0 4px 10px rgba(123,70,135,0.06), inset 0 1px 0 #FFFFFF", fontFamily: "var(--font-rubik), Rubik, sans-serif", fontSize: 25, fontWeight: 500, color: C.ink, minHeight: 56 }}>{k.k}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>)}
            {card && (<>
              <div style={{ flexGrow: 1, borderRadius: 30, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 40px" }}>
                <span style={{ width: 116, height: 116, borderRadius: 58, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(150,100,170,0.25), inset 0 1px 0 #FFFFFF" }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18M7 15h2" />
                  </svg>
                </span>
                <div style={{ fontSize: 24, fontWeight: 700 }}>مرّري البطاقة على جهاز الدفع
                </div>
                <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6 }}>المبلغ{" "}
                  <b style={{ color: C.accent }}>1,500 ل.س
                  </b>{" "}— بعد نجاح العملية اضغطي «إصدار الفاتورة».
                </div>
              </div>
            </>)}
            {pkg && (<>
              <div style={{ flexGrow: 1, borderRadius: 30, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: "0 40px" }}>
                <span style={{ width: 116, height: 116, borderRadius: 58, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(150,100,170,0.25), inset 0 1px 0 #FFFFFF" }}>
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                  </svg>
                </span>
                <div style={{ fontSize: 24, fontWeight: 700 }}>تُخصم جلسة واحدة من باقتها
                </div>
                <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6 }}>لا يُطلب أي مبلغ اليوم، وتظهر الجلسة في رحلتها على التطبيق.
                </div>
              </div>
            </>)}
          </div>
        </div>
      </div>

    </Stage>
  );
}

