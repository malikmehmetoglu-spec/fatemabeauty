// @ts-nocheck — Deno source, deployed to Supabase; excluded from the Next.js type-check.
// Edge Function «staff-admin» (verify_jwt = true).
// Creates / manages staff logins with the service role, after checking the caller is owner or admin.
//   { action: "create", staff_id, login, password }    → creates auth user, links staff.user_id
//   { action: "password", staff_id, password }         → sets a new password
//   { action: "disable" | "enable", staff_id }         → bans / unbans the login and sets staff.active
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u, error: ue } = await admin.auth.getUser(jwt);
    if (ue || !u.user) return json({ error: "غير مسجّل الدخول" }, 401);

    const { data: me } = await admin.from("staff").select("id, role").eq("user_id", u.user.id).eq("active", true).maybeSingle();
    if (!me || (me.role !== "owner" && me.role !== "admin")) return json({ error: "هذه العملية للإدارة فقط" }, 403);
    const isOwner = me.role === "owner";

    const body = await req.json();
    const { action, staff_id } = body ?? {};
    const { data: target } = await admin.from("staff").select("*").eq("id", staff_id).maybeSingle();
    if (!target) return json({ error: "الموظفة غير موجودة" }, 404);
    if (target.role === "owner" && target.id !== me.id) return json({ error: "لا يمكن تعديل حساب المدير العام" }, 403);
    if (target.role === "owner" && !isOwner) return json({ error: "لا يمكن تعديل حساب المدير العام" }, 403);
    if (target.role === "admin" && !isOwner && target.id !== me.id) return json({ error: "حسابات الإدارة يديرها المدير العام فقط" }, 403);

    const password: string | undefined = body.password;
    const okPass = (p?: string) => typeof p === "string" && p.length >= 8;

    if (action === "create") {
      if (target.user_id) return json({ error: "لهذه الموظفة حساب دخول بالفعل" }, 409);
      let login = String(body.login ?? "").trim().toLowerCase();
      if (!/^[a-z0-9._@+-]{3,}$/.test(login)) return json({ error: "اسم المستخدم: أحرف لاتينية وأرقام فقط (3 على الأقل)" }, 400);
      if (!okPass(password)) return json({ error: "كلمة المرور 8 أحرف على الأقل" }, 400);
      const username = login.includes("@") ? null : login;
      if (!login.includes("@")) login = `${login}@fatema.beauty`;
      const { data: created, error } = await admin.auth.admin.createUser({
        email: login, password, email_confirm: true, user_metadata: { name: target.name, staff: true },
      });
      if (error) return json({ error: /already/i.test(error.message) ? "اسم المستخدم مستخدم لحساب آخر" : error.message }, 400);
      const { error: le } = await admin.from("staff").update({ user_id: created.user.id, email: login, username }).eq("id", target.id);
      if (le) { await admin.auth.admin.deleteUser(created.user.id); return json({ error: le.message }, 400); }
      return json({ ok: true, email: login });
    }

    if (!target.user_id) return json({ error: "لا يوجد حساب دخول لهذه الموظفة" }, 400);

    if (action === "password") {
      if (!okPass(password)) return json({ error: "كلمة المرور 8 أحرف على الأقل" }, 400);
      const { error } = await admin.auth.admin.updateUserById(target.user_id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "disable" || action === "enable") {
      if (target.id === me.id) return json({ error: "لا يمكنكِ إيقاف حسابكِ" }, 400);
      const { error } = await admin.auth.admin.updateUserById(target.user_id, { ban_duration: action === "disable" ? "876000h" : "none" });
      if (error) return json({ error: error.message }, 400);
      await admin.from("staff").update({ active: action === "enable" }).eq("id", target.id);
      return json({ ok: true });
    }

    return json({ error: "عملية غير معروفة" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
