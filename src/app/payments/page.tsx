"use client";

/** Payments.dc.html — the signed-in patient's own invoices and packages (live, Supabase). */
import { PhoneScreen, TopBar } from "@/components/shell";
import { DarkGlow, EmptyState, ErrorNote, Icon, Loading, Progress, SecondaryButton, SectionTitle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { collected, myInvoices, myPackages, outstanding, PAY_LABEL } from "@/lib/db/finance";
import { AR_MONTHS } from "@/lib/data";
import { arDate, dayKey, dayName, money } from "@/lib/format";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, CARD, DARK, ICON_FILL } from "@/lib/tokens";

const stat = { flex: 1, minWidth: 0, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 18, padding: "8px 12px", lineHeight: 1.35 } as const;

export default function PaymentsPage() {
  const { loading: sLoading, patient } = useRequirePatient();
  const pid = patient?.id ?? null;
  const invs = useQuery(["invoices", "mine", pid], () => myInvoices(pid as string), { enabled: !!pid });
  const pkgs = useQuery(["patients", "packages", pid], () => myPackages(pid as string), { enabled: !!pid });

  if (sLoading || !patient) return <PhoneScreen><TopBar title="مدفوعاتي" /><Loading /></PhoneScreen>;

  const list = invs.data ?? [];
  const paid = list.reduce((s, i) => s + collected(i), 0);
  const due = list.reduce((s, i) => s + outstanding(i), 0);
  const visits = list.filter((i) => i.appointment_id).length;
  const left = (pkgs.data ?? []).reduce((s, p) => s + Math.max(0, p.sessions_total - p.sessions_used), 0);

  return (
    <PhoneScreen>
      <TopBar title="مدفوعاتي" />

      <div style={{ ...DARK, borderRadius: 32, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
        <DarkGlow style={{ right: "auto", left: -60 }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: C.onDark }}>إجمالي ما دفعتِه</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2 }}>{money(paid, false)} <span style={{ fontSize: 16 }}>ل.س</span></div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, color: C.onDark }}>{due ? "مستحق عليكِ" : "لا مستحقات"}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "3px 10px", fontSize: 12 }}>
              {due ? money(due) : <><Icon name="check" color="#FFFFFF" size={13} stroke={2.4} />مسدّد</>}
            </div>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 16 }}>
          <div style={stat}><div style={{ fontSize: 11, color: C.onDark }}>زيارات</div><div style={{ fontSize: 17, fontWeight: 700 }}>{visits}</div></div>
          <div style={stat}><div style={{ fontSize: 11, color: C.onDark }}>متبقٍ في الباقات</div><div style={{ fontSize: 17, fontWeight: 700 }}>{left} جلسات</div></div>
        </div>
      </div>

      {!!pkgs.data?.length && (<>
        <SectionTitle>باقاتي</SectionTitle>
        <div style={{ ...CARD, border: "none", borderRadius: 26, padding: "4px 16px" }}>
          {pkgs.data.map((p, i) => (
            <div key={p.id} style={{ padding: "12px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, fontWeight: 700 }}>
                <span>{p.packages?.name ?? "باقة"}</span>
                <span style={{ color: C.accent }}>{p.sessions_used} / {p.sessions_total}</span>
              </div>
              <div style={{ fontSize: 12, color: C.sub2, margin: "2px 0 8px" }}>منذ {arDate(new Date(p.purchased_at), { day: false, year: true })} · متبقٍ {Math.max(0, p.sessions_total - p.sessions_used)} جلسات</div>
              <Progress pct={p.sessions_total ? (p.sessions_used / p.sessions_total) * 100 : 0} />
            </div>
          ))}
        </div>
      </>)}

      <SectionTitle>سجل الزيارات والفواتير</SectionTitle>
      {invs.loading ? <Loading /> : invs.error ? <ErrorNote>{invs.error}</ErrorNote> : list.length === 0 ? (
        <EmptyState compact icon="receipt" title="لا فواتير بعد" text="بعد كل زيارة أو شراء من المركز تظهر فاتورتكِ هنا مع طريقة الدفع." />
      ) : (
        <div style={{ ...CARD, border: "none", position: "relative", borderRadius: 26, padding: "2px 16px" }}>
          {list.map((r, i) => {
            const d = new Date(r.created_at);
            const dk = dayKey(d); // Damascus day, not the phone's time zone
            const title = r.appointments?.services?.name ?? r.invoice_items?.[0]?.label ?? "فاتورة";
            const more = (r.invoice_items?.length ?? 0) - 1;
            const byPkg = !!r.patient_package_id;
            const open = outstanding(r);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${C.line}` : undefined }}>
                <div style={{ width: 56, height: 52, borderRadius: 14, flexShrink: 0, background: ICON_FILL, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1.1 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: C.accent }}>{Number(dk.slice(8))}</span>
                  <span style={{ fontSize: 10, color: C.sub2, whiteSpace: "nowrap" }}>{AR_MONTHS[Number(dk.slice(5, 7)) - 1]}</span>
                </div>
                <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{title}{more > 0 ? ` + ${more}` : ""}</div>
                  <div style={{ fontSize: 12, color: C.sub2 }}>{dayName(d)}{r.appointments?.staff?.name ? ` · ${r.appointments.staff.name}` : ""} · {byPkg ? "من الباقة" : PAY_LABEL[r.method]}</div>
                </div>
                <div style={{ textAlign: "left", lineHeight: 1.35, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{byPkg && r.total === 0 ? "مشمولة" : money(r.total, false)}</div>
                  <div style={{ fontSize: 11, color: open ? C.danger : C.accentMid }}>{byPkg && r.total === 0 ? "بالباقة" : open ? `متبقٍ ${money(open, false)}` : "ل.س"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!!list.length && <SecondaryButton icon="download" onClick={() => window.print()} style={{ marginTop: "auto", position: "relative" }}>تنزيل كشف حساب PDF</SecondaryButton>}
    </PhoneScreen>
  );
}
