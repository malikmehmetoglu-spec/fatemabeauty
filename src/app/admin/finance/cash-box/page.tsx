"use client";

/**
 * الصندوق اليومي — retired: the owner cancelled cash shifts. Invoices, payments and expenses no longer need an open
 * shift; cash totals per payment method live in «الفواتير» and «التقارير المالية». Old links land on the reports.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { Loading } from "@/components/ui";
import { R } from "@/lib/routes";

export default function Page() {
  const router = useRouter();
  useEffect(() => { router.replace(R.W_FinanceReports); }, [router]);
  return <AdminShell active="المالية" title="التقارير المالية"><Loading /></AdminShell>;
}
