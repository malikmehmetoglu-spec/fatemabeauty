"use client";

/**
 * «مستوى الجلسات» in a patient file: the level she gets by default for a service (minutes + price).
 * Used on the record page (all services) and in the session note (the session's service only).
 */
import { useState } from "react";
import { ErrorNote, Select } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listServices } from "@/lib/db/catalog";
import { levelError, levelsOf, listLevels, patientLevels, setPatientLevel, type Level } from "@/lib/db/levels";
import { C, SELECTED } from "@/lib/tokens";
import { levelPrice } from "../settings/services/levels";
import { Panel } from "./kit";

const chipStyle = (on: boolean) => ({
  minHeight: 38, padding: "4px 12px", borderRadius: 19, fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, textAlign: "center" as const,
  ...(on ? { ...SELECTED, color: C.accent } : { background: C.white, border: "1px solid #EADCF0", color: C.sub }),
});

function LevelRow({ patientId, service, name, levels, current }: { patientId: string; service: string; name: string; levels: Level[]; current: string | null }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const shown = current ?? levels[0]?.id ?? null;
  const pick = async (id: string) => {
    if (id === current) return;
    setBusy(id); setErr("");
    try { await setPatientLevel(patientId, service, id); } catch (e) { setErr(levelError(e)); } finally { setBusy(""); }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0", borderTop: "1px solid #EDE2F1" }}>
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{name}</div>
      <div role="radiogroup" aria-label={`مستوى ${name}`} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {levels.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={shown === l.id} disabled={!!busy} onClick={() => pick(l.id)} style={chipStyle(shown === l.id)}>
            {busy === l.id ? "…" : <>{l.name} · <span className="latin">{l.minutes}</span> د · {levelPrice(l)}</>}
          </button>
        ))}
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
    </div>
  );
}

export function PatientLevels({ patientId, service, title }: { patientId: string; service?: string | null; title?: string }) {
  const lv = useQuery(["levels", "all"], listLevels);
  const mine = useQuery(["levels", "patient", patientId], () => patientLevels(patientId));
  const svcs = useQuery(["catalog", "services"], listServices);
  const [extra, setExtra] = useState<string[]>([]);
  const withLevels = (svcs.data ?? []).filter((s) => levelsOf(lv.data, s.key).length > 1);
  const assigned = (mine.data ?? []).filter((x) => x.level_id);
  const keys = service ? [service] : [...new Set([...assigned.map((x) => x.service_key), ...extra])];
  const rows = keys.map((k) => withLevels.find((s) => s.key === k)).filter(Boolean) as typeof withLevels;
  const addable = withLevels.filter((s) => !keys.includes(s.key));
  if (service && !withLevels.some((s) => s.key === service)) return null;
  return (
    <Panel title={title ?? "مستوى الجلسات"} sub={service ? "يُحجز لها هذا المستوى تلقائياً في المرات القادمة" : "المدة والسعر اللذان تُحجز بهما تلقائياً لكل خدمة"}>
      {rows.map((s) => (
        <LevelRow key={s.key} patientId={patientId} service={s.key} name={s.short_name || s.name} levels={levelsOf(lv.data, s.key)}
          current={(mine.data ?? []).find((x) => x.service_key === s.key)?.level_id ?? null} />
      ))}
      {!service && !rows.length && <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>كل الخدمات بالمستوى العادي.</div>}
      {!service && addable.length > 0 && (
        <Select label="تحديد مستوى لخدمة" value="" onChange={(v) => v && setExtra((x) => [...x, v])}
          options={[{ value: "", label: "اختاري خدمة…" }, ...addable.map((s) => ({ value: s.key, label: s.short_name || s.name }))]} style={{ marginTop: 8 }} />
      )}
    </Panel>
  );
}
