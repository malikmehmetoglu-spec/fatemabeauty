"use client";

/**
 * «مرايتي» — Fatema's personal assistant (consultant only: staff.is_consultant; owner/admin are NOT allowed).
 * Chat-first, full-height app: compact greeting header (+ «السجل» sheet), collapsible task chips, one scrolling timeline
 * (her messages, Maraiti's replies, proactive cards composed in SQL — migration 0181 — draft cards that execute ONLY on
 * «موافقة», and executed/dismissed drafts collapsed into one status line where they happened), suggestions + composer
 * pinned to the bottom. Polls every 25 s.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, GhostButton, Icon, Loading, SubmitButton, Tag } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { arDate, clock, dayKey } from "@/lib/format";
import { useSession } from "@/lib/supabase/session";
import { C, DARK, SELECTED, SH } from "@/lib/tokens";
import { speechCtor, type SR } from "@/lib/speech";
import {
  askMaraiti, decideAction, friendlyError, maraitiActions, maraitiMessages, maraitiSeen, maraitiTasks, markDraftWhatsApp, reminderDone,
  sendDraftSms, whatsappLink, type ActionKind, type ActionPayload, type InvoiceLine, type MaraitiAction, type MaraitiMessage, type MaraitiTask,
} from "@/lib/db/maraiti";

const BRAND = "var(--font-messiri), 'El Messiri', var(--font-rubik), Rubik, serif";
const card = { borderRadius: 26, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH } as const;
const POLL = 25000;

/** Page-local CSS: thin themed scrollbars, entrance + typing animations (motion-safe), sheet placement. */
const CSS = `
.mr-root, .mr-root * { font-family: ${BRAND}; }
.mr-root .latin, .mr-root .latin * { font-family: var(--font-rubik), Rubik, sans-serif; }
.mr-scroll { scrollbar-width: thin; scrollbar-color: #D9BCE5 transparent; overscroll-behavior: contain; }
.mr-scroll::-webkit-scrollbar { display: block; width: 6px; height: 6px; }
.mr-scroll::-webkit-scrollbar-thumb { background: #D9BCE5; border-radius: 3px; }
.mr-scroll::-webkit-scrollbar-track { background: transparent; }
.mr-row { scrollbar-width: none; }
.mr-row::-webkit-scrollbar { display: none; }
@keyframes mrIn { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes mrDot { 0%, 80%, 100% { opacity: .3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-4px); } }
@keyframes mrPulse { 0% { box-shadow: 0 0 0 0 rgba(176,61,106,.45); } 100% { box-shadow: 0 0 0 12px rgba(176,61,106,0); } }
@keyframes mrSheet { from { transform: translateX(-100%); } to { transform: none; } }
@keyframes mrSheetUp { from { transform: translateY(100%); } to { transform: none; } }
@keyframes mrFade { from { opacity: 0; } to { opacity: 1; } }
.mr-in { animation: mrIn .32s cubic-bezier(.2,.8,.2,1) both; }
.mr-dot { width: 7px; height: 7px; border-radius: 4px; background: #7B4687; display: inline-block; animation: mrDot 1.1s infinite ease-in-out; }
.mr-dot:nth-child(2) { animation-delay: .15s; } .mr-dot:nth-child(3) { animation-delay: .3s; }
.mr-mic-on { animation: mrPulse 1.2s infinite; }
.mr-chip { transition: transform .15s ease, box-shadow .15s ease; }
.mr-chip:hover { transform: translateY(-1px); }
.mr-chip:active { transform: scale(.97); }
.mr-scrim { position: fixed; inset: 0; z-index: 80; background: rgba(60,30,70,.28); animation: mrFade .2s both; }
.mr-sheet { position: fixed; z-index: 81; top: 0; bottom: 0; left: 0; width: min(420px, 92vw); background: #fff; box-shadow: 0 20px 60px rgba(123,70,135,.28);
  border-radius: 0 28px 28px 0; display: flex; flex-direction: column; animation: mrSheet .26s cubic-bezier(.2,.8,.2,1) both; }
@media (max-width: 640px) {
  .mr-sheet { top: auto; left: 0; right: 0; width: auto; max-height: 78dvh; border-radius: 28px 28px 0 0; animation-name: mrSheetUp;
    padding-bottom: env(safe-area-inset-bottom, 0px); }
  .mr-hide-sm { display: none !important; }
}
@media (prefers-reduced-motion: reduce) {
  .mr-in, .mr-sheet, .mr-scrim, .mr-mic-on { animation: none !important; }
  .mr-dot { animation: none; opacity: .7; }
  .mr-chip { transition: none; }
}
`;

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
const GROUP_AR: Record<string, string> = { consult_today: "استشارات اليوم", written: "استشارات مكتوبة", mira: "من ميرا", note_missing: "ملاحظات جلسات", intake_review: "نماذج", reminder: "تذكيرات" };
/** What tapping a task asks Maraiti (she stays in the chat). */
const taskPrompt = (t: MaraitiTask): string | null => ({
  consult_today: `لخّصيلي ${t.title} قبل استشارتها`,
  written: `ورجيني استشارة ${t.title} المكتوبة`,
  mira: `شو كتبتلي ${t.title}؟`,
  note_missing: `بدي اكتب ملاحظة جلسة ${t.title}`,
  intake_review: `ورجيني نموذج ${t.title}`,
} as Record<string, string>)[t.kind] ?? null;

