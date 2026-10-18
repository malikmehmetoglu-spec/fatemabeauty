"use client";

import { Fragment, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Circ, FatemaAvatar, Icon, IconButton, PrimaryButton, SecondaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, SERVICE } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, CARD, DONE_GRAD, GLASS } from "@/lib/tokens";

/** P_Booked.dc.html — booking success. */
const DOOR = "M14 12v.01M3 21h18M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16";
const abs = (top: number, left: number, extra: CSSProperties = {}): CSSProperties => ({ position: "absolute", top, left, ...extra });

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
      <Circ icon={icon} size={36} iconSize={16} />
      <div style={{ lineHeight: 1.35, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: C.sub2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{value}</div>
      </div>
    </div>
  );
}

function addToCalendar() {
  const d = PERSONA.nextSession;
  const [h, m] = PERSONA.nextTime.split(":").map(Number);
  const svc = SERVICE[PERSONA.packageService];
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = (mins: number) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m + mins);
    return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}T${p(t.getHours())}${p(t.getMinutes())}00`;
  };
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fatema Beauty//AR", "BEGIN:VEVENT", `UID:${stamp(0)}@fatemabeauty`,
    `DTSTART:${stamp(0)}`, `DTEND:${stamp(svc.minutes)}`, `SUMMARY:${svc.name} — Fatema Beauty`, `LOCATION:${svc.room}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "fatema-beauty.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function BookedPage() {
  const svc = SERVICE[PERSONA.packageService];
  const sparkle = (top: number, left: number, size: number, color: string) => (
    <span aria-hidden style={abs(top, left)}><Icon name="sparkle" color={color} size={size} stroke={1.6} /></span>
  );
  const dot = (top: number, left: number, size: number, color: string) => (
    <span aria-hidden style={abs(top, left, { width: size, height: size, borderRadius: "50%", background: color })} />
  );
  const rows: [string, string, string][][] = [
    [["cal", "التاريخ", arDate(PERSONA.nextSession)]],
    [["clock", "الساعة", PERSONA.nextTime], [DOOR, "المكان", svc.room]],
    [["sparkle", "الجلسة", svc.name]],
  ];
  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <div style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
        <IconButton icon="x" label="إغلاق" href={R.Main} />
      </div>
      <div style={{ position: "relative", textAlign: "center", marginTop: -26 }}>
        <div style={{ position: "relative", width: 230, height: 200, margin: "0 auto" }}>
          <div aria-hidden style={abs(15, 30, { width: 170, height: 170, borderRadius: 85, background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)" })} />
          <div aria-hidden style={abs(25, 40, { width: 150, height: 150, borderRadius: 75, border: "1px solid rgba(217,184,105,0.55)" })} />
          <div aria-hidden style={abs(40, 55, { ...GLASS, width: 120, height: 120, borderRadius: 60, boxShadow: "0 18px 40px rgba(123,70,135,0.22)" })} />
          <div style={abs(54, 69, { ...DONE_GRAD, width: 92, height: 92, borderRadius: 46, boxShadow: "0 14px 30px rgba(123,70,135,0.40), inset 0 2px 0 rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" })}>
            <Icon name="check" color="#FFFFFF" size={44} stroke={2.6} />
          </div>
          {sparkle(18, 22, 22, C.gold)}{sparkle(150, 190, 18, "#CA96D6")}{sparkle(6, 178, 14, "#CA96D6")}
          {dot(92, 12, 7, "#E3C4EA")}{dot(64, 206, 6, C.gold2)}{dot(172, 50, 5, C.gold2)}{dot(28, 120, 5, "#E3C4EA")}
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.accent }}>تم الحجز بنجاح</h1>
        <p style={{ margin: "6px 0 0", fontSize: 15, color: C.sub }}>نراكِ قريباً، بشرتكِ على موعد مع العناية</p>
      </div>

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r, i) => (
          <Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: C.line }} />}
            <div style={{ display: "flex", gap: 10 }}>{r.map(([ic, l, v]) => <Info key={l} icon={ic} label={l} value={v} />)}</div>
          </Fragment>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 18, padding: "8px 10px", background: "#FAF5FB" }}>
          <FatemaAvatar size={36} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>الأخصائية</div>
            <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>فاطمة طيبة</div>
          </div>
          <span style={{ marginInlineStart: "auto" }}><Tag kind="pink">من الباقة · الجلسة {PERSONA.sessionsDone + 1} من 6</Tag></span>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, color: C.sub, textAlign: "center" }}>
        <span style={{ width: 28, height: 28, borderRadius: 14, background: "#E6F4EC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="msg" color={C.ok} size={16} />
        </span>أُرسل التأكيد على واتساب، وسنذكّركِ قبل الموعد
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <SecondaryButton icon="calcheck" onClick={addToCalendar}>إضافة إلى التقويم</SecondaryButton>
        <PrimaryButton href={R.Main}>العودة للرئيسية</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
