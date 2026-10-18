"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, FATEMA_PHOTO } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { TODAY } from "@/lib/data";
import { LEAVE_REQUESTS, SN, css, tagStyle } from "@/lib/mock/g";

/** W_Attendance.dc.html — الحضور والإجازات. */
export default function Page() {
  const [d, setD] = useState<Record<number, "ok" | "no">>({});
  const reqs = LEAVE_REQUESTS.map((r, i) => ({
    ...r, pending: !d[i], decided: !!d[i], ok: () => setD({ ...d, [i]: "ok" }), no: () => setD({ ...d, [i]: "no" }),
    stLabel: d[i] === "ok" ? "تمت الموافقة" : "مرفوض", st: tagStyle(d[i] === "ok" ? "green" : "pink"),
  }));
  const pend = LEAVE_REQUESTS.filter((r, i) => !d[i]).length;
  const v = { reqs, pendLabel: pend ? pend + " بانتظار القرار" : "لا طلبات معلّقة", pendStyle: tagStyle(pend ? "amber" : "green") };
  return (
    <AdminShell active="فريق العمل" title="الحضور والإجازات" subtitle={<>{arDate(TODAY)} · الآن 12:30</>} actions={<>
      <Link style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }} href={R.W_Shifts}>
        <Icon name="cal" color="#7B4687" size={17} stroke={1.9} />
        الورديات
      </Link>
      <button style={{ height: 46, borderRadius: 23, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "0 16px", whiteSpace: "nowrap" }}>
        <Icon name="download" color="#7B4687" size={17} stroke={1.9} />
        تصدير الحضور
      </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1.3, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  حضور اليوم · {arDate(TODAY)}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  5/5 حاضرات
                </span>
              </div>
              <div style={{ padding: "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    الموظفة
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    الوردية
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    الحضور
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    الانصراف
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    الحالة
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 12, color: "#866F8D", fontWeight: 600 }}>
                    هذا الأسبوع
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 76, borderTop: "1px solid #EDE2F1" }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 34, height: 34, borderRadius: 17, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                    <div style={{ lineHeight: 1.35 }}>
                      <div>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {SN.fatema}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                        أخصائية عناية بالبشرة
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: "#76607E", whiteSpace: "nowrap" }}>
                      10:00 – 18:00
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13.5, color: "#35213D", whiteSpace: "nowrap" }}>
                      09:52
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#A595AC" }}>
                      —
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      في الموعد
                    </span>
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          س
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ح
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ن
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ث
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 76, borderTop: "1px solid #EDE2F1" }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687" }}>
                      ر ا
                    </span>
                    <div style={{ lineHeight: 1.35 }}>
                      <div>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {SN.reem}
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                        أخصائية ليزر
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: "#76607E", whiteSpace: "nowrap" }}>
                      10:00 – 18:00
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13.5, color: "#35213D", whiteSpace: "nowrap" }}>
                      09:45
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#A595AC" }}>
                      —
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      في الموعد
                    </span>
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div title="إجازة" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#FFFFFF", border: "1.5px dashed #D1C0D5" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          س
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ح
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ن
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ث
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 76, borderTop: "1px solid #EDE2F1" }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687" }}>
                      ه ا
                    </span>
                    <div style={{ lineHeight: 1.35 }}>
                      <div>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {SN.hiba}
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                        أخصائية عناية بالبشرة
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: "#76607E", whiteSpace: "nowrap" }}>
                      10:00 – 18:00
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13.5, color: "#35213D", whiteSpace: "nowrap" }}>
                      10:07
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#A595AC" }}>
                      —
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                      متأخرة 7 د
                    </span>
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          س
                        </span>
                      </div>
                      <div title="إجازة" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#FFFFFF", border: "1.5px dashed #D1C0D5" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ح
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ن
                        </span>
                      </div>
                      <div title="تأخير" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#E9C27A" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ث
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 76, borderTop: "1px solid #EDE2F1" }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687" }}>
                      ل خ
                    </span>
                    <div style={{ lineHeight: 1.35 }}>
                      <div>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {SN.lina}
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                        الاستقبال
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: "#76607E", whiteSpace: "nowrap" }}>
                      09:30 – 18:00
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13.5, color: "#35213D", whiteSpace: "nowrap" }}>
                      09:28
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#A595AC" }}>
                      —
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      في الموعد
                    </span>
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          س
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ح
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ن
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ث
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 76, borderTop: "1px solid #EDE2F1" }}>
                  <div style={{ flex: 2, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7B4687" }}>
                      س ح
                    </span>
                    <div style={{ lineHeight: 1.35 }}>
                      <div>
                        <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {SN.salma}
                        </span>
                        <ExampleTag />
                      </div>
                      <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                        المحاسبة
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1.1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 12.5, color: "#76607E", whiteSpace: "nowrap" }}>
                      10:00 – 16:00
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13.5, color: "#35213D", whiteSpace: "nowrap" }}>
                      09:58
                    </span>
                  </div>
                  <div style={{ flex: 0.7, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#A595AC" }}>
                      —
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                      في الموعد
                    </span>
                  </div>
                  <div style={{ flex: 1.3, minWidth: "0", fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          س
                        </span>
                      </div>
                      <div title="تأخير" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#E9C27A" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ح
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ن
                        </span>
                      </div>
                      <div title="في الموعد" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 7, background: "linear-gradient(145deg,#C9A2D8,#7B4687)" }}></span>
                        <span style={{ fontSize: 10.5, color: "#866F8D" }}>
                          ث
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "0", minHeight: "0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  طلبات الإجازة
                </div>
                <span style={css(v.pendStyle)}>
                  {v.pendLabel}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {v.reqs.map((r, r_i) => (
                  <Fragment key={r_i}>
                    <div style={{ borderRadius: 22, padding: "14px 16px", background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg,#EEDBF2,#DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                        {r.ini}
                      </span>
                      <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                        <div style={{ fontSize: 14 }}>
                          <span style={{ fontWeight: 700 }}>
                            {r.name}
                          </span>
                          <ExampleTag />
                        </div>
                        <div style={{ color: "#866F8D", fontSize: 12.5 }}>
                          {r.type} · {r.days}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {r.when}
                        </div>
                        <div style={{ fontSize: 12, color: "#866F8D" }}>
                          {r.note}
                        </div>
                      </div>
                      {r.pending && (
                        <>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={r.ok} style={{ height: 36, padding: "0 14px", borderRadius: 18, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>
                              موافقة
                            </button>
                            <button onClick={r.no} style={{ height: 36, padding: "0 14px", borderRadius: 18, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#B03D6A", fontSize: 13, fontWeight: 600 }}>
                              رفض
                            </button>
                          </div>
                        </>
                      )}
                      {r.decided && (
                        <>
                          <span style={css(r.st)}>
                            {r.stLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                أرصدة الإجازات السنوية 2026
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#866F8D" }}>
                <span>
                  مفتاح الأسبوع: س سبت · ح أحد · ن إثنين · ث ثلاثاء
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>
                  قيم مثال
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "stretch", minHeight: "0" }}>
              <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    ر ا
                  </span>
                  <div style={{ fontSize: 13, minWidth: "0" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {SN.reem}
                    </span>
                    <ExampleTag />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    10
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    يوماً متبقية من 14
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "71%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#866F8D" }}>
                  <span>
                    مستخدمة 4
                  </span>
                  <span>
                    طلب معلّق
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    ه ا
                  </span>
                  <div style={{ fontSize: 13, minWidth: "0" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {SN.hiba}
                    </span>
                    <ExampleTag />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    8
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    يوماً متبقية من 14
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "57%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#866F8D" }}>
                  <span>
                    مستخدمة 6
                  </span>
                  <span>
                    طلب معلّق
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    ل خ
                  </span>
                  <div style={{ fontSize: 13, minWidth: "0" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {SN.lina}
                    </span>
                    <ExampleTag />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    5
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    يوماً متبقية من 14
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "36%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#866F8D" }}>
                  <span>
                    مستخدمة 9
                  </span>
                  <span>
                    لا طلبات
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#7B4687" }}>
                    س ح
                  </span>
                  <div style={{ fontSize: 13, minWidth: "0" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {SN.salma}
                    </span>
                    <ExampleTag />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    11
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    يوماً متبقية من 14
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "79%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#866F8D" }}>
                  <span>
                    مستخدمة 3
                  </span>
                  <span>
                    لا طلبات
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: "0", borderRadius: 20, padding: 14, background: "#FDF9FE", border: "1px solid #EDE2F1", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FATEMA_PHOTO} alt="فاطمة طيبة" style={{ width: 30, height: 30, borderRadius: 15, objectFit: "cover", objectPosition: "50% 10%", border: "2px solid #FFFFFF", boxShadow: "0 4px 12px rgba(123,70,135,0.18)", flexShrink: 0 }} />
                  <div style={{ fontSize: 13, minWidth: "0" }}>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                      {SN.fatema}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontFamily: "Rubik, sans-serif", fontSize: 24, fontWeight: 700 }}>
                    9
                  </span>
                  <span style={{ fontSize: 12, color: "#866F8D" }}>
                    يوماً متبقية من 14
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                  <div style={{ width: "64%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#866F8D" }}>
                  <span>
                    مستخدمة 5
                  </span>
                  <span>
                    لا طلبات
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
