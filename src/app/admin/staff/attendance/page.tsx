"use client";

/** W_Attendance.dc.html — الحضور والإجازات (live, Supabase `staff_attendance`, `leave_requests`). */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, PrimaryButton, SectionTitle, Select, SubmitButton, Tag, TextArea, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { LEAVE_KIND, LEAVE_STATUS, decideLeave, listAttendance, listLeave, punch, requestLeave, saveAttendance, type Attendance } from "@/lib/db/staff";
import { useSession } from "@/lib/supabase/session";
import { arDate, atDamascus, clock, dayKey } from "@/lib/format";
import { C } from "@/lib/tokens";
import { RowBtn, StaffCell, TeamTabs, errText, useTeam } from "../team-ui";

const keyDate = (k: string) => new Date(`${k}T12:00:00+03:00`);
const minus = (k: string, n: number) => dayKey(new Date(keyDate(k).getTime() - n * 864e5));
const hours = (a: Attendance) => a.check_in && a.check_out ? (new Date(a.check_out).getTime() - new Date(a.check_in).getTime()) / 36e5 : null;

export default function AttendancePage() {
  const { staff: me } = useSession();
  const isAdmin = me?.role === "owner" || me?.role === "admin";
  const team = useTeam();
  const today = dayKey();
  const from = minus(today, 13);
  const att = useQuery(["attendance", from], () => listAttendance(from, today));
  const leave = useQuery(["leave", "all"], listLeave);
  const [day, setDay] = useState(today);
  const [editing, setEditing] = useState<Partial<Attendance> | null>(null);
  const [asking, setAsking] = useState(false);
  const [msg, setMsg] = useState("");

  const rows = att.data ?? [];
  const todays = rows.filter((a) => a.day === today);
  const mineToday = todays.find((a) => a.staff_id === me?.id);
  const onDay = rows.filter((a) => a.day === day);
  const pending = (leave.data ?? []).filter((l) => l.status === "pending");
  const onLeaveToday = (leave.data ?? []).filter((l) => l.status === "approved" && l.starts <= today && l.ends >= today);

  async function doPunch(kind: "in" | "out") {
    setMsg("");
    try { await punch(kind); } catch (e) { setMsg(errText(e)); }
  }
  async function decide(id: string, status: "approved" | "rejected") {
    if (!me) return;
    try { await decideLeave(id, status, me.id); } catch (e) { setMsg(errText(e)); }
  }

  return (
    <AdminShell active="فريق العمل" title="الحضور والإجازات" subtitle={`${arDate(new Date())} · الآن ${clock()}`}
      actions={<GhostButton icon="cal" onClick={() => setAsking(true)}>طلب إجازة</GhostButton>}>
      <TeamTabs />
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        <Card style={{ flex: 1.9, display: "flex", alignItems: "center", gap: 14 }} padding="18px 20px">
          <div style={{ flex: 1, lineHeight: 1.5 }}>
            <div style={{ fontSize: 13, color: C.sub2 }}>حضوري اليوم</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              {mineToday?.check_in ? <>دخول <span className="latin">{clock(mineToday.check_in)}</span>{mineToday.check_out && <> · خروج <span className="latin">{clock(mineToday.check_out)}</span></>}</> : "لم تسجّلي الدخول بعد"}
            </div>
          </div>
          {!mineToday?.check_in
            ? <PrimaryButton icon="check" height={48} onClick={() => doPunch("in")}>تسجيل الدخول</PrimaryButton>
            : !mineToday.check_out && <PrimaryButton icon="logout" height={48} onClick={() => doPunch("out")}>تسجيل الخروج</PrimaryButton>}
        </Card>
        <Kpi label="حضرن اليوم" value={todays.filter((a) => a.check_in).length} sub={`من ${team.active.length} في الفريق`} icon="users" />
        <Kpi label="في إجازة اليوم" value={onLeaveToday.length} icon="cal" />
        <Kpi label="طلبات بانتظار الموافقة" value={pending.length} icon="clock" />
      </div>
      {msg && <ErrorNote>{msg}</ErrorNote>}

      <SectionTitle right={
        <select aria-label="اليوم" value={day} onChange={(e) => setDay(e.target.value)} style={{ height: 38, borderRadius: 19, border: "1px solid #EADCF0", background: C.white, padding: "0 12px", fontSize: 13 }}>
          {Array.from({ length: 14 }, (_, i) => minus(today, i)).map((k) => <option key={k} value={k}>{i18(k, today)}</option>)}
        </select>
      }>سجل الحضور</SectionTitle>
      {team.loading || att.loading ? <Loading /> : att.error ? <ErrorNote>تعذّر تحميل الحضور: {att.error}</ErrorNote> : !isAdmin && me?.role !== "accountant" ? (
        onDay.length ? <AttTable rows={onDay} team={team} /> : <EmptyState compact icon="clock" title="لا حضور مسجّل لكِ في هذا اليوم" />
      ) : (
        <DataTable headers={["الموظفة", "الدخول", "الخروج", "المدة", "ملاحظة", ""]} widths={[2, 1, 1, 1, 1.6, 1]}
          rows={team.active.map((s) => {
            const a = onDay.find((x) => x.staff_id === s.id);
            const h = a ? hours(a) : null;
            const off = (leave.data ?? []).some((l) => l.staff_id === s.id && l.status === "approved" && l.starts <= day && l.ends >= day);
            return [
              <StaffCell key="s" s={s} sub={s.title} />,
              a?.check_in ? <span key="i" className="latin">{clock(a.check_in)}</span> : off ? <Tag key="i" kind="lilac">إجازة</Tag> : <span key="i" style={{ color: C.muted }}>—</span>,
              a?.check_out ? <span key="o" className="latin">{clock(a.check_out)}</span> : <span key="o" style={{ color: C.muted }}>—</span>,
              h != null ? <span key="h" className="latin">{h.toFixed(1)} س</span> : <span key="h" style={{ color: C.muted }}>—</span>,
              <span key="n" style={{ fontSize: 12.5, color: C.sub }}>{a?.note || ""}</span>,
              isAdmin ? <RowBtn key="e" icon="edit" label="تعديل" onClick={() => setEditing(a ?? { staff_id: s.id, day })} /> : <span key="e" />,
            ];
          })} />
      )}

      <SectionTitle>طلبات الإجازة</SectionTitle>
      {leave.loading ? <Loading /> : leave.error ? <ErrorNote>{leave.error}</ErrorNote> : !(leave.data ?? []).length ? (
        <EmptyState compact icon="cal" title="لا طلبات إجازة" text="عندما تطلب موظفة إجازة تظهر هنا للموافقة أو الرفض." action={<GhostButton icon="plus" onClick={() => setAsking(true)}>طلب إجازة</GhostButton>} />
      ) : (
        <DataTable headers={["الموظفة", "النوع", "من", "إلى", "السبب", "الحالة", ""]} widths={[1.8, 0.8, 1, 1, 1.8, 1.1, 1.6]}
          rows={(leave.data ?? []).map((l) => [
            <StaffCell key="s" s={team.byId.get(l.staff_id)} />,
            LEAVE_KIND[l.kind] ?? l.kind,
            arDate(keyDate(l.starts), { day: false }),
            arDate(keyDate(l.ends), { day: false }),
            <span key="r" style={{ fontSize: 12.5, color: C.sub }}>{l.reason || "—"}</span>,
            <Tag key="t" kind={l.status === "approved" ? "green" : l.status === "rejected" ? "gray" : "amber"}>{LEAVE_STATUS[l.status]}</Tag>,
            isAdmin && l.status === "pending" ? (
              <span key="a" style={{ display: "flex", gap: 6 }}>
                <RowBtn icon="check" label="موافقة" color={C.okDeep} onClick={() => decide(l.id, "approved")} />
                <RowBtn icon="x" label="رفض" color={C.danger} onClick={() => decide(l.id, "rejected")} />
              </span>
            ) : <span key="a" />,
          ])} />
      )}

      <AttendanceDialog rec={editing} name={team.byId.get(editing?.staff_id ?? "")?.name ?? ""} onClose={() => setEditing(null)} />
      <LeaveDialog open={asking} isAdmin={isAdmin} meId={me?.id ?? ""} team={team.active.map((s) => ({ value: s.id, label: s.name }))} onClose={() => setAsking(false)} />
    </AdminShell>
  );
}

