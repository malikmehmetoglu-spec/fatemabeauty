"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, Icon, SectionTitle } from "@/components/ui";
import { R } from "@/lib/routes";
import { HELP_FAQ, WA_ICON } from "@/lib/mock/c2";
import { C, CARD, SELECTED } from "@/lib/tokens";

const contactStyle: CSSProperties = {
  flex: 1, minWidth: 0, height: 96, borderRadius: 24, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: C.white,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
};

function ContactInner({ icon, color = C.accent, label }: { icon: string; color?: string; label: string }) {
  return (
    <>
      <span style={{ width: 48, height: 48, borderRadius: 24, background: C.white, boxShadow: "0 8px 18px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} color={color} size={22} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </>
  );
}

function Row({ children, top }: { children: ReactNode; top?: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: top ? `1px solid ${C.line}` : undefined }}>{children}</div>;
}

/** P_Help.dc.html — help & support. */
export default function HelpPage() {
  const [open, setOpen] = useState(0);
  const [lang, setLang] = useState(0);
  return (
    <PhoneScreen>
      <TopBar title="المساعدة" back={R.Account} />

      <DarkCard radius={32}>
        <div style={{ fontSize: 21, fontWeight: 700 }}>كيف يمكننا مساعدتكِ؟</div>
        <div style={{ fontSize: 13, color: C.onDark, marginTop: 2 }}>تواصلي مع فريق المركز بالطريقة التي تناسبكِ</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Link href={R.P_Chat} style={contactStyle}><ContactInner icon="msg" label="محادثة" /></Link>
          <button type="button" style={contactStyle}><ContactInner icon="phone" label="اتصال" /></button>
          <button type="button" style={contactStyle}><ContactInner icon={WA_ICON} color={C.ok} label="واتساب" /></button>
        </div>
      </DarkCard>

      <SectionTitle>أسئلة شائعة</SectionTitle>
      <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
        {HELP_FAQ.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div key={q} style={{ borderTop: i ? `1px solid ${C.line}` : undefined }}>
              <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{
                width: "100%", minHeight: 54, border: "none", background: "transparent", padding: 0, display: "flex", alignItems: "center", gap: 10, textAlign: "right",
              }}>
                <span style={{ flexGrow: 1, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{q}</span>
                <span style={{
                  width: 30, height: 30, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s",
                  background: isOpen ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.tint, transform: isOpen ? "rotate(180deg)" : undefined,
                }}>
                  <Icon name="down" color={C.accentMid} size={16} stroke={2} />
                </span>
              </button>
              {isOpen && <div style={{ fontSize: 13, lineHeight: 1.65, color: C.sub, padding: "0 0 14px" }}>{a}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ ...CARD, marginTop: "auto", borderRadius: 26, padding: "2px 12px 2px 16px" }}>
        <Link href={R.P_Settings} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
          <Circ icon="bell" size={40} iconSize={18} />
          <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>التذكيرات والإشعارات</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>واتساب · SMS · إشعارات التطبيق</div>
          </div>
          <span style={{ display: "flex", paddingLeft: 4 }}><Icon name="chev" color={C.accentMid} size={18} stroke={2} /></span>
        </Link>
        <Row top>
          <Circ icon="lang" size={40} iconSize={18} />
          <div style={{ flexGrow: 1, fontSize: 14.5, fontWeight: 700 }}>لغة التطبيق</div>
          <div role="group" aria-label="لغة التطبيق" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 22, background: C.tint2 }}>
            {["العربية", "English"].map((t, i) => {
              const on = lang === i;
              return (
                <button key={t} type="button" onClick={() => setLang(i)} aria-pressed={on} className={i ? "latin" : undefined} style={{
                  height: 34, padding: "0 14px", borderRadius: 17, border: "none", fontSize: 13, fontWeight: 600,
                  ...(on ? { background: SELECTED.background, color: C.accent, boxShadow: "0 4px 10px rgba(150,100,170,0.28)" } : { background: "transparent", color: C.muted }),
                }}>{t}</button>
              );
            })}
          </div>
        </Row>
      </div>
    </PhoneScreen>
  );
}
