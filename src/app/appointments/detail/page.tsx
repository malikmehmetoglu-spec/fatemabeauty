"use client";

/** P_AppointmentDetail.dc.html — details of the next appointment. */
import Link from "next/link";
import type { CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, FatemaAvatar, Icon, IconButton, SecondaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_DAYS, AR_MONTHS, PERSONA } from "@/lib/data";
import { C, CARD, DARK, SH_SOFT, SHB } from "@/lib/tokens";
import { DAYS_TO_NEXT, NEXT_SESSION_NO, PKG_SERVICE, PKG_TOTAL } from "@/lib/mock/b";

const GLASS_PILL: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600 };
const ROW: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "11px 0" };

export default function AppointmentDetailPage() {
  const d = PERSONA.nextSession;
  return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الموعد" back={R.P_Appointments} />

      <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
        <DarkGlow />
        <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 600 }}>
                <Icon name="check" color="#FFFFFF" size={13} stroke={2.4} />موعد مؤكد
              </div>
              <div style={{ fontSize: 25, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" }}>{d.getDate()} {AR_MONTHS[d.getMonth()]}</div>
              <div style={{ fontSize: 13.5, color: C.onDark }}>{AR_DAYS[d.getDay()]} {d.getFullYear()} · بعد {DAYS_TO_NEXT} يوماً</div>
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.1 }}>
              <div style={{ fontSize: 12.5, color: C.onDark }}>الساعة</div>
              <div dir="ltr" className="latin" style={{ fontSize: 38, fontWeight: 700 }}>{PERSONA.nextTime}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <span style={GLASS_PILL}><Icon name="door" color="#FFFFFF" size={15} />{PKG_SERVICE.room}</span>
            <span style={GLASS_PILL}><Icon name="clock" color="#FFFFFF" size={15} />{PKG_SERVICE.minutes} دقيقة</span>
          </div>
        </div>
      </div>

      <Link href={R.P_CheckinQR} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 24, padding: "12px 14px", background: "linear-gradient(135deg,#FFFFFF,#F5E9F8)", border: "1px solid #DEC6E8", boxShadow: SH_SOFT }}>
        <span style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="qr" color={C.accent} size={26} stroke={1.6} />
        </span>
        <div style={{ flexGrow: 1, lineHeight: 1.4 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>تسجيل الوصول السريع</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>اعرضي الرمز عند الاستقبال يوم الجلسة</div>
        </div>
        <Icon name="chev" size={18} stroke={2} />
      </Link>

      <div style={{ ...CARD, position: "relative", borderRadius: 26, padding: "2px 16px" }}>
        <div style={ROW}>
          <Circ icon="sparkle" size={42} iconSize={19} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الجلسة</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{PKG_SERVICE.name}</div>
          </div>
        </div>
        <div style={{ ...ROW, borderTop: `1px solid ${C.line}` }}>
          <FatemaAvatar size={42} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الأخصائية</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{PERSONA.specialist}</div>
          </div>
        </div>
        <div style={{ ...ROW, borderTop: `1px solid ${C.line}` }}>
          <Circ icon="gift" size={42} iconSize={19} />
          <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
            <div style={{ fontSize: 12, color: C.sub2 }}>الدفع</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>من باقتكِ · الجلسة {NEXT_SESSION_NO} من {PKG_TOTAL}</div>
          </div>
          <Tag kind="green">مدفوعة</Tag>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 10 }}>
        <SecondaryButton icon="calcheck" height={48} style={{ flex: 1, fontSize: 14, padding: "0 12px" }}>إضافة إلى التقويم</SecondaryButton>
        <IconButton icon="msg" label="مراسلة المركز" size={48} href={R.Consult} />
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Link href={R.Booking} style={{ height: 56, borderRadius: 28, background: C.white, boxShadow: SHB, color: C.accent, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 20px", alignSelf: "stretch", border: `1.5px solid ${C.accent}`, fontSize: 16 }}>
          <Icon name="edit" color={C.accent} size={18} stroke={1.9} />تعديل الموعد
        </Link>
        <Link href={R.P_CancelConfirm} style={{ height: 40, display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: C.danger }}>
          <Icon name="calx" color={C.danger} size={17} />إلغاء الموعد
        </Link>
        <div style={{ fontSize: 12, color: C.sub2, textAlign: "center", lineHeight: 1.6 }}>
          عند الإلغاء يعود الموعد متاحاً لمراجعة أخرى<br />التعديل والإلغاء مجانيان حتى 6 ساعات قبل الموعد
        </div>
      </div>
    </PhoneScreen>
  );
}
