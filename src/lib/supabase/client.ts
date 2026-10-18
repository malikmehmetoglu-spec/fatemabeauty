"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Publishable values (safe in the browser; data is protected by Row Level Security).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://btcyrzvaexmgffeamlmg.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_KZalKMptfoOsfL6_TU1vbw_RJIX7wTL";

export const supabase = createClient<Database>(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type { Database } from "./database.types";
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
