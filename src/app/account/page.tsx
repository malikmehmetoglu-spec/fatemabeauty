"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, Icon, Tag, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA } from "@/lib/data";
import { C, CARD, SHB } from "@/lib/tokens";

function Row({ icon, title, sub, href, right, last }: { icon: string; title: string; sub?: string; href?: string; right?: ReactNode; last?: boolean }) {
  const style = { display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: last ? undefined : `1px solid ${C.line}` } as const;
  const inner = (
    <>
      <Circ icon={icon} size={38} iconSize={19} />
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: C.sub2 }}>{sub}</div>}
      </div>
      {right ?? <Icon name="chev" color="#C0ADC5" size={18} stroke={2} />}
    </>
  );
  return href ? <Link href={href} style={style}>{inner}</Link> : <div style={style}>{inner}</div>;
}

const box = { ...CARD, border: "none", position: "relative", borderRadius: 26, padding: "4px 16px" } as const;

/** Account.dc.html — «حسابي» root tab. */
export default function AccountPage() {
  const [wa, setWa] = useState(true);
  const [offers, setOffers] = useState(false);
  return (
    <PhoneScreen tab="حسابي">
      <TopBar title="حسابي" />

      <Link href={R.P_Profile} style={{ ...CARD, border: "none", position: "relative", display: "flex", alignItems: "center", gap: 14, borderRadius: 28, padding: "14px 16px" }}>
        <span style={{
          width: 62, height: 62, borderRadius: 31, flexShrink: 0, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "3px solid #FFFFFF",
          boxShadow: "0 8px 18px rgba(150,100,170,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="user" color={C.accent} size={26} stroke={1.7} />
        </span>
        <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>ملفي الشخصي</div>
          <div dir="ltr" className="latin" style={{ fontSize: 13, color: C.sub2, textAlign: "right" }}>+963 9•• ••• •••</div>
        </div>
        <Tag kind="silver" style={{ height: "auto", borderRadius: 14, padding: "3px 10px", fontWeight: 700, boxShadow: "0 4px 10px rgba(0,0,0,0.10)" }}>{PERSONA.tier.replace(/^ال/, "")}</Tag>
      </Link>

      <div style={box}>
        <Row icon="face" title="نوع بشرتي" sub="تحدده الأخصائية في أول جلسة" href={R.P_SkinType} />
        <Row icon="alert" title="الحساسية والأدوية" sub="تظهر للأخصائية قبل كل جلسة" href={R.P_Allergies} />
        <Row icon="file" title="وصفاتي ونماذجي" sub="الوصفات والموافقات الموقّعة" href={R.P_Prescriptions} />
        <Row icon="receipt" title="مدفوعاتي" sub="الفواتير وسجل الزيارات" href={R.Payments} last />
      </div>

      <div style={box}>
        <Row icon="lang" title="اللغة" href={R.P_Settings} right={
          <><span style={{ fontSize: 13, color: C.sub2 }}>العربية</span><Icon name="chev" color="#C0ADC5" size={18} stroke={2} /></>
        } />
        <Row icon="msg" title="تذكيرات واتساب" sub="قبل الموعد بيوم وبساعتين" right={<Toggle on={wa} onChange={setWa} label="تذكيرات واتساب" />} />
        <Row icon="bell" title="العروض والباقات" sub="إشعارات بالعروض الموسمية" last right={<Toggle on={offers} onChange={setOffers} label="إشعارات العروض" />} />
      </div>

      <Link href={R.Login} style={{
        marginTop: "auto", position: "relative", height: 54, borderRadius: 27, border: "1px solid #E9D6EE", background: C.white, boxShadow: SHB,
        color: C.danger, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        <Icon name="logout" color={C.danger} size={18} stroke={1.9} />تسجيل الخروج
      </Link>
    </PhoneScreen>
  );
}
