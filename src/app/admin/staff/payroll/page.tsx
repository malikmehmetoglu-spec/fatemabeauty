"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { PAYROLL, css } from "@/lib/mock/g";

/** W_Payroll.dc.html — الرواتب. */
export default function Page() {
  const [sel, setSel] = useState(0);
  const rows = PAYROLL.map((p, i) => ({
    ...p, pick: () => setSel(i),
    style: "width:100%;display:flex;align-items:center;gap:12px;height:96px;padding:0 12px;border-radius:18px;font-family:inherit;color:#35213D;text-align:right;" +
      (i === sel ? "background:linear-gradient(160deg,#FAF3FB,#F1E1F4);border:1px solid #FFFFFF;box-shadow:0 8px 18px rgba(150,100,170,0.18)" : "background:transparent;border:1px solid transparent;border-top:1px solid #EDE2F1"),
  }));
  const v = { rows, p: PAYROLL[sel] };
  return (
    <AdminShell active="فريق العمل" title="الرواتب" subtitle="مسير رواتب أيلول 2026" actions={<>
      <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
        <Icon name="cal" color="#7B4687" size={17} stroke={1.9} />
        أيلول 2026
      </button>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Commissions}>
        <Icon name="percent" color="#7B4687" size={17} stroke={1.9} />
        العمولات
      </Link>
      <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
        <Icon name="download" color="#FFFFFF" size={17} stroke={1.9} />
        تصدير
      </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#ECDBF0" }}>
                صافي الرواتب · أيلول 2026
              </div>
              <Icon name="wallet" color="#E8D6F0" size={20} />
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>
              221,500{" "}
              <span style={{ fontSize: 15 }}>
                ل.س
              </span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: "#ECDBF0" }}>
              4 موظفات · صُرفت {arDate(new Date(2026, 9, 1))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#866F8D" }}>
                الرواتب الأساسية
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="users" color="#A877B6" size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
              131,000{" "}
              <span style={{ fontSize: 14 }}>
                ل.س
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              قيم مثال
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#866F8D" }}>
                العمولات
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="percent" color="#A877B6" size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
              96,500{" "}
              <span style={{ fontSize: 14 }}>
                ل.س
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              من شاشة العمولات
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#866F8D" }}>
                الاستقطاعات
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="minus" color="#A877B6" size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
              6,000{" "}
              <span style={{ fontSize: 14 }}>
                ل.س
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              سلفة + تأخير
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "14px 16px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", gap: 12, height: 40, alignItems: "center", padding: "0 12px" }}>
              <div style={{ flex: 2.2, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                الموظفة
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                الأساسي
                <ExampleTag />
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                العمولة
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                الاستقطاع
              </div>
              <div style={{ flex: 1, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                الصافي
              </div>
              <div style={{ flex: 0.9, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }}>
                الحالة
              </div>
              <div style={{ flex: 0.9, fontSize: 12, color: "#866F8D", fontWeight: 600, display: "flex", alignItems: "center" }} />
            </div>
            {v.rows.map((r, r_i) => (
              <Fragment key={r_i}>
                <button onClick={r.pick} style={css(r.style)}>
                  <div style={{ flex: 2.2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                      {r.ini}
                    </span>
                    <span style={{ lineHeight: 1.35, textAlign: "right" }}>
                      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {r.name}
                      </span>
                      <ExampleTag />
                      <br />
                      <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                        {r.role}
                      </span>
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#35213D" }}>
                      {r.base}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#35213D" }}>
                      {r.comm}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#B03D6A" }}>
                      {r.ded}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, color: "#7B4687" }}>
                      {r.net}
                    </span>
                  </div>
                  <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      مدفوع
                    </span>
                  </div>
                  <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ height: 30, padding: "0 10px", borderRadius: 15, background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#7B4687" }}>
                      <Icon name="file" color="#7B4687" size={14} />
                      القسيمة
                    </span>
                  </div>
                </button>
              </Fragment>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 50, marginTop: 4, padding: "0 12px", borderRadius: 18, background: "linear-gradient(145deg,#F6EEF9,#F2E4F5)" }}>
              <div style={{ flex: 2.2, fontWeight: 700 }}>
                الإجمالي
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    131,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    96,500
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#B03D6A" }}>
                    6,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 700, fontSize: 13.5, color: "#7B4687" }}>
                    221,500
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 0.9 }} />
              <div style={{ flex: 0.9 }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14, padding: "9px 12px", fontSize: 12.5, fontWeight: 600, background: "#F3EAF6", color: "#74457F" }}>
                <Icon name="info" color="#A877B6" size={17} />
                <span>
                  الرواتب الأساسية ونسب العمولة أمثلة توضيحية لهيكل المسير، تُستبدل بالقيم الفعلية عند الإعداد.
                </span>
              </div>
            </div>
          </div>
          <div style={{ width: 340, flexShrink: 0, borderRadius: 28, padding: 20, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                قسيمة الراتب
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                أيلول 2026
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0 8px", borderBottom: "1px solid #EDE2F1" }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#7B4687" }}>
                {v.p.ini}
              </span>
              <div style={{ lineHeight: 1.45 }}>
                <div style={{ fontSize: 16 }}>
                  <span style={{ fontWeight: 700 }}>
                    {v.p.name}
                  </span>
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  {v.p.role}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 34, fontSize: 13.5 }}>
              <span style={{ color: "#76607E" }}>
                الراتب الأساسي (مثال)
              </span>
              <span>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#35213D" }}>
                  {v.p.base}
                </span>
                {" "}
                <span style={{ fontSize: 11, color: "#866F8D" }}>
                  ل.س
                </span>
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 34, fontSize: 13.5 }}>
              <span style={{ color: "#76607E" }}>
                العمولة
              </span>
              <span>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#35213D" }}>
                  {v.p.comm}
                </span>
                {" "}
                <span style={{ fontSize: 11, color: "#866F8D" }}>
                  ل.س
                </span>
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "#866F8D", marginTop: -6 }}>
              {v.p.commNote}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 34, fontSize: 13.5 }}>
              <span style={{ color: "#76607E" }}>
                الاستقطاع
              </span>
              <span>
                <span style={{ fontFamily: "Rubik, sans-serif", fontWeight: 600, color: "#B03D6A" }}>
                  {v.p.ded}
                </span>
                {" "}
                <span style={{ fontSize: 11, color: "#866F8D" }}>
                  ل.س
                </span>
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "#866F8D", marginTop: -6 }}>
              {v.p.why}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 18, padding: "12px 14px", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: "#7B4687", marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>
                الصافي
              </span>
              <span>
                <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 22, fontWeight: 700 }}>
                  {v.p.net}
                </span>
                {" "}
                <span style={{ fontSize: 12 }}>
                  ل.س
                </span>
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              صُرف {arDate(new Date(2026, 9, 1), { year: true })} · تحويل
            </div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ height: 52, borderRadius: 26, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px" }}>
                <Icon name="download" color="#FFFFFF" size={19} stroke={1.9} />
                تنزيل القسيمة PDF
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="print" color="#7B4687" size={17} stroke={1.9} />
                  طباعة
                </button>
                <button style={{ height: 40, borderRadius: 20, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap", flex: 1 }}>
                  <Icon name="send" color="#7B4687" size={17} stroke={1.9} />
                  إرسال للموظفة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
