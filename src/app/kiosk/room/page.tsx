"use client";

/**
 * «تابلت الغرفة» — the shared tablet in the treatment room (permission room_tablet, one login for the room).
 * The specialist taps her avatar («أنا: …», no password; remembered for this browser session), then sees her clients:
 * called / waiting (paid → «بدء الجلسة»; unpaid → «بانتظار الدفع» — the server enforces the pay gate), the running
 * session with its timer, extension request and «إنهاء». Starting records her as the appointment's specialist.
 */
import { useEffect, useMemo, useState } from "react";
import { Stage } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listSpecialists } from "@/lib/db/catalog";
import { bookingError, isOpenVisit, listRange, personName, setStatus, timeOf, useLiveAppointments, type Appointment } from "@/lib/db/appointments";
import { isPaid } from "@/lib/db/levels";
import { clock, dayKey } from "@/lib/format";
import { initials } from "@/lib/data";
import { BG, C, ICON_FILL, LOGO, SH, SHB } from "@/lib/tokens";
import { DatePill, useKiosk } from "../kiosk";
import { ExtendRequest, SessionTimer, usePendingExtensions } from "../../admin/queue/session-ui";

const KEY = "fb.room.me";
const big = { height: 56, padding: "0 24px", borderRadius: 28, border: "none", fontSize: 17, fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0 } as const;
const card = { borderRadius: 28, padding: "18px 20px", background: C.white, border: "1px solid #F0E6F3", boxShadow: SH } as const;
const mins = (iso: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0);

function Avatar({ name, photo, size }: { name: string; photo?: string | null; size: number }) {
  return photo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={photo} alt="" style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", border: "3px solid #FFFFFF", boxShadow: SHB }} />
    : <span style={{ width: size, height: size, borderRadius: size / 2, background: "linear-gradient(145deg, #EEDBF2, #DABBE1)", border: "3px solid #FFFFFF", boxShadow: SHB, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: C.accent }}>{initials(name)}</span>;
}

