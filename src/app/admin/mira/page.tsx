"use client";

/** «ميرا» — the AI assistant's desk: conversations handed to Fatema, drafts to approve, her answers, and settings. */
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, EmptyState, ErrorNote, Icon, Loading, SubmitButton, Tag } from "@/components/ui";
import { arDate, clock } from "@/lib/format";
import { revalidate, useQuery } from "@/lib/db/query";
import { listInbox, markRead, staffReply, subscribeInbox, type InboxMsg } from "@/lib/db/consult";
import {
  alertsOnThisDevice, alertsSupported, disableAlerts, enableAlerts, listStaffBasic, sendTestAlert,
  deleteKb, discardDraft, getMiraConfig, listKb, listPendingDrafts, listThreads, returnToMira, saveKb, saveMiraConfig, sendDraft,
  subscribeMira, takeOver, type MiraConfig, type MiraDraft, type MiraKb, type MiraThread,
} from "@/lib/db/mira";
import { useSession } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { arErr } from "../patients/kit";

type Tab = "chats" | "kb" | "settings";
const TABS: [Tab, string][] = [["chats", "المحادثات"], ["kb", "إجابات فاطمة"], ["settings", "الإعدادات"]];

const pill = (on: boolean) => ({
  height: 38, padding: "0 16px", borderRadius: 19, border: on ? "none" : "1px solid #EADCF0", fontSize: 13.5, fontWeight: on ? 700 : 600,
  background: on ? C.accent : C.white, color: on ? C.white : C.sub2, cursor: "pointer",
});
const input = { width: "100%", boxSizing: "border-box" as const, borderRadius: 14, border: "1px solid #EADCF0", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", color: C.ink, background: C.white };

export default function MiraPage() {
  const [tab, setTab] = useState<Tab>("chats");
  return (
    <AdminShell active="ميرا" title="ميرا" subtitle="المساعدة الذكية: ترد على المراجعات وتحوّل إليكِ ما يحتاج خبرتكِ">
      <div role="tablist" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TABS.map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={pill(tab === k)}>{t}</button>)}
      </div>
      {tab === "chats" ? <Chats /> : tab === "kb" ? <Kb /> : <><Alerts /><Settings /></>}
    </AdminShell>
  );
}

/* ---------- conversations ---------- */

type Conv = { pid: string; name: string; fileNo: number | null; msgs: InboxMsg[]; last: InboxMsg | null; unread: number; thread: MiraThread | null; draft: MiraDraft | null };
const rank = (c: Conv) => (c.thread?.status === "fatema" && c.thread.urgent ? 0 : c.thread?.status === "fatema" ? 1 : c.draft ? 2 : 3);

