"use client";
 

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stage } from "@/components/shell";
import { EmptyState, ErrorNote, Loading } from "@/components/ui";
import { R } from "@/lib/routes";
import { listServices, priceLabel, serviceIcon } from "@/lib/db/catalog";
import { createWalkIn, listToday } from "@/lib/db/queue";
import { useQuery } from "@/lib/db/query";
import { css } from "../css";
import { BG, C, SH, SHB, SH_SOFT, ICON_FILL } from "@/lib/tokens";
import { NowText, useKiosk } from "../kiosk";

/** T_WalkIn.dc.html */

/** Reception tablet: walk-in booking without an appointment — opens the file, books "now" and checks in. */
export default function Page() {
  const k = useKiosk();
  const router = useRouter();
  const q = useQuery(["queue", "walk-in"], async () => ({ services: await listServices(), today: await listToday() }), { enabled: !k.gate });
  const [sel, setSel] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (k.gate) return k.gate;
  const services = q.data?.services ?? [];
  const today = q.data?.today ?? [];
  const S = services.map((s) => {
    const waiting = today.filter((a) => a.status === "checked_in" && (!s.room_id || a.room_id === s.room_id)).length;
    return { key: s.key, name: s.name, icon: serviceIcon(s.name), price: priceLabel(s), minutes: `${s.minutes} دقيقة`, ok: true, slot: waiting ? `${waiting} في الانتظار` : "متاح الآن" };
  });
  const svcs = S.map((s, i) => {
    const on = sel === i;
    return {
      ...s, on, pick: () => setSel(i),
      style: css("border-radius:30px;padding:22px 22px 20px;text-align:right;font-family:inherit;display:flex;flex-direction:column;gap:10px;position:relative;box-sizing:border-box;" +
        (on ? "background:linear-gradient(160deg,#F1E3F6,#D9BCE5);border:1px solid #FFFFFF;box-shadow:0 12px 26px rgba(150,100,170,0.30);color:#7B4687"
          : "background:#FFFFFF;border:1px solid #F0E6F3;box-shadow:0 12px 30px rgba(123,70,135,0.10),0 2px 6px rgba(123,70,135,0.05);color:#35213D")),
      slotStyle: css("display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;border-radius:17px;font-size:15px;font-weight:700;align-self:flex-start;" +
        (s.ok ? "background:#E6F4EC;color:#2E7D50" : "background:" + (on ? "rgba(255,255,255,0.7)" : "#F0EDF0") + ";color:#695D6B")),
      checkStyle: css("position:absolute;top:18px;left:18px;width:30px;height:30px;border-radius:15px;display:flex;align-items:center;justify-content:center;" +
        (on ? "background:linear-gradient(145deg,#C9A2D8,#7B4687);box-shadow:0 6px 12px rgba(123,70,135,0.30)" : "background:#FFFFFF;border:1.5px solid #E4D6E7;box-sizing:border-box")),
    };
  });
  const submit = async () => {
    const svc = services[sel];
    if (!svc) return;
    if (!name.trim() || phone.replace(/\D/g, "").length < 8) { setErr("اكتبي الاسم ورقم الهاتف كاملاً"); return; }
    setBusy(true); setErr(null);
    try { const id = await createWalkIn({ name, phone, service: svc }); router.push(`/kiosk/checked-in/?id=${id}`); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  };
  const cur = S[sel] ?? { name: "—", slot: "", ok: false };
  const btn = busy ? "جارٍ التسجيل…" : "احجزي وخذي رقماً";
  const note = S[sel] ? "الحالة الآن: " + cur.slot : "لا توجد خدمات مفعّلة بعد.";
  return (
    <Stage width={1194} height={834}  background={BG} padding="36px 40px 32px" direction="column" gap={24}>

      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <Link href={R.T_Welcome} aria-label="رجوع" style={{ width: 56, height: 56, borderRadius: 28, border: "none", background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B4687" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
        <div style={{ lineHeight: 1.3, flexGrow: 1 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>حجز حضوري
          </div>
          <div style={{ fontSize: 16, color: C.sub2 }}>بدون موعد مسبق؟ اختاري جلستكِ وخذي رقماً
          </div>
        </div>
        <div style={{ height: 52, padding: "0 20px", borderRadius: 26, background: C.white, boxShadow: SHB, display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: C.ink }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
          </svg>
          <span><NowText part="date" />
          </span>
          <span style={{ width: 1, height: 20, background: C.border }} />
          <span style={{ fontFamily: "var(--font-rubik), Rubik, sans-serif", fontWeight: 500 }}><NowText part="time" />
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 26, flexGrow: 1, minHeight: "0", position: "relative" }}>
        <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>اختاري الخدمة
            </div>
            <div style={{ fontSize: 15, color: C.sub2 }}>الأوقات حسب جدول اليوم الفعلي
            </div>
          </div>
          {q.loading && <Loading />}
          {q.error && <ErrorNote>{q.error}</ErrorNote>}
          {!q.loading && !q.error && !S.length && <EmptyState icon="box" title="لا توجد خدمات بعد" text="تظهر هنا الخدمات المفعّلة بعد إضافتها من لوحة الإدارة ← الخدمات." />}
          {S.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "minmax(190px, 1fr)", gap: 16, flexGrow: 1, minHeight: "0", overflowY: "auto" }}>
            {svcs.map((s) => (
              <button key={s.key} type="button" onClick={s.pick} aria-label={s.name} aria-pressed={s.on} style={s.style}>
                <span style={s.checkStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
                <span style={{ width: 54, height: 54, borderRadius: 27, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </span>
                <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.3, paddingLeft: 36 }}>{s.name}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, color: C.sub, whiteSpace: "nowrap" }}>
                  <b style={{ color: C.accent, fontSize: 18 }}>{s.price}</b>
                  <span style={{ width: 4, height: 4, borderRadius: 2, background: C.muted }} />{s.minutes}
                </span>
                <span style={{ ...s.slotStyle, marginTop: "auto" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 7v5l3 2" />
                  </svg>{s.slot}
                </span>
              </button>
            ))}
            <div style={{ borderRadius: 30, padding: 22, border: "1.5px dashed #DFCBE4", background: "rgba(255,255,255,0.45)", display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
              <span style={{ width: 50, height: 50, borderRadius: 25, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
                </svg>
              </span>
              <div style={{ fontSize: 18, fontWeight: 700 }}>الانتظار حسب الدور
              </div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.6 }}>تأخذين رقماً فوراً، وندخلكِ بعد المراجعات المسجّلات قبلكِ في الغرفة نفسها.
              </div>
            </div>
          </div>}
        </div>
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
          <div style={{ borderRadius: 32, padding: 24, background: C.white, border: "1px solid #F0E6F3", boxShadow: SH, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 24, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6" />
                </svg>
              </span>
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 14, color: C.sub2 }}>الخدمة المختارة
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{cur.name}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 16, color: C.sub, lineHeight: 1.6, padding: "12px 16px", borderRadius: 18, background: "#F8F2FA" }}>{note}
            </div>
          </div>
          <div style={{ borderRadius: 32, padding: "22px 24px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH }}>
            <label htmlFor="wname" style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>اسمكِ
            </label>
            <input id="wname" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" style={{ width: "100%", boxSizing: "border-box", height: 56, border: "1.5px solid #E3CEE8", borderRadius: 28, padding: "0 20px", fontSize: 18, outline: "none", color: C.ink, fontFamily: "inherit", marginBottom: 14 }} />
            <label htmlFor="wphone" style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>رقم هاتفكِ
            </label>
            <div dir="ltr" style={{ display: "flex", alignItems: "center", height: 62, background: C.white, border: "1.5px solid #E3CEE8", borderRadius: 31, padding: "0 10px 0 20px", boxShadow: "0 0 0 5px rgba(222,190,229,0.25)" }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: C.accent, paddingRight: 12, borderRight: "1px solid #E9DCEE", fontFamily: "var(--font-rubik), Rubik, sans-serif" }}>+963
              </span>
              <input id="wphone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9XX XXX XXX" style={{ flexGrow: 1, minWidth: "0", border: "none", outline: "none", background: "transparent", fontSize: 20, padding: "0 12px", color: C.ink, fontFamily: "var(--font-rubik), Rubik, sans-serif", letterSpacing: 1 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14, color: C.sub }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3FA46A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20l1.3-3.9C1.7 11.9 3.9 6.5 9 4.4s11 .2 12 5.1c1 4.9-3.6 9.3-9 9.3-1.7 0-3.3-.4-4.7-1.1z" />
              </svg>نفتح لكِ ملفاً برقم هاتفكِ إن لم يكن لديكِ ملف
            </div>
          </div>
          <div style={{ borderRadius: 28, padding: "18px 22px", background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))", border: "1px solid #FFFFFF", boxShadow: SH_SOFT, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600 }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: "linear-gradient(145deg,#C9A2D8,#7B4687)", boxShadow: "0 6px 12px rgba(123,70,135,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>رقم دور فوري على هذه الشاشة
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600 }}>
              <span style={{ width: 30, height: 30, borderRadius: 15, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A877B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5z" />
                </svg>
              </span>ننادي رقمكِ على شاشة الانتظار
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {err && <ErrorNote>{err}</ErrorNote>}
            <button type="button" onClick={submit} disabled={busy || !S.length} style={{ border: "none", fontFamily: "inherit", opacity: busy || !S.length ? 0.6 : 1, height: 66, borderRadius: 33, backgroundColor: C.accent, backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)", boxShadow: "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)", color: C.white, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM16 3v4M8 3v4M4 11h16M9 16l2 2 4-4" />
              </svg>{btn}
            </button>
            <div style={{ textAlign: "center", fontSize: 14, color: C.sub2 }}>الدفع في الاستقبال بعد الجلسة
            </div>
          </div>
        </div>
      </div>

    </Stage>
  );
}

