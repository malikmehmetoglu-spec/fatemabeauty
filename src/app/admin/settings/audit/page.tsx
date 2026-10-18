"use client";

/** W_Audit.dc.html — سجل التدقيق. */
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { ch, css } from "@/app/admin/_h/css";
import { AUDIT_LOG } from "@/lib/mock/h";

export default function Page() {
  const [f, setF] = useState(0);
  const F: [string, string[] | null][] = [["الكل", null], ["فتح ملف", ["file"]], ["الفواتير والخصومات", ["invoice", "discount"]], ["الحذف والتصدير", ["delete", "export"]], ["الحضور", ["queue"]], ["الإعدادات", ["settings"]]];
  const keep = F[f][1];
  const v = {
    filters: F.map((x, i) => ({ name: x[0], style: ch(f === i, 36), pick: () => setF(i) })),
    rows: AUDIT_LOG.filter((r) => !keep || keep.includes(r.k)).map((r) => ({ ...r, nf: !r.fat })),
  };
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
              <button type="button" aria-pressed={fI === v.filters.indexOf(f) && f.style.includes("#F1E3F6")} onClick={f.pick}
 style={css(f.style, "button")}>{f.name}</button>
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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

