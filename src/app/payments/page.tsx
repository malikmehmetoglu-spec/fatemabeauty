"use client";

import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkGlow, Icon, SecondaryButton, SectionTitle } from "@/components/ui";
import { AR_MONTHS, PACKAGE_RULE, PERSONA } from "@/lib/data";
import { dayName, money } from "@/lib/format";
import { C, CARD, DARK, ICON_FILL } from "@/lib/tokens";

type Row = { date: Date; title: string; sub: string; amount: string; unit: string };

const ROWS: Row[] = [
  ...PERSONA.sessions.map((d, i) => ({ date: d, title: `تنظيف عميق — الجلسة ${i + 1}`, sub: `${dayName(d)} · ${PERSONA.specialist}`, amount: "مشمولة", unit: "بالباقة" })).reverse(),
  { date: PERSONA.sessions[0], title: "شراء باقة تنظيف عميق", sub: `${PACKAGE_RULE} · نقداً`, amount: money(PERSONA.packagePrice, false), unit: "ل.س" },
];

const stat = { flex: 1, minWidth: 0, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 18, padding: "8px 12px", lineHeight: 1.35 } as const;

/** Payments.dc.html — the patient's payments and invoices. */
export default function PaymentsPage() {
  return (
    <PhoneScreen>
      <TopBar title="مدفوعاتي" />

      <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
        <DarkGlow style={{ right: "auto", left: -60 }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: C.onDark }}>إجمالي ما دفعتِه</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2 }}>{money(PERSONA.packagePrice, false)} <span style={{ fontSize: 16 }}>ل.س</span></div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, color: C.onDark }}>لا مستحقات</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "3px 10px", fontSize: 12 }}>
              <Icon name="check" color="#FFFFFF" size={13} stroke={2.4} />مسدّد
            </div>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 16 }}>
          <div style={stat}><div style={{ fontSize: 11, color: C.onDark }}>زيارات</div><div style={{ fontSize: 17, fontWeight: 700 }}>{PERSONA.sessionsDone}</div></div>
          <div style={stat}><div style={{ fontSize: 11, color: C.onDark }}>متبقٍ في الباقة</div><div style={{ fontSize: 17, fontWeight: 700 }}>{PERSONA.sessionsLeft} جلسات</div></div>
        </div>
      </div>

      <SectionTitle right={
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.sub2 }}><Icon name="cal" color={C.muted} size={14} />2026</div>
      }>سجل الزيارات والفواتير</SectionTitle>

      <div style={{ ...CARD, border: "none", position: "relative", borderRadius: 26, padding: "2px 16px" }}>
        {ROWS.map((r, i) => (
          <div key={r.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <div style={{ width: 56, height: 52, borderRadius: 14, flexShrink: 0, background: ICON_FILL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.accent }}>{r.date.getDate()}</span>
              <span style={{ fontSize: 10, color: C.sub2, whiteSpace: "nowrap" }}>{AR_MONTHS[r.date.getMonth()]}</span>
            </div>
            <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{r.sub}</div>
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.35, flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{r.amount}</div>
              <div style={{ fontSize: 11, color: C.accentMid }}>{r.unit}</div>
            </div>
          </div>
        ))}
      </div>

      <SecondaryButton icon="download" style={{ marginTop: "auto", position: "relative" }}>تنزيل كشف حساب PDF</SecondaryButton>
    </PhoneScreen>
  );
}
