// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «staff-sms» (verify_jwt = true).
// Staff (owner / admin / reception) send a booking confirmation or apology by SMS through the clinic's Android phone
// running «SMS Gateway for Android» (sms-gate.app, same API and secrets as send-sms).
//   body: { appointment_id, kind: "confirm" | "apology", text, dry_run?: boolean }
// The phone number is read from the appointment (patient phone or walk-in phone), never from the caller.
// Every attempt is written to public.sms_log; a successful send stamps appointments.confirm_channels.<kind>.sms.
// Limit: one successful SMS per appointment and kind every 10 minutes.
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/** "+963 991…" / "0991…" / "991…" → "+963991234567", or null. */
function sy(phone?: string | null) {
  const d = String(phone ?? "").replace(/\D/g, "").replace(/^(00963|963|0)/, "");
  return /^9\d{8}$/.test(d) ? `+963${d}` : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u, error: ue } = await admin.auth.getUser(jwt);
    if (ue || !u.user) return json({ error: "غير مسجّل الدخول" }, 401);
    const { data: me } = await admin.from("staff").select("id, role").eq("user_id", u.user.id).eq("active", true).maybeSingle();
    if (!me || !["owner", "admin", "reception"].includes(me.role)) return json({ error: "إرسال الرسائل للمالكة والإدارة والاستقبال فقط" }, 403);

    const body = await req.json().catch(() => ({}));
    const kind = body?.kind === "apology" ? "apology" : "confirm";
    const text = String(body?.text ?? "").trim();
    const dry = body?.dry_run === true;
    if (!text) return json({ error: "نص الرسالة فارغ" }, 400);
    if (text.length > 300) return json({ error: "الرسالة أطول من المسموح لرسالة SMS" }, 400);

    const { data: a } = await admin.from("appointments")
      .select("id, status, patient_id, walk_in_phone, patient:patients(phone)").eq("id", body?.appointment_id ?? "").maybeSingle();
    if (!a) return json({ error: "الموعد غير موجود" }, 404);
    if (kind === "confirm" && !["confirmed", "checked_in"].includes(a.status)) return json({ error: "الموعد غير مؤكد" }, 409);
    if (kind === "apology" && a.status !== "cancelled") return json({ error: "الموعد غير ملغى" }, 409);
    const phone = sy(a.patient?.phone || a.walk_in_phone);
    if (!phone) return json({ error: "لا يوجد رقم هاتف سوري صالح لهذه المراجِعة" }, 400);

    const user = Deno.env.get("SMSGATE_USER");
    const pass = Deno.env.get("SMSGATE_PASS");
    if (!user || !pass) return json({ error: "بوابة الرسائل غير مُعدّة بعد", code: "not_configured" }, 503);

    const since = new Date(Date.now() - 10 * 60e3).toISOString();
    const { count } = await admin.from("sms_log").select("id", { count: "exact", head: true })
      .eq("appointment_id", a.id).eq("kind", kind).in("status", ["sent", "dry_run"]).gte("created_at", since);
    if ((count ?? 0) > 0) return json({ error: "أُرسلت رسالة SMS لهذا الموعد قبل أقل من 10 دقائق — انتظري قليلاً قبل الإعادة", code: "rate_limited" }, 429);

    const log = (status: string, error: string | null = null) => admin.from("sms_log").insert({
      appointment_id: a.id, patient_id: a.patient_id, phone, kind, body: text, status, error, sent_by: me.id,
    });

    if (!dry) {
      const url = Deno.env.get("SMSGATE_URL") ?? "https://api.sms-gate.app/3rdparty/v1/messages";
      let r: Response;
      try {
        r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Basic ${btoa(`${user}:${pass}`)}` },
          body: JSON.stringify({ textMessage: { text }, phoneNumbers: [phone.replace(/^\+963/, "0")], ttl: 3600 /* MTN rejects +963 on-net */ }),
        });
      } catch (e) {
        await log("failed", String(e).slice(0, 300));
        return json({ error: "تعذّر الاتصال ببوابة الرسائل — تأكّدي أن هاتف البوابة متصل بالإنترنت" }, 502);
      }
      if (!r.ok) {
        const t = (await r.text()).slice(0, 300);
        await log("failed", `HTTP ${r.status}: ${t}`);
        return json({ error: r.status === 401 ? "بيانات دخول بوابة الرسائل غير صحيحة" : "رفضت بوابة الرسائل الإرسال — حاولي مجدداً" }, 502);
      }
    }
    await log(dry ? "dry_run" : "sent");
    if (!dry) await admin.rpc("mark_confirm_channel", { p_id: a.id, p_channel: "sms", p_kind: kind });
    return json({ ok: true, dry_run: dry, phone });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
