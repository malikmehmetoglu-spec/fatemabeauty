"use client";

/**
 * «قالب الاستشارات» — weekly template of the consultant (table consult_blocks) + buffer / daily cap
 * (settings consult_buffer_min / consult_daily_max). Server rules: migration 0170 (private.svc_ranges, staff_fits).
 * No blocks → bookings follow her «أوقات الدوام» (unchanged behaviour).
 */
import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Icon, Modal, Select, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { AR_DAYS } from "@/lib/data";
import { C } from "@/lib/tokens";
import {
  KINDS, KIND_META, deactivateBlock, getConsultLimits, listBlocks, saveBlock, saveConsultLimits,
  type BlockKind, type ConsultBlock, type ConsultLimits,
} from "@/lib/db/consultTime";
import css from "./consult.module.css";

const WEEK = [6, 0, 1, 2, 3, 4, 5];
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0); };
const hhmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const hm = (t: string) => t.slice(0, 5);
const TIMES = (() => { const o: string[] = []; for (let t = 6 * 60; t <= 24 * 60; t += 15) o.push(hhmm(t)); return o; })();
const BUFFER_CHOICES = [0, 5, 10, 15, 20, 30];
const MAX_CHOICES = [0, 2, 3, 4, 5, 6, 8, 10, 12, 15];

type Draft = { id?: string; weekday: number; starts: string; ends: string; kind: BlockKind };

