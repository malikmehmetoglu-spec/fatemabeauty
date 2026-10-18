"use client";

/** P_OrderTrack.dc.html — order tracking timeline. */
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkCard, DoneDot, Icon, SecondaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { TODAY } from "@/lib/data";
import { arDate, money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";
import { ORDER, PRODUCT } from "@/lib/mock/c1";
import { ArtThumb } from "../../store/c1ui";

export default function OrderTrackPage() {
  const total = ORDER.items.reduce((s, it) => s + (PRODUCT[it.key].price ?? 0) * it.qty, 0);
  return (
    <PhoneScreen>
      <TopBar title="تتبع الطلب" back={R.P_Store} />

      <DarkCard radius={30} padding="18px 20px">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 12.5, color: C.onDark }}>رقم الطلب</div>
            <div className="latin" style={{ fontSize: 34, fontWeight: 700, direction: "ltr", textAlign: "right" }}>#{ORDER.no}</div>
          </div>
          <span style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="box" color="#E8D6F0" size={26} stroke={1.7} />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ height: 28, padding: "0 12px", borderRadius: 14, background: C.white, color: C.accent, fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: "#9B4FB0" }} />{ORDER.steps[ORDER.current].title}
          </span>
          <span style={{ fontSize: 12.5, color: C.onDark }}>{arDate(TODAY)} · توصيل للمنزل</span>
        </div>
      </DarkCard>

      <ol style={{ ...CARD, listStyle: "none", margin: 0, borderRadius: 24, padding: "18px 18px 12px", flexShrink: 0 }}>
        {ORDER.steps.map((s, i) => {
          const done = i < ORDER.current, cur = i === ORDER.current, last = i === ORDER.steps.length - 1;
          return (
            <li key={s.title} aria-current={cur ? "step" : undefined} style={{ position: "relative", display: "flex", gap: 12, alignItems: "flex-start", height: last ? 40 : 58 }}>
              {done ? <DoneDot size={30} /> : cur ? (
                <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: C.white, border: `2px solid ${C.accentMid}`, boxShadow: "0 0 0 6px rgba(200,160,220,0.30)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: C.accentMid }} />
                </span>
              ) : (
                <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: C.white, border: "1.5px solid #E4D6E7", boxSizing: "border-box" }} />
              )}
              {!last && <span aria-hidden style={{ position: "absolute", top: 34, right: 14, width: 2, height: 26, borderRadius: 1, background: done ? "linear-gradient(180deg,#C9A2D8,#7B4687)" : "#E4D6E7" }} />}
              <div style={{ lineHeight: 1.35, paddingTop: 3 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: i > ORDER.current ? C.muted : C.ink }}>
                  {s.title}{cur && <span style={{ fontSize: 11, fontWeight: 600, color: C.accentMid }}> · الآن</span>}
                </div>
                <div style={{ fontSize: 12, color: i > ORDER.current ? C.muted : C.sub2 }}>{s.sub}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 2 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>المنتجات</h2>
          <div style={{ fontSize: 13, color: C.sub2 }}><span className="latin" style={{ fontWeight: 700, color: C.accent }}>{money(total, false)}</span> ل.س + التوصيل</div>
        </div>
        {ORDER.items.map((it, i) => (
          <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <ArtThumb p={PRODUCT[it.key]} box={40} art={29} radius={14} />
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{PRODUCT[it.key].name}</div>
            <span className="latin" style={{ fontSize: 12, color: C.sub2 }}>×{it.qty}</span>
          </div>
        ))}
      </div>

      <SecondaryButton href={R.P_Chat} icon="msg" style={{ marginTop: "auto", flexShrink: 0 }}>تواصلي مع المركز</SecondaryButton>
    </PhoneScreen>
  );
}
