"use client";

/** «كثافة الحجز»: capacity vs booked per day/hour/section, booking pace, and «نشرتُ ستوري» markers. */
import { supabase } from "@/lib/supabase/client";
import { invalidate, must } from "./query";

export type Grp = "skin" | "hair" | "consult";
export type DensityCell = { day: string; hour: number; grp: Grp; cap: number; booked: number };
export type PaceDay = { day: string; total: number; public_link: number };
export type MarketingPost = { id: string; posted_on: string; note: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
const rpc = supabase.rpc.bind(supabase) as unknown as (fn: string, args?: object) => any;
const from = (t: string) => (supabase as any).from(t);

export async function getDensity(days = 14): Promise<DensityCell[]> {
  return (must(await rpc("booking_density", { p_days: days })) ?? []) as DensityCell[];
}
export async function getPace(days = 45): Promise<PaceDay[]> {
  return (must(await rpc("booking_pace", { p_days: days })) ?? []) as PaceDay[];
}
export async function listPosts(): Promise<MarketingPost[]> {
  return (must(await from("marketing_posts").select("id,posted_on,note").order("posted_on", { ascending: false }).limit(60)) ?? []) as MarketingPost[];
}
export async function addPost(posted_on: string, note: string) {
  must(await from("marketing_posts").insert({ posted_on, note: note.trim() }));
  invalidate("density");
}
export async function removePost(id: string) {
  must(await from("marketing_posts").delete().eq("id", id));
  invalidate("density");
}

/** Occupancy → advice for the marketing stories. */
export function advice(pct: number) {
  if (pct >= 80) return { tone: "red" as const, label: "ممتلئ تقريباً", tip: "خفّفي النشر الآن — المواعيد شبه محجوزة." };
  if (pct >= 50) return { tone: "amber" as const, label: "امتلاء متوسط", tip: "نشر خفيف يكفي، وركّزي على الأيام الفارغة." };
  return { tone: "green" as const, label: "فيه أماكن كثيرة", tip: "وقت مناسب للنشر — انشري ستوري اليوم." };
}
