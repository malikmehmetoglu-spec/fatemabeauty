"use client";

/**
 * Live catalogue (services, packages, products) from Supabase, with the bundled reference data as the
 * first paint and offline fallback. Prices changed in the admin appear here on the next load.
 */
import { useEffect, useState } from "react";
import { supabase } from "./client";
import { SERVICES as STATIC_SERVICES, PACKAGES as STATIC_PACKAGES, type Service, type ServiceKey } from "@/lib/data";

export type Pkg = { service: ServiceKey; name: string; sessions: number; price: number; saving: number };

type Catalog = { services: Service[]; packages: Pkg[]; live: boolean };
let cache: Catalog = { services: STATIC_SERVICES, packages: STATIC_PACKAGES, live: false };
let loading: Promise<void> | null = null;
const subs = new Set<(c: Catalog) => void>();

function load() {
  if (loading) return loading;
  loading = (async () => {
    const [{ data: sv }, { data: pk }] = await Promise.all([
      supabase.from("services").select("*").eq("active", true).order("sort"),
      supabase.from("packages").select("*").eq("active", true),
    ]);
    if (!sv?.length) return;
    const rooms = await supabase.from("rooms").select("id,name");
    const roomName = new Map((rooms.data ?? []).map((r) => [r.id, r.name]));
    const services: Service[] = sv.map((s) => ({
      key: s.key as ServiceKey, name: s.name, price: s.price, minutes: s.minutes, from: s.price_from || undefined,
      room: (s.room_id && roomName.get(s.room_id)) || "", desc: s.description,
    }));
    const byKey = new Map(services.map((s) => [s.key, s]));
    const packages: Pkg[] = (pk ?? []).map((p) => {
      const s = byKey.get(p.service_key as ServiceKey);
      return { service: p.service_key as ServiceKey, name: s?.name ?? p.name, sessions: p.sessions, price: p.price, saving: s ? s.price * p.sessions - p.price : 0 };
    });
    cache = { services, packages: packages.length ? packages : cache.packages, live: true };
    subs.forEach((f) => f(cache));
  })().catch(() => {});
  return loading;
}

export function useCatalog() {
  const [c, setC] = useState(cache);
  useEffect(() => { subs.add(setC); load(); return () => { subs.delete(setC); }; }, []);
  return c;
}
