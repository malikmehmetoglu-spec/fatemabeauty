"use client";

/** Exchange rate (USD → SYP, history in `exchange_rates`) and each member's salary + currency (`staff_salaries`). */
import { supabase, type Tables } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type FxRate = Tables<"exchange_rates">;
export type StaffSalary = Tables<"staff_salaries">;
export type Currency = "SYP" | "USD";

export async function listRates(limit = 30) {
  return must(await supabase.from("exchange_rates").select("*").order("effective_at", { ascending: false }).order("created_at", { ascending: false }).limit(limit)) ?? [];
}
/** Latest rate (or null when none was entered yet). */
export async function currentRate() {
  const r = must(await supabase.from("exchange_rates").select("*").order("effective_at", { ascending: false }).order("created_at", { ascending: false }).limit(1));
  return r?.[0] ?? null;
}
export async function setUsdRate(rate: number, note: string) {
  must(await supabase.rpc("set_exchange_rate", { p_rate: rate, p_note: note, p_source: "manual" }));
  invalidate("fx");
  invalidate("payroll");
}

export async function listSalaries() {
  return must(await supabase.from("staff_salaries").select("*"));
}
export async function saveSalary(staff_id: string, base_salary: number, salary_currency: Currency) {
  must(await supabase.from("staff_salaries").upsert({ staff_id, base_salary, salary_currency, updated_at: new Date().toISOString() }));
  invalidate("salaries");
}

/** Rate source label. */
export const SOURCE_AR: Record<string, string> = { manual: "يدوي", "sp-today": "تلقائي (sp-today)" };

/** "500$" (isolated left-to-right so it reads correctly inside Arabic text). */
export const usd = (n: number) => `\u2066${n.toLocaleString("en-US")}$\u2069`;
export const fxError = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  if (m.includes("row-level security")) return "لا تملكين صلاحية تعديل سعر الصرف أو الرواتب (الإدارة والمحاسبة فقط).";
  if (m.includes("Failed to fetch")) return "تعذّر الاتصال بالخادم — تحققي من الإنترنت وأعيدي المحاولة.";
  return /[؀-ۿ]/.test(m) ? m : `تعذّرت العملية، أعيدي المحاولة. (${m})`;
};
