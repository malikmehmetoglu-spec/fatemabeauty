"use client";

/**
 * W_Roles.dc.html — الأدوار والصلاحيات (live).
 * Read-only matrix that mirrors the Row Level Security rules in the database, plus the real members of each role.
 */
import { AdminShell } from "@/components/shell";
import { Card, ErrorNote, Icon, Loading, SectionTitle } from "@/components/ui";
import { ROLES, type Role } from "@/lib/db/staff";
import { ROLE_LABEL } from "@/lib/supabase/session";
import { C } from "@/lib/tokens";
import { StaffAvatar, TeamTabs, useTeam } from "@/app/admin/staff/team-ui";

type Level = "full" | "read" | "own" | "none";
const ALL: Role[] = ["admin", "specialist", "reception", "accountant"];
const rule = (write: Role[], read: Role[] | "all" = "all", own = false): Record<Role, Level> =>
  Object.fromEntries(ROLES.map((r) => [r, r === "owner" || write.includes(r) ? "full" : read === "all" || read.includes(r) ? "read" : own ? "own" : "none"])) as Record<Role, Level>;

/** Mirrors supabase/migrations RLS policies (owner passes every check). */
const MATRIX: [string, Record<Role, Level>][] = [
  ["المراجِعات والملفات", rule(ALL)],
  ["المواعيد والأدوار", rule(ALL)],
  ["الملاحظات والوصفات الطبية", rule(["admin", "specialist"], ["admin", "specialist"])],
  ["الفواتير والصندوق", rule(["admin", "reception", "accountant"])],
  ["المصاريف", rule(["admin", "accountant"], ["admin", "accountant"])],
  ["المخزون والمتجر", rule(["admin", "reception"])],
  ["طلبات المتجر", rule(ALL)],
  ["الأجهزة", rule(["admin", "specialist"])],
  ["الخدمات والباقات والغرف والإعدادات", rule(["admin"])],
  ["فريق العمل", rule(["admin"])],
  ["الورديات", rule(["admin"])],
  ["الحضور", rule(["admin"], ["accountant"], true)],
  ["الإجازات", rule(["admin"], ["accountant"], true)],
  ["الرواتب والعمولات", rule(["admin", "accountant"], ["admin", "accountant"], true)],
  ["سجل العمليات", rule([], ["admin"])],
];

const CELL: Record<Level, { label: string; bg: string; fg: string; icon: string }> = {
  full: { label: "كاملة", bg: "#E6F4EC", fg: C.okDeep, icon: "check" },
  read: { label: "عرض", bg: "#F3E8F6", fg: C.accent, icon: "eye" },
  own: { label: "الخاص بها", bg: "#FCF1DE", fg: "#8A5A12", icon: "user" },
  none: { label: "لا", bg: "#F4F1F5", fg: C.muted, icon: "x" },
};

export default function RolesPage() {
  const team = useTeam();
  return (
    <AdminShell active="الإعدادات" title="الأدوار والصلاحيات" subtitle="الصلاحيات مطبّقة في قاعدة البيانات نفسها؛ لتغيير صلاحيات موظفة غيّري دورها من صفحة الفريق">
      <TeamTabs />
      <Card padding="10px 20px">
        <div role="table" style={{ display: "grid", gridTemplateColumns: `2.2fr repeat(${ROLES.length}, 1fr)` }}>
          <div role="columnheader" style={{ padding: "12px 0", fontSize: 12, color: C.sub2, fontWeight: 600 }}>القسم</div>
          {ROLES.map((r) => <div role="columnheader" key={r} style={{ padding: "12px 0", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{ROLE_LABEL[r]}</div>)}
          {MATRIX.map(([area, levels]) => (
            <div role="row" key={area} style={{ display: "contents" }}>
              <div role="cell" style={{ padding: "10px 0", borderTop: `1px solid ${C.line}`, fontSize: 13.5, fontWeight: 600 }}>{area}</div>
              {ROLES.map((r) => {
                const c = CELL[levels[r]];
                return (
                  <div role="cell" key={r} style={{ padding: "8px 0", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "center" }}>
                    <span style={{ height: 28, padding: "0 10px", borderRadius: 14, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Icon name={c.icon} size={13} color={c.fg} stroke={2.2} />{c.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
      <div style={{ fontSize: 12.5, color: C.sub2 }}>المدير العام يملك كل الصلاحيات، وهو وحده من يمنح دور «الإدارة» ويعدّل حسابه. «الخاص بها»: ترى الموظفة سجلها فقط.</div>

      <SectionTitle>أعضاء كل دور</SectionTitle>
      {team.loading ? <Loading /> : team.error ? <ErrorNote>{team.error}</ErrorNote> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 14 }}>
          {ROLES.map((r) => {
            const members = team.active.filter((s) => s.role === r);
            return (
              <Card key={r} padding="16px 18px" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 15 }}>{ROLE_LABEL[r]}</b>
                  <span className="latin" style={{ fontSize: 13, color: C.sub2 }}>{members.length}</span>
                </div>
                {members.length === 0 ? <div style={{ fontSize: 12.5, color: C.muted }}>لا أعضاء بعد</div> : members.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <StaffAvatar s={s} size={32} />
                    <div style={{ lineHeight: 1.3 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11.5, color: C.sub2 }}>{s.title || "—"}</div></div>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
