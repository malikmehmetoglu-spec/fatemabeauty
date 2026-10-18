"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { APPOINTMENTS_TODAY, TODAY, toMinutes } from "@/lib/data";
import { SN } from "@/lib/mock/g";

const SHORT: Record<string, string> = { clean: "تنظيف", hydra: "هيدرا", peel: "تقشير", laser: "ليزر", consult: "" };
const BLOCK_BASE: CSSProperties = { position: "absolute", top: 4, bottom: 4, borderRadius: 10, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", whiteSpace: "nowrap" };
const BLOCK_LOOK: Record<string, CSSProperties> = {
  "انتهت": { background: "#E7DFE9", color: "#76607E" },
  "لم تحضر": { background: "#FBEAF1", color: "#B03D6A", border: "1px dashed #D3B1DB" },
  "في الجلسة": { backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF" },
};
const UPCOMING: CSSProperties = { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", color: "#7B4687" };

/** One specialist's sessions today on the 10:00–18:00 track (from APPOINTMENTS_TODAY). */
function Blocks({ who }: { who: string }) {
  return (
    <>
      {APPOINTMENTS_TODAY.filter((a) => a.specialist === who).map((a) => {
        const start = (toMinutes(a.time) - 600) / 480 * 100;
        const w = a.minutes / 480 * 100;
        return (
          <div key={a.id} title={`${a.time} ${a.serviceName} · ${a.name} (مثال)`} style={{ ...BLOCK_BASE, right: `${start.toFixed(2)}%`, width: `calc(${w.toFixed(2)}% - 3px)`, ...(BLOCK_LOOK[a.status] ?? UPCOMING) }}>
            {SHORT[a.service]}
          </div>
        );
      })}
    </>
  );
}

/** W_Staff.dc.html — فريق العمل. */
export default function Page() {

  return (
    <AdminShell active="فريق العمل" title="فريق العمل" subtitle={<>{arDate(TODAY)} · 12:30</>} actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Shifts}>
        <Icon name="cal" color="#7B4687" size={17} stroke={1.9} />
        الورديات
      </Link>
      <button style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 18px", whiteSpace: "nowrap" }}>
        <Icon name="plus" color="#FFFFFF" size={17} stroke={1.9} />
        إضافة موظفة
      </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#866F8D" }}>
                فريق العمل
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="users" color="#A877B6" size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
              5
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              3 أخصائيات · استقبال · محاسبة
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#866F8D" }}>
                حاضرات اليوم
              </div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="calcheck" color="#A877B6" size={16} />
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginTop: 4, color: "#35213D" }}>
              5/5
            </div>
            <div style={{ fontSize: 12, color: "#866F8D" }}>
              تأخير واحد 7 دقائق
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: "#ECDBF0" }}>
                مواعيد اليوم
              </div>
              <Icon name="cal" color="#E8D6F0" size={20} />
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: 1.25, marginTop: 6 }}>
              26
            </div>
            <div style={{ position: "relative", fontSize: 12, color: "#ECDBF0" }}>
              7 منتهية · 3 جارية
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 18, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 64, height: 64, borderRadius: 32, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#7B4687", color: "#FFFFFF" }}>
                في الجلسة
              </span>
            </div>
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 16 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {SN.fatema}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                أخصائية عناية بالبشرة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 30, fontWeight: 700 }}>
                8
              </span>
              <span style={{ fontSize: 12.5, color: "#866F8D" }}>
                جلسات اليوم · 2 منتهية
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              الآن: تنظيف عميق للبشرة · غرفة 1
            </div>
            <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #EDE2F1", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#866F8D" }}>
              <span>
                الوردية{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  10:00–18:00
                </span>
              </span>
              <span>
                حضور{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  09:52
                </span>
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 18, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                ر ا
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#7B4687", color: "#FFFFFF" }}>
                في الجلسة
              </span>
            </div>
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 16 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {SN.reem}
                </span>
                <ExampleTag />
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                أخصائية ليزر
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 30, fontWeight: 700 }}>
                9
              </span>
              <span style={{ fontSize: 12.5, color: "#866F8D" }}>
                جلسات اليوم · 3 منتهية
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              الآن: جلسة ليزر · غرفة 3
            </div>
            <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #EDE2F1", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#866F8D" }}>
              <span>
                الوردية{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  10:00–18:00
                </span>
              </span>
              <span>
                حضور{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  09:45
                </span>
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 18, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                ه ا
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#7B4687", color: "#FFFFFF" }}>
                في الجلسة
              </span>
            </div>
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 16 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {SN.hiba}
                </span>
                <ExampleTag />
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                أخصائية عناية بالبشرة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 30, fontWeight: 700 }}>
                9
              </span>
              <span style={{ fontSize: 12.5, color: "#866F8D" }}>
                جلسات اليوم · 2 منتهية
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              الآن: تقشير البشرة · غرفة 2
            </div>
            <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #EDE2F1", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#866F8D" }}>
              <span>
                الوردية{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  10:00–18:00
                </span>
              </span>
              <span>
                حضور{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  10:07
                </span>
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 18, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                ل خ
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                على رأس العمل
              </span>
            </div>
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 16 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {SN.lina}
                </span>
                <ExampleTag />
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                الاستقبال
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, height: 45 }}>
              <span style={{ fontSize: 13, color: "#866F8D" }}>
                بدون جلسات — دور إداري
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              مكتب الاستقبال
            </div>
            <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #EDE2F1", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#866F8D" }}>
              <span>
                الوردية{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  09:30–18:00
                </span>
              </span>
              <span>
                حضور{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  09:28
                </span>
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: 18, background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                س ح
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                على رأس العمل
              </span>
            </div>
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 16 }}>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {SN.salma}
                </span>
                <ExampleTag />
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                المحاسبة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, height: 45 }}>
              <span style={{ fontSize: 13, color: "#866F8D" }}>
                بدون جلسات — دور إداري
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#76607E", lineHeight: 1.6 }}>
              الحسابات والصندوق
            </div>
            <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid #EDE2F1", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#866F8D" }}>
              <span>
                الوردية{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  10:00–16:00
                </span>
              </span>
              <span>
                حضور{" "}
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 12, color: "#76607E", whiteSpace: "nowrap" }}>
                  09:58
                </span>
              </span>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: "0", minHeight: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                جدول الأخصائيات اليوم
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#866F8D" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: "#E7DFE9" }}></span>
                  منتهية
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: "#7B4687" }}></span>
                  جارية
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: "#D9BCE5" }}></span>
                  قادمة
                </span>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ marginRight: 162, position: "relative", height: 16 }}>
                <span style={{ position: "absolute", right: "0.00%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  10:00
                </span>
                <span style={{ position: "absolute", right: "12.50%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  11:00
                </span>
                <span style={{ position: "absolute", right: "25.00%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  12:00
                </span>
                <span style={{ position: "absolute", right: "37.50%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  13:00
                </span>
                <span style={{ position: "absolute", right: "50.00%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  14:00
                </span>
                <span style={{ position: "absolute", right: "62.50%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  15:00
                </span>
                <span style={{ position: "absolute", right: "75.00%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  16:00
                </span>
                <span style={{ position: "absolute", right: "87.50%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  17:00
                </span>
                <span style={{ position: "absolute", right: "100.00%", transform: "translateX(50%)", fontFamily: "var(--font-rubik), sans-serif", fontSize: 11, color: "#A595AC" }}>
                  18:00
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ width: 150, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 30, height: 30, borderRadius: 15, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {SN.fatema}
                  </span>
                </div>
                <div style={{ flex: 1, position: "relative", height: 52, borderRadius: 14, background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <Blocks who={SN.fatema} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ width: 150, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    ر ا
                  </span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {SN.reem}
                  </span>
                  <ExampleTag />
                </div>
                <div style={{ flex: 1, position: "relative", height: 52, borderRadius: 14, background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <Blocks who={SN.reem} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 62 }}>
                <div style={{ width: 150, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    ه ا
                  </span>
                  <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {SN.hiba}
                  </span>
                  <ExampleTag />
                </div>
                <div style={{ flex: 1, position: "relative", height: 52, borderRadius: 14, background: "#FDF9FE", border: "1px solid #EDE2F1" }}>
                  <Blocks who={SN.hiba} />
                </div>
              </div>
              <div style={{ position: "absolute", top: 18, bottom: "0", right: "calc(162px + (100% - 162px) * 0.3125)", width: 2, background: "#B03D6A", borderRadius: 1 }}>
                <span style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, borderRadius: 5, background: "#B03D6A" }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
