"use client";
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Stage } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { initials as initialsOf } from "@/lib/data";
import { R } from "@/lib/routes";
import { aheadText, getAppointment, listToday, personName, queueInfo, serviceName } from "@/lib/db/queue";
import { useQuery } from "@/lib/db/query";
import { clock } from "@/lib/format";
import { NowText, useKiosk } from "../kiosk";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL, LOGO } from "@/lib/tokens";

/** T_CheckedIn.dc.html */
const BACK_AFTER = 15;

/** Reception tablet: confirmation after a successful check-in. */
export default function Page() {
  return <Suspense><Inner /></Suspense>;
}

function Inner() {
  const k = useKiosk();
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const q = useQuery(["queue", "checked-in", id], async () => {
    const [a, today] = await Promise.all([getAppointment(id), listToday()]);
    return { a, today };
  }, { enabled: !k.gate && !!id });
  const [left, setLeft] = useState(BACK_AFTER);
  useEffect(() => {
    if (k.gate) return;
    const t = setInterval(() => setLeft((n) => { if (n <= 1) { router.push(R.T_Welcome); return 0; } return n - 1; }), 1000);
    return () => clearInterval(t);
  }, [k.gate, router]);
  if (k.gate) return k.gate;
  const A = q.data?.a;
  if (!A) return (
    <Stage width={1194} height={834} background={BG} padding="36px 40px">
      {q.loading ? <Loading style={{ margin: "auto" }} /> : <div style={{ margin: "auto", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <ErrorNote>{q.error ?? "لم يُعثر على الموعد"}</ErrorNote>
        <Link href={R.T_Welcome} style={{ color: C.accent, fontWeight: 700, fontSize: 18 }}>العودة للبداية</Link>
      </div>}
    </Stage>
  );
  const { ahead: AHEAD, wait } = queueInfo(A, q.data!.today);
  const AHEAD_TXT = aheadText(AHEAD);
  const spec = A.staff?.name;
  return (
    <Stage width={1194} height={834}  background={BG} padding="36px 40px 32px" direction="column" gap={22}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div style={{ display: "flex" }}>
            <img src={LOGO} alt="Fatema Beauty — Skin Care Center" style={{ height: 52, width: "auto", display: "block" }} />
          </div>
        </div>
        <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
          </svg>
          <span><NowText part="date" />
          </span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}><NowText part="time" />
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", marginTop: 4 }}>
        <span style={{ width: 72, height: 72, borderRadius: 36, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 12px 26px rgba(123,70,135,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <div style={{ lineHeight: 1.3 }}>
          <h1 style={{ margin: "0", fontSize: 44, fontWeight: 700, color: C.accent }}>تم تسجيل وصولكِ
          </h1>
          <div style={{ fontSize: 19, color: C.sub }}>أهلاً {personName(A)}{" "}— تفضّلي بالجلوس، سننادي رقمكِ على شاشة الانتظار.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, position: "relative", flexGrow: 1, minHeight: "0" }}>
        <div style={{ backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", borderRadius: 40, padding: "30px 34px 28px", color: C.white, position: "relative", overflow: "hidden", width: 520, flexShrink: 0, boxSizing: "border-box" }}>
          <div style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
          <svg width="220" height="220" viewBox="0 0 160 160" style={{ position: "absolute", top: -60, left: -60 }}>
            <circle cx="80" cy="80" r="78" fill="none" stroke="#7C5485" strokeWidth="1" />
            <circle cx="80" cy="80" r="56" fill="none" stroke="#7C5485" strokeWidth="1" />
          </svg>
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, color: C.onDark }}>رقم دوركِ
              </div>
              <div style={{ fontSize: 190, fontWeight: 700, lineHeight: 1, marginTop: 6, fontFamily: "var(--font-rubik), Rubik, sans-serif", letterSpacing: -4 }}>{A.queue_no ?? "—"}
              </div>
            </div>
            <div style={{ background: "linear-gradient(145deg, #FFFFFF, #E8D0ED)", boxShadow: "0 8px 20px rgba(0,0,0,0.18)", color: C.accent, borderRadius: 26, height: 52, padding: "0 22px", display: "flex", alignItems: "center", gap: 8, fontSize: 21, fontWeight: 700 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
              </svg>{A.rooms?.name ?? "الاستقبال"}
            </div>
          </div>
          <div style={{ position: "relative", height: 1, background: "#7C5485", margin: "18px 0 20px" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, color: C.onDark }}>أمامكِ
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{AHEAD_TXT}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: 7, background: "#E8D6F0" }} />
              <span style={{ width: 34, height: 14, borderRadius: 7, background: C.white }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, color: C.onDark }}>الانتظار المتوقع
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{wait === 0 ? "الآن تقريباً" : `~ ${wait} دقيقة`}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: "0", borderRadius: 36, padding: "8px 30px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
            <span style={{ width: 60, height: 60, borderRadius: 30, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
              </svg>
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 15, color: C.sub2 }}>الجلسة
              </div>
              <div style={{ fontSize: 23, fontWeight: 700 }}>{serviceName(A)}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
            <span style={{ width: 60, height: 60, borderRadius: 30, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "2px solid #FFFFFF", boxShadow: "0 4px 10px rgba(150,100,170,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.accent }}>{spec ? initialsOf(spec) : "—"}
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 15, color: C.sub2 }}>الأخصائية
              </div>
              <div style={{ fontSize: 23, fontWeight: 700 }}>{spec ?? "تُحدَّد عند الدخول"}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
            <span style={{ width: 60, height: 60, borderRadius: 30, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
              </svg>
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 15, color: C.sub2 }}>موعدكِ
              </div>
              <div style={{ fontSize: 23, fontWeight: 700 }}><NowText part="date" /> · {clock(A.starts_at)}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: C.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
            <span style={{ width: 60, height: 60, borderRadius: 30, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
              </svg>
            </span>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 15, color: C.sub2 }}>مدة الجلسة
              </div>
              <div style={{ fontSize: 23, fontWeight: 700 }}>{A.minutes} دقيقة تقريباً
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "stretch", position: "relative" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 28, background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: SH_SOFT }}>
          <span style={{ width: 52, height: 52, borderRadius: 26, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
          </span>
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ fontSize: 19, fontWeight: 700 }}>تابعي دوركِ من هاتفكِ أيضاً
            </div>
            <div style={{ fontSize: 15, color: C.sub }}>افتحي «موعدي اليوم» في التطبيق، وسيصلكِ إشعار قبل دوركِ بدقائق.
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 14px 12px 22px", borderRadius: 28, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="22" fill="none" stroke="#ECE2EF" strokeWidth="5" />
            <circle cx="26" cy="26" r="22" fill="none" stroke="#A877B6" strokeWidth="5" strokeLinecap="round" strokeDasharray="138.2" strokeDashoffset={138.2 * (1 - left / BACK_AFTER)} transform="rotate(-90 26 26)" />
            <text x="26" y="32" textAnchor="middle" style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif" }} fontSize="16" fontWeight="500" fill="#7B4687">{left}
            </text>
          </svg>
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>تعود الشاشة للبداية
            </div>
            <div style={{ fontSize: 13, color: C.sub2 }}>خلال ثوانٍ تلقائياً
            </div>
          </div>
          <Link href={R.T_Welcome} style={{ height: 60, borderRadius: 30, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 22px", width: 120 }}>تم
          </Link>
        </div>
      </div>

    </Stage>
  );
}

