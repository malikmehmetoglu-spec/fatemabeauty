"use client";

/**
 * «مستويات الجلسات» — each service has levels (عادية / مكثّفة / علاجية مطوّلة…) with their own minutes and price.
 * Level 1 is the service's base (same minutes/price as the service, shown on the public link). Levels are hidden, never deleted.
 */
import { useEffect, useState } from "react";
import { ErrorNote, GhostButton, Icon, Modal, Segment, SubmitButton, Tag } from "@/components/ui";
import { addLevel, getExtensionPrice, levelError, saveExtensionPrice, saveLevel, setLevelActive, type Level } from "@/lib/db/levels";
import { money } from "@/lib/format";
import type { Service } from "@/lib/db/catalog";
import { useQuery } from "@/lib/db/query";
import { C, CARD, ICON_FILL } from "@/lib/tokens";

const input = { height: 44, borderRadius: 14, border: "1px solid #E6D7EC", background: "#FFFFFF", padding: "0 12px", fontSize: 14, color: C.ink, width: "100%", minWidth: 0, fontFamily: "inherit" } as const;
const lbl = { fontSize: 12, color: C.sub2, fontWeight: 600, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 } as const;

export const levelPrice = (l: Pick<Level, "price" | "price_currency">) => (l.price_currency === "USD" ? `${l.price}$` : money(l.price));

/** Compact summary for the services table: «45 · 90 · 180 د». */
export function LevelsSummary({ levels, onOpen, name }: { levels: Level[]; onOpen: () => void; name: string }) {
  const act = levels.filter((l) => l.active);
  return (
    <button type="button" onClick={onOpen} aria-label={`مستويات ${name}`} style={{ border: "1px solid #EADCF0", background: C.white, borderRadius: 16, padding: "5px 10px", textAlign: "right", lineHeight: 1.35, maxWidth: "100%" }}>
      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: C.accent }}>{act.length ? `${act.length} مستويات` : "بلا مستويات"}</span>
      <span className="latin" style={{ display: "block", fontSize: 11.5, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{act.map((l) => l.minutes).join(" · ")}{act.length ? " د" : ""}</span>
    </button>
  );
}

function LevelCard({ l, canHide }: { l: Level; canHide: boolean }) {
  const [f, setF] = useState({ name: l.name, minutes: String(l.minutes), price: String(l.price), cur: l.price_currency as "SYP" | "USD", ext: l.extension_price_30 == null ? "" : String(l.extension_price_30) });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setF({ name: l.name, minutes: String(l.minutes), price: String(l.price), cur: l.price_currency as "SYP" | "USD", ext: l.extension_price_30 == null ? "" : String(l.extension_price_30) }); }, [l]);
  const dirty = f.name !== l.name || f.minutes !== String(l.minutes) || f.price !== String(l.price) || f.cur !== l.price_currency || f.ext !== (l.extension_price_30 == null ? "" : String(l.extension_price_30));
  const save = async () => {
    const minutes = Math.round(Number(f.minutes)), price = Math.round(Number(f.price));
    if (!f.name.trim()) return setErr("اكتبي اسم المستوى.");
    if (!(minutes > 0 && minutes <= 600)) return setErr("المدة من 1 إلى 600 دقيقة.");
    if (f.price.trim() === "" || !(price >= 0)) return setErr("اكتبي السعر.");
    setBusy(true); setErr(""); setSaved(false);
    try { await saveLevel({ id: l.id, name: f.name, minutes, price, price_currency: f.cur, extension_price_30: f.ext.trim() === "" ? null : Math.max(0, Math.round(Number(f.ext))) }); setSaved(true); }
    catch (e) { setErr(levelError(e)); } finally { setBusy(false); }
  };
  const toggle = async () => {
    setBusy(true); setErr("");
    try { await setLevelActive(l.id, !l.active); } catch (e) { setErr(levelError(e)); } finally { setBusy(false); }
  };
  return (
    <div style={{ ...CARD, borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 12, opacity: l.active ? 1 : 0.62 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="latin" style={{ width: 34, height: 34, borderRadius: 17, background: ICON_FILL, color: C.accent, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{l.level}</span>
        <b style={{ fontSize: 15, flex: "1 1 120px", minWidth: 0 }}>{l.name}</b>
        {l.level === 1 && <Tag kind="lilac">الأساسية · تظهر في رابط الحجز</Tag>}
        {!l.active && <Tag kind="gray">مخفي</Tag>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 10 }}>
        <label style={lbl}>الاسم<input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label style={lbl}>المدة (دقيقة)<input style={input} inputMode="numeric" className="latin" value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value.replace(/\D/g, "") })} /></label>
        <label style={lbl}>السعر<input style={input} inputMode="numeric" className="latin" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, "") })} /></label>
        <div style={lbl}>العملة<Segment label="العملة" value={f.cur} onChange={(v) => setF({ ...f, cur: v })} options={[{ value: "SYP", label: "ل.س" }, { value: "USD", label: "$" }]} /></div>
        <label style={lbl}>سعر كل 30 دقيقة تمديد<input style={input} inputMode="numeric" className="latin" placeholder="الإعداد العام" value={f.ext} onChange={(e) => setF({ ...f, ext: e.target.value.replace(/\D/g, "") })} /></label>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <SubmitButton busy={busy} disabled={!dirty} onClick={save} style={{ height: 42, padding: "0 20px", fontSize: 14 }}>حفظ</SubmitButton>
        {canHide && <GhostButton color={l.active ? C.danger : C.accent} onClick={() => !busy && toggle()} style={{ height: 42 }}>{l.active ? "إخفاء المستوى" : "إظهار المستوى"}</GhostButton>}
        {saved && !dirty && <span style={{ fontSize: 12.5, color: "#2E7D50", fontWeight: 600 }}>حُفظ</span>}
      </div>
    </div>
  );
}

