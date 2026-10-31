"use client";

/**
 * «الصلاحيات» — per-staff checklist (staff.permissions). Untouched = the role's defaults;
 * any change saves a custom list («مخصّص»); «إعادة للافتراضي» clears it (null).
 */
import { useEffect, useState } from "react";
import { ErrorNote, GhostButton, Modal, SubmitButton, Tag } from "@/components/ui";
import { setStaffPermissions, type Staff } from "@/lib/db/staff";
import { PERMS, PERM_GROUPS, ROLE_DEFAULTS, isCustom, permsOf, type Perm } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { errText } from "./team-ui";

export function PermissionsDialog({ member, onClose }: { member: Staff | null; onClose: () => void }) {
  const [sel, setSel] = useState<Set<Perm>>(new Set());
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (member) { setSel(permsOf(member)); setError(""); } }, [member]);
  if (!member) return null;
  const defaults = new Set(ROLE_DEFAULTS[member.role]);
  const same = (a: Set<Perm>, b: Set<Perm>) => a.size === b.size && [...a].every((x) => b.has(x));
  const custom = !same(sel, defaults);
  const toggle = (p: Perm) => setSel((s) => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n; });

  async function save(perms: Perm[] | null) {
    if (!member) return;
    setError(""); setBusy(true);
    try { await setStaffPermissions(member.id, perms); onClose(); } catch (e) { setError(errText(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} width={640}
      title={<span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>الصلاحيات — {member.name}{custom ? <Tag kind="pink">مخصّص</Tag> : <Tag kind="gray">افتراضي الدور</Tag>}</span>}
      footer={<>
        <SubmitButton onClick={() => save(custom ? PERMS.map((p) => p.key).filter((k) => sel.has(k)) : null)} busy={busy}>حفظ الصلاحيات</SubmitButton>
        {(custom || isCustom(member)) && <GhostButton icon="refresh" onClick={() => { setSel(new Set(defaults)); save(null); }}>إعادة للافتراضي</GhostButton>}
      </>}>
      <div style={{ fontSize: 13, color: C.sub2, lineHeight: 1.8 }}>
        حدّدي الأقسام التي تستطيع <b>{member.name}</b> استخدامها. الأقسام المعلَّمة بـ«افتراضي» هي ما يمنحه دور «{ROLE_LABEL[member.role]}» تلقائياً.
        تُطبَّق الصلاحيات على القائمة الجانبية وتابلت الاستقبال وعلى قاعدة البيانات أيضاً.
      </div>
      {PERM_GROUPS.map((g) => (
        <section key={g} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{g}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {PERMS.filter((p) => p.group === g).map((p) => {
              const on = sel.has(p.key);
              return (
                <button key={p.key} type="button" role="checkbox" aria-checked={on} onClick={() => toggle(p.key)}
                  style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "8px 12px", borderRadius: 18, textAlign: "start", cursor: "pointer",
                    border: `1px solid ${on ? "#C9A3D4" : "#EADDEF"}`, background: on ? "#F6ECF8" : "rgba(255,255,255,0.8)", color: C.ink, fontFamily: "inherit" }}>
                  <span aria-hidden style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: on ? C.accent : "#fff", border: `1.5px solid ${on ? C.accent : "#D7C3DE"}`, color: "#fff", fontSize: 14, fontWeight: 700 }}>{on ? "✓" : ""}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {p.label}{defaults.has(p.key) && <span style={{ fontSize: 10.5, fontWeight: 600, color: C.sub2, background: "#F1EAF3", borderRadius: 8, padding: "1px 7px" }}>افتراضي</span>}
                    </span>
                    <span style={{ fontSize: 11.5, color: C.sub2 }}>{p.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <div style={{ fontSize: 12, color: C.sub2 }}>«مرايتي» و«يوم فاطمة» والاستشارات المكتوبة تبقى للاستشارية فقط، و«جدولي» حسب الدور.</div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Modal>
  );
}