/** Quick suggestions above the composer: `fill` puts the text in the box (she completes it), otherwise it is sent. */
const SUGGEST: { text: string; fill?: boolean }[] = [
  { text: "شو عندي اليوم؟" }, { text: "مين بتستناني؟" }, { text: "لخّصيلي أسبوعي" }, { text: "احجزي موعد لـ ", fill: true },
];

/** Fits the page into the viewport under the shell's header (dvh-aware; recalculated on resize). */
function useFitHeight(el: HTMLDivElement | null) {
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!el) return;
    const calc = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const main = el.closest("main");
      const pb = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setH(Math.max(420, Math.floor(vh - top - pb)));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", calc);
    window.visualViewport?.addEventListener("resize", calc);
    return () => { ro.disconnect(); window.removeEventListener("resize", calc); window.visualViewport?.removeEventListener("resize", calc); };
  }, [el]);
  return h;
}

export default function MaraitiPage() {
  const { staff } = useSession();
  const ok = !!staff?.is_consultant;
  const tasks = useQuery(["maraiti", "tasks"], maraitiTasks, { enabled: ok });
  const acts = useQuery(["maraiti", "actions"], maraitiActions, { enabled: ok });
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState(false);
  const [prefill, setPrefill] = useState<{ text: string; n: number } | null>(null);
  useEffect(() => { if (!ok) return; const x = setInterval(() => tasks.refresh(), 60000); return () => clearInterval(x); }, [ok, tasks]);
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  const h = useFitHeight(wrap);
  const n = tasks.data?.length ?? 0;
  const history = (acts.data ?? []).filter((a) => a.status !== "pending");

  return (
    <AdminShell active="مرايتي" title="مرايتي" subtitle={`${arDate(new Date())} · الآن ${clock()} بتوقيت دمشق`}
      overlay={log ? <HistorySheet items={history} onClose={() => setLog(false)} /> : undefined}>
      <style>{CSS}</style>
      <div ref={setWrap} className="mr-root" style={{ height: h ?? "calc(100dvh - 200px)", minHeight: 0, display: "flex", flexDirection: "column", gap: 10, maxWidth: 980, width: "100%" }}>
        {!staff ? <Loading /> : (
          <>
            <div style={{ ...DARK, borderRadius: 24, padding: "10px 12px 10px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.5, fontFamily: BRAND, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{greeting()} يا {firstName(staff.name)} 🌸</div>
                <div style={{ fontSize: 13, color: "#F2E6F4", lineHeight: 1.6 }}>
                  {tasks.loading ? "عم جهّزلكِ مهامكِ…" : n === 0 ? "ما في شي بانتظاركِ الآن." : `عندكِ ${n} ${n === 1 ? "مهمّة" : "مهام"} الآن.`}
                </div>
              </div>
              <button type="button" onClick={() => setLog(true)} aria-label="السجل" title="سجل العمليات"
                style={{ height: 40, padding: "0 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.10)", color: "#fff", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <Icon name="history" size={16} color="#fff" />السجل
                {history.length > 0 && <span className="latin" style={{ fontSize: 11.5, minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", background: "rgba(255,255,255,0.22)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{history.length}</span>}
              </button>
            </div>
            {n > 0 && <TaskStrip tasks={tasks.data!} open={open} onToggle={() => setOpen((v) => !v)} onAsk={(t) => setPrefill({ text: t, n: Date.now() })} />}
            {tasks.error && <ErrorNote>{tasks.error}</ErrorNote>}
            <Chat prefill={prefill} acts={acts} />
          </>
        )}
      </div>
    </AdminShell>
  );
}

/** Compact, collapsible strip: grouped chips with counts; expanded = one chip per task (tap fills the composer). */
function TaskStrip({ tasks, open, onToggle, onAsk }: { tasks: MaraitiTask[]; open: boolean; onToggle: () => void; onAsk: (t: string) => void }) {
  const [busy, setBusy] = useState("");
  const [gone, setGone] = useState<string[]>([]);
  const list = tasks.filter((t) => !gone.includes(t.ref_id));
  const groups = useMemo(() => {
    const g = new Map<string, { n: number; urgent: boolean }>();
    for (const t of list) { const x = g.get(t.kind) ?? { n: 0, urgent: false }; x.n++; x.urgent ||= t.urgent; g.set(t.kind, x); }
    return [...g.entries()];
  }, [list]);
  const chip = { height: 34, padding: "0 12px", borderRadius: 17, fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, whiteSpace: "nowrap" } as const;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
      <div className="mr-row" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "2px 2px 4px" }}>
        <button type="button" onClick={onToggle} aria-expanded={open} className="mr-chip" style={{ ...chip, border: "none", ...(open ? DARK : SELECTED) }}>
          <Icon name="list" size={15} color={open ? "#fff" : C.accent} />مهامكِ <span className="latin">{list.length}</span>
          <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : undefined }}><Icon name="down" size={14} color={open ? "#fff" : C.accent} /></span>
        </button>
        {!open && groups.map(([k, g]) => (
          <button key={k} type="button" onClick={onToggle} className="mr-chip"
            style={{ ...chip, background: g.urgent ? "#FBEFF5" : C.white, border: `1px solid ${g.urgent ? "#F2C9DA" : "#EADCF0"}`, color: g.urgent ? "#B03D6A" : C.ink }}>
            {GROUP_AR[k] ?? "أخرى"}
            <span className="latin" style={{ minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", background: g.urgent ? "#D0679A" : "#F3E9F7", color: g.urgent ? "#fff" : C.accent, fontSize: 11.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{g.n}</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="mr-scroll mr-in" style={{ display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 132, overflowY: "auto", padding: 2 }}>
          {list.map((t) => {
            const d = describe(t);
            const ask = taskPrompt(t);
            return (
              <button key={`${t.kind}-${t.ref_id}`} type="button" disabled={busy === t.ref_id} className="mr-chip"
                title={ask ? `اضغطي لتعبئة: ${ask}` : "اضغطي عند الإنجاز"}
                onClick={async () => {
                  if (ask) { onAsk(ask); return; }
                  setBusy(t.ref_id); try { await reminderDone(t.ref_id); setGone((g) => [...g, t.ref_id]); } finally { setBusy(""); }
                }}
                style={{ minHeight: 40, maxWidth: "100%", padding: "4px 12px 4px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 8, textAlign: "start",
                  background: t.urgent ? "#FBEFF5" : "#FBF8FC", border: `1px solid ${t.urgent ? "#F2C9DA" : "#F0E6F3"}`, opacity: busy === t.ref_id ? 0.6 : 1 }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={ask ? d.icon : "check"} size={14} color={t.urgent ? "#B03D6A" : C.accent} />
                </span>
                <span style={{ minWidth: 0, lineHeight: 1.35 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.ink }}>{d.line}{t.urgent ? " · عاجل" : ""}</span>
                  {d.sub && <span style={{ display: "block", fontSize: 11.5, color: C.sub2 }}>{d.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Item = { at: string; m?: MaraitiMessage; a?: MaraitiAction };
type ReplyTarget = { kind: NonNullable<MaraitiMessage["kind"]>; payload: MaraitiMessage["payload"]; name: string };

function statusText(a: MaraitiAction) {
  return a.status === "approved" ? `✓ ${a.title}${a.result ? ` · ${a.result}` : ""}`
    : a.status === "failed" ? `! ${a.title} · ${friendlyError(a.result)}` : `– ${a.title} · تجاهلتِها`;
}

/** An executed / dismissed draft, collapsed into one small line where it happened. */
function StatusLine({ a }: { a: MaraitiAction }) {
  const c = a.status === "failed" ? C.danger : a.status === "approved" ? C.accent : C.sub2;
  return (
    <div className="mr-in" style={{ alignSelf: "center", maxWidth: "92%", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 14,
      background: a.status === "approved" ? "#F6EEF9" : a.status === "failed" ? "#FDF0F2" : "#F7F4F8", fontSize: 12.5, color: c, lineHeight: 1.6 }}>
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{statusText(a)}</span>
      <span className="latin" style={{ fontSize: 11, color: C.sub2, flexShrink: 0 }}>{clock(a.created_at)}</span>
    </div>
  );
}

function HistorySheet({ items, onClose }: { items: MaraitiAction[]; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  let last = "";
  return (
    <>
      <style>{CSS}</style>
      <div className="mr-scrim" onClick={onClose} />
      <aside className="mr-sheet mr-root" role="dialog" aria-modal="true" aria-label="سجل العمليات">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 18px 10px" }}>
          <Icon name="history" size={20} color={C.accent} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.ink }}>سجل العمليات</div>
            <div style={{ fontSize: 12.5, color: C.sub2 }}>كل ما وافقتِ عليه أو تجاهلتِه</div>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" style={{ width: 38, height: 38, borderRadius: 19, border: "none", background: "#F6EEF9", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="x" size={16} color={C.accent} />
          </button>
        </div>
        <div className="mr-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {!items.length ? <div style={{ fontSize: 14, color: C.sub, padding: "20px 0" }}>ما في عمليات بعد.</div> : items.map((a) => {
            const d = dayKey(new Date(a.created_at));
            const head = d !== last ? (last = d, <div key={`d-${a.id}`} style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginTop: 6 }}>{arDate(new Date(a.created_at))}</div>) : null;
            const tone = a.status === "approved" ? { bg: "#F6EEF9", c: C.accent, l: "تم" } : a.status === "failed" ? { bg: "#FDF0F2", c: C.danger, l: "فشل" } : { bg: "#F7F4F8", c: C.sub2, l: "تجاهلتِها" };
            return [head, (
              <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 18, background: "#FBF8FC", border: "1px solid #F0E6F3" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: tone.c, background: tone.bg, borderRadius: 10, padding: "2px 8px", flexShrink: 0, marginTop: 2 }}>{tone.l}</span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>{KIND_LABEL[a.kind] ?? a.kind}{a.status === "approved" && a.result ? ` · ${a.result}` : a.status === "failed" ? ` · ${friendlyError(a.result)}` : ""}</div>
                </div>
                <span className="latin" style={{ fontSize: 11.5, color: C.sub2, flexShrink: 0 }}>{clock(a.created_at)}</span>
              </div>
            )];
          })}
        </div>
      </aside>
    </>
  );
}

function Typing() {
  return (
    <div className="mr-in" role="status" aria-label="مرايتي عم تكتب" style={{ alignSelf: "flex-end", display: "inline-flex", gap: 5, alignItems: "center", padding: "12px 16px", borderRadius: 20, background: "#FBF8FC", border: "1px solid #F0E6F3" }}>
      <span className="mr-dot" /><span className="mr-dot" /><span className="mr-dot" />
    </div>
  );
}

function Chat({ prefill, acts }: { prefill: { text: string; n: number } | null; acts: ReturnType<typeof useQuery<MaraitiAction[]>> }) {
  const msgs = useQuery(["maraiti", "messages"], maraitiMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState("");
  const [offline, setOffline] = useState(false);
  const [err, setErr] = useState("");
  const [listening, setListening] = useState(false);
  const [noMic, setNoMic] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const sr = useRef<SR | null>(null);
  const box = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => { setNoMic(!speechCtor()); return () => { sr.current?.stop(); }; }, []);
  useEffect(() => {
    const x = setInterval(() => { msgs.refresh(); acts.refresh(); }, POLL);
    return () => clearInterval(x);
  }, [msgs, acts]);
  const focusEnd = useCallback(() => { const el = input.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, []);
  useEffect(() => { if (prefill) { setText(prefill.text); requestAnimationFrame(focusEnd); } }, [prefill, focusEnd]);
  // auto-grow the composer (1–5 lines)
  useEffect(() => { const el = input.current; if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 132)}px`; } }, [text]);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = (msgs.data ?? []).map((m) => ({ at: m.created_at, m }));
    for (const a of acts.data ?? []) out.push({ at: a.created_at, a });
    return out.sort((x, y) => x.at.localeCompare(y.at));
  }, [msgs.data, acts.data]);
  const unseen = (msgs.data ?? []).some((m) => m.role === "assistant" && !m.seen_at);
  useEffect(() => { if (unseen) void maraitiSeen(); }, [unseen]);
  useEffect(() => { const b = box.current; if (b) b.scrollTo({ top: b.scrollHeight, behavior: "smooth" }); }, [items.length, sending, pending, replyTo, err, offline]);

  const cards = (msgs.data ?? []).filter((m) => m.kind);

  function dictate() {
    setErr("");
    if (listening) { sr.current?.stop(); return; }
    const Ctor = speechCtor();
    if (!Ctor) { setNoMic(true); setErr("الإملاء الصوتي غير مدعوم على هذا المتصفح. اكتبي رسالتكِ."); return; }
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

  async function send(override?: string) {
    const t = (override ?? text).trim();
    if (!t || sending) return;
    sr.current?.stop();
    // the message leaves the box at once and shows as her bubble while Maraiti answers
    const rt = replyTo;
    const kept = override ? text : "";
    setSending(true); setErr(""); setPending(t); setText(kept); setReplyTo(null);
    const r = await askMaraiti(t, { replyTo: rt ? { kind: rt.kind, payload: rt.payload } : null, context: cards.slice(-4) });
    setSending(false); setPending("");
    if (r === "offline" || r === "error") { if (!override) setText(t); setReplyTo(rt); }
    if (r === "offline") setOffline(true);
    else { setOffline(false); if (r === "error") setErr("ما قدرت جاوبكِ هلّق. جرّبي بعد شوي."); }
  }

  function startReply(m: MaraitiMessage) {
    setReplyTo({ kind: m.kind!, payload: m.payload, name: m.payload.patient_name ?? "العميلة" });
    input.current?.focus();
  }

  const canSend = !sending && !!text.trim();
  return (
    <section style={{ ...card, flex: "1 1 auto", minHeight: 0, padding: "10px 10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div ref={box} className="mr-scroll" aria-live="polite" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 6px" }}>
        {msgs.loading ? <Loading /> : !items.length ? (
          <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.9, margin: "auto 0", textAlign: "center", padding: "0 12px" }}>
            اسأليني عن أي شي: جدولكِ أو جدول أي حدا، ملف عميلة، المالية، المخزون… أو اطلبي حجز، إلغاء، فاتورة، قبض دفعة، تثبيت طلب، تأكيد موعد، ملاحظة جلسة، رد على عميلة. أنا بجهّز، وإنتِ بتوافقي.
          </div>
        ) : items.map((it) => it.a ? (it.a.status === "pending" ? <DraftCard key={it.a.id} a={it.a} /> : <StatusLine key={it.a.id} a={it.a} />)
          : it.m!.kind ? <ProactiveCard key={it.m!.id} m={it.m!} onReply={startReply} active={replyTo?.payload === it.m!.payload} />
          : <Bubble key={it.m!.id} m={it.m!} />)}
        {pending && <div className="mr-in" style={{ alignSelf: "flex-start", maxWidth: "80%", padding: "10px 14px", borderRadius: "20px 20px 20px 6px", fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap", ...SELECTED }}>{pending}</div>}
        {sending && <Typing />}
        {offline && <div className="mr-in" style={{ borderRadius: 18, padding: "10px 14px", background: "#FBF4E8", color: "#8A5A12", fontSize: 14 }}>مرايتي ستكون جاهزة للمحادثة قريباً 🌸</div>}
        {err && <ErrorNote>{err}</ErrorNote>}
      </div>

      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F3EAF6", paddingTop: 8 }}>
        {replyTo ? (
          <div className="mr-in" style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 12px", borderRadius: 18, background: "#F3E9F7", fontSize: 13, color: C.accent, fontWeight: 600 }}>
            <Icon name="msg" size={16} color={C.accent} />
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.6 }}>{replyTo.kind === "written_paid" ? `ردّكِ على استشارة ${replyTo.name} المكتوبة` : `ردّكِ على ${replyTo.name}`}<span className="mr-hide-sm"> — اكتبي أو أملي، وبجهّزلكِ ياه للموافقة</span></span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label="إلغاء الرد" style={{ width: 30, height: 30, borderRadius: 15, border: "none", background: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="x" size={14} color={C.sub} />
            </button>
          </div>
        ) : (
          <div className="mr-row" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 2px 2px" }}>
            {SUGGEST.map((s) => (
              <button key={s.text} type="button" className="mr-chip" disabled={sending}
                onClick={() => { if (s.fill) { setText(s.text); requestAnimationFrame(focusEnd); } else void send(s.text); }}
                style={{ height: 34, padding: "0 14px", borderRadius: 17, border: "1px solid #EADCF0", background: "#FBF8FC", color: C.accent, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, opacity: sending ? 0.5 : 1 }}>
                {s.fill ? `${s.text.trim()}…` : s.text}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea ref={input} value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={4000}
            placeholder={listening ? "عم سمعكِ… احكي" : replyTo ? "ردّكِ للعميلة…" : "اكتبي أو أملي لمرايتي…"}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }}
            className="mr-scroll"
            style={{ flex: "1 1 auto", minWidth: 0, minHeight: 48, borderRadius: 24, border: `1px solid ${listening ? "#E9A9C4" : "#EADCF0"}`, background: "#FDFAFE", padding: "11px 16px", fontSize: 14.5, lineHeight: 1.75, resize: "none", color: C.ink, outline: "none" }} />
          <button type="button" onClick={dictate} aria-pressed={listening} aria-label={listening ? "إيقاف الإملاء" : "إملاء صوتي"} title={noMic ? "الإملاء غير مدعوم على هذا المتصفح" : listening ? "إيقاف الإملاء" : "إملاء صوتي"}
            className={listening ? "mr-mic-on" : undefined}
            style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, border: listening ? "none" : "1px solid #EADCF0", background: listening ? "#B03D6A" : C.white, opacity: noMic ? 0.45 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={noMic ? "micoff" : "mic"} size={20} color={listening ? "#fff" : C.accent} />
          </button>
          <button type="button" onClick={() => void send()} disabled={!canSend} aria-label={replyTo ? "جهّزي الرد" : "أرسلي"} title={replyTo ? "جهّزي الرد" : "أرسلي (Enter)"}
            style={{ height: 48, minWidth: 48, padding: replyTo ? "0 16px" : 0, borderRadius: 24, flexShrink: 0, border: "none", ...(canSend ? DARK : { background: "#EFE6F3", color: "#B9A3C2" }),
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, fontWeight: 700, transition: "background .2s" }}>
            {replyTo && <span className="mr-hide-sm">جهّزي الرد</span>}
            <span style={{ display: "inline-flex", transform: "scaleX(-1)" }}><Icon name="send" size={19} color={canSend ? "#fff" : "#B9A3C2"} /></span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Bubble({ m }: { m: MaraitiMessage }) {
  const mine = m.role === "user";
  return (
    <div className="mr-in" style={{ alignSelf: mine ? "flex-start" : "flex-end", maxWidth: "82%", padding: "10px 14px", borderRadius: mine ? "20px 20px 20px 6px" : "20px 20px 6px 20px", fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap",
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
    <div className="mr-in" style={{ alignSelf: "stretch", borderRadius: 22, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8,
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
  create_invoice: "فاتورة", record_payment: "قبض دفعة", void_invoice: "إلغاء فاتورة", confirm_written_payment: "دفع استشارة مكتوبة",
  confirm_package_request: "تفعيل باقة", approve_booking: "تثبيت حجز", reject_booking: "رفض طلب حجز", set_appointment_status: "حالة الموعد",
  send_confirmation: "تأكيد للعميلة", update_patient: "تعديل ملف", set_service_level: "مستوى الخدمة", adjust_stock: "جرد مخزون",
};
const TEXT_KINDS: ActionKind[] = ["send_client_message", "reply_mira_thread", "reply_written_consult", "write_session_note", "remind_me", "send_confirmation"];
const WHEN_KINDS: ActionKind[] = ["book_appointment", "reschedule", "remind_me"];
const REASON_KINDS: ActionKind[] = ["cancel_appointment", "void_invoice", "reject_booking"];
const METHOD_KINDS: ActionKind[] = ["create_invoice", "record_payment", "confirm_written_payment", "confirm_package_request"];
const AMOUNT_KINDS: ActionKind[] = ["create_invoice", "record_payment"];
const MONEY_KINDS: ActionKind[] = ["create_invoice", "record_payment", "void_invoice", "confirm_written_payment", "confirm_package_request"];
const METHOD_AR: Record<string, string> = { cash: "نقداً", card: "بطاقة", package: "من الباقة", deferred: "آجل (دين)" };
const CHANNEL_AR: Record<string, string> = { app: "التطبيق", sms: "رسالة نصية", whatsapp: "واتساب" };
const FIELD_AR: Record<string, string> = { name: "الاسم", phone: "الهاتف", birth_date: "تاريخ الميلاد", skin_type: "نوع البشرة", pregnant: "حامل", breastfeeding: "مرضعة", vip: "VIP", notes: "ملاحظات الملف" };
const STATUS_AR: Record<string, string> = { checked_in: "وصلت", in_session: "بدء الجلسة", done: "انتهت الجلسة", no_show: "لم تحضر" };
const syp = (n: unknown) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} ل.س`;
const fieldVal = (v: unknown) => (typeof v === "boolean" ? (v ? "نعم" : "لا") : String(v ?? "") || "—");

const toLocal = (iso?: string) => {
  if (!iso) return { day: dayKey(), time: "10:00" };
  const d = new Date(iso);
  return { day: dayKey(d), time: clock(d) };
};

/** One label/value row inside a draft card (amounts in ل.س). */
function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.7 }}>
      <span style={{ color: C.sub2, flexShrink: 0 }}>{k}:</span>
      <span style={{ fontWeight: strong ? 700 : 500, minWidth: 0 }}>{v}</span>
    </div>
  );
}

/** Read-only details for each kind (what will happen on «موافقة»). */
function Details({ a }: { a: MaraitiAction }) {
  const p = a.payload ?? {};
  switch (a.kind) {
    case "create_invoice": {
      const lines = (p.lines ?? []) as InvoiceLine[];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "#FBF8FC", borderRadius: 14, padding: "8px 12px" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ flex: 1, minWidth: 0 }}>{l.label}{l.qty > 1 ? ` × ${l.qty}` : ""}</span>
              <span className="latin" style={{ flexShrink: 0 }}>{syp(l.qty * l.unit_price)}</span>
            </div>
          ))}
          {Number(p.discount_preview ?? p.discount) > 0 && <Row k={p.offer_code ? `خصم (${p.offer_code})` : "خصم"} v={`− ${syp(p.discount_preview ?? p.discount)}`} />}
          <Row k="الإجمالي" v={syp(p.total)} strong />
          <Row k="الدفع" v={p.method === "cash" || p.method === "card" ? `${METHOD_AR[p.method]} ${syp(p.amount)}${Number(p.amount) < Number(p.total) ? ` · المتبقي ${syp(Number(p.total) - Number(p.amount))}` : ""}` : METHOD_AR[p.method] ?? p.method} />
        </div>
      );
    }
    case "record_payment":
      return <div><Row k="المبلغ" v={`${syp(p.amount)} ${METHOD_AR[p.method] ?? ""}`} strong /><Row k="الفاتورة" v={`${p.invoice_no} · الإجمالي ${syp(p.total)} · المتبقي قبل الدفعة ${syp(p.remaining)}`} /></div>;
    case "void_invoice":
      return <div><Row k="الفاتورة" v={`${p.invoice_no} · ${syp(p.total)}`} strong />{p.reason && <Row k="السبب" v={p.reason} />}</div>;
    case "confirm_written_payment":
    case "confirm_package_request":
      return <div><Row k="المبلغ" v={`${syp(p.amount)} ${METHOD_AR[p.method] ?? ""}`} strong />{p.package_name && <Row k="الباقة" v={`${p.package_name} · ${p.sessions} جلسات`} />}</div>;
    case "reject_booking":
    case "cancel_appointment":
      return p.reason ? <Row k="السبب" v={p.reason} /> : null;
    case "set_appointment_status":
      return <Row k="الحالة الجديدة" v={STATUS_AR[p.status] ?? p.status} strong />;
    case "send_confirmation":
      return <Row k="القناة" v={`${CHANNEL_AR[p.channel] ?? p.channel}${p.channel !== "app" && p.phone ? ` · ${p.phone}` : ""}`} />;
    case "update_patient":
      return <div>{Object.entries((p.fields ?? {}) as Record<string, unknown>).map(([k, v]) => <Row key={k} k={FIELD_AR[k] ?? k} v={fieldVal(v)} />)}</div>;
    case "adjust_stock":
      return <Row k="الكمية" v={`${p.current} ← ${p.counted}`} strong />;
    case "add_patient":
      return <div style={{ fontSize: 14 }}>{p.name}{p.phone ? <span className="latin"> · {p.phone}</span> : null}</div>;
    default:
      return null;
  }
}

