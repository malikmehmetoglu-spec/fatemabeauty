"use client";

/**
 * «مرايتي» — Fatema's personal assistant (consultant only: staff.is_consultant; owner/admin are NOT allowed).
 * Chat-first: everything happens in one timeline — her messages, Maraiti's replies, proactive cards composed in SQL
 * (morning digest, client brief before each appointment, Mira hand-offs / client messages with inline reply, written
 * consults, intake forms, due reminders — migration 0181) and draft cards that execute ONLY on «موافقة».
 * «مهامكِ الآن» (rpc maraiti_tasks) collapses above the chat. Polls every 25 s.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, GhostButton, Icon, Loading, SubmitButton, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, dayKey } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, DARK, SELECTED, SH } from "@/lib/tokens";
import { speechCtor, type SR } from "@/lib/speech";
import {
  askMaraiti, decideAction, friendlyError, maraitiActions, maraitiMessages, maraitiSeen, maraitiTasks, reminderDone,
  type ActionKind, type MaraitiAction, type MaraitiMessage, type MaraitiTask,
} from "@/lib/db/maraiti";

const card = { borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH } as const;
const POLL = 25000;

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

function describe(t: MaraitiTask): { icon: string; line: string; sub: string } {
  switch (t.kind) {
    case "consult_today": return { icon: "cal", line: `استشارة ${t.title}`, sub: `الساعة ${t.at ? clock(t.at) : ""} · ${t.detail === "intake_done" ? "عبّأت النموذج" : "لم تعبّئ النموذج بعد"}` };
    case "written": return { icon: "msg", line: `استشارة مكتوبة من ${t.title}`, sub: timeLeft(t.at) || "بانتظار ردّكِ" };
    case "mira": return { icon: "msg", line: `ميرا حوّلت لكِ ${t.title}`, sub: t.detail ?? "" };
    case "note_missing": return { icon: "star", line: `ملاحظة جلسة ${t.title}`, sub: "لم تُكتب بعد — أمليها هنا" };
    case "intake_review": return { icon: "users", line: `نموذج ${t.title}`, sub: "لم تطّلعي عليه بعد" };
    default: return { icon: "sparkle", line: t.title, sub: t.detail && t.detail !== t.title ? t.detail : "تذكير" };
  }
}
/** What tapping a task asks Maraiti (she stays in the chat). */
const taskPrompt = (t: MaraitiTask): string | null => ({
  consult_today: `لخّصيلي ${t.title} قبل استشارتها`,
  written: `ورجيني استشارة ${t.title} المكتوبة`,
  mira: `شو كتبتلي ${t.title}؟`,
  note_missing: `بدي اكتب ملاحظة جلسة ${t.title}`,
  intake_review: `ورجيني نموذج ${t.title}`,
} as Record<string, string>)[t.kind] ?? null;

export default function MaraitiPage() {
  const { staff } = useSession();
  const ok = !!staff?.is_consultant;
  const tasks = useQuery(["maraiti", "tasks"], maraitiTasks, { enabled: ok });
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ text: string; n: number } | null>(null);
  useEffect(() => { if (!ok) return; const x = setInterval(() => tasks.refresh(), 60000); return () => clearInterval(x); }, [ok, tasks]);
  const n = tasks.data?.length ?? 0;

  return (
    <AdminShell active="مرايتي" title="مرايتي" subtitle={`${arDate(new Date())} · الآن ${clock()} بتوقيت دمشق`}>
      {!staff ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 980 }}>
          <div style={{ ...DARK, borderRadius: 28, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <div style={{ fontSize: 21, fontWeight: 700, fontFamily: "var(--font-display, 'El Messiri')" }}>{greeting()} يا {firstName(staff.name)} 🌸</div>
              <div style={{ fontSize: 14, color: "#F2E6F4", lineHeight: 1.8 }}>
                {tasks.loading ? "عم جهّزلكِ مهامكِ…" : n === 0 ? "ما في شي بانتظاركِ الآن." : `عندكِ ${n} ${n === 1 ? "مهمّة" : "مهام"} الآن.`}
              </div>
            </div>
            {n > 0 && (
              <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
                style={{ height: 42, padding: "0 16px", borderRadius: 21, border: "1px solid rgba(255,255,255,0.45)", background: "transparent", color: "#fff", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {open ? "إخفاء المهام" : "عرض المهام"}
                <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : undefined }}><Icon name="down" size={16} color="#fff" /></span>
              </button>
            )}
          </div>
          {open && <TaskList tasks={tasks.data} loading={tasks.loading} error={tasks.error} onAsk={(t) => setPrefill({ text: t, n: Date.now() })} />}
          <Chat prefill={prefill} />
        </div>
      )}
    </AdminShell>
  );
}

