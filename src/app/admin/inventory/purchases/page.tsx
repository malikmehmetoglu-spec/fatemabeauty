"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";

/** W_Purchases.dc.html — المشتريات والموردون. */
export default function Page() {

  return (
    <AdminShell active="المخزون والأجهزة" title="المشتريات والموردون" subtitle="أسماء الموردين تسميات عامة · القيم أمثلة" actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Inventory}>
        <Icon name="box" color="#7B4687" size={17} stroke={1.9} />
        المخزون
      </Link>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: "0", flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: "#866F8D" }}>
                  طلبات مفتوحة
                </div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="cart" color="#A877B6" size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
                2
              </div>
              <div style={{ fontSize: 12, color: "#866F8D" }}>
                بقيمة 80,000 ل.س
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: "#866F8D" }}>
                  مشتريات أيلول
                </div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="receipt" color="#A877B6" size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
                108,000{" "}
                <span style={{ fontSize: 14 }}>
                  ل.س
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#866F8D" }}>
                3 طلبات · قيم مثال
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, color: "#866F8D" }}>
                  الموردون
                </div>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="truck" color="#A877B6" size={16} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
                3
              </div>
              <div style={{ fontSize: 12, color: "#866F8D" }}>
                مستحضرات · مستهلكات · قطع أجهزة
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", minHeight: "0" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: "#7B4687" }}>
                الكل (6)
              </span>
              <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "#FFFFFF", border: "1px solid #EADCF0", color: "#866F8D", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>
                مُرسل (1)
              </span>
              <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "#FFFFFF", border: "1px solid #EADCF0", color: "#866F8D", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>
                مستلم جزئياً (1)
              </span>
              <span style={{ height: 36, padding: "0 14px", borderRadius: 18, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "#FFFFFF", border: "1px solid #EADCF0", color: "#866F8D", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }}>
                مستلم (4)
              </span>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "8px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                رقم الطلب
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                التاريخ
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                المورّد
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                البنود
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                القيمة
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                الحالة
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                الاستلام
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-041
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  12 تشرين الأول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستحضرات
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  4
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    58,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                  مُرسل
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    15 تشرين الأول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    متوقع
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-040
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  6 تشرين الأول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستهلكات الطبية
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  3
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    22,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                  مستلم جزئياً
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    17 تشرين الأول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    متوقع الباقي
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-039
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  1 تشرين الأول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستحضرات
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  5
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    62,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  مستلم
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    7 تشرين الأول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    وصل
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-038
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  24 أيلول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد قطع الأجهزة
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  1
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    12,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  مستلم
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    3 تشرين الأول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    وصل
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-037
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  14 أيلول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستحضرات
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  6
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    70,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  مستلم
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    19 أيلول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    وصل
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 50, borderTop: "1px solid #EDE2F1" }}>
              <div style={{ flex: 1.05, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, color: "#35213D", whiteSpace: "nowrap" }}>
                  PO-2026-036
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap", color: "#76607E" }}>
                  3 أيلول
                </span>
              </div>
              <div style={{ flex: 2.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستهلكات الطبية
                </span>
                <ExampleTag />
              </div>
              <div style={{ flex: 0.45, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  4
                </span>
              </div>
              <div style={{ flex: 0.9, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700, fontSize: 13.5, color: "#35213D" }}>
                    26,000
                  </span>
                  <span style={{ fontSize: 11, color: "#866F8D", marginInlineStart: 4 }}>
                    ل.س
                  </span>
                </span>
              </div>
              <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  مستلم
                </span>
              </div>
              <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                    8 أيلول
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    وصل
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
              الموردون
            </div>
            <button style={{ height: 34, borderRadius: 17, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
              <Icon name="plus" color="#7B4687" size={17} stroke={1.9} />
              إضافة مورّد
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "stretch", minHeight: "0" }}>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 22, padding: "14px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="truck" color="#A877B6" size={18} />
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستحضرات
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  3 طلبات · آخرها 12 تشرين الأول
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 22, padding: "14px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="truck" color="#A877B6" size={18} />
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد المستهلكات الطبية
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  2 طلبات · آخرها 6 تشرين الأول
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "0", borderRadius: 22, padding: "14px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="truck" color="#A877B6" size={18} />
              </span>
              <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  مورّد قطع الأجهزة
                  <ExampleTag />
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  1 طلبات · آخرها 24 أيلول
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", width: 340, flexShrink: 0 }}>
          <div style={{ flex: 1, borderRadius: 28, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                طلب شراء جديد
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>
                مسودة
              </span>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#866F8D" }}>
              المورّد
              <span style={{ height: 44, borderRadius: 22, border: "1px solid #E7D9EB", background: "#FEFCFE", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", color: "#35213D", fontSize: 13.5, fontWeight: 600 }}>
                <span>
                  مورّد المستحضرات
                  <ExampleTag />
                </span>
                <Icon name="down" color="#866F8D" size={16} />
              </span>
            </label>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              مقترح تلقائياً من الأصناف تحت الحد الأدنى
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    مصل الهيالورونيك
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    المتوفر 18 · الحد الأدنى 20
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button aria-label="إنقاص" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="minus" color="#7B4687" size={14} />
                  </button>
                  <span style={{ width: 28, textAlign: "center", fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>
                    22
                  </span>
                  <button aria-label="زيادة" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="plus" color="#7B4687" size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    مواد التقشير (محلول)
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    المتوفر 6 · الحد الأدنى 8
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button aria-label="إنقاص" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="minus" color="#7B4687" size={14} />
                  </button>
                  <span style={{ width: 28, textAlign: "center", fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>
                    10
                  </span>
                  <button aria-label="زيادة" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="plus" color="#7B4687" size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, borderTop: "1px solid #EDE2F1" }}>
                <div style={{ flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                    جل التبريد لجلسات الليزر
                  </div>
                  <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                    المتوفر 9 · الحد الأدنى 10
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button aria-label="إنقاص" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="minus" color="#7B4687" size={14} />
                  </button>
                  <span style={{ width: 28, textAlign: "center", fontFamily: "var(--font-rubik), sans-serif", fontWeight: 700 }}>
                    11
                  </span>
                  <button aria-label="زيادة" style={{ width: 28, height: 28, borderRadius: 14, border: "none", background: "#F3EAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="plus" color="#7B4687" size={14} />
                  </button>
                </div>
              </div>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#866F8D", marginTop: 4 }}>
              التسليم المطلوب
              <span style={{ height: 44, borderRadius: 22, border: "1px solid #E7D9EB", background: "#FEFCFE", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", color: "#35213D", fontSize: 13.5, fontWeight: 600 }}>
                <span>
                  {arDate(new Date(2026, 9, 18))}
                </span>
                <Icon name="cal" color="#866F8D" size={16} />
              </span>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#866F8D" }}>
              ملاحظة للمورّد
              <textarea aria-label="ملاحظة للمورّد" rows={2} placeholder="مثلاً: تاريخ انتهاء لا يقل عن سنة" style={{ borderRadius: 16, border: "1px solid #E7D9EB", background: "#FEFCFE", padding: "10px 12px", fontSize: 13, color: "#35213D", resize: "none", outline: "none" }}></textarea>
            </label>
            <div style={{ borderTop: "1px solid #EDE2F1", paddingTop: 10, fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              الأسعار تُعتمد حسب عرض المورّد عند التأكيد، وتُسجَّل التشغيلة وتاريخ الانتهاء عند الاستلام.
            </div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ height: 52, borderRadius: 26, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px" }}>
                <Icon name="send" color="#FFFFFF" size={19} stroke={1.9} />
                إرسال الطلب للمورّد
              </button>
              <button style={{ height: 44, borderRadius: 22, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
                حفظ كمسودة
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
