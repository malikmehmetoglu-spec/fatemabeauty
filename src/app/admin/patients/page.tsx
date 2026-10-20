"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, Modal, SubmitButton, GhostButton, Tag, TextArea, TextInput, Select } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { createPatient, listPatients, maskPhone, SKIN_TYPES, type PatientRow } from "@/lib/db/patients";
import { C, SH } from "@/lib/tokens";
import t from "../adminPages.module.css";
import { WaIconLink } from "../calendar/whatsapp";
import { arErr, Bar, chip, displayName, fileHref, Initials, PLUS, primaryBtn } from "./kit";

const FILTERS = ["الكل", "باقة نشطة", "رصيد مستحق", "لديها حساسية", "لم تزر منذ 45 يوماً", "من رابط الحجز"];
const PAGE = 20;

function matches(p: PatientRow, f: number) {
  if (f === 1) return p.packages.some((x) => x.sessions_used < x.sessions_total);
  if (f === 2) return p.due > 0;
  if (f === 3) return p.conditions.some((c) => c.kind === "allergy");
  if (f === 5) return p.source === "public";
  if (f === 4) return !!p.lastVisit && Date.now() - new Date(p.lastVisit).getTime() > 45 * 864e5;
  return true;
}

/** W_Patients.dc.html */
export default function PatientsPage() {
  return <Suspense><Patients /></Suspense>;
}

