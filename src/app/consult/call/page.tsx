"use client";

/** P_InCall.dc.html — online consultation call. Video calling is not connected yet: honest state. */
import { PhoneScreen } from "@/components/shell";
import { Icon, PrimaryButton, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, GLASS } from "@/lib/tokens";

export default function InCallPage() {
  return (
    <PhoneScreen background="#35213D" blobs={false}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", color: C.white, padding: "0 12px" }}>
        <span style={{ ...GLASS, width: 92, height: 92, borderRadius: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="cam" color={C.accent} size={38} />
        </span>
        <div style={{ fontSize: 22, fontWeight: 700 }}>الاتصال المرئي غير مفعّل بعد</div>
        <div style={{ fontSize: 14, color: "#E8D6F0", lineHeight: 1.8, maxWidth: 330 }}>
          نعمل على تفعيل مكالمات الفيديو داخل التطبيق. حتى ذلك الحين يتواصل معكِ المركز في موعد استشارتكِ لترتيب المكالمة، ويمكنكِ مراسلتنا في أي وقت.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <PrimaryButton icon="msg" href={R.P_Chat}>مراسلة المركز</PrimaryButton>
        <SecondaryButton href={R.Consult}>العودة إلى الاستشارات</SecondaryButton>
      </div>
    </PhoneScreen>
  );
}
