"use client";

/** Placeholder body for patient pages while her record loads (or when a staff account opens a patient page). */
import { EmptyState, ErrorNote, Loading } from "@/components/ui";

export function Wait({ loading, error }: { loading: boolean; error?: string }) {
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (loading) return <Loading />;
  return <EmptyState compact icon="user" title="هذه الصفحة لحساب المراجعة" text="سجّلي الدخول برقم هاتفكِ لتظهر بياناتكِ هنا." />;
}