/** Draft waiting for «موافقة». «تعديل» opens the editable fields inline; nothing runs before she approves. */
function DraftCard({ a }: { a: MaraitiAction }) {
  const p = a.payload ?? {};
  const isConfirmApp = a.kind === "send_confirmation" && p.channel === "app";
  const hasText = TEXT_KINDS.includes(a.kind);
  const hasWhen = WHEN_KINDS.includes(a.kind);
  const hasReason = REASON_KINDS.includes(a.kind);
  const hasMethod = METHOD_KINDS.includes(a.kind);
  const hasAmount = AMOUNT_KINDS.includes(a.kind);
  const fieldsInit = (p.fields ?? {}) as Record<string, unknown>;
  const editable = hasText || hasWhen || hasReason || hasMethod || a.kind === "add_patient" || a.kind === "adjust_stock" || a.kind === "update_patient";
  const init = toLocal(a.kind === "remind_me" ? p.at : p.starts_at);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(false);
  const [txt, setTxt] = useState<string>(p.text ?? "");
  const [name, setName] = useState<string>(p.name ?? "");
  const [phone, setPhone] = useState<string>(p.phone ?? "");
  const [day, setDay] = useState(init.day);
  const [time, setTime] = useState(init.time);
  const [reason, setReason] = useState<string>(p.reason ?? "");
  const [method, setMethod] = useState<string>(p.method ?? "cash");
  const [amount, setAmount] = useState<string>(p.amount != null ? String(p.amount) : "");
  const [counted, setCounted] = useState<string>(p.counted != null ? String(p.counted) : "");
  const [fields, setFields] = useState<Record<string, string>>(Object.fromEntries(Object.entries(fieldsInit).map(([k, v]) => [k, typeof v === "boolean" ? (v ? "true" : "false") : String(v ?? "")])));
  const needsReason = (a.kind === "void_invoice") && !(edit ? reason : p.reason ?? "").trim();
  const methods = a.kind === "create_invoice" ? ["cash", "card", "package", "deferred"] : ["cash", "card"];

  async function go(decision: "approve" | "dismiss") {
    setBusy(decision); setErr(""); setNote("");
    let payload: ActionPayload | undefined;
    if (decision === "approve" && edit) {
      payload = { ...p };
      if (hasText) payload.text = txt.trim();
      if (a.kind === "add_patient") { payload.name = name.trim(); payload.phone = phone.trim(); }
      const when = `${day}T${time}:00+03:00`;
      if (a.kind === "remind_me") payload.at = when; else if (hasWhen) payload.starts_at = when;
      if (hasReason) payload.reason = reason.trim();
      if (hasMethod) payload.method = method;
      if (hasAmount) payload.amount = method === "cash" || method === "card" ? Math.max(0, Math.round(Number(amount) || 0)) : 0;
      if (a.kind === "adjust_stock") payload.counted = Number(counted);
      if (a.kind === "update_patient") payload.fields = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof fieldsInit[k] === "boolean" ? v === "true" : v]));
    }
    try {
      const r = await decideAction(a.id, decision, payload);
      if (r.status === "failed") setErr(friendlyError(r.result));
      else if (decision === "approve" && r.kind === "send_confirmation" && r.payload.client_send) {
        // SMS / WhatsApp leave the app only after her approval
        if (r.payload.channel === "sms") { await sendDraftSms(r); setNote("أُرسلت الرسالة النصية ✓"); }
        else {
          const link = whatsappLink(r);
          if (!link) setErr("لا يوجد رقم صالح للواتساب.");
          else { window.open(link, "_blank", "noopener"); await markDraftWhatsApp(r); }
        }
      }
    } catch (e) { setErr(e instanceof Error ? friendlyError(e.message) || e.message : "تعذّر التنفيذ."); }
    finally { setBusy(""); }
  }

  const field = { height: 44, borderRadius: 16, border: "1px solid #EADCF0", padding: "0 12px", fontSize: 14.5, fontFamily: "inherit", background: C.white, color: C.ink, minWidth: 0 } as const;
  const money = MONEY_KINDS.includes(a.kind);
  return (
    <div className="mr-in" style={{ alignSelf: "stretch", borderRadius: 22, padding: "12px 14px", background: "#FFFFFF", boxShadow: "0 8px 22px rgba(123,70,135,0.08)", border: `1.5px solid ${money ? "#C9A3D6" : "#D9BFE3"}`, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Tag kind={money ? "pink" : "plum"}>{KIND_LABEL[a.kind] ?? a.kind}</Tag>
        <b style={{ fontSize: 14.5, lineHeight: 1.6 }}>{a.title}</b>
        <span style={{ fontSize: 12, color: C.sub2, marginInlineStart: "auto" }}>بانتظار موافقتكِ</span>
      </div>
      {edit ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {a.kind === "create_invoice" && <Details a={a} />}
          {hasText && <textarea value={txt} onChange={(e) => setTxt(e.target.value)} rows={4} maxLength={4000}
            placeholder={isConfirmApp ? "اتركيه فارغاً للنص المعتاد" : undefined}
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
          {hasReason && <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="السبب" style={field} />}
          {hasMethod && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ ...field, flex: "1 1 140px" }} aria-label="طريقة الدفع">
                {methods.map((m) => <option key={m} value={m}>{METHOD_AR[m]}</option>)}
              </select>
              {hasAmount && (method === "cash" || method === "card") && (
                <label style={{ display: "flex", gap: 6, alignItems: "center", flex: "1 1 160px" }}>
                  <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="latin" style={{ ...field, flex: 1 }} aria-label="المبلغ المقبوض" />
                  <span style={{ fontSize: 13.5, color: C.sub }}>ل.س</span>
                </label>
              )}
            </div>
          )}
          {a.kind === "adjust_stock" && <input type="number" min={0} value={counted} onChange={(e) => setCounted(e.target.value)} className="latin" style={field} aria-label="الكمية المعدودة" />}
          {a.kind === "update_patient" && Object.keys(fields).map((k) => typeof fieldsInit[k] === "boolean" ? (
            <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
              <span style={{ color: C.sub2, minWidth: 90 }}>{FIELD_AR[k] ?? k}</span>
              <select value={fields[k]} onChange={(e) => setFields((f) => ({ ...f, [k]: e.target.value }))} style={{ ...field, flex: 1 }}>
                <option value="true">نعم</option><option value="false">لا</option>
              </select>
            </label>
          ) : (
            <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
              <span style={{ color: C.sub2, minWidth: 90 }}>{FIELD_AR[k] ?? k}</span>
              <input value={fields[k]} onChange={(e) => setFields((f) => ({ ...f, [k]: e.target.value }))} style={{ ...field, flex: 1 }} />
            </label>
          ))}
        </div>
      ) : (
        <>
          {hasText && p.text && <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", color: C.ink, background: "#FBF8FC", borderRadius: 14, padding: "8px 12px" }}>{p.text}</div>}
          <Details a={a} />
        </>
      )}
      {note && <div style={{ fontSize: 13.5, color: C.sub }}>{note}</div>}
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <SubmitButton onClick={() => go("approve")} busy={busy === "approve"}
          disabled={!!busy || (edit && hasText && !isConfirmApp && !txt.trim()) || needsReason} style={{ height: 44 }}>{edit ? "حفظ وموافقة" : "موافقة"}</SubmitButton>
        {editable && <GhostButton onClick={() => setEdit((v) => !v)}>{edit ? "إلغاء التعديل" : needsReason ? "أضيفي السبب" : "تعديل"}</GhostButton>}
        <GhostButton onClick={() => go("dismiss")} color={C.sub}>تجاهل</GhostButton>
      </div>
    </div>
  );
}
