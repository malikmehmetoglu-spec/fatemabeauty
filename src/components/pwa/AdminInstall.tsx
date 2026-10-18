"use client";

import { useState } from "react";
import { C } from "@/lib/tokens";
import { Icon } from "@/components/ui";
import { useInstall } from "./useInstall";

/** "ثبّتي تطبيق الإدارة" button in the admin sidebar; hidden once installed. */
export function AdminInstall() {
  const { ready, installed, install } = useInstall();
  const [hint, setHint] = useState("");
  if (!ready || installed) return <div style={{ marginTop: "auto" }} />;
  const go = async () => {
    const r = await install();
    if (r === "ios") setHint("من زر المشاركة في Safari اختاري «إضافة إلى الشاشة الرئيسية».");
    else if (r === "unavailable") setHint("من قائمة المتصفح (⋮) اختاري «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».");
  };
  return (
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
      <button type="button" onClick={go} style={{ height: 44, borderRadius: 22, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#9A63A8,#7B4687)", fontFamily: "var(--font-rubik)" }}>
        <Icon name="download" color="#fff" size={18} />ثبّتي تطبيق الإدارة
      </button>
      {hint && <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7, textAlign: "center" }}>{hint}</div>}
    </div>
  );
}
