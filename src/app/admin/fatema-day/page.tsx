"use client";

/**
 * «يوم فاطمة» — the consultant's working screen: current & next client with session timer, pre-consultation summary,
 * written consultations due, note templates, voice dictation (Web Speech ar-SY, fallback: voice recording) → Mira structures
 * findings / plan / recommended levels → editable preview → «اعتماد وإرسال للعميلة» (session note + client notification).
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { arDate, clock } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, DARK, SELECTED, SH } from "@/lib/tokens";
import { listMyDay, personName, STATUS_LABEL, timeOf, useLiveAppointments, type Appointment } from "@/lib/db/appointments";
import { dueCount } from "@/lib/db/writtenConsult";
import { consultantStaff, sendFatemaNote, structureWithMira, type Structured } from "@/lib/db/fatemaDay";
import { IntakePanel } from "../my-day/IntakePanel";
import { SessionTimer } from "../queue/session-ui";
import { useRecorder } from "../written-consults/VoiceRecorder";
import pg from "../adminPages.module.css";
import { speechCtor, type SR } from "@/lib/speech";

const DEFAULT_TEMPLATES: { id: string; title: string; text: string }[] = [
  { id: "d1", title: "حب الشباب", text: "الفحص: حبوب التهابية على منطقة الذقن والفك، رؤوس سوداء على الأنف. الخطة: تنظيف عميق كل أسبوعين، روتين لطيف صباحاً ومساءً، واقي شمس يومي." },
  { id: "d2", title: "تصبغات", text: "الفحص: تصبغات سطحية على الوجنتين بعد التعرّض للشمس. الخطة: جلسات تفتيح متدرّجة، واقي شمس كل ساعتين خارج المنزل، متابعة بعد شهر." },
  { id: "d3", title: "جفاف وحساسية", text: "الفحص: جفاف واحمرار خفيف، حاجز البشرة ضعيف. الخطة: ترطيب مكثّف، إيقاف المقشّرات أسبوعين، جلسة ترطيب هادئة." },
];
const TPL_KEY = "fatema-day-templates";
type Tpl = { id: string; title: string; text: string };
const readTpl = (): Tpl[] => { try { return JSON.parse(localStorage.getItem(TPL_KEY) || "[]"); } catch { return []; } };
const writeTpl = (t: Tpl[]) => { try { localStorage.setItem(TPL_KEY, JSON.stringify(t)); } catch { /* private mode */ } };

