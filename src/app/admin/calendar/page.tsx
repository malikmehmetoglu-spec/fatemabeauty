"use client";

import Link from "next/link";
import { AdminShell } from "@/components/shell";
import { Icon } from "@/components/ui";
import { R } from "@/lib/routes";
import { CAL_SUBTITLE, CalendarBody } from "./CalendarBoard";
import { C } from "@/lib/tokens";

/** W_Calendar.dc.html — day calendar by room/specialist. */
export default function CalendarPage() {
  return (
    <AdminShell active="المواعيد" title="المواعيد" subtitle={CAL_SUBTITLE} actions={<Link href={R.W_BookingModal} style={{ height: 46, borderRadius: 23, border: "none", backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 18px", whiteSpace: "nowrap" }}><Icon name="M12 5v14M5 12h14" size={19} color={C.white} stroke={1.9} />موعد جديد</Link>}>
      <CalendarBody />
    </AdminShell>
  );
}
