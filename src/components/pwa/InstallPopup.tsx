"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { C, DARK, SH, SHB } from "@/lib/tokens";
import { DOMAIN } from "@/lib/hosts";
import { InstallSteps } from "./InstallPrompt";
import { useInstall } from "./useInstall";

const KEY = "fb-install-popup-at";
const EVERY_MS = 60 * 60 * 1000; // once an hour
const STAFF_PATHS = ["/admin", "/kiosk", "/tv", "/screens"];
const STAFF_HOSTS = ["admin", "kiosk", "tv"].map((s) => `${s}.${DOMAIN}`);

function lastShown() { try { return Number(localStorage.getItem(KEY) || 0); } catch { return 0; } }
function markShown() { try { localStorage.setItem(KEY, String(Date.now())); } catch {} }

/**
 * Hourly «ثبّتي التطبيق» popup on every public / patient page, for anyone who has not installed the app.
 * Never on staff screens (admin, reception tablet, waiting-room TV). `?install=1` opens it right away.
 */
export function InstallPopup() {
  const pathname = usePathname() || "/";
  const { ready, installed, ios, install } = useInstall();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (!ready || installed) return;
    if (STAFF_PATHS.some((p) => pathname.startsWith(p)) || STAFF_HOSTS.includes(window.location.hostname)) return;
    const forced = new URLSearchParams(window.location.search).get("install") === "1";
    const due = () => Date.now() - lastShown() >= EVERY_MS;
    if (forced) { setOpen(true); markShown(); return; }
    const t = setInterval(() => { if (due()) { setOpen(true); markShown(); } }, 30_000);
    const first = setTimeout(() => { if (due()) { setOpen(true); markShown(); } }, 4000);
    return () => { clearInterval(t); clearTimeout(first); };
  }, [ready, installed, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || installed) return null;

  const onInstall = async () => {
    const r = await install();
    if (r === "prompted") setOpen(false);
    else if (r === "ios" || r === "unavailable") setHelp(true);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="install-title" dir="rtl"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(53,33,61,0.38)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "16px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 34, background: "linear-gradient(170deg, #FFFFFF 0%, #F7F0F9 100%)", boxShadow: `${SH}, 0 30px 60px rgba(53,33,61,0.25)`,
        padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 14, position: "relative", color: C.ink }}>
        <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" style={{ position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: 19, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="x" color={C.sub2} size={17} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" width={64} height={64} style={{ borderRadius: 18, boxShadow: "0 8px 18px rgba(123,70,135,0.30)" }} />
        </div>
        <div>
          <h2 id="install-title" style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>ثبّتي تطبيق فاطمة بيوتي</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.75 }}>احجزي جلستكِ وتابعي دوركِ ورحلة بشرتكِ بلمسة واحدة من شاشة هاتفكِ.</p>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {[["clock", "يفتح فوراً دون انتظار"], ["refresh", "يعمل حتى مع ضعف الإنترنت"], ["shield", "مجاني ولا يأخذ مساحة تُذكر"]].map(([i, t]) => (
            <li key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, background: "linear-gradient(145deg, #F6EEF9, #E6D3EE)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={i} size={16} /></span>{t}
            </li>
          ))}
        </ul>
        {help && <InstallSteps ios={ios} />}
        <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
          <button type="button" onClick={onInstall} style={{ ...DARK, flex: 1, border: "none", height: 54, borderRadius: 27, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="download" color="#FFFFFF" size={18} stroke={2} />ثبّتي التطبيق
          </button>
          <button type="button" onClick={() => setOpen(false)} style={{ height: 54, padding: "0 18px", borderRadius: 27, border: "none", background: "transparent", color: C.sub2, fontSize: 14, fontWeight: 600 }}>لاحقاً</button>
        </div>
      </div>
    </div>
  );
}
