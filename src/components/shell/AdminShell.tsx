"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSession, ROLE_LABEL } from "@/lib/supabase/session";
import { BG_WIDE, C, SELECTED, SH, SHB } from "@/lib/tokens";
import { R } from "@/lib/routes";
import { Icon, IconButton, Logo } from "@/components/ui";
import { staffPhoto } from "@/lib/db/staff";
import { Blobs } from "./PhoneScreen";
import { ChangePasswordDialog } from "./ChangePassword";

export type AdminSection =
  | "لوحة القيادة" | "المواعيد" | "الأدوار" | "المراجعات" | "جدولي" | "المالية" | "المخزون والأجهزة"
  | "فريق العمل" | "التسويق والولاء" | "تثبيت التطبيق" | "المتجر" | "التقارير" | "الإعدادات";

const NAV: [string, AdminSection, string][] = [
  ["dash", "لوحة القيادة", R.W_Dashboard],
  ["cal", "المواعيد", R.W_Calendar],
  ["tv", "الأدوار", R.W_Queue],
  ["users", "المراجعات", R.W_Patients],
  ["sparkle", "جدولي", R.W_MyDay],
  ["wallet", "المالية", R.W_Cashier],
  ["box", "المخزون والأجهزة", R.W_Inventory],
  ["badge", "فريق العمل", R.W_Staff],
  ["megaphone", "التسويق والولاء", R.W_Offers],
  ["download", "تثبيت التطبيق", R.W_Installs],
  ["bag", "المتجر", R.W_Products],
  ["chart", "التقارير", R.W_Reports],
  ["settings", "الإعدادات", R.W_Services],
];

/**
 * Admin web frame: glass sidebar on the right (RTL), top bar with title + search + bell, fluid content area.
 * Designed at 1440×900; the content area is fluid (min width 1100) and the page scrolls vertically if needed.
 */
export function AdminShell({ active, title, subtitle, actions, children, overlay }: {
  active: AdminSection; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode; overlay?: ReactNode;
}) {
  const router = useRouter();
  const { loading, staff } = useSession();
  const [pwOpen, setPwOpen] = useState(false);
  useEffect(() => { if (!loading && !staff) router.replace(R.W_Login); }, [loading, staff, router]);
  if (loading || !staff) {
    return <div style={{ minHeight: "100dvh", background: BG_WIDE, display: "flex", alignItems: "center", justifyContent: "center" }}><Logo height={90} style={{ opacity: 0.6 }} /></div>;
  }
  const signOut = async () => { await supabase.auth.signOut(); router.replace(R.W_Login); };
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", minWidth: 1280, background: BG_WIDE, color: C.ink, display: "flex", position: "relative", isolation: "isolate", overflowX: "clip" }}>
      <Blobs width={900} />
      <aside style={{
        width: 248, flexShrink: 0, margin: "16px 16px 16px 0", borderRadius: 30, background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: SH,
        padding: "22px 14px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 16,
        height: "calc(100dvh - 32px)", minHeight: 820,
      }}>
        <Link href={R.W_Dashboard} style={{ padding: "0 10px 16px", display: "flex", justifyContent: "center" }}>
          <Logo height={78} />
        </Link>
        <nav aria-label="أقسام لوحة الإدارة" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(([icon, label, href]) =>
            label === active ? (
              <Link key={label} href={href} aria-current="page" style={{ ...SELECTED, height: 44, borderRadius: 22, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700 }}>
                <Icon name={icon} color={C.accent} size={19} stroke={1.9} />{label}
              </Link>
            ) : (
              <Link key={label} href={href} style={{ height: 44, borderRadius: 22, padding: "0 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: C.navText }}>
                <Icon name={icon} color={C.navIcon} size={19} />{label}
              </Link>
            ),
          )}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 20, background: "#F8F2FA" }}>
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
      <main style={{ flexGrow: 1, minWidth: 0, padding: "26px 28px 24px 16px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ lineHeight: 1.3 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink }}>{title}</h1>
            {subtitle && <div style={{ fontSize: 13, color: C.sub2 }}>{subtitle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {actions}
            <label style={{ height: 46, width: 260, borderRadius: 23, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", color: C.muted, fontSize: 13 }}>
              <Icon name="search" color={C.muted} size={18} />
              <input aria-label="بحث" placeholder="ابحثي عن مراجعة أو رقم ملف" style={{ border: "none", background: "transparent", fontSize: 13, flex: 1, minWidth: 0 }} />
            </label>
            <IconButton icon="bell" label="الإشعارات" badge />
          </div>
        </header>
        {children}
      </main>
      {overlay}
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
