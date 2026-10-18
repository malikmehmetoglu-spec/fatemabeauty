"use client";

/** W_CallSettings.dc.html — إعدادات النداء والشاشة. */
import ac from "../../adminPages.module.css";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, GhostButton, Loading, Modal, SubmitButton, TextArea, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { ch, css, tg } from "@/app/admin/_h/css";
import { CALL_DEFAULT, TV_DEFAULT, getSetting, saveSetting, speakCall, type CallSettings, type TvContent, type TvTip } from "@/lib/db/queue";
import { useQuery } from "@/lib/db/query";
import { useTv } from "@/app/tv/tv";

type Tip = TvTip & { on?: boolean };
type Draft = CallSettings & { rate?: number; tips: Tip[]; interval_s: number };
const TIP_ICON = "M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6";

export default function Page() {
  const q = useQuery(["settings", "call+tv"], async () => {
    const [call, tv] = await Promise.all([getSetting<CallSettings & { rate?: number }>("call", CALL_DEFAULT), getSetting<TvContent>("tv_content", TV_DEFAULT)]);
    return { call, tv };
  });
  const tv = useTv();
  const [s, setS0] = useState<Draft | null>(null);
  const [tested, setTested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ i: number; title: string; body: string; points: string } | null>(null);
  useEffect(() => {
    if (q.data && !s) setS0({ ...CALL_DEFAULT, ...q.data.call, tips: (q.data.tv.tips ?? []) as Tip[], interval_s: q.data.tv.interval_s ?? 12 });
  }, [q.data, s]);
  if (!s) return (
    <AdminShell active="الإعدادات" title="إعدادات النداء والشاشة" subtitle="الصوت وطريقة النداء ومحتوى شاشة الصالة">
      {q.error ? <ErrorNote>{q.error}</ErrorNote> : <Loading />}
    </AdminShell>
  );
  const set = (p: Partial<Draft>) => { setS0({ ...s, ...p }); setMsg(null); };
  const lang = s.languages.includes("en") ? 0 : 1;
  const callNow = tv.last ?? tv.next[0] ?? null;
  const n = callNow ? String(callNow.queue_no) : "1", room = callNow?.room ?? tv.board[0]?.room ?? "الغرفة";
  const rn = room.replace(/^غرفة\s*/, "");
  const enabledTips = s.tips.filter((t) => t.on !== false);
  const v = {
    voices: ["نسائي هادئ", "رجالي"].map((name, i) => ({ name, style: ch((s.voice === "male" ? 1 : 0) === i, 34), pick: () => set({ voice: i ? "male" : "female" }) })),
    langs: ["العربية ثم الإنجليزية", "العربية فقط"].map((name, i) => ({ name, style: ch(lang === i, 34), pick: () => set({ languages: i ? ["ar"] : ["ar", "en"] }) })),
    rep: s.repeat, inc: () => set({ repeat: Math.min(3, s.repeat + 1) }), dec: () => set({ repeat: Math.max(1, s.repeat - 1) }),
    tgc: tg(s.chime !== false), tch: () => set({ chime: s.chime === false }),
    chimes: ["ناعمة"].map((name) => ({ name, style: ch(s.chime !== false, 32) + (s.chime !== false ? "" : ";opacity:0.5"), pick: () => set({ chime: true }) })),
    vol: s.volume ?? 80, volw: (s.volume ?? 80) + "%", volk: "calc(" + (s.volume ?? 80) + "% - " + (s.volume ?? 80) * 0.24 + "px)",
    setvol: (e: React.ChangeEvent<HTMLInputElement>) => set({ volume: +e.target.value }),
    pl: s.tips.map((p, i) => ({ name: p.title || p.body, kind: "نصيحة", dur: s.interval_s, icon: TIP_ICON, on: p.on !== false, tg: tg(p.on !== false),
      t: () => set({ tips: s.tips.map((x, j) => (j === i ? { ...x, on: x.on === false } : x)) }), edit: () => setEdit({ i, title: p.title, body: p.body, points: (p.points ?? []).join("\n") }) })),
    now: enabledTips[0] ? (enabledTips[0].title || enabledTips[0].body) : "لا يوجد محتوى مفعّل — يظهر شريط الدور فقط",
    test: () => { setTested(true); speakCall(Number(n), callNow?.room ?? null, s); },
    ann: (s.chime !== false ? "نغمة · " : "") + "الرقم " + n + "، " + room + (lang === 0 ? " — Number " + n + (/^\d+$/.test(rn) ? ", Room " + rn : "") : "") + (s.repeat > 1 ? " (×" + s.repeat + ")" : ""),
    annst: "display:flex;align-items:center;gap:8px;border-radius:16px;padding:10px 14px;font-size:13px;font-weight:600;color:#7B4687;background:#FFFFFF;border:1px solid #DEC6E8;" + (tested ? "" : "opacity:0.55"),
  };
  const save = async () => {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const { tips, interval_s, ...call } = s;
      await saveSetting("call", call);
      await saveSetting("tv_content", { tips, interval_s });
      setMsg("تم الحفظ — تتحدّث الشاشة خلال دقيقة");
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    setBusy(false);
  };
  const saveTip = () => {
    if (!edit) return;
    const tip: Tip = { title: edit.title.trim(), body: edit.body.trim(), points: edit.points.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 4), on: true };
    if (!tip.title && !tip.body) return;
    set({ tips: edit.i < 0 ? [...s.tips, tip] : s.tips.map((x, j) => (j === edit.i ? { ...tip, on: x.on } : x)) });
    setEdit(null);
  };
  const removeTip = () => { if (!edit || edit.i < 0) return; set({ tips: s.tips.filter((_, j) => j !== edit.i) }); setEdit(null); };
  return (
    <AdminShell
      active="الإعدادات"
      title="إعدادات النداء والشاشة"
      subtitle="الصوت وطريقة النداء ومحتوى شاشة الصالة"
      actions={
        <>
          {msg && <span style={{ fontSize: 13, color: C.okDeep, fontWeight: 600 }}>{msg}</span>}
          <SubmitButton onClick={save} busy={busy}>حفظ الإعدادات</SubmitButton>
        </>
      }
    >
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className={ac.split} style={{ alignItems: "stretch", flex: 1 }}>
        <div className={ac.grow} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>صوت النداء</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>يُشغَّل على شاشة الصالة</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>الصوت</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {v.voices.map((c, cI) => (
                      <Fragment key={cI}>
                        <button type="button" onClick={c.pick} style={css(c.style, "button")}>{c.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>اللغة والترتيب</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {v.langs.map((c, cI) => (
                      <Fragment key={cI}>
                        <button type="button" onClick={c.pick} style={css(c.style, "button")}>{c.name}</button>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>عدد مرات التكرار</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" aria-label="إنقاص" onClick={v.dec} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, width: 24, textAlign: "center" }}>{v.rep}</span>
                    <button type="button" aria-label="زيادة" onClick={v.inc} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>نغمة التنبيه قبل النداء</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" aria-label="نغمة التنبيه" role="switch" aria-checked={s.chime} onClick={v.tch} style={css(v.tgc, "button")}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                    </button>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {v.chimes.map((c, cI) => (
                        <Fragment key={cI}>
                          <button type="button" onClick={c.pick} style={css(c.style, "button")}>{c.name}</button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>مستوى الصوت</div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{v.vol}%</span>
                </div>
                <div style={{ position: "relative", height: 26, display: "flex", alignItems: "center", marginTop: 4 }}>
                  <div style={{ position: "absolute", inset: "9px 0", borderRadius: 4, background: "#ECE2EF" }} />
                  <div style={{ position: "absolute", top: 9, bottom: 9, right: "0", width: v.volw, borderRadius: 4, background: "linear-gradient(270deg,#C9A2D8,#7B4687)" }} />
                  <div style={{ position: "absolute", top: 1, right: v.volk, width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 3px 8px rgba(123,70,135,0.25)", border: "2px solid #C9A2D8" }} />
                  <input aria-label="مستوى الصوت" type="range" min="0" max="100" value={v.vol} onChange={v.setvol} style={{ position: "absolute", inset: "0", width: "100%", opacity: 0, cursor: "pointer", margin: "0", direction: "rtl" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "stretch", minHeight: "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>سرعة النطق</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {[["هادئة", 0.85], ["عادية", 1]].map(([name, r]) => (
                      <button key={name} type="button" onClick={() => set({ rate: r as number })} style={css(ch((s.rate ?? 0.9) < 0.95 ? r === 0.85 : r === 1, 34), "button")}>{name}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: "0", minHeight: "0", flex: 1.3 }}>
                  <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>يُشغَّل على</div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent, boxSizing: "content-box" }}>شاشة الصالة</span>
                    <span style={{ height: 34, padding: "0 14px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)", boxSizing: "content-box" }}>سماعة الاستقبال</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>طريقة النداء</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>قرار معتمد للخصوصية</div>
                </div>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>معتمد</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 18, padding: "10px 14px", background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 10px 22px rgba(150,100,170,0.30)", color: C.accent }}>
                <div style={{ lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>النداء بالرقم فقط</div>
                  <div style={{ fontSize: 11.5, color: C.sub }}>«الرقم {n}، {room}»</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
                  </svg>
                  <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-end", background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 14px rgba(123,70,135,0.30)" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 18, padding: "10px 14px", background: "#F6F3F7", border: "1px dashed #E1D6E3", opacity: 0.8 }}>
                <div style={{ lineHeight: "1.35" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.sub }}>النداء بالاسم</div>
                  <div style={{ fontSize: 11.5, color: C.sub2 }}>معطّل — لا يُذكر اسم المراجعة صوتاً أو على الشاشة</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0 1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
                  </svg>
                  <span style={{ width: 52, height: 30, borderRadius: 15, padding: 3, flexShrink: 0, display: "flex", justifyContent: "flex-start", background: "#E6DDE8" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }} />
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12.5, color: C.sub, lineHeight: "1.6" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 11v5M12 8v.01" />
                </svg>
                يُنطق الرقم بالصوت المتوفر في متصفح شاشة الصالة (Web Speech). المسي الشاشة مرة بعد تشغيلها ليُسمح لها بالنطق.
              </div>
              <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600 }}>ما يظهر على شاشة الصالة</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  رقم الدور
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  الغرفة
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#E6F4EC", color: C.okDeep, boxSizing: "content-box" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  الرقم التالي
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#F4F1F5", color: C.muted, textDecoration: "line-through", boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  اسم المراجعة
                </span>
                <span style={{ height: 30, padding: "0 12px", borderRadius: 15, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, background: "#F4F1F5", color: C.muted, textDecoration: "line-through", boxSizing: "content-box" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A595AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  الخدمة
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={ac.side} style={{ ["--side" as string]: "470px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ borderRadius: 22, padding: 8, background: "#281B2B", boxShadow: "0 22px 44px rgba(53,33,61,0.35)" }}>
              <div style={{ height: 254, borderRadius: 15, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, position: "relative", overflow: "hidden", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>فاطمة بيوتي</span>
                  <span style={{ fontSize: 13, fontFamily: "var(--font-rubik), sans-serif", color: C.onDark }}>{tv.time}</span>
                </div>
                <div style={{ position: "relative", display: "flex", gap: 8 }}>
                  {tv.board.length === 0 && <div style={{ flex: 1, fontSize: 13, color: C.onDark, textAlign: "center", padding: "24px 0" }}>تظهر الغرف هنا بعد إضافتها</div>}
                  {tv.board.slice(0, 4).map((b) => (
                  <div key={b.room} style={{ flex: 1, borderRadius: 16, padding: "10px 8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", textAlign: "center", lineHeight: "1.2" }}>
                    <div style={{ fontSize: 11, color: C.onDark }}>{b.room}</div>
                    <div style={{ fontSize: 34, fontWeight: 700 }}>{b.cur}</div>
                    <div style={{ fontSize: 10.5, color: C.onDark }}>التالي {b.next}</div>
                  </div>
                  ))}
                </div>
                <div style={{ position: "relative", borderRadius: 14, padding: "9px 12px", background: "rgba(255,255,255,0.92)", color: C.accent, display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                  </svg>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{v.now}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span style={{ width: 90, height: 8, borderRadius: 4, background: "#D3C6D6" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={v.test} style={{ flex: 1, height: 48, borderRadius: 24, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                </svg>
                تجربة النداء
              </button>
              <Link href={R.TV_Board} style={{ height: 48, padding: "0 18px", borderRadius: 24, background: C.white, boxShadow: "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", color: C.accent, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, boxSizing: "content-box" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
                </svg>
                فتح الشاشة
              </Link>
            </div>
            <div style={css(v.annst)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
              </svg>
              <span>{v.ann}</span>
            </div>
          </div>
          <div style={{ borderRadius: 26, padding: "16px 20px 8px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)", position: "relative", flex: 1, minWidth: "0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "0" }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" />
                  </svg>
                </span>
                <div style={{ lineHeight: "1.3", minWidth: "0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>محتوى الشاشة</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>نصائح تظهر بين النداءات · كل نصيحة {s.interval_s} ثانية</div>
                </div>
              </div>
              <button type="button" onClick={() => setEdit({ i: -1, title: "", body: "", points: "" })} style={{ height: 32, borderRadius: 16, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: C.tint, color: C.accent, border: "1px solid #EFE0F2" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                إضافة
              </button>
            </div>
            <div style={{ marginTop: 6 }}>
              {v.pl.length === 0 && <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>لا يوجد محتوى بعد — تعرض الشاشة شريط الدور فقط. أضيفي نصيحة عناية لتظهر بين النداءات.</div>}
              {v.pl.map((p, pI) => (
                <Fragment key={pI}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
                    <button type="button" onClick={p.edit} aria-label="تعديل" style={{ border: "none", background: "transparent", color: "#A877B6", fontSize: 13, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>تعديل</button>
                    <span style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={p.icon} />
                      </svg>
                    </span>
                    <div style={{ flex: 1, minWidth: "0", lineHeight: "1.35" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: C.sub2 }}>{p.kind}{" · "}{p.dur}{" ثانية"}</div>
                    </div>
                    <button type="button" aria-label="تفعيل المحتوى" role="switch" aria-checked={p.on} onClick={p.t}
 style={css(p.tg, "button")}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: C.white, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", display: "block" }} />
                    </button>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit && edit.i >= 0 ? "تعديل النصيحة" : "نصيحة جديدة"}
        footer={<>{edit && edit.i >= 0 && <GhostButton onClick={removeTip} color={C.danger}>حذف</GhostButton>}<GhostButton onClick={() => setEdit(null)}>إلغاء</GhostButton><SubmitButton onClick={saveTip} disabled={!edit?.title.trim() && !edit?.body.trim()}>تم</SubmitButton></>}>
        {edit && <>
          <TextInput label="العنوان" value={edit.title} onChange={(x) => setEdit({ ...edit, title: x })} placeholder="مثلاً: واقي الشمس يومياً" />
          <TextArea label="النص" value={edit.body} onChange={(x) => setEdit({ ...edit, body: x })} rows={3} />
          <TextArea label="نقاط قصيرة (سطر لكل نقطة، حتى 4)" value={edit.points} onChange={(x) => setEdit({ ...edit, points: x })} rows={4} />
        </>}
      </Modal>
    </AdminShell>
  );
}

