"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { PACKAGES, PACKAGE_RULE, SERVICE } from "@/lib/data";
import { money } from "@/lib/format";
import { css, fmt, tg } from "@/lib/mock/g";

/** W_Offers.dc.html — الباقات والعروض. */
export default function Page() {
  const [on, setOn] = useState([true, true, true]);
  const [seg, setSeg] = useState(0);
  const [disc, setDisc] = useState(1);
  const chd = (x: boolean) => "height:34px;padding:0 13px;border-radius:17px;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;white-space:nowrap;" +
    (x ? "background:#FFFFFF;color:#7B4687;border:1px solid #FFFFFF;box-shadow:0 6px 14px rgba(0,0,0,0.18)" : "background:rgba(255,255,255,0.10);color:#F6EAF8;border:1px solid rgba(255,255,255,0.28)");
  const ds = [10, 15, 20];
  const v = {
    pk: [0, 1, 2].map((i) => ({
      tg: tg(on[i]), toggle: () => setOn((o) => o.map((y, j) => (j === i ? !y : y))),
      label: on[i] ? "ظاهرة للمراجعات" : "مخفية",
      badge: "height:26px;padding:0 10px;border-radius:13px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;" + (on[i] ? "background:#E6F4EC;color:#2E7D50" : "background:#F0EDF0;color:#695D6B"),
    })),
    segs: ["جرّبت الليزر ولم تعد منذ سنة", "العضوية الذهبية فأعلى", "مراجعات جدد", "كل المراجعات"].map((name, i) => ({ name, style: chd(seg === i), pick: () => setSeg(i) })),
    discs: ds.map((d, i) => ({ name: d + "%", style: chd(disc === i), pick: () => setDisc(i) })),
    disc: ds[disc] + "%",
    after: fmt(Math.round(SERVICE.laser.price * (100 - ds[disc]) / 100)),
  };
  return (
    <AdminShell active="التسويق والولاء" title="الباقات والعروض" subtitle="الباقات المسبقة الدفع، العروض الموسمية وأكواد الخصم" actions={<>
      <button style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FFFFFF", color: "#7B4687", border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        <Icon name="download" color="#7B4687" size={16} stroke={1.9} />
        تصدير
      </button>
      <button style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", border: "none", padding: "0 20px", fontSize: 14 }}>
        <Icon name="plus" color="#FFFFFF" size={16} stroke={1.9} />
        عرض جديد
      </button>
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", height: 232 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -50, width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle, rgba(190,150,215,0.28) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="drop" color="#A877B6" size={20} />
              </span>
              <button aria-label="تفعيل باقة التنظيف العميق" role="switch" aria-checked={on[0]} onClick={v.pk[0].toggle} style={css(v.pk[0].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }}></span>
              </button>
            </div>
            <div style={{ position: "relative", lineHeight: 1.35 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                باقة التنظيف العميق
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                {PACKAGE_RULE} · {SERVICE[PACKAGES[0].service].minutes} دقيقة للجلسة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#7B4687" }}>
                  {money(PACKAGES[0].price, false)}{" "}
                  <span style={{ fontSize: 13 }}>
                    ل.س
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#A595AC", textDecoration: "line-through" }}>
                  {money(PACKAGES[0].sessions * SERVICE[PACKAGES[0].service].price)}
                </div>
              </div>
              <span style={css(v.pk[0].badge)}>
                {v.pk[0].label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, position: "relative" }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                توفير {money(PACKAGES[0].saving)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                جلسة مجانية
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -50, width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle, rgba(190,150,215,0.28) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="sparkle" color="#A877B6" size={20} />
              </span>
              <button aria-label="تفعيل باقة الهيدرافيشل" role="switch" aria-checked={on[1]} onClick={v.pk[1].toggle} style={css(v.pk[1].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }}></span>
              </button>
            </div>
            <div style={{ position: "relative", lineHeight: 1.35 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                باقة الهيدرافيشل
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                {PACKAGE_RULE} · {SERVICE[PACKAGES[1].service].minutes} دقيقة للجلسة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#7B4687" }}>
                  {money(PACKAGES[1].price, false)}{" "}
                  <span style={{ fontSize: 13 }}>
                    ل.س
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#A595AC", textDecoration: "line-through" }}>
                  {money(PACKAGES[1].sessions * SERVICE[PACKAGES[1].service].price)}
                </div>
              </div>
              <span style={css(v.pk[1].badge)}>
                {v.pk[1].label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, position: "relative" }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                توفير {money(PACKAGES[1].saving)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                جلسة مجانية
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, left: -50, width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle, rgba(190,150,215,0.28) 0%, rgba(190,150,215,0) 70%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="layers" color="#A877B6" size={20} />
              </span>
              <button aria-label="تفعيل باقة التقشير" role="switch" aria-checked={on[2]} onClick={v.pk[2].toggle} style={css(v.pk[2].tg)}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }}></span>
              </button>
            </div>
            <div style={{ position: "relative", lineHeight: 1.35 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                باقة التقشير
              </div>
              <div style={{ fontSize: 12.5, color: "#866F8D" }}>
                {PACKAGE_RULE} · {SERVICE[PACKAGES[2].service].minutes} دقيقة للجلسة
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative" }}>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#7B4687" }}>
                  {money(PACKAGES[2].price, false)}{" "}
                  <span style={{ fontSize: 13 }}>
                    ل.س
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#A595AC", textDecoration: "line-through" }}>
                  {money(PACKAGES[2].sessions * SERVICE[PACKAGES[2].service].price)}
                </div>
              </div>
              <span style={css(v.pk[2].badge)}>
                {v.pk[2].label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, position: "relative" }}>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                توفير {money(PACKAGES[2].saving)}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                جلسة مجانية
              </span>
            </div>
          </div>
          <button style={{ width: 170, flexShrink: 0, borderRadius: 26, border: "1.5px dashed #D8BFDE", background: "rgba(255,255,255,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#7B4687", fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" color="#A877B6" size={22} />
            </span>
            باقة جديدة
            <span style={{ fontSize: 11.5, color: "#866F8D", fontWeight: 500, lineHeight: 1.4, padding: "0 16px" }}>
              مفردة أو مركّبة من عدة خدمات
            </span>
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ flex: 1.25, minWidth: "0", borderRadius: 30, padding: "22px 24px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "absolute", top: -70, left: -40, width: 220, height: 220, borderRadius: 110, background: "radial-gradient(circle, rgba(200,160,220,0.28) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12.5, color: "#ECDBF0" }}>
                  منشئ العروض الموسمية
                </div>
                <div style={{ fontSize: 21, fontWeight: 700 }}>
                  عرض الخريف على جلسات الليزر
                </div>
              </div>
              <span style={{ height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="edit" color="#E8D6F0" size={14} />
                مسودة
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: "#ECDBF0", marginBottom: 7 }}>
                الشريحة المستهدفة
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {v.segs.map((g, g_i) => (
                  <Fragment key={g_i}>
                    <button onClick={g.pick} style={css(g.style)}>
                      {g.name}
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", gap: 18, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 12, color: "#ECDBF0", marginBottom: 7 }}>
                  نسبة الخصم
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  {v.discs.map((d, d_i) => (
                    <Fragment key={d_i}>
                      <button onClick={d.pick} style={css(d.style)}>
                        {d.name}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ lineHeight: 1.25, textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "#ECDBF0" }}>
                  سعر الجلسة بعد الخصم
                </div>
                <div style={{ fontSize: 30, fontWeight: 700 }}>
                  {v.after}{" "}
                  <span style={{ fontSize: 14 }}>
                    ل.س
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#ECDBF0", textDecoration: "line-through" }}>
                  {money(SERVICE.laser.price)}
                </div>
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", lineHeight: 1.35 }}>
                <div style={{ fontSize: 11.5, color: "#ECDBF0" }}>
                  يبدأ
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {arDate(new Date(2026, 9, 15))}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", lineHeight: 1.35 }}>
                <div style={{ fontSize: 11.5, color: "#ECDBF0" }}>
                  ينتهي
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {arDate(new Date(2026, 10, 14))}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", lineHeight: 1.35 }}>
                <div style={{ fontSize: 11.5, color: "#ECDBF0" }}>
                  القناة
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  واتساب + إشعار التطبيق
                </div>
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  مرة لكل مراجعة
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
                </span>
              </div>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  مع خصم الباقة
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-start", background: "#E6DDE8" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
                </span>
              </div>
              <div style={{ flex: 1, borderRadius: 18, padding: "10px 14px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  تُحتسب النقاط
                </span>
                <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
                </span>
              </div>
            </div>
            <div style={{ position: "relative", borderRadius: 20, padding: "12px 16px", background: "rgba(255,255,255,0.10)", border: "1px dashed rgba(255,255,255,0.35)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Icon name="msg" color="#E8D6F0" size={20} />
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "#F6EAF8" }}>
                مرحباً {"{"}الاسم{"}"}، اشتقنا لكِ! خصم {v.disc} على جلسة الليزر حتى {arDate(new Date(2026, 10, 14))}. احجزي من التطبيق أو بالرد على هذه الرسالة.
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", gap: 10, marginTop: "auto" }}>
              <button style={{ flex: 1, height: 48, borderRadius: 24, border: "none", background: "#FFFFFF", color: "#7B4687", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
                <Icon name="send" color="#7B4687" size={18} />
                حفظ وجدولة الإرسال
              </button>
              <Link style={{ height: 48, padding: "0 18px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.4)", color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }} href={R.W_Campaigns}>
                <Icon name="eye" color="#E8D6F0" size={17} />
                معاينة الرسالة
              </Link>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "18px 20px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="percent" color="#A877B6" size={16} />
                </span>
                <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                    أكواد الخصم
                  </div>
                  <div style={{ fontSize: 12, color: "#866F8D" }}>
                    عدد مرات الاستخدام من كل حملة
                  </div>
                </div>
              </div>
              <button style={{ height: 34, borderRadius: 17, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#F3EAF6", color: "#7B4687", border: "1px solid #EFE0F2" }}>
                <Icon name="plus" color="#7B4687" size={16} stroke={1.9} />
                كود جديد
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  AUTUMN15
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    15% على الليزر
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "36%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      18 / 50 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  فعّال
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  WELCOME10
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    10% أول جلسة
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "27%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      27 / 100 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  فعّال
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  GLOW500
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    500 ل.س على الهيدرافيشل
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "100%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      40 / 40 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#F0EDF0", color: "#695D6B" }}>
                  مكتمل
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  FRIEND
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    جلسة تنظيف هدية
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "30%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      6 / 20 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FCF1DE", color: "#8A5A12" }}>
                  متوقف
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  PEEL20
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    20% على التقشير
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "30%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      9 / 30 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: "#2E7D50" }}>
                  فعّال
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: "1px solid #EDE2F1" }}>
                <span dir="ltr" style={{ fontFamily: "var(--font-rubik), sans-serif", fontSize: 13, fontWeight: 700, color: "#7B4687", background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px", width: 92, textAlign: "center" }}>
                  HYDRA2026
                </span>
                <div style={{ flex: 1, minWidth: "0" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
                    باقة هيدرافيشل بسعر خاص
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, borderRadius: 3, background: "#ECE2EF", overflow: "hidden" }}>
                        <div style={{ width: "20%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "#866F8D", whiteSpace: "nowrap" }}>
                      3 / 15 استخدام
                    </span>
                  </div>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#FBEAF1", color: "#B03D6A" }}>
                  مجدول
                </span>
              </div>
            </div>
            <div style={{ marginTop: "auto", borderRadius: 18, padding: "12px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="calcheck" color="#A877B6" size={15} />
                </span>
                <span style={{ fontSize: 13, color: "#76607E" }}>
                  حجوزات تمت عبر الأكواد
                </span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#7B4687" }}>
                103
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
