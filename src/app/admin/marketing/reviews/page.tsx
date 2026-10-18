"use client";

import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { C } from "@/lib/tokens";
import { REVIEWS, ch, css } from "@/lib/mock/g";

/** W_Reviews.dc.html — التقييمات. */
export default function Page() {
  const [f, setF] = useState(0);
  const [inv, setInv] = useState<Record<number, boolean>>({});
  const [fu, setFu] = useState<Record<number, boolean>>({});
  const keep = (r: { stars: number }) => f === 0 || (f === 1 && r.stars <= 3) || (f === 2 && r.stars === 5) || (f === 3 && r.stars === 4);
  const B = "height:34px;padding:0 14px;border-radius:17px;font-family:inherit;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;cursor:pointer;";
  let pending = 0, sent = 0;
  REVIEWS.forEach((r, i) => { if (r.stars === 5 || inv[i]) sent++; else if (r.stars === 4) pending++; });
  const rows = REVIEWS.map((r, i) => {
    let btn: string, bst: string, act = () => {};
    if (r.stars <= 3) {
      btn = fu[i] ? "أُسندت للمتابعة" : "تحتاج متابعة · إسناد";
      bst = B + (fu[i] ? "background:#F0EDF0;color:#695D6B;border:none" : "background:#F3EAF6;color:#B03D6A;border:1px solid #DEC6E8");
      act = () => setFu({ ...fu, [i]: true });
    } else if (r.stars === 5 || inv[i]) {
      btn = "أُرسلت دعوة Google"; bst = B + "background:#E6F4EC;color:#2E7D50;border:none";
    } else {
      btn = "إرسال دعوة Google"; bst = B + "background:#FFFFFF;color:#7B4687;border:1px solid #EADCF0;box-shadow:0 4px 10px rgba(123,70,135,0.08)";
      act = () => setInv({ ...inv, [i]: true });
    }
    const st = [1, 2, 3, 4, 5].map((k) => ({ f: k <= r.stars ? "#E9A23B" : "#FFFFFF", s: k <= r.stars ? "#D98F26" : "#DFCFE2" }));
    return { ...r, st, btn, bst, act, show: keep(r), spx: r.sp !== "فاطمة طيبة" };
  }).filter((r) => r.show);
  const v = {
    filters: ["الكل", "تحتاج متابعة", "5 نجوم", "4 نجوم"].map((name, i) => ({ name, style: ch(f === i, 34), pick: () => setF(i) })),
    sent, pending, rows,
  };
  return (
    <AdminShell active="التسويق والولاء" title="التقييمات" subtitle="تقييمات المراجعات بعد كل جلسة — داخلية أولاً" actions={<>
      <button style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FFFFFF", color: "#7B4687", border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        <Icon name="download" color="#7B4687" size={16} stroke={1.9} />
        تصدير
      </button>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", width: 360, flexShrink: 0 }}>
          <div style={{ borderRadius: 30, padding: "22px 24px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", fontSize: 13, color: "#ECDBF0" }}>
              متوسط التقييمات المعروضة
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
              <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
                4.4
              </span>
              <div style={{ lineHeight: 1.5 }}>
                <span style={{ display: "inline-flex", gap: 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E9A23B" stroke="#D98F26" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#DFCFE2" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                  </svg>
                </span>
                <div style={{ fontSize: 12, color: "#ECDBF0" }}>
                  من 7 تقييمات داخلية لجلسات اليوم
                </div>
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 14 }}>
                  5
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "57%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#E8D6F0,#FFFFFF)" }} />
                </div>
                <span style={{ width: 14, textAlign: "left", color: "#ECDBF0" }}>
                  4
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 14 }}>
                  4
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "28%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#E8D6F0,#FFFFFF)" }} />
                </div>
                <span style={{ width: 14, textAlign: "left", color: "#ECDBF0" }}>
                  2
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 14 }}>
                  3
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "14%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#E8D6F0,#FFFFFF)" }} />
                </div>
                <span style={{ width: 14, textAlign: "left", color: "#ECDBF0" }}>
                  1
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 14 }}>
                  2
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "0%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#E8D6F0,#FFFFFF)" }} />
                </div>
                <span style={{ width: 14, textAlign: "left", color: "#ECDBF0" }}>
                  0
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                <span style={{ width: 14 }}>
                  1
                </span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
                  <div style={{ width: "0%", height: 8, borderRadius: 4, background: "linear-gradient(90deg,#E8D6F0,#FFFFFF)" }} />
                </div>
                <span style={{ width: 14, textAlign: "left", color: "#ECDBF0" }}>
                  0
                </span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="map" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                    دعوة للنشر على خرائط Google
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    تُرسل تلقائياً لأصحاب تقييم 5 نجوم
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  أُرسلت
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                  {v.sent}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)" }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  بانتظار قرار
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#7B4687" }}>
                  {v.pending}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                إرسال تلقائي للتقييمات العالية
              </span>
              <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </div>
          </div>
          <div style={{ borderRadius: 24, padding: "16px 18px", background: "linear-gradient(145deg,#FFFFFF,#F6E9F9)", border: "1px solid #DEC6E8", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="alert" color="#B03D6A" size={18} />
            </span>
            <div style={{ lineHeight: 1.5 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                1 تقييم يحتاج متابعة
              </div>
              <div style={{ fontSize: 12.5, color: "#76607E" }}>
                التقييمات المنخفضة تصل الإدارة داخلياً فقط ولا تُدعى للنشر.
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="list" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                    أكثر الملاحظات تكراراً
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    من التقييمات المعروضة
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>
                  لطف التعامل
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: 7, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 16, color: "#866F8D" }}>
                  2
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>
                  نتيجة واضحة
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "100%", height: 7, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 16, color: "#866F8D" }}>
                  2
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>
                  الالتزام بالموعد
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "50%", height: 7, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 16, color: "#866F8D" }}>
                  1
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 120, fontWeight: 600 }}>
                  شرح مفيد
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: "50%", height: 7, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 16, color: "#866F8D" }}>
                  1
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "18px 22px 6px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="star" color="#A877B6" size={16} />
              </span>
              <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  أحدث التقييمات
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  بعد جلسات اليوم
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {v.filters.map((f, f_i) => (
                <Fragment key={f_i}>
                  <button onClick={f.pick} style={css(f.style)}>
                    {f.name}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            {v.rows.map((r, r_i) => (
              <Fragment key={r_i}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#7B4687", whiteSpace: "nowrap" }}>
                    {r.ini}
                  </span>
                  <div style={{ flex: 1, minWidth: "0", lineHeight: 1.45 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>
                        {r.name}
                      </span>
                      <ExampleTag />
                      <span style={{ fontSize: 12, color: "#866F8D" }}>
                        · {r.service} · {r.sp}
                      </span>
                      {r.spx && (
                        <>
                          <ExampleTag />
                        </>
                      )}
                      <span style={{ fontSize: 11.5, color: "#A595AC", marginInlineStart: "auto", fontFamily: "Rubik, sans-serif" }}>
                        {r.time}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                      <span style={{ display: "inline-flex", gap: 1 }}>
                        {r.st.map((x, x_i) => (
                          <Fragment key={x_i}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={x.f} stroke={x.s} strokeWidth="1.6" strokeLinejoin="round">
                              <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                            </svg>
                          </Fragment>
                        ))}
                      </span>
                      <span style={{ fontSize: 13, color: "#76607E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.comment}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      {r.tags.map((t, t_i) => (
                        <Fragment key={t_i}>
                          <span style={{ height: 22, padding: "0 9px", borderRadius: 11, background: "#F7F0F9", color: "#866F8D", fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>
                            {t}
                          </span>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: 170, flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={r.act} style={css(r.bst)}>
                      {r.btn}
                    </button>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
