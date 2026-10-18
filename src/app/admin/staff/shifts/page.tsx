"use client";

/** W_Shifts.dc.html — الورديات (live, Supabase `staff_shifts`). Weekly grid: team × day. */
import { Fragment, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, Select, SubmitButton, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listRooms, listShifts, removeShift, saveShift, type Shift } from "@/lib/db/staff";
import { useSession } from "@/lib/supabase/session";
import { AR_DAYS } from "@/lib/data";
import { arDate, dayKey } from "@/lib/format";
import { C } from "@/lib/tokens";
import { StaffCell, TeamTabs, errText, useTeam } from "../team-ui";

const keyDate = (k: string) => new Date(`${k}T12:00:00+03:00`);
const shiftKey = (k: string, n: number) => dayKey(new Date(keyDate(k).getTime() + n * 864e5));
/** Saturday that starts the week containing `k` (Damascus). */
function weekStart(k: string) { const d = keyDate(k).getUTCDay(); return shiftKey(k, -((d + 1) % 7)); }
const hm = (t: string) => t.slice(0, 5);

export default function ShiftsPage() {
  const { staff: me } = useSession();
  const canManage = me?.role === "owner" || me?.role === "admin";
  const team = useTeam();
  const [start, setStart] = useState(() => weekStart(dayKey()));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => shiftKey(start, i)), [start]);
  const { data: shifts, loading, error } = useQuery(["shifts", start], () => listShifts(days[0], days[6]));
  const { data: rooms } = useQuery(["rooms", "list"], listRooms);
  const [editing, setEditing] = useState<Partial<Shift> | null>(null);
  const today = dayKey();
  const roomName = (id: string | null) => rooms?.find((r) => r.id === id)?.name;

  return (
    <AdminShell active="فريق العمل" title="الورديات" subtitle={`أسبوع ${arDate(keyDate(days[0]), { day: false })} — ${arDate(keyDate(days[6]), { day: false, year: true })}`}
      actions={<>
        <GhostButton icon="fwd" onClick={() => setStart(shiftKey(start, -7))}>الأسبوع السابق</GhostButton>
        <GhostButton onClick={() => setStart(weekStart(today))}>هذا الأسبوع</GhostButton>
        <GhostButton icon="back" onClick={() => setStart(shiftKey(start, 7))}>التالي</GhostButton>
      </>}>
      <TeamTabs />
      {team.loading || loading ? <Loading /> : error || team.error ? <ErrorNote>تعذّر تحميل الورديات: {error || team.error}</ErrorNote> : team.active.length === 0 ? (
        <EmptyState icon="users" title="لا يوجد فريق بعد" text="أضيفي الموظفات من صفحة الفريق أولاً، ثم وزّعي الورديات هنا." />
      ) : (
        <Card padding="10px 16px" style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `200px repeat(7, minmax(110px, 1fr))`, gap: 0 }}>
            <div />
            {days.map((d) => (
              <div key={d} style={{ padding: "8px 6px", textAlign: "center", fontSize: 12.5, fontWeight: 700, color: d === today ? C.accent : C.sub2 }}>
                {AR_DAYS[keyDate(d).getUTCDay()]}<div className="latin" style={{ fontWeight: 600, fontSize: 12 }}>{Number(d.slice(8))}</div>
              </div>
            ))}
            {team.active.map((s) => (
              <Fragment key={s.id}>
                <div style={{ padding: "10px 4px", borderTop: `1px solid ${C.line}` }}><StaffCell s={s} sub={s.title} /></div>
                {days.map((d) => {
                  const mine = (shifts ?? []).filter((x) => x.staff_id === s.id && x.day === d);
                  return (
                    <div key={d} style={{ borderTop: `1px solid ${C.line}`, padding: 6, display: "flex", flexDirection: "column", gap: 4, background: d === today ? "rgba(123,70,135,0.04)" : undefined }}>
                      {mine.map((x) => (
                        <button key={x.id} type="button" disabled={!canManage} onClick={() => setEditing(x)} style={{ border: "none", borderRadius: 12, padding: "6px 8px", background: "#F3E8F6", color: C.accent, fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: 1.4 }}>
                          <span className="latin">{hm(x.starts)}–{hm(x.ends)}</span>
                          {roomName(x.room_id) && <div style={{ fontSize: 11, fontWeight: 600, color: C.sub2 }}>{roomName(x.room_id)}</div>}
                        </button>
                      ))}
                      {canManage && (
                        <button type="button" aria-label={`إضافة وردية ${s.name}`} onClick={() => setEditing({ staff_id: s.id, day: d })} style={{ border: "1px dashed #E2D0EA", borderRadius: 12, background: "transparent", height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="plus" size={14} color={C.muted} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
          {(shifts ?? []).length === 0 && <div style={{ textAlign: "center", fontSize: 13, color: C.sub2, padding: "12px 0 4px" }}>لا ورديات مسجّلة لهذا الأسبوع{canManage ? " — اضغطي + في أي خانة لإضافة وردية." : "."}</div>}
        </Card>
      )}
      <ShiftDialog shift={editing} rooms={rooms ?? []} names={new Map(team.list.map((s) => [s.id, s.name]))} onClose={() => setEditing(null)} />
    </AdminShell>
  );
}


function ShiftDialog({ shift, rooms, names, onClose }: { shift: Partial<Shift> | null; rooms: { id: string; name: string }[]; names: Map<string, string>; onClose: () => void }) {
  const [starts, setStarts] = useState(""); const [ends, setEnds] = useState(""); const [room, setRoom] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    setStarts(shift?.starts ? hm(shift.starts) : ""); setEnds(shift?.ends ? hm(shift.ends) : ""); setRoom(shift?.room_id ?? ""); setNote(shift?.note ?? ""); setError("");
  }, [shift]);
  async function submit() {
    if (!shift?.staff_id || !shift.day) return;
    if (!starts || !ends) { setError("حدّدي وقت البداية والنهاية."); return; }
    if (ends <= starts) { setError("وقت النهاية يجب أن يكون بعد البداية."); return; }
    setBusy(true);
    try { await saveShift({ id: shift.id, staff_id: shift.staff_id, day: shift.day, starts, ends, room_id: room || null, note: note.trim() }); onClose(); }
    catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  async function remove() {
    if (!shift?.id || !confirm("حذف هذه الوردية؟")) return;
    setBusy(true);
    try { await removeShift(shift.id); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!shift} onClose={onClose} title={`${shift?.id ? "تعديل" : "إضافة"} وردية — ${names.get(shift?.staff_id ?? "") ?? ""}`} width={500}
      footer={<>
        <SubmitButton onClick={submit} busy={busy}>حفظ</SubmitButton>
        {shift?.id && <button type="button" onClick={remove} style={{ border: "none", background: "none", color: C.danger, fontSize: 14, fontWeight: 600, marginInlineStart: "auto" }}>حذف الوردية</button>}
      </>}>
      <div style={{ fontSize: 13.5, color: C.sub }}>{shift?.day ? arDate(keyDate(shift.day), { year: true }) : ""}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextInput label="من" type="time" dir="ltr" required value={starts} onChange={setStarts} />
        <TextInput label="إلى" type="time" dir="ltr" required value={ends} onChange={setEnds} />
      </div>
      <Select label="الغرفة (اختياري)" value={room} onChange={setRoom} options={[{ value: "", label: "بلا غرفة محددة" }, ...rooms.map((r) => ({ value: r.id, label: r.name }))]} />
      <TextInput label="ملاحظة" value={note} onChange={setNote} />
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
