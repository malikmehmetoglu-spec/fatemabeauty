"use client";

/** Routine.dc.html — «وصفتي وروتيني»: today's prescription card + morning/evening checklist. */
import { useEffect, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, EmptyState, Icon, IconButton, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, dayKey } from "@/lib/format";
import { C, SH } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { useMe } from "@/lib/db/patients";
import { listPrescriptions, rxItems, WHEN_LABEL } from "@/lib/db/clinical";
import { Wait } from "../account/Wait";

const iconFor = (n: string) => (/شمس|SPF/i.test(n) ? "sun" : /سيروم|مرطب|ترطيب/.test(n) ? "drop" : "bottle");

export default function RoutinePage() {
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: rx, loading: lr } = useQuery(["clinical", "rx", id], () => listPrescriptions(id), { enabled: !!id });
  const latest = rx?.[0];
  const RX = rxItems(latest).map((x) => ({ ...x, icon: iconFor(x.name) }));
  const BLOCKS: [string, string, string[]][] = [
    ["m", "الصباح", RX.filter((x) => x.when !== "pm").map((x) => x.name)],
    ["e", "المساء", RX.filter((x) => x.when !== "am").map((x) => x.name)],
  ];
  const storeKey = `fb.routine.${dayKey()}`;
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(storeKey) || "{}")); } catch { /* ignore */ } }, [storeKey]);
  const toggle = (k: string) => { const next = { ...done, [k]: !done[k] }; setDone(next); try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignore */ } };
  const total = BLOCKS.reduce((s, b) => s + b[2].length, 0);
  const count = BLOCKS.reduce((s, [k, , n]) => s + n.filter((_, i) => done[k + i]).length, 0);
  return (
    <PhoneScreen>
      <TopBar title="وصفتي وروتيني" back={R.Journey} />
      {!me ? <Wait loading={loading} error={error} /> : lr ? <Wait loading /> : !latest || !RX.length ? (
        <EmptyState icon="bottle" title="لا وصفة بعد" text="بعد جلستكِ تكتب لكِ الأخصائية وصفة عناية منزلية، ويظهر هنا روتينكِ اليومي صباحاً ومساءً." />
      ) : (<>

      <div style={{ background: C.white, borderRadius: 28, padding: 16, position: "relative", boxShadow: SH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px dashed #E8DAEC" }}>
          <Circ icon="file" size={48} iconSize={22} />
          <div style={{ flexGrow: 1, lineHeight: 1.35 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>وصفة العناية</div>
            <div style={{ fontSize: 12, color: C.sub2 }}>{latest.staff?.name ? `${latest.staff.name} · ` : ""}{arDate(new Date(latest.created_at))}</div>
          </div>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: "#F8F2FA", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="qr" color={C.accent} size={26} stroke={1.6} />
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
          {RX.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Circ icon={r.icon} size={34} iconSize={16} />
              <div style={{ lineHeight: 1.45 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{WHEN_LABEL[r.when]}{r.how ? `، ${r.how}` : ""}</div>
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
          {BLOCKS.filter((b) => b[2].length).map(([k, title, names]) => (
            <div key={k} style={{ background: C.white, border: `1px solid ${C.borderSoft}`, borderRadius: 24, padding: 12, boxShadow: SH }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8 }}>{title}</div>
              {names.map((name, i) => {
                const id = k + i, on = !!done[id];
                return (
                  <button key={id} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(id)}
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
        <PrimaryButton icon="file" height={56} style={{ flexGrow: 1, fontSize: 16 }} href={R.P_Prescriptions}>كل وصفاتي</PrimaryButton>
        <IconButton icon="msg" label="مراسلة الأخصائية" size={56} href={R.P_Chat} />
      </div>
      </>)}
    </PhoneScreen>
  );
}
