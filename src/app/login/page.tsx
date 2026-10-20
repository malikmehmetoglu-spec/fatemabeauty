"use client";

import { useEffect, useState } from "react";
import { setGuest, useSession } from "@/lib/supabase/session";
import { useRouter } from "next/navigation";
import { normalizePhone, sendCode } from "@/lib/supabase/phoneAuth";
import { DeskHeading, PhoneScreen, phoneOnly } from "@/components/shell";
import { Icon, Logo, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { supabase } from "@/lib/supabase/client";

const DEMO_EMAIL = "zaera@fatema.beauty";
const DEMO_PASSWORD = "Zaera-Demo-2026";
import { C, SH } from "@/lib/tokens";

/** Login.dc.html — phone-number login. */
export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { patient } = useSession();
  // Already signed in (e.g. «احجزي» on the public site): go straight on instead of asking for the phone again.
  useEffect(() => {
    if (!patient) return;
    const n = new URLSearchParams(window.location.search).get("next");
    router.replace(n && n.startsWith("/") && !n.startsWith("//") ? n : patient.name ? R.Main : R.P_Profile);
  }, [patient, router]);
  /**
   * «المتابعة كزائرة» — TEMPORARY demo for the owner: signs in to a real client account «زائرة»
   * (zaera@fatema.beauty, patient file 1027) so every feature works (booking, orders, chat…).
   * Remove this button and that account before launch.
   */
  async function asGuest() {
    setError(""); setBusy(true);
    setGuest(false);
    const { error: e } = await supabase.auth.signInWithPassword({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setBusy(false);
    if (e) { setError("تعذّر الدخول كزائرة. حاولي مرة أخرى."); return; }
    const n = new URLSearchParams(window.location.search).get("next");
    const ok = n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/admin") && !n.startsWith("/login");
    window.location.href = ok ? n : R.Main;
  }
  async function next() {
    setError("");
    const p = normalizePhone(phone);
    if (!p) { setError("اكتبي رقم جوال سوري صحيحاً، مثل 0933 123 456"); return; }
    setBusy(true);
    const e = await sendCode(p);
    setBusy(false);
    if (e) { setError(e); return; }
    try {
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) sessionStorage.setItem("fb.after_login", next);
    } catch {}
    router.push(R.P_OTP);
  }
  return (
    <PhoneScreen auth padding="calc(env(safe-area-inset-top, 0px) + 70px) 24px calc(env(safe-area-inset-bottom, 0px) + 26px)">
      <div className={phoneOnly} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 18 }}>
        <Logo height={118} />
        <div style={{ fontSize: 15, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>احجزي جلستكِ، وتابعي دوركِ ورحلة بشرتكِ<br />من مكان واحد</div>
      </div>
      <DeskHeading title="أهلاً بكِ" sub={<>احجزي جلستكِ، وتابعي دوركِ ورحلة بشرتكِ من مكان واحد.</>} />
      <div style={{ position: "relative", marginTop: 22 }}>
        <label htmlFor="phone" style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>رقم هاتفكِ</label>
        <div dir="ltr" style={{ display: "flex", alignItems: "center", height: 58, background: C.white, border: `1px solid ${C.border}`, borderRadius: 29, padding: "0 8px 0 18px", boxShadow: SH }}>
          <span className="latin" style={{ fontSize: 16, fontWeight: 600, color: C.accent, paddingRight: 12, borderRight: `1px solid ${C.border}` }}>+963</span>
          <input id="phone" type="tel" inputMode="tel" placeholder="9XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") next(); }} className="latin"
            style={{ flexGrow: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontSize: 17, padding: "0 12px", color: C.ink, letterSpacing: 1 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: C.sub }}>
          <Icon name="msg" color={C.ok} size={17} stroke={1.9} />سنرسل لكِ رمز التحقق على واتساب
        </div>
      </div>
      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
        {error && <div role="alert" style={{ fontSize: 13.5, fontWeight: 600, color: C.danger, background: "#FBEAF1", borderRadius: 14, padding: "10px 14px", textAlign: "center" }}>{error}</div>}
        <PrimaryButton onClick={next} disabled={busy}>{busy ? "جارٍ الإرسال…" : "متابعة"}</PrimaryButton>
        <button type="button" onClick={asGuest} style={{ height: 50, borderRadius: 25, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.55)", color: C.accent, fontFamily: "inherit", fontSize: 15.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
          <Icon name="user" color={C.accent} size={17} stroke={1.8} />المتابعة كزائرة
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.sub2, textAlign: "center" }}>
          <Icon name="lock" color={C.muted} size={14} />بياناتكِ الصحية محمية ولا يطّلع عليها إلا فريق المركز
        </div>
      </div>
    </PhoneScreen>
  );
}
