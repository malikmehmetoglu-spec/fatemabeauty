"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { TODAY } from "@/lib/data";
import { SN, STOCKTAKE, css, tagStyle } from "@/lib/mock/g";

/** W_Stocktake.dc.html — الجرد. */
export default function Page() {
  const [done, setDone] = useState(false);
  const rows = STOCKTAKE.map((r) => ({
    name: r.name, lot: r.lot, sys: done ? r.cnt : r.sys, cnt: r.cnt,
    dLabel: r.diff === 0 ? "0" : r.diff > 0 ? "+" + r.diff : String(r.diff),
    dStyle: r.diff === 0 ? "font-family:var(--font-rubik),sans-serif;color:#A595AC" : "font-family:var(--font-rubik),sans-serif;font-weight:700;" + tagStyle(r.diff < 0 ? "pink" : "amber"),
    noteText: r.diff === 0 ? "مطابق" : done ? "سُوّي" : r.diff < 0 ? "نقص — يحتاج سبباً" : "زيادة — راجعي الاستلام",
    rowStyle: "display:flex;align-items:center;gap:12px;height:66px;padding:0 10px;border-top:1px solid #EDE2F1;" + (r.diff !== 0 && !done ? "background:#FDF7FE;border-radius:14px" : ""),
  }));
  const v = {
    rows, pending: !done, done, approve: () => setDone(true),
    stLabel: done ? "معتمد" : "بانتظار الاعتماد", stStyle: tagStyle(done ? "green" : "amber"),
  };
  return (
    <AdminShell active="المخزون والأجهزة" title="الجرد" subtitle="مقارنة الكميات المعدودة بكميات النظام · قيم مثال" actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Inventory}>
        <Icon name="box" color="#7B4687" size={17} stroke={1.9} />
        المخزون
      </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="clip" color="#A877B6" size={22} />
                </span>
                <div style={{ flex: 1, lineHeight: 1.45 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>
                    جرد شهري — تشرين الأول 2026
                  </div>
                  <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                    بدأ {arDate(TODAY)} 11:00 · بواسطة {SN.salma}
                    <ExampleTag />
                    {" "}· كل الأصناف (8)
                  </div>
                </div>
                <span style={css(v.stStyle)}>
                  {v.stLabel}
                </span>
              </div>
              <label htmlFor="scan" style={{ height: 50, borderRadius: 25, border: "1.5px solid #E2CEE6", background: "#FEFCFE", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", color: "#A595AC" }}>
                <Icon name="scan" color="#A877B6" size={20} />
                <input id="scan" aria-label="مسح الباركود" placeholder="امسحي باركود الصنف أو اكتبي رقم التشغيلة" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13.5, color: "#35213D" }} />
                <span style={{ fontSize: 12 }}>
                  8/8 مُعدود
                </span>
              </label>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "8px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", gap: 12, height: 38, alignItems: "center", padding: "0 10px" }}>
              <div style={{ flex: 2.1, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                الصنف
              </div>
              <div style={{ flex: 1.1, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                التشغيلة
              </div>
              <div style={{ flex: 0.8, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                في النظام
              </div>
              <div style={{ flex: 0.8, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                المعدود
              </div>
              <div style={{ flex: 0.8, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                الفرق
              </div>
              <div style={{ flex: 1.9, fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                ملاحظة
              </div>
            </div>
            {v.rows.map((r, r_i) => (
              <Fragment key={r_i}>
                <div style={css(r.rowStyle)}>
                  <div style={{ flex: 2.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>
                      {r.name}
                    </span>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12.5, color: "#76607E" }}>
                      {r.lot}
                    </span>
                  </div>
                  <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                      {r.sys}
                    </span>
                  </div>
                  <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>
                      {r.cnt}
                    </span>
                  </div>
                  <div style={{ flex: 0.8, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={css(r.dStyle)}>
                      {r.dLabel}
                    </span>
                  </div>
                  <div style={{ flex: 1.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: "#76607E" }}>
                      {r.noteText}
                    </span>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", width: 340, flexShrink: 0 }}>
          <div style={{ borderRadius: 28, padding: "20px 22px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", fontSize: 13, color: "#ECDBF0" }}>
              نتيجة الجرد
            </div>
            <div style={{ position: "relative", fontSize: 34, fontWeight: 700, lineHeight: 1.3 }}>
              3 فروقات
            </div>
            <div style={{ position: "relative", fontSize: 12.5, color: "#ECDBF0" }}>
              5 أصناف مطابقة من 8
            </div>
            <div style={{ position: "relative", marginTop: 12 }}>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: "62%", height: 8, borderRadius: 4, background: "linear-gradient(90deg, #E8D6F0, #FFFFFF)" }} />
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "14px 12px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" color="#FFFFFF" size={13} stroke={2.4} />
                </span>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>
                  عدّ الأصناف
                </div>
                <div style={{ fontSize: 11, color: "#866F8D" }}>
                  8/8
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: "#FFFFFF", border: "2px solid #C9A2D8", boxShadow: "0 0 0 4px rgba(200,160,220,0.25)", flexShrink: 0 }}></span>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>
                  مراجعة الفروقات
                </div>
                <div style={{ fontSize: 11, color: "#866F8D" }}>
                  الآن
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: "#FFFFFF", border: "1px solid #E9DCEE", flexShrink: 0 }}></span>
                <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>
                  الاعتماد والتسوية
                </div>
                <div style={{ fontSize: 11, color: "#866F8D" }} />
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  الفروقات وأسبابها
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: "#C9A24B" }}></span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                    محلول جلسات الهيدرافيشل
                  </span>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, color: "#8A5A12" }}>
                    +1
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: "#B03D6A" }}></span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                    منظف رغوي للبشرة
                  </span>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, color: "#B03D6A" }}>
                    -1
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 44, borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: "#B03D6A" }}></span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                    واقي شمس للبيع
                  </span>
                  <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, color: "#B03D6A" }}>
                    -2
                  </span>
                </div>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#866F8D" }}>
                سبب الفرق
                <textarea aria-label="سبب الفرق" rows={2} style={{ borderRadius: 16, border: "1px solid #E7D9EB", background: "#FEFCFE", padding: "10px 12px", fontSize: 13, color: "#35213D", resize: "none", outline: "none" }} defaultValue="واقي الشمس: عبوتان صُرفتا كعيّنات ولم تُسجَّلا."></textarea>
              </label>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {v.pending && (
              <>
                <button onClick={v.approve} style={{ height: 56, borderRadius: 28, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="check" color="#FFFFFF" size={18} />
                  اعتماد الجرد وتسوية الكميات
                </button>
                <div style={{ fontSize: 12, color: "#866F8D", textAlign: "center" }}>
                  الاعتماد يحدّث كميات النظام ويُسجَّل في سجل التدقيق.
                </div>
              </>
            )}
            {v.done && (
              <>
                <div style={{ height: 56, borderRadius: 28, background: "#E6F4EC", color: "#2E6B47", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="check" color="#3FA46A" size={18} />
                  اعتُمد الجرد — حُدّثت الكميات
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
