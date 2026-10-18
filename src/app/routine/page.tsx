"use client";

/** Routine.dc.html — «وصفتي وروتيني»: today's prescription card + morning/evening checklist. */
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, FatemaAvatar, Icon, IconButton, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { PERSONA } from "@/lib/data";
import { C, SH } from "@/lib/tokens";
import { TODAY_LABEL } from "@/lib/mock/b";

const RX = [
  { icon: "bottle", name: "غسول لطيف للبشرة الحساسة", how: "صباحاً ومساءً، بماء فاتر" },
  { icon: "drop", name: "سيروم مرطب بحمض الهيالورونيك", how: "قطرتان على بشرة رطبة، مرتين يومياً" },
  { icon: "sun", name: "واقي شمس SPF 50", how: "كل صباح، ويُجدَّد كل ساعتين في الخارج" },
];
const BLOCKS: [string, string, string[]][] = [["m", "الصباح", ["الغسول", "السيروم", "واقي الشمس"]], ["e", "المساء", ["الغسول", "السيروم", "مرطب ليلي"]]];

export default function RoutinePage() {
  const [done, setDone] = useState<Record<string, boolean>>({ m0: true, m1: true });
  const total = BLOCKS.reduce((s, b) => s + b[2].length, 0);
  const count = Object.values(done).filter(Boolean).length;
  return (
    <PhoneScreen>
      <TopBar title="وصفتي وروتيني" back={R.Journey} />

      <div style={{ background: C.white, borderRadius: 28, padding: 16, position: "relative", boxShadow: SH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px dashed #E8DAEC" }}>
          <FatemaAvatar size={48} />
          <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>وصفة العناية</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{PERSONA.specialist} · {TODAY_LABEL}</div>
          </div>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: "#F8F2FA", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="qr" color={C.accent} size={26} stroke={1.6} />
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
          {RX.map((r) => (
            <div key={r.name} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Circ icon={r.icon} size={34} iconSize={16} />
              <div style={{ lineHeight: 1.45 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{r.how}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>روتين اليوم</h2>
          <div style={{ fontSize: 12, color: C.sub2 }}>أنجزتِ {count} من {total}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {BLOCKS.map(([k, title, names]) => (
            <div key={k} style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 24, padding: 12, boxShadow: SH }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{title}</div>
              {names.map((name, i) => {
                const id = k + i, on = !!done[id];
                return (
                  <button key={id} type="button" role="checkbox" aria-checked={on} onClick={() => setDone({ ...done, [id]: !on })}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", padding: "6px 0", textAlign: "right" }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      ...(on ? { background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 4px 10px rgba(123,70,135,0.30)" } : { background: "#FFFFFF", border: "1.5px solid #DFCFE2" }),
                    }}>
                      <Icon name="check" color="#FFFFFF" size={12} stroke={2.6} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: on ? C.muted : C.ink, textDecoration: on ? "line-through" : "none" }}>{name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", position: "relative", display: "flex", gap: 10 }}>
        <PrimaryButton icon="download" height={56} style={{ flexGrow: 1, fontSize: 16 }} href={R.P_Prescriptions}>حفظ الوصفة PDF</PrimaryButton>
        <IconButton icon="msg" label="مراسلة الأخصائية" size={56} href={R.P_Chat} />
      </div>
    </PhoneScreen>
  );
}
