/**
 * Per-staff permissions (staff.permissions). null = the role's default set.
 * Mirrors private.role_default_perms() / private.has_perm() in the database (migration 0183).
 */
import type { Tables } from "@/lib/supabase/client";

export type Perm =
  | "dashboard" | "calendar" | "queue" | "patients" | "patients_medical" | "kiosk_desk"
  | "cashier" | "finance" | "written_consults_payments" | "package_requests"
  | "inventory" | "devices" | "store" | "staff" | "marketing" | "reports" | "settings" | "mira";

export type PermGroup = "العمل اليومي" | "المال" | "الإدارة";

export const PERMS: { key: Perm; label: string; hint: string; group: PermGroup }[] = [
  { key: "calendar", label: "المواعيد", hint: "التقويم والحجز وطلبات الحجز", group: "العمل اليومي" },
  { key: "queue", label: "الأدوار", hint: "شاشة الأدوار والجلسات الجارية", group: "العمل اليومي" },
  { key: "patients", label: "المراجعات", hint: "الملفات وبيانات التواصل", group: "العمل اليومي" },
  { key: "patients_medical", label: "السجل الطبي", hint: "الحالات والملاحظات والصور", group: "العمل اليومي" },
  { key: "kiosk_desk", label: "تابلت الاستقبال", hint: "الاستقبال وتسجيل الحضور وتجهيز الجلسة", group: "العمل اليومي" },
  { key: "dashboard", label: "لوحة القيادة", hint: "ملخص اليوم والأرقام", group: "العمل اليومي" },
  { key: "cashier", label: "الكاشير", hint: "إصدار الفواتير وقبض الدفعات والصندوق", group: "المال" },
  { key: "finance", label: "المالية الكاملة", hint: "الذمم والمصاريف والعمولات والتقارير المالية", group: "المال" },
  { key: "written_consults_payments", label: "دفعات الاستشارات المكتوبة", hint: "تأكيد دفع الاستشارات", group: "المال" },
  { key: "package_requests", label: "طلبات الباقات", hint: "تأكيد طلبات الباقات", group: "المال" },
  { key: "staff", label: "فريق العمل", hint: "الموظفات والدوام والرواتب", group: "الإدارة" },
  { key: "inventory", label: "المخزون", hint: "المخزون والمشتريات والجرد", group: "الإدارة" },
  { key: "devices", label: "الأجهزة", hint: "سجل الأجهزة وصيانتها", group: "الإدارة" },
  { key: "store", label: "المتجر", hint: "المنتجات والطلبات", group: "الإدارة" },
  { key: "marketing", label: "التسويق والولاء", hint: "العروض وتثبيت التطبيق", group: "الإدارة" },
  { key: "reports", label: "التقارير", hint: "تقارير المركز", group: "الإدارة" },
  { key: "mira", label: "ميرا", hint: "محادثات المساعدة الذكية", group: "الإدارة" },
  { key: "settings", label: "الإعدادات", hint: "الخدمات والغرف والسياسات", group: "الإدارة" },
];
export const PERM_GROUPS: PermGroup[] = ["العمل اليومي", "المال", "الإدارة"];

type Role = Tables<"staff">["role"];
const ALL = PERMS.map((p) => p.key);
export const ROLE_DEFAULTS: Record<Role, Perm[]> = {
  owner: ALL,
  admin: ALL,
  specialist: ["calendar", "queue", "patients", "patients_medical", "devices", "kiosk_desk"],
  reception: ["calendar", "patients"],
  accountant: ["dashboard", "cashier", "finance", "staff", "reports", "kiosk_desk"],
};

type PermStaff = Pick<Tables<"staff">, "role"> & { permissions?: string[] | null };
export const isCustom = (s: PermStaff) => s.role !== "owner" && Array.isArray(s.permissions);
/** Effective permission set of a staff member (owner: everything). */
export function permsOf(s: PermStaff | null | undefined): Set<Perm> {
  if (!s) return new Set();
  if (s.role === "owner") return new Set(ALL);
  return new Set((isCustom(s) ? s.permissions as Perm[] : ROLE_DEFAULTS[s.role]));
}
