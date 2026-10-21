"use client";

/**
 * Tiny data-fetching layer for Supabase.
 *   const { data, loading, error, reload } = useQuery(["products", "inventory"], () => listInventory());
 *   await mutate(...); invalidate("products");   // every query whose key starts with "products" reloads
 */
import { arLoadError } from "@/lib/arError";
import { useCallback, useEffect, useRef, useState } from "react";

type Entry = { data?: unknown; error?: string; at: number; promise?: Promise<void> };
const cache = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const runners = new Map<string, () => Promise<void>>();

const k = (key: unknown[]) => JSON.stringify(key);

export function invalidate(prefix: string) {
  for (const key of [...cache.keys()]) {
    if (JSON.parse(key)[0] === prefix) cache.delete(key);
  }
  for (const [key, set] of listeners) if (JSON.parse(key)[0] === prefix) set.forEach((f) => f());
}

/**
 * Like invalidate(), but keeps the current data on screen while the fresh copy loads (no loading flash, no lost
 * input). Use it for live updates (Realtime), where the page should change smoothly.
 */
export function revalidate(prefix: string) {
  for (const [key, run] of runners) {
    if (JSON.parse(key)[0] === prefix && listeners.get(key)?.size) {
      const e = cache.get(key);
      if (e && e.data !== undefined) { e.at = 0; void run(); } else { cache.delete(key); listeners.get(key)?.forEach((f) => f()); }
    }
  }
}

export function useQuery<T>(key: unknown[], fetcher: () => Promise<T>, opts: { enabled?: boolean } = {}) {
  const id = k(key);
  const enabled = opts.enabled ?? true;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [, force] = useState(0);

  const run = useCallback(async () => {
    const entry: Entry = cache.get(id) ?? { at: 0 };
    if (entry.promise) return entry.promise;
    entry.promise = (async () => {
      try { entry.data = await fetcherRef.current(); entry.error = undefined; }
      catch (e) { console.warn("[query]", id, e); entry.error = arLoadError(e); }
      entry.at = Date.now(); entry.promise = undefined;
      // An invalidate() during this fetch dropped the entry: don't resurrect stale data, fetch again.
      if (cache.get(id) !== entry) { if (listeners.get(id)?.size) void run(); return; }
      listeners.get(id)?.forEach((f) => f());
    })();
    cache.set(id, entry);
    return entry.promise;
  }, [id]);

  useEffect(() => {
    if (!enabled) return;
    runners.set(id, run);
    const set = listeners.get(id) ?? new Set();
    const rerender = () => { if (!cache.has(id)) run(); force((n) => n + 1); };
    set.add(rerender); listeners.set(id, set);
    const e = cache.get(id);
    if (!e || (!e.promise && e.data === undefined && !e.error)) run();
    else force((n) => n + 1);
    return () => { set.delete(rerender); };
  }, [id, enabled, run]);

  const e = cache.get(id);
  return {
    data: e?.data as T | undefined,
    error: e?.error,
    loading: enabled && (!e || (e.data === undefined && !e.error)),
    reload: () => { cache.delete(id); return run(); },
    /** Re-fetches in the background, keeping the current data on screen until the new data arrives. */
    refresh: run,
  };
}

/** Throws a readable error from a Supabase response. */
export function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}
