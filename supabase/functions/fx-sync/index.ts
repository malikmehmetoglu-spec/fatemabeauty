// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «fx-sync» (verify_jwt = false): reads the USD sell rate (new Syrian pound) from sp-today.com
// and stores it in public.exchange_rates (source 'sp-today') when it changed. Called hourly by pg_cron (0099).
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

Deno.serve(async () => {
  try {
    const r = await fetch("https://sp-today.com/", { headers: { "User-Agent": "Mozilla/5.0 (FatemaBeauty rate sync)", "Accept-Language": "ar" } });
    if (!r.ok) return json({ ok: false, error: `sp-today HTTP ${r.status}` }, 502);
    const html = await r.text();
    const m = html.match(/rate-row[^>]*href="\/currency\/us-dollar"[\s\S]*?inline-block">([\d.,]+)<\/span>[\s\S]*?inline-block">([\d.,]+)<\/span>/);
    if (!m) return json({ ok: false, error: "USD row not found" }, 502);
    const buy = Number(m[1].replace(/,/g, ""));
    const sell = Number(m[2].replace(/,/g, ""));
    if (!(sell > 20 && sell < 5000) || !(buy > 20 && buy <= sell * 1.05)) return json({ ok: false, error: "implausible", buy, sell }, 502);

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: last } = await db.from("exchange_rates").select("usd_to_syp, source").order("effective_at", { ascending: false }).limit(1).maybeSingle();
    if (last && Number(last.usd_to_syp) === sell && last.source === "sp-today") return json({ ok: true, unchanged: true, sell });
    const { error } = await db.rpc("set_exchange_rate", { p_rate: sell, p_note: `sp-today · شراء ${buy} / مبيع ${sell}`, p_source: "sp-today" });
    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, buy, sell });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