export function LevelsDialog({ service, levels, onClose }: { service: Service | null; levels: Level[]; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const mine = levels.filter((l) => l.service_key === service?.key).sort((a, b) => a.level - b.level);
  const add = async () => {
    if (!service) return;
    setBusy(true); setErr("");
    try { await addLevel(service.key, levels, { minutes: service.minutes, price: service.price, price_currency: service.price_currency }); }
    catch (e) { setErr(levelError(e)); } finally { setBusy(false); }
  };
  return (
    <Modal open={!!service} onClose={onClose} width={720} title={`مستويات «${service?.name ?? ""}»`}
      footer={<div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap", width: "100%" }}>
        <GhostButton icon="plus" onClick={() => !busy && add()}>إضافة مستوى</GhostButton>
        <GhostButton onClick={onClose}>إغلاق</GhostButton>
      </div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
          لكل مستوى مدته وسعره. رابط الحجز وتطبيق المراجِعات يعرضان المستوى الأول فقط، إلا إذا حدّدتِ للعميلة مستوى آخر في ملفها. المستوى المخفي لا يُحجز، ويبقى في المواعيد القديمة.
        </div>
        {mine.map((l) => <LevelCard key={l.id} l={l} canHide={l.level !== 1} />)}
        {!mine.length && <div style={{ fontSize: 13, color: C.muted }}>لا مستويات بعد — أضيفي مستوى.</div>}
        {err && <ErrorNote>{err}</ErrorNote>}
      </div>
    </Modal>
  );
}

/** Global «سعر كل 30 دقيقة إضافية» (admin). */
export function ExtensionPriceCard() {
  const q = useQuery(["levels", "extension-price"], getExtensionPrice);
  const [v, setV] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const val = v ?? (q.data != null ? String(q.data) : "");
  const save = async () => {
    setBusy(true); setMsg("");
    try { await saveExtensionPrice(Number(val) || 0); setV(null); setMsg("حُفظ"); } catch (e) { setMsg(levelError(e)); } finally { setBusy(false); }
  };
  return (
    <div style={{ ...CARD, borderRadius: 24, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <span style={{ width: 40, height: 40, borderRadius: 20, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18" size={18} color="#A877B6" />
      </span>
      <div style={{ flex: "1 1 240px", minWidth: 0, lineHeight: 1.45 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>سعر كل 30 دقيقة إضافية</div>
        <div style={{ fontSize: 12.5, color: C.sub2 }}>عند طلب تمديد الجلسة تدفعه العميلة في الاستقبال قبل أن يُضاف الوقت. يمكن تغييره لمستوى معيّن من نافذة المستويات.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input aria-label="سعر كل 30 دقيقة إضافية" className="latin" inputMode="numeric" value={val} onChange={(e) => { setV(e.target.value.replace(/\D/g, "")); setMsg(""); }} style={{ ...input, width: 120 }} />
        <span style={{ fontSize: 13, color: C.sub2 }}>ل.س</span>
        <SubmitButton busy={busy} disabled={v == null} onClick={save} style={{ height: 44, padding: "0 18px", fontSize: 14 }}>حفظ</SubmitButton>
        {msg && <span style={{ fontSize: 12.5, color: msg === "حُفظ" ? "#2E7D50" : C.danger, fontWeight: 600 }}>{msg}</span>}
      </div>
    </div>
  );
}
