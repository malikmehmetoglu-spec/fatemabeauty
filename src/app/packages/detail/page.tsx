"use client";

/**
 * P_PackageDetail.dc.html — package detail (`?id=<package id>`).
 * Live data: the package and its service from Supabase.
 */
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkCard, EmptyState, ErrorNote, Icon, Loading, PrimaryButton } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { useSession } from "@/lib/supabase/session";
import { cancelPackageRequest, myPendingPackageRequests, prError, submitPackageRequest } from "@/lib/db/packageRequests";
import { getPackage, getService, packageSaving, serviceIcon } from "@/lib/db/catalog";
import { money } from "@/lib/format";
import { C, CARD } from "@/lib/tokens";

export default function PackageDetailPage() {
  return <Suspense><Detail /></Suspense>;
}

function Detail() {
  const id = useSearchParams().get("id") ?? "";
  const { data: pkg, loading, error } = useQuery(["catalog", "package", id], () => getPackage(id), { enabled: !!id });
  const { data: svc } = useQuery(["catalog", "service", pkg?.service_key], () => getService(pkg!.service_key), { enabled: !!pkg });
  const { patient } = useSession();
  const pendQ = useQuery(["pkgreq", "mine", patient?.id], myPendingPackageRequests, { enabled: !!patient });
  const pending = pendQ.data?.find((r) => r.package_id === id);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit() {
    setBusy(true); setErr("");
    try { await submitPackageRequest(id); setSheet(false); } catch (e) { setErr(prError(e)); } finally { setBusy(false); }
  }
  async function cancel() {
    if (!pending) return;
    setBusy(true); setErr("");
    try { await cancelPackageRequest(pending.id); } catch (e) { setErr(prError(e)); } finally { setBusy(false); }
  }

  if (!id || (!loading && !error && !pkg)) return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الباقة" back={R.Packages} />
      <EmptyState icon="gift" title="الباقة غير متاحة" text="ربما أُوقفت هذه الباقة. اطّلعي على الباقات المتاحة حالياً." />
    </PhoneScreen>
  );
  if (loading || !pkg) return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الباقة" back={R.Packages} />
      {error ? <ErrorNote>تعذّر تحميل الباقة: {error}</ErrorNote> : <Loading />}
    </PhoneScreen>
  );

  const icon = serviceIcon(svc?.name ?? pkg.name);
  const full = svc ? svc.price * pkg.sessions : 0;
  const saving = packageSaving(pkg, svc);
  const includes = [
    { icon, t: `${pkg.sessions} جلسات ${svc?.name ?? ""}`.trim(), d: svc ? `${svc.minutes} دقيقة لكل جلسة` : "" },
    { icon: "sparkle", t: "متابعة بعد كل جلسة", d: "نصائح العناية وتقدّمكِ في رحلتي" },
  ];
  const how = [
    { icon: "cal", t: "احجزي كالمعتاد" },
    { icon: "calcheck", t: "تُخصم تلقائياً عند حضوركِ" },
    { icon: "layers", t: "تابعي رصيدكِ في باقاتي" },
  ];

  return (
    <PhoneScreen gap={12}>
      <TopBar title="تفاصيل الباقة" back={R.Packages} />

      <DarkCard radius={32} padding="20px 22px" style={{ flexShrink: 0 }}>
        <div aria-hidden style={{ position: "absolute", top: -60, left: -52, width: 160, height: 160, borderRadius: 80, background: "radial-gradient(circle, rgba(239,221,243,0.18) 0%, rgba(239,221,243,0) 70%)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, color: C.onDark }}>باقة</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{pkg.name}</h1>
            <div style={{ fontSize: 14, color: "#E8D6F0", marginTop: 2 }}>{pkg.sessions} جلسات</div>
          </div>
          <span style={{ width: 54, height: 54, borderRadius: 27, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={icon} color="#E8D6F0" size={26} stroke={1.7} />
          </span>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12, gap: 8 }}>
          <div style={{ lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {saving > 0 && <div style={{ fontSize: 13, color: C.onDark, textDecoration: "line-through" }}><span className="latin">{money(full, false)}</span> ل.س</div>}
            <div style={{ fontSize: 34, fontWeight: 700 }}><span className="latin">{money(pkg.price, false)}</span> <span style={{ fontSize: 15, fontWeight: 600 }}>ل.س</span></div>
          </div>
          {saving > 0 && <span style={{ height: 30, padding: "0 12px", whiteSpace: "nowrap", marginBottom: 4, borderRadius: 15, background: C.white, color: C.accent, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center" }}>
            توفّرين {money(saving)}
          </span>}
        </div>
        {svc && saving > 0 && <div style={{ position: "relative", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.16)", fontSize: 12.5, color: C.onDark }}>
          مقارنةً بـ {pkg.sessions} جلسات منفردة × <span className="latin">{money(svc.price, false)}</span> ل.س = <span className="latin">{money(full, false)}</span> ل.س
        </div>}
      </DarkCard>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 6px", flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700 }}>ماذا تتضمن الباقة</h2>
        {includes.map((r, i) => (
          <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
            <Circ icon={r.icon} size={36} iconSize={16} />
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.t}</div>
              {r.d && <div style={{ fontSize: 12, color: C.sub2 }}>{r.d}</div>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...CARD, borderRadius: 24, padding: "14px 16px 12px", flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>كيف تُستخدم الباقة؟</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          {how.map((h) => (
            <div key={h.t} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              <Circ icon={h.icon} size={40} iconSize={18} />
              <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.4 }}>{h.t}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.sub2, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="info" color={C.accentMid} size={16} />صلاحية الباقة حسب سياسة المركز
        </div>
      </div>

      {err && !sheet && <ErrorNote>{err}</ErrorNote>}
      {pending ? (
        <div role="status" style={{ ...CARD, marginTop: "auto", flexShrink: 0, borderRadius: 24, padding: "14px 16px", background: "#FFF6E8", border: "1px solid #F3DFB8", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Circ icon="clock" size={40} iconSize={18} color="#B7862F" />
            <div style={{ lineHeight: 1.45 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>طلبكِ قيد الانتظار</div>
              <div style={{ fontSize: 12.5, color: C.sub }}>ادفعي في المركز لتفعيل الباقة، وتصلكِ رسالة فور تفعيلها.</div>
            </div>
          </div>
          <button type="button" onClick={cancel} disabled={busy} style={{ alignSelf: "flex-start", height: 36, padding: "0 16px", borderRadius: 18, border: "1px solid #E8D3C0", background: C.white, color: C.sub, fontSize: 13, fontWeight: 600 }}>
            {busy ? "لحظة…" : "إلغاء الطلب"}
          </button>
        </div>
      ) : patient ? (
        <PrimaryButton onClick={() => { setErr(""); setSheet(true); }} disabled={pendQ.loading} style={{ marginTop: "auto", flexShrink: 0 }}>طلب اشتراك</PrimaryButton>
      ) : (
        <PrimaryButton href={R.Login} style={{ marginTop: "auto", flexShrink: 0 }}>سجّلي الدخول لطلب الباقة</PrimaryButton>
      )}

      {sheet && (
        <div role="dialog" aria-modal="true" aria-label="تأكيد طلب الاشتراك" onClick={() => !busy && setSheet(false)}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(40,20,50,0.38)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: C.white, borderRadius: "28px 28px 0 0", padding: "18px 20px calc(20px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 12 }}>
            <span aria-hidden style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, background: "#E6D8EB" }} />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>طلب اشتراك في الباقة</h2>
            <div style={{ borderRadius: 20, background: "#F8F2FA", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: C.sub2 }}>الباقة</span><b>{pkg.name}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: C.sub2 }}>عدد الجلسات</span><b>{pkg.sessions} جلسات</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ color: C.sub2 }}>السعر</span><b><span className="latin">{money(pkg.price, false)}</span> ل.س</b></div>
            </div>
            <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, display: "flex", gap: 6 }}>
              <Icon name="info" color={C.accentMid} size={16} />لا يُدفع شيء الآن. ادفعي في المركز، وتُفعَّل الباقة في حسابكِ فوراً بعد الدفع.
            </div>
            {err && <ErrorNote>{err}</ErrorNote>}
            <PrimaryButton onClick={submit} disabled={busy}>{busy ? "جارٍ الإرسال…" : "تأكيد الطلب"}</PrimaryButton>
            <button type="button" onClick={() => setSheet(false)} disabled={busy} style={{ height: 44, border: "none", background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600 }}>تراجع</button>
          </div>
        </div>
      )}
    </PhoneScreen>
  );
}