export default function RoomTablet() {
  const k = useKiosk({ perm: "room_tablet" });
  useLiveAppointments("room-tablet");
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists(), { enabled: !k.gate });
  const today = dayKey();
  const q = useQuery(["appointments", "day", today], () => listRange(today), { enabled: !k.gate });
  const ext = usePendingExtensions("room-ext");
  const [me, setMe] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [, tick] = useState(0);
  useEffect(() => { setMe(sessionStorage.getItem(KEY)); }, []);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t); }, []);
  const pick = (id: string | null) => { setMe(id); if (id) sessionStorage.setItem(KEY, id); else sessionStorage.removeItem(KEY); };

  const list = useMemo(() => q.data ?? [], [q.data]);
  if (k.gate) return k.gate;
  const who = (team.data ?? []).find((t) => t.id === me) ?? null;
  const running = list.filter((a) => a.status === "in_session" && a.specialist_id === me);
  // hers first (called ones on top), then clients waiting in the room without a specialist
  const waitingAll = list.filter((a) => a.status === "checked_in");
  const mine = waitingAll.filter((a) => a.specialist_id === me)
    .sort((x, y) => Number(!x.called_at) - Number(!y.called_at) || (x.checked_in_at ?? "").localeCompare(y.checked_in_at ?? ""));
  const nobody = waitingAll.filter((a) => !a.specialist_id);

  async function run(a: Appointment, f: () => Promise<unknown>) {
    setBusy(a.id); setErr("");
    try { await f(); } catch (e) { setErr(bookingError(e)); } finally { setBusy(null); }
  }
  const start = (a: Appointment) => run(a, () => setStatus(a.id, "in_session", { specialist_id: me }));
  const finish = (a: Appointment) => { if (window.confirm(`إنهاء جلسة ${personName(a)}؟`)) run(a, () => setStatus(a.id, "done")); };

  const waitRow = (a: Appointment) => {
    const paid = isPaid(a) && !isOpenVisit(a);
    return (
      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid #EDE2F1" }}>
        <span className="latin" style={{ width: 60, height: 60, borderRadius: 20, flexShrink: 0, background: a.called_at ? C.accent : ICON_FILL, color: a.called_at ? C.white : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>{a.queue_no ?? "—"}</span>
        <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.45 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{personName(a)}</div>
          <div style={{ fontSize: 14, color: C.sub2 }}>
            {isOpenVisit(a) ? "جلسة غير محددة" : `${a.service?.short_name ?? ""}${a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""}`} · <span className="latin">{a.minutes}</span> د · {a.room?.name ?? ""}
            {a.called_at ? <> · نُوديت <span className="latin">{clock(a.called_at)}</span></> : <> · تنتظر منذ <span className="latin">{mins(a.checked_in_at)}</span> د</>}
          </div>
        </div>
        {paid
          ? <button type="button" disabled={busy === a.id || running.length > 0} onClick={() => start(a)} style={{ ...big, background: C.accent, color: C.white, boxShadow: "0 12px 26px rgba(123,70,135,0.28)", opacity: busy === a.id || running.length > 0 ? 0.5 : 1 }}>بدء الجلسة</button>
          : <span style={{ height: 44, padding: "0 16px", borderRadius: 22, background: "#FFF3E0", color: "#A3621A", border: "1px solid #F6DDB9", fontSize: 14.5, fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>{isOpenVisit(a) ? "تُحدَّد الجلسة في الاستقبال" : "بانتظار الدفع في الاستقبال"}</span>}
      </div>
    );
  };

  return (
    <Stage fluid width={1194} height={834} background={BG} padding="28px 32px" gap={18}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Fatema Beauty" style={{ height: 46 }} />
        <div style={{ flex: "1 1 200px", lineHeight: 1.3 }}>
          <div style={{ fontSize: 26, fontWeight: 700 }}>تابلت الغرفة</div>
          <div style={{ fontSize: 14, color: C.sub2 }}>{who ? `أنا: ${who.name}` : "اختاري اسمكِ للبدء"}</div>
        </div>
        {who && (
          <button type="button" onClick={() => pick(null)} style={{ ...big, height: 52, background: C.white, color: C.accent, boxShadow: SHB, fontSize: 15 }}>
            <Avatar name={who.name} photo={who.photo_url} size={34} />تبديل الأخصائية
          </button>
        )}
        <DatePill />
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}

      {!who ? (
        <div style={{ ...card, flex: 1, display: "flex", flexDirection: "column", gap: 20, alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>من أنتِ؟</div>
          {team.loading ? <Loading /> : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 22, justifyContent: "center" }}>
              {(team.data ?? []).map((t) => (
                <button key={t.id} type="button" onClick={() => pick(t.id)} style={{ border: "none", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: C.ink, width: 140, cursor: "pointer" }}>
                  <Avatar name={t.name} photo={t.photo_url} size={96} />{t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : q.loading ? <Loading /> : (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {running.map((a) => (
            <div key={a.id} style={{ ...card, background: "linear-gradient(160deg, #FFFFFF, #FBEFF5)", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 240px", lineHeight: 1.4 }}>
                  <div style={{ fontSize: 14, color: "#9C2F5C", fontWeight: 700 }}>في الجلسة الآن</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{personName(a)}</div>
                  <div style={{ fontSize: 14, color: C.sub2 }}>{a.service?.short_name}{a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""} · بدأت <span className="latin">{a.started_at ? clock(a.started_at) : timeOf(a)}</span></div>
                </div>
                <SessionTimer a={a} />
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <ExtendRequest apptId={a.id} pending={(ext.data ?? []).find((x) => x.appointment_id === a.id)} onError={setErr} />
                <button type="button" disabled={busy === a.id} onClick={() => finish(a)} style={{ ...big, background: C.accent, color: C.white, opacity: busy === a.id ? 0.5 : 1 }}>إنهاء الجلسة</button>
              </div>
            </div>
          ))}
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>بانتظاركِ</div>
            {mine.length === 0 ? <div style={{ fontSize: 15, color: C.sub2, padding: "10px 0" }}>لا أحد ينتظركِ الآن. تنادي الاستقبال المراجِعة عند جاهزيتكِ.</div> : mine.map(waitRow)}
            {running.length > 0 && mine.length > 0 && <div style={{ fontSize: 13, color: C.sub2, paddingTop: 6 }}>أنهي الجلسة الجارية قبل بدء التالية.</div>}
          </div>
          {nobody.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>بلا أخصائية <span style={{ fontSize: 13.5, color: C.sub2, fontWeight: 500 }}>· تُسجَّل باسمكِ عند البدء</span></div>
              {nobody.map(waitRow)}
            </div>
          )}
        </div>
      )}
    </Stage>
  );
}
