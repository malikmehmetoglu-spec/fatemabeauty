"use client";

/** P_GiftCard.dc.html — send a digital gift card. */
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkGlow, Icon, Logo, PrimaryButton, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { SERVICE } from "@/lib/data";
import { money } from "@/lib/format";
import { C, CARD, DARK } from "@/lib/tokens";
import { Field, INPUT_STYLE, Segmented } from "../store/c1ui";

type Mode = "s" | "a";
const SESS: [string, number][] = [["تنظيف عميق", SERVICE.clean.price], ["هيدرافيشل", SERVICE.hydra.price], ["تقشير", SERVICE.peel.price]];
const AMTS: [string, number][] = [["رصيد", 1500], ["رصيد", 3000], ["رصيد", 5000]];

const chip = (on: boolean): CSSProperties => ({
  flex: "0 1 auto", minWidth: 0, height: 52, borderRadius: 20, padding: "0 6px", display: "inline-flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", gap: 0, lineHeight: 1.3, whiteSpace: "nowrap",
  ...(on
    ? { background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)", border: "1px solid #FFFFFF", boxShadow: "0 8px 18px rgba(150,100,170,0.28)", color: C.accent }
    : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
});

export default function GiftCardPage() {
  const [mode, setMode] = useState<Mode>("s");
  const [i, setI] = useState(1);
  const [wa, setWa] = useState(true);
  const [sent, setSent] = useState(false);
  const list = mode === "s" ? SESS : AMTS;
  const cur = list[Math.min(i, list.length - 1)];

  return (
    <PhoneScreen gap={12}>
      <TopBar title="بطاقة هدية" back={R.Packages} />

      <div style={{ ...DARK, height: 186, borderRadius: 30, padding: "18px 20px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <DarkGlow />
        <svg width="170" height="170" viewBox="0 0 120 120" aria-hidden="true" style={{ position: "absolute", left: -34, top: -30, opacity: 0.55 }}>
          <defs>
            <linearGradient id="c1gfp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E8D6F0" stopOpacity="0.75" /><stop offset="1" stopColor="#C9A2D8" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="60" cy="38" rx="12" ry="22" fill="url(#c1gfp)" transform={`rotate(${a} 60 60)`} />)}
          <circle cx="60" cy="60" r="9" fill="#E8D6F0" />
        </svg>
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 96, width: 1, background: "linear-gradient(180deg, rgba(217,184,105,0), rgba(217,184,105,0.6), rgba(217,184,105,0))" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ lineHeight: 1.25 }}>
            <Logo light height={40} />
            <div style={{ fontSize: 13, color: C.gold2, fontWeight: 600, marginTop: 2 }}>بطاقة هدية</div>
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{mode === "s" ? `جلسة ${cur[0]}` : "رصيد هدية"}</div>
            <div style={{ fontSize: 15, color: "#E8D6F0" }}><span className="latin" style={{ fontWeight: 600 }}>{money(cur[1], false)}</span> ل.س</div>
          </div>
          <div style={{ fontSize: 12, color: C.onDark, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="heart" color="#E8D6F0" size={15} />هدية من القلب، تُستخدم في المركز
          </div>
        </div>
      </div>

      <Segmented value={mode} onChange={(m) => { setMode(m); setI(1); }} options={[
        { value: "s", label: "جلسة", icon: "sparkle", iconSize: 17 },
        { value: "a", label: "مبلغ", icon: "wallet", iconSize: 17 },
      ]} />

      <div role="radiogroup" aria-label="قيمة الهدية" style={{ display: "flex", gap: 8 }}>
        {list.map((o, k) => (
          <button key={k} type="button" role="radio" aria-checked={k === i} onClick={() => setI(k)} style={chip(k === i)}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{o[0]}</span>
            <span style={{ fontSize: 12.5, opacity: 0.85 }}><span className="latin">{money(o[1], false)}</span> ل.س</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Field id="rname" label="اسم المُهدى إليها" placeholder="الاسم" />
        <Field id="rphone" label="رقم هاتفها" placeholder="09xx xxx xxx" type="tel" ltr />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="gmsg" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>رسالة شخصية</label>
        <textarea id="gmsg" rows={2} placeholder="اكتبي كلمة لطيفة ترافق الهدية" style={{ ...INPUT_STYLE(), height: 62, padding: "12px 14px", resize: "none", lineHeight: 1.5 }} />
      </div>

      <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 22 }}>
        <span style={{ width: 38, height: 38, borderRadius: 19, background: "linear-gradient(145deg,#E8F6EE,#CDEBD9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="msg" color={C.ok} size={18} />
        </span>
        <div style={{ flex: 1, lineHeight: 1.35 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>إرسال عبر واتساب</div>
          <div style={{ fontSize: 11.5, color: C.sub2 }}>تصلها البطاقة برسالة على هاتفها</div>
        </div>
        <Toggle on={wa} onChange={setWa} label="إرسال عبر واتساب" />
      </div>

      <PrimaryButton icon={sent ? "check" : "gift"} onClick={() => setSent(true)} style={{ marginTop: "auto", flexShrink: 0 }}>
        {sent ? "تم تجهيز الهدية" : "إرسال الهدية"}
      </PrimaryButton>
    </PhoneScreen>
  );
}
