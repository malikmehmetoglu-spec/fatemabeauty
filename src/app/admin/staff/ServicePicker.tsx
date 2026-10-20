"use client";

/** «الخدمات التي تقدّمها» — services grouped by category as chips, with whole-category and «كل الخدمات» toggles. */
import { Icon } from "@/components/ui";
import type { Category, Service } from "@/lib/db/catalog";
import { C, SELECTED } from "@/lib/tokens";

const chip = (on: boolean) => ({
  minHeight: 36, padding: "6px 14px", borderRadius: 18, fontSize: 13, fontWeight: on ? 700 : 600, lineHeight: 1.4,
  display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%", textAlign: "right" as const,
  ...(on ? SELECTED : { background: C.white, border: "1px solid #EADCF0", color: C.sub2, boxShadow: "0 3px 10px rgba(123,70,135,0.05)" }),
});
const link = { border: "none", background: "none", padding: "4px 2px", color: C.accent, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" as const };

export function ServicePicker({ services, categories, value, onChange, consultant }: {
  services: Service[]; categories: Category[]; value: string[]; onChange: (keys: string[]) => void; consultant: boolean;
}) {
  const set = new Set(value);
  const groups = [
    ...categories.map((c) => ({ key: c.key, name: c.name, list: services.filter((s) => s.category_id === c.key) })),
    { key: "", name: "بلا فئة", list: services.filter((s) => !s.category_id || !categories.some((c) => c.key === s.category_id)) },
  ].filter((g) => g.list.length);
  const all = services.length > 0 && services.every((s) => set.has(s.key));
  const toggle = (k: string) => onChange(set.has(k) ? value.filter((x) => x !== k) : [...value, k]);
  const toggleGroup = (keys: string[], on: boolean) => onChange(on ? [...new Set([...value, ...keys])] : value.filter((x) => !keys.includes(x)));

  return (
    <section aria-label="الخدمات التي تقدّمها" style={{ borderRadius: 22, border: "1px solid #F0E4F3", background: "#FBF6FC", padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.45 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>الخدمات التي تقدّمها</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>
            {value.length ? `${value.length} من ${services.length} خدمة — تظهر في الحجز لهذه الخدمات فقط.` : `إن لم تحدّدي أي خدمة، تقدّم كل خدمات قسمها (${consultant ? "الاستشارات" : "جلسات العناية"}).`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="button" style={link} aria-pressed={all} onClick={() => onChange(all ? [] : services.map((s) => s.key))}>{all ? "إلغاء كل الخدمات" : "كل الخدمات"}</button>
          {value.length > 0 && !all && <button type="button" style={{ ...link, color: C.sub2 }} onClick={() => onChange([])}>مسح التحديد</button>}
        </div>
      </div>
      {groups.map((g) => {
        const keys = g.list.map((s) => s.key);
        const n = keys.filter((k) => set.has(k)).length;
        const full = n === keys.length;
        return (
          <div key={g.key || "none"} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{g.name} <span style={{ fontSize: 12, fontWeight: 500, color: C.sub2 }}>{n ? `${n}/${keys.length}` : keys.length}</span></div>
              <button type="button" style={link} aria-pressed={full} onClick={() => toggleGroup(keys, !full)}>{full ? "إلغاء القسم" : "تحديد القسم كاملاً"}</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {g.list.map((s) => {
                const on = set.has(s.key);
                return (
                  <button key={s.key} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(s.key)} style={{ ...chip(on), opacity: s.active ? 1 : 0.6 }}>
                    {on && <Icon name="check" size={14} color={C.accent} stroke={2.4} />}
                    <span>{s.short_name || s.name}</span>
                    {s.is_consultation && <span style={{ fontSize: 11, color: C.sub2 }}>· استشارة</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
