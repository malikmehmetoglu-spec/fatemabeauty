"use client";

/** Location card actions: delete a location (move or write off its stock first) and bulk transfer between locations. */
import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Icon, Modal, Select, Segment, SubmitButton } from "@/components/ui";
import { deleteLocation, listInventory, stockError, transferLocationStock, type DeleteLocationResult, type StockLocation } from "@/lib/db/products";
import { useQuery } from "@/lib/db/query";
import { C } from "@/lib/tokens";
import { locLabel, useLocations } from "../dialogs";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const WAIT = 10;

/** Counts down from `from` to 0 every second while `running`; restarts whenever `resetKey` changes. */
function useCountdown(running: boolean, resetKey: string, from = WAIT) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    if (!running) return;
    setLeft(from);
    const t = setInterval(() => setLeft((n) => (n <= 1 ? (clearInterval(t), 0) : n - 1)), 1000);
    return () => clearInterval(t);
  }, [running, resetKey, from]);
  return left;
}

function ChoiceCard({ on, onClick, icon, title, text, danger }: { on: boolean; onClick: () => void; icon: string; title: string; text: string; danger?: boolean }) {
  const col = danger ? C.danger : C.accent;
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick}
      style={{ flex: "1 1 200px", minWidth: 0, textAlign: "right", display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 18, cursor: "pointer",
        border: `1.5px solid ${on ? col : "#EADCF0"}`, background: on ? (danger ? "#FBEAF1" : C.tint2) : C.white, color: C.ink, fontFamily: "inherit" }}>
      <span style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? col : "#D9C8E0"}`, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {on && <span style={{ width: 10, height: 10, borderRadius: 5, background: col }} />}
      </span>
      <span style={{ lineHeight: 1.5, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: on ? col : C.ink }}><Icon name={icon} size={15} color={col} />{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: C.sub2 }}>{text}</span>
      </span>
    </button>
  );
}

function Summary({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: C.tint2, borderRadius: 18, padding: "12px 14px" }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.6 }}>
          <span style={{ color: C.sub2, flex: "0 0 108px" }}>{k}</span><b style={{ color: C.ink, minWidth: 0, overflowWrap: "anywhere" }}>{v}</b>
        </div>
      ))}
    </div>
  );
}

/** «حذف الموقع»: choose where its stock goes (or write it off), read the summary, wait 10 s, confirm. */
export function DeleteLocationDialog({ loc, stats, onClose, onDone }: {
  loc: StockLocation | null; stats: { items: number; units: number }; onClose: () => void; onDone: (msg: string) => void;
}) {
  const L = useLocations();
  const [mode, setMode] = useState<"transfer" | "waste">("transfer");
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const others = L.active.filter((l) => l.id !== loc?.id);
  const has = stats.units > 0;
  const dst = target && others.some((l) => l.id === target) ? target : (others.find((l) => l.is_default_center) ?? others[0])?.id ?? "";
  const dstLoc = others.find((l) => l.id === dst);
  useEffect(() => { if (loc) { setMode("transfer"); setTarget(""); setError(""); } }, [loc]);
  const left = useCountdown(!!loc, `${loc?.id}|${mode}|${dst}`);

  const blocked = !loc ? "" : loc.is_default_center ? "هذا هو الموقع الافتراضي للمركز — اجعلي موقعاً آخر هو الافتراضي أولاً (من «تعديل»)."
    : !others.length ? "لا يمكن حذف الموقع الوحيد — أضيفي موقعاً آخر أولاً." : "";
  const noTarget = has && mode === "transfer" && !dst;

  async function confirm() {
    if (!loc || left > 0 || blocked || noTarget) return;
    setBusy(true); setError("");
    try {
      const r: DeleteLocationResult = await deleteLocation(loc.id, has ? mode : null, has && mode === "transfer" ? dst : null);
      const what = !has ? "" : mode === "transfer" ? ` ونُقل ما فيه (${fmt(r.units)} وحدة) إلى «${dstLoc?.name ?? ""}»` : ` وسُجّل ما فيه (${fmt(r.units)} وحدة) تالفاً`;
      onDone(`حُذف الموقع «${loc.name}»${what}.` + (r.archived ? " بقي اسمه في سجل الحركات السابقة فقط ولن يظهر في القوائم." : ""));
      onClose();
    } catch (e) { setError("تعذّر الحذف: " + stockError(e)); } finally { setBusy(false); }
  }

  const action = !has ? "لا مخزون فيه — يُحذف مباشرة"
    : mode === "transfer" ? `نقل كل المخزون إلى «${dstLoc?.name ?? "—"}»` : "حذف كل ما بداخله (يُسجَّل تالفاً ويُخصم من المخزون)";
  return (
    <Modal open={!!loc} onClose={onClose} title={`حذف الموقع — ${loc?.name ?? ""}`} width={560}
      footer={<>
        <SubmitButton onClick={confirm} busy={busy} disabled={left > 0 || !!blocked || noTarget}
          style={{ background: C.danger, boxShadow: "0 10px 22px rgba(176,61,106,0.28)", color: C.white, minWidth: 190 }}>
          <Icon name="trash" size={17} color={C.white} />تأكيد الحذف{left > 0 ? <span className="latin" style={{ fontVariantNumeric: "tabular-nums" }}>({left})</span> : null}
        </SubmitButton>
        <button type="button" onClick={onClose} style={{ height: 50, padding: "0 22px", borderRadius: 25, border: "1px solid #EADCF0", background: C.white, color: C.sub, fontSize: 15, fontWeight: 600 }}>إلغاء</button>
      </>}>
      {blocked ? <ErrorNote>{blocked}</ErrorNote> : (
        <>
          {has ? (
            <>
              <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.8 }}>
                في هذا الموقع <b className="latin">{fmt(stats.items)}</b> {stats.items === 1 ? "صنف" : "أصناف"} بمجموع <b className="latin">{fmt(stats.units)}</b> وحدة. ماذا نفعل بها قبل الحذف؟
              </div>
              <div role="radiogroup" aria-label="مصير المخزون" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <ChoiceCard on={mode === "transfer"} onClick={() => setMode("transfer")} icon="refresh" title="نقل كل المخزون إلى…" text="تنتقل الدفعات بتواريخ انتهائها وكلفتها، والمجموع لا يتغيّر" />
                <ChoiceCard danger on={mode === "waste"} onClick={() => setMode("waste")} icon="trash" title="حذف كل ما بداخله" text="يُسجَّل كل ما فيه «تالف / منتهي» ويُخصم من المخزون" />
              </div>
              {mode === "transfer" && (others.length
                ? <Select label="الموقع الذي ينتقل إليه المخزون" value={dst} onChange={setTarget} options={others.map((l) => ({ value: l.id, label: locLabel(l) }))} />
                : <ErrorNote>لا يوجد موقع فعّال آخر للنقل إليه.</ErrorNote>)}
            </>
          ) : (
            <div style={{ fontSize: 13.5, color: C.sub }}>لا يوجد مخزون في هذا الموقع.</div>
          )}
          <Summary rows={[
            ["الموقع", loc?.name ?? ""],
            ["الأصناف المتأثرة", `${fmt(stats.items)} صنف · ${fmt(stats.units)} وحدة`],
            ["الإجراء", action],
          ]} />
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: C.danger, fontWeight: 600 }}>
            <Icon name="alert" size={16} color={C.danger} />
            {left > 0 ? `راجعي الملخص — يصبح زر التأكيد متاحاً بعد ${left === 1 ? "ثانية واحدة" : left === 2 ? "ثانيتين" : `${left} ثوانٍ`}.` : "الحذف نهائي. سجل الحركات السابقة يبقى محفوظاً."}
          </div>
        </>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}

/** «نقل المخزون»: everything, or chosen products with quantities, from this location to another — in one step. */
export function BulkTransferDialog({ from, onClose, onDone }: { from: StockLocation | null; onClose: () => void; onDone: (msg: string) => void }) {
  const L = useLocations();
  const { data: items } = useQuery(["products", "inventory"], listInventory, { enabled: !!from });
  const [to, setTo] = useState(""); const [scope, setScope] = useState<"all" | "pick">("all");
  const [pick, setPick] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const others = L.active.filter((l) => l.id !== from?.id);
  const dst = to && others.some((l) => l.id === to) ? to : (others.find((l) => l.is_default_center) ?? others[0])?.id ?? "";
  const dstLoc = others.find((l) => l.id === dst);
  useEffect(() => { if (from) { setTo(""); setScope("all"); setPick({}); setQ(""); setError(""); } }, [from]);

  /** Products held at the source location, with their quantity there. */
  const held = useMemo(() => {
    if (!from) return [];
    const names = new Map((items ?? []).map((p) => [p.key, p]));
    return Object.entries(L.map ?? {}).map(([key, m]) => ({ key, n: Number(m[from.id] ?? 0), p: names.get(key) }))
      .filter((x) => x.n > 0).sort((a, b) => (a.p?.name ?? "").localeCompare(b.p?.name ?? "", "ar"));
  }, [L.map, items, from]);
  const total = held.reduce((s, x) => s + x.n, 0);
  const needle = q.trim().toLowerCase();
  const shown = held.filter((x) => !needle || [x.p?.name ?? "", x.p?.sku ?? ""].some((t) => t.toLowerCase().includes(needle)));
  const chosen = Object.entries(pick).map(([k, v]) => ({ k, v, have: held.find((x) => x.key === k)?.n ?? 0 }));

  const toggle = (key: string, n: number) => setPick((p) => { const x = { ...p }; if (key in x) delete x[key]; else x[key] = String(n); return x; });

  async function submit() {
    if (!from) return;
    if (!dst) { setError("اختاري الموقع الذي تنقلين إليه."); return; }
    let list: { product_key: string; qty: number }[] | null = null;
    if (scope === "pick") {
      if (!chosen.length) { setError("اختاري منتجاً واحداً على الأقل."); return; }
      for (const c of chosen) {
        const n = Number(c.v);
        if (!/^\d+(\.\d{1,2})?$/.test(c.v.trim()) || !(n > 0) || n > c.have) {
          setError(`كمية «${held.find((x) => x.key === c.k)?.p?.name ?? "صنف"}» يجب أن تكون بين 0 و ${fmt(c.have)}.`); return;
        }
      }
      list = chosen.map((c) => ({ product_key: c.k, qty: Number(c.v) }));
    }
    setBusy(true); setError("");
    try {
      const r = await transferLocationStock(from.id, dst, list);
      onDone(`نُقل ${fmt(r.units)} وحدة من ${fmt(r.products)} ${r.products === 1 ? "صنف" : "أصناف"} من «${from.name}» إلى «${dstLoc?.name ?? ""}».`);
      onClose();
    } catch (e) { setError("تعذّر النقل: " + stockError(e)); } finally { setBusy(false); }
  }

  const pickUnits = chosen.reduce((s, c) => s + (Number(c.v) || 0), 0);
  return (
    <Modal open={!!from} onClose={onClose} title={`نقل المخزون — من ${from?.name ?? ""}`} width={620}
      footer={<SubmitButton onClick={submit} busy={busy} disabled={!held.length || !others.length}>
        <Icon name="refresh" size={17} color={C.white} />{scope === "all" ? `نقل الكل (${fmt(total)} وحدة)` : `نقل المحدد (${fmt(pickUnits)} وحدة)`}
      </SubmitButton>}>
      {!others.length ? <ErrorNote>لا يوجد موقع فعّال آخر — أضيفي موقعاً أولاً.</ErrorNote>
        : !held.length ? <div style={{ fontSize: 13.5, color: C.sub }}>لا يوجد مخزون في هذا الموقع.</div> : (
        <>
          <Select label="إلى الموقع" value={dst} onChange={setTo} options={others.map((l) => ({ value: l.id, label: locLabel(l) }))} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Segment label="ماذا ننقل" value={scope} onChange={setScope} options={[{ value: "all", label: "كل المنتجات" }, { value: "pick", label: "اختيار منتجات" }]} />
            <span style={{ fontSize: 12.5, color: C.sub2 }}>{fmt(held.length)} صنف · {fmt(total)} وحدة في «{from?.name}»</span>
          </div>
          {scope === "pick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {held.length > 6 && (
                <input aria-label="بحث" placeholder="ابحثي بالاسم أو الرمز" value={q} onChange={(e) => setQ(e.target.value)}
                  style={{ height: 40, borderRadius: 20, border: "1px solid #EADCF0", background: C.white, padding: "0 16px", fontSize: 13.5, fontFamily: "inherit" }} />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                {shown.map((x) => {
                  const on = x.key in pick;
                  return (
                    <div key={x.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 16, background: on ? C.tint2 : C.white, border: `1px solid ${on ? "#E2CFEA" : "#F0E6F3"}` }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, cursor: "pointer" }}>
                        <input type="checkbox" checked={on} onChange={() => toggle(x.key, x.n)} style={{ width: 18, height: 18, accentColor: C.accent, flexShrink: 0 }} />
                        <span style={{ minWidth: 0, lineHeight: 1.35 }}>
                          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.p?.name ?? "صنف مُزال"}</span>
                          <span style={{ fontSize: 11.5, color: C.sub2 }}>المتوفر <b className="latin">{fmt(x.n)}</b> {x.p?.unit ?? ""}</span>
                        </span>
                      </label>
                      {on && (
                        <input aria-label={`كمية ${x.p?.name ?? ""}`} inputMode="decimal" value={pick[x.key]} onChange={(e) => setPick((p) => ({ ...p, [x.key]: e.target.value }))}
                          className="latin" style={{ width: 76, height: 36, borderRadius: 12, border: "1px solid #EADCF0", textAlign: "center", fontSize: 14, background: C.white }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.sub, background: C.tint2, borderRadius: 14, padding: "10px 12px" }}>
            <Icon name="refresh" size={16} />
            تنتقل الدفعات بتواريخ انتهائها وكلفتها (الأقرب انتهاءً أولاً)، وتُسجَّل حركة نقل لكل صنف. المجموع الكلي لا يتغيّر.
          </div>
        </>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
