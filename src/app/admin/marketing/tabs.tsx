"use client";

/** Sub-navigation shared by the marketing screens. */
import Link from "next/link";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";

const TABS: [string, string][] = [
  [R.W_Offers, "العروض وأكواد الخصم"],
  [R.W_Loyalty, "النقاط والعضويات"],
  [R.W_Campaigns, "الحملات والرسائل"],
  [R.W_Reviews, "التقييمات"],
];

export function MarketingTabs({ active }: { active: string }) {
  return (
    <nav aria-label="أقسام التسويق" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {TABS.map(([href, label]) => {
        const on = href === active;
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} style={{
            height: 38, padding: "0 16px", borderRadius: 19, display: "inline-flex", alignItems: "center", fontSize: 13.5, fontWeight: on ? 700 : 600,
            background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : C.white, color: on ? C.accent : C.sub2,
            border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.25)" : "0 3px 10px rgba(123,70,135,0.05)",
          }}>{label}</Link>
        );
      })}
    </nav>
  );
}