export function ConsultTemplate({ staffId, name, canManage }: { staffId: string; name: string; canManage: boolean }) {
  const q = useQuery(["consult_blocks", staffId], () => listBlocks(staffId));
  const lim = useQuery(["consult_limits"], getConsultLimits);
  const [draft, setDraft] = useState<Draft | null>(null);
  const blocks = useMemo(() => q.data ?? [], [q.data]);

  // visible hour range: 08:00–20:00 at least, widened to fit every block
  const [from, to] = useMemo(() => {
    let a = 8 * 60, b = 20 * 60;
    for (const x of blocks) { a = Math.min(a, toMin(hm(x.starts))); b = Math.max(b, toMin(hm(x.ends))); }
    return [Math.floor(a / 60) * 60, Math.ceil(b / 60) * 60];
  }, [blocks]);
  const hours = useMemo(() => { const o: number[] = []; for (let t = from; t < to; t += 60) o.push(t); return o; }, [from, to]);
  const pct = (m: number) => ((m - from) / (to - from)) * 100;

  const open = (b: ConsultBlock) => canManage && setDraft({ id: b.id, weekday: b.weekday, starts: hm(b.starts), ends: hm(b.ends), kind: b.kind as BlockKind });
  const addOn = (d: number) => setDraft({ weekday: d, starts: "10:00", ends: "12:00", kind: "in_person" });

  return (
    <section className={css.wrap} aria-label="قالب الاستشارات">
      <div className={css.top}>
        <div className={css.titleBox}>
          <div className={css.title}><Icon name="cal" size={17} color={C.accent} />قالب الاستشارات</div>
          <div className={css.sub}>
            {blocks.length
              ? "تُحجز الاستشارات في التطبيق ورابط الحجز داخل الفترات الملوّنة فقط، كلٌّ حسب نوعه. الوقت الإداري لا يُحجز أبداً."
              : `لا يوجد قالب بعد — تُحجز استشارات ${name} حسب «أوقات الدوام». أضيفي فترات لتحديد أوقات كل نوع.`}
          </div>
        </div>
        {canManage && (
          <button type="button" className={css.addMain} onClick={() => addOn(WEEK[0])}>
            <Icon name="plus" size={15} color="#FFFFFF" />إضافة فترة
          </button>
        )}
      </div>

      <div className={css.legend}>
        {KINDS.map((k) => (
          <span key={k} className={css.legendItem}><i style={{ background: KIND_META[k].bg, borderColor: KIND_META[k].line }} />{KIND_META[k].label}</span>
        ))}
      </div>

      {q.loading ? <Loading /> : q.error ? <ErrorNote>تعذّر تحميل القالب: {q.error}</ErrorNote> : (
        <>
          {/* desktop: week grid */}
          <div className={css.grid} style={{ ["--rows" as string]: hours.length }}>
            <div className={css.axis}>
              <div className={css.dayHead} />
              <div className={css.axisBody}>
                {hours.map((h) => <span key={h} className="latin" style={{ top: `${pct(h)}%` }}>{hhmm(h)}</span>)}
              </div>
            </div>
            {WEEK.map((d) => (
              <div key={d} className={css.col}>
                <div className={css.dayHead}>
                  <span>{AR_DAYS[d]}</span>
                  {canManage && <button type="button" className={css.dayAdd} aria-label={`إضافة فترة يوم ${AR_DAYS[d]}`} onClick={() => addOn(d)}><Icon name="plus" size={13} color={C.accent} /></button>}
                </div>
                <div className={css.colBody}>
                  {hours.map((h) => <div key={h} className={css.hourLine} style={{ top: `${pct(h)}%` }} />)}
                  {blocks.filter((b) => b.weekday === d).map((b) => {
                    const k = KIND_META[b.kind as BlockKind];
                    const s = toMin(hm(b.starts)), e = toMin(hm(b.ends));
                    return (
                      <button key={b.id} type="button" className={css.block} disabled={!canManage} onClick={() => open(b)}
                        style={{ top: `${pct(s)}%`, height: `${pct(e) - pct(s)}%`, background: k.bg, borderColor: k.line, color: k.ink }}
                        title={`${k.label} ${hm(b.starts)}–${hm(b.ends)}`}>
                        <b>{k.short}</b>
                        <span className="latin" dir="ltr">{hm(b.starts)}–{hm(b.ends)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* phone: list per day */}
          <div className={css.list}>
            {WEEK.map((d) => {
              const mine = blocks.filter((b) => b.weekday === d);
              return (
                <div key={d} className={css.row}>
                  <div className={css.rowDay}>{AR_DAYS[d]}</div>
                  <div className={css.rowChips}>
                    {mine.length === 0 && <span className={css.none}>لا فترات</span>}
                    {mine.map((b) => {
                      const k = KIND_META[b.kind as BlockKind];
                      return (
                        <button key={b.id} type="button" className={css.chip} disabled={!canManage} onClick={() => open(b)} style={{ background: k.bg, borderColor: k.line, color: k.ink }}>
                          <b>{k.short}</b><span className="latin" dir="ltr">{hm(b.starts)}–{hm(b.ends)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {canManage && <button type="button" className={css.dayAdd} aria-label={`إضافة فترة يوم ${AR_DAYS[d]}`} onClick={() => addOn(d)}><Icon name="plus" size={13} color={C.accent} /></button>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {lim.data && <LimitsRow initial={lim.data} canManage={canManage} />}

      {draft && <BlockModal staffId={staffId} draft={draft} onClose={() => setDraft(null)} />}
    </section>
  );
}

function LimitsRow({ initial, canManage }: { initial: ConsultLimits; canManage: boolean }) {
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const key = JSON.stringify(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setV(initial); }, [key]);
  const dirty = JSON.stringify(v) !== key;
  async function save() {
    setBusy(true); setMsg(null);
    try { await saveConsultLimits(v); setMsg({ ok: true, text: "حُفظت إعدادات الاستشارات." }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) }); } finally { setBusy(false); }
  }
  const sel = (label: string, help: string, value: number, choices: number[], unit: (n: number) => string, on: (n: number) => void) => (
    <label className={css.limit}>
      <span className={css.limitLabel}>{label}</span>
      <select className={`${css.limitSel} latin`} dir="ltr" value={value} disabled={!canManage} aria-label={label}
        onChange={(e) => { setMsg(null); on(Number(e.target.value)); }}>
        {(choices.includes(value) ? choices : [value, ...choices]).map((n) => <option key={n} value={n}>{unit(n)}</option>)}
      </select>
      <span className={css.limitHelp}>{help}</span>
    </label>
  );
  return (
    <div className={css.limits}>
      {sel("راحة بين الاستشارات", "دقائق فارغة قبل وبعد كل استشارة.", v.bufferMin, BUFFER_CHOICES, (n) => (n === 0 ? "بلا راحة" : `${n} د`), (n) => setV({ ...v, bufferMin: n }))}
      {sel("الحد اليومي للاستشارات", "عند بلوغه تختفي أوقاتها من التطبيق ورابط الحجز في ذلك اليوم. الاستقبال يستطيع التجاوز مع تنبيه.", v.dailyMax, MAX_CHOICES, (n) => (n === 0 ? "بلا حد" : `${n}`), (n) => setV({ ...v, dailyMax: n }))}
      {canManage && (
        <div className={css.limitFoot}>
          {msg && <span style={{ color: msg.ok ? C.okDeep : C.danger, fontSize: 13, fontWeight: 600 }}>{msg.text}</span>}
          <button type="button" className={css.saveBtn} disabled={busy || !dirty} onClick={save}>{busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}</button>
        </div>
      )}
    </div>
  );
}

function BlockModal({ staffId, draft, onClose }: { staffId: string; draft: Draft; onClose: () => void }) {
  const [d, setD] = useState(draft);
  const [busy, setBusy] = useState<"save" | "del" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const edit = !!draft.id;

  async function save() {
    if (toMin(d.ends) <= toMin(d.starts)) { setErr("وقت النهاية يجب أن يكون بعد البداية."); return; }
    setBusy("save"); setErr(null);
    try { await saveBlock({ ...d, staff_id: staffId }); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(null); }
  }
  async function remove() {
    if (!draft.id || !confirm(`حذف فترة «${KIND_META[draft.kind].short}» يوم ${AR_DAYS[draft.weekday]} ${draft.starts}–${draft.ends} من القالب؟`)) return;
    setBusy("del"); setErr(null);
    try { await deactivateBlock(draft.id); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(null); }
  }

  return (
    <Modal open onClose={onClose} title={edit ? "تعديل فترة" : "إضافة فترة إلى القالب"} width={500}
      footer={
        <div className={css.modalFoot}>
          {edit && (
            <button type="button" className={css.delBtn} onClick={remove} disabled={!!busy}>
              <Icon name="trash" size={15} color={C.danger} />{busy === "del" ? "جارٍ الحذف…" : "حذف الفترة"}
            </button>
          )}
          <span className={css.footSpacer} />
          <button type="button" className={css.cancelBtn} onClick={onClose} disabled={!!busy}>إلغاء</button>
          <button type="button" className={css.saveBtn} onClick={save} disabled={!!busy}>{busy === "save" ? "جارٍ الحفظ…" : "حفظ"}</button>
        </div>
      }>
      <div className={css.form}>
        <div className={css.kindPick} role="radiogroup" aria-label="نوع الفترة">
          {KINDS.map((k) => {
            const m = KIND_META[k], on = d.kind === k;
            return (
              <button key={k} type="button" role="radio" aria-checked={on} className={css.kindBtn} onClick={() => setD({ ...d, kind: k })}
                style={on ? { background: m.bg, borderColor: m.ink, color: m.ink } : undefined}>
                <i style={{ background: m.bg, borderColor: m.line }} />{m.short}
              </button>
            );
          })}
        </div>
        <div className={css.kindHelp}>{KIND_META[d.kind].label}{d.kind === "review" ? " — إن لم توجد فترات مراجعات تُحجز المراجعات ضمن الفترات الحضورية." : d.kind === "admin" ? " — لا يظهر للحجز أبداً." : ""}</div>
        <Select label="اليوم" value={String(d.weekday)} onChange={(v) => setD({ ...d, weekday: Number(v) })}
          options={WEEK.map((w) => ({ value: String(w), label: AR_DAYS[w] }))} />
        <div className={css.timeRow}>
          <Select label="من" value={d.starts} onChange={(v) => setD({ ...d, starts: v })} options={TIMES.slice(0, -1).map((t) => ({ value: t, label: t }))} />
          <Select label="إلى" value={d.ends} onChange={(v) => setD({ ...d, ends: v })} options={TIMES.slice(1).map((t) => ({ value: t, label: t }))} />
        </div>
        {err && <ErrorNote>{err}</ErrorNote>}
      </div>
    </Modal>
  );
}
