"use client";

/** P_Prescriptions.dc.html — «وصفاتي»: latest prescription, previous ones, signed consent forms. */
import Link from "next/link";
import type { CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, FatemaAvatar, Icon, IconButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS, PERSONA } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, CARD, DARK } from "@/lib/tokens";
import { PKG_SERVICE, TODAY_LABEL } from "@/lib/mock/b";

const SEAL = "M9 12l2 2 4-4M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9L3.3 14.7l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z";
const DARK_PILL: CSSProperties = { height: 28, padding: "0 11px", borderRadius: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 };
const ROW: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 0" };
const short = (d: Date) => `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`;
const PREVIOUS = PERSONA.sessions.slice(0, -1).reverse(); // 15 أيلول, 18 آب
const FIRST = PERSONA.sessions[0];
const CONSENTS = [PKG_SERVICE.name, "الموافقة على تصوير البشرة"];

export default function PrescriptionsPage() {
  return (
    <PhoneScreen>
      <TopBar title="وصفاتي" back={R.Account} />

      <Link href={R.Routine} style={{ ...DARK, display: "block", borderRadius: 32, padding: 20, position: "relative", overflow: "hidden" }}>
        <DarkGlow />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>الأحدث</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.onDark }}><Icon name={SEAL} color={C.onDark} size={15} />موثّقة برمز QR</span>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
          <FatemaAvatar size={50} />
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>وصفة العناية</div>
            <div style={{ fontSize: 13, color: C.onDark }}>{PERSONA.specialist} · {TODAY_LABEL}</div>
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={DARK_PILL}><Icon name="bottle" color="#FFFFFF" size={14} />غسول لطيف</span>
          <span style={DARK_PILL}><Icon name="drop" color="#FFFFFF" size={14} />سيروم مرطب</span>
          <span style={DARK_PILL}><Icon name="sun" color="#FFFFFF" size={14} />واقي شمس SPF 50</span>
        </div>
        <div style={{ position: "relative", marginTop: 14, height: 46, borderRadius: 23, background: C.white, color: C.accent, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 8px 18px rgba(0,0,0,0.12)" }}>
          افتحي روتيني<Icon name="chev" color={C.accent} size={16} stroke={2} />
        </div>
      </Link>

      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>الوصفات السابقة</h2>
      <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
        {PREVIOUS.map((d, i) => (
          <div key={short(d)} style={{ ...ROW, borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Circ icon="file" size={42} iconSize={19} />
            <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>وصفة العناية · {short(d)}</div>
              <div style={{ fontSize: 12, color: C.sub2, display: "flex", alignItems: "center", gap: 4 }}>
                {PERSONA.specialist} · <Icon name={SEAL} color={C.okDeep} size={13} /><span style={{ color: C.okDeep }}>موثّقة برمز QR</span>
              </div>
            </div>
            <IconButton icon="download" label={`تنزيل وصفة ${short(d)}`} size={40} />
          </div>
        ))}
      </div>

      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>نماذج الموافقة الموقّعة</h2>
      <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
        {CONSENTS.map((name, i) => (
          <Link key={name} href={R.P_Consent} style={{ ...ROW, borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Circ icon="sign" size={42} iconSize={19} />
            <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>موقّع {arDate(FIRST)}</div>
            </div>
            <Tag kind="green">موقّع</Tag>
            <span style={{ marginInlineStart: 2, display: "flex" }}><Icon name="chev" size={18} stroke={2} /></span>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-start", gap: 10, padding: "0 4px" }}>
        <Icon name="qr" size={18} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>رمز QR على كل وصفة يؤكد أنها صادرة عن المركز عند عرضها في الصيدلية</div>
      </div>
    </PhoneScreen>
  );
}
