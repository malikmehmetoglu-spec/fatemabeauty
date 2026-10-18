"use client";

/** W_Waitlist.dc.html — everyone waiting for a free slot (live). Reception offers a slot, then books it from the calendar. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Chip, DataTable, EmptyState, ErrorNote, GhostButton, Kpi, Loading, Modal, Select, SubmitButton, Tag, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { listServices, listSpecialists } from "@/lib/db/catalog";
import { addToWaitlist, dateOfKey, listWaitlist, searchPatients, setWaitStatus, type PatientHit, type WaitEntry } from "@/lib/db/appointments";
import { arDate, clock, dayKey } from "@/lib/format";
import { C } from "@/lib/tokens";
import css from "../calendar/appts.module.css";
import w8 from "./waitlist.module.css";
import { arErr } from "../patients/kit";

const PART: Record<string, string> = { any: "أي وقت", morning: "صباحاً", evening: "مساءً" };
type Filter = "all" | "waiting" | "offered" | "today";

export default function WaitlistAdminPage() {
  const { data, loading, error } = useQuery(["waitlist", "all"], listWaitlist);
  const [filter, setFilter] = useState<Filter>("all");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const list = data ?? [];
  const today = dayKey();
  const shown = list.filter((w) => filter === "all" || (filter === "today" ? w.preferred_day === today : w.status === filter));

  const set = async (w: WaitEntry, s: "offered" | "booked" | "closed" | "waiting") => {
    setErr("");
    if (s === "closed" && !window.confirm("إزالتها من قائمة الانتظار؟")) return;
    try { await setWaitStatus(w.id, s); } catch (e) { setErr(arErr(e)); }
  };

  return (
    <AdminShell active="المواعيد" title="قائمة الانتظار" subtitle="مراجِعات ينتظرن موعداً يفرغ — الأقدم أولاً"
      actions={<GhostButton icon="plus" onClick={() => setAdding(true)}>إضافة إلى القائمة</GhostButton>}>
      <div className="adm-row">
        <Kpi dark label="في الانتظار" value={list.filter((w) => w.status === "waiting").length} sub="لم يُعرض عليهن موعد بعد" icon="users" />
        <Kpi label="عُرض عليهن موعد" value={list.filter((w) => w.status === "offered").length} sub="بانتظار ردّهن" icon="bell" />
        <Kpi label="يفضّلن اليوم" value={list.filter((w) => w.preferred_day === today).length} sub={arDate(new Date())} icon="cal" />
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {([["all", "الكل"], ["waiting", "في الانتظار"], ["offered", "عُرض موعد"], ["today", "اليوم"]] as [Filter, string][]).map(([k, t]) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{t}</Chip>
        ))}
        <Link href={R.W_Calendar} style={{ marginInlineStart: "auto", color: C.accent, fontWeight: 700, fontSize: 13.5 }}>فتح التقويم لإيجاد وقت فارغ</Link>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}

      {loading ? <Loading /> : error ? <ErrorNote>{arErr(error, "تعذّر تحميل القائمة. أعيدي تحميل الصفحة.")}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="users" title="قائمة الانتظار فارغة"
          text="عندما يمتلئ يوم تنضم المراجِعات من التطبيق، أو تضيفينهن من هنا، ويظهرن بالترتيب مع اليوم والوقت المفضّل."
          action={<GhostButton icon="plus" onClick={() => setAdding(true)}>إضافة إلى القائمة</GhostButton>} />
      ) : shown.length === 0 ? <EmptyState compact icon="search" title="لا أحد في هذا الاختيار" /> : (<>
        <div className={w8.cards}>
          {shown.map((w, i) => (
            <div key={w.id} style={{ borderRadius: 22, padding: "12px 16px", background: C.white, border: "1px solid #F0E6F3", boxShadow: "0 6px 18px rgba(123,70,135,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <b className="latin" style={{ color: C.accent, fontSize: 15 }}>{i + 1}</b>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{w.patient?.name || w.name || "بدون اسم"}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{w.patient ? `ملف ${w.patient.file_no}` : "بدون ملف"}{(w.patient?.phone || w.phone) ? <> · <span dir="ltr" className="latin" style={{ unicodeBidi: "isolate" }}>{w.patient?.phone || w.phone}</span></> : null}</div>
                </div>
                <Tag kind={w.status === "offered" ? "pink" : "lilac"}>{w.status === "offered" ? "عُرض موعد" : "ينتظر"}</Tag>
              </div>
              <div style={{ fontSize: 12.5, color: C.sub }}>
                {w.service?.name ?? "أي جلسة"}{w.specialist ? ` · مع ${w.specialist.name}` : ""} · {w.preferred_day ? arDate(dateOfKey(w.preferred_day)) : "أي يوم"} · {PART[w.part]}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {w.status === "waiting" ? <RowBtn onClick={() => set(w, "offered")}>عرض موعد</RowBtn> : <RowBtn onClick={() => set(w, "waiting")}>إرجاع</RowBtn>}
                <RowBtn onClick={() => set(w, "booked")}>تم الحجز</RowBtn>
                <RowBtn danger onClick={() => set(w, "closed")}>إزالة</RowBtn>
              </div>
            </div>
          ))}
        </div>
        <div className={w8.table}>
        <DataTable
          headers={["#", "المراجِعة", "الجلسة", "اليوم المفضّل", "منذ", "الحالة", ""]}
          widths={[0.4, 2, 1.4, 1.4, 0.9, 1, 2.2]}
          rowHeight={60}
          rows={shown.map((w, i) => [
            <b key="n" className="latin" style={{ color: C.accent }}>{i + 1}</b>,
            <div key="p" style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{w.patient?.name || w.name || "بدون اسم"}</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{w.patient ? `ملف ${w.patient.file_no}` : "بدون ملف"}{(w.patient?.phone || w.phone) ? ` · ${w.patient?.phone || w.phone}` : ""}</div>
            </div>,
            <span key="s">{w.service?.name ?? "أي جلسة"}{w.specialist ? <div style={{ fontSize: 12, color: C.sub2 }}>مع {w.specialist.name}</div> : null}</span>,
            <span key="d">{w.preferred_day ? arDate(dateOfKey(w.preferred_day)) : "أي يوم"}<div style={{ fontSize: 12, color: C.sub2 }}>{PART[w.part]}</div></span>,
            <span key="c" style={{ fontSize: 12.5, color: C.sub2 }}>{dayKey(new Date(w.created_at)) === today ? clock(w.created_at) : arDate(new Date(w.created_at), { day: false })}</span>,
            <Tag key="t" kind={w.status === "offered" ? "pink" : "lilac"}>{w.status === "offered" ? "عُرض موعد" : "ينتظر"}</Tag>,
            <span key="a" style={{ display: "flex", gap: 6 }}>
              {w.status === "waiting" ? <RowBtn onClick={() => set(w, "offered")}>عرض موعد</RowBtn> : <RowBtn onClick={() => set(w, "waiting")}>إرجاع</RowBtn>}
              <RowBtn onClick={() => set(w, "booked")}>تم الحجز</RowBtn>
              <RowBtn danger onClick={() => set(w, "closed")}>إزالة</RowBtn>
            </span>,
          ])}
        />
        </div>
      </>)}
      <AddDialog open={adding} onClose={() => setAdding(false)} />
    </AdminShell>
  );
}

function RowBtn({ children, onClick, danger }: { children: string; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color: danger ? C.danger : C.accent, whiteSpace: "nowrap" }}>{children}</button>;
}

function AddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const services = useQuery(["catalog", "services"], listServices);
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const [q, setQ] = useState(""); const [hits, setHits] = useState<PatientHit[]>([]); const [patient, setPatient] = useState<PatientHit | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [svc, setSvc] = useState(""); const [sp, setSp] = useState(""); const [day, setDay] = useState(""); const [part, setPart] = useState<"any" | "morning" | "evening">("any");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (open) { setQ(""); setHits([]); setPatient(null); setName(""); setPhone(""); setSvc(""); setSp(""); setDay(""); setPart("any"); setError(""); } }, [open]);
  useEffect(() => {
    if (patient) return;
    let live = true;
    const t = setTimeout(() => searchPatients(q).then((r) => live && setHits(r)).catch(() => {}), 250);
    return () => { live = false; clearTimeout(t); };
  }, [q, patient]);

  async function save() {
    if (!patient && !name.trim()) { setError("اختاري مراجِعة مسجّلة أو اكتبي الاسم."); return; }
    setBusy(true); setError("");
    try {
      await addToWaitlist({ patient_id: patient?.id ?? null, name: patient ? null : name.trim(), phone: patient ? null : phone.trim() || null, service_key: svc || null, specialist_id: sp || null, preferred_day: day || null, part });
      onClose();
    } catch (e) { setError(arErr(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="إضافة إلى قائمة الانتظار" width={600} footer={<SubmitButton onClick={save} busy={busy}>إضافة</SubmitButton>}>
      {patient ? (
        <div style={{ display: "flex", justifyContent: "space-between", borderRadius: 16, padding: "10px 14px", background: C.tint2, fontSize: 14 }}>
          <b>{patient.name || "بدون اسم"} · ملف {patient.file_no}</b>
          <button type="button" onClick={() => setPatient(null)} style={{ border: "none", background: "none", color: C.accent, fontWeight: 700 }}>تغيير</button>
        </div>
      ) : (
        <>
          <TextInput label="بحث عن مراجِعة مسجّلة (اسم، هاتف، رقم ملف)" value={q} onChange={setQ} />
          {hits.map((h) => (
            <button key={h.id} type="button" onClick={() => setPatient(h)} style={{ display: "flex", justifyContent: "space-between", borderRadius: 14, padding: "8px 14px", border: "1px solid #EADCF0", background: C.white, fontSize: 14 }}>
              <b>{h.name || "بدون اسم"}</b><span style={{ color: C.sub2, fontSize: 12.5 }}>ملف {h.file_no}</span>
            </button>
          ))}
          <div className={css.grid2}>
            <TextInput label="أو اسم بدون ملف" value={name} onChange={setName} />
            <TextInput label="رقم الهاتف" value={phone} onChange={setPhone} dir="ltr" />
          </div>
        </>
      )}
      <div className={css.grid2}>
        <Select label="الجلسة" value={svc} onChange={setSvc} options={[{ value: "", label: "أي جلسة" }, ...(services.data ?? []).map((s) => ({ value: s.key, label: s.name }))]} />
        <Select label="الأخصائية" value={sp} onChange={setSp} options={[{ value: "", label: "أي أخصائية" }, ...(team.data ?? []).map((t) => ({ value: t.id, label: t.name }))]} />
        <TextInput label="اليوم المفضّل (اختياري)" type="date" dir="ltr" value={day} onChange={setDay} />
        <Select label="الوقت" value={part} onChange={setPart} options={[{ value: "any", label: "أي وقت" }, { value: "morning", label: "صباحاً" }, { value: "evening", label: "مساءً" }]} />
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
