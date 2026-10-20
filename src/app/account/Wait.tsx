"use client";

/** Placeholder body for patient pages while her record loads (or when a staff account / a guest opens a patient page). */
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { GuestCard } from "@/components/guest";
import { useSession } from "@/lib/supabase/session";

export function Wait({ loading, error, what }: { loading: boolean; error?: string; what?: string }) {
  const { guest } = useSession();
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (loading) return <Loading />;
  if (guest) return <GuestCard what={what} />;
  return <EmptyState compact icon="user" title="هذه الصفحة لحساب المراجعة" text="سجّلي الدخول برقم هاتفكِ لتظهر بياناتكِ هنا." />;
}
