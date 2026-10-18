"use client";

import Link from "next/link";
import t from "../../adminPages.module.css";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { consentForms, listConsents, pendingConsentsToday, type ConsentAnswers } from "@/lib/db/clinical";
import { C, ICON_FILL } from "@/lib/tokens";
import { chip, displayName, fileHref, Initials, Panel } from "../kit";

const FILTERS = ["الكل", "اليوم", "بانتظار التوقيع"];
const METHOD: Record<string, string> = { app: "التطبيق", tablet: "التابلت", kiosk: "التابلت" };

/** W_Consents.dc.html */
export default function ConsentsPage() {
  const { data, loading, error } = useQuery(["clinical", "consents", "all"], () => listConsents());
  const { data: pending } = useQuery(["clinical", "consents", "pending", dayKey()], pendingConsentsToday);
  const { data: services } = useQuery(["clinical", "consent-forms"], consentForms);
  const [f, setF] = useState(0);
  const today = dayKey();
  const all = data ?? [];
  const todays = all.filter((c) => dayKey(new Date(c.signed_at)) === today);
  const rows = f === 1 ? todays : all;
  const kpi = (icon: string, label: string, value: number, sub: string) => (
    <Panel style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={20} /></span>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>{label}</div>
          <div className="latin" style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>{sub}</div>
        </div>
      </div>
    </Panel>
  );

  return (
    <AdminShell active="المراجعات" title="الموافقات" subtitle="نماذج الموافقة لكل إجراء وسجلّ التواقيع">
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {kpi("sign", "وُقّعت اليوم", todays.length, "على التابلت أو التطبيق")}
          {kpi("clock", "بانتظار التوقيع", pending?.length ?? 0, "من مواعيد اليوم")}
          {kpi("file", "كل الموافقات", all.length, "في سجلّ المركز")}
        </div>
        <div className={t.split}>
          <Panel className={t.grow} title="سجلّ التواقيع" right={
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{FILTERS.map((t, i) => <button key={t} type="button" onClick={() => setF(i)} style={chip(f === i, 34)}>{t}</button>)}</div>}>
            {error ? <ErrorNote>{error}</ErrorNote> : loading ? <Loading /> : f === 2 ? (
              !pending?.length ? <EmptyState compact icon="calcheck" title="لا موافقات معلّقة اليوم" text="تظهر هنا مواعيد اليوم التي لم توقّع صاحبتها موافقة الخدمة بعد." /> : pending.map((a) => (
                <Row key={a.id} pid={a.patient_id} name={a.patients?.name} form={a.services?.name ?? a.service_key} date={`اليوم ${clock(a.starts_at)}`} method="—" tag={<Tag kind="amber">بانتظار التوقيع</Tag>} />
              ))
            ) : !rows.length ? (
              <EmptyState compact icon="sign" title={f === 1 ? "لم تُوقّع موافقات اليوم" : "لا موافقات موقّعة بعد"} text="عندما توقّع المراجعة نموذج الموافقة من تطبيقها أو على تابلت الاستقبال يظهر هنا مع التاريخ والطريقة." />
            ) : rows.map((c) => {
              const a = (c.answers ?? {}) as ConsentAnswers;
              const d = new Date(c.signed_at);
              return <Row key={c.id} pid={c.patient_id} name={c.patients?.name} fileNo={c.patients?.file_no} form={a.title ?? c.services?.name ?? "موافقة عامة"}
                date={dayKey(d) === today ? `اليوم ${clock(d)}` : arDate(d, { day: false, year: true })} method={METHOD[a.method ?? ""] ?? (c.appointment_id ? "التابلت" : "التطبيق")} tag={<Tag kind="green">موقّعة</Tag>} />;
            })}
          </Panel>
          <Panel title="مكتبة نماذج الموافقة" sub="نموذج لكل خدمة فعّالة" className={t.side}>
            {!services?.length ? <div style={{ fontSize: 13, color: C.muted }}>أضيفي الخدمات من الإعدادات لتظهر نماذجها هنا.</div> : services.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #EDE2F1" }}>
                <Icon name="file" size={18} color={C.accentMid} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{s.name}</span>
                <span className="latin" style={{ fontSize: 12, color: C.sub2 }}>{all.filter((c) => c.service_key === s.key).length}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

function Row({ pid, name, fileNo, form, date, method, tag }: { pid: string; name?: string; fileNo?: number; form: string; date: string; method: string; tag: React.ReactNode }) {
  return (
    <div className={t.row} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 54, borderTop: "1px solid #EDE2F1", fontSize: 13.5 }}>
      <Link href={fileHref(R.W_Record, "id", pid)} style={{ flex: 1.4, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <Initials name={name ?? ""} size={32} />
        <span style={{ fontWeight: 700 }}>{displayName(name)}</span>{fileNo && <span className="latin" style={{ fontSize: 12, color: C.sub2 }}>{fileNo}</span>}
      </Link>
      <span style={{ flex: 1.2 }}>{form}</span>
      <span style={{ flex: 0.9, color: C.sub }}>{date}</span>
      <span style={{ flex: 0.7, color: C.sub }}>{method}</span>
      <span style={{ flex: 0.8 }}>{tag}</span>
    </div>
  );
}