export default function FatemaDayPage() {
  useLiveAppointments("fatema-day");
  const { staff } = useSession();
  const who = useQuery(["fatema-day", "who", staff?.id], () => consultantStaff({ id: staff!.id, is_consultant: !!staff!.is_consultant }), { enabled: !!staff });
  const sid = who.data?.id;
  const day = useQuery(["appointments", "fatema-day", sid], () => listMyDay(sid!), { enabled: !!sid });
  const due = useQuery(["wc", "due"], dueCount, { enabled: !!staff });
  const [pick, setPick] = useState<string | null>(null);

  const mine = (day.data ?? []).filter((a) => a.status !== "cancelled" && a.status !== "no_show");
  const current = mine.find((a) => a.status === "in_session");
  const left = mine.filter((a) => ["pending", "confirmed", "checked_in"].includes(a.status));
  const next = left.find((a) => a.status === "checked_in") ?? left[0];
  const target = mine.find((a) => a.id === pick) ?? current ?? next ?? null;
  const prep = target?.service?.is_consultation && target.patient_id ? target : null;

  return (
    <AdminShell active="يوم فاطمة" title="يوم فاطمة" subtitle={`${who.data?.name ?? ""} · ${arDate(new Date())} · الآن ${clock()} بتوقيت دمشق`}>
      {!staff || who.loading || day.loading ? <Loading /> : !sid ? <ErrorNote>لا توجد مستشارة معرّفة في فريق العمل بعد.</ErrorNote> : (
        <div className={pg.split} style={{ ["--side" as string]: "340px" }}>
          <div className={pg.grow} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <Stat label="مواعيد اليوم" value={mine.length} />
              <Stat label="متبقية" value={left.length} />
              <Link href={R.W_WrittenConsults} style={{ borderRadius: 22, padding: "14px 18px", background: (due.data ?? 0) > 0 ? "#FBEFF5" : C.white, border: "1px solid #F0E6F3", boxShadow: SH, color: C.ink }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>استشارات مكتوبة بانتظار ردّكِ</div>
                <div className="latin" style={{ fontSize: 28, fontWeight: 700, color: (due.data ?? 0) > 0 ? "#B03D6A" : C.ink }}>{due.data ?? 0}</div>
              </Link>
            </div>

            {current ? (
              <div style={{ ...DARK, borderRadius: 28, padding: "18px 22px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                  <div style={{ fontSize: 13, color: C.onDark }}>العميلة الحالية · منذ {clock(current.started_at ?? current.starts_at)}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{personName(current)}</div>
                  <div style={{ fontSize: 13.5, color: "#F2E6F4" }}>{current.service?.name}{current.level && current.level.level > 1 ? ` · ${current.level.name}` : ""}</div>
                </div>
                <SessionTimer a={current} dark />
              </div>
            ) : <div style={{ borderRadius: 24, padding: "16px 20px", background: C.white, border: "1px dashed #E1CDE6", color: C.sub, fontSize: 14 }}>لا جلسة جارية الآن.</div>}

            {next && (
              <div style={{ borderRadius: 24, padding: "14px 20px", ...SELECTED }}>
                <div style={{ fontSize: 13, color: C.sub2 }}>التالية</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{personName(next)}</div>
                <div style={{ fontSize: 13, color: C.sub2 }}><span className="latin">{timeOf(next)}</span> · {next.service?.name} · {STATUS_LABEL[next.status]}</div>
              </div>
            )}

            {target?.patient_id ? <Dictation key={target.id} appt={target} /> : (
              <div style={{ borderRadius: 24, padding: "16px 20px", background: C.white, border: "1px solid #F0E6F3", color: C.sub, fontSize: 14 }}>اختاري عميلة من جدول اليوم لكتابة ملاحظات جلستها.</div>
            )}
            {prep && <IntakePanel appointmentId={prep.id} />}
          </div>

          <div className={pg.side} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ borderRadius: 24, padding: "14px 16px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>جدول اليوم</div>
              {mine.length === 0 && <div style={{ fontSize: 13, color: C.sub }}>لا مواعيد اليوم.</div>}
              {mine.map((a) => (
                <button key={a.id} type="button" onClick={() => setPick(a.id)} style={{ width: "100%", textAlign: "start", border: "none", borderRadius: 16, padding: "9px 10px", marginTop: 4, display: "flex", gap: 10, alignItems: "center",
                  ...(target?.id === a.id ? SELECTED : { background: "transparent", color: C.ink }), opacity: a.status === "done" ? 0.65 : 1 }}>
                  <span className="latin" style={{ width: 44, fontWeight: 700, fontSize: 13 }}>{timeOf(a)}</span>
                  <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{personName(a)}</b>
                    <span style={{ fontSize: 12, color: C.sub2 }}>{a.service?.short_name}</span>
                  </span>
                  <Tag kind={a.status === "in_session" ? "pink" : a.status === "done" ? "green" : "lilac"}>{STATUS_LABEL[a.status]}</Tag>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ borderRadius: 22, padding: "14px 18px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
      <div style={{ fontSize: 13, color: C.sub2 }}>{label}</div>
      <div className="latin" style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

/* ---------- dictation → Mira → preview → send ---------- */

function Dictation({ appt }: { appt: Appointment }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState<string | null>(null);
  const [preview, setPreview] = useState<(Structured & { fallback?: boolean }) | null>(null);
  const [busy, setBusy] = useState<"" | "mira" | "send">("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const sr = useRef<SR | null>(null);
  const rec = useRecorder(300);
  useEffect(() => () => { sr.current?.stop(); }, []);

  function dictate() {
    setErr("");
    if (listening) { sr.current?.stop(); return; }
    const Ctor = speechCtor();
    if (!Ctor) {
      // fallback: record the voice so it can be replayed while typing
      if (rec.rec) rec.stop(); else void rec.start((b) => setVoice(URL.createObjectURL(b)));
      return;
    }
    const r = new Ctor();
    r.lang = "ar-SY"; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => {
      let add = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) add += e.results[i][0].transcript + " ";
      if (add) setText((t) => (t ? t.trimEnd() + " " : "") + add.trim());
    };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); setErr("تعذّر الإملاء الصوتي. تأكّدي من السماح بالميكروفون أو اكتبي يدوياً."); };
    sr.current = r; r.start(); setListening(true);
  }

  async function structure() {
    if (!text.trim()) { setErr("اكتبي أو أملي ملاحظات الجلسة أولاً."); return; }
    setBusy("mira"); setErr(""); setSent(false);
    const s = await structureWithMira(text);
    setPreview(s); setBusy("");
  }

  async function send() {
    if (!preview) return;
    setBusy("send"); setErr("");
    try { await sendFatemaNote(appt.id, preview); setSent(true); setPreview(null); setText(""); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  }

  const fallbackMode = !speechCtor();
  const area = { width: "100%", borderRadius: 16, border: "1px solid #EADCF0", background: "#FDFAFE", padding: "10px 12px", fontSize: 14, lineHeight: 1.8, resize: "vertical" as const, fontFamily: "inherit", color: C.ink };

  return (
    <div style={{ borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className={pg.wrapRow} style={{ justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>ملاحظات جلسة {personName(appt)}</div>
        <Templates onUse={(t) => setText((x) => (x ? x + "\n" : "") + t)} />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} maxLength={6000} aria-label="نص الإملاء" placeholder="أملي أو اكتبي ما لاحظتِه وما اتفقتما عليه…" style={area} />
      {voice && <audio controls src={voice} style={{ width: "100%" }} aria-label="تسجيلكِ الصوتي" />}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={dictate} style={{ height: 46, padding: "0 18px", borderRadius: 23, fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          border: listening || rec.rec ? "none" : "1px solid #EADCF0", background: listening || rec.rec ? "#B03D6A" : C.white, color: listening || rec.rec ? "#fff" : C.accent }}>
          <Icon name={listening || rec.rec ? "pause" : "mic"} size={17} color={listening || rec.rec ? "#fff" : C.accent} />
          {listening ? "إيقاف الإملاء" : rec.rec ? `إيقاف التسجيل ${rec.sec}ث` : fallbackMode ? "تسجيل صوتي" : "إملاء صوتي"}
        </button>
        <SubmitButton busy={busy === "mira"} onClick={structure} style={{ height: 46 }}>رتّبيها مع ميرا</SubmitButton>
      </div>
      {fallbackMode && <div style={{ fontSize: 12, color: C.sub2 }}>هذا المتصفح لا يدعم تحويل الصوت إلى نص؛ سجّلي ثم استمعي واكتبي الملخص.</div>}
      {rec.err && <ErrorNote>{rec.err}</ErrorNote>}
      {err && <ErrorNote>{err}</ErrorNote>}
      {sent && <div role="status" style={{ fontSize: 13.5, color: "#2E7D5B", fontWeight: 700 }}>حُفظت ملاحظة الجلسة ووصل إشعار للعميلة ✓</div>}

      {preview && (
        <div style={{ borderRadius: 20, background: "#FBF7FC", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>معاينة قابلة للتعديل</div>
          {preview.fallback && <div style={{ fontSize: 12.5, color: "#A3621A" }}>ميرا غير متاحة الآن؛ نُقل النص كما هو — رتّبيه يدوياً.</div>}
          <label style={{ fontSize: 13, color: C.sub2 }}>الملاحظات والفحص<textarea value={preview.findings} onChange={(e) => setPreview({ ...preview, findings: e.target.value })} rows={3} style={area} /></label>
          <label style={{ fontSize: 13, color: C.sub2 }}>الخطة<textarea value={preview.plan} onChange={(e) => setPreview({ ...preview, plan: e.target.value })} rows={3} style={area} /></label>
          <label style={{ fontSize: 13, color: C.sub2 }}>مستويات الخدمة الموصى بها (افصلي بفاصلة)
            <input value={preview.levels.join("، ")} onChange={(e) => setPreview({ ...preview, levels: e.target.value.split(/[،,]/).map((x) => x.trim()) })} style={{ ...area, height: 44 }} /></label>
          <label style={{ fontSize: 13, color: C.sub2 }}>رسالة للعميلة (بلغة بسيطة)<textarea value={preview.client_message} onChange={(e) => setPreview({ ...preview, client_message: e.target.value })} rows={3} style={area} /></label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <SubmitButton busy={busy === "send"} onClick={send}>اعتماد وإرسال للعميلة</SubmitButton>
            <GhostButton onClick={() => setPreview(null)}>تراجع</GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- note templates (built-in + her own, kept on this device) ---------- */

function Templates({ onUse }: { onUse: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [mine, setMine] = useState<Tpl[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [del, setDel] = useState<Tpl | null>(null);
  useEffect(() => { if (open) setMine(readTpl()); }, [open]);
  const add = () => { if (!title.trim() || !body.trim()) return; const n = [...mine, { id: crypto.randomUUID(), title: title.trim(), text: body.trim() }]; setMine(n); writeTpl(n); setTitle(""); setBody(""); };
  return (
    <>
      <GhostButton icon="clip" onClick={() => setOpen(true)}>قوالب الملاحظات</GhostButton>
      <Modal open={open} onClose={() => setOpen(false)} title="قوالب الملاحظات" width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...DEFAULT_TEMPLATES, ...mine].map((t) => (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", borderRadius: 16, background: "#FBF7FC", padding: "10px 12px" }}>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                <b style={{ fontSize: 14 }}>{t.title}</b>
                <div style={{ fontSize: 12.5, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</div>
              </div>
              <button type="button" onClick={() => { onUse(t.text); setOpen(false); }} style={{ height: 36, padding: "0 14px", borderRadius: 18, border: "none", ...SELECTED, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>استخدام</button>
              {!DEFAULT_TEMPLATES.some((d) => d.id === t.id) ? (
                <button type="button" aria-label={`حذف قالب ${t.title}`} onClick={() => setDel(t)} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="trash" size={16} color="#B03D6A" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F1E8F4", paddingTop: 12 }}>
          <b style={{ fontSize: 14 }}>قالب جديد</b>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان القالب" maxLength={40} style={{ height: 44, borderRadius: 14, border: "1px solid #EADCF0", padding: "0 12px", fontFamily: "inherit", fontSize: 14 }} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="نص القالب" maxLength={1000} style={{ borderRadius: 14, border: "1px solid #EADCF0", padding: "10px 12px", fontFamily: "inherit", fontSize: 14, resize: "vertical" }} />
          <div><SubmitButton onClick={add} disabled={!title.trim() || !body.trim()} style={{ height: 44 }}>حفظ القالب</SubmitButton></div>
        </div>
      </Modal>
      {del && <ConfirmDelete t={del} onClose={() => setDel(null)} onYes={() => { const n = mine.filter((x) => x.id !== del.id); setMine(n); writeTpl(n); setDel(null); }} />}
    </>
  );
}

function ConfirmDelete({ t, onClose, onYes }: { t: Tpl; onClose: () => void; onYes: () => void }) {
  const [left, setLeft] = useState(10);
  useEffect(() => { if (left <= 0) return; const x = setTimeout(() => setLeft((n) => n - 1), 1000); return () => clearTimeout(x); }, [left]);
  return (
    <Modal open onClose={onClose} title="حذف القالب" width={420}
      footer={<>
        <button type="button" onClick={onYes} disabled={left > 0} style={{ height: 48, padding: "0 22px", borderRadius: 24, border: "none", fontSize: 15, fontWeight: 700, color: "#fff", background: left > 0 ? "#D9B9C6" : C.danger, cursor: left > 0 ? "not-allowed" : "pointer" }}>
          {left > 0 ? `تأكيد الحذف (${left})` : "تأكيد الحذف"}
        </button>
        <GhostButton onClick={onClose}>إلغاء</GhostButton>
      </>}>
      <div style={{ fontSize: 14.5, lineHeight: 1.9 }}>سيُحذف القالب <b>{t.title}</b> من هذا الجهاز.</div>
    </Modal>
  );
}
