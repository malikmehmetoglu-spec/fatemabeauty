"use client";

/** P_Survey48.dc.html — 48-hour follow-up survey after the session. */
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { FatemaAvatar, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, CARD, SH_SOFT } from "@/lib/tokens";
import { TODAY_LABEL, toggleChip } from "@/lib/mock/b";

const QS: [string, string[]][] = [
  ["هل لاحظتِ احمراراً؟", ["لا يوجد", "خفيف", "واضح"]],
  ["هل تشعرين بحكة أو حرقة؟", ["لا", "أحياناً", "باستمرار"]],
  ["هل بشرتكِ جافة أو تتقشر؟", ["لا", "قليلاً", "كثيراً"]],
  ["ما مدى رضاكِ عن النتيجة؟", ["راضية جداً", "راضية", "غير راضية"]],
];

export default function Survey48Page() {
  const [a, setA] = useState([0, 1, 0, 0]);
  const [note, setNote] = useState("");
  return (
    <PhoneScreen>
      <TopBar title="كيف بشرتكِ اليوم؟" back={R.Journey} />

      <div style={{ borderRadius: 26, padding: "14px 16px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", alignItems: "center", gap: 12 }}>
        <FatemaAvatar size={48} />
        <div style={{ lineHeight: 1.35 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>متابعة بعد 48 ساعة</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>جلسة التنظيف العميق · {TODAY_LABEL}</div>
        </div>
      </div>

      <div style={{ ...CARD, borderRadius: 28, padding: "6px 16px 8px" }}>
        {QS.map(([title, opts], qi) => (
          <div key={title} role="radiogroup" aria-label={title} style={{ padding: "12px 0", borderTop: qi ? `1px solid ${C.line}` : undefined }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, marginBottom: 9 }}>{title}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {opts.map((label, oi) => {
                const on = a[qi] === oi;
                return (
                  <button key={label} type="button" role="radio" aria-checked={on} onClick={() => setA(a.map((v, i) => (i === qi ? oi : v)))}
                    style={toggleChip(on, { flex: 1, minWidth: 0, padding: "0 6px" })}>{label}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="sv-note" style={{ display: "block", fontSize: 13, color: C.sub2, marginBottom: 6 }}>ملاحظة للأخصائية (اختياري)</label>
        <textarea id="sv-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتبي أي شيء لاحظتِه على بشرتكِ…" style={{
          width: "100%", height: 64, resize: "none", borderRadius: 20, border: "1px solid #EADCF0", background: C.white,
          boxShadow: "inset 0 2px 6px rgba(123,70,135,0.05)", padding: "12px 16px", fontSize: 13.5, color: C.ink, outline: "none",
        }} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0 4px" }}>
        <Icon name="info" size={18} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>إذا ظهر أي أثر غير متوقع ستتواصل معكِ الأخصائية</div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <PrimaryButton icon="send" href={R.Journey}>إرسال</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
