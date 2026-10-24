"use client";

/** W_MyDay.dc.html — «جدولي»: the signed-in specialist's real appointments today (live). */
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { Avatar, DoneDot, EmptyState, ErrorNote, GhostButton, Icon, Loading, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { bookingError, callPatient, endsAt, listMyDay, personName, setStatus, STATUS_KIND, STATUS_LABEL, timeOf, useLiveAppointments, type Appointment, type Status } from "@/lib/db/appointments";
import { initials } from "@/lib/data";
import { arDate, clock } from "@/lib/format";
import { ROLE_LABEL, useSession } from "@/lib/supabase/session";
import { C, DARK, ICON_FILL, SELECTED, SH } from "@/lib/tokens";
import css from "../calendar/appts.module.css";
import { arErr } from "../patients/kit";
import { isPaid } from "@/lib/db/levels";
import { ExtendRequest, OverrideStartButton, SessionTimer, ToCashier, UnpaidTag, usePendingExtensions } from "../queue/session-ui";

export default function MyDayPage() {
  useLiveAppointments("my-day");
  const { staff } = useSession();
  const { data, loading, error } = useQuery(["appointments", "myday", staff?.id], () => listMyDay(staff!.id), { enabled: !!staff });
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const ext = usePendingExtensions("my-day-ext");
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";

  const mine = (data ?? []).filter((a) => a.status !== "cancelled");
  const done = mine.filter((a) => a.status === "done").length;
  const current = mine.find((a) => a.status === "in_session");
  const left = mine.filter((a) => ["pending", "confirmed", "checked_in"].includes(a.status));
  const next = left.find((a) => a.status === "checked_in") ?? left[0];

  async function run(key: string, f: () => Promise<unknown>) {
    setBusy(key); setErr("");
    try { await f(); } catch (e) { setErr(bookingError(e)); } finally { setBusy(""); }
  }
  const go = (a: Appointment, s: Status) => run(a.id + s, () => setStatus(a.id, s));

  return (
    <AdminShell active="جدولي" title="جدولي" subtitle={`${staff ? `${staff.name} · ${staff.title || ROLE_LABEL[staff.role]} · ` : ""}${arDate(new Date())} · الآن ${clock()}`}
      actions={<Link href={R.W_CarePlans} style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, color: C.accent, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, padding: "0 14px" }}>
        <Icon name="clip" color={C.accent} size={16} stroke={1.9} />خطط العناية
      </Link>}>
      {err && <ErrorNote>{err}</ErrorNote>}
      {!staff || loading ? <Loading /> : error ? <ErrorNote>{arErr(error, "تعذّر تحميل جدولكِ. أعيدي تحميل الصفحة.")}</ErrorNote> : mine.length === 0 ? (
        <EmptyState icon="cal" title="لا مواعيد لكِ اليوم" text="تظهر هنا المواعيد المسندة إليكِ اليوم بالترتيب، مع الجلسة الحالية والمراجِعة التالية."
          action={<Link href={R.W_Calendar} style={{ color: C.accent, fontWeight: 700 }}>فتح التقويم</Link>} />
      ) : (
        <div className={css.split} style={{ gap: 18, flexGrow: 1, minHeight: 0, alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1.15, minWidth: 0 }}>
            <div className="adm-row">
              {[["مواعيدي اليوم", mine.length], ["انتهت", done], ["متبقية", left.length]].map(([l, v]) => (
                <div key={l} style={{ flex: 1, borderRadius: 22, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
                  <div style={{ fontSize: 13, color: C.sub2 }}>{l}</div>
                  <div className="latin" style={{ fontSize: 28, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>

            {current ? (
              <div style={{ ...DARK, borderRadius: 28, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                    <div style={{ fontSize: 13, color: C.onDark }}>الجلسة الحالية · منذ {clock(current.started_at ?? current.starts_at)}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{personName(current)}</div>
                    <div style={{ fontSize: 14, color: "#F2E6F4" }}>{current.service?.name}{current.level && current.level.level > 1 ? ` · ${current.level.name}` : ""} · {current.room?.name ?? "بدون غرفة"} · حتى {clock(endsAt({ starts_at: current.started_at ?? current.starts_at, minutes: current.minutes, extension_minutes: current.extension_minutes }))}{current.extension_minutes ? ` · مُدّدت ${current.extension_minutes} د` : ""}</div>
                  </div>
                  <SessionTimer a={current} dark />
                </div>
                <div style={{ marginTop: 14 }}>
                  <ExtendRequest apptId={current.id} pending={(ext.data ?? []).find((e) => e.appointment_id === current.id)} dark onError={setErr} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <SubmitButton busy={busy === current.id + "done"} onClick={() => go(current, "done")} style={{ background: C.white, color: C.accent }}>إنهاء الجلسة</SubmitButton>
                  <Link href={`${R.W_SessionNote}?appointment=${current.id}${current.patient_id ? `&patient=${current.patient_id}` : ""}`} style={{ height: 50, borderRadius: 25, padding: "0 20px", border: "1px solid rgba(255,255,255,0.4)", color: C.white, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                    <Icon name="clip" color="#FFFFFF" size={17} />ملاحظات الجلسة
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: 28, padding: "18px 22px", background: C.white, border: "1px dashed #E1CDE6", color: C.sub, fontSize: 14 }}>لا جلسة جارية الآن.</div>
            )}

            {next && (
              <div style={{ borderRadius: 28, padding: "18px 22px", ...SELECTED }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>التالية</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                  <Avatar initials={initials(personName(next))} size={48} />
                  <div style={{ flex: "1 1 200px", minWidth: 0, lineHeight: 1.4 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>{personName(next)}{next.queue_no != null && <span className="latin" style={{ fontSize: 14, color: C.accent }}> · دور {next.queue_no}</span>}</div>
                    <div style={{ fontSize: 13, color: C.sub2 }}>{timeOf(next)} · {next.service?.name}{next.level && next.level.level > 1 ? ` · ${next.level.name}` : ""} · <span className="latin">{next.minutes}</span> د · {next.room?.name ?? "بدون غرفة"} · {STATUS_LABEL[next.status]}</div>
                  </div>
                  {!isPaid(next) && <UnpaidTag />}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  {next.status === "confirmed" && <SubmitButton busy={busy === next.id + "checked_in"} onClick={() => go(next, "checked_in")}>تسجيل وصولها</SubmitButton>}
                  {next.status === "checked_in" && <GhostButton icon="bell" onClick={() => run(next.id + "call", () => callPatient(next.id))}>{next.called_at ? "إعادة النداء" : "نداء على الشاشة"}</GhostButton>}
                  {next.status === "checked_in" && !current && (isPaid(next)
                    ? <SubmitButton busy={busy === next.id + "in_session"} onClick={() => go(next, "in_session")}>بدء الجلسة</SubmitButton>
                    : <button type="button" disabled aria-disabled title="تبدأ الجلسة بعد دفعها في الكاشير" style={{ height: 50, padding: "0 22px", borderRadius: 25, border: "1px dashed #D9C7DF", background: "#F3EDF5", color: "#A592AB", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, cursor: "not-allowed", whiteSpace: "nowrap" }}>
                        <Icon name="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 11V7a4 4 0 1 1 8 0v4" size={17} color="#A592AB" />بدء الجلسة بعد الدفع
                      </button>)}
                  {!isPaid(next) && <ToCashier a={next} />}
                  {!isPaid(next) && isAdmin && next.status === "checked_in" && !current && <OverrideStartButton apptId={next.id} name={personName(next)} />}
                  {next.patient_id && <Link href={`${R.W_Record}?id=${next.patient_id}`} style={{ height: 46, display: "inline-flex", alignItems: "center", color: C.accent, fontWeight: 700, fontSize: 14 }}>فتح الملف</Link>}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0, borderRadius: 26, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, alignSelf: "flex-start" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>جدول اليوم</div>
            {mine.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: "1px solid #EDE2F1", opacity: a.status === "done" || a.status === "no_show" ? 0.6 : 1 }}>
                {a.status === "done" ? <DoneDot size={30} /> : <span className="latin" style={{ width: 30, height: 30, borderRadius: 15, background: a.status === "in_session" ? C.accent : ICON_FILL, flexShrink: 0 }} />}
                <span className="latin" style={{ width: 48, fontSize: 13.5, fontWeight: 700 }}>{timeOf(a)}</span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{personName(a)}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{a.service?.short_name}{a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""} · {a.minutes + (a.extension_minutes ?? 0)} د · {a.room?.name ?? "بدون غرفة"}
                    {["pending", "confirmed", "checked_in"].includes(a.status) && !isPaid(a) && <span style={{ color: "#A3621A", fontWeight: 700, whiteSpace: "nowrap" }}> · بانتظار الدفع</span>}</div>
                </div>
                <Tag kind={STATUS_KIND[a.status]}>{STATUS_LABEL[a.status]}</Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
