"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { isNativeApp } from "@/lib/hosts";
import { C, DARK, GLASS, SH } from "@/lib/tokens";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "fb-install-dismissed";

function dismissedRecently() {
  try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < 7 * 864e5; } catch { return false; }
}

/**
 * «ثبّتي التطبيق» card for the patient app on the web.
 * Android/Chrome: native install prompt. iPhone/Safari: short how-to (Share → Add to Home Screen).
 * Hidden when already installed, inside the store app, or dismissed in the last 7 days.
 */
export function InstallPrompt({ style }: { style?: React.CSSProperties }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);
  const [howTo, setHowTo] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    if (standalone || isNativeApp() || dismissedRecently()) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (isIos) { setIos(true); setShow(true); }
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); setShow(true); };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (!show) return null;

  const dismiss = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} setShow(false); };
  const install = async () => {
    if (evt) { await evt.prompt(); const r = await evt.userChoice; if (r.outcome === "accepted") setShow(false); setEvt(null); }
    else if (ios) setHowTo((v) => !v);
  };

  return (
    <div role="region" aria-label="تثبيت التطبيق" style={{ ...GLASS, background: "rgba(255,255,255,0.82)", boxShadow: SH, borderRadius: 24, padding: "12px 12px 12px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 12, flexShrink: 0, boxShadow: "0 4px 10px rgba(123,70,135,0.25)" }} />
        <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>ثبّتي التطبيق على هاتفكِ</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يفتح أسرع، ويعمل حتى مع ضعف الإنترنت</div>
        </div>
        <button type="button" onClick={install} style={{ ...DARK, border: "none", height: 38, padding: "0 16px", borderRadius: 19, fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>تثبيت</button>
        <button type="button" onClick={dismiss} aria-label="إغلاق" style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="x" color={C.muted} size={16} />
        </button>
      </div>
      {howTo && (
        <ol style={{ margin: 0, padding: "10px 14px 4px 0", borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.sub, lineHeight: 1.9 }}>
          <li>اضغطي زر المشاركة <Icon name="upload" color={C.accent} size={15} style={{ verticalAlign: "-3px" }} /> أسفل Safari</li>
          <li>اختاري «إضافة إلى الشاشة الرئيسية»</li>
          <li>اضغطي «إضافة»، وسيظهر التطبيق بين تطبيقاتكِ</li>
        </ol>
      )}
    </div>
  );
}
