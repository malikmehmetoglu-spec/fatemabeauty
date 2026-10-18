"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Chip, Circ } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA, PERSONA_TODAY, SERVICE, TODAY, aheadOf } from "@/lib/data";
import { addDays, arDate } from "@/lib/format";
import { C, DARK, SH } from "@/lib/tokens";

type Kind = "appt" | "offer" | "care";
type Note = { icon: string; title: string; time: string; body: string; kind: Kind; highlight?: boolean; actions?: boolean };

const ahead = aheadOf(PERSONA_TODAY).length;
const TODAY_NOTES: Note[] = [
  {
    icon: "refresh", title: "موعد أصبح متاحاً لكِ", time: "الآن", kind: "appt", highlight: true, actions: true,
    body: `كنتِ في قائمة الانتظار لجلسة ${SERVICE.hydra.name}. أصبح ${arDate(addDays(TODAY, 2))} الساعة 12:00 متاحاً.`,
  },
  { icon: "drop", title: "تعليمات ما بعد الجلسة", time: "منذ ساعة", kind: "care", body: "تجنبي المكياج اليوم، واستخدمي واقي الشمس صباح الغد." },
  {
    icon: "clock", title: "دوركِ اقترب", time: "منذ ساعتين", kind: "appt",
    body: `${ahead === 1 ? "أمامكِ مراجعة واحدة" : `أمامكِ ${ahead} مراجعات`}. توجّهي إلى ${PERSONA.room} خلال دقائق.`,
  },
];
const YESTERDAY: Note[] = [
  { icon: "cal", title: "تذكير بموعدكِ", time: "أمس", kind: "appt", body: `غداً ${arDate(TODAY)} الساعة ${PERSONA.todayTime}. أرسلنا التأكيد على واتساب أيضاً.` },
  { icon: "gift", title: "باقتكِ تقترب من نهايتها", time: "أمس", kind: "offer", body: `بقيت ${PERSONA.sessionsLeft} جلسات في باقة التنظيف العميق.` },
];
const FILTERS: [string, Kind | null][] = [["الكل", null], ["المواعيد", "appt"], ["العروض", "offer"]];

function NoteCard({ n, onDismiss }: { n: Note; onDismiss?: () => void }) {
  return (
    <div style={{
      borderRadius: 24, padding: "13px 14px", display: "flex", gap: 12, position: "relative",
      ...(n.highlight
        ? { background: "linear-gradient(145deg, #FFFFFF 0%, #F7EDF9 100%)", border: "1.5px solid #DEC6E8", boxShadow: "0 12px 28px rgba(150,100,170,0.18)" }
        : { background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: "0 12px 30px rgba(123,70,135,0.07), 0 2px 6px rgba(123,70,135,0.05)" }),
    }}>
      <Circ icon={n.icon} size={40} iconSize={19} />
      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.45 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{n.title}</div>
          <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{n.time}</div>
        </div>
        <div style={{ fontSize: 12.5, color: C.sub }}>{n.body}</div>
        {n.actions && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Link href={R.Booking} style={{ ...DARK, height: 38, padding: "0 18px", borderRadius: 19, boxShadow: "0 8px 16px rgba(123,70,135,0.28)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>احجزيه</Link>
            <button type="button" onClick={onDismiss} style={{ height: 38, padding: "0 16px", borderRadius: 19, border: "1px solid #E4D6E8", background: C.white, color: C.sub2, fontSize: 13, fontWeight: 600 }}>لا، شكراً</button>
          </div>
        )}
      </div>
      {n.highlight && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#9B4FB0", flexShrink: 0, marginTop: 6 }} />}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <div style={{ fontSize: 13, color: C.sub2, position: "relative" }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>{children}</div>
    </>
  );
}

/** Notifications.dc.html — patient notifications. */
export default function NotificationsPage() {
  const [filter, setFilter] = useState<Kind | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const show = (n: Note) => (!filter || n.kind === filter) && !(n.actions && dismissed);
  const today = TODAY_NOTES.filter(show);
  const yest = YESTERDAY.filter(show);
  return (
    <PhoneScreen>
      <TopBar title="الإشعارات" />
      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        {FILTERS.map(([t, k]) => (
          <Chip key={t} height={34} selected={filter === k} onClick={() => setFilter(k)} style={{ padding: "0 16px", fontWeight: filter === k ? 700 : 600, ...(filter === k ? { boxShadow: "0 6px 14px rgba(150,100,170,0.25)" } : { boxShadow: "none" }) }}>{t}</Chip>
        ))}
      </div>
      {today.length > 0 && <Group label="اليوم">{today.map((n) => <NoteCard key={n.title} n={n} onDismiss={() => setDismissed(true)} />)}</Group>}
      {yest.length > 0 && <Group label="أمس">{yest.map((n) => <NoteCard key={n.title} n={n} />)}</Group>}
      {today.length + yest.length === 0 && (
        <div style={{ background: C.white, borderRadius: 24, padding: 20, textAlign: "center", color: C.sub2, fontSize: 13, boxShadow: SH }}>لا توجد إشعارات هنا</div>
      )}
    </PhoneScreen>
  );
}
