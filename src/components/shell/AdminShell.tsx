"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSession, ROLE_LABEL } from "@/lib/supabase/session";
import { BG_WIDE, C, SELECTED, SHB } from "@/lib/tokens";
import { R } from "@/lib/routes";
import { Icon, Logo } from "@/components/ui";
import { staffPhoto } from "@/lib/db/staff";
import { useQuery } from "@/lib/db/query";
import { pendingCount } from "@/lib/db/bookingRequests";
import { disableAlerts, miraAttention } from "@/lib/db/mira";
import { dueCount } from "@/lib/db/writtenConsult";
import { Blobs } from "./PhoneScreen";
import s from "./admin.module.css";
import { ChangePasswordDialog } from "./ChangePassword";
import { AdminInstall } from "@/components/pwa/AdminInstall";

export type AdminSection =
  | "لوحة القيادة" | "المواعيد" | "الأدوار" | "المراجعات" | "ميرا" | "جدولي" | "يوم فاطمة" | "الاستشارات المكتوبة" | "المالية" | "المخزون والأجهزة"
  | "فريق العمل" | "التسويق والولاء" | "تثبيت التطبيق" | "المتجر" | "التقارير" | "الإعدادات";

const NAV: [string, AdminSection, string][] = [
  ["dash", "لوحة القيادة", R.W_Dashboard],
  ["cal", "المواعيد", R.W_Calendar],
  ["tv", "الأدوار", R.W_Queue],
  ["users", "المراجعات", R.W_Patients],
  ["msg", "ميرا", R.W_Mira],
  ["sparkle", "جدولي", R.W_MyDay],
  ["star", "يوم فاطمة", R.W_FatemaDay],
  ["msg", "الاستشارات المكتوبة", R.W_WrittenConsults],
  ["wallet", "المالية", R.W_Cashier],
  ["box", "المخزون والأجهزة", R.W_Inventory],
  ["badge", "فريق العمل", R.W_Staff],
  ["megaphone", "التسويق والولاء", R.W_Offers],
  ["download", "تثبيت التطبيق", R.W_Installs],
  ["bag", "المتجر", R.W_Products],
  ["chart", "التقارير", R.W_Reports],
  ["settings", "الإعدادات", R.W_Services],
];

type Role = "owner" | "admin" | "specialist" | "reception" | "accountant";

/** Which roles see each section (owner and admin always see everything). Mirrors the RLS rules in the database. */
const SECTION_ROLES: Record<AdminSection, Role[]> = {
  "لوحة القيادة": ["accountant"],
  "المواعيد": ["reception", "specialist"],
  "الأدوار": ["specialist"],
  "المراجعات": ["reception", "specialist"],
  "ميرا": [],
  "جدولي": ["specialist", "accountant"],
  // consultant screens: specialists only when staff.is_consultant (see CONSULT_ONLY)
  "يوم فاطمة": ["specialist"],
  "الاستشارات المكتوبة": ["specialist"],
  "المالية": ["accountant"],
  "المخزون والأجهزة": ["specialist"],
  "فريق العمل": ["accountant"],
  "التسويق والولاء": [],
  "تثبيت التطبيق": [],
  "المتجر": [],
  "التقارير": ["accountant"],
  "الإعدادات": [],
};

/** Sub-pages limited further than their section (path prefix → roles; owner/admin always pass). */
const SUB_ROLES: [string, Role[]][] = [
  [R.W_Receivables, ["accountant"]],
  [R.W_Expenses, ["accountant"]],
  [R.W_FinanceReports, ["accountant"]],
  [R.W_WcPayments, []],
  ["/admin/finance/commissions/", ["accountant"]],
  [R.W_Products, []],
  ["/admin/store/storefront/", []],
  [R.W_Inventory, []],
  [R.W_Purchases, []],
  [R.W_Stocktake, []],
  [R.W_Devices, ["specialist"]],
  ["/admin/inventory/locations/", []],
  [R.W_Staff, ["accountant"]],
];

const full = (r: Role) => r === "owner" || r === "admin";
/** Sections for the consultant (staff.is_consultant) and admin only. Mirrors private.is_consult_staff() in the database. */
const CONSULT_ONLY: AdminSection[] = ["يوم فاطمة", "الاستشارات المكتوبة"];
export const canSee = (r: Role, sec: AdminSection, consultant = false) =>
  full(r) || (SECTION_ROLES[sec].includes(r) && (!CONSULT_ONLY.includes(sec) || consultant));
const pathOk = (r: Role, path: string) => {
  if (full(r)) return true;
  const n = (h: string) => h.replace(/\/$/, "") + "/";
  const hit = SUB_ROLES.filter(([pre]) => n(path).startsWith(n(pre))).sort((a, b) => b[0].length - a[0].length)[0];
  return !hit || hit[1].includes(r);
};
/** First page this role may open — used as its landing page. */
export const homeFor = (r: Role, consultant = false) => NAV.find(([, sec]) => canSee(r, sec, consultant))?.[2] ?? R.W_MyDay;

