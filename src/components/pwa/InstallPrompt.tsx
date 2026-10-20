"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { C, DARK, GLASS, SH } from "@/lib/tokens";
import { useInstall, type AppKind } from "./useInstall";

/** Step-by-step help when the browser has no one-tap install (iPhone Safari, or before Chrome is ready). */
export function InstallSteps({ ios }: { ios: boolean }) {
  const steps = ios
    ? [<>اضغطي زر المشاركة <Icon name="upload" color={C.accent} size={15} style={{ verticalAlign: "-3px" }} /> أسفل Safari</>,
       <>اختاري «إضافة إلى الشاشة الرئيسية»</>, <>اضغطي «إضافة»، وسيظهر التطبيق بين تطبيقاتكِ</>]
    : [<>افتحي قائمة المتصفح <span className="latin">⋮</span> أعلى الشاشة</>,
       <>اختاري «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»</>, <>اضغطي «تثبيت»، وسيظهر التطبيق بين تطبيقاتكِ</>];
  return (
    <ol style={{ margin: 0, padding: "10px 18px 2px 0", borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.sub, lineHeight: 1.9 }}>
      {steps.map((s, i) => <li key={i}>{s}</li>)}
    </ol>
  );
}

/** «ثبّتي التطبيق» card — shown to everyone who has not installed the app yet (`app="store"`: the store app). */
export function InstallPrompt({ style, app = "patient" }: { style?: CSSProperties; app?: AppKind }) {
  const { ready, installed, ios, install } = useInstall(app);
  const store = app === "store";
  const [help, setHelp] = useState(false);
  if (!ready || installed) return null;

  const onClick = async () => {
    const r = await install();
    if (r === "ios" || r === "unavailable") setHelp((v) => !v);
  };

  return (
    <div role="region" aria-label={store ? "تثبيت تطبيق المتجر" : "تثبيت التطبيق"} style={{ ...GLASS, background: "rgba(255,255,255,0.82)", boxShadow: SH, borderRadius: 24, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store ? "/icons/store-192.png" : "/icons/icon-192.png"} alt="" width={44} height={44} style={{ borderRadius: 12, flexShrink: 0, boxShadow: "0 4px 10px rgba(123,70,135,0.25)" }} />
        <div style={{ flexGrow: 1, lineHeight: 1.35, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{store ? "ثبّتي تطبيق المتجر" : "ثبّتي التطبيق"}</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>{store ? "تسوّقي وتابعي طلباتكِ بلمسة من شاشتكِ" : "يفتح أسرع، ويعمل حتى مع ضعف الإنترنت"}</div>
        </div>
        <button type="button" onClick={onClick} style={{ ...DARK, border: "none", height: 38, padding: "0 16px", borderRadius: 19, fontSize: 13.5, fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="download" color="#FFFFFF" size={16} stroke={2} />تثبيت
        </button>
      </div>
      {help && <InstallSteps ios={ios} />}
    </div>
  );
}

/** Compact «ثبّتي تطبيق المتجر» pill for the desktop store header; hidden once the store app is installed. */
export function StoreInstallButton({ className }: { className?: string }) {
  const { ready, installed, ios, install } = useInstall("store");
  const [help, setHelp] = useState(false);
  if (!ready || installed) return null;
  const onClick = async () => {
    const r = await install();
    if (r === "ios" || r === "unavailable") setHelp((v) => !v);
  };
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={onClick} className={className} aria-expanded={help} aria-label="ثبّتي تطبيق المتجر" title="ثبّتي تطبيق المتجر"
        style={{ height: 44, padding: "0 16px 0 12px", borderRadius: 22, border: "1px solid rgba(201,162,102,0.55)", cursor: "pointer",
          background: "linear-gradient(135deg,#5E3068,#4A2352)", color: "#F3DFB4", fontFamily: "var(--font-rubik)", fontSize: 13.5, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 6px 14px rgba(74,35,82,0.25)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/store-192.png" alt="" width={26} height={26} style={{ borderRadius: 8 }} /><span>ثبّتي تطبيق المتجر</span>
      </button>
      {help && (
        <div role="note" style={{ position: "absolute", top: 52, insetInlineEnd: 0, width: 300, zIndex: 50, background: "#FFFFFF", borderRadius: 20, boxShadow: SH, padding: "12px 14px", color: C.ink }}>
          <InstallSteps ios={ios} />
        </div>
      )}
    </div>
  );
}