function i18(k: string, today: string) {
  return k === today ? "اليوم" : arDate(keyDate(k));
}

function AttTable({ rows, team }: { rows: Attendance[]; team: ReturnType<typeof useTeam> }) {
  return (
    <DataTable headers={["الموظفة", "الدخول", "الخروج", "المدة"]} widths={[2, 1, 1, 1]}
      rows={rows.map((a) => {
        const h = hours(a);
        return [<StaffCell key="s" s={team.byId.get(a.staff_id)} />, a.check_in ? clock(a.check_in) : "—", a.check_out ? clock(a.check_out) : "—", h != null ? `${h.toFixed(1)} س` : "—"];
      })} />
  );
}

function AttendanceDialog({ rec, name, onClose }: { rec: Partial<Attendance> | null; name: string; onClose: () => void }) {
  const [inT, setIn] = useState(""); const [outT, setOut] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { setIn(rec?.check_in ? clock(rec.check_in) : ""); setOut(rec?.check_out ? clock(rec.check_out) : ""); setNote(rec?.note ?? ""); setError(""); }, [rec]);
  async function submit() {
    if (!rec?.staff_id || !rec.day) return;
    if (inT && outT && outT <= inT) { setError("وقت الخروج يجب أن يكون بعد الدخول."); return; }
    setBusy(true);
    try {
      await saveAttendance({ id: rec.id, staff_id: rec.staff_id, day: rec.day, check_in: inT ? atDamascus(rec.day, inT) : null, check_out: outT ? atDamascus(rec.day, outT) : null, note: note.trim() });
      onClose();
    } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!rec} onClose={onClose} title={`تعديل الحضور — ${name}`} width={480} footer={<SubmitButton onClick={submit} busy={busy}>حفظ</SubmitButton>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>{rec?.day ? arDate(keyDate(rec.day), { year: true }) : ""}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput label="الدخول" type="time" dir="ltr" value={inT} onChange={setIn} />
        <TextInput label="الخروج" type="time" dir="ltr" value={outT} onChange={setOut} />
      </div>
      <TextInput label="ملاحظة" value={note} onChange={setNote} placeholder="تأخير، مغادرة مبكرة…" />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

function LeaveDialog({ open, isAdmin, meId, team, onClose }: { open: boolean; isAdmin: boolean; meId: string; team: { value: string; label: string }[]; onClose: () => void }) {
  const [who, setWho] = useState(meId); const [kind, setKind] = useState("annual"); const [starts, setStarts] = useState(""); const [ends, setEnds] = useState(""); const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (open) { setWho(meId); setKind("annual"); setStarts(""); setEnds(""); setReason(""); setError(""); } }, [open, meId]);
  async function submit() {
    if (!starts || !ends) { setError("حدّدي تاريخ البداية والنهاية."); return; }
    if (ends < starts) { setError("تاريخ النهاية قبل البداية."); return; }
    setBusy(true);
    try { await requestLeave({ staff_id: who, starts, ends, kind, reason: reason.trim() }, isAdmin); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="طلب إجازة" width={520} footer={<SubmitButton onClick={submit} busy={busy}>إرسال الطلب</SubmitButton>}>
      {isAdmin && <Select label="الموظفة" value={who} onChange={setWho} options={team} />}
      <Select label="نوع الإجازة" value={kind} onChange={setKind} options={Object.entries(LEAVE_KIND).map(([value, label]) => ({ value, label }))} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput label="من" type="date" dir="ltr" required value={starts} onChange={setStarts} />
        <TextInput label="إلى" type="date" dir="ltr" required value={ends} onChange={setEnds} />
      </div>
      <TextArea label="السبب (اختياري)" value={reason} onChange={setReason} rows={2} />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
