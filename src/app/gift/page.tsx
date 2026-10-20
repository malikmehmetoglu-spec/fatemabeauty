"use client";

/** P_GiftCard.dc.html — request a gift card. Saved to `gift_requests`; online payment is not connected yet. */
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkGlow, EmptyState, ErrorNote, Icon, Loading, Logo, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listServices } from "@/lib/db/catalog";
import { submitGift } from "@/lib/db/marketing";
import { askLogin } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD, DARK } from "@/lib/tokens";
import { fieldStyle, toggleChip } from "../consult/ui";

type Mode = "s" | "a";

const chip = (on: boolean): CSSProperties => ({
  ...toggleChip(on), height: 52, borderRadius: 20, padding: "0 12px", flexDirection: "column", gap: 0, lineHeight: 1.3,
});

export default function GiftCardPage() {
  const { patient, guest, loading: sLoading } = useRequirePatient();
  const { data: services, loading } = useQuery(["catalog", "services"], listServices);
  const sessions = (services ?? []).filter((s) => s.price > 0);
  const [mode, setMode] = useState<Mode>("s");
  const [key, setKey] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const svc = sessions.find((s) => s.key === key) ?? null;
  const value = mode === "s" ? svc?.price ?? 0 : Number(amount) || 0;
  const ok = !!name.trim() && value > 0;

  const send = async () => {
    if (!ok) return;
    if (!patient) { askLogin({ text: "سجّلي الدخول لنرسل بطاقة الهدية باسمكِ." }); return; }
    setBusy(true); setErr(null);
    try {
      await submitGift({ patient_id: patient.id, recipient_name: name.trim(), recipient_phone: phone, amount: value, service_key: mode === "s" ? key : null, message: msg });
      setSent(true);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  if (sLoading || (!patient && !guest) || loading) return <PhoneScreen><TopBar title="بطاقة هدية" back={R.Packages} /><Loading /></PhoneScreen>;
  if (sent) return (
    <PhoneScreen>
      <TopBar title="بطاقة هدية" back={R.Packages} />
      <EmptyState icon="gift" title="وصل طلب الهدية" text="الدفع الإلكتروني غير مفعّل بعد: سيتواصل معكِ المركز لإتمام الدفع وتسليم البطاقة." action={<PrimaryButton href={R.Main}>العودة إلى الرئيسية</PrimaryButton>} />
    </PhoneScreen>
  );

  return (
    <PhoneScreen gap={12}>
      <TopBar title="بطاقة هدية" back={R.Packages} />

      <div style={{ ...DARK, minHeight: 176, borderRadius: 30, padding: "18px 20px", position: "relative", overflow: "hidden", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
        <DarkGlow />
        <div style={{ position: "relative", lineHeight: 1.25 }}>
          <Logo light height={40} />
          <div style={{ fontSize: 13, color: C.gold2, fontWeight: 600, marginTop: 2 }}>بطاقة هدية</div>
        </div>
        <div style={{ position: "relative", lineHeight: 1.25 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{mode === "s" ? (svc ? svc.name : "اختاري جلسة") : "رصيد هدية"}</div>
          {value > 0 && <div style={{ fontSize: 15, color: "#E8D6F0" }}><span className="latin" style={{ fontWeight: 600 }}>{money(value, false)}</span> ل.س</div>}
        </div>
        <div style={{ position: "relative", fontSize: 12, color: C.onDark, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="heart" color="#E8D6F0" size={15} />تُستخدم في المركز
        </div>
      </div>

      <div role="radiogroup" aria-label="نوع الهدية" style={{ display: "flex", gap: 8 }}>
        {([["s", "جلسة"], ["a", "مبلغ"]] as [Mode, string][]).map(([m, t]) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} style={toggleChip(mode === m, { flex: 1 })}>{t}</button>
        ))}
      </div>

      {mode === "s" ? (
        sessions.length === 0 ? <EmptyState compact icon="sparkle" title="لا توجد جلسات متاحة للإهداء حالياً" text="يمكنكِ إهداء مبلغ بدلاً من ذلك." /> : (
          <div role="radiogroup" aria-label="الجلسة" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sessions.map((s) => (
              <button key={s.key} type="button" role="radio" aria-checked={key === s.key} onClick={() => setKey(s.key)} style={chip(key === s.key)}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{s.short_name}</span>
                <span style={{ fontSize: 12.5, opacity: 0.85 }}>{s.price_from ? "من " : ""}<span className="latin">{money(s.price, false)}</span> ل.س</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="gamt" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>المبلغ (ل.س)</label>
          <input id="gamt" inputMode="numeric" dir="ltr" className="latin" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} style={{ ...fieldStyle, textAlign: "left" }} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="rname" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>اسم المُهدى إليها</label>
          <input id="rname" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="rphone" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>رقم هاتفها</label>
          <input id="rphone" type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ ...fieldStyle, textAlign: "left" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="gmsg" style={{ fontSize: 12, fontWeight: 600, color: C.sub2 }}>رسالة شخصية</label>
        <textarea id="gmsg" rows={2} value={msg} maxLength={500} onChange={(e) => setMsg(e.target.value)} placeholder="اكتبي كلمة لطيفة ترافق الهدية" style={{ ...fieldStyle, height: 62, padding: "12px 14px", resize: "none", lineHeight: 1.5 }} />
      </div>

      <div style={{ ...CARD, display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 22 }}>
        <Icon name="info" size={18} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>الدفع الإلكتروني غير مفعّل بعد. نسجّل طلبكِ ويتواصل معكِ المركز لإتمام الدفع وتسليم البطاقة.</div>
      </div>

      {err && <ErrorNote>تعذّر إرسال الطلب: {err}</ErrorNote>}
      <PrimaryButton icon="gift" onClick={send} disabled={!ok || busy} style={{ marginTop: "auto", flexShrink: 0 }}>
        {busy ? "جارٍ الإرسال…" : "طلب الهدية"}
      </PrimaryButton>
    </PhoneScreen>
  );
}
