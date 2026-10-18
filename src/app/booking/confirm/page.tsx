"use client";

import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Circ, DarkGlow, FatemaAvatar, Icon, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, SERVICE } from "@/lib/data";
import { arDate, dayName, money } from "@/lib/format";
import { C, DARK } from "@/lib/tokens";

/** P_Confirm.dc.html — review the booking and choose how to pay. */
const DOOR = "M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16";

export default function ConfirmPage() {
  const [pay, setPay] = useState<"pkg" | "centre">("pkg");
  const svc = SERVICE[PERSONA.packageService];
  const date = PERSONA.nextSession;
  const pkg = pay === "pkg";
  const PAYS = [
    { k: "pkg" as const, icon: "gift", title: "من باقتكِ", sub: `${PERSONA.package} · متبقٍ ${PERSONA.sessionsLeft} جلسات` },
    { k: "centre" as const, icon: "wallet", title: "الدفع في المركز", sub: "نقداً أو بالبطاقة يوم الجلسة" },
  ];
  const chip = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600, color: C.white } as const;

  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title="مراجعة الحجز" back={R.Booking} />

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>موعدكِ</div>
              <div style={{ fontSize: "clamp(22px, 6.6vw, 26px)", fontWeight: 700, whiteSpace: "nowrap" }}>{arDate(date, { day: false })}</div>
              <div style={{ fontSize: 14, color: "#F2E6F4" }}>{dayName(date)} · {date.getFullYear()}</div>
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.1 }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>الساعة</div>
              <div dir="ltr" className="latin" style={{ fontSize: 38, fontWeight: 700 }}>{PERSONA.nextTime}</div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "14px 0 12px" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={chip}><Icon name="sparkle" color="#FFFFFF" size={15} />{svc.name} · {svc.minutes} د</span>
            <span style={chip}><Icon name={DOOR} color="#FFFFFF" size={15} />{svc.room}</span>
          </div>
        </div>
      </div>

      <Card padding="4px 16px">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0" }}>
          <FatemaAvatar size={42} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الأخصائية</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>فاطمة طيبة</div>
          </div>
          <span style={{ fontSize: 12, color: C.sub2 }}>أخصائية عناية بالبشرة</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
          <Circ icon="receipt" size={42} iconSize={19} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>قيمة الجلسة</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{money(svc.price)}</div>
          </div>
          <Tag kind="green" style={{ opacity: pkg ? 1 : 0 }}>مشمولة بالباقة</Tag>
        </div>
      </Card>

      <h2 style={{ position: "relative", margin: "0 0 -4px", fontSize: 15, fontWeight: 700 }}>طريقة الدفع</h2>
      <div role="radiogroup" aria-label="طريقة الدفع" style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        {PAYS.map((p) => {
          const on = pay === p.k;
          return (
            <button key={p.k} type="button" role="radio" aria-checked={on} onClick={() => setPay(p.k)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "11px 14px",
              ...(on ? { background: "linear-gradient(160deg,#FFFFFF 0%,#F4E6F8 100%)", border: "1.5px solid #C9A2D8", boxShadow: "0 10px 22px rgba(150,100,170,0.20)" }
                : { background: C.white, border: "1.5px solid #F0E6F3", boxShadow: "0 6px 16px rgba(123,70,135,0.06)" }),
            }}>
              <Circ icon={p.icon} size={40} iconSize={19} />
              <span style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4, textAlign: "right" }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.ink }}>{p.title}</span>
                <span style={{ display: "block", fontSize: 12, color: C.sub2 }}>{p.sub}</span>
              </span>
              <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", border: on ? `2px solid ${C.accent}` : "1.5px solid #DACADE", background: C.white }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: on ? "linear-gradient(145deg,#C9A2D8,#7B4687)" : "transparent" }} />
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 20, padding: "11px 14px", background: "rgba(255,255,255,0.55)", border: "1px dashed #E1CDE6" }}>
        <Icon name="info" color={C.accentMid} size={18} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>التعديل أو الإلغاء مجاني حتى <b style={{ color: C.accent }}>6 ساعات</b> قبل الموعد.</div>
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 6px" }}>
          <span style={{ fontSize: 13, color: C.sub2 }}>{pkg ? "المستحق الآن" : "تدفعينها في المركز"}</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{money(pkg ? 0 : svc.price)}</span>
        </div>
        <PrimaryButton href={R.P_Booked}>تأكيد الحجز</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
