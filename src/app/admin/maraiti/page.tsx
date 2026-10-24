"use client";

/**
 * «مرايتي» — Fatema's personal assistant (consultant only: staff.is_consultant; owner/admin are NOT allowed).
 * Top: greeting + «مهامكِ الآن» (rpc maraiti_tasks, live data). Then a chat with Maraiti (edge function «maraiti»)
 * with voice dictation. Maraiti never acts alone: anything she prepares appears as a card that waits for «موافقة».
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, GhostButton, Icon, Loading, Modal, SubmitButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, dayKey } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, DARK, SELECTED, SH } from "@/lib/tokens";
import { speechCtor, type SR } from "@/lib/speech";
import {
  askMaraiti, decideAction, friendlyError, maraitiActions, maraitiMessages, maraitiTasks, reminderDone,
  type MaraitiAction, type MaraitiTask,
} from "@/lib/db/maraiti";

const card = { borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH } as const;

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Damascus", hour: "2-digit", hour12: false }).format(new Date()));
  return h < 12 ? "صباح الخير" : h < 18 ? "نهاركِ سعيد" : "مساء الخير";
};
const firstName = (n?: string | null) => (n ?? "").trim().split(/\s+/)[0] || "";

function timeLeft(iso: string | null) {
  if (!iso) return "";
  const m = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (m <= 0) return "انتهى الوقت المحدد";
  if (m < 60) return `باقي ${m} دقيقة`;
  const h = Math.floor(m / 60);
  return h < 24 ? `باقي ${h} ساعة` : `باقي ${Math.floor(h / 24)} يوم`;
}

function describe(t: MaraitiTask): { icon: string; line: string; sub: string; href?: string; cta: string } {
  switch (t.kind) {
    case "consult_today":
      return { icon: "cal", line: `استشارة ${t.title}`, sub: `الساعة ${t.at ? clock(t.at) : ""} · ${t.detail === "intake_done" ? "عبّأت نموذج ما قبل الاستشارة" : "لم تعبّئ النموذج بعد"}`, href: R.W_FatemaDay, cta: "افتحي يوم فاطمة" };
    case "written":
      return { icon: "msg", line: `استشارة مكتوبة من ${t.title}`, sub: timeLeft(t.at) || "بانتظار ردّكِ", href: R.W_WrittenConsults, cta: "ردّي عليها" };
    case "mira":
      return { icon: "msg", line: `ميرا حوّلت لكِ ${t.title}`, sub: t.detail ?? "", href: R.W_Mira, cta: "افتحي المحادثة" };
    case "note_missing":
      return { icon: "star", line: `ملاحظة جلسة ${t.title}`, sub: "انتهت الاستشارة ولم تُكتب الملاحظة", href: `${R.W_SessionNote}?appointment=${t.ref_id}${t.patient_id ? `&patient=${t.patient_id}` : ""}`, cta: "اكتبي الملاحظة" };
    case "intake_review":
      return { icon: "users", line: `ملخّص ${t.title} قبل الاستشارة`, sub: "لم تطّلعي عليه بعد", href: R.W_FatemaDay, cta: "اطّلعي عليه" };
    default:
      return { icon: "sparkle", line: t.title, sub: t.detail && t.detail !== t.title ? t.detail : "تذكير", cta: "تمّ" };
  }
}

export default function MaraitiPage() {
  const { staff } = useSession();
  const ok = !!staff?.is_consultant;
  const tasks = useQuery(["maraiti", "tasks"], maraitiTasks, { enabled: ok });
  useEffect(() => { if (!ok) return; const x = setInterval(() => tasks.refresh(), 60000); return () => clearInterval(x); }, [ok, tasks]);

  return (
    <AdminShell active="مرايتي" title="مرايتي" subtitle={`${arDate(new Date())} · الآن ${clock()} بتوقيت دمشق`}
      actions={<Link href={R.W_FatemaDay} style={{ height: 46, padding: "0 18px", borderRadius: 23, ...SELECTED, display: "inline-flex", alignItems: "center", fontWeight: 600, fontSize: 14 }}>يوم فاطمة</Link>}>
      {!staff ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1080 }}>
          <div style={{ ...DARK, borderRadius: 30, padding: "20px 24px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display, 'El Messiri')" }}>{greeting()} يا {firstName(staff.name)} 🌸</div>
            <div style={{ fontSize: 14.5, color: "#F2E6F4", marginTop: 4, lineHeight: 1.8 }}>
              {tasks.loading ? "عم جهّزلكِ مهامكِ…" : (tasks.data?.length ?? 0) === 0 ? "ما في شي بانتظاركِ الآن. يومكِ مرتّب." : `عندكِ ${tasks.data!.length} ${tasks.data!.length === 1 ? "مهمّة" : "مهام"} الآن، رتّبتلكِ ياها حسب الأهمية.`}
            </div>
          </div>
          <TaskList tasks={tasks.data} loading={tasks.loading} error={tasks.error} />
          <Chat />
        </div>
      )}
    </AdminShell>
  );
}

function TaskList({ tasks, loading, error }: { tasks?: MaraitiTask[]; loading: boolean; error?: string }) {
  const [busy, setBusy] = useState("");
  return (
    <section style={{ ...card, padding: "16px 18px" }}>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>مهامكِ الآن</div>
      {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : !tasks?.length ? (
        <div style={{ fontSize: 14, color: C.sub, padding: "6px 2px" }}>كل شي منجز ✓</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => {
            const d = describe(t);
            return (
              <div key={`${t.kind}-${t.ref_id}`} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 12px", borderRadius: 18, background: t.urgent ? "#FBEFF5" : "#FBF8FC", border: `1px solid ${t.urgent ? "#F2C9DA" : "#F0E6F3"}` }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, background: "#F3E9F7", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={d.icon} size={18} color={t.urgent ? "#B03D6A" : C.accent} />
                </span>
                <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{d.line}{t.urgent && <Tag kind="pink">عاجل</Tag>}</div>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>{d.sub}</div>
                </div>
                {d.href ? (
                  <Link href={d.href} style={{ height: 40, padding: "0 16px", borderRadius: 20, ...SELECTED, display: "inline-flex", alignItems: "center", fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>{d.cta}</Link>
                ) : (
                  <button type="button" disabled={busy === t.ref_id} onClick={async () => { setBusy(t.ref_id); try { await reminderDone(t.ref_id); } finally { setBusy(""); } }}
                    style={{ height: 40, padding: "0 16px", borderRadius: 20, border: "none", ...SELECTED, fontSize: 13.5, fontWeight: 600, flexShrink: 0, opacity: busy === t.ref_id ? 0.6 : 1 }}>{d.cta}</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Chat() {
  const msgs = useQuery(["maraiti", "messages"], maraitiMessages);
  const acts = useQuery(["maraiti", "actions"], maraitiActions);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [err, setErr] = useState("");
  const [listening, setListening] = useState(false);
  const sr = useRef<SR | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  useEffect(() => () => { sr.current?.stop(); }, []);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs.data?.length, sending]);

  function dictate() {
    setErr("");
    if (listening) { sr.current?.stop(); return; }
    const Ctor = speechCtor();
    if (!Ctor) { setErr("الإملاء الصوتي غير مدعوم على هذا المتصفح. اكتبي رسالتكِ."); return; }
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

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    sr.current?.stop();
    setSending(true); setErr("");
    const r = await askMaraiti(t);
    setSending(false);
    if (r === "offline") setOffline(true);
    else { setOffline(false); setText(""); if (r === "error") setErr("ما قدرت جاوبكِ هلّق. جرّبي بعد شوي."); }
  }

  const pending = (acts.data ?? []).filter((a) => a.status === "pending");
  const recent = (acts.data ?? []).filter((a) => a.status !== "pending").slice(0, 4);

  return (
    <section style={{ ...card, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 17, fontWeight: 700 }}>احكي مع مرايتي</div>
      <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "2px" }}>
        {msgs.loading ? <Loading /> : !(msgs.data ?? []).length ? (
          <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.9 }}>
            اسأليني عن جدولكِ، عن عميلة، أو اطلبي مني جهّزلكِ حجز أو رسالة أو تذكير. أنا بجهّز، وإنتِ بتوافقي.
          </div>
        ) : (msgs.data ?? []).map((m) => (
          <div key={m.id} style={{ alignSelf: m.role === "user" ? "flex-start" : "flex-end", maxWidth: "78%", padding: "10px 14px", borderRadius: 20, fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap",
            ...(m.role === "user" ? SELECTED : { background: "#FBF8FC", border: "1px solid #F0E6F3", color: C.ink }) }}>
            {m.body}
            <div className="latin" style={{ fontSize: 11, color: C.sub2, marginTop: 2 }}>{clock(m.created_at)}</div>
          </div>
        ))}
        {sending && <div style={{ alignSelf: "flex-end", fontSize: 13, color: C.sub2, padding: "6px 10px" }}>مرايتي عم تفكّر…</div>}
        <div ref={end} />
      </div>

      {offline && <div style={{ borderRadius: 18, padding: "10px 14px", background: "#FBF4E8", color: "#8A5A12", fontSize: 14 }}>مرايتي ستكون جاهزة للمحادثة قريباً 🌸 مهامكِ فوق محدّثة دائماً.</div>}
      {err && <ErrorNote>{err}</ErrorNote>}

      {pending.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.sub }}>بانتظار موافقتكِ</div>
          {pending.map((a) => <ActionCard key={a.id} a={a} />)}
        </div>
      )}
      {recent.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {recent.map((a) => (
            <div key={a.id} style={{ fontSize: 12.5, color: a.status === "failed" ? C.danger : C.sub2 }}>
              {a.status === "approved" ? "✓" : a.status === "failed" ? "!" : "–"} {a.title} · {a.status === "approved" ? a.result : a.status === "failed" ? friendlyError(a.result) : "تجاهلتِها"}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={4000} placeholder="اكتبي أو أملي لمرايتي…"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          style={{ flex: "1 1 260px", minWidth: 0, borderRadius: 18, border: "1px solid #EADCF0", background: "#FDFAFE", padding: "10px 14px", fontSize: 14.5, lineHeight: 1.8, resize: "none", fontFamily: "inherit", color: C.ink }} />
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={dictate} aria-label="إملاء صوتي" title="إملاء صوتي"
            style={{ width: 50, height: 50, borderRadius: 25, border: listening ? "none" : "1px solid #EADCF0", background: listening ? "#B03D6A" : C.white, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mic" size={20} color={listening ? "#fff" : C.accent} />
          </button>
          <SubmitButton onClick={send} busy={sending} disabled={!text.trim()}>أرسلي</SubmitButton>
        </div>
      </div>
    </section>
  );
}

const toLocal = (iso?: string) => {
  if (!iso) return { day: dayKey(), time: "10:00" };
  const d = new Date(iso);
  return { day: dayKey(d), time: clock(d) };
};

function ActionCard({ a }: { a: MaraitiAction }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(false);
  const p = a.payload ?? {};
  const kindLabel = { book_appointment: "حجز موعد", reschedule: "نقل موعد", send_client_message: "رسالة لعميلة", remind_me: "تذكير لكِ" }[a.kind];

  async function go(decision: "approve" | "dismiss", payload?: Record<string, string>) {
    setBusy(decision); setErr("");
    try {
      const r = await decideAction(a.id, decision, payload);
      if (r.status === "failed") setErr(friendlyError(r.result));
      else setEdit(false);
    } catch (e) { setErr(e instanceof Error ? friendlyError(e.message) : "تعذّر التنفيذ."); }
    finally { setBusy(""); }
  }

  return (
    <div style={{ borderRadius: 20, padding: "12px 14px", background: "#FBF8FC", border: "1px solid #EADCF0", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Tag kind="plum">{kindLabel}</Tag>
        <b style={{ fontSize: 14.5 }}>{a.title}</b>
      </div>
      {a.kind === "send_client_message" && p.text && <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", color: C.ink }}>{p.text}</div>}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SubmitButton onClick={() => go("approve")} busy={busy === "approve"} style={{ height: 44 }}>موافقة</SubmitButton>
        <GhostButton onClick={() => setEdit(true)}>تعديل</GhostButton>
        <GhostButton onClick={() => go("dismiss")} color={C.sub}>تجاهل</GhostButton>
      </div>
      {edit && <EditAction a={a} busy={busy === "approve"} onClose={() => setEdit(false)} onSave={(pl) => go("approve", pl)} />}
    </div>
  );
}

function EditAction({ a, busy, onClose, onSave }: { a: MaraitiAction; busy: boolean; onClose: () => void; onSave: (p: Record<string, string>) => void }) {
  const p = a.payload ?? {};
  const hasText = a.kind === "send_client_message" || a.kind === "remind_me";
  const hasWhen = a.kind !== "send_client_message";
  const init = toLocal(a.kind === "remind_me" ? p.at : p.starts_at);
  const [txt, setTxt] = useState(p.text ?? "");
  const [day, setDay] = useState(init.day);
  const [time, setTime] = useState(init.time);
  const field = { height: 46, borderRadius: 16, border: "1px solid #EADCF0", padding: "0 12px", fontSize: 14.5, fontFamily: "inherit", background: "#FDFAFE", color: C.ink };
  function save() {
    const when = `${day}T${time}:00+03:00`;
    const next = { ...p };
    if (hasText) next.text = txt.trim();
    if (a.kind === "remind_me") next.at = when;
    else if (hasWhen) next.starts_at = when;
    onSave(next);
  }
  return (
    <Modal open onClose={onClose} title={`تعديل · ${a.title}`} width={480}
      footer={<><SubmitButton onClick={save} busy={busy} disabled={hasText && !txt.trim()}>حفظ وموافقة</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {hasText && <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={4} maxLength={1500}
          style={{ ...field, height: "auto", padding: "10px 12px", lineHeight: 1.8, resize: "vertical" }} />}
        {hasWhen && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: C.sub2, flex: "1 1 160px" }}>اليوم<input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="latin" style={field} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: C.sub2, flex: "1 1 120px" }}>الساعة (دمشق)<input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="latin" style={field} /></label>
          </div>
        )}
      </div>
    </Modal>
  );
}
