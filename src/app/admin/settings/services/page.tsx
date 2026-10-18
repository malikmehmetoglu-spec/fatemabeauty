"use client";

/** W_Services.dc.html — الخدمات والأسعار. */
import Link from "next/link";
import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { APPOINTMENTS_TODAY, COUNT_TODAY, DEVICES, PACKAGES, ROOMS, SERVICES, TODAY } from "@/lib/data";
import { arDate, money } from "@/lib/format";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { ch, css, fmt, tg } from "@/app/admin/_h/css";
import { SERVICE_ICON } from "@/lib/mock/h";

export default function Page() {
  const [sel, setSel] = useState<number | null>(1);
  const [on, setOn] = useState([true, true, true, true, true]);
  const [durs, setDurs] = useState<Record<number, number>>({});
  const [rooms, setRooms] = useState<Record<number, string>>({});
  const S = SERVICES.map((x) => ({
    key: x.key, name: x.name, minutes: x.minutes, room: x.room, icon: SERVICE_ICON[x.key],
    price: x.price === 0 ? "مجانية" : (x.from ? "من " : "") + money(x.price),
    device: DEVICES.find((d) => x.key === "hydra" ? d.name.includes("هيدرافيشل") : x.key === "laser" ? d.name.includes("الليزر") : false)?.name ?? "—",
  }));
  const counts = S.map((x) => APPOINTMENTS_TODAY.filter((a) => a.service === x.key).length);
  const maxCount = Math.max(...counts);
  const cur = S[sel === null ? 0 : sel];
  const dur = (sel !== null ? durs[sel] : undefined) ?? cur.minutes;
  const room = (sel !== null ? rooms[sel] : undefined) ?? cur.room;
  const v = {
    rows: S.map((r, i) => ({
      ...r, on: on[i], tgs: tg(on[i]), tg: () => { const a = on.slice(); a[i] = !a[i]; setOn(a); },
      edit: () => setSel(i),
      rst: "display:flex;align-items:center;gap:12px;height:62px;border-top:1px solid #EDE2F1;margin:0 -12px;padding:0 12px;border-radius:18px;" + (sel === i ? "background:linear-gradient(90deg,#FFFFFF,#F7EDF9)" : ""),
    })),
    open: sel !== null,
    cur: { ...cur, pnum: fmt(SERVICES[sel ?? 0].price) },
    durs: [20, 30, 45, 60, 90].map((d) => ({ name: d + " د", style: ch(d === dur, 36), pick: () => sel !== null && setDurs({ ...durs, [sel]: d }) })),
    rooms: ROOMS.map((d) => ({ name: d, style: ch(d === room, 36), pick: () => sel !== null && setRooms({ ...rooms, [sel]: d }) })),
    close: () => setSel(null),
  };
  return (
    <AdminShell
      active="الإعدادات"
      title="الخدمات والأسعار"
      subtitle="مدد الخدمات وأسعارها وغرفها وأجهزتها"
      actions={
        <>
          <button type="button" style={{ height: 46, borderRadius: 23, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, border: "none", padding: "0 20px", fontSize: 14 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            خدمة جديدة
          </button>
        </>
      }
      overlay={
        <>
        {v.open && (
          <>
            <div style={{ position: "fixed", inset: "0", zIndex: 20, background: "rgba(94,51,105,0.10)" }}>
              <aside aria-label="تعديل الخدمة" style={{ position: "absolute", top: 16, bottom: 16, left: 16, width: 430, borderRadius: 32, background: C.white, boxShadow: "0 30px 70px rgba(123,70,135,0.30)", padding: "24px 26px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -90, right: -70, width: 260, height: 260, borderRadius: 130, background: "radial-gradient(circle, rgba(190,150,215,0.35) 0%, rgba(190,150,215,0) 70%)" }} />
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ lineHeight: "1.3" }}>
                    <div style={{ fontSize: 12.5, color: C.sub2 }}>تعديل الخدمة</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{v.cur.name}</div>
                  </div>
                  <button type="button" aria-label="إغلاق" onClick={v.close} style={{ width: 42, height: 42, borderRadius: 21, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 5 }}>
                  <label htmlFor="sname" style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>اسم الخدمة</label>
                  <input id="sname" key={"n" + sel} defaultValue={v.cur.name} style={{ height: 42, borderRadius: 21, background: "#F9F5FB", border: "1px solid #EADCF0", padding: "0 16px", fontSize: 14, fontWeight: 600, color: C.ink, outline: "none" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>المدة</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {v.durs.map((d, dI) => (
                      <Fragment key={dI}>
                        <button type="button" onClick={d.pick} style={css(d.style)}>{d.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative", display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    <label htmlFor="sprice" style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>السعر</label>
                    <div style={{ height: 42, borderRadius: 21, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", padding: "0 16px" }}>
                      <input id="sprice" key={"p" + sel} defaultValue={v.cur.pnum} style={{ flex: 1, minWidth: "0", border: "none", background: "transparent", outline: "none", fontSize: 15, fontWeight: 700, color: C.accent }} />
                      <span style={{ fontSize: 12, color: C.sub2 }}>ل.س</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>الجهاز</span>
                    <div style={{ height: 42, borderRadius: 21, background: "#F9F5FB", border: "1px solid #EADCF0", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>{v.cur.device}</div>
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>الغرفة الأساسية</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {v.rooms.map((d, dI) => (
                      <Fragment key={dI}>
                        <button type="button" onClick={d.pick} style={css(d.style)}>{d.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #EDE2F1" }}>
                    <div style={{ lineHeight: "1.35" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>قابلة للحجز من التطبيق</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>تظهر للمراجعات مع الأوقات المتاحة</div>
                    </div>
                    <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #EDE2F1" }}>
                    <div style={{ lineHeight: "1.35" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>تتطلب نموذج موافقة</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>يُوقَّع على التابلت قبل الجلسة</div>
                    </div>
                    <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid #EDE2F1" }}>
                    <div style={{ lineHeight: "1.35" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>استبيان أهلية قبل الإجراء</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>يُعرض عند تسجيل الوصول</div>
                    </div>
                    <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-start", background: "#E6DDE8" }}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                    </span>
                  </div>
                </div>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 5 }}>
                  <label htmlFor="sprep" style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>تعليمات قبل الجلسة (تُرسل مع التذكير)</label>
                  <textarea id="sprep" style={{ height: 70, resize: "none", borderRadius: 18, background: "#F9F5FB", border: "1px solid #EADCF0", padding: "10px 14px", fontSize: 13, lineHeight: "1.6", color: C.ink, outline: "none" }} defaultValue={"احضري دون مكياج، وأخبرينا بأي أدوية أو مستحضرات تستخدمينها حالياً."} />
                </div>
                <div style={{ position: "relative", display: "flex", gap: 10, marginTop: "auto" }}>
                  <button type="button" style={{ height: 52, borderRadius: 26, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px", flex: 1, fontSize: 15 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    حفظ التغييرات
                  </button>
                  <button type="button" onClick={v.close} style={{ height: 52, padding: "0 22px", borderRadius: 26, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 15, fontWeight: 600 }}>إلغاء</button>
                </div>
              </aside>
            </div>
          </>
        )}
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: "0", minHeight: "0", flex: 1 }}>
        <div style={{ borderRadius: 26, padding: "6px 22px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, height: 42, fontSize: 12, color: C.sub2, fontWeight: 600 }}>
            <div style={{ flex: 2.2 }}>الخدمة</div>
            <div style={{ flex: 0.8 }}>المدة</div>
            <div style={{ flex: 1 }}>السعر</div>
            <div style={{ flex: 0.9 }}>الغرفة الأساسية</div>
            <div style={{ flex: 1.2 }}>الجهاز</div>
            <div style={{ flex: 0.7 }}>مفعّلة</div>
            <div style={{ width: 36 }} />
          </div>
          {v.rows.map((r, rI) => (
            <Fragment key={rI}>
              <div style={css(r.rst)}>
                <div style={{ flex: 2.2, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={r.icon} />
                    </svg>
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{r.name}</span>
                </div>
                <div style={{ flex: 0.8, fontSize: 13.5 }}>{r.minutes}{" دقيقة"}</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.accent }}>{r.price}</div>
                <div style={{ flex: 0.9 }}>
                  <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: C.tint2, color: C.sub, fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, boxSizing: "content-box" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#76607E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
                    </svg>
                    {r.room}
                  </span>
                </div>
                <div style={{ flex: 1.2, fontSize: 13, color: C.sub }}>{r.device}</div>
                <div style={{ flex: 0.7 }}>
                  <button type="button" aria-label="تفعيل الخدمة" role="switch" aria-checked={r.on} onClick={r.tg}
 style={css(r.tgs)}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                  </button>
                </div>
                <div style={{ width: 36 }}>
                  <button type="button" aria-label="تعديل الخدمة" onClick={r.edit} style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "content-box" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h4L18.5 9.5a2.8 2.8 0 0 0-4-4L4 16v4M13.5 6.5l4 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
          <div style={{ borderRadius: 26, padding: "16px 20px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الباقات المرتبطة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>تُدار من صفحة الباقات والعروض</div>
                </div>
              </div>
              <Link href={R.W_Offers} style={{ height: 32, borderRadius: 16, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.tint, color: C.accent, border: "1px solid #EFE0F2" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 11 5 12 8c1-3 2.5-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                </svg>
                الباقات
              </Link>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c3.5 4.2 6 7.4 6 10.5a6 6 0 0 1-12 0C6 10.4 8.5 7.2 12 3z" />
                  </svg>
                </span>
                <div style={{ flex: 1, lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>باقة تنظيف عميق للبشرة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{money(PACKAGES[0].price)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                  </svg>
                </span>
                <div style={{ flex: 1, lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>باقة {PACKAGES[1].name}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{money(PACKAGES[1].price)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4L4 8l8 4 8-4-8-4M4 12l8 4 8-4M4 16l8 4 8-4" />
                  </svg>
                </span>
                <div style={{ flex: 1, lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>باقة تقشير البشرة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>6 جلسات بسعر 5</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{money(PACKAGES[2].price)}</span>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM15 9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الحجوزات اليوم حسب الخدمة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{COUNT_TODAY} موعداً · {arDate(TODAY)}</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 128, fontWeight: 600, whiteSpace: "nowrap" }}>تنظيف عميق للبشرة</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((counts[0] / maxCount) * 100)}%`, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 22, fontWeight: 700, color: C.accent }}>{counts[0]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 128, fontWeight: 600, whiteSpace: "nowrap" }}>هيدرافيشل</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((counts[1] / maxCount) * 100)}%`, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 22, fontWeight: 700, color: C.accent }}>{counts[1]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 128, fontWeight: 600, whiteSpace: "nowrap" }}>تقشير البشرة</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((counts[2] / maxCount) * 100)}%`, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 22, fontWeight: 700, color: C.accent }}>{counts[2]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 128, fontWeight: 600, whiteSpace: "nowrap" }}>جلسة ليزر</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((counts[3] / maxCount) * 100)}%`, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 22, fontWeight: 700, color: C.accent }}>{counts[3]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 128, fontWeight: 600, whiteSpace: "nowrap" }}>استشارة في المركز</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, borderRadius: 4, background: "#ECE2EF", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round((counts[4] / maxCount) * 100)}%`, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#C9A2D8,#7B4687)" }} />
                  </div>
                </div>
                <span style={{ width: 22, fontWeight: 700, color: C.accent }}>{counts[4]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

