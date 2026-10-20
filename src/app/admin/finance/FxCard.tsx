"use client";

/** «سعر الصرف» — compact card (current USD → SYP rate + last update, Damascus) with an update form and the history. Not a route. */
import { useState } from "react";
import { ErrorNote, Icon, Loading, Modal, NumberInput, SubmitButton, TextInput } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { fxError, listRates, setUsdRate, SOURCE_AR } from "@/lib/db/fx";
import { useSession } from "@/lib/supabase/session";
import { arDate, clock, dayKey, money } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { LATIN, LightBtn, PANEL } from "./parts";

export const whenAr = (ts: string) => `${arDate(new Date(`${dayKey(new Date(ts))}T12:00:00`))} · ${clock(ts)}`;

/** Current rate for pages (latest row, or null). */
export function useUsdRate() {
  const q = useQuery(["fx", "rates"], () => listRates(30));
  return { ...q, rate: q.data?.[0] ?? null };
}

export function FxCard({ compact }: { compact?: boolean }) {
  const { staff } = useSession();
  const canEdit = !!staff && ["owner", "admin", "accountant"].includes(staff.role);
  const { rate, loading, error, data } = useUsdRate();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...PANEL, padding: compact ? "12px 16px" : "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ width: 42, height: 42, borderRadius: 21, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ ...LATIN, fontWeight: 700, fontSize: 18, color: C.accent }}>$</span>
      </span>
      <div style={{ flex: "1 1 200px", minWidth: 0, lineHeight: 1.45 }}>
        <div style={{ fontSize: 12.5, color: C.sub2 }}>سعر الصرف</div>
        {loading ? <div style={{ fontSize: 13, color: C.muted }}>جارٍ التحميل…</div> : error ? <div style={{ fontSize: 13, color: C.danger }}>تعذّر تحميل سعر الصرف</div> : rate ? (<>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>1 دولار = <span dir="ltr" style={LATIN}>{money(rate.usd_to_syp, false)}</span> ل.س</div>
          <div style={{ fontSize: 12, color: C.sub2 }}>آخر تحديث {whenAr(rate.effective_at)} · {SOURCE_AR[rate.source] ?? rate.source}</div>
        </>) : <div style={{ fontSize: 13.5, color: C.sub }}>لم يُحدَّد سعر الصرف بعد — يلزم لرواتب الدولار.</div>}
      </div>
      <LightBtn icon={canEdit ? "edit" : "list"} onClick={() => setOpen(true)}>{canEdit ? (rate ? "تحديث السعر" : "تحديد السعر") : "السجل"}</LightBtn>
      <FxDialog open={open} onClose={() => setOpen(false)} canEdit={canEdit} rows={data ?? []} loading={loading} />
    </div>
  );
}

function FxDialog({ open, onClose, canEdit, rows, loading }: { open: boolean; onClose: () => void; canEdit: boolean; rows: Awaited<ReturnType<typeof listRates>>; loading: boolean }) {
  const [v, setV] = useState(""); const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const close = () => { setV(""); setNote(""); setErr(""); onClose(); };
  async function submit() {
    const n = Math.round(Number(v) * 100) / 100;
    if (!v || !Number.isFinite(n) || n <= 0) { setErr("اكتبي سعر الدولار بالليرة السورية الجديدة (رقم أكبر من صفر، مثل 141.75)."); return; }
    setBusy(true); setErr("");
    try { await setUsdRate(n, note.trim()); setV(""); setNote(""); } catch (e) { setErr(fxError(e)); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={close} title="سعر الصرف" width={520}
      footer={canEdit ? <SubmitButton onClick={submit} busy={busy}>حفظ السعر الجديد</SubmitButton> : undefined}>
      {canEdit && (<>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, fontWeight: 700, paddingBottom: 14, whiteSpace: "nowrap" }}>1 دولار =</div>
          <NumberInput label="السعر بالليرة السورية الجديدة" required value={v} onChange={setV} placeholder="141.75" suffix="ل.س" style={{ flex: "1 1 180px" }} />
        </div>
        <TextInput label="ملاحظة (اختياري)" value={note} onChange={setNote} placeholder="مثلاً: سعر السوق صباحاً" />
        <div style={{ fontSize: 12.5, color: C.sub2, lineHeight: 1.7 }}>
          يُستخدم أحدث سعر لتحويل رواتب الدولار عند تسجيلها أو دفعها. الرواتب المدفوعة سابقاً تبقى بالسعر الذي دُفعت به ولا تتغير.
        </div>
        {err && <ErrorNote>{err}</ErrorNote>}
      </>)}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>السجل</div>
        {loading ? <Loading /> : !rows.length ? <div style={{ fontSize: 13, color: C.muted }}>لا أسعار مسجّلة بعد.</div> : rows.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, borderTop: `1px solid ${C.line}`, fontSize: 13.5, flexWrap: "wrap", padding: "4px 0" }}>
            {i === 0 ? <Icon name="check" color={C.okDeep} size={15} /> : <span style={{ width: 15 }} />}
            <b dir="ltr" style={{ ...LATIN, minWidth: 90 }}>{money(r.usd_to_syp, false)}</b>
            <span style={{ color: C.sub2, fontSize: 12.5, flex: 1, minWidth: 0 }}>{whenAr(r.effective_at)} · {SOURCE_AR[r.source] ?? r.source}{r.note ? ` · ${r.note}` : ""}</span>
            {i === 0 && <span style={{ fontSize: 11.5, color: C.okDeep, fontWeight: 700 }}>الحالي</span>}
          </div>
        ))}
      </div>
    </Modal>
  );
}
