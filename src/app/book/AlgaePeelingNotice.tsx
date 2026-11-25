"use client";

import type { CSSProperties } from "react";

const ITEMS = [
  "📆 موعد الجلسة يجب أن يكون قبل المناسبة بـ 15 يوماً على الأقل.",
  "❌ لا تُطبّق للمرأة الحامل.",
  "💧 ممنوع غسل المنطقة بالماء ليومين، وممنوع البخار والساونا والماء الساخن.",
  "🌞 شراء واقٍ شمسي مخصص من المركز واستخدامه كل 3 ساعات، والابتعاد عن الشمس يومين.",
  "⚗️ الممنوعات: عطور، كحول، مزيلات العرق القوية، الحلاقة، وإزالة الشعر.",
  "🚫 ممنوع الفرك، الليفة الخشنة، السكراب، وكريمات التفتيح أو المقشرات بقرار شخصي.",
  "🏃🏻‍♀️ تجنب التعرق الشديد والاحتكاك.",
];

export const isAlgaePeeling = (s?: { key?: string | null; name?: string | null; short_name?: string | null } | null) =>
  !!s && (s.key?.toLowerCase().includes("algae") || s.name?.includes("طحالب") || s.short_name?.includes("طحالب"));

export function AlgaePeelingNotice({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ borderRadius: 18, padding: "14px 16px", background: "#FFF8EB", border: "1px solid #F3DFB6", color: "#6E470B", fontSize: 13, lineHeight: 1.65, ...style }}>
      <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 6, color: "#5A3806" }}>تعليمات مهمة لجلسة تقشير الطحالب:</div>
      <ul style={{ margin: 0, paddingInlineStart: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        {ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
