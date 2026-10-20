"use client";

/** Guest mode UI: the «سجّلي الدخول» card, the «وضع الزائرة» pill and the «هذه الخطوة تحتاج تسجيل الدخول» sheet. */
import { useEffect, useState, type CSSProperties } from "react";
import { Icon, EmptyState, PrimaryButton, SecondaryButton } from "@/components/ui";
import { askLogin, closeAskLogin, loginHref, onAskLogin, type AskLogin } from "@/lib/guest";
import { setGuest, useSession } from "@/lib/supabase/session";
import { R } from "@/lib/routes";
import { C, SH } from "@/lib/tokens";

export { askLogin };

/** Use in click handlers: returns true (and opens the sheet) when the visitor is a guest. */
export function useGuestGuard() {
  const { guest } = useSession();
  return (opts?: AskLogin) => { if (guest) { askLogin(opts); return true; } return false; };
}

function goLogin() { window.location.assign(loginHref()); }

/** Personal-data section in guest mode: «سجّلي الدخول لتظهر … هنا». */
export function GuestCard({ what = "بياناتكِ", icon = "user", title, style }: { what?: string; icon?: string; title?: string; style?: CSSProperties }) {
  return (
    <EmptyState compact icon={icon} title={title ?? "أنتِ تتصفّحين كزائرة"} style={style}
      text={`سجّلي الدخول لتظهر ${what} هنا.`}
      action={<PrimaryButton height={46} icon="user" onClick={goLogin} style={{ fontSize: 15, padding: "0 24px" }}>تسجيل الدخول</PrimaryButton>} />
  );
}

/** Small persistent «وضع الزائرة» pill (account page / desktop sidebar). */
export function GuestPill({ compact = false }: { compact?: boolean }) {
  const { guest } = useSession();
  if (!guest) return null;
  const btn: CSSProperties = { border: "none", background: "transparent", fontFamily: "inherit", cursor: "pointer", padding: "4px 2px", fontSize: 12.5, fontWeight: 700 };
  return (
    <div style={{ display: "flex", flexDirection: compact ? "column" : "row", alignItems: compact ? "stretch" : "center", gap: compact ? 6 : 10, flexWrap: "wrap",
      background: "linear-gradient(160deg,#F7EEF9,#EFE0F4)", border: "1px solid #FFFFFF", borderRadius: compact ? 20 : 999, padding: compact ? "10px 14px" : "8px 16px", boxShadow: "0 6px 16px rgba(123,70,135,0.10)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.accent }}>
        <Icon name="user" color={C.accent} size={15} stroke={1.9} />وضع الزائرة
      </span>
      <span style={{ display: "flex", flexDirection: compact ? "column" : "row", alignItems: compact ? "flex-start" : "center", gap: compact ? 0 : 12, marginInlineStart: compact ? 0 : "auto", whiteSpace: "nowrap" }}>
        <button type="button" onClick={goLogin} style={{ ...btn, color: C.accent }}>تسجيل الدخول</button>
        <button type="button" onClick={() => { setGuest(false); window.location.assign(R.Login); }} style={{ ...btn, color: C.sub2 }}>الخروج من وضع الزائرة</button>
      </span>
    </div>
  );
}

/** Mounted once per screen (PhoneScreen); shows the sheet when askLogin() is called. */
export function GuestSheetHost() {
  const [a, setA] = useState<AskLogin | null>(null);
  useEffect(() => onAskLogin(setA), []);
  useEffect(() => {
    if (!a) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setA(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [a]);
  if (!a) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="fb-guest-t" dir="rtl" className="fb-guest-wrap" onClick={(e) => { if (e.target === e.currentTarget) closeAskLogin(); }}
      style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(53,33,61,0.38)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", justifyContent: "center" }}>
      <style>{`.fb-guest-wrap{align-items:flex-end}.fb-guest-sheet{border-radius:30px 30px 0 0;animation:fbup .22s ease-out}
@media (min-width:768px){.fb-guest-wrap{align-items:center;padding:16px}.fb-guest-sheet{border-radius:30px}}
@keyframes fbup{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}`}</style>
      <div className="fb-guest-sheet" style={{ width: "100%", maxWidth: 460, background: "linear-gradient(170deg,#FFFFFF 0%,#F9F4FA 100%)", boxShadow: `${SH}, 0 30px 60px rgba(53,33,61,0.25)`,
        padding: "14px 22px calc(env(safe-area-inset-bottom, 0px) + 22px)", display: "flex", flexDirection: "column", gap: 12, textAlign: "center", color: C.ink }}>
        <span aria-hidden style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, background: "#E6D8EC" }} />
        <span style={{ alignSelf: "center", width: 60, height: 60, borderRadius: 30, background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <Icon name="lock" color={C.accent} size={26} stroke={1.8} />
        </span>
        <h2 id="fb-guest-t" style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-messiri)" }}>هذه الخطوة تحتاج تسجيل الدخول</h2>
        <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.8 }}>{a.text ?? "سجّلي الدخول برقم هاتفكِ لنحفظ طلبكِ باسمكِ ونتواصل معكِ."}</p>
        <PrimaryButton icon="user" onClick={goLogin} style={{ marginTop: 6 }}>تسجيل الدخول</PrimaryButton>
        {a.booking && <SecondaryButton icon="cal" href="/book/">احجزي عبر رابط الحجز</SecondaryButton>}
        <button type="button" onClick={closeAskLogin} style={{ border: "none", background: "transparent", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: C.sub2, padding: 10, cursor: "pointer" }}>لاحقاً</button>
      </div>
    </div>
  );
}
