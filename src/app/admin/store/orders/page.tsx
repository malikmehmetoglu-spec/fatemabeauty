"use client";

/** W_Orders.dc.html — الطلبات والتوصيل. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { ORDERS } from "@/lib/mock/h";
import { ch, css } from "@/app/admin/_h/css";

export default function Page() {
  const [col, setCol] = useState([0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 3, 3]);
  const [f, setF] = useState(0);
  const F = ["كل الطلبات", "توصيل للمنزل", "استلام من المركز"];
  type Card = (typeof ORDERS)[number] & { mode: string; can: boolean; tst: string; next: () => void };
  const cols: Card[][] = [[], [], [], []];
  ORDERS.forEach((o, i) => {
    if (f === 1 && !o.d) return;
    if (f === 2 && o.d) return;
    const c = col[i];
    cols[c].push({
      ...o, mode: o.d ? "توصيل" : "استلام", can: c < 3,
      tst: "height:24px;padding:0 10px;border-radius:12px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;" + (o.d ? "background:#F3EAF6;color:#B03D6A" : "background:#E6F4EC;color:#2E7D50"),
      next: () => { const a = col.slice(); a[i] = Math.min(3, a[i] + 1); setCol(a); },
    });
  });
  const cc = cols.map((c) => ({ items: c.slice(0, 3), n: c.length }));
  const v = {
    filters: F.map((name, i) => ({ name, style: ch(f === i, 36), pick: () => setF(i) })),
    c0: cc[0], c1: cc[1], c2: cc[2], c3: cc[3],
    k_open: col.filter((c) => c < 3).length, k_done: col.filter((c) => c === 3).length,
    k_del: ORDERS.filter((o) => o.d).length, k_pick: ORDERS.filter((o) => !o.d).length,
  };
  return (
    <AdminShell
      active="المتجر"
      title="الطلبات والتوصيل"
      subtitle="طلبات متجر التطبيق — توصيل للمنزل أو استلام من المركز"
      actions={
        <>
          <Link href={R.W_Products} style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.white, color: C.accent, border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.3 9h11.4a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 16.4 21H7.6a2 2 0 0 1-2-1.7l-1.3-8A2 2 0 0 1 6.3 9zM9 11V6a3 3 0 0 1 6 0v5" />
            </svg>
            المنتجات
          </Link>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
            <span style={{ position: "relative", width: 42, height: 42, borderRadius: 21, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8D6F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.3 9h11.4a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 16.4 21H7.6a2 2 0 0 1-2-1.7l-1.3-8A2 2 0 0 1 6.3 9zM9 11V6a3 3 0 0 1 6 0v5" />
              </svg>
            </span>
            <div style={{ position: "relative", lineHeight: "1.25" }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>طلبات قيد العمل</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v.k_open}</div>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 6h5l3 5v6h-2" />
              </svg>
            </span>
            <div style={{ lineHeight: "1.25" }}>
              <div style={{ fontSize: 12.5, color: C.sub2 }}>توصيل للمنزل</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v.k_del}</div>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
              </svg>
            </span>
            <div style={{ lineHeight: "1.25" }}>
              <div style={{ fontSize: 12.5, color: C.sub2 }}>استلام من المركز</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v.k_pick}</div>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: 24, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            <div style={{ lineHeight: "1.25" }}>
              <div style={{ fontSize: 12.5, color: C.sub2 }}>سُلِّمت</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v.k_done}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {v.filters.map((f, fI) => (
            <Fragment key={fI}>
              <button type="button" onClick={f.pick} style={css(f.style, "button")}>{f.name}</button>
            </Fragment>
          ))}
          <span style={{ marginInlineStart: "auto", fontSize: 12.5, color: C.sub2, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#866F8D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
            </svg>
            كل طلب يُخصم تلقائياً من مخزون المركز
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "14px 12px", background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: 10, boxSizing: "content-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                </svg>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>جديد</span>
              <span style={{ marginInlineStart: "auto", minWidth: 26, height: 26, borderRadius: 13, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", fontSize: 12.5, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{v.c0.n}</span>
            </div>
            {v.c0.items.map((o, oI) => (
              <Fragment key={oI}>
                <div style={{ borderRadius: 22, padding: "12px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>#{o.no}</span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>{o.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", boxSizing: "content-box" }}>{o.ini}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>{o.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={css(o.tst)}>{o.mode}</span>
                    <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>{o.pay}</span>
                    {o.can && (
                      <>
                        <button type="button" onClick={o.next} aria-label="نقل للمرحلة التالية" style={{ marginInlineStart: "auto", width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 6l-6 6 6 6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "14px 12px", background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: 10, boxSizing: "content-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
                </svg>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>قيد التجهيز</span>
              <span style={{ marginInlineStart: "auto", minWidth: 26, height: 26, borderRadius: 13, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", fontSize: 12.5, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{v.c1.n}</span>
            </div>
            {v.c1.items.map((o, oI) => (
              <Fragment key={oI}>
                <div style={{ borderRadius: 22, padding: "12px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>#{o.no}</span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>{o.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", boxSizing: "content-box" }}>{o.ini}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>{o.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={css(o.tst)}>{o.mode}</span>
                    <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>{o.pay}</span>
                    {o.can && (
                      <>
                        <button type="button" onClick={o.next} aria-label="نقل للمرحلة التالية" style={{ marginInlineStart: "auto", width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 6l-6 6 6 6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "14px 12px", background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: 10, boxSizing: "content-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M5 17H3V6a1 1 0 0 1 1-1h9v12M9 17h6M13 6h5l3 5v6h-2" />
                </svg>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>خرج للتوصيل</span>
              <span style={{ marginInlineStart: "auto", minWidth: 26, height: 26, borderRadius: 13, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", fontSize: 12.5, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{v.c2.n}</span>
            </div>
            {v.c2.items.map((o, oI) => (
              <Fragment key={oI}>
                <div style={{ borderRadius: 22, padding: "12px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>#{o.no}</span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>{o.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", boxSizing: "content-box" }}>{o.ini}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>{o.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={css(o.tst)}>{o.mode}</span>
                    <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>{o.pay}</span>
                    {o.can && (
                      <>
                        <button type="button" onClick={o.next} aria-label="نقل للمرحلة التالية" style={{ marginInlineStart: "auto", width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 6l-6 6 6 6" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: "0", borderRadius: 28, padding: "14px 12px", background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: 10, boxSizing: "content-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 16, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>سُلِّم</span>
              <span style={{ marginInlineStart: "auto", minWidth: 26, height: 26, borderRadius: 13, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", fontSize: 12.5, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{v.c3.n}</span>
            </div>
            {v.c3.items.map((o, oI) => (
              <Fragment key={oI}>
                <div style={{ borderRadius: 22, padding: "12px 14px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span dir="ltr" style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 700, color: C.accent }}>#{o.no}</span>
                    <span style={{ fontSize: 11.5, color: C.muted }}>{o.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", boxSizing: "content-box" }}>{o.ini}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>{o.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", height: 16, padding: "0 6px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "#F0E9F1", color: C.sub2, marginInlineStart: 4, verticalAlign: "middle", boxSizing: "content-box" }}>مثال</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.items}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={css(o.tst)}>{o.mode}</span>
                    <span style={{ fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap" }}>{o.pay}</span>
                    {o.can && (
                      <>
                        <button type="button" onClick={o.next} aria-label="نقل للمرحلة التالية" style={{ marginInlineStart: "auto", width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 6l-6 6 6 6" />
                          </svg>
                        </button>
                      </>
                    )}
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

