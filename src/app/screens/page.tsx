import Link from "next/link";
import { R, type ScreenKey } from "@/lib/routes";
import { BG_WIDE, C, CARD } from "@/lib/tokens";
import { Logo } from "@/components/ui";

/** Index of every screen — for reviewing the app on the web (not linked from the patient app). */
const GROUPS: [string, (k: ScreenKey) => boolean][] = [
  ["الموقع والتطبيق (الهاتف)", (k) => !k.startsWith("T_") && !k.startsWith("TV_") && !k.startsWith("W_")],
  ["تابلت الاستقبال", (k) => k.startsWith("T_")],
  ["شاشة الانتظار", (k) => k.startsWith("TV_")],
  ["لوحة الإدارة", (k) => k.startsWith("W_")],
];

export default function ScreensIndex() {
  const keys = Object.keys(R) as ScreenKey[];
  return (
    <main dir="rtl" style={{ minHeight: "100dvh", background: BG_WIDE, padding: "32px 24px 60px", color: C.ink }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Logo height={64} />
          <h1 style={{ margin: 0, fontSize: 24 }}>كل الشاشات ({keys.length})</h1>
        </div>
        {GROUPS.map(([title, test]) => {
          const list = keys.filter(test);
          return (
            <section key={title} style={{ ...CARD, borderRadius: 26, padding: "18px 20px" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>{title} · {list.length}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {list.map((k) => (
                  <Link key={k} href={R[k]} style={{ padding: "8px 12px", borderRadius: 14, background: C.tint2, fontSize: 13, display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span className="latin" style={{ color: C.accent }}>{k}</span>
                    <span className="latin" dir="ltr" style={{ color: C.muted, fontSize: 11, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{R[k]}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
