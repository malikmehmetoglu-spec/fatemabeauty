"use client";

import { Fragment, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Icon, ExampleTag } from "@/components/ui";
import { C } from "@/lib/tokens";
import { arDate } from "@/lib/format";
import { TODAY, PERSONA, PERSONA_TODAY } from "@/lib/data";
import { CAMPAIGN_SEGMENTS, TEMPLATES, ch, css } from "@/lib/mock/g";

/** W_Campaigns.dc.html — الحملات والرسائل. */
export default function Page() {
  const [t, setT] = useState(0);
  const [seg, setSeg] = useState(0);
  const [chs, setChs] = useState([true, false]);
  const VALS: Record<string, string> = {
    "الاسم": PERSONA.name.split(" ")[0], "الخدمة": PERSONA_TODAY.serviceName, "الموعد": `اليوم ${arDate(TODAY)} الساعة ${PERSONA_TODAY.time}`,
    "الغرفة": PERSONA_TODAY.room, "رابط": "رابط التأكيد", "المهلة": "30 دقيقة",
  };
  const cur = TEMPLATES[t];
  const chip = "display:inline-block;line-height:26px;padding:0 10px;margin:0 2px;border-radius:13px;background:#F3EAF6;border:1px dashed #D8BFDE;color:#B03D6A;font-size:13px;font-weight:700";
  let len = 0;
  const segs = cur.text.split(/(\{[^}]+\})/).filter((x) => x).map((p) => {
    const isVar = p[0] === "{";
    const key = isVar ? p.slice(1, -1) : "";
    const val = isVar ? VALS[key] : p;
    len += val.length;
    return { t: p, v: val, ex: key === "الاسم", ed: isVar ? chip : "", pv: isVar ? (key === "رابط" ? "color:#B03D6A;text-decoration:underline;font-weight:600" : "font-weight:700;color:#7B4687") : "" };
  });
  const CH = ["واتساب", "SMS"];
  const v = {
    tpls: TEMPLATES.map((x, i) => ({
      name: x.name, icon: x.icon, when: x.when, pick: () => { setT(i); setSeg(x.seg); },
      style: "width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:20px;font-family:inherit;cursor:pointer;" +
        (t === i ? "background:linear-gradient(160deg,#F7EDF9,#E8D0ED);border:1px solid #FFFFFF;box-shadow:0 8px 18px rgba(150,100,170,0.22)" : "background:#FFFFFF;border:1px solid #EDE2F1"),
    })),
    cur: { name: cur.name, when: cur.when.replace("تلقائي · ", ""), segs, len },
    segs: CAMPAIGN_SEGMENTS.map((g, i) => ({ name: g[0] + " · " + g[1], style: ch(seg === i, 36), pick: () => setSeg(i) })),
    aud: CAMPAIGN_SEGMENTS[seg][1],
    chans: CH.map((c, i) => ({
      name: c, style: ch(chs[i], 34),
      toggle: () => { const a = chs.slice(); a[i] = !a[i]; if (!a[0] && !a[1]) a[i] = true; setChs(a); },
    })),
    chan_label: CH.filter((c, i) => chs[i]).join(" + "),
  };
  return (
    <AdminShell active="التسويق والولاء" title="الحملات والرسائل" subtitle="قوالب الرسائل التلقائية وإرسال الحملات عبر واتساب و SMS" actions={<>
      <button style={{ height: 36, borderRadius: 18, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#FFFFFF", color: "#7B4687", border: "1px solid #FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        <Icon name="history" color="#7B4687" size={16} stroke={1.9} />
        سجل الإرسال
      </button>
    </>}>
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", minHeight: "0", flex: 1 }}>
        <div style={{ borderRadius: 26, padding: "18px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", width: 312, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="msg" color="#A877B6" size={16} />
              </span>
              <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#35213D" }}>
                  القوالب
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  واتساب و SMS
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {v.tpls.map((t, t_i) => (
              <Fragment key={t_i}>
                <button onClick={t.pick} style={css(t.style)}>
                  <span style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={t.icon} color="#A877B6" size={18} />
                  </span>
                  <span style={{ flex: 1, minWidth: "0", textAlign: "right", lineHeight: 1.4 }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#35213D" }}>
                      {t.name}
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: "#866F8D" }}>
                      {t.when}
                    </span>
                  </span>
                </button>
              </Fragment>
            ))}
          </div>
          <div style={{ marginTop: "auto" }}>
            <button style={{ height: 40, borderRadius: 20, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: "#F3EAF6", color: "#7B4687", border: "1px solid #EFE0F2", width: "100%" }}>
              <Icon name="plus" color="#7B4687" size={16} stroke={1.9} />
              قالب جديد
            </button>
          </div>
        </div>
        <div style={{ borderRadius: 26, padding: "20px 22px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" color="#A877B6" size={16} />
              </span>
              <div style={{ lineHeight: 1.3, minWidth: "0" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#35213D" }}>
                  {v.cur.name}
                </div>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  محرّر الرسالة
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {v.chans.map((c, c_i) => (
                <Fragment key={c_i}>
                  <button onClick={c.toggle} style={css(c.style)}>
                    {c.name}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 14, borderRadius: 22, background: "#F9F5FB", border: "1px solid #EADCF0", padding: "16px 18px", minHeight: 128, fontSize: 15, lineHeight: 2.1, color: "#35213D" }}>
            {v.cur.segs.map((g, g_i) => (
              <Fragment key={g_i}>
                <span style={css(g.ed)}>
                  {g.t}
                </span>
              </Fragment>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#866F8D" }}>
              أدرجي متغيراً:
            </span>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}الاسم{"}"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}الموعد{"}"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}الخدمة{"}"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}الغرفة{"}"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}المهلة{"}"}
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 15, background: "#F3EAF6", border: "1px dashed #D8BFDE", color: "#B03D6A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {"{"}رابط{"}"}
            </button>
            <span style={{ marginInlineStart: "auto", fontSize: 12, color: "#A595AC" }}>
              {v.cur.len} حرفاً
            </span>
          </div>
          <div style={{ height: 1, background: "#EDE2F1", margin: "16px 0" }} />
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            الجمهور
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {v.segs.map((g, g_i) => (
              <Fragment key={g_i}>
                <button onClick={g.pick} style={css(g.style)}>
                  {g.name}
                </button>
              </Fragment>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1, borderRadius: 22, padding: "14px 18px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="users" color="#A877B6" size={20} />
              </span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  حجم الجمهور
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: "#7B4687" }}>
                  {v.aud}{" "}
                  <span style={{ fontSize: 14 }}>
                    مراجعة
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: 22, padding: "14px 18px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="clock" color="#A877B6" size={20} />
              </span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 12, color: "#866F8D" }}>
                  موعد الإرسال
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {v.cur.when}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 2px", borderBottom: "1px solid #EDE2F1" }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  أزرار تأكيد وإلغاء في الرسالة
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                  الرد بضغطة يحدّث الموعد تلقائياً
                </div>
              </div>
              <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 2px", borderBottom: "1px solid #EDE2F1" }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  نسخة إنجليزية
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                  لمن اختارت اللغة الإنجليزية في التطبيق
                </div>
              </div>
              <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 2px", borderBottom: "1px solid #EDE2F1" }}>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  SMS عند عدم توفر واتساب
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                  إرسال بديل تلقائي
                </div>
              </div>
              <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button style={{ height: 52, borderRadius: 26, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: "#FFFFFF", fontSize: 17, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px", flex: 1, fontSize: 15 }}>
              <Icon name="send" color="#FFFFFF" size={19} stroke={1.9} />
              إرسال للجمهور المحدد
            </button>
            <button style={{ height: 52, borderRadius: 26, border: "1px solid #FFFFFF", background: "#FFFFFF", boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: "#7B4687", fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 20px" }}>
              <Icon name="phone" color="#7B4687" size={18} stroke={1.9} />
              رسالة تجريبية
            </button>
          </div>
        </div>
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ width: 286, flex: 1, borderRadius: 42, background: "#FFFFFF", padding: 10, boxShadow: "0 24px 50px rgba(123,70,135,0.22), 0 4px 10px rgba(123,70,135,0.08)", border: "1px solid #F0E6F3" }}>
            <div style={{ height: "100%", borderRadius: 34, overflow: "hidden", display: "flex", flexDirection: "column", background: "linear-gradient(170deg, #F2E6F5, #F9F5FB)" }}>
              <div style={{ padding: "26px 16px 12px", display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #EEE4F1" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="sparkle" color="#FFFFFF" size={18} />
                </span>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    فاطمة بيوتي
                  </div>
                  <div style={{ fontSize: 10.5, color: "#3FA46A" }}>
                    حساب أعمال
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ alignSelf: "center", fontSize: 10.5, color: "#866F8D", background: "rgba(255,255,255,0.8)", padding: "3px 10px", borderRadius: 10 }}>
                  اليوم
                </div>
                <div style={{ alignSelf: "flex-start", maxWidth: 236, background: "#FFFFFF", borderRadius: "18px 18px 18px 4px", padding: "10px 12px 6px", boxShadow: "0 4px 12px rgba(123,70,135,0.08)", fontSize: 13, lineHeight: 1.75, color: "#35213D" }}>
                  {v.cur.segs.map((g, g_i) => (
                    <Fragment key={g_i}>
                      <span style={css(g.pv)}>
                        {g.v}
                      </span>
                      {g.ex && (
                        <>
                          <ExampleTag />
                        </>
                      )}
                    </Fragment>
                  ))}
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, fontSize: 10, color: "#A595AC", marginTop: 2 }} dir="ltr">
                    12:30{" "}
                    <Icon name="check" color="#5BA3D9" size={12} stroke={2.2} />
                  </div>
                </div>
                <div style={{ alignSelf: "flex-end", display: "flex", gap: 6, marginTop: 4 }}>
                  <span style={{ height: 30, padding: "0 14px", borderRadius: 15, background: "#FFFFFF", border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: "#7B4687", display: "flex", alignItems: "center" }}>
                    تأكيد
                  </span>
                  <span style={{ height: 30, padding: "0 14px", borderRadius: 15, background: "#FFFFFF", border: "1px solid #EADCF0", fontSize: 12, fontWeight: 600, color: "#B03D6A", display: "flex", alignItems: "center" }}>
                    إلغاء
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#866F8D" }}>
            معاينة لـ{" "}
            <span style={{ fontSize: 12, fontWeight: 600, color: "#35213D", whiteSpace: "nowrap" }}>
              {PERSONA.name}
            </span>
            <ExampleTag />
            {" "}· {v.chan_label}
          </div>
          <div style={{ borderRadius: 22, padding: "12px 16px", background: "#FFFFFF", border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ lineHeight: 1.4 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  ساعات الهدوء
                </div>
                <div style={{ fontSize: 11.5, color: "#866F8D" }}>
                  لا إرسال للعروض بين 22:00 و 9:00
                </div>
              </div>
              <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
