"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { maskPhone, savedPhone, sendCode, verifyCode } from "@/lib/supabase/phoneAuth";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, GLASS, ICON_FILL, SH, SHB, SOFT_PANEL } from "@/lib/tokens";

/** P_OTP.dc.html — WhatsApp verification code. */
export default function OtpPage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [focus, setFocus] = useState(0);
  const [sec, setSec] = useState(59);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => { const p = savedPhone(); if (!p) router.replace(R.Login); else setPhone(p); }, [router]);
  async function confirm() {
    const token = digits.join("");
    if (token.length !== 6) { setError("أدخلي الأرقام الستة كاملة."); return; }
    setBusy(true); setError("");
    const r = await verifyCode(phone, token);
    setBusy(false);
    if (r.error) { setError(r.error); return; }
    let next: string | null = null;
    try { next = sessionStorage.getItem("fb.after_login"); sessionStorage.removeItem("fb.after_login"); } catch {}
    router.replace(r.patient && r.patient.name ? (next && next.startsWith("/") ? next : R.Main) : R.P_Profile);
  }
  async function resend() {
    setError(""); setSec(59);
    const e = await sendCode(phone);
    if (e) setError(e);
  }
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((p) => p.map((x, j) => (j === i ? d : x)));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const boxStyle = (i: number): CSSProperties => {
    const base: CSSProperties = {
      flex: "1 1 0", minWidth: 0, maxWidth: 48, height: 60, boxSizing: "border-box", borderRadius: 18, textAlign: "center",
      fontSize: 26, fontWeight: 700, color: C.accent, outline: "none", padding: 0,
    };
    if (i === focus) return { ...base, border: "1.5px solid #A877B6", background: C.white, boxShadow: "0 0 0 4px rgba(150,100,170,0.14), 0 10px 22px rgba(150,100,170,0.18)" };
    if (digits[i]) return { ...base, border: "1px solid #FFFFFF", background: "linear-gradient(160deg,#FFFFFF,#F3EAF6)", boxShadow: SH };
    return { ...base, border: "1px solid #EADCF0", background: "rgba(255,255,255,0.75)", boxShadow: "0 3px 10px rgba(123,70,135,0.05)" };
  };

  return (
    <PhoneScreen padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="رمز التحقق" back={R.Login} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 40 }}>
        <div style={{ ...GLASS, position: "relative", width: 124, height: 124, borderRadius: 62, boxShadow: SH, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 88, height: 88, borderRadius: 44, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 #FFFFFF" }}>
            <Icon name="msg" color={C.accentMid} size={36} stroke={1.7} />
          </span>
          <span style={{ position: "absolute", bottom: 6, left: 6, width: 30, height: 30, borderRadius: 15, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="check" color={C.ok} size={16} stroke={2.4} />
          </span>
        </div>
        <h1 style={{ margin: "22px 0 0", fontSize: 26, fontWeight: 700, color: C.ink }}>أدخلي رمز التحقق</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, color: C.sub, lineHeight: 1.7 }}>أرسلنا رمزاً من 6 أرقام عبر واتساب إلى</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span dir="ltr" className="latin" style={{ fontSize: 17, fontWeight: 500, color: C.accent, letterSpacing: 0.5 }}>{phone ? maskPhone(phone) : ""}</span>
          <Link href={R.Login} style={{ fontSize: 13, fontWeight: 600, color: C.accentMid, textDecoration: "underline", textUnderlineOffset: 4 }}>تغيير الرقم</Link>
        </div>
      </div>

      <div role="group" aria-label="رمز التحقق المكوّن من 6 أرقام" dir="ltr" style={{ position: "relative", display: "flex", justifyContent: "center", gap: 9, marginTop: 30 }}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} aria-label={`الرقم ${i + 1} من 6`} type="text" inputMode="numeric" maxLength={1}
            autoComplete={i === 0 ? "one-time-code" : "off"} value={d} className="latin"
            onFocus={() => setFocus(i)} onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
            style={boxStyle(i)} />
        ))}
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: 12 }}>
        {sec > 0 ? (
          <div style={{ ...SOFT_PANEL, display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 20, fontSize: 13.5, color: C.sub }}>
            <Icon name="clock" color={C.accentMid} size={17} />يمكنكِ طلب رمز جديد بعد{" "}
            <b dir="ltr" className="latin" style={{ fontWeight: 500, color: C.accent }}>00:{String(sec).padStart(2, "0")}</b>
          </div>
        ) : (
          <button type="button" onClick={resend} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 18px", borderRadius: 20, border: "1px solid #FFFFFF", background: C.white, boxShadow: SHB, fontSize: 14, fontWeight: 600, color: C.accent }}>
            <Icon name="refresh" color={C.accent} size={17} />إعادة إرسال الرمز
          </button>
        )}
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: C.sub2 }}>
          لم يصلكِ الرمز؟<button type="button" onClick={resend} style={{ border: "none", background: "none", padding: 0, fontSize: 13, fontWeight: 700, color: C.accentMid }}>أرسليه برسالة SMS</button>
        </div>
        {error && <div role="alert" style={{ fontSize: 13.5, fontWeight: 600, color: C.danger, background: "#FBEAF1", borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>{error}</div>}
        <PrimaryButton onClick={confirm} disabled={busy}>{busy ? "جارٍ التحقق…" : "تأكيد"}</PrimaryButton>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.sub2 }}>
          <Icon name="lock" color={C.muted} size={14} />لا تشاركي هذا الرمز مع أي أحد
        </div>
      </div>
    </PhoneScreen>
  );
}
