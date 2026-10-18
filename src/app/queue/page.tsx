"use client";

/** Queue.dc.html — «موعدي اليوم»: the patient's live queue number (data: no. 12, غرفة 1, 13:00). */
import Link from "next/link";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, FatemaAvatar, Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, PERSONA_TODAY } from "@/lib/data";
import { C, DARK, SH } from "@/lib/tokens";
import { AHEAD, TODAY_LABEL, WAIT_MIN, patientsAr } from "@/lib/mock/b";

export default function QueuePage() {
  const rows = [
    { icon: "sparkle", label: "الجلسة", value: PERSONA_TODAY.serviceName },
    { photo: true, label: "الأخصائية", value: PERSONA_TODAY.specialist },
    { icon: "clock", label: "الموعد", value: `${TODAY_LABEL} · ${PERSONA_TODAY.time}` },
  ];
  return (
    <PhoneScreen>
      <TopBar title="موعدي اليوم" back={R.P_CheckinQR} />

      <div style={{ ...DARK, borderRadius: 34, padding: "22px 22px 20px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", bottom: -80, right: -60, width: 240, height: 240, borderRadius: 120, background: "radial-gradient(circle, rgba(200,160,220,0.35) 0%, rgba(200,160,220,0) 70%)" }} />
        <svg aria-hidden width={160} height={160} viewBox="0 0 160 160" style={{ position: "absolute", top: -40, left: -40 }}>
          <circle cx={80} cy={80} r={78} fill="none" stroke="#7C5485" strokeWidth={1} />
          <circle cx={80} cy={80} r={56} fill="none" stroke="#7C5485" strokeWidth={1} />
        </svg>
        <div style={{ position: "relative", fontSize: 14, color: C.onDark }}>رقم دوركِ</div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{PERSONA.queueNo}</div>
          <div style={{ background: "linear-gradient(145deg, #FFFFFF, #E8D0ED)", boxShadow: "0 6px 16px rgba(0,0,0,0.18)", color: C.accent, borderRadius: 18, padding: "6px 14px", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{PERSONA.room}</div>
        </div>
        <div style={{ position: "relative", height: 1, background: "#7C5485", margin: "12px 0 14px" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: C.onDark }}>أمامكِ</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{patientsAr(AHEAD.length)}</div>
          </div>
          <div aria-hidden style={{ display: "flex", gap: 6 }}>
            {AHEAD.map((a) => <span key={a.id} style={{ width: 10, height: 10, borderRadius: 5, background: "#E8D6F0" }} />)}
            <span style={{ width: 24, height: 10, borderRadius: 5, background: "#FFFFFF" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, color: C.onDark }}>الانتظار المتوقع</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>~ {WAIT_MIN} دقيقة</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.white, borderRadius: 28, padding: "6px 18px", position: "relative", border: "1px solid #FFFFFF", boxShadow: SH }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.line}` : undefined }}>
            {r.photo ? <FatemaAvatar size={42} /> : <Circ icon={r.icon!} size={42} iconSize={19} />}
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: 12, color: C.sub2 }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.75), rgba(243,234,246,0.75))", border: "1px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.06)", borderRadius: 22, padding: "12px 16px", position: "relative", display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="bell" size={22} />
        <div style={{ fontSize: 13, color: C.accent, lineHeight: 1.5 }}>خذي راحتكِ، سنرسل لكِ إشعاراً قبل دوركِ بدقائق.</div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        <Link href={R.Booking} style={{ height: 56, borderRadius: 28, border: `1.5px solid ${C.accent}`, background: C.white, boxShadow: "0 8px 20px rgba(123,70,135,0.10)", color: C.accent, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>تعديل الموعد</Link>
        <Link href={R.P_CancelConfirm} style={{ height: 48, borderRadius: 24, color: C.danger, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>إلغاء الموعد</Link>
        <div style={{ textAlign: "center", fontSize: 12, color: C.sub2, marginTop: -6 }}>عند الإلغاء يعود الموعد متاحاً لمراجعة أخرى</div>
      </div>
    </PhoneScreen>
  );
}
