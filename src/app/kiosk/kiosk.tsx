"use client";

import type { ReactNode } from "react";
import { Stage } from "@/components/shell";
import { Loading } from "@/components/ui";
import { useRequireStaff } from "@/lib/supabase/session";
import { useNow } from "@/lib/db/queue";
import { arDate, clock } from "@/lib/format";
import { BG } from "@/lib/tokens";

/** Reception tablet guard: staff session required; shows a loader on the tablet canvas meanwhile. */
export function useKiosk() {
  const s = useRequireStaff();
  const gate = s.loading || !s.staff
    ? <Stage width={1194} height={834} background={BG} padding="36px 40px"><Loading style={{ margin: "auto" }} /></Stage>
    : null;
  return { ...s, gate };
}

/** "الأحد 18 تشرين الأول" + "13:05" — real Damascus date & time, refreshed live. */
export function NowText({ part }: { part: "date" | "time" }): ReactNode {
  const now = useNow();
  if (!now) return "";
  if (part === "time") return clock(now);
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Damascus", year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return arDate(new Date(y, m - 1, d));
}
