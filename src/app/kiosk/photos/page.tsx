"use client";
 

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Stage } from "@/components/shell";
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { initials } from "@/lib/data";
import { isConsult, personName, savePhoto, serviceName } from "@/lib/db/queue";
import { css } from "../css";
import { BG, C, SH, SH_SOFT } from "@/lib/tokens";
import { ApptPicker, KC, StepHeader, T_PHOTO_CONSENT, kioskError, setFlash, useApptParam, useKiosk, usePrep } from "../kiosk";

/** T_Photos.dc.html */
const NAMES = ["أمامي", "جانبي 45°", "جانبي 90°"];
const KEYS = ["front", "side45", "side90"];
const SEL = "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 10px 22px rgba(150,100,170,0.30);color:#7B4687";
type Shot = { blob: Blob; url: string } | null;

/** Reception tablet — consultations only, after a signed photo consent: face photos «قبل» (or ?kind=after: «بعد»), three face angles → private "photos" bucket. */
export default function Page() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const k = useKiosk();
  const router = useRouter();
  const f = useApptParam(!k.gate);
  const after = useSearchParams().get("kind") === "after";
  const stage = after ? "after" : "before", word = after ? "بعد" : "قبل";
  const [st, setSt] = useState<{ ang: number; shots: Shot[] }>({ ang: 0, shots: [null, null, null] });
  const [grid, setGrid] = useState(true);
  const [cam, setCam] = useState<"off" | "on" | "denied">("off");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prepMap = usePrep(f.appt ? [f.appt] : [], !k.gate && !!f.appt);
  const prep = f.appt ? prepMap[f.appt.id] : undefined;
  const allowed = !!f.appt && isConsult(f.appt) && prep?.photo === "yes";
  const hasAppt = allowed;
  useEffect(() => {
    if (!hasAppt || !navigator.mediaDevices?.getUserMedia) { if (hasAppt) setCam("denied"); return; }
    let stream: MediaStream | null = null, stop = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1440 } } }).then((sm) => {
      if (stop) { sm.getTracks().forEach((t) => t.stop()); return; }
      stream = sm;
      if (videoRef.current) { videoRef.current.srcObject = sm; videoRef.current.play().catch(() => {}); }
      setCam("on");
    }).catch(() => setCam("denied"));
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [hasAppt]);
  useEffect(() => () => { st.shots.forEach((x) => x && URL.revokeObjectURL(x.url)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (k.gate) return k.gate;
  const A = f.appt;
  if (!A) return <ApptPicker title={`صور الوجه «${word}»`} today={f.today} loading={f.loading} error={f.error} path={R.T_Photos} />;
  if (!allowed) {
    const consult = isConsult(A);
    return (
      <Stage fluid width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>
        <StepHeader back={R.T_Desk} title="صور الوجه" sub={personName(A)} />
        <div style={{ margin: "auto", maxWidth: 560 }}>
          {consult && !prep ? <Loading /> : !consult
            ? <EmptyState icon="camera" title="لا تصوير في جلسات العناية" text="سياسة المركز: صور الوجه تُلتقط في الاستشارات فقط وبموافقة تصوير موقّعة." />
            : prep?.photo === "no"
              ? <EmptyState icon="camera" title="رفضت التصوير" text="سُجّل رفضها لموافقة التصوير — تستمر الاستشارة بدون صور." />
              : <EmptyState icon="camera" title="موافقة التصوير مطلوبة أولاً" text="لا تُلتقط صور الوجه قبل توقيع موافقة التصوير." action={<Link href={`${T_PHOTO_CONSENT}?id=${A.id}`} style={{ color: C.accent, fontWeight: 700 }}>فتح موافقة التصوير</Link>} />}
        </div>
      </Stage>
    );
  }

  const angs = NAMES.map((_, i) => ({ pick: () => setSt({ ...st, ang: i }),
    style: css("flex:1;height:58px;border-radius:29px;font-family:inherit;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;" +
      (st.ang === i ? SEL : "background:#FFFFFF;border:1px solid #EADCF0;color:#866F8D;box-shadow:0 3px 10px rgba(123,70,135,0.05)")) }));
  const thumbs = NAMES.map((n, i) => ({ label: n, done: !!st.shots[i], todo: !st.shots[i], pick: () => setSt({ ...st, ang: i }),
    style: { ...css("flex:1;height:156px;border-radius:22px;font-family:inherit;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;" +
      (st.shots[i] ? "border:2px solid #FFFFFF;background-size:cover;background-position:center;box-shadow:0 8px 18px rgba(123,70,135,0.18)"
        : "border:1.5px dashed " + (st.ang === i ? "#A877B6" : "#DAC7DE") + ";background:" + (st.ang === i ? "rgba(243,234,246,0.9)" : "rgba(255,255,255,0.6)"))),
      ...(st.shots[i] ? { backgroundImage: `url(${st.shots[i]!.url})` } : {}) } }));
  const shoot = () => {
    const v = videoRef.current;
    if (!v || cam !== "on" || !v.videoWidth) { setErr("الكاميرا غير متاحة على هذا الجهاز"); return; }
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const sh = st.shots.slice();
      if (sh[st.ang]) URL.revokeObjectURL(sh[st.ang]!.url);
      sh[st.ang] = { blob, url: URL.createObjectURL(blob) };
      const nx = sh.findIndex((x) => !x);
      setSt({ shots: sh, ang: nx < 0 ? st.ang : nx });
    }, "image/jpeg", 0.9);
  };
  const retake = () => setSt({ ...st, shots: st.shots.map((x, i) => (i === st.ang ? null : x)) });
  const n = st.shots.filter(Boolean).length;
  const a0 = st.ang === 0, a1 = st.ang === 1, a2 = st.ang === 2, angName = NAMES[st.ang];
  const count = n + " من 3", saveLbl = busy ? "جارٍ الحفظ…" : n === 3 ? (after ? "حفظ في الملف" : "حفظ وإنهاء التجهيز") : (after ? "حفظ في الملف" : "حفظ وإنهاء التجهيز") + " (" + n + "/3)";
  const shotState = cam === "denied" ? "الكاميرا غير متاحة" : st.shots[st.ang] ? "تم التقاطها — يمكنكِ الإعادة" : "جاهزة للالتقاط";
  const save = async () => {
    setBusy(true); setErr(null);
    try {
      for (let i = 0; i < 3; i++) { const sh = st.shots[i]; if (sh) await savePhoto(A, sh.blob, KEYS[i], stage); }
      setFlash(after ? `حُفظت صور الوجه «بعد» — ${personName(A)}` : `اكتمل تجهيز جلسة ${personName(A)}`);
      router.push(R.T_Desk);
    } catch (e) { setErr(kioskError(e)); setBusy(false); }
  };
  return (
    <Stage fluid width={1194} height={834} background={BG} padding="36px 40px 32px" direction="column" gap={20}>

      <StepHeader back={after ? R.T_Desk : `${T_PHOTO_CONSENT}?id=${A.id}`} title={`صور الوجه «${word}»`} sub={`${personName(A)} · الوجه فقط · محفوظة في ملفها الخاص${A.staff ? ` · مع ${A.staff.name}` : ""}`} flow={{ step: after ? 0 : 4, consult: true }} />
      <div className={KC.cols} style={{ display: "flex", gap: 20, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ borderRadius: 28, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, color: C.accent }}>{initials(personName(A))}
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{personName(A)}
              </div>
              <div style={{ fontSize: 13, color: C.sub2 }}>{[A.patients ? `ملف ${A.patients.file_no}` : null, serviceName(A), A.rooms?.name].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <div style={{ borderRadius: 28, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>زاوية الوجه
              </div>
              <div style={{ fontSize: 13, color: C.sub2 }}>نفس الزوايا في كل جلسة للمقارنة
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" aria-pressed={st.ang === 0} onClick={angs[0].pick} style={angs[0].style}>أمامي
              </button>
              <button type="button" aria-pressed={st.ang === 1} onClick={angs[1].pick} style={angs[1].style}>جانبي 45°
              </button>
              <button type="button" aria-pressed={st.ang === 2} onClick={angs[2].pick} style={angs[2].style}>جانبي 90°
              </button>
            </div>
          </div>
          <div style={{ borderRadius: 28, padding: "16px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>صور الوجه «{word}»
              </div>
              <div style={{ fontSize: 14, color: C.sub2 }}>{count}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={thumbs[0].pick} aria-label="أمامي" style={thumbs[0].style}>
                {thumbs[0].done && (<>
                  <span style={{ position: "absolute", top: 8, left: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  </span>
                </>)}
                {thumbs[0].todo && (<>
                  <span style={{ position: "absolute", top: 46 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BEA6C3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                    </svg>
                  </span>
                </>)}
                <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>أمامي
                </span>
              </button>
              <button type="button" onClick={thumbs[1].pick} aria-label="جانبي 45°" style={thumbs[1].style}>
                {thumbs[1].done && (<>
                  <span style={{ position: "absolute", top: 8, left: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  </span>
                </>)}
                {thumbs[1].todo && (<>
                  <span style={{ position: "absolute", top: 46 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BEA6C3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                    </svg>
                  </span>
                </>)}
                <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>جانبي 45°
                </span>
              </button>
              <button type="button" onClick={thumbs[2].pick} aria-label="جانبي 90°" style={thumbs[2].style}>
                {thumbs[2].done && (<>
                  <span style={{ position: "absolute", top: 8, left: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    </span>
                  </span>
                </>)}
                {thumbs[2].todo && (<>
                  <span style={{ position: "absolute", top: 46 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BEA6C3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                    </svg>
                  </span>
                </>)}
                <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, color: C.accent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>جانبي 90°
                </span>
              </button>
            </div>
          </div>
          <div style={{ borderRadius: 24, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: C.sub }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4L7 17M17 7l1.4-1.4M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
              </svg>إضاءة الغرفة نفسها، بدون فلاش
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 16M9 5h6l1 4H8zM8 9v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9" />
              </svg>بشرة نظيفة بلا مكياج، والشعر مرفوع
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0" />
              </svg>الوجه فقط داخل الإطار — من الجبين حتى الذقن
            </div>
          </div>
          {err && <ErrorNote>{err}</ErrorNote>}
          <button type="button" className={KC.issue} onClick={save} disabled={busy || n === 0} style={{ opacity: busy || n === 0 ? 0.55 : 1, marginTop: "auto", height: 64, borderRadius: 32, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12" />
            </svg>{saveLbl}
          </button>
        </div>
        <div className={KC.camView} style={{ flex: 1, minWidth: "0", borderRadius: 38, position: "relative", overflow: "hidden", boxShadow: SH, border: "3px solid #FFFFFF", background: "radial-gradient(ellipse 45% 55% at 52% 42%, #F3D3C6 0%, #E7B9AC 35%, rgba(199,168,206,0.9) 60%, rgba(146,117,153,0.95) 100%), linear-gradient(160deg,#AC91B2,#715678)" }}>
          <div style={{ position: "absolute", inset: "0", background: "radial-gradient(circle at 80% 10%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)" }} />
          <video ref={videoRef} muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: cam === "on" ? "block" : "none" }} />
          <svg width="100%" height="100%" viewBox="0 -24 640 700" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "0", display: grid ? "block" : "none" }} aria-hidden="true">
            {a0 && (<>
              <g fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 9" opacity="0.95">
                <ellipse cx="320" cy="250" rx="130" ry="170" />
                <path d="M150 560c10-80 70-118 170-118s160 38 170 118" />
              </g>
              <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6">
                <line x1="320" y1="60" x2="320" y2="440" />
                <line x1="170" y1="230" x2="470" y2="230" />
              </g>
              <g fill="#FFFFFF" opacity="0.85">
                <circle cx="268" cy="230" r="4" />
                <circle cx="372" cy="230" r="4" />
              </g>
            </>)}
            {a1 && (<>
              <g fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 9" opacity="0.95">
                <ellipse cx="305" cy="250" rx="122" ry="170" />
                <path d="M420 214c10 18 22 36 24 48 1 7-6 10-16 12" />
                <path d="M160 560c14-78 72-116 160-116s150 36 166 116" />
              </g>
              <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6">
                <line x1="345" y1="60" x2="345" y2="440" />
                <line x1="170" y1="230" x2="470" y2="230" />
              </g>
              <g fill="#FFFFFF" opacity="0.85">
                <circle cx="300" cy="228" r="4" />
                <circle cx="388" cy="228" r="3.5" />
              </g>
            </>)}
            {a2 && (<>
              <g fill="none" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="10 9" opacity="0.95">
                <path d="M300 80c-70 0-110 60-110 150 0 60 18 110 50 140v60h110v-40c30 0 54-10 58-36l4-30 22-8-4-18 6-14-28-50c-4-100-42-154-108-154z" />
                <path d="M170 560c10-60 50-96 90-100M350 460c60 6 110 40 124 100" />
              </g>
              <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6">
                <line x1="170" y1="230" x2="470" y2="230" />
              </g>
              <g fill="#FFFFFF" opacity="0.85">
                <circle cx="368" cy="228" r="4" />
              </g>
            </>)}
          </svg>
          <span style={{ position: "absolute", top: 22, left: 22, width: 46, height: 46, borderTop: "4px solid rgba(255,255,255,0.9)", borderLeft: "4px solid rgba(255,255,255,0.9)", borderTopLeftRadius: 18 }} />
          <span style={{ position: "absolute", top: 22, right: 22, width: 46, height: 46, borderTop: "4px solid rgba(255,255,255,0.9)", borderRight: "4px solid rgba(255,255,255,0.9)", borderTopRightRadius: 18 }} />
          <span style={{ position: "absolute", bottom: 22, left: 22, width: 46, height: 46, borderBottom: "4px solid rgba(255,255,255,0.9)", borderLeft: "4px solid rgba(255,255,255,0.9)", borderBottomLeftRadius: 18 }} />
          <span style={{ position: "absolute", bottom: 22, right: 22, width: 46, height: 46, borderBottom: "4px solid rgba(255,255,255,0.9)", borderRight: "4px solid rgba(255,255,255,0.9)", borderBottomRightRadius: 18 }} />
          <div className={KC.camTop} style={{ position: "absolute", top: 18, right: 84, left: 84, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ height: 44, padding: "0 16px", borderRadius: 22, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: C.accent }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0" />
              </svg>الزاوية: {angName}
            </div>
            <div style={{ height: 44, padding: "0 16px", borderRadius: 22, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: C.ink }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: C.ok }} />{shotState}
            </div>
          </div>
          {grid && <div style={{ position: "absolute", top: 76, left: "50%", transform: "translateX(-50%)", maxWidth: "calc(100% - 40px)", padding: "8px 16px", borderRadius: 18, background: "rgba(53,33,61,0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: C.white, fontSize: 14, fontWeight: 600, textAlign: "center", lineHeight: 1.5 }}>ضعي الوجه داخل الإطار — العينان على الخط</div>}
          <div style={{ position: "absolute", bottom: 20, left: "0", right: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
            <button type="button" aria-label="شبكة المحاذاة" aria-pressed={grid} onClick={() => setGrid(!grid)} style={{ width: 58, height: 58, borderRadius: 29, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4L4 8l8 4 8-4-8-4M4 12l8 4 8-4M4 16l8 4 8-4" />
              </svg>
            </button>
            <button type="button" onClick={shoot} aria-label="التقاط الصورة" style={{ width: 88, height: 88, borderRadius: 44, border: "5px solid rgba(255,255,255,0.95)", background: "transparent", padding: 5, boxShadow: "0 10px 30px rgba(53,33,61,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7h1a2 2 0 0 0 2-2 1 1 0 0 1 1-1h6a1 1 0 0 1 1 1 2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2M9 13a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                </svg>
              </span>
            </button>
            <button type="button" onClick={retake} aria-label="إعادة التصوير" style={{ width: 58, height: 58, borderRadius: 29, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </Stage>
  );
}

