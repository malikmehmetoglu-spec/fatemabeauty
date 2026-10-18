"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui";
import { C, DARK, GLASS, SH } from "@/lib/tokens";
import { useInstall } from "./useInstall";

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

/** «ثبّتي التطبيق» card — shown to everyone who has not installed the app yet. */
export function InstallPrompt({ style }: { style?: CSSProperties }) {
  const { ready, installed, ios, install } = useInstall();
  const [help, setHelp] = useState(false);
  if (!ready || installed) return null;

  const onClick = async () => {
    const r = await install();
    if (r === "ios" || r === "unavailable") setHelp((v) => !v);
  };

  return (
    <div role="region" aria-label="تثبيت التطبيق" style={{ ...GLASS, background: "rgba(255,255,255,0.82)", boxShadow: SH, borderRadius: 24, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 12, flexShrink: 0, boxShadow: "0 4px 10px rgba(123,70,135,0.25)" }} />
        <div style={{ flexGrow: 1, lineHeight: 1.35, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>ثبّتي التطبيق</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يفتح أسرع، ويعمل حتى مع ضعف الإنترنت</div>
        </div>
        <button type="button" onClick={onClick} style={{ ...DARK, border: "none", height: 38, padding: "0 16px", borderRadius: 19, fontSize: 13.5, fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="download" color="#FFFFFF" size={16} stroke={2} />تثبيت
        </button>
      </div>
      {help && <InstallSteps ios={ios} />}
    </div>
  );
}
