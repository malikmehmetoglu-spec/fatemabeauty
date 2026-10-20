"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhoneScreen } from "@/components/shell";
import { Chip, EmptyState, ErrorNote, Icon, IconButton, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, clock, dayKey } from "@/lib/format";
import { listMessages, sendMessage, subscribeMessages, type Message } from "@/lib/db/consult";
import { askLogin, GuestCard } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, DARK, GLASS, ICON_FILL } from "@/lib/tokens";

type Msg = { me: boolean; time: string; text: string; day: string };
const QUICK = ["متى أستطيع وضع المكياج؟", "عندي سؤال عن موعدي"];
const toMsg = (m: Message): Msg => ({ me: m.from_patient, time: clock(m.created_at), text: m.body, day: dayKey(new Date(m.created_at)) });

const bubble = (m: Msg): CSSProperties => ({
  maxWidth: 260, padding: "10px 14px 7px", fontSize: 13.5, lineHeight: 1.55,
  ...(m.me
    ? { color: C.white, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg,#784883 0%,#7B4687 60%,#4A2952 100%)", boxShadow: "0 10px 22px rgba(123,70,135,0.25)", borderRadius: "22px 22px 22px 8px" }
    : { color: C.ink, background: C.white, border: `1px solid ${C.borderSoft}`, boxShadow: "0 8px 20px rgba(123,70,135,0.08)", borderRadius: "22px 22px 8px 22px" }),
});

/** P_Chat.dc.html — chat with the centre team (messages table, live via Realtime). */
export default function ChatPage() {
  const { patient, guest, loading: sLoading } = useRequirePatient();
  const [rows, setRows] = useState<Message[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!patient) return;
    let alive = true;
    listMessages(patient.id).then((r) => { if (alive) setRows(r); }).catch((e) => setErr(String(e?.message ?? e)));
    const off = subscribeMessages(patient.id, (m) => setRows((cur) => (cur && !cur.some((x) => x.id === m.id) ? [...cur, m] : cur)));
    return () => { alive = false; off(); };
  }, [patient]);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [rows]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    if (!patient) { askLogin({ text: "سجّلي الدخول لتصل رسالتكِ إلى فريق المركز ويردّ عليكِ هنا." }); return; }
    setBusy(true); setErr(null);
    try { await sendMessage(patient.id, text); setDraft(""); setRows(await listMessages(patient.id)); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  const msgs = (rows ?? []).map(toMsg);
  const quick = msgs.length === 0 ? QUICK : [];

  return (
    <PhoneScreen style={{ height: "100dvh" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <IconButton icon="back" label="رجوع" href={R.Main} />
        <div style={{ ...GLASS, flexGrow: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, height: 56, borderRadius: 28, padding: "0 6px 0 14px", boxShadow: "0 8px 20px rgba(123,70,135,0.08)" }}>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="msg" size={20} /></span>
          <div style={{ lineHeight: 1.3 }}>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>فريق المركز</h1>
            <div style={{ fontSize: 11.5, color: C.sub2 }}>نرد عليكِ خلال ساعات العمل</div>
          </div>
        </div>
        <IconButton icon="cam" label="استشارة أونلاين" href={R.Consult} />
      </header>

      {err && <ErrorNote>{err}</ErrorNote>}
      <div ref={logRef} role="log" aria-label="المحادثة" style={{ flexGrow: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, margin: "0 -20px", padding: "0 20px 10px" }}>
        {guest ? <GuestCard icon="msg" what="محادثتكِ مع فريق المركز" style={{ marginTop: "auto" }} /> : (sLoading || !patient || rows === null) && !err ? <Loading style={{ marginTop: "auto" }} /> : msgs.length === 0 ? (
          <EmptyState compact icon="msg" title="لا توجد رسائل بعد" text="اكتبي سؤالكِ عن بشرتكِ أو موعدكِ، وسيرد عليكِ فريق المركز هنا." style={{ marginTop: "auto" }} />
        ) : <div style={{ marginTop: "auto" }} />}
        {msgs.map((m, i) => {
          const next = msgs[i + 1];
          const lastOfGroup = !next || next.me !== m.me;
          const newDay = i === 0 || msgs[i - 1].day !== m.day;
          return (
            <div key={i} style={{ display: "contents" }}>
            {newDay && (
              <div style={{ alignSelf: "center", height: 26, padding: "0 12px", borderRadius: 13, background: "rgba(255,255,255,0.7)", fontSize: 11.5, color: C.sub2, display: "flex", alignItems: "center", margin: "4px 0", flexShrink: 0 }}>
                {m.day === dayKey() ? "اليوم · " : ""}{arDate(new Date(`${m.day}T12:00:00+03:00`))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, justifyContent: m.me ? "flex-end" : undefined, flexShrink: 0 }}>
              {!m.me && (lastOfGroup ? <span style={{ width: 30, height: 30, borderRadius: 15, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="sparkle" size={15} /></span> : <span style={{ width: 30, flexShrink: 0 }} />)}
              <div style={bubble(m)}>
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                <div style={{ fontSize: 10.5, marginTop: 2, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", color: m.me ? C.onDark : C.muted }}>
                  {m.time}
                  {m.me && <Icon name="M2 12l5 5L17 7M12 15l2 2 8-10" color="#E8D6F0" size={14} stroke={2} />}
                </div>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {quick.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {quick.map((t) => (
            <Chip key={t} height={34} onClick={() => send(t)} style={{ fontSize: 12.5 }}>{t}</Chip>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(draft); }} style={{
        display: "flex", alignItems: "center", gap: 8, height: 60, borderRadius: 30, padding: "0 7px 0 7px", paddingRight: 18, background: "rgba(255,255,255,0.85)",
        border: "1px solid #FFFFFF", boxShadow: "0 12px 28px rgba(123,70,135,0.12)", flexShrink: 0,
      }}>
        <input aria-label="رسالتكِ" type="text" maxLength={2000} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="اكتبي رسالتكِ…" style={{
          flexGrow: 1, minWidth: 0, height: 44, border: "none", background: "transparent", fontSize: 14, color: C.ink, outline: "none",
        }} />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="إرسال" style={{ opacity: busy || !draft.trim() ? 0.6 : 1, ...DARK, width: 46, height: 46, borderRadius: 23, border: "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="send" color="#FFFFFF" size={19} stroke={1.9} />
        </button>
      </form>
    </PhoneScreen>
  );
}
