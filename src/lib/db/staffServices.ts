"use client";

/**
 * «الخدمات التي تقدّمها» — which services each specialist / consultant provides (table staff_services).
 * A member WITH rows provides only those services; a member with NO rows provides every service of her kind
 * (specialists → sessions, consultants → consultations). The booking functions apply the same rule server-side.
 */
import { supabase } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Assignment = { staff_id: string; service_key: string };

/** Explicit assignments only (staff read; anon has no access). */
export async function listAssignments(): Promise<Assignment[]> {
  return must(await supabase.from("staff_services").select("staff_id,service_key")) ?? [];
}

function done() { invalidate("staff_services"); invalidate("appointments"); invalidate("queue"); }

/** Replace one member's services with `keys` (empty = back to «كل خدمات قسمها»). */
export async function setStaffServices(staffId: string, keys: string[], current: Assignment[]) {
  const had = new Set(current.filter((a) => a.staff_id === staffId).map((a) => a.service_key));
  const want = new Set(keys);
  const add = [...want].filter((k) => !had.has(k)).map((service_key) => ({ staff_id: staffId, service_key }));
  const del = [...had].filter((k) => !want.has(k));
  if (add.length) must(await supabase.from("staff_services").insert(add));
  if (del.length) must(await supabase.from("staff_services").delete().eq("staff_id", staffId).in("service_key", del));
  done();
}

/**
 * Set who provides one service (from the service dialog). `provided` = staff id → keys she provides now (after fallback,
 * rpc service_providers). Only members whose state changes are touched. A member without assignments is first
 * made explicit with the services she already provides, so adding/removing one service never narrows the rest.
 */
export async function setServiceStaff(serviceKey: string, staffIds: string[], current: Assignment[], provided: Record<string, string[]>, candidates: string[]) {
  const want = new Set(staffIds);
  const add: Assignment[] = [];
  const del: string[] = [];
  for (const id of candidates) {
    const before = (provided[id] ?? []).includes(serviceKey), after = want.has(id);
    if (before === after) continue;
    const mine = current.filter((a) => a.staff_id === id).map((a) => a.service_key);
    if (mine.length) {
      if (after) add.push({ staff_id: id, service_key: serviceKey });
      else if (mine.length === 1) throw new Error("هذه آخر خدمة محدّدة لإحدى الأخصائيات. عدّلي خدماتها من «فريق العمل» بدل إزالتها من هنا.");
      else del.push(id);
    } else {
      const keep = (provided[id] ?? []).filter((k) => k !== serviceKey);
      if (!after && keep.length === 0) throw new Error("لا يمكن إزالة الخدمة الوحيدة لإحدى الأخصائيات من هنا. عدّلي خدماتها من «فريق العمل».");
      for (const k of after ? [...keep, serviceKey] : keep) add.push({ staff_id: id, service_key: k });
    }
  }
  if (add.length) must(await supabase.from("staff_services").insert(add));
  if (del.length) must(await supabase.from("staff_services").delete().eq("service_key", serviceKey).in("staff_id", del));
  if (add.length || del.length) done();
}

/** «3 أقسام · 12 خدمة» / «كل الخدمات» for a member. */
export function servicesSummary(keys: string[] | undefined, services: { key: string; category_id: string | null }[]) {
  if (!keys?.length) return "كل الخدمات";
  const set = new Set(keys);
  const list = services.filter((s) => set.has(s.key));
  const cats = new Set(list.map((s) => s.category_id ?? ""));
  const n = list.length;
  const svc = n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : n <= 10 ? `${n} خدمات` : `${n} خدمة`;
  const c = cats.size;
  return c <= 1 ? svc : `${c === 2 ? "قسمان" : c <= 10 ? `${c} أقسام` : `${c} قسماً`} · ${svc}`;
}
