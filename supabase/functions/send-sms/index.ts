// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «send-sms» (verify_jwt = false): Supabase Auth "Send SMS" hook.
// Supabase Auth generates and verifies the 6-digit code itself; this function only delivers it,
// through the clinic's Android phone running «SMS Gateway for Android» (sms-gate.app) in Cloud mode.
// The phone sends a normal SMS from its Syriatel/MTN SIM, so it reaches every +963 number.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   SEND_SMS_HOOK_SECRET  the hook secret shown when the hook is created ("v1,whsec_…")
//   SMSGATE_USER          username from the gateway app → Cloud server
//   SMSGATE_PASS          password from the gateway app → Cloud server
//   SMSGATE_URL           optional; defaults to the public cloud server
import { Webhook } from "npm:standardwebhooks@1.0.0";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
const fail = (msg: string, s = 500) => json({ error: { http_code: s, message: msg } }, s);

Deno.serve(async (req) => {
  try {
    const payload = await req.text();
    const secret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
    if (!secret) return fail("hook secret not configured");
    let body;
    try {
      body = new Webhook(secret).verify(payload, Object.fromEntries(req.headers));
    } catch {
      return fail("invalid signature", 401);
    }

    // Syrian numbers go out in local form (0959…): MTN Syria rejects on-net SMS addressed as +963…,
    // while Syriatel accepts either. Other countries keep the international form.
    const digits = String(body?.user?.phone ?? "").replace(/\D/g, "");
    const phone = !digits ? "" : digits.startsWith("963") ? `0${digits.slice(3)}` : `+${digits}`;
    const otp = body?.sms?.otp;
    if (!phone || !otp) return fail("missing phone or code", 400);

    const user = Deno.env.get("SMSGATE_USER");
    const pass = Deno.env.get("SMSGATE_PASS");
    if (!user || !pass) return fail("gateway credentials not configured");
    const url = Deno.env.get("SMSGATE_URL") ?? "https://api.sms-gate.app/3rdparty/v1/messages";

    const text = `رمز التحقق في فاطمة بيوتي: ${otp}\nلا تشاركي هذا الرمز مع أحد.`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Basic ${btoa(`${user}:${pass}`)}` },
      body: JSON.stringify({ textMessage: { text }, phoneNumbers: [phone], ttl: 300 }),
    });
    if (!r.ok) return fail(`gateway HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`, 502);
    return json({});
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
});