/**
 * Admin web frame: glass sidebar on the right (RTL), top bar with title + search + bell, fluid content area.
 * Designed at 1440×900; the content area is fluid (min width 1100) and the page scrolls vertically if needed.
 */
export function AdminShell({ active, title, subtitle, actions, children, overlay }: {
  active: AdminSection; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; overlay?: ReactNode;
}) {
  const router = useRouter();
  const { loading, staff } = useSession();
  const path = usePathname() || "";
  const [pwOpen, setPwOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const pend = useQuery(["booking-requests", "count"], pendingCount, { enabled: !!staff });
  const pending = pend.data ?? 0;
  const mira = useQuery(["mira", "attention"], miraAttention, { enabled: !!staff && canSee(staff.role as Role, "ميرا") });
  const miraCount = mira.data ?? 0;
  useEffect(() => { if (!loading && !staff) router.replace(R.W_Login); }, [loading, staff, router]);
  const role = staff?.role as Role | undefined;
  const cons = !!staff?.is_consultant;
  const allowed = !role || (canSee(role, active, cons) && pathOk(role, path));
  const wcDue = useQuery(["wc", "due"], dueCount, { enabled: !!role && canSee(role, "الاستشارات المكتوبة", cons) });
  useEffect(() => { if (role && active === "لوحة القيادة" && !canSee(role, active)) router.replace(homeFor(role)); }, [role, active, router]);
  if (loading || !staff || !role) {
    return <div style={{ minHeight: "100dvh", background: BG_WIDE, display: "flex", alignItems: "center", justifyContent: "center" }}><Logo height={90} style={{ opacity: 0.6 }} /></div>;
  }
  const signOut = async () => { await disableAlerts().catch(() => {}); await supabase.auth.signOut(); router.replace(R.W_Login); };
  const search = () => { const t = q.trim(); if (t) router.push(`${R.W_Patients}?q=${encodeURIComponent(t)}`); };
  return (
    <div dir="rtl" className={s.root} style={{ background: BG_WIDE }}>
      <Blobs width={900} />
      <div className={s.topbar}>
        <button type="button" className={s.menuBtn} onClick={() => setMenu(true)} aria-label="القائمة" style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: C.white, boxShadow: SHB, alignItems: "center", justifyContent: "center" }}>
          <Icon name="list" color={C.accent} size={20} />
        </button>
        <Link href={homeFor(role)}><Logo height={40} /></Link>
        <span style={{ width: 44 }} />
      </div>
      {menu && <div className={s.scrim} onClick={() => setMenu(false)} aria-hidden />}
      <aside className={`${s.aside} ${menu ? s.asideOpen : ""}`} onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setMenu(false); }}>
        <Link href={homeFor(role)} style={{ padding: "0 10px 16px", display: "flex", justifyContent: "center" }}>
          <Logo height={78} />
        </Link>
        <nav aria-label="أقسام لوحة الإدارة" className={s.nav}>
          {NAV.filter(([, sec]) => canSee(role, sec, cons)).map(([icon, label, href]) =>
            label === active ? (
              <Link key={label} href={href} aria-current="page" style={{ ...SELECTED, height: 44, borderRadius: 22, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700 }}>
                <Icon name={icon} color={C.accent} size={19} stroke={1.9} />{label}{label === "المواعيد" && pending > 0 && <span title="طلبات حجز بانتظار التأكيد" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{pending}</span>}{label === "ميرا" && miraCount > 0 && <span title="محادثات تحتاج تدخّلكِ" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{miraCount}</span>}{label === "الاستشارات المكتوبة" && (wcDue.data ?? 0) > 0 && <span title="استشارات بانتظار الرد" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{wcDue.data}</span>}
              </Link>
            ) : (
              <Link key={label} href={href} style={{ height: 44, borderRadius: 22, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: C.navText }}>
                <Icon name={icon} color={C.navIcon} size={19} />{label}{label === "المواعيد" && pending > 0 && <span title="طلبات حجز بانتظار التأكيد" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{pending}</span>}{label === "ميرا" && miraCount > 0 && <span title="محادثات تحتاج تدخّلكِ" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{miraCount}</span>}{label === "الاستشارات المكتوبة" && (wcDue.data ?? 0) > 0 && <span title="استشارات بانتظار الرد" className="latin" style={{ marginInlineStart: "auto", minWidth: 22, height: 22, borderRadius: 11, padding: "0 7px", background: "#D0679A", color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{wcDue.data}</span>}
              </Link>
            ),
          )}
        </nav>
        <AdminInstall />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 20, background: "#F8F2FA" }}>
          {staffPhoto(staff) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={staffPhoto(staff) as string} alt="" width={38} height={38} style={{ width: 38, height: 38, borderRadius: 19, objectFit: "cover", border: "2px solid #FFFFFF", flexShrink: 0 }} />
          ) : <span style={{ width: 38, height: 38, borderRadius: 19, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.accent, flexShrink: 0 }}>{staff.name.charAt(0)}</span>}
          <div style={{ lineHeight: 1.3, flexGrow: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{staff.name}</div>
            <div style={{ fontSize: 11, color: C.sub2 }}>{staff.title || ROLE_LABEL[staff.role]}</div>
          </div>
          <button type="button" onClick={() => setPwOpen(true)} aria-label="تغيير كلمة المرور" title="تغيير كلمة المرور" style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="lock" color={C.sub2} size={17} />
          </button>
          <button type="button" onClick={signOut} aria-label="تسجيل الخروج" title="تسجيل الخروج" style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="logout" color={C.sub2} size={17} />
          </button>
        </div>
      </aside>
      <main className={s.main}>
        <header className={s.header}>
          <div style={{ lineHeight: 1.3, minWidth: 0 }}>
            <h1 className={s.title}>{title}</h1>
            {subtitle && <div style={{ fontSize: 13, color: C.sub2 }}>{subtitle}</div>}
          </div>
          <div className={s.tools}>
            {actions}
            <form className={s.search} role="search" onSubmit={(e) => { e.preventDefault(); search(); }}>
              <Icon name="search" color={C.muted} size={18} />
              <input aria-label="بحث عن مراجعة" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي عن مراجعة أو رقم ملف" />
            </form>
          </div>
        </header>
        {allowed ? <><SubNav section={active} role={role} />{children}</> : (
          <div role="alert" style={{ margin: "40px auto", maxWidth: 440, textAlign: "center", padding: "32px 28px", borderRadius: 28, background: "rgba(255,255,255,0.86)", boxShadow: SHB, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Icon name="lock" color={C.accent} size={34} />
            <b style={{ fontSize: 18 }}>هذه الصفحة خارج صلاحيات دوركِ</b>
            <div style={{ fontSize: 13.5, color: C.sub2 }}>دوركِ الحالي: {ROLE_LABEL[role]}. إن احتجتِ الوصول إليها اطلبي ذلك من الإدارة.</div>
            <Link href={homeFor(role)} style={{ ...SELECTED, height: 42, borderRadius: 21, padding: "0 20px", display: "inline-flex", alignItems: "center", fontWeight: 700 }}>العودة</Link>
          </div>
        )}
      </main>
      {overlay}
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}

const SUB: Partial<Record<AdminSection, [string, string][]>> = {
  "المواعيد": [["التقويم", R.W_Calendar], ["طلبات الحجز", R.W_BookingRequests]],
  "المالية": [["الكاشير", R.W_Cashier], ["الفواتير", R.W_Invoices], ["الاستشارات المكتوبة", R.W_WcPayments], ["الذمم والأقساط", R.W_Receivables], ["المصاريف", R.W_Expenses], ["التقارير المالية", R.W_FinanceReports]],
  "المتجر": [["المنتجات", R.W_Products], ["الطلبات والتوصيل", R.W_Orders], ["واجهة المتجر", "/admin/store/storefront/"]],
  "المخزون والأجهزة": [["المخزون", R.W_Inventory], ["المشتريات", R.W_Purchases], ["الجرد", R.W_Stocktake], ["المواقع", "/admin/inventory/locations/"], ["الأجهزة", R.W_Devices]],
  "الإعدادات": [["الخدمات", R.W_Services], ["الغرف والأجهزة", R.W_Rooms], ["الأدوار والصلاحيات", R.W_Roles], ["السياسات", R.W_Policies], ["النداء", R.W_CallSettings], ["سجل العمليات", R.W_Audit]],
};

/** Sub-section tabs for sections that have several pages. */
function SubNav({ section, role }: { section?: AdminSection; role: Role }) {
  const path = usePathname() || "";
  const items = section ? SUB[section]?.filter(([, href]) => pathOk(role, href)) : undefined;
  if (!items || items.length < 2) return null;
  const norm = (h: string) => h.replace(/\/$/, "");
  return (
    <nav aria-label="أقسام فرعية" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map(([label, href]) => {
        const on = norm(path) === norm(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} style={{ height: 38, padding: "0 16px", borderRadius: 19, display: "flex", alignItems: "center", fontSize: 13.5, fontWeight: 700,
            ...(on ? SELECTED : { background: "rgba(255,255,255,0.7)", color: C.sub, border: "1px solid #EADDEF" }) }}>{label}</Link>
        );
      })}
    </nav>
  );
}
