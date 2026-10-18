"use client";

/** P_Prescriptions.dc.html — «وصفاتي»: latest prescription, previous ones, signed consent forms. */
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { PhoneScreen, TopBar } from "@/components/shell";
import { Circ, DarkGlow, EmptyState, Icon, Tag } from "@/components/ui";
import { R } from "@/lib/routes";
import { AR_MONTHS } from "@/lib/data";
import { arDate } from "@/lib/format";
import { C, CARD, DARK } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { useMe } from "@/lib/db/patients";
import { listConsents, listPrescriptions, rxItems, WHEN_LABEL, type ConsentAnswers } from "@/lib/db/clinical";
import { Wait } from "../account/Wait";

const DARK_PILL: CSSProperties = { height: 28, padding: "0 11px", borderRadius: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5 };
const ROW: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "12px 0" };
const short = (iso: string) => { const d = new Date(iso); return `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`; };
const iconFor = (n: string) => (/شمس|SPF/i.test(n) ? "sun" : /سيروم|مرطب/.test(n) ? "drop" : "bottle");

export default function PrescriptionsPage() {
  const { me, loading, error } = useMe();
  const id = me?.id ?? "";
  const { data: rx, loading: lr } = useQuery(["clinical", "rx", id], () => listPrescriptions(id), { enabled: !!id });
  const { data: consents } = useQuery(["clinical", "consents", id], () => listConsents(id), { enabled: !!id });
  const [open, setOpen] = useState<string | null>(null);
  const latest = rx?.[0];
  const previous = rx?.slice(1) ?? [];

  return (
    <PhoneScreen>
      <TopBar title="وصفاتي" back={R.Account} />
      {!me ? <Wait loading={loading} error={error} /> : lr ? <Wait loading /> : (
        <>
          {latest ? (
            <Link href={R.Routine} style={{ ...DARK, display: "block", borderRadius: 32, padding: 20, position: "relative", overflow: "hidden" }}>
              <DarkGlow />
              <div style={{ position: "relative" }}>
                <span style={{ height: 26, padding: "0 10px", borderRadius: 13, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center" }}>الأحدث</span>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                <span style={{ width: 50, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="file" color="#FFFFFF" size={22} /></span>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>وصفة العناية</div>
                  <div style={{ fontSize: 13, color: C.onDark }}>{latest.staff?.name ? `${latest.staff.name} · ` : ""}{arDate(new Date(latest.created_at))}</div>
                </div>
              </div>
              <div style={{ position: "relative", marginTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {rxItems(latest).map((x, i) => <span key={i} style={DARK_PILL}><Icon name={iconFor(x.name)} color="#FFFFFF" size={14} />{x.name}</span>)}
              </div>
              <div style={{ position: "relative", marginTop: 14, height: 46, borderRadius: 23, background: C.white, color: C.accent, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: "0 8px 18px rgba(0,0,0,0.12)" }}>
                افتحي روتيني<Icon name="chev" color={C.accent} size={16} stroke={2} />
              </div>
            </Link>
          ) : (
            <EmptyState compact icon="file" title="لا وصفات بعد" text="تكتب لكِ الأخصائية وصفة العناية المنزلية بعد جلستكِ، وتصلكِ هنا." />
          )}

          {previous.length > 0 && (
            <>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>الوصفات السابقة</h2>
              <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
                {previous.map((r, i) => (
                  <div key={r.id} style={{ borderTop: i ? `1px solid ${C.line}` : undefined }}>
                    <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} style={{ ...ROW, width: "100%", border: "none", background: "transparent", textAlign: "right" }}>
                      <Circ icon="file" size={42} iconSize={19} />
                      <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700 }}>وصفة العناية · {short(r.created_at)}</div>
                        <div style={{ fontSize: 12, color: C.sub2 }}>{r.staff?.name ?? "فريق المركز"} · {rxItems(r).length} مستحضرات</div>
                      </div>
                      <Icon name={open === r.id ? "up" : "down"} size={18} stroke={2} />
                    </button>
                    {open === r.id && (
                      <div style={{ padding: "0 54px 12px 0", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
                        {rxItems(r).map((x, j) => <div key={j}><b style={{ color: C.ink }}>{x.name}</b> — {WHEN_LABEL[x.when]}{x.how ? `، ${x.how}` : ""}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.ink, position: "relative" }}>نماذج الموافقة الموقّعة</h2>
          {consents?.length ? (
            <div style={{ ...CARD, borderRadius: 26, padding: "2px 16px" }}>
              {consents.map((c, i) => (
                <div key={c.id} style={{ ...ROW, borderTop: i ? `1px solid ${C.line}` : undefined }}>
                  <Circ icon="sign" size={42} iconSize={19} />
                  <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.35 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{(c.answers as ConsentAnswers)?.title ?? c.services?.name ?? "موافقة عامة"}</div>
                    <div style={{ fontSize: 12, color: C.sub2 }}>موقّع {arDate(new Date(c.signed_at))}</div>
                  </div>
                  <Tag kind="green">موقّع</Tag>
                </div>
              ))}
            </div>
          ) : (
            <Link href={R.P_Consent} style={{ ...CARD, borderRadius: 22, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <Circ icon="sign" size={40} iconSize={18} />
              <div style={{ flex: 1, fontSize: 13.5, color: C.sub }}>لم توقّعي أي نموذج بعد. يمكنكِ توقيع الموافقة قبل جلستكِ.</div>
              <Icon name="chev" size={18} stroke={2} />
            </Link>
          )}
        </>
      )}
    </PhoneScreen>
  );
}
