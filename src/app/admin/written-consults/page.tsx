"use client";

/**
 * «الاستشارات المكتوبة» — consultant inbox (written_consults, migration 0174). Consultant (staff.is_consultant) and admin only.
 * Queue of paid questions sorted by due time (48h after payment) with a live countdown; reply by text and/or a recorded voice note.
 */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, Loading, SubmitButton, Tag } from "@/components/ui";
import { useQuery, revalidate } from "@/lib/db/query";
import { arDate, clock } from "@/lib/format";
import { C, SELECTED, SH } from "@/lib/tokens";
import {
  WC_KIND, WC_STATUS, audioUrl, consultQueue, dueLabel, replyWrittenConsult, signedPhotos, subscribeWc, uploadReplyAudio, wcError, type WcRow,
} from "@/lib/db/writtenConsult";
import pg from "../adminPages.module.css";
import { VoiceRecorder } from "./VoiceRecorder";

export default function WrittenConsultsPage() {
  const q = useQuery(["wc", "queue"], consultQueue);
  const [sel, setSel] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => subscribeWc(() => revalidate("wc")), []);
  const rows = q.data ?? [];
  const open = rows.filter((r) => r.status === "paid").sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""));
  const unpaid = rows.filter((r) => r.status === "awaiting_payment");
  const answered = rows.filter((r) => r.status === "answered").sort((a, b) => (b.answered_at ?? "").localeCompare(a.answered_at ?? "")).slice(0, 20);
  const current = rows.find((r) => r.id === sel) ?? open[0] ?? answered[0] ?? unpaid[0] ?? null;

  return (
    <AdminShell active="الاستشارات المكتوبة" title="الاستشارات المكتوبة" subtitle={`بانتظار ردّكِ: ${open.length} · بانتظار الدفع: ${unpaid.length} · بتوقيت دمشق`}>
      {q.loading ? <Loading /> : q.error ? <ErrorNote>{wcError(new Error(q.error))}</ErrorNote> : rows.length === 0 ? (
        <EmptyState icon="msg" title="لا استشارات مكتوبة بعد" text="عندما تدفع مراجِعة رسوم استشارة مكتوبة تظهر هنا مرتّبة حسب موعد الرد." />
      ) : (
        <div className={pg.split} style={{ ["--side" as string]: "360px" }}>
          <div className={pg.side} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Group title="بانتظار ردّكِ" rows={open} sel={current?.id} onSel={setSel} now={now} empty="لا أسئلة بانتظار الرد 🌸" />
            {answered.length > 0 && <Group title="تمّ الرد مؤخراً" rows={answered} sel={current?.id} onSel={setSel} now={now} />}
            {unpaid.length > 0 && <Group title="بانتظار الدفع (للاطلاع)" rows={unpaid} sel={current?.id} onSel={setSel} now={now} />}
          </div>
          <div className={pg.grow}>{current ? <Detail key={current.id} w={current} now={now} /> : null}</div>
        </div>
      )}
    </AdminShell>
  );
}