function Patients() {
  const urlQ = useSearchParams().get("q") ?? "";
  const { data, loading, error } = useQuery(["patients", "list"], listPatients);
  const [f, setF] = useState(0);
  const [q, setQ] = useState(urlQ);
  // the global search in the admin top bar submits to ?q=… (also while this page is already open)
  useEffect(() => { setQ(urlQ); setPage(0); }, [urlQ]);
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const s = q.trim().replace(/\s+/g, " ");
    const digits = s.replace(/\D/g, "").replace(/^(00963|963|0)/, "");
    return (data ?? []).filter((p) => matches(p, f) && (!s || p.name.includes(s) || String(p.file_no) === s
      || (digits.length >= 3 && (p.phone ?? "").replace(/\D/g, "").includes(digits))));
  }, [data, f, q]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const today = dayKey();

  function exportCsv() {
    const lines = [["رقم الملف", "الاسم", "الهاتف", "آخر زيارة", "الرصيد المستحق"], ...rows.map((p) => [p.file_no, p.name, p.phone ?? "", p.lastVisit ? dayKey(new Date(p.lastVisit)) : "", p.due])];
    const blob = new Blob(["﻿" + lines.map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `patients-${today}.csv`; a.click();
  }

  const head = (t: string, flex: number) => <div style={{ flex, minWidth: 0, fontSize: 12, color: C.sub2, fontWeight: 600 }}>{t}</div>;
  const cell = { minWidth: 0, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 } as const;

  return (
    <AdminShell active="المراجعات" title="المراجعات" subtitle="الملفات الصحية وسجلّ الزيارات والباقات"
      actions={<button type="button" onClick={() => setAdding(true)} style={primaryBtn}><Icon name={PLUS} size={19} color={C.white} stroke={1.9} />مراجعة جديدة</button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 340, maxWidth: "100%" }}>
            <label htmlFor="ps" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>بحث</label>
            <input id="ps" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="الاسم، رقم الملف أو الهاتف" style={{ height: 46, borderRadius: 23, border: "1px solid #EADCF0", background: C.white, padding: "0 14px", fontSize: 14, color: C.ink, boxShadow: "inset 0 1px 3px rgba(123,70,135,0.05)", width: "100%", outline: "none", paddingInlineStart: 44 }} />
            <span style={{ position: "absolute", top: 14, right: 16 }}><Icon name="search" size={18} color={C.muted} /></span>
          </div>
          <Icon name="filter" size={17} color={C.sub2} />
          {FILTERS.map((t, i) => <button key={t} type="button" onClick={() => { setF(i); setPage(0); }} style={chip(f === i, 40)}>{t}</button>)}
          <span style={{ marginInlineStart: "auto" }}>
            <button type="button" onClick={exportCsv} disabled={!rows.length} style={{ ...chip(false, 40), color: C.accent, opacity: rows.length ? 1 : 0.5 }}><Icon name="download" size={16} color={C.accent} stroke={1.9} />تصدير</button>
          </span>
        </div>

        {error ? <ErrorNote>{arErr(error, "تعذّر تحميل المراجعات. أعيدي تحميل الصفحة.")}</ErrorNote> : loading ? <Loading /> : !data?.length ? (
          <EmptyState icon="users" title="لا توجد ملفات مراجعات بعد" text="تظهر هنا كل مراجعة تسجّل في التطبيق أو يُفتح لها ملف في الاستقبال، مع آخر زيارة والباقة والرصيد."
            action={<SubmitButton onClick={() => setAdding(true)}>فتح ملف جديد</SubmitButton>} />
        ) : (
          <>
            <div className={t.scroll} style={{ borderRadius: 26, padding: "8px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
             <div className={t.inner} style={{ minWidth: 880 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}>
                {head("رقم الملف", 0.55)}{head("المراجعة", 1.45)}{head("إجراءات", 0.6)}{head("الهاتف", 1.05)}{head("آخر زيارة", 0.7)}{head("الباقة", 1.15)}{head("الرصيد", 0.95)}{head("وسوم", 1.55)}
              </div>
              {!shown.length && <div style={{ borderTop: "1px solid #EDE2F1", padding: "26px 0", textAlign: "center", color: C.sub2, fontSize: 13.5 }}>لا نتائج مطابقة للبحث أو الفلتر.</div>}
              {shown.map((p) => {
                const pkg = p.packages.find((x) => x.sessions_used < x.sessions_total) ?? p.packages[0];
                const allergies = p.conditions.filter((c) => c.kind === "allergy");
                const href = fileHref(R.W_Record, "id", p.id);
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: "1px solid #EDE2F1" }}>
                    <div style={{ ...cell, flex: 0.55 }}><Link href={href} className="latin" style={{ fontWeight: 700, color: C.accent }}>{p.file_no}</Link></div>
                    <div style={{ ...cell, flex: 1.45 }}>
                      <Link href={href} style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <Initials name={p.name} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: p.name ? C.ink : C.muted }}>{displayName(p.name)}</span>
                      </Link>
                    </div>
                    <div style={{ ...cell, flex: 0.6, gap: 6 }}>
                      <WaIconLink phone={p.phone} name={p.name} />
                      <Link href={href} aria-label="فتح الملف" title="فتح الملف" style={{ width: 36, height: 36, borderRadius: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid #EADCF0", background: C.white }}><Icon name="file" size={17} color={C.accent} /></Link>
                    </div>
                    <div style={{ ...cell, flex: 1.05 }}><span dir="ltr" className="latin" style={{ color: C.sub, unicodeBidi: "isolate" }}>{maskPhone(p.phone)}</span></div>
                    <div style={{ ...cell, flex: 0.7 }}><span style={{ color: C.sub }}>{!p.lastVisit ? "—" : dayKey(new Date(p.lastVisit)) === today ? `اليوم ${clock(p.lastVisit)}` : arDate(new Date(p.lastVisit), { day: false })}</span></div>
                    <div style={{ ...cell, flex: 1.15 }}>
                      {pkg ? (
                        <div style={{ width: "100%", lineHeight: 1.3 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{pkg.packages?.name ?? "باقة"} · {pkg.sessions_used}/{pkg.sessions_total}</div>
                          <Bar done={pkg.sessions_used} total={pkg.sessions_total} />
                        </div>
                      ) : <span style={{ color: C.muted }}>—</span>}
                    </div>
                    <div style={{ ...cell, flex: 0.95 }}>{p.due ? <Tag kind="amber">مستحق {money(p.due)}</Tag> : <span style={{ color: C.muted }}>0</span>}</div>
                    <div style={{ ...cell, flex: 1.55, flexWrap: "wrap" }}>
                      {allergies.map((c) => <Tag key={c.name} kind="pink">حساسية: {c.name}</Tag>)}
                      {p.pregnant && <Tag kind="amber">حامل</Tag>}
                      {p.breastfeeding && <Tag kind="amber">مرضع</Tag>}
                      {p.skin_type && <Tag kind="gray">{p.skin_type}</Tag>}
                      {p.source === "public" && <Tag kind="pink">من رابط الحجز</Tag>}
                      {!allergies.length && !p.pregnant && !p.breastfeeding && !p.skin_type && p.source !== "public" && <span style={{ color: C.muted }}>—</span>}
                    </div>
                  </div>
                );
              })}
             </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 13, color: C.sub2 }}>
              <span>عرض {shown.length} من {rows.length} · مرتّبة حسب آخر زيارة</span>
              {pages > 1 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" aria-label="السابق" disabled={page === 0} onClick={() => setPage(page - 1)} style={{ ...chip(false, 36), padding: 0, width: 36 }}><Icon name="M9 6l6 6-6 6" size={14} color={C.accent} stroke={1.9} /></button>
                  <span className="latin" style={chip(true, 36)}>{page + 1} / {pages}</span>
                  <button type="button" aria-label="التالي" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} style={{ ...chip(false, 36), padding: 0, width: 36 }}><Icon name="M15 6l-6 6 6 6" size={14} color={C.accent} stroke={1.9} /></button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <AddPatient open={adding} onClose={() => setAdding(false)} />
    </AdminShell>
  );
}

function AddPatient({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [skin, setSkin] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    setErr("");
    if (!name.trim()) { setErr("اكتبي اسم المراجعة."); return; }
    const digits = phone.replace(/\D/g, "");
    if (phone && digits.length < 9) { setErr("رقم الهاتف غير مكتمل."); return; }
    setBusy(true);
    try {
      const p = await createPatient({
        name: name.trim(), phone: digits ? `+963${digits.replace(/^(963|0)/, "")}` : null,
        birth_date: dob || null, skin_type: skin || null, notes: notes.trim() || null,
      });
      onClose(); setName(""); setPhone(""); setDob(""); setSkin(""); setNotes("");
      if (p) window.location.href = fileHref(R.W_Record, "id", p.id);
    } catch (e) { setErr(arErr(e)); }
    setBusy(false);
  }
  return (
    <Modal open={open} onClose={onClose} title="فتح ملف مراجعة" footer={<><SubmitButton onClick={save} busy={busy}>حفظ الملف</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <TextInput label="الاسم الكامل" value={name} onChange={setName} required />
      <div className={t.two}>
        <TextInput label="الهاتف" value={phone} onChange={setPhone} dir="ltr" placeholder="09xx xxx xxx" hint="تربط الملف بحسابها عند تسجيل الدخول بهذا الرقم" />
        <TextInput label="تاريخ الميلاد" value={dob} onChange={setDob} type="date" />
      </div>
      <Select label="نوع البشرة" value={skin} onChange={setSkin} options={[{ value: "", label: "غير محدد" }, ...SKIN_TYPES.map((s) => ({ value: s, label: s }))]} />
      <TextArea label="ملاحظات" value={notes} onChange={setNotes} />
      {err && <ErrorNote>{err}</ErrorNote>}
    </Modal>
  );
}