function TaskList({ tasks, loading, error, onAsk }: { tasks?: MaraitiTask[]; loading: boolean; error?: string; onAsk: (t: string) => void }) {
  const [busy, setBusy] = useState("");
  return (
    <section style={{ ...card, padding: "12px 14px" }}>
      {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : !tasks?.length ? (
        <div style={{ fontSize: 14, color: C.sub, padding: "6px 2px" }}>كل شي منجز ✓</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => {
            const d = describe(t);
            const ask = taskPrompt(t);
            return (
              <div key={`${t.kind}-${t.ref_id}`} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "8px 12px", borderRadius: 18, background: t.urgent ? "#FBEFF5" : "#FBF8FC", border: `1px solid ${t.urgent ? "#F2C9DA" : "#F0E6F3"}` }}>
                <span style={{ width: 36, height: 36, borderRadius: 18, background: "#F3E9F7", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={d.icon} size={17} color={t.urgent ? "#B03D6A" : C.accent} />
                </span>
                <div style={{ flex: "1 1 200px", minWidth: 0, lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{d.line}{t.urgent && <Tag kind="pink">عاجل</Tag>}</div>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>{d.sub}</div>
                </div>
                {ask ? (
                  <button type="button" onClick={() => onAsk(ask)} style={{ height: 38, padding: "0 14px", borderRadius: 19, border: "none", ...SELECTED, fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>اسألي مرايتي</button>
                ) : (
                  <button type="button" disabled={busy === t.ref_id} onClick={async () => { setBusy(t.ref_id); try { await reminderDone(t.ref_id); } finally { setBusy(""); } }}
                    style={{ height: 38, padding: "0 14px", borderRadius: 19, border: "none", ...SELECTED, fontSize: 13.5, fontWeight: 600, flexShrink: 0, opacity: busy === t.ref_id ? 0.6 : 1 }}>تمّ</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

type Item = { at: string; m?: MaraitiMessage; a?: MaraitiAction };
type ReplyTarget = { kind: NonNullable<MaraitiMessage["kind"]>; payload: MaraitiMessage["payload"]; name: string };

function Chat({ prefill }: { prefill: { text: string; n: number } | null }) {
  const msgs = useQuery(["maraiti", "messages"], maraitiMessages);
  const acts = useQuery(["maraiti", "actions"], maraitiActions);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState("");
  const [offline, setOffline] = useState(false);
  const [err, setErr] = useState("");
  const [listening, setListening] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const sr = useRef<SR | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => { sr.current?.stop(); }, []);
  useEffect(() => {
    const x = setInterval(() => { msgs.refresh(); acts.refresh(); }, POLL);
    return () => clearInterval(x);
  }, [msgs, acts]);
  useEffect(() => { if (prefill) { setText(prefill.text); input.current?.focus(); } }, [prefill]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = (msgs.data ?? []).map((m) => ({ at: m.created_at, m }));
    for (const a of acts.data ?? []) if (a.status === "pending") out.push({ at: a.created_at, a });
    return out.sort((x, y) => x.at.localeCompare(y.at));
  }, [msgs.data, acts.data]);
  const unseen = (msgs.data ?? []).some((m) => m.role === "assistant" && !m.seen_at);
  useEffect(() => { if (unseen) void maraitiSeen(); }, [unseen]);
  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; }, [items.length, sending, pending]);

  const recent = (acts.data ?? []).filter((a) => a.status !== "pending").slice(0, 3);
  const cards = (msgs.data ?? []).filter((m) => m.kind);

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
    // the message leaves the box at once and shows as her bubble while Maraiti answers
    const rt = replyTo;
    setSending(true); setErr(""); setPending(t); setText(""); setReplyTo(null);
    const r = await askMaraiti(t, { replyTo: rt ? { kind: rt.kind, payload: rt.payload } : null, context: cards.slice(-4) });
    setSending(false); setPending("");
    if (r === "offline" || r === "error") { setText(t); setReplyTo(rt); }
    if (r === "offline") setOffline(true);
    else { setOffline(false); if (r === "error") setErr("ما قدرت جاوبكِ هلّق. جرّبي بعد شوي."); }
  }

  function startReply(m: MaraitiMessage) {
    setReplyTo({ kind: m.kind!, payload: m.payload, name: m.payload.patient_name ?? "العميلة" });
    input.current?.focus();
  }

  return (
    <section style={{ ...card, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div ref={box} style={{ height: "min(62dvh, 640px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: 2 }}>
        {msgs.loading ? <Loading /> : !items.length ? (
          <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.9 }}>
            اسأليني عن أي شي: جدولكِ أو جدول أي حدا، ملف عميلة، المالية، المخزون… أو اطلبي حجز، إلغاء، ملاحظة جلسة، رد على عميلة. أنا بجهّز، وإنتِ بتوافقي.
          </div>
        ) : items.map((it) => it.a ? <DraftCard key={it.a.id} a={it.a} />
          : it.m!.kind ? <ProactiveCard key={it.m!.id} m={it.m!} onReply={startReply} active={replyTo?.payload === it.m!.payload} />
          : <Bubble key={it.m!.id} m={it.m!} />)}
        {pending && <div style={{ alignSelf: "flex-start", maxWidth: "80%", padding: "10px 14px", borderRadius: 20, fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap", ...SELECTED }}>{pending}</div>}
        {sending && <div style={{ alignSelf: "flex-end", fontSize: 13, color: C.sub2, padding: "6px 10px" }}>مرايتي عم تكتب…</div>}
      </div>

      {recent.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {recent.map((a) => (
            <div key={a.id} style={{ fontSize: 12.5, color: a.status === "failed" ? C.danger : C.sub2 }}>
              {a.status === "approved" ? "✓" : a.status === "failed" ? "!" : "–"} {a.title} · {a.status === "approved" ? a.result : a.status === "failed" ? friendlyError(a.result) : "تجاهلتِها"}
            </div>
          ))}
        </div>
      )}
      {offline && <div style={{ borderRadius: 18, padding: "10px 14px", background: "#FBF4E8", color: "#8A5A12", fontSize: 14 }}>مرايتي ستكون جاهزة للمحادثة قريباً 🌸</div>}
      {err && <ErrorNote>{err}</ErrorNote>}

      {replyTo && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 12px", borderRadius: 18, background: "#F3E9F7", fontSize: 13.5, color: C.accent, fontWeight: 600 }}>
          <Icon name="msg" size={16} color={C.accent} />
          <span style={{ flex: 1, minWidth: 0 }}>{replyTo.kind === "written_paid" ? `ردّكِ على استشارة ${replyTo.name} المكتوبة` : `ردّكِ على ${replyTo.name}`} — اكتبي أو أملي، وبجهّزلكِ ياه للموافقة</span>
          <button type="button" onClick={() => setReplyTo(null)} aria-label="إلغاء الرد" style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="x" size={14} color={C.sub} />
          </button>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={4000}
          placeholder={replyTo ? "ردّكِ للعميلة…" : "اكتبي أو أملي لمرايتي…"}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          style={{ flex: "1 1 260px", minWidth: 0, borderRadius: 18, border: "1px solid #EADCF0", background: "#FDFAFE", padding: "10px 14px", fontSize: 14.5, lineHeight: 1.8, resize: "none", fontFamily: "inherit", color: C.ink }} />
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={dictate} aria-label="إملاء صوتي" title="إملاء صوتي"
            style={{ width: 50, height: 50, borderRadius: 25, border: listening ? "none" : "1px solid #EADCF0", background: listening ? "#B03D6A" : C.white, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mic" size={20} color={listening ? "#fff" : C.accent} />
          </button>
          <SubmitButton onClick={send} disabled={sending || !text.trim()}>{replyTo ? "جهّزي الرد" : "أرسلي"}</SubmitButton>
        </div>
      </div>
    </section>
  );
}

function Bubble({ m }: { m: MaraitiMessage }) {
  const mine = m.role === "user";
  return (
    <div style={{ alignSelf: mine ? "flex-start" : "flex-end", maxWidth: "80%", padding: "10px 14px", borderRadius: 20, fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap",
      ...(mine ? SELECTED : { background: "#FBF8FC", border: "1px solid #F0E6F3", color: C.ink }) }}>
      {m.body}
      <div className="latin" style={{ fontSize: 11, color: C.sub2, marginTop: 2 }}>{clock(m.created_at)}</div>
    </div>
  );
}

const CARD_META: Record<NonNullable<MaraitiMessage["kind"]>, { icon: string; label: string; tone: "plum" | "pink" | "lilac" }> = {
  digest: { icon: "sun", label: "يومكِ", tone: "lilac" },
  pre_appt: { icon: "users", label: "قبل الموعد", tone: "plum" },
  client_chat: { icon: "msg", label: "محادثة عميلة", tone: "pink" },
  written_paid: { icon: "msg", label: "استشارة مكتوبة", tone: "pink" },
  intake: { icon: "star", label: "نموذج ما قبل الاستشارة", tone: "plum" },
  reminder: { icon: "sparkle", label: "تذكير", tone: "lilac" },
};

/** Summary / alert cards Maraiti posts on her own (migration 0181). */
function ProactiveCard({ m, onReply, active }: { m: MaraitiMessage; onReply: (m: MaraitiMessage) => void; active: boolean }) {
  const meta = CARD_META[m.kind!] ?? CARD_META.digest;
  const p = m.payload ?? {};
  const [title, ...rest] = m.body.split("\n");
  const alert = m.kind === "client_chat" || m.kind === "written_paid";
  const [done, setDone] = useState(false);
  const qa = m.kind === "written_paid" && p.intake && typeof p.intake === "object"
    ? Object.entries(p.intake as Record<string, unknown>).filter(([, v]) => v !== null && v !== "" && typeof v !== "object").slice(0, 8) : [];
  return (
    <div style={{ alignSelf: "stretch", borderRadius: 22, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8,
      background: alert ? "#FDF4F8" : "#FBF8FC", border: `1px solid ${p.urgent ? "#E9A9C4" : alert ? "#F2C9DA" : "#EADCF0"}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={meta.icon} size={15} color={alert ? "#B03D6A" : C.accent} />
        </span>
        <Tag kind={meta.tone}>{meta.label}</Tag>
        <span className="latin" style={{ fontSize: 11.5, color: C.sub2, marginInlineStart: "auto" }}>{clock(m.created_at)}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.7 }}>{title}</div>
      {rest.length > 0 && <div style={{ fontSize: 13.5, lineHeight: 1.85, whiteSpace: "pre-wrap", color: C.ink }}>{rest.join("\n")}</div>}
      {p.brief && <div style={{ fontSize: 13, lineHeight: 1.85, whiteSpace: "pre-wrap", color: C.sub, borderTop: "1px dashed #EADCF0", paddingTop: 6 }}>{p.brief}</div>}
      {qa.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13.5, lineHeight: 1.75 }}>
          {qa.map(([k, v]) => <div key={k}><span style={{ color: C.sub2 }}>{k}: </span>{String(v)}</div>)}
          {!!p.photos && <div style={{ color: C.sub2 }}>{p.photos} صور مرفقة</div>}
        </div>
      )}
      {m.kind === "client_chat" && (p.messages?.length ?? 0) > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: 8, borderRadius: 16, background: C.white }}>
          {p.messages!.map((x, i) => (
            <div key={i} style={{ alignSelf: x.from === "patient" ? "flex-start" : "flex-end", maxWidth: "85%", padding: "6px 10px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.7,
              background: x.from === "patient" ? "#F6EEF8" : "#FBF8FC", border: x.from === "patient" ? "none" : "1px solid #F0E6F3" }}>
              <span style={{ fontSize: 11, color: C.sub2, display: "block" }}>{x.from === "patient" ? p.patient_name ?? "العميلة" : x.from === "mira" ? "ميرا" : "أنتِ"} · <span className="latin">{clock(x.at)}</span></span>
              {x.body}
            </div>
          ))}
        </div>
      )}
      {alert && (p.patient_id || p.written_consult_id) && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => onReply(m)}
            style={{ height: 42, padding: "0 18px", borderRadius: 21, border: "none", ...(active ? DARK : SELECTED), fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="msg" size={15} color={active ? "#fff" : C.accent} />ردّي هنا
          </button>
        </div>
      )}
      {m.kind === "reminder" && p.action_id && !done && (
        <div><GhostButton onClick={async () => { await reminderDone(p.action_id!); setDone(true); }}>تمّ</GhostButton></div>
      )}
    </div>
  );
}

const KIND_LABEL: Record<ActionKind, string> = {
  book_appointment: "حجز موعد", reschedule: "نقل موعد", cancel_appointment: "إلغاء موعد", send_client_message: "رسالة لعميلة",
  reply_mira_thread: "رد على عميلة", reply_written_consult: "رد استشارة مكتوبة", write_session_note: "ملاحظة جلسة",
  add_patient: "ملف جديد", mark_intake_reviewed: "اطّلاع على نموذج", remind_me: "تذكير لكِ",
};
const TEXT_KINDS: ActionKind[] = ["send_client_message", "reply_mira_thread", "reply_written_consult", "write_session_note", "remind_me"];
const WHEN_KINDS: ActionKind[] = ["book_appointment", "reschedule", "remind_me"];

const toLocal = (iso?: string) => {
  if (!iso) return { day: dayKey(), time: "10:00" };
  const d = new Date(iso);
  return { day: dayKey(d), time: clock(d) };
};

/** Draft waiting for «موافقة». «تعديل» opens the text / time inline; nothing runs before she approves. */
function DraftCard({ a }: { a: MaraitiAction }) {
  const p = a.payload ?? {};
  const hasText = TEXT_KINDS.includes(a.kind);
  const hasWhen = WHEN_KINDS.includes(a.kind);
  const init = toLocal(a.kind === "remind_me" ? p.at : p.starts_at);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(false);
  const [txt, setTxt] = useState(p.text ?? "");
  const [name, setName] = useState(p.name ?? "");
  const [phone, setPhone] = useState(p.phone ?? "");
  const [day, setDay] = useState(init.day);
  const [time, setTime] = useState(init.time);

  async function go(decision: "approve" | "dismiss") {
    setBusy(decision); setErr("");
    let payload: Record<string, string> | undefined;
    if (decision === "approve" && edit) {
      payload = { ...p };
      if (hasText) payload.text = txt.trim();
      if (a.kind === "add_patient") { payload.name = name.trim(); payload.phone = phone.trim(); }
      const when = `${day}T${time}:00+03:00`;
      if (a.kind === "remind_me") payload.at = when; else if (hasWhen) payload.starts_at = when;
    }
    try {
      const r = await decideAction(a.id, decision, payload);
      if (r.status === "failed") setErr(friendlyError(r.result));
    } catch (e) { setErr(e instanceof Error ? friendlyError(e.message) : "تعذّر التنفيذ."); }
    finally { setBusy(""); }
  }

  const field = { height: 44, borderRadius: 16, border: "1px solid #EADCF0", padding: "0 12px", fontSize: 14.5, fontFamily: "inherit", background: C.white, color: C.ink, minWidth: 0 } as const;
  return (
    <div style={{ alignSelf: "stretch", borderRadius: 22, padding: "12px 14px", background: "#FFFFFF", border: "1.5px solid #D9BFE3", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Tag kind="plum">{KIND_LABEL[a.kind] ?? a.kind}</Tag>
        <b style={{ fontSize: 14.5, lineHeight: 1.6 }}>{a.title}</b>
        <span style={{ fontSize: 12, color: C.sub2, marginInlineStart: "auto" }}>بانتظار موافقتكِ</span>
      </div>
      {edit ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hasText && <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={4} maxLength={4000}
            style={{ ...field, height: "auto", padding: "10px 12px", lineHeight: 1.8, resize: "vertical" }} />}
          {a.kind === "add_patient" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" style={{ ...field, flex: "1 1 180px" }} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="الهاتف" className="latin" style={{ ...field, flex: "1 1 140px" }} />
            </div>
          )}
          {hasWhen && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="latin" style={{ ...field, flex: "1 1 150px" }} aria-label="اليوم" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="latin" style={{ ...field, flex: "1 1 110px" }} aria-label="الساعة (دمشق)" />
            </div>
          )}
        </div>
      ) : (
        <>
          {hasText && p.text && <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", color: C.ink, background: "#FBF8FC", borderRadius: 14, padding: "8px 12px" }}>{p.text}</div>}
          {a.kind === "add_patient" && <div style={{ fontSize: 14 }}>{p.name}{p.phone ? <span className="latin"> · {p.phone}</span> : null}</div>}
          {a.kind === "cancel_appointment" && p.reason && <div style={{ fontSize: 13.5, color: C.sub }}>السبب: {p.reason}</div>}
        </>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SubmitButton onClick={() => go("approve")} busy={busy === "approve"} disabled={!!busy || (edit && hasText && !txt.trim())} style={{ height: 44 }}>{edit ? "حفظ وموافقة" : "موافقة"}</SubmitButton>
        {(hasText || hasWhen || a.kind === "add_patient") && <GhostButton onClick={() => setEdit((v) => !v)}>{edit ? "إلغاء التعديل" : "تعديل"}</GhostButton>}
        <GhostButton onClick={() => go("dismiss")} color={C.sub}>تجاهل</GhostButton>
      </div>
    </div>
  );
}
