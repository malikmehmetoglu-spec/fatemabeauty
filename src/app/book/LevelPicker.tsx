"use client";

/**
 * «مدة الجلسة»: the client sees every active level of the service (name, duration, SYP price, one-line why)
 * and picks one. A small time bar per option makes the point that the price follows the time.
 * Used by /book (classic + card flow) and the patient app booking (/booking).
 */
import { Icon } from "@/components/ui";
import { money } from "@/lib/format";
import { durationLabel, LEVEL_BLURB, type PubLevel } from "@/lib/db/publicBooking";
import { C } from "@/lib/tokens";
import s from "./levels.module.css";

export const LEVEL_NOTE = "سعر الجلسة يتبع وقتها: كل دقيقة مع أخصائيتكِ مخصّصة لكِ وحدكِ. إن لم تكوني متأكدة، اختاري «عادية» وستقترح الأخصائية المستوى الأنسب بعد التقييم.";

export default function LevelPicker({ levels, value, onChange, layout = "row", assignedId, compact }: {
  levels: PubLevel[]; value: string | null; onChange: (id: string) => void;
  /** row = side by side (wraps under 600px), stack = one per line (phone card flow) */
  layout?: "row" | "stack"; assignedId?: string | null; compact?: boolean;
}) {
  const max = Math.max(...levels.map((l) => l.minutes), 1);
  return (
    <div>
      <div className={`${s.grid} ${layout === "stack" ? s.stack : ""}`} role="radiogroup" aria-label="مدة الجلسة" data-noswipe>
        {levels.map((l, i) => {
          const on = value === l.id;
          return (
            <button key={l.id} type="button" role="radio" aria-checked={on} className={`${s.opt} ${on ? s.on : ""} ${compact ? s.compact : ""}`}
              style={{ animationDelay: `${i * 50}ms` }} onClick={() => onChange(l.id)}>
              <span className={s.top}>
                <span className={s.radio} aria-hidden>{on && <Icon name="check" size={13} color="#fff" stroke={3} />}</span>
                <span className={s.name}>{l.name}</span>
                {assignedId === l.id && <span className={s.tag}>حدّدتها أخصائيتكِ</span>}
              </span>
              <span className={s.dur}><Icon name="clock" size={15} color={C.accentMid} />{durationLabel(l.minutes)}</span>
              <span className={s.bar} aria-hidden><i style={{ width: `${Math.max(12, (l.minutes / max) * 100)}%` }} /></span>
              {LEVEL_BLURB[l.level] && <span className={s.blurb}>{LEVEL_BLURB[l.level]}</span>}
              <span className={s.price}>{money(l.price)}</span>
            </button>
          );
        })}
      </div>
      <p className={s.note}><Icon name="info" size={16} color={C.accentMid} /><span>{LEVEL_NOTE}</span></p>
    </div>
  );
}
