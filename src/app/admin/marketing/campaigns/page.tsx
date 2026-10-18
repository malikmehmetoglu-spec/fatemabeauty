"use client";

/** W_Campaigns.dc.html — message campaigns. Saved as drafts; sending is not connected yet. Audience sizes are real. */
import { arError } from "@/lib/arError";
import ac from "../../adminPages.module.css";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Select, SubmitButton, Tag, TextArea, TextInput } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { AUDIENCES, audienceCounts, listCampaigns, saveCampaign, type Audience, type Campaign } from "@/lib/db/marketing";
import { C } from "@/lib/tokens";
import { MarketingTabs } from "../tabs";

const CHANNELS = [{ value: "app", label: "إشعار التطبيق" }, { value: "whatsapp", label: "واتساب" }, { value: "sms", label: "رسالة SMS" }];
const chName = (v: string) => CHANNELS.find((c) => c.value === v)?.label ?? v;
const audName = (v: string) => AUDIENCES.find((a) => a.value === v)?.label ?? v;

export default function CampaignsPage() {
  const { data: counts, loading: lc, error: ec } = useQuery(["campaigns", "audience"], audienceCounts);
  const { data, loading, error } = useQuery(["campaigns", "list"], listCampaigns);
  const [cur, setCur] = useState<Campaign | null>(null);
  const list = data ?? [];

  return (
    <AdminShell active="التسويق والولاء" title="الحملات والرسائل" subtitle="جهّزي رسائل الحملات واعرفي حجم كل شريحة"
      actions={<GhostButton icon="plus" onClick={() => setCur(null)}>حملة جديدة</GhostButton>}>
      <MarketingTabs active={R.W_Campaigns} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "12px 16px", background: "#FCF1DE", color: "#8A5A12" }}>
        <Icon name="info" color="#8A5A12" size={20} />
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>الإرسال عبر واتساب و SMS وإشعارات التطبيق غير مربوط بعد. تُحفظ الحملات كمسودات جاهزة للإرسال لاحقاً.</div>
      </div>

      {lc ? <Loading /> : ec ? <ErrorNote>تعذّر حساب الشرائح: {ec}</ErrorNote> : counts && (
        <div className="adm-row" style={{ display: "flex", gap: 14 }}>
          {AUDIENCES.map((a, i) => <Kpi key={a.value} dark={i === 0} label={a.label} value={counts[a.value]} icon="users" />)}
        </div>
      )}

      <div className={ac.stack} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1.2, minWidth: 0 }}>
          <Editor key={cur?.id ?? "new"} campaign={cur} counts={counts} onSaved={() => setCur(null)} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>المسودات</div>
          {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : list.length === 0 ? (
            <EmptyState compact icon="megaphone" title="لا توجد حملات بعد" text="اكتبي أول رسالة واختاري الشريحة، ثم احفظيها كمسودة." />
          ) : list.map((c) => (
            <button key={c.id} type="button" onClick={() => setCur(c)} style={{ textAlign: "right", border: `1px solid ${cur?.id === c.id ? "#D8BFDE" : "#F0E6F3"}`, background: C.white, borderRadius: 20, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b style={{ fontSize: 14, color: C.ink }}>{c.title}</b><Tag kind="amber">مسودة</Tag>
              </div>
              <div style={{ fontSize: 12, color: C.sub2 }}>{audName(c.audience)} · {chName(c.channel)} · {arDate(new Date(c.updated_at), { day: false })}</div>
            </button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function Editor({ campaign, counts, onSaved }: { campaign: Campaign | null; counts?: Record<Audience, number>; onSaved: () => void }) {
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [body, setBody] = useState(campaign?.body ?? "");
  const [aud, setAud] = useState<string>(campaign?.audience ?? "all");
  const [ch, setCh] = useState<string>(campaign?.channel ?? "app");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setErr(null), [campaign]);

  const save = async () => {
    if (!title.trim()) return;
    setBusy(true); setErr(null);
    try { await saveCampaign({ id: campaign?.id, title: title.trim(), body, audience: aud, channel: ch }); onSaved(); }
    catch (e) { setErr(arError(e)); }
    finally { setBusy(false); }
  };

  return (
    <Card radius={26} padding={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{campaign ? "تعديل الحملة" : "حملة جديدة"}</div>
      <TextInput label="اسم الحملة" value={title} onChange={setTitle} required />
      <div style={{ display: "flex", gap: 12 }}>
        <Select label="الشريحة" value={aud} onChange={setAud} options={AUDIENCES.map((a) => ({ value: a.value, label: counts ? `${a.label} (${counts[a.value]})` : a.label }))} style={{ flex: 1 }} />
        <Select label="القناة" value={ch} onChange={setCh} options={CHANNELS} style={{ flex: 1 }} />
      </div>
      <TextArea label="نص الرسالة — استخدمي {الاسم} لاسم المراجعة" value={body} onChange={setBody} rows={5} />
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <SubmitButton onClick={save} busy={busy} disabled={!title.trim()}>حفظ كمسودة</SubmitButton>
        <span style={{ fontSize: 12.5, color: C.muted }}>الإرسال غير متاح بعد</span>
      </div>
    </Card>
  );
}
