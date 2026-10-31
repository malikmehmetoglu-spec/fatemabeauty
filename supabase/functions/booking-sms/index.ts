// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «booking-sms» (verify_jwt = false): automatic Arabic SMS confirmation for bookings made on the public link.
// Called by Postgres (private.pub_booking_sms → pg_net) right after public_book_level commits:  body { appointment_id }.
// No caller secret is needed because the function decides everything from the database and is idempotent:
// it only texts an appointment that is source 'public', 'confirmed', created in the last 30 minutes and not texted yet,
// and only to the phone on that appointment's patient file. Every attempt is written to public.sms_log (kind 'confirm',
// sent_by null = automatic). A failed SMS never touches the booking.
// Gateway: the clinic's Android phone running «SMS Gateway for Android» (same secrets and API as send-sms / staff-sms).
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** "+963 991…" → "0991…" (MTN Syria rejects on-net SMS addressed as +963), or null. */
function local(phone?: string | null) {
  const d = String(phone ?? "").replace(/\D/g, "").replace(/^(00963|963|0)/, "");
  return /^9\d{8}$/.test(d) ? `0${d}` : null;
}

/** Arabic-only wording that passes MTN/Syriatel filters: no links, no Latin letters, no «رمز/كود», Western digits. */
export function confirmText(service: string, startsAt: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Damascus", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit", hour12: false, weekday: "short",
  }).formatToParts(new Date(startsAt)).map((x) => [x.type, x.value]));
  const wd = DAYS[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday)] ?? "";
  const h24 = Number(p.hour) % 24;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const part = h24 < 12 ? "صباحاً" : "مساءً";
  const svc = service.replace(/[A-Za-z()]+/g, "").replace(/\s+/g, " ").trim() || "العناية";
  return `‏فاطمة بيوتي: تم تأكيد حجزكِ لجلسة ${svc} يوم ${wd} ${Number(p.day)}/${Number(p.month)} الساعة ${h12}:${p.minute} ${part}. الدفع في المركز قبل الجلسة. نتشرف بزيارتكِ.‏`;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body?.appointment_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "bad id" }, 400);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    const { data: a } = await admin.from("appointments")
      .select("id, status, source, created_at, starts_at, patient_id, walk_in_phone, patient:patients(phone), service:services(name, short_name)")
      .eq("id", id).maybeSingle();
    if (!a || a.source !== "public" || a.status !== "confirmed") return json({ skipped: "not a confirmed public booking" });
    if (Date.now() - new Date(a.created_at).getTime() > 30 * 60e3) return json({ skipped: "too old" });
    const { count } = await admin.from("sms_log").select("id", { count: "exact", head: true })
      .eq("appointment_id", a.id).eq("kind", "confirm").eq("status", "sent");
    if ((count ?? 0) > 0) return json({ skipped: "already sent" });

    const phone = local(a.patient?.phone || a.walk_in_phone);
    if (!phone) return json({ skipped: "no Syrian phone" });
    const text = confirmText(a.service?.short_name || a.service?.name || "", a.starts_at);
    const log = (status: string, error: string | null = null) => admin.from("sms_log").insert({
      appointment_id: a.id, patient_id: a.patient_id, phone: `+963${phone.slice(1)}`, kind: "confirm", body: text, status, error, sent_by: null,
    });

    const user = Deno.env.get("SMSGATE_USER");
    const pass = Deno.env.get("SMSGATE_PASS");
    if (!user || !pass) { await log("failed", "gateway credentials not configured"); return json({ error: "not configured" }, 503); }
    const url = Deno.env.get("SMSGATE_URL") ?? "https://api.sms-gate.app/3rdparty/v1/messages";
    let r: Response;
    try {
      r = await fetch(`${url}?skipPhoneValidation=true`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Basic ${btoa(`${user}:${pass}`)}` },
        body: JSON.stringify({ textMessage: { text }, phoneNumbers: [phone], ttl: 3600 }),
      });
    } catch (e) {
      await log("failed", String(e).slice(0, 300));
      return json({ error: "gateway unreachable" }, 502);
    }
    if (!r.ok) { await log("failed", `HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`); return json({ error: `gateway HTTP ${r.status}` }, 502); }
    await log("sent");
    await admin.rpc("mark_confirm_channel", { p_id: a.id, p_channel: "sms", p_kind: "confirm" });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