function Chats() {
  const { staff } = useSession();
  const inbox = useQuery(["inbox", "all"], listInbox);
  const threads = useQuery(["mira", "threads"], listThreads);
  const drafts = useQuery(["mira", "drafts"], listPendingDrafts);
  useEffect(() => subscribeInbox(() => revalidate("inbox")), []);
  useEffect(() => subscribeMira(() => revalidate("mira")), []);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"need" | "all">("need");

  const convs = useMemo(() => {
    const m = new Map<string, Conv>();
    const get = (pid: string) => {
      let c = m.get(pid);
      if (!c) { c = { pid, name: "مراجعة", fileNo: null, msgs: [], last: null, unread: 0, thread: null, draft: null }; m.set(pid, c); }
      return c;
    };
    for (const x of inbox.data ?? []) {
      const c = get(x.patient_id);
      c.msgs.unshift(x);
      if (!c.last) c.last = x;
      if (x.patients) { c.name = x.patients.name || c.name; c.fileNo = x.patients.file_no; }
      if (x.from_patient && !x.read_at) c.unread++;
    }
    for (const t of threads.data ?? []) get(t.patient_id).thread = t;
    for (const d of drafts.data ?? []) get(d.patient_id).draft = d;
    return [...m.values()].sort((a, b) => rank(a) - rank(b) || (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
  }, [inbox.data, threads.data, drafts.data]);
  const shown = filter === "need" ? convs.filter((c) => rank(c) < 3) : convs;
  const conv = convs.find((c) => c.pid === open) ?? null;
  const counts = { urgent: convs.filter((c) => rank(c) === 0).length, fatema: convs.filter((c) => rank(c) === 1).length, drafts: drafts.data?.length ?? 0 };

  if (inbox.loading || threads.loading) return <Loading />;
  const err = inbox.error || threads.error || drafts.error;
  if (err) return <ErrorNote>{arErr(err, "تعذّر تحميل المحادثات.")}</ErrorNote>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <Stat label="حالات عاجلة" value={counts.urgent} tone="#C2416F" />
        <Stat label="محوّلة إليكِ" value={counts.fatema} tone={C.accent} />
        <Stat label="ردود بانتظار موافقتكِ" value={counts.drafts} tone="#8A5A12" />
      </div>
      {conv ? (
        <Thread key={conv.pid} c={conv} staffId={staff?.id ?? null} onBack={() => setOpen(null)} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setFilter("need")} style={pill(filter === "need")}>تحتاج تدخّلكِ</button>
            <button type="button" onClick={() => setFilter("all")} style={pill(filter === "all")}>كل المحادثات</button>
          </div>
          {shown.length === 0 ? (
            <EmptyState compact icon="sparkle" title={filter === "need" ? "لا شيء ينتظركِ" : "لا توجد محادثات"}
              text={filter === "need" ? "ميرا تتولى المحادثات الآن. ستظهر هنا أي حالة تحتاجكِ أو أي رد ينتظر موافقتكِ." : "عندما تراسل مراجعة المركز من التطبيق تظهر محادثتها هنا."} />
          ) : shown.map((c) => (
            <button key={c.pid} type="button" onClick={() => { setOpen(c.pid); if (c.unread) markRead(c.pid).then(() => revalidate("inbox")).catch(() => {}); }}
              style={{ textAlign: "right", border: rank(c) === 0 ? "1.5px solid #E7A3C0" : "1px solid #F0E6F3", background: rank(c) === 0 ? "#FFF6FA" : C.white, borderRadius: 20, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.45 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{c.name}</span>
                  {c.fileNo != null && <span className="latin" style={{ fontSize: 11.5, color: C.muted }}>{c.fileNo}</span>}
                  {rank(c) === 0 && <Tag kind="pink">عاجل</Tag>}
                  {rank(c) === 1 && <Tag kind="plum">محوّلة إليكِ</Tag>}
                  {c.draft && <Tag kind="amber">رد بانتظار الموافقة</Tag>}
                  {c.unread > 0 && <Tag kind="lilac">{c.unread} جديدة</Tag>}
                </div>
                <div style={{ fontSize: 12.5, color: C.sub2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.thread?.status === "fatema" && c.thread.summary ? c.thread.summary : c.last?.body ?? ""}
                </div>
              </div>
              {c.last && <span className="latin" style={{ fontSize: 11.5, color: C.muted, flexShrink: 0 }}>{clock(c.last.created_at)}</span>}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card radius={20} padding={14} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="latin" style={{ fontSize: 24, fontWeight: 700, color: tone }}>{value}</span>
      <span style={{ fontSize: 12.5, color: C.sub2 }}>{label}</span>
    </Card>
  );
}

const WHO: Record<string, string> = { patient: "المراجعة", staff: "أ. فاطمة / الفريق", mira: "ميرا" };

function Thread({ c, staffId, onBack }: { c: Conv; staffId: string | null; onBack: () => void }) {
  const [reply, setReply] = useState("");
  const [draftText, setDraftText] = useState(c.draft?.body ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [c.msgs.length]);
  useEffect(() => { setDraftText(c.draft?.body ?? ""); }, [c.draft?.id, c.draft?.body]);
  const run = async (key: string, fn: () => Promise<unknown>, fail: string) => {
    setBusy(key); setErr(null);
    try { await fn(); } catch (e) { setErr(arErr(e, fail)); } finally { setBusy(null); }
  };
  const withFatema = c.thread?.status === "fatema";

  return (
    <Card radius={24} padding={16} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={onBack} aria-label="رجوع" style={{ border: "none", background: "none", padding: 4, cursor: "pointer" }}><Icon name="back" size={18} /></button>
        <b style={{ fontSize: 15 }}>{c.name}</b>
        {withFatema ? <Tag kind={c.thread?.urgent ? "pink" : "plum"}>{c.thread?.urgent ? "عاجل · مع أ. فاطمة" : "مع أ. فاطمة"}</Tag> : <Tag kind="green">مع ميرا</Tag>}
        <span style={{ marginInlineStart: "auto" }} />
        {withFatema
          ? <SubmitButton onClick={() => run("back", () => returnToMira(c.pid), "تعذّر إعادة المحادثة.")} busy={busy === "back"}>انتهيت · أعيديها لميرا</SubmitButton>
          : <SubmitButton onClick={() => run("take", () => takeOver(c.pid), "تعذّر تولّي المحادثة.")} busy={busy === "take"}>أتولّاها بنفسي</SubmitButton>}
      </div>

      {withFatema && (c.thread?.reason || c.thread?.summary) && (
        <div style={{ borderRadius: 16, padding: "10px 14px", background: c.thread?.urgent ? "#FBEAF1" : "#F5EEF8", fontSize: 13.5, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: c.thread?.urgent ? C.danger : C.accent }}>ملخص ميرا{c.thread?.reason ? ` · ${c.thread.reason}` : ""}</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{c.thread?.summary}</div>
        </div>
      )}

      <div ref={ref} style={{ maxHeight: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {c.msgs.map((m, i) => {
          const who = (m as InboxMsg & { author?: string }).author ?? (m.from_patient ? "patient" : "staff");
          const newDay = i === 0 || arDate(new Date(c.msgs[i - 1].created_at)) !== arDate(new Date(m.created_at));
          return (
            <div key={m.id} style={{ display: "contents" }}>
              {newDay && <div style={{ alignSelf: "center", fontSize: 11.5, color: C.muted, margin: "4px 0" }}>{arDate(new Date(m.created_at))}</div>}
              <div style={{ alignSelf: m.from_patient ? "flex-start" : "flex-end", maxWidth: "80%", padding: "8px 12px", borderRadius: 16, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap",
                background: m.from_patient ? "#F3EAF6" : who === "mira" ? "#EFE4F4" : C.accent, color: m.from_patient || who === "mira" ? C.ink : C.white }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, marginBottom: 2 }}>{WHO[who] ?? ""}</div>
                {m.body}
                <div className="latin" style={{ fontSize: 10.5, opacity: 0.7, marginTop: 2 }}>{clock(m.created_at)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {c.draft && (
        <div style={{ borderRadius: 18, border: "1.5px dashed #E2C98F", background: "#FFFAF0", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A5A12" }}>رد ميرا المقترح · عدّليه إن أردتِ ثم أرسليه</div>
          <textarea aria-label="رد ميرا المقترح" value={draftText} maxLength={2000} rows={3} onChange={(e) => setDraftText(e.target.value)} style={{ ...input, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SubmitButton onClick={() => run("send", () => sendDraft(c.draft!, draftText, staffId), "تعذّر إرسال الرد.")} busy={busy === "send"} disabled={!draftText.trim()}>إرسال باسم ميرا</SubmitButton>
            <button type="button" onClick={() => run("discard", () => discardDraft(c.draft!.id, staffId), "تعذّر تجاهل الرد.")} disabled={busy === "discard"}
              style={{ height: 44, padding: "0 18px", borderRadius: 22, border: "1px solid #EADCF0", background: C.white, color: C.sub2, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>تجاهل</button>
          </div>
        </div>
      )}

      <textarea aria-label="ردكِ" value={reply} maxLength={2000} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="اكتبي ردكِ أنتِ…" style={{ ...input, resize: "vertical" }} />
      {err && <ErrorNote>{err}</ErrorNote>}
      <SubmitButton onClick={() => run("reply", async () => { if (!staffId) throw new Error("لا يوجد حساب موظفة."); await staffReply(c.pid, staffId, reply); setReply(""); }, "تعذّر إرسال الرد.")}
        busy={busy === "reply"} disabled={!reply.trim() || !staffId}>إرسال ردّي</SubmitButton>
    </Card>
  );
}

/* ---------- Fatema's answers ---------- */

function Kb() {
  const { data, loading, error } = useQuery(["mira", "kb"], listKb);
  const [edit, setEdit] = useState<Partial<MiraKb> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    if (!edit) return;
    setBusy(true); setErr(null);
    try { await saveKb(edit as MiraKb); setEdit(null); } catch (e) { setErr(arErr(e, "تعذّر الحفظ.")); } finally { setBusy(false); }
  };
  if (loading) return <Loading />;
  if (error) return <ErrorNote>{arErr(error, "تعذّر تحميل الإجابات.")}</ErrorNote>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13.5, color: C.sub2, lineHeight: 1.7 }}>
        اكتبي إجاباتكِ على الأسئلة المتكررة بأسلوبكِ. ميرا تجيب منها فقط ولا تخترع غيرها، وكل ما ليس هنا تحوّله إليكِ.
      </div>
      {edit ? (
        <Card radius={22} padding={14} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 12.5, fontWeight: 700 }}>السؤال<input value={edit.question ?? ""} onChange={(e) => setEdit({ ...edit, question: e.target.value })} style={{ ...input, marginTop: 4 }} /></label>
          <label style={{ fontSize: 12.5, fontWeight: 700 }}>جوابكِ<textarea value={edit.answer ?? ""} rows={4} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} style={{ ...input, marginTop: 4, resize: "vertical" }} /></label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <input type="checkbox" checked={edit.active ?? true} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> مفعّل
          </label>
          {err && <ErrorNote>{err}</ErrorNote>}
          <div style={{ display: "flex", gap: 8 }}>
            <SubmitButton onClick={save} busy={busy}>حفظ</SubmitButton>
            <button type="button" onClick={() => { setEdit(null); setErr(null); }} style={{ height: 44, padding: "0 18px", borderRadius: 22, border: "1px solid #EADCF0", background: C.white, color: C.sub2, fontSize: 14, cursor: "pointer" }}>إلغاء</button>
          </div>
        </Card>
      ) : (
        <SubmitButton onClick={() => setEdit({ question: "", answer: "", active: true, sort: (data?.length ?? 0) + 1 })}>إضافة سؤال وجواب</SubmitButton>
      )}
      {(data ?? []).map((k) => (
        <Card key={k.id} radius={20} padding={14} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: k.active ? 1 : 0.55 }}>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{k.question}</div>
            <div style={{ fontSize: 13.5, color: C.sub, whiteSpace: "pre-wrap" }}>{k.answer}</div>
          </div>
          <button type="button" onClick={() => setEdit(k)} aria-label="تعديل" style={{ border: "none", background: "none", cursor: "pointer", padding: 6 }}><Icon name="edit" size={17} /></button>
          <button type="button" aria-label="حذف" onClick={() => { if (confirm("حذف هذا السؤال؟")) deleteKb(k.id).catch((e) => setErr(arErr(e, "تعذّر الحذف."))); }}
            style={{ border: "none", background: "none", cursor: "pointer", padding: 6 }}><Icon name="trash" size={17} color={C.danger} /></button>
        </Card>
      ))}
    </div>
  );
}

/* ---------- settings ---------- */

function Settings() {
  const { data, loading, error } = useQuery(["mira", "config"], getMiraConfig);
  const [cfg, setCfg] = useState<MiraConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (data) setCfg(data); }, [data]);
  if (loading || !cfg) return error ? <ErrorNote>{arErr(error, "تعذّر تحميل الإعدادات.")}</ErrorNote> : <Loading />;
  const save = async () => {
    setBusy(true); setErr(null); setMsg(null);
    try { await saveMiraConfig(cfg); setMsg("تم الحفظ."); } catch (e) { setErr(arErr(e, "تعذّر الحفظ.")); } finally { setBusy(false); }
  };
  const opt = (on: boolean) => ({ ...pill(on), height: "auto", minHeight: 44, padding: "10px 16px", textAlign: "right" as const, lineHeight: 1.5, flex: 1, minWidth: 220 });
  return (
    <Card radius={24} padding={18} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, fontWeight: 700 }}>
        <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} style={{ width: 18, height: 18 }} />
        ميرا تعمل وترد على المراجعات
      </label>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>طريقة الرد</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setCfg({ ...cfg, mode: "draft" })} style={opt(cfg.mode === "draft")}>
            <b>مسودة للموافقة</b><br /><span style={{ fontSize: 12.5, fontWeight: 400 }}>تكتب ميرا الرد وتنتظر موافقتكِ قبل وصوله. لا تحجز ولا تلغي بنفسها.</span>
          </button>
          <button type="button" onClick={() => setCfg({ ...cfg, mode: "auto" })} style={opt(cfg.mode === "auto")}>
            <b>رد تلقائي</b><br /><span style={{ fontSize: 12.5, fontWeight: 400 }}>ترد فوراً وتحجز وتلغي المواعيد بعد تأكيد المراجعة.</span>
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: C.sub2, marginTop: 6 }}>في الحالتين: الأسئلة العلاجية والحالات العاجلة تُحوَّل إليكِ فوراً.</div>
      </div>
      <Recipients cfg={cfg} setCfg={setCfg} />
      <label style={{ fontSize: 13.5, fontWeight: 700 }}>عنوان المركز (تذكره ميرا عند السؤال)
        <input value={cfg.address} onChange={(e) => setCfg({ ...cfg, address: e.target.value })} placeholder="مثال: حمص، شارع الحضارة، بناء …" style={{ ...input, marginTop: 6, fontWeight: 400 }} />
      </label>
      <label style={{ fontSize: 13.5, fontWeight: 700 }}>النموذج
        <select value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })} style={{ ...input, marginTop: 6, fontWeight: 400 }}>
          <option value="claude-haiku-5-5">سريع واقتصادي (Haiku)</option>
          <option value="claude-sonnet-5-5">أدق وأغلى (Sonnet)</option>
        </select>
      </label>
      {err && <ErrorNote>{err}</ErrorNote>}
      {msg && <div style={{ fontSize: 13.5, color: C.okDeep, fontWeight: 600 }}>{msg}</div>}
      <SubmitButton onClick={save} busy={busy}>حفظ الإعدادات</SubmitButton>
    </Card>
  );
}

