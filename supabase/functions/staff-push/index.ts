// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «staff-push» (verify_jwt = false; each action checks its own caller).
// Web-push alerts for STAFF devices only (rows in staff_push_subs, created from the admin app).
// Patients never have subscriptions here, so nothing from this function can reach a patient.
//
// actions:
//   vapid   (staff session)  → { public_key }  — creates the server key pair on first use (stored in private.vapid)
//   test    (staff session)  → sends a test alert to the caller's own devices
//   notify  (service role)   → { patient_id, urgent, reason, summary } — a hand-off from Mira; goes to settings.mira.alert_staff
//   sweep   (pg_cron, open)  → reminders for urgent cases still unanswered every 15 min (max 4), and after 60 min
//                              the case is escalated to settings.mira.escalate_staff as well. Idempotent by timestamps.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

let server: any = null;
async function vapid() {
  let { data } = await admin.rpc("vapid_get");
  if (!data) {
    const kp = await webpush.generateVapidKeys({ extractable: true });
    const exported = await webpush.exportVapidKeys(kp);
    const pub = await webpush.exportApplicationServerKey(kp);
    await admin.rpc("vapid_set", { p_keys: exported, p_public: pub });
    ({ data } = await admin.rpc("vapid_get"));
  }
  return data as { keys: any; public_key: string };
}
async function appServer() {
  if (server) return server;
  const v = await vapid();
  const keys = await webpush.importVapidKeys(v.keys, { extractable: false });
  server = await webpush.ApplicationServer.new({ contactInformation: "mailto:admin@fatema.beauty", vapidKeys: keys });
  return server;
}

async function staffFromSession(req: Request) {
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return null;
  const { data: u } = await admin.auth.getUser(jwt);
  if (!u?.user) return null;
  const { data: st } = await admin.from("staff").select("id, name").eq("user_id", u.user.id).eq("active", true).maybeSingle();
  return st;
}

/** Push to every device of the given staff. Gone subscriptions are removed. */
async function pushTo(staffIds: string[], payload: Record<string, unknown>) {
  const ids = [...new Set(staffIds)].filter(Boolean);
  if (!ids.length) return { sent: 0, devices: 0 };
  const { data: subs } = await admin.from("staff_push_subs").select("id, sub").in("staff_id", ids);
  if (!subs?.length) return { sent: 0, devices: 0 };
  const srv = await appServer();
  let sent = 0;
  const errors: string[] = [];
  for (const s of subs) {
    try {
      await srv.subscribe(s.sub).pushTextMessage(JSON.stringify(payload), { urgency: payload.urgent ? webpush.Urgency.High : (webpush.Urgency.Normal ?? "normal"), ttl: 24 * 3600 });
      sent++;
      await admin.from("staff_push_subs").update({ last_ok_at: new Date().toISOString() }).eq("id", s.id);
    } catch (e) {
      errors.push(String(e?.message ?? e).slice(0, 200));
      const gone = typeof e?.isGone === "function" ? e.isGone() : [404, 410].includes(e?.response?.status);
      if (gone) await admin.from("staff_push_subs").delete().eq("id", s.id);
    }
  }
  return { sent, devices: subs.length, errors };
}

async function miraCfg() {
  const { data } = await admin.from("settings").select("value").eq("key", "mira").maybeSingle();
  return { alert_staff: [], escalate_staff: [], ...(data?.value ?? {}) } as { alert_staff: string[]; escalate_staff: string[] };
}
async function patientName(id: string) {
  const { data } = await admin.from("patients").select("name").eq("id", id).maybeSingle();
  return data?.name || "مراجعة";
}
const alertPayload = (name: string, t: { urgent?: boolean; reason?: string; summary?: string }, prefix = "") => ({
  title: `${prefix}${t.urgent ? "🔴 حالة عاجلة" : "💬 محادثة محوّلة إليكِ"} · ${name}`,
  body: [t.reason, t.summary].filter(Boolean).join(" — ").slice(0, 180),
  url: "/admin/mira/", tag: `mira-${name}`, urgent: !!t.urgent,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "vapid") {
      if (!(await staffFromSession(req))) return json({ error: "staff only" }, 401);
      return json({ public_key: (await vapid()).public_key });
    }

    if (action === "test") {
      const st = await staffFromSession(req);
      if (!st) return json({ error: "staff only" }, 401);
      const r = await pushTo([st.id], { title: "✅ التنبيهات تعمل", body: `ستصلكِ هنا الحالات المحوّلة والعاجلة من ميرا يا ${st.name}.`, url: "/admin/mira/", tag: "mira-test" });
      return json(r);
    }

    if (action === "notify") {
      const auth = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
      if (auth !== SERVICE) return json({ error: "forbidden" }, 403);
      const cfg = await miraCfg();
      const r = await pushTo(cfg.alert_staff, alertPayload(await patientName(body.patient_id), body));
      await admin.from("mira_threads").update({ notified_at: new Date().toISOString(), notify_count: 1, escalated: false }).eq("patient_id", body.patient_id);
      return json(r);
    }

    if (action === "sweep") {
      const cfg = await miraCfg();
      const now = Date.now();
      const { data: open } = await admin.from("mira_threads").select("*").eq("status", "fatema").not("handoff_at", "is", null);
      let reminded = 0, escalated = 0;
      for (const t of open ?? []) {
        const { count } = await admin.from("messages").select("id", { count: "exact", head: true })
          .eq("patient_id", t.patient_id).eq("author", "staff").gt("created_at", t.handoff_at);
        if (count) continue;
        const waited = (now - new Date(t.handoff_at).getTime()) / 60000;
        const since = t.notified_at ? (now - new Date(t.notified_at).getTime()) / 60000 : Infinity;
        const name = await patientName(t.patient_id);
        if (!t.escalated && waited >= 60 && (cfg.escalate_staff?.length || t.urgent)) {
          await pushTo([...cfg.alert_staff, ...(cfg.escalate_staff ?? [])], alertPayload(name, t, "⏰ بلا رد منذ ساعة · "));
          await admin.from("mira_threads").update({ escalated: true, notified_at: new Date().toISOString(), notify_count: (t.notify_count ?? 0) + 1 }).eq("patient_id", t.patient_id);
          escalated++;
        } else if (t.urgent && since >= 15 && (t.notify_count ?? 0) < 4) {
          await pushTo(cfg.alert_staff, alertPayload(name, t, "تذكير · "));
          await admin.from("mira_threads").update({ notified_at: new Date().toISOString(), notify_count: (t.notify_count ?? 0) + 1 }).eq("patient_id", t.patient_id);
          reminded++;
        }
      }
      return json({ reminded, escalated });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
