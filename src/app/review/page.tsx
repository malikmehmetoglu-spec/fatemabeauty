"use client";

/** Review.dc.html — rate today's session (stars, liked tags, note). */
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { FatemaAvatar, Icon, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA_TODAY } from "@/lib/data";
import { C, SH } from "@/lib/tokens";
import { TODAY_LABEL, toggleChip } from "@/lib/mock/b";

const WORDS = ["", "لم تعجبني", "مقبولة", "جيدة", "جيدة جداً", "ممتازة"];
const TAGS = ["لطف التعامل", "الالتزام بالموعد", "نتيجة واضحة", "نظافة المكان", "شرح مفيد", "هدوء الصالة"];
const STAR = "M12 17.75l-6.17 3.24 1.18-6.87-5-4.87 6.9-1 3.08-6.25 3.08 6.25 6.9 1-5 4.87 1.18 6.87z";

export default function ReviewPage() {
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<Record<number, boolean>>({ 0: true, 2: true });
  const [note, setNote] = useState("");
  return (
    <PhoneScreen>
      <TopBar title="قيّمي تجربتكِ" back={R.P_Appointments} />

      <div style={{ background: C.white, borderRadius: 30, padding: "22px 18px 18px", position: "relative", textAlign: "center", boxShadow: SH }}>
        <FatemaAvatar size={84} style={{ border: "3px solid #FFFFFF", boxShadow: "0 8px 20px rgba(123,70,135,0.20)" }} />
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>كيف كانت جلستكِ مع فاطمة؟</div>
        <div style={{ fontSize: 13, color: C.sub2 }}>{PERSONA_TODAY.serviceName} · {TODAY_LABEL}</div>
        <div role="radiogroup" aria-label="التقييم" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= rating;
            return (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} نجوم`} onClick={() => setRating(n)} style={{ border: "none", background: "transparent", padding: 2 }}>
                <svg width={34} height={34} viewBox="0 0 24 24" aria-hidden><path d={STAR} fill={on ? "#E9A23B" : "#FFFFFF"} stroke={on ? "#D98F26" : "#DFCFE2"} strokeWidth={1.4} strokeLinejoin="round" /></svg>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.accentMid, marginTop: 4 }}>{WORDS[rating]}</div>
      </div>

      <div style={{ position: "relative" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>ما الذي أعجبكِ؟</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TAGS.map((t, i) => (
            <button key={t} type="button" aria-pressed={!!tags[i]} onClick={() => setTags({ ...tags, [i]: !tags[i] })}
              style={toggleChip(!!tags[i], tags[i] ? { boxShadow: "0 6px 14px rgba(150,100,170,0.25)" } : {})}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <label htmlFor="note" style={{ display: "block", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>أضيفي ملاحظة</label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="شاركينا تجربتكِ بكلمات قليلة" style={{
          width: "100%", height: 92, borderRadius: 22, border: `1px solid ${C.border}`, background: C.white, padding: "12px 14px",
          fontSize: 14, color: C.ink, resize: "none", boxShadow: "0 12px 30px rgba(123,70,135,0.06), 0 2px 6px rgba(123,70,135,0.05)",
        }} />
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", borderRadius: 20, padding: "10px 14px" }}>
          <Icon name="map" size={20} />
          <div style={{ fontSize: 12.5, color: C.accent, lineHeight: 1.5 }}>بعد الإرسال يمكنكِ مشاركة تقييمكِ على خرائط Google بلمسة واحدة</div>
        </div>
        <PrimaryButton href={R.P_Appointments}>إرسال التقييم</PrimaryButton>
      </div>
    </PhoneScreen>
  );
}
