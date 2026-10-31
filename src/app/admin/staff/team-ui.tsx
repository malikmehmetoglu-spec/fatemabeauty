"use client";

/** Shared bits for the team screens (team, shifts, attendance, payroll, commissions, roles). */
import { arError } from "@/lib/arError";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listStaff, staffPhoto, type Staff } from "@/lib/db/staff";
import { initials } from "@/lib/data";
import { R } from "@/lib/routes";
import { C, SELECTED, SHB } from "@/lib/tokens";

export function useTeam() {
  const q = useQuery(["staff", "all"], listStaff);
  const list = q.data ?? [];
  const byId = new Map(list.map((s) => [s.id, s]));
  return { ...q, list, active: list.filter((s) => s.active), byId };
}

export function TeamTabs() {
  const path = usePathname();
  const tabs: [string, string, string][] = [
    ["users", "الفريق", R.W_Staff], ["clock", "أوقات الدوام", R.W_Shifts], ["check", "الحضور والإجازات", R.W_Attendance],
    ["wallet", "الرواتب", R.W_Payroll], ["chart", "العمولات", R.W_Commissions], ["shield", "الأدوار والصلاحيات", R.W_Roles],
  ];
  return (
    <nav aria-label="أقسام الفريق" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {tabs.map(([icon, label, href]) => {
        const on = path === href || path === href.replace(/\/$/, "");
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} style={{
            ...(on ? SELECTED : { background: C.white, boxShadow: SHB }), height: 40, borderRadius: 20, padding: "0 16px",
            display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: on ? 700 : 600, color: on ? C.accent : C.sub,
          }}>
            <Icon name={icon} size={16} color={on ? C.accent : C.navIcon} />{label}
          </Link>
        );
      })}
    </nav>
  );
}

export function StaffAvatar({ s, size = 40 }: { s: Pick<Staff, "name" | "photo_url">; size?: number }) {
  const img = staffPhoto(s);
  return (
    <span style={{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, overflow: "hidden", background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent, fontSize: size * 0.36 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials(s.name)}
    </span>
  );
}

export function StaffCell({ s, sub }: { s: Staff | undefined; sub?: string }) {
  if (!s) return <span style={{ color: C.muted }}>—</span>;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <StaffAvatar s={s} size={34} />
      <span style={{ lineHeight: 1.3, minWidth: 0 }}>
        <b style={{ fontSize: 13.5 }}>{s.name}</b>
        {sub !== undefined && <div style={{ fontSize: 11.5, color: C.sub2 }}>{sub}</div>}
      </span>
    </span>
  );
}

export function RowBtn({ icon, label, onClick, color = C.accent, iconOnly }: { icon: string; label: string; onClick: () => void; color?: string; iconOnly?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} style={{ height: 34, ...(iconOnly ? { width: 34, padding: 0, justifyContent: "center", flexShrink: 0 } : { padding: "0 12px" }), borderRadius: 17, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
      <Icon name={icon} color={color} size={iconOnly ? 15 : 14} stroke={2} />{iconOnly ? null : label}
    </button>
  );
}

export const errText = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (/only the owner/i.test(m)) return "هذه العملية للمدير العام فقط.";
  if (/row-level security|permission/i.test(m)) return "ليست لديكِ صلاحية لهذه العملية.";
  if (/duplicate key/i.test(m)) return "يوجد سجل مطابق بالفعل.";
  return arError(e);
};
