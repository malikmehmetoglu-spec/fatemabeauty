"use client";

/** W_Audit.dc.html — audit log (who did what, when). Rows are written by database triggers. */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, Loading, Tag } from "@/components/ui";
import { arDate, clock } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listAudit, staffByUser } from "@/lib/db/marketing";
import { C } from "@/lib/tokens";

const TABLE: Record<string, string> = { appointments: "موعد", invoices: "فاتورة", products: "صنف مخزون", staff: "موظفة", patients: "ملف مراجعة" };
const ACTION: Record<string, [string, "green" | "lilac" | "pink"]> = { insert: ["إضافة", "green"], update: ["تعديل", "lilac"], delete: ["حذف", "pink"] };
type F = "all" | keyof typeof TABLE;

export default function AuditPage() {
  const { data, loading, error } = useQuery(["audit", "list"], () => listAudit(500));
  const { data: names } = useQuery(["audit", "names"], staffByUser);
  const [f, setF] = useState<F>("all");
  const list = (data ?? []).filter((r) => f === "all" || (r.target ?? "").startsWith(`${f}:`));

  return (
    <AdminShell active="الإعدادات" title="سجل التدقيق" subtitle="من فعل ماذا ومتى — للإدارة فقط">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Chip selected={f === "all"} onClick={() => setF("all")}>الكل</Chip>
        {Object.entries(TABLE).map(([k, t]) => <Chip key={k} selected={f === k} onClick={() => setF(k)}>{t}</Chip>)}
      </div>
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل السجل: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="clip" title="لا توجد عمليات مسجّلة بعد" text="كل إضافة أو تعديل أو حذف على المواعيد والفواتير والمخزون والفريق وملفات المراجعات تُسجّل هنا تلقائياً مع اسم من قام بها." />
      ) : (
        <DataTable headers={["الوقت", "من", "العملية", "على", "الحقول المعدّلة"]} widths={[1.3, 1.3, 0.8, 1.6, 2.4]}
          rows={list.map((r) => {
            const [tbl, id] = (r.target ?? ":").split(":");
            const a = ACTION[r.action] ?? [r.action, "lilac"];
            const changed = (r.details as { changed?: string[] } | null)?.changed;
            return [
              <span key="t" style={{ fontSize: 13 }}>{arDate(new Date(r.created_at), { day: false })} · <span className="latin">{clock(r.created_at)}</span></span>,
              <span key="w" style={{ fontWeight: 600 }}>{r.actor ? names?.get(r.actor) ?? "مراجعة / حساب آخر" : "النظام"}</span>,
              <Tag key="a" kind={a[1]}>{a[0]}</Tag>,
              <span key="o" style={{ fontSize: 13 }}>{TABLE[tbl] ?? tbl} <span className="latin" style={{ color: C.muted, fontSize: 11.5 }}>{id.slice(0, 8)}</span></span>,
              <span key="c" className="latin" style={{ fontSize: 12, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{changed?.join(", ") ?? "—"}</span>,
            ];
          })} />
      )}
    </AdminShell>
  );
}
