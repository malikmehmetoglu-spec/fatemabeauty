"use client";

/** W_Calendar.dc.html — day/week calendar by room or specialist (live, Supabase). «موعد جديد» and «حجز VIP» live in the calendar toolbar. */
import { AdminShell } from "@/components/shell";
import { CalendarBody } from "./CalendarBoard";

export default function CalendarPage() {
  return (
    <AdminShell active="المواعيد" title="المواعيد" subtitle="التقويم حسب الغرفة أو الأخصائية · الخط الوردي = الآن">
      <CalendarBody />
    </AdminShell>
  );
}
