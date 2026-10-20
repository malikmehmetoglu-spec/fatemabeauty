"use client";

/** P_Confirm.dc.html — review the booking, then create it with rpc book_appointment (live, Supabase). */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Card, Circ, DarkGlow, EmptyState, ErrorNote, Icon, Loading, PrimaryButton, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { useQuery } from "@/lib/db/query";
import { getService, listRooms, listSpecialists, priceLabel } from "@/lib/db/catalog";
import { book, bookingError, cancelMine, dateOfKey, freeChangeHours, myPackagesFor, useSearch } from "@/lib/db/appointments";
import { GuestCard } from "@/components/guest";
import { useRequirePatient } from "@/lib/supabase/session";
import { arDate, dayName, money } from "@/lib/format";
import { C, DARK } from "@/lib/tokens";
import { SpecialistAvatar } from "../SpecialistAvatar";

const chip = { display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.28)", fontSize: 12.5, fontWeight: 600, color: C.white } as const;

export default function ConfirmPage() {
  const s = useRequirePatient();
  const router = useRouter();
  const q = useSearch();
  const key = q?.get("service") ?? "", day = q?.get("day") ?? "", time = q?.get("time") ?? "", spId = q?.get("sp") ?? null, replace = q?.get("replace") ?? "";
  const svc = useQuery(["catalog", "service", key], () => getService(key), { enabled: !!key });
  const team = useQuery(["catalog", "specialists"], listSpecialists);
  const rooms = useQuery(["catalog", "rooms"], () => listRooms());
  const policy = useQuery(["appointments", "policy"], freeChangeHours);
  const pkgs = useQuery(["appointments", "pkgs", s.patient?.id, key], () => myPackagesFor(s.patient!.id, key), { enabled: !!s.patient && !!key });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (s.guest) return <PhoneScreen><TopBar title="تأكيد الحجز" back={R.Booking} /><GuestCard icon="cal" what="تفاصيل حجزكِ" /></PhoneScreen>;
  if (s.loading || !s.patient || !q) return <PhoneScreen><Loading /></PhoneScreen>;
  const service = svc.data;
  const sp = (team.data ?? []).find((t) => t.id === spId) ?? null;
  const room = (rooms.data ?? []).find((r) => r.id === service?.room_id);
  const pkg = pkgs.data?.[0];
  const valid = key && /^\d{4}-\d{2}-\d{2}$/.test(day) && /^\d{2}:\d{2}$/.test(time);

  async function confirm() {
    setBusy(true); setError("");
    try {
      const row = await book({ service: key, day, time, specialist: spId });
      // Changing an existing appointment: the old one is cancelled only after the new one is booked.
      if (replace && row?.id) {
        try { await cancelMine(replace, "غيّرت المراجِعة موعدها إلى وقت آخر"); }
        catch { router.replace(`${R.P_AppointmentDetail}?id=${replace}&moved=${row.id}`); return; }
      }
      router.replace(`${R.P_Booked}?id=${row?.id}`);
    } catch (e) { setError(bookingError(e)); setBusy(false); }
  }

  return (
    <PhoneScreen gap={12} padding="calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 22px)">
      <TopBar title={replace ? "تأكيد تغيير الموعد" : "مراجعة الحجز"} back={key ? `${R.Booking}?service=${key}${replace ? `&replace=${replace}` : ""}` : R.Booking} />
      {!valid ? (
        <EmptyState icon="cal" title="لم تختاري موعداً بعد" text="ارجعي إلى صفحة الحجز واختاري الخدمة واليوم والوقت." action={<PrimaryButton href={R.Booking}>اختيار موعد</PrimaryButton>} />
      ) : svc.loading ? <Loading /> : !service ? (
        <EmptyState icon="cal" title="هذه الخدمة غير متاحة الآن" action={<PrimaryButton href={R.Booking}>اختيار خدمة أخرى</PrimaryButton>} />
      ) : (
        <>
          <div style={{ ...DARK, position: "relative", overflow: "hidden", borderRadius: 30, padding: "18px 20px 16px" }}>
            <DarkGlow />
            <div aria-hidden style={{ position: "absolute", top: -50, left: -40, width: 170, height: 170, borderRadius: 85, border: "1px solid rgba(255,255,255,0.10)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.onDark }}>موعدكِ</div>
                  <div style={{ fontSize: "clamp(22px, 6.6vw, 26px)", fontWeight: 700 }}>{arDate(dateOfKey(day), { day: false })}</div>
                  <div style={{ fontSize: 14, color: "#F2E6F4" }}>{dayName(dateOfKey(day))} · {dateOfKey(day).getFullYear()}</div>
                </div>
                <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                  <div style={{ fontSize: 12.5, color: C.onDark }}>الساعة</div>
                  <div dir="ltr" className="latin" style={{ fontSize: 38, fontWeight: 700 }}>{time}</div>
                </div>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "14px 0 12px" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={chip}><Icon name="sparkle" color="#FFFFFF" size={15} />{service.name} · {service.minutes} د</span>
                {room && <span style={chip}><Icon name="door" color="#FFFFFF" size={15} />{room.name}</span>}
              </div>
            </div>
          </div>

          <Card padding="4px 16px">
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0" }}>
              <SpecialistAvatar sp={sp} />
              <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 12, color: C.sub2 }}>الأخصائية</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{sp ? sp.name : "أي أخصائية متاحة"}</div>
              </div>
              {sp?.title && <span style={{ fontSize: 12, color: C.sub2 }}>{sp.title}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
              <Circ icon="receipt" size={42} iconSize={19} />
              <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 12, color: C.sub2 }}>قيمة الجلسة</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{priceLabel(service)}</div>
              </div>
              {pkg && <Tag kind="green">مشمولة بباقتكِ</Tag>}
            </div>
          </Card>

          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 22, padding: "11px 14px", background: "linear-gradient(160deg,#FFFFFF 0%,#F4E6F8 100%)", border: "1.5px solid #C9A2D8" }}>
            <Circ icon={pkg ? "gift" : "wallet"} size={40} iconSize={19} />
            <span style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.ink }}>{pkg ? "من باقتكِ" : "الدفع في المركز"}</span>
              <span style={{ display: "block", fontSize: 12, color: C.sub2 }}>
                {pkg ? `${pkg.package?.name} · متبقٍ ${pkg.sessions_total - pkg.sessions_used} جلسات` : "نقداً أو بالبطاقة يوم الجلسة"}
              </span>
            </span>
          </div>

          {policy.data != null && (
            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 20, padding: "11px 14px", background: "rgba(255,255,255,0.55)", border: "1px dashed #E1CDE6" }}>
              <Icon name="info" color={C.accentMid} size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}>التعديل أو الإلغاء مجاني حتى <b style={{ color: C.accent }}>{policy.data} {policy.data >= 3 && policy.data <= 10 ? "ساعات" : "ساعة"}</b> قبل الموعد.</div>
            </div>
          )}

          {error && <ErrorNote>{error}</ErrorNote>}

          <div style={{ marginTop: "auto", position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 6px" }}>
              <span style={{ fontSize: 13, color: C.sub2 }}>{pkg ? "المستحق الآن" : service.price ? "تدفعينها في المركز" : "قيمة الجلسة"}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.accent }}>{pkg || !service.price ? "بدون مقابل" : money(service.price)}</span>
            </div>
            <PrimaryButton onClick={confirm} disabled={busy} style={{ width: "100%" }}>{busy ? "جارٍ الحجز…" : replace ? "تأكيد الموعد الجديد" : "تأكيد الحجز"}</PrimaryButton>
          </div>
        </>
      )}
    </PhoneScreen>
  );
}