function Group({ title, rows, sel, onSel, now, empty }: { title: string; rows: WcRow[]; sel?: string; onSel: (id: string) => void; now: number; empty?: string }) {
  return (
    <div style={{ borderRadius: 24, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "10px 12px" }}>
      <div style={{ fontSize: 13, color: C.sub2, padding: "2px 6px 8px" }}>{title} · <span className="latin">{rows.length}</span></div>
      {rows.length === 0 && empty && <div style={{ fontSize: 13, color: C.sub, padding: "6px" }}>{empty}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r) => {
          const d = dueLabel(r.due_at, now);
          return (
            <button key={r.id} type="button" onClick={() => onSel(r.id)} style={{ textAlign: "start", border: "none", borderRadius: 18, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 3,
              ...(sel === r.id ? SELECTED : { background: "#FBF7FC", color: C.ink }) }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <b style={{ fontSize: 14 }}>{r.patients?.name ?? "مراجِعة"}</b>
                {r.status === "paid" ? <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: d.late ? "#B03D6A" : d.soon ? "#A3621A" : C.accent }}>{d.text}</span> : <Tag kind={WC_KIND[r.status]}>{WC_STATUS[r.status]}</Tag>}
              </span>
              <span style={{ fontSize: 12.5, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.intake?.concern ?? ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ w, now }: { w: WcRow; now: number }) {
  const photos = useQuery(["wc", "photos", w.id], () => signedPhotos(w.photos ?? []));
  const audio = useQuery(["wc", "audio", w.id, w.reply_audio_path], () => audioUrl(w.reply_audio_path));
  const [text, setText] = useState(w.reply_text ?? "");
  const [voice, setVoice] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const i = w.intake ?? {};
  const d = dueLabel(w.due_at, now);
  const canReply = w.status === "paid" || w.status === "answered";

  async function send() {
    if (!text.trim() && !voice) { setErr("اكتبي الرد أو سجّلي رسالة صوتية."); return; }
    setBusy(true); setErr(""); setOk(false);
    try {
      const path = voice ? await uploadReplyAudio(w.patient_id, voice) : null;
      await replyWrittenConsult(w.id, text, path);
      setVoice(null); setOk(true);
    } catch (e) { setErr(wcError(e)); } finally { setBusy(false); }
  }

  return (
    <div style={{ borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className={pg.wrapRow} style={{ justifyContent: "space-between" }}>
        <div style={{ lineHeight: 1.4 }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{w.patients?.name}</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>ملف <span className="latin">{w.patients?.file_no}</span> · أُرسلت {arDate(new Date(w.created_at))} <span className="latin">{clock(w.created_at)}</span>{w.paid_at ? <> · دُفعت <span className="latin">{clock(w.paid_at)}</span></> : null}</div>
        </div>
        {w.status === "paid" ? <span style={{ height: 34, padding: "0 14px", borderRadius: 17, display: "inline-flex", alignItems: "center", fontWeight: 700, fontSize: 13, background: d.late ? "#FBE4EC" : d.soon ? "#FFF1DD" : "#F4EAF7", color: d.late ? "#B03D6A" : d.soon ? "#A3621A" : C.accent }}>{d.text}</span>
          : <Tag kind={WC_KIND[w.status]}>{WC_STATUS[w.status]}</Tag>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {[["ما يزعجها", i.concern], ["منذ", i.since], ["ما جرّبته", i.tried], ["أدوية ومكمّلات", i.medications], ["الحساسية", i.allergies], ["حمل أو إرضاع", i.pregnant == null ? "" : i.pregnant ? "نعم" : "لا"], ["النتيجة المرجوّة", i.goals]]
          .filter(([, v]) => v).map(([k, v]) => (
            <div key={k as string} style={{ borderRadius: 16, background: "#FBF7FC", padding: "10px 12px", lineHeight: 1.6 }}>
              <div style={{ fontSize: 12, color: C.sub2 }}>{k}</div>
              <div style={{ fontSize: 14, color: k === "الحساسية" || (k === "حمل أو إرضاع" && v === "نعم") ? "#B03D6A" : C.ink, fontWeight: k === "ما يزعجها" ? 700 : 500 }}>{v as string}</div>
            </div>
          ))}
      </div>

      {(photos.data ?? []).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {(photos.data ?? []).map((p, k) => p.url && (
            <a key={p.path} href={p.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`صورة ${k + 1}`} style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 14 }} />
            </a>
          ))}
        </div>
      )}

      {w.status === "awaiting_payment" ? (
        <div style={{ fontSize: 13.5, color: "#A3621A" }}>لم يُؤكَّد الدفع بعد — يبدأ وقت الرد (48 ساعة) بعد تأكيد الاستقبال.</div>
      ) : (
        <>
          {audio.data && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: C.sub2 }}>الرسالة الصوتية المرسلة</span><audio controls src={audio.data} style={{ width: "100%" }} /></div>}
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>ردّكِ للعميلة</span>
            <textarea value={text} onChange={(e) => { setText(e.target.value); setOk(false); }} rows={7} maxLength={4000} disabled={!canReply}
              placeholder="اكتبي بلغة بسيطة: ما الذي ترينه، وما الخطوة التالية المقترحة لها…"
              style={{ width: "100%", borderRadius: 18, border: "1px solid #EADCF0", background: "#FDFAFE", padding: "12px 14px", fontSize: 14.5, lineHeight: 1.8, resize: "vertical", fontFamily: "inherit", color: C.ink }} />
          </label>
          <VoiceRecorder blob={voice} onChange={(b) => { setVoice(b); setOk(false); }} />
          {err && <ErrorNote>{err}</ErrorNote>}
          {ok && <div role="status" style={{ fontSize: 13.5, color: "#2E7D5B", fontWeight: 700 }}>أُرسل الرد ووصل إشعار للعميلة ✓</div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SubmitButton busy={busy} onClick={send}>{w.status === "answered" ? "تحديث الرد وإرساله" : "إرسال الرد للعميلة"}</SubmitButton>
          </div>
        </>
      )}
    </div>
  );
}
