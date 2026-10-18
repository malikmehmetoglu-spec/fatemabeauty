"use client";

/** W_ConsultCall.dc.html — specialist side of online consultations + patient messages. Video is not connected yet. */
import ac from "../adminPages.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, DataTable, EmptyState, ErrorNote, Icon, Loading, SubmitButton, Tag } from "@/components/ui";
import { arDate, clock } from "@/lib/format";
import { invalidate, useQuery } from "@/lib/db/query";
import { getConsultService, listConsults, listInbox, markRead, staffReply, subscribeInbox } from "@/lib/db/consult";
import { useSession } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { arErr } from "../patients/kit";

const STATUS: Record<string, [string, "green" | "amber" | "gray" | "lilac" | "plum"]> = {
  pending: ["بانتظار التأكيد", "amber"], confirmed: ["مؤكدة", "green"], checked_in: ["حاضرة", "lilac"], in_session: ["جارية", "plum"], done: ["منتهية", "gray"], no_show: ["لم تحضر", "gray"],
};

export default function ConsultCallPage() {
  const { staff } = useSession();
  const { data: svc, loading: l1, error: e1 } = useQuery(["consult", "service"], getConsultService);
  const { data: consults, loading: l2, error: e2 } = useQuery(["consult", "staff", svc?.key], () => listConsults(svc!.key), { enabled: !!svc });
  const { data: inbox, loading: l3, error: e3 } = useQuery(["inbox", "all"], listInbox);
  useEffect(() => subscribeInbox(() => invalidate("inbox")), []);

  const threads = useMemo(() => {
    const m = new Map<string, NonNullable<typeof inbox>>();
    for (const x of inbox ?? []) { const a = m.get(x.patient_id) ?? []; a.push(x); m.set(x.patient_id, a); }
    return [...m.entries()].map(([pid, msgs]) => ({ pid, msgs: [...msgs].reverse(), last: msgs[0], unread: msgs.filter((x) => x.from_patient && !x.read_at).length }));
  }, [inbox]);
  const [open, setOpen] = useState<string | null>(null);
  const thread = threads.find((t) => t.pid === open) ?? null;

  return (
    <AdminShell active="جدولي" title="الاستشارة أونلاين" subtitle="الاستشارات المحجوزة عن بُعد ورسائل المراجعات">
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "12px 16px", background: "#FCF1DE", color: "#8A5A12" }}>
        <Icon name="cam" color="#8A5A12" size={20} />
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>الاتصال المرئي غير مفعّل بعد. تواصلي مع المراجعة في موعد الاستشارة هاتفياً أو عبر الرسائل أدناه.</div>
      </div>

      <div className={ac.stack} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1.2, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>الاستشارات المحجوزة</div>
          {l1 || (svc && l2) ? <Loading /> : e1 || e2 ? <ErrorNote>{arErr(e1 || e2, "تعذّر تحميل الاستشارات.")}</ErrorNote> : !svc ? (
            <EmptyState compact icon="cam" title="لا توجد خدمة استشارة أونلاين"
              text="أضيفي من «الخدمات والأسعار» خدمة باسم يتضمن «أونلاين» أو «عن بعد» (أو رمزاً يحتوي online) ليتمكّن المراجعات من حجزها من التطبيق." />
          ) : !consults?.length ? (
            <EmptyState compact icon="cal" title="لا توجد استشارات محجوزة" text={`تظهر هنا حجوزات «${svc.name}» القادمة وآخر 7 أيام.`} />
          ) : (
            <DataTable headers={["الموعد", "المراجعة", "الهاتف", "الأخصائية", "الحالة"]} widths={[1.4, 1.5, 1.2, 1.1, 1]} minWidth={640}
              rows={consults.map((a) => {
                const st = STATUS[a.status] ?? [a.status, "gray"];
                const phone = a.patients?.phone || a.walk_in_phone;
                return [
                  <span key="d" style={{ fontSize: 13 }}>{arDate(new Date(a.starts_at))} · <span className="latin">{clock(a.starts_at)}</span></span>,
                  <span key="p" style={{ fontWeight: 700 }}>{a.patients?.name || a.walk_in_name || "بدون اسم"} {a.patients && <span className="latin" style={{ fontSize: 11.5, color: C.muted }}>{a.patients.file_no}</span>}</span>,
                  phone ? <a key="ph" href={`tel:${phone}`} dir="ltr" className="latin" style={{ color: C.accent }}>{phone}</a> : "—",
                  a.staff?.name ?? "—",
                  <Tag key="s" kind={st[1]}>{st[0]}</Tag>,
                ];
              })} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>رسائل المراجعات</div>
          {l3 ? <Loading /> : e3 ? <ErrorNote>{arErr(e3, "تعذّر تحميل الرسائل.")}</ErrorNote> : threads.length === 0 ? (
            <EmptyState compact icon="msg" title="لا توجد رسائل" text="عندما تراسل مراجعة المركز من التطبيق تظهر محادثتها هنا." />
          ) : thread ? (
            <Thread key={thread.pid} t={thread} staffId={staff?.id ?? null} onBack={() => setOpen(null)} />
          ) : threads.map((t) => (
            <button key={t.pid} type="button" onClick={() => { setOpen(t.pid); if (t.unread) markRead(t.pid).then(() => invalidate("inbox")).catch(() => {}); }}
              style={{ textAlign: "right", border: "1px solid #F0E6F3", background: C.white, borderRadius: 20, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{t.last.patients?.name || "مراجعة"} <span className="latin" style={{ fontSize: 11.5, color: C.muted }}>{t.last.patients?.file_no}</span></div>
                <div style={{ fontSize: 12.5, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last.body}</div>
              </div>
              <span className="latin" style={{ fontSize: 11.5, color: C.muted }}>{clock(t.last.created_at)}</span>
              {t.unread > 0 && <Tag kind="pink">{t.unread} جديدة</Tag>}
            </button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

type T = { pid: string; msgs: { id: string; from_patient: boolean; body: string; created_at: string }[]; last: { patients: { name: string } | null } };
function Thread({ t, staffId, onBack }: { t: T; staffId: string | null; onBack: () => void }) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [t.msgs.length]);
  const send = async () => {
    if (!staffId || !draft.trim()) return;
    setBusy(true); setErr(null);
    try { await staffReply(t.pid, staffId, draft); setDraft(""); }
    catch (e) { setErr(arErr(e, "تعذّر إرسال الرد. حاولي مرة أخرى.")); }
    finally { setBusy(false); }
  };
  return (
    <Card radius={24} padding={14} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={onBack} aria-label="رجوع" style={{ border: "none", background: "none", padding: 4 }}><Icon name="back" size={18} /></button>
        <b>{t.last.patients?.name || "مراجعة"}</b>
      </div>
      <div ref={ref} style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {t.msgs.map((m) => (
          <div key={m.id} style={{ alignSelf: m.from_patient ? "flex-start" : "flex-end", maxWidth: "80%", padding: "8px 12px", borderRadius: 16, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
            background: m.from_patient ? "#F3EAF6" : C.accent, color: m.from_patient ? C.ink : C.white }}>
            {m.body}
            <div className="latin" style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>{clock(m.created_at)}</div>
          </div>
        ))}
      </div>
      <textarea aria-label="الرد" value={draft} maxLength={2000} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="اكتبي ردكِ…"
        style={{ width: "100%", borderRadius: 16, border: "1px solid #EADCF0", padding: "10px 12px", fontSize: 14, resize: "vertical" }} />
      {err && <ErrorNote>{err}</ErrorNote>}
      <SubmitButton onClick={send} busy={busy} disabled={!draft.trim() || !staffId}>إرسال</SubmitButton>
    </Card>
  );
}
