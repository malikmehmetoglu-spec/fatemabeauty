"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizePhone, sendCode } from "@/lib/supabase/phoneAuth";
import { PhoneScreen } from "@/components/shell";
import { Icon, Logo, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, SELECTED, SH, SHB } from "@/lib/tokens";

/** Login.dc.html — phone-number login. */
export default function LoginPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
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
      if (next && next.startsWith("/")) sessionStorage.setItem("fb.after_login", next);
    } catch {}
    router.push(R.P_OTP);
  }
  const seg = (k: "ar" | "en", label: string) => (
    <button type="button" aria-pressed={lang === k} onClick={() => setLang(k)} className={k === "en" ? "latin" : undefined} style={{
      height: 30, padding: "0 14px", borderRadius: 15, fontSize: 13, display: "flex", alignItems: "center",
      ...(lang === k ? { ...SELECTED, border: "none", boxShadow: "none", fontWeight: 700 } : { background: "transparent", border: "none", color: C.sub2, fontWeight: 600 }),
    }}>{label}</button>
  );
  return (
    <PhoneScreen padding="calc(env(safe-area-inset-top, 0px) + 70px) 24px calc(env(safe-area-inset-bottom, 0px) + 26px)">
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.7)", border: "1px solid #FFFFFF", borderRadius: 18, padding: 3, boxShadow: SHB }}>
          {seg("ar", "عربي")}{seg("en", "English")}
        </div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginTop: 18 }}>
        <Logo height={118} />
        <div style={{ fontSize: 15, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>احجزي جلستكِ، وتابعي دوركِ ورحلة بشرتكِ<br />من مكان واحد</div>
      </div>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.sub2, textAlign: "center" }}>
          <Icon name="lock" color={C.muted} size={14} />بياناتكِ الصحية محمية ولا يطّلع عليها إلا فريق المركز
        </div>
      </div>
    </PhoneScreen>
  );
}
