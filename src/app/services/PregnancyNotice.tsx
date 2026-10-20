"use client";

import type { CSSProperties } from "react";
import { Icon } from "@/components/ui";

/** Clear notice for service categories that are not for pregnant clients (service_categories.not_for_pregnant). */
export function PregnancyNotice({ style, warn }: { style?: CSSProperties; warn?: boolean }) {
  return (
    <div role={warn ? "alert" : "note"} style={{ display: "flex", gap: 10, alignItems: "flex-start", borderRadius: 20, padding: "11px 14px", background: warn ? "#FCEBEA" : "#FDF4E4", border: `1px solid ${warn ? "#F1C9C6" : "#F2DDB4"}`, color: warn ? "#8A2E28" : "#7A4E12", fontSize: 13, lineHeight: 1.6, ...style }}>
      <Icon name="alert" color={warn ? "#C0453C" : "#B07A22"} size={18} />
      {warn
        ? <span><b>ملفكِ يذكر أنكِ حامل.</b> هذه الجلسة لا تُطبَّق للحامل؛ اختاري جلسة أخرى أو تواصلي معنا قبل الحجز.</span>
        : <span><b>لا تُطبَّق هذه الجلسة للحامل.</b> إن كنتِ حاملاً أو تشكّين بالحمل، أخبرينا لنقترح عليكِ جلسة مناسبة.</span>}
    </div>
  );
}
