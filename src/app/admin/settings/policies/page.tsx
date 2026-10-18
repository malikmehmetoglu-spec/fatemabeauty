"use client";

/** W_Policies.dc.html — booking & cancellation policies, stored in settings «policies». */
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { Card, Chip, ErrorNote, Loading, NumberInput, SubmitButton, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { getPolicies, saveSetting, type Policies } from "@/lib/db/marketing";
import { C } from "@/lib/tokens";

const WINDOWS = [2, 6, 12, 24];
const NS = ["تسجيل الغياب فقط", "تنبيه لطيف بعد الغياب الأول", "طلب عربون بعد غيابين", "إيقاف الحجز من التطبيق بعد 3 غيابات"];
const RS = [15, 30, 60];
const CH: [string, string][] = [["whatsapp", "واتساب"], ["sms", "SMS"], ["app", "إشعار التطبيق"]];
const hrs = (h: number) => (h === 2 ? "ساعتين" : h === 1 ? "ساعة" : `${h} ساعة`);

export default function PoliciesPage() {
  const { data, loading, error } = useQuery(["settings", "policies"], getPolicies);
  const [p, setP] = useState<Policies | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { if (data) setP(data); }, [data]);
  const set = (x: Partial<Policies>) => { setP((cur) => (cur ? { ...cur, ...x } : cur)); setMsg(null); };

  const save = async () => {
    if (!p) return;
    setBusy(true); setMsg(null);
    try { await saveSetting("policies", p); setMsg("تم الحفظ"); }
    catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  const preview: string[] = [];
  if (p) {
    preview.push(`يمكنكِ تعديل موعدكِ أو إلغاؤه من التطبيق حتى ${hrs(p.free_change_hours)} قبل الموعد، وبعدها عبر الاستقبال.`);
    const rem = [p.reminders_hours.includes(24) ? "قبل الموعد بيوم" : "", p.reminders_hours.includes(2) ? "قبله بساعتين" : ""].filter(Boolean);
    const chans = CH.filter(([k]) => p.channels.includes(k)).map(([, t]) => t);
    if (rem.length && chans.length) preview.push(`نذكّركِ ${rem.join(" و")} عبر ${chans.join(" و")}.`);
    if (p.waitlist) preview.push(`عند شغور موعد نرسله لقائمة الانتظار، والرد خلال ${p.waitlist_reply_min} دقيقة.`);
    preview.push(p.deposit_required ? "يُطلب عربون عند الحجز ويُخصم من فاتورتكِ." : "لا يُطلب عربون عادةً لحجز الموعد.");
    if (p.no_show_rule > 0) preview.push(["", "نرسل تنبيهاً لطيفاً عند الغياب عن الموعد.", "بعد غيابين يُطلب عربون للحجز التالي.", "بعد 3 غيابات يتوقف الحجز من التطبيق ويتم عبر الاستقبال."][p.no_show_rule]);
  }

  return (
    <AdminShell active="الإعدادات" title="سياسات الحجز والإلغاء" subtitle="المهل والتذكيرات وقائمة الانتظار — تُطبّق على كل القنوات"
      actions={p && <SubmitButton onClick={save} busy={busy}>حفظ السياسات</SubmitButton>}>
      {loading || (!p && !error) ? <Loading /> : error ? <ErrorNote>تعذّر تحميل السياسات: {error}</ErrorNote> : p && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1.4, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            <Section title="مهلة التعديل والإلغاء المجاني">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WINDOWS.map((w) => <Chip key={w} selected={p.free_change_hours === w} onClick={() => set({ free_change_hours: w })}>{hrs(w)}</Chip>)}
              </div>
            </Section>
            <Section title="عند الغياب عن الموعد">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {NS.map((t, i) => <Chip key={t} selected={p.no_show_rule === i} onClick={() => set({ no_show_rule: i })} style={{ justifyContent: "flex-start" }}>{t}</Chip>)}
              </div>
            </Section>
            <Section title="العربون" right={<Toggle on={p.deposit_required} onChange={(v) => set({ deposit_required: v })} label="طلب عربون عند الحجز" />}>
              <div style={{ fontSize: 13, color: C.sub2 }}>عند التفعيل يُطلب عربون عند الحجز ويُخصم من الفاتورة.</div>
            </Section>
            <Section title="قائمة الانتظار" right={<Toggle on={p.waitlist} onChange={(v) => set({ waitlist: v })} label="تفعيل قائمة الانتظار" />}>
              <div style={{ display: "flex", gap: 8, opacity: p.waitlist ? 1 : 0.45 }}>
                {RS.map((m) => <Chip key={m} selected={p.waitlist_reply_min === m} onClick={() => p.waitlist && set({ waitlist_reply_min: m })}>{m} دقيقة للرد</Chip>)}
              </div>
            </Section>
            <Section title="التذكيرات">
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                {[24, 2].map((h) => (
                  <label key={h} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    <Toggle on={p.reminders_hours.includes(h)} label={`تذكير قبل ${hrs(h)}`}
                      onChange={(v) => set({ reminders_hours: v ? [...new Set([...p.reminders_hours, h])].sort((a, b) => b - a) : p.reminders_hours.filter((x) => x !== h) })} />
                    {h === 24 ? "قبل الموعد بيوم" : "قبله بساعتين"}
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {CH.map(([k, t]) => <Chip key={k} selected={p.channels.includes(k)} onClick={() => set({ channels: p.channels.includes(k) ? p.channels.filter((x) => x !== k) : [...p.channels, k] })}>{t}</Chip>)}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>إرسال التذكيرات عبر واتساب و SMS غير مربوط بعد؛ تُحفظ القناة المختارة للتفعيل لاحقاً.</div>
            </Section>
            <Section title="الخصم دون موافقة الإدارة">
              <NumberInput label="أقصى نسبة خصم يمنحها الاستقبال" value={String(p.max_discount_without_approval)} onChange={(v) => set({ max_discount_without_approval: Number(v) || 0 })} suffix="%" style={{ maxWidth: 260 }} />
            </Section>
          </div>
          <Card radius={26} padding={20} style={{ flex: 1, minWidth: 0, position: "sticky", top: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>كما تراها المراجعة</div>
            <ul style={{ margin: 0, paddingInlineStart: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, lineHeight: 1.7, color: C.sub }}>
              {preview.map((t) => <li key={t}>{t}</li>)}
            </ul>
            {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg === "تم الحفظ" ? C.ok : C.danger }}>{msg}</div>}
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card radius={26} padding={18} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>{right}
      </div>
      {children}
    </Card>
  );
}