/* ---------- phone alerts ---------- */

function Alerts() {
  const { staff } = useSession();
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { alertsOnThisDevice().then(setOn).catch(() => setOn(false)); }, []);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr(null); setMsg(null);
    try { await fn(); } catch (e) { setErr(arErr(e, "تعذّر تنفيذ الطلب.")); } finally { setBusy(false); }
  };
  const supported = alertsSupported();
  return (
    <Card radius={24} padding={18} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 760 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="bell" size={20} color={C.accent} />
        <div style={{ lineHeight: 1.45 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>تنبيهات هذا الهاتف</div>
          <div style={{ fontSize: 12.5, color: C.sub2 }}>تصل فقط إلى الأجهزة التي فعّلتها الموظفات المختارات من تطبيق الإدارة، ولا تصل لأي زبونة إطلاقاً.</div>
        </div>
      </div>
      {!supported ? (
        <div style={{ fontSize: 13.5, color: "#8A5A12", background: "#FCF1DE", borderRadius: 14, padding: "10px 14px", lineHeight: 1.6 }}>
          هذا المتصفح لا يدعم التنبيهات. على الآيفون: افتحي لوحة الإدارة من Safari، ثم «مشاركة» ← «إضافة إلى الشاشة الرئيسية»، وافتحيها من الأيقونة ثم عودي إلى هنا.
        </div>
      ) : on === null ? <Loading /> : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {on ? <Tag kind="green">مفعّلة على هذا الجهاز</Tag> : <Tag kind="gray">غير مفعّلة على هذا الجهاز</Tag>}
          {!on && <SubmitButton busy={busy} disabled={!staff} onClick={() => run(async () => { await enableAlerts(staff!.id); setOn(true); setMsg("تم التفعيل. أرسلي تنبيهاً تجريبياً للتأكد."); })}>تفعيل التنبيهات على هذا الهاتف</SubmitButton>}
          {on && <SubmitButton busy={busy} onClick={() => run(async () => { const r = await sendTestAlert(); setMsg(r.sent ? "أُرسل تنبيه تجريبي، يجب أن يظهر خلال ثوانٍ." : "لم يُرسل التنبيه. أعيدي التفعيل على هذا الجهاز."); })}>إرسال تنبيه تجريبي</SubmitButton>}
          {on && <button type="button" disabled={busy} onClick={() => run(async () => { await disableAlerts(); setOn(false); setMsg("أُوقفت التنبيهات على هذا الجهاز."); })}
            style={{ height: 44, padding: "0 18px", borderRadius: 22, border: "1px solid #EADCF0", background: C.white, color: C.sub2, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>إيقاف على هذا الجهاز</button>}
        </div>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}
      {msg && <div style={{ fontSize: 13.5, color: C.okDeep, fontWeight: 600 }}>{msg}</div>}
    </Card>
  );
}

function Recipients({ cfg, setCfg }: { cfg: MiraConfig; setCfg: (c: MiraConfig) => void }) {
  const { data: team } = useQuery(["mira", "staff"], listStaffBasic);
  const toggle = (key: "alert_staff" | "escalate_staff", id: string) => {
    const cur = new Set(cfg[key] ?? []);
    if (cur.has(id)) cur.delete(id); else cur.add(id);
    setCfg({ ...cfg, [key]: [...cur] });
  };
  const box = (key: "alert_staff" | "escalate_staff", title: string, hint: string) => (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.sub2, marginBottom: 6 }}>{hint}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(team ?? []).map((t) => {
          const on = (cfg[key] ?? []).includes(t.id);
          return <button key={t.id} type="button" aria-pressed={on} onClick={() => toggle(key, t.id)} style={{ ...pill(on), height: 34, fontSize: 13 }}>{t.name}</button>;
        })}
      </div>
    </div>
  );
  return (
    <>
      {box("alert_staff", "من يستلم التنبيهات الفورية", "المحادثات المحوّلة والحالات العاجلة، مع تذكير كل 15 دقيقة للعاجل دون رد.")}
      {box("escalate_staff", "من يُضاف بعد ساعة دون رد", "اختياري: مثلاً السكرتيرة، لتتابع إن لم تتمكني من الرد.")}
    </>
  );
}
