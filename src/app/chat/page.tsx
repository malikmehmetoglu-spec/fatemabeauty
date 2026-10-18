"use client";

import { useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Chip, FatemaAvatar, Icon, IconButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { NOW, TODAY } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, DARK, GLASS, ICON_FILL } from "@/lib/tokens";

type Msg = { me: boolean; time: string; text: string; photo?: boolean };

const BASE: Msg[] = [
  { me: false, time: "11:50", text: "أهلاً بكِ، كيف تشعرين بعد جلسة اليوم؟" },
  { me: true, time: "12:02", text: "الحمد لله، لكن عندي احمرار خفيف حول الأنف، هل هذا طبيعي؟" },
  { me: true, time: "12:03", photo: true, text: "" },
  { me: false, time: "12:10", text: "نعم طبيعي تماماً بعد التنظيف العميق، ويخفّ عادةً خلال ساعات." },
  { me: false, time: "12:11", text: "تجنبي المكياج 24 ساعة، وضعي واقي الشمس صباح الغد." },
  { me: true, time: "12:14", text: "تمام، شكراً كثيراً" },
];
const QUICK = ["متى أستطيع وضع المكياج؟", "هل أستعمل السيروم الليلة؟"];

const bubble = (m: Msg): CSSProperties => ({
  maxWidth: 260, padding: m.photo ? "6px 6px 7px" : "10px 14px 7px", fontSize: 13.5, lineHeight: 1.55,
  ...(m.me
    ? { color: C.white, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg,#784883 0%,#7B4687 60%,#4A2952 100%)", boxShadow: "0 10px 22px rgba(123,70,135,0.25)", borderRadius: "22px 22px 22px 8px" }
    : { color: C.ink, background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: "0 8px 20px rgba(123,70,135,0.08)", borderRadius: "22px 22px 8px 22px" }),
});

/** P_Chat.dc.html — chat with فاطمة طيبة. */
export default function ChatPage() {
  const [extra, setExtra] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const msgs = BASE.concat(extra);
  const send = (text: string) => {
    if (!text.trim()) return;
    setExtra((e) => e.concat([{ me: true, time: NOW, text: text.trim() }]));
  };
  const quick = QUICK.filter((t) => !extra.some((e) => e.text === t));

  return (
    <PhoneScreen style={{ height: "100dvh" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton icon="back" label="رجوع" href={R.Main} />
        <div style={{ ...GLASS, flexGrow: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, height: 56, borderRadius: 28, padding: "0 6px 0 14px", boxShadow: "0 8px 20px rgba(123,70,135,0.08)" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <FatemaAvatar size={44} />
            <span style={{ position: "absolute", bottom: 1, left: 1, width: 11, height: 11, borderRadius: 6, background: C.ok, border: "2px solid #FFFFFF" }} />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>فاطمة طيبة</h1>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>فاطمة بيوتي · متصلة الآن</div>
          </div>
        </div>
        <IconButton icon="cam" label="استشارة فيديو" href={R.P_ConsultBook} />
      </header>

      <div role="log" aria-label="المحادثة" style={{ flexGrow: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, margin: "0 -20px", padding: "0 20px 10px" }}>
        <div style={{ marginTop: "auto", alignSelf: "center", height: 26, padding: "0 12px", borderRadius: 13, background: "rgba(255,255,255,0.7)", fontSize: 11.5, color: C.sub2, display: "flex", alignItems: "center", marginBottom: 4, flexShrink: 0 }}>
          اليوم · {arDate(TODAY)}
        </div>
        {msgs.map((m, i) => {
          const next = msgs[i + 1];
          const lastOfGroup = !next || next.me !== m.me;
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 8, justifyContent: m.me ? "flex-end" : undefined, flexShrink: 0 }}>
              {!m.me && (lastOfGroup ? <FatemaAvatar size={30} /> : <span style={{ width: 30, flexShrink: 0 }} />)}
              <div style={bubble(m)}>
                {m.photo && (
                  <div style={{ width: 150, height: 100, borderRadius: 16, position: "relative", overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ position: "absolute", inset: -16, background: "radial-gradient(ellipse at 55% 45%, #F3D6C3 0%, #E3B79E 55%, #D29E86 100%)", filter: "blur(7px)" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="image" color="rgba(255,255,255,0.9)" size={30} stroke={1.6} />
                    </div>
                  </div>
                )}
                {m.text && <div>{m.text}</div>}
                <div style={{ fontSize: 10.5, marginTop: 2, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", color: m.me ? C.onDark : C.muted, padding: m.photo ? "0 6px" : undefined }}>
                  {m.time}
                  {m.me && <Icon name="M2 12l5 5L17 7M12 15l2 2 8-10" color="#E8D6F0" size={14} stroke={2} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {quick.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {quick.map((t) => (
            <Chip key={t} height={34} onClick={() => send(t)} style={{ fontSize: 12.5 }}>{t}</Chip>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(draft); setDraft(""); }} style={{
        display: "flex", alignItems: "center", gap: 8, height: 60, borderRadius: 30, padding: "0 7px", background: "rgba(255,255,255,0.85)",
        border: "1px solid #FFFFFF", boxShadow: "0 12px 28px rgba(123,70,135,0.12)", flexShrink: 0,
      }}>
        <button type="button" aria-label="إرفاق ملف" style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3L18 10a3 3 0 0 0-6-6l-6.5 6.5a4.5 4.5 0 0 0 9 9L21 13" color={C.accentMid} size={20} />
        </button>
        <input aria-label="رسالتكِ" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="اكتبي رسالتكِ…" style={{
          flexGrow: 1, minWidth: 0, height: 44, border: "none", background: "transparent", fontSize: 14, color: C.ink, outline: "none",
        }} />
        <button type="button" aria-label="التقاط صورة" style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="camera" color={C.sub2} size={21} />
        </button>
        <button type="submit" aria-label="إرسال" style={{ ...DARK, width: 46, height: 46, borderRadius: 23, border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="send" color="#FFFFFF" size={19} stroke={1.9} />
        </button>
      </form>
    </PhoneScreen>
  );
}
