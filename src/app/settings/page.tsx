"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { prefsOf, updatePatient, useMe, type NotifyPrefs } from "@/lib/db/patients";
import { Wait } from "../account/Wait";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, ErrorNote, Icon, Toggle } from "@/components/ui";
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
  const { me, loading, error } = useMe();
  const [askDelete, setAskDelete] = useState(false);
  const [askPhone, setAskPhone] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const save = (patch: Parameters<typeof updatePatient>[1]) => {
    if (!me) return;
    setSaveErr("");
    updatePatient(me.id, patch).catch(() => setSaveErr("تعذّر حفظ التغيير. تحققي من الاتصال وحاولي مجدداً."));
  };
  const lang = me?.lang === "en" ? "en" : "ar";
  const setLang = (v: "ar" | "en") => save({ lang: v });
  const prefs = prefsOf(me?.notify);
  const pref = (k: keyof NotifyPrefs) => (v: boolean) => save({ notify: { ...prefs, [k]: v } });

  const seg = (on: boolean): CSSProperties => ({
    flex: 1, height: 40, borderRadius: 20, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    ...(on
      ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
      : { background: "transparent", border: "1px solid transparent", color: C.sub2 }),
  });

  return (
    <PhoneScreen>
      <TopBar title="الإعدادات" back={R.Account} />
      {!me ? <Wait loading={loading} error={error} /> : (<>

      {saveErr && <ErrorNote>{saveErr}</ErrorNote>}
      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px", position: "relative", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Circ icon="lang" size={38} iconSize={17} />
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>لغة الرسائل والتذكيرات</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>بها تصلكِ رسائل واتساب والرسائل النصية، والتطبيق بالعربية</div>
          </div>
        </div>
        <div role="group" aria-label="اللغة" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 24, background: "#F8F2FA", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", marginTop: 10 }}>
          <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")} style={seg(lang === "ar")}>العربية</button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} style={seg(lang === "en")}><span className="latin">English</span></button>
        </div>
      </div>

      <Group title="الإشعارات">
        <SwitchRow icon="msg" title="تذكيرات واتساب" sub="قبل الموعد بيوم وبساعتين" on={prefs.whatsapp} set={pref("whatsapp")} top={false} />
        <SwitchRow icon="phone" title="رسائل SMS" sub="عند تعذّر الوصول عبر واتساب" on={prefs.sms} set={pref("sms")} />
        <SwitchRow icon="bell" title="إشعارات التطبيق" sub="دوركِ، الجلسات، الطلبات" on={prefs.app} set={pref("app")} />
        <SwitchRow icon="megaphone" title="العروض والباقات" sub="عروض موسمية من المركز" on={prefs.offers} set={pref("offers")} />
      </Group>

      <Group title="الخصوصية">
        <SwitchRow icon="camera" title="استخدام صوري في التسويق" sub="لن تُستخدم صوركِ إلا بموافقتكِ" on={prefs.photos_marketing} set={pref("photos_marketing")} top={false} />
      </Group>

      <Group title="الحساب">
        <button type="button" onClick={() => setAskPhone((v) => !v)} aria-expanded={askPhone} style={{ ...rowStyle(false), width: "100%", border: "none", background: "none", textAlign: "right" }}>
          <Circ icon="phone" size={38} iconSize={17} />
          <span style={{ flex: 1, lineHeight: 1.35 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.ink }}>تغيير رقم الهاتف</span>
            <span dir="ltr" className="latin" style={{ display: "block", fontSize: 12, color: C.sub2, textAlign: "right" }}>{me.phone ?? ""}</span>
          </span>
          <Icon name="chev" color={C.muted} size={18} />
        </button>
        {askPhone && <div role="status" style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, padding: "0 0 10px" }}>رقمكِ هو مفتاح دخولكِ وملفكِ الصحي، لذلك يُغيَّر من استقبال المركز بعد التحقق من هويتكِ. أخبري الاستقبال برقم ملفكِ <b className="latin">{me.file_no}</b> أو <Link href={R.P_Chat} style={{ color: C.accent, fontWeight: 700 }}>راسلي المركز</Link>.</div>}
        <button type="button" onClick={() => setAskDelete(true)} style={{ ...rowStyle(true), width: "100%", borderWidth: "1px 0 0", borderStyle: "solid", borderColor: C.line, background: "none", textAlign: "right" }}>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="trash" color={C.danger} size={18} />
          </span>
          <span style={{ flex: 1, lineHeight: 1.35 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.danger }}>طلب حذف الحساب</span>
            <span style={{ display: "block", fontSize: 12, color: C.sub2 }}>يراجع المركز الطلب ويتواصل معكِ</span>
          </span>
        </button>
        {askDelete && <div role="status" style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, padding: "4px 0 10px" }}>لحذف حسابكِ وملفكِ الصحي تواصلي مع استقبال المركز برقم ملفكِ <b className="latin">{me.file_no}</b>، فيُراجَع الطلب ويُنفَّذ بعد التحقق من هويتكِ.</div>}
      </Group>
      </>)}
    </PhoneScreen>
  );
}
