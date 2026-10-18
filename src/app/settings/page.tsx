"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, Icon, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, CARD } from "@/lib/tokens";

const box: CSSProperties = { ...CARD, borderRadius: 24, padding: "0 16px 4px", position: "relative", flexShrink: 0 };
const rowStyle = (top: boolean): CSSProperties => ({ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: top ? `1px solid ${C.line}` : undefined });

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={box}>
      <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.sub2, paddingTop: 10 }}>{title}</h2>
      {children}
    </section>
  );
}

function SwitchRow({ icon, title, sub, on, set, top = true }: { icon: string; title: string; sub: string; on: boolean; set: (v: boolean) => void; top?: boolean }) {
  return (
    <div style={rowStyle(top)}>
      <Circ icon={icon} size={38} iconSize={17} />
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={set} label={title} />
    </div>
  );
}

/** P_Settings.dc.html — app settings (language, notifications, privacy, account). */
export default function SettingsPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [wa, setWa] = useState(true);
  const [sms, setSms] = useState(true);
  const [app, setApp] = useState(true);
  const [offers, setOffers] = useState(false);
  const [mkt, setMkt] = useState(false);

  const seg = (on: boolean): CSSProperties => ({
    flex: 1, height: 40, borderRadius: 20, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    ...(on
      ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
      : { background: "transparent", border: "1px solid transparent", color: C.sub2 }),
  });

  return (
    <PhoneScreen>
      <TopBar title="الإعدادات" back={R.Account} />

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", position: "relative", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Circ icon="lang" size={38} iconSize={17} />
          <div style={{ fontSize: 15, fontWeight: 700 }}>اللغة</div>
        </div>
        <div role="group" aria-label="اللغة" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 24, background: "#F8F2FA", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", marginTop: 10 }}>
          <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")} style={seg(lang === "ar")}>العربية</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} style={seg(lang === "en")}><span className="latin">English</span></button>
        </div>
      </div>

      <Group title="الإشعارات">
        <SwitchRow icon="msg" title="تذكيرات واتساب" sub="قبل الموعد بيوم وبساعتين" on={wa} set={setWa} top={false} />
        <SwitchRow icon="phone" title="رسائل SMS" sub="عند تعذّر الوصول عبر واتساب" on={sms} set={setSms} />
        <SwitchRow icon="bell" title="إشعارات التطبيق" sub="دوركِ، الجلسات، الطلبات" on={app} set={setApp} />
        <SwitchRow icon="megaphone" title="العروض والباقات" sub="عروض موسمية من المركز" on={offers} set={setOffers} />
      </Group>

      <Group title="الخصوصية">
        <SwitchRow icon="camera" title="استخدام صوري في التسويق" sub="لن تُستخدم صوركِ إلا بموافقتكِ" on={mkt} set={setMkt} top={false} />
      </Group>

      <Group title="الحساب">
        <Link href={R.P_OTP} style={rowStyle(false)}>
          <Circ icon="phone" size={38} iconSize={17} />
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>تغيير رقم الهاتف</div>
          <Icon name="chev" color={C.muted} size={18} />
        </Link>
        <button type="button" style={{ ...rowStyle(true), width: "100%", borderWidth: "1px 0 0", borderStyle: "solid", borderColor: C.line, background: "none", textAlign: "right" }}>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="trash" color={C.danger} size={18} />
          </span>
          <span style={{ flex: 1, lineHeight: 1.35 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.danger }}>طلب حذف الحساب</span>
            <span style={{ display: "block", fontSize: 12, color: C.sub2 }}>يراجع المركز الطلب ويتواصل معكِ</span>
          </span>
        </button>
      </Group>
    </PhoneScreen>
  );
}
