"use client";

/** W_Products.dc.html — المنتجات. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { css, tg } from "@/app/admin/_h/css";
import { PRODUCTS } from "@/lib/mock/h";

export default function Page() {
  const [vis, setVis] = useState([true, true, true, true, true, false, false, true]);
  const [recs, setRecs] = useState([true, true, false, true, false, false, false, true]);
  const rows = PRODUCTS.map((p, i) => {
    const out = p.stock === 0, low = p.stock > 0 && p.stock <= 5;
    const on = vis[i] && !out, rec = recs[i];
    const sst = "display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:14px;font-size:12.5px;font-weight:600;text-decoration:none;" +
      (out ? "background:#F3EAF6;color:#B03D6A" : low ? "background:#FCF1DE;color:#8A5A12" : "background:#F0EDF0;color:#695D6B");
    return {
      ...p, stock: out ? "نفد · طلب شراء" : p.stock + " وحدة" + (low ? " · منخفض" : ""), sst, on,
      vst: tg(on) + (out ? ";opacity:0.5;cursor:not-allowed" : ""),
      tv: () => { if (out) return; const a = vis.slice(); a[i] = !a[i]; setVis(a); },
      rst: "width:34px;height:34px;border-radius:17px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid " + (rec ? "#FFFFFF" : "#EADCF0") + ";background:" + (rec ? "linear-gradient(160deg,#FFF3DC,#F6D9A0)" : "#FFFFFF"),
      rf: rec ? "#E9A23B" : "#FFFFFF", rs: rec ? "#D98F26" : "#D2C3D5", rec,
      tr: () => { const a = recs.slice(); a[i] = !a[i]; setRecs(a); },
    };
  });
  const v = { rows, vis: PRODUCTS.filter((p, i) => vis[i] && p.stock > 0).length, rec: recs.filter((x) => x).length };
  return (
    <AdminShell
      active="المتجر"
      title="المنتجات"
      subtitle="منتجات العناية المعتمدة من المركز في متجر التطبيق"
      actions={
        <>
          <Link href={R.W_Orders} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 6h5l3 5v6h-2" />
            </svg>
            الطلبات
          </Link>
          <button type="button" style={{ height: 46, borderRadius: 23, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, border: "none", padding: "0 20px", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            منتج جديد
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", boxSizing: "content-box" }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.onDark }}>ظاهرة في المتجر</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6" />
              </svg>
            </div>
            <div style={{ position: "relative", fontSize: 30, fontWeight: 700, lineHeight: "1.25", marginTop: 6 }}>
              {v.vis}{" "}
              <span style={{ fontSize: 15, color: C.onDark }}>من 8</span>
            </div>
            <div style={{ position: "relative", fontSize: 12, color: C.onDark }}>المتجر مربوط بالمخزون — لا بيع لصنف نافد</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.sub2 }}>موصى بها من الأخصائية</span>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25" }}>{v.rec}</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>تظهر جاهزة في سلة المراجعة بعد الجلسة</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>مخزون منخفض</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l10 18H2zM12 10v5M12 18v.01" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25", marginTop: 4, color: C.ink }}>1</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>أقل من الحد الأدنى</div>
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, color: C.sub2 }}>نفدت</div>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
                </svg>
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: "1.25", marginTop: 4, color: C.ink }}>1</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>مخفية تلقائياً من المتجر</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub2, padding: "0 6px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
          </svg>
          أسعار تقريبية من رصد السوق — تُعدَّل من قائمة المركز
          <span style={{ marginInlineStart: "auto", color: C.muted }}>— : لا يتوفر سعر مرصود بعد</span>
        </div>
        <div style={{ borderRadius: 26, padding: "6px 22px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 42, fontSize: 12, color: C.sub2, fontWeight: 600 }}>
            <div style={{ flex: 2.6 }}>المنتج</div>
            <div style={{ flex: 1.2 }}>الفئة</div>
            <div style={{ flex: 0.7 }}>السعر التقريبي</div>
            <div style={{ flex: 1.1 }}>المخزون</div>
            <div style={{ flex: 0.9 }}>ظاهر في المتجر</div>
            <div style={{ flex: 0.7 }}>موصى به</div>
            <div style={{ width: 34 }} />
          </div>
          {v.rows.map((r, rI) => (
            <Fragment key={rI}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 54, borderTop: "1px solid #EDE2F1", boxSizing: "content-box" }}>
                <div style={{ flex: 2.6, display: "flex", alignItems: "center", gap: 12, minWidth: "0" }}>
                  <span style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={r.icon} />
                    </svg>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                </div>
                <div style={{ flex: 1.2, fontSize: 13, color: C.sub }}>{r.cat}</div>
                <div style={{ flex: 0.7, lineHeight: "1.2" }}>
                  <div style={css(r.pst)}>{r.price}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{r.size}</div>
                </div>
                <div style={{ flex: 1.1 }}>
                  <Link href={R.W_Inventory} style={css(r.sst)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
                    </svg>
                    {r.stock}
                  </Link>
                </div>
                <div style={{ flex: 0.9 }}>
                  <button type="button" aria-label="إظهار في المتجر" role="switch" aria-checked={r.on} onClick={r.tv} style={css(r.vst)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={{ flex: 0.7 }}>
                  <button type="button" aria-label="موصى به" aria-pressed={r.rec} onClick={r.tr} style={css(r.rst)}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill={r.rf} stroke={r.rs} strokeWidth="1.7" strokeLinejoin="round">
                      <path d="M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z" />
                    </svg>
                  </button>
                </div>
                <div style={{ width: 34 }}>
                  <button type="button" aria-label="تعديل المنتج" style={{ width: 34, height: 34, borderRadius: 17, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "content-box" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

