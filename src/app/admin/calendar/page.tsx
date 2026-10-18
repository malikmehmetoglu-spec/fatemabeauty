"use client";

/** W_Calendar.dc.html — day/week calendar by room or specialist (live, Supabase). */
import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { C } from "@/lib/tokens";
import { CalendarBody, NEW_BTN } from "./CalendarBoard";

export default function CalendarPage() {
  return (
    <AdminShell active="المواعيد" title="المواعيد" subtitle="التقويم حسب الغرفة أو الأخصائية · الخط الوردي = الآن"
      actions={<Link href={R.W_BookingModal} style={NEW_BTN}><Icon name="M12 5v14M5 12h14" size={19} color={C.white} stroke={1.9} />موعد جديد</Link>}>
      <CalendarBody />
    </AdminShell>
  );
}
