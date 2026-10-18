"use client";

/** W_Queue.dc.html — today's checked-in queue (live). «نداء التالي» sets called_at; the TV reads today_queue(). */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { callNext, callPatient, listTodayQueue, personName, setStatus, STATUS_KIND, useLiveAppointments, STATUS_LABEL, timeOf, type Appointment, type Status } from "@/lib/db/appointments";
import { arDate, clock } from "@/lib/format";
import { C, DARK, ICON_FILL, SH } from "@/lib/tokens";

const mins = (iso: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0);

export default function QueuePage() {
  useLiveAppointments("admin-queue");
  const { data, loading, error } = useQuery(["appointments", "queue-today"], listTodayQueue);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [called, setCalled] = useState<number | null | undefined>(undefined);

  const list = data ?? [];
  const waiting = list.filter((a) => a.status === "checked_in");
  const inSession = list.filter((a) => a.status === "in_session");
  const done = list.filter((a) => a.status === "done");
  const avg = waiting.length ? Math.round(waiting.reduce((s, a) => s + mins(a.checked_in_at), 0) / waiting.length) : 0;
  const lastCalled = [...list].filter((a) => a.called_at).sort((a, b) => (b.called_at ?? "").localeCompare(a.called_at ?? ""))[0];
  const rooms = Array.from(new Set(list.map((a) => a.room?.name ?? "بدون غرفة")));

  async function run(key: string, f: () => Promise<unknown>) {
    setBusy(key); setErr("");
    try { await f(); } catch (e) { setErr("تعذّر الحفظ: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(null); }
  }
  const act = (a: Appointment, to: Status) => run(a.id + to, () => setStatus(a.id, to));

  return (
    <AdminShell active="الأدوار" title="إدارة الأدوار" subtitle={`مباشر · ${arDate(new Date())}`}
      actions={<>
        <Link href={R.TV_Board} target="_blank" style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
          <Icon name="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 21h8M12 18v3" size={16} color={C.accent} />شاشة الانتظار
        </Link>
        <SubmitButton busy={busy === "next"} disabled={!waiting.some((a) => !a.called_at)} onClick={() => run("next", async () => setCalled(await callNext()))}>
          <Icon name="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 3l-4 4-4-4" size={18} color="#FFFFFF" />نداء التالي
        </SubmitButton>
      </>}>
      <div style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="في الانتظار" value={waiting.length} sub={waiting.length ? `متوسط الانتظار ${avg} دقيقة` : "لا أحد في صالة الانتظار"} icon="users" />
        <Kpi label="في الجلسة" value={inSession.length} sub={inSession.map((a) => a.room?.name).filter(Boolean).join(" · ") || "الغرف فارغة"} icon="sparkle" />
        <Kpi label="انتهت اليوم" value={done.length} sub={`من ${list.length} وصلن اليوم`} icon="check" />
        <Kpi label="آخر رقم نُودي" value={lastCalled?.queue_no ?? "—"} sub={lastCalled ? `${lastCalled.room?.name ?? ""} · ${clock(lastCalled.called_at!)}` : "لم يُنادَ أحد بعد"} icon="bell" />
      </div>

      {called === null && <ErrorNote>لا أحد ينتظر النداء الآن.</ErrorNote>}
      {err && <ErrorNote>{err}</ErrorNote>}

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الأدوار: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="users" title="لم تصل أي مراجِعة اليوم بعد"
          text="عند تسجيل الوصول (من تابلت الاستقبال أو من التقويم) تأخذ المراجِعة رقم دور وتظهر هنا، ويظهر رقمها على شاشة الانتظار." />
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1.6, minWidth: 0, borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>صالة الانتظار والجلسات</div>
            {list.filter((a) => a.status !== "done" && a.status !== "no_show" && a.status !== "cancelled").map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1" }}>
                <span className="latin" style={{ width: 46, height: 46, borderRadius: 16, background: a.called_at && a.status === "checked_in" ? C.accent : ICON_FILL, color: a.called_at && a.status === "checked_in" ? C.white : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{a.queue_no}</span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{personName(a)}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>
                    موعد {timeOf(a)} · {a.service?.short_name} · {a.room?.name ?? "بدون غرفة"}{a.specialist ? ` · ${a.specialist.name}` : ""}
                    {a.status === "checked_in" && ` · ينتظر منذ ${mins(a.checked_in_at)} د`}
                  </div>
                </div>
                <Tag kind={a.called_at && a.status === "checked_in" ? "pink" : STATUS_KIND[a.status]}>{a.called_at && a.status === "checked_in" ? "نُوديت" : STATUS_LABEL[a.status]}</Tag>
                {a.status === "checked_in" && <>
                  <GhostButton icon="bell" onClick={() => run(a.id + "call", () => callPatient(a.id))} style={{ height: 36, padding: "0 12px", fontSize: 12.5 }}>{a.called_at ? "إعادة النداء" : "نداء"}</GhostButton>
                  <GhostButton icon="sparkle" onClick={() => act(a, "in_session")} style={{ height: 36, padding: "0 12px", fontSize: 12.5 }}>بدء</GhostButton>
                  <GhostButton color={C.danger} onClick={() => act(a, "no_show")} style={{ height: 36, padding: "0 12px", fontSize: 12.5 }}>غادرت</GhostButton>
                </>}
                {a.status === "in_session" && <GhostButton icon="check" onClick={() => act(a, "done")} style={{ height: 36, padding: "0 12px", fontSize: 12.5 }}>إنهاء</GhostButton>}
              </div>
            ))}
            {waiting.length === 0 && inSession.length === 0 && <div style={{ fontSize: 13.5, color: C.sub2, padding: "10px 0" }}>لا أحد في الانتظار الآن.</div>}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ ...DARK, borderRadius: 26, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 13, color: C.onDark }}>على شاشة الانتظار الآن</div>
              <div className="latin" style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{lastCalled?.queue_no ?? "—"}</div>
              <div style={{ fontSize: 14, color: "#F2E6F4" }}>{lastCalled ? `تفضّلي إلى ${lastCalled.room?.name ?? "الاستقبال"}` : "تظهر الأرقام فقط، دون أسماء"}</div>
            </div>
            <div style={{ borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>الغرف</div>
              {rooms.map((r) => {
                const now = inSession.find((a) => (a.room?.name ?? "بدون غرفة") === r);
                const next = waiting.find((a) => (a.room?.name ?? "بدون غرفة") === r);
                return (
                  <div key={r} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderTop: "1px solid #EDE2F1", fontSize: 13.5 }}>
                    <b>{r}</b>
                    <span style={{ color: C.sub2 }}>الآن: <b className="latin" style={{ color: C.ink }}>{now?.queue_no ?? "—"}</b> · التالي: <b className="latin" style={{ color: C.ink }}>{next?.queue_no ?? "—"}</b></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
