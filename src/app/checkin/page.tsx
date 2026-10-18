"use client";

/** P_CheckinQR.dc.html — check-in QR code shown at the reception tablet (today's visit). */
import type { CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, FatemaAvatar, IconButton, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, PERSONA_TODAY } from "@/lib/data";
import { C, CARD, GLASS, SH_SOFT } from "@/lib/tokens";
import { QR_CELLS, TODAY_LABEL } from "@/lib/mock/b";

const M = 9.36;
const corner = (pos: CSSProperties): CSSProperties => ({ position: "absolute", width: 22, height: 22, ...pos });
const B = "3px solid #A877B6";

function Qr() {
  return (
    <svg width={234} height={234} viewBox="0 0 234 234" role="img" aria-label="رمز تسجيل الوصول" style={{ display: "block", maxWidth: "100%", height: "auto" }}>
      <g fill={C.accent}>
        {QR_CELLS.map(([x, y]) => <rect key={`${x}-${y}`} x={x * M} y={y * M} width={9.66} height={9.66} rx={1.2} />)}
      </g>
      {[[4.68, 4.68], [173.16, 4.68], [4.68, 173.16]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={56.16} height={56.16} rx={14.98} fill="none" stroke={C.accent} strokeWidth={9.36} />
          <rect x={x + 14.04} y={y + 14.04} width={28.08} height={28.08} rx={8.42} fill={C.accent} />
        </g>
      ))}
    </svg>
  );
}

export default function CheckinPage() {
  return (
    <PhoneScreen>
      <TopBar title="تسجيل الوصول" back={R.P_AppointmentDetail} />

      <div style={{ ...GLASS, borderRadius: 34, padding: "22px 22px 20px", boxShadow: "0 18px 40px rgba(123,70,135,0.14), inset 0 1px 0 #FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -70, left: -60, width: 220, height: 220, borderRadius: 110, background: "radial-gradient(circle, rgba(190,150,215,0.45) 0%, rgba(190,150,215,0) 70%)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Tag kind="pink">صالح يوم موعدكِ فقط</Tag>
          <Tag kind="gray">ملف رقم {PERSONA.fileNo}</Tag>
        </div>
        <div style={{ position: "relative", padding: 18, borderRadius: 30, background: C.white, boxShadow: "0 14px 30px rgba(123,70,135,0.14), inset 0 0 0 1px #F0E6F3" }}>
          <Qr />
          <span style={{ ...corner({ top: 8, left: 8 }), borderTop: B, borderLeft: B, borderTopLeftRadius: 10 }} />
          <span style={{ ...corner({ top: 8, right: 8 }), borderTop: B, borderRight: B, borderTopRightRadius: 10 }} />
          <span style={{ ...corner({ bottom: 8, left: 8 }), borderBottom: B, borderLeft: B, borderBottomLeftRadius: 10 }} />
          <span style={{ ...corner({ bottom: 8, right: 8 }), borderBottom: B, borderRight: B, borderBottomRightRadius: 10 }} />
        </div>
        <div style={{ position: "relative", textAlign: "center", lineHeight: 1.4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>امسحيه على تابلت الاستقبال عند وصولكِ</div>
          <div style={{ fontSize: 13, color: C.sub }}>يُسجَّل وصولكِ ويصلكِ رقم دوركِ فوراً على هاتفكِ</div>
        </div>
      </div>

      <div style={{ ...CARD, borderRadius: 26, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <FatemaAvatar size={50} />
        <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{PERSONA_TODAY.serviceName}</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>{TODAY_LABEL} · {PERSONA_TODAY.time} · {PERSONA_TODAY.room}</div>
        </div>
        <IconButton icon="back" label="موعدي اليوم" size={40} href={R.Queue} />
      </div>

      <div style={{ borderRadius: 22, padding: "12px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 12 }}>
        <Circ icon="sun" size={38} iconSize={17} />
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>ارفعي سطوع الشاشة</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>يُقرأ الرمز أسرع عندما تكون الشاشة مضيئة</div>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
        <IconButton icon="download" label="حفظ الرمز في الصور" size={58} />
        <PrimaryButton icon="lock" style={{ flexGrow: 1, whiteSpace: "nowrap" }}>أضيفيه إلى شاشة القفل</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
