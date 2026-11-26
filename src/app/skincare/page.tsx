"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Stage } from "@/components/shell";
import { ErrorNote, Icon, Loading, Modal } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import {
  bookingError,
  isOpenVisit,
  personName,
  useLiveAppointments,
  type Appointment,
} from "@/lib/db/appointments";
import { isPaid } from "@/lib/db/levels";
import { clock, dayKey } from "@/lib/format";
import { initials } from "@/lib/data";
import { BG, C, ICON_FILL, LOGO, SHB } from "@/lib/tokens";
import { DatePill } from "../kiosk/kiosk";
import { SessionTimer } from "../admin/queue/session-ui";

type Specialist = { id: string; name: string; photo_url?: string | null };

const mins = (iso: string | null) =>
  iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function Avatar({
  name,
  photo,
  size,
  active,
  running,
}: {
  name: string;
  photo?: string | null;
  size: number;
  active?: boolean;
  running?: boolean;
}) {
  const ring = active
    ? `4px solid ${C.accent}`
    : running
      ? "4px solid #C8507F"
      : "4px solid rgba(255,255,255,0.95)";
  const shadow = active
    ? "0 18px 38px rgba(123, 70, 135, 0.28)"
    : "0 14px 32px rgba(95, 58, 108, 0.14)";

  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: ring,
        boxShadow: shadow,
        transition: `width 0.42s ${EASE}, height 0.42s ${EASE}, box-shadow 0.42s ${EASE}, border-color 0.28s ease`,
      }}
    />
  ) : (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: active
          ? "linear-gradient(145deg, #7B4687, #A86BB6)"
          : "linear-gradient(145deg, #F3E5F7, #DFC2E7)",
        border: ring,
        boxShadow: shadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.32),
        fontWeight: 700,
        color: active ? C.white : C.accent,
        transition: `width 0.42s ${EASE}, height 0.42s ${EASE}, font-size 0.42s ${EASE}, box-shadow 0.42s ${EASE}`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export default function SkincareScreen() {
  useLiveAppointments("skincare-screen");
  const today = dayKey();

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [list, setList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [noteAppt, setNoteAppt] = useState<Appointment | null>(null);
  const [noteText, setNoteText] = useState("");
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    // @ts-expect-error RPC added via SQL migration
    const { data, error } = await supabase.rpc("skincare_screen_data", { p_day: today });
    if (error) {
      setErr(bookingError(error));
    } else if (data) {
      const payload = data as { specialists?: Specialist[]; appointments?: Appointment[] };
      setSpecialists(payload.specialists ?? []);
      setList(payload.appointments ?? []);
      setErr("");
    }
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 8000);
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => {
      clearInterval(poll);
      clearInterval(t);
    };
  }, [load]);

  const selected = useMemo(
    () => specialists.find((s) => s.id === selectedId) ?? null,
    [specialists, selectedId]
  );

  async function run(a: Appointment, f: () => Promise<void>) {
    setBusy(a.id);
    setErr("");
    try {
      await f();
      await load();
    } catch (e) {
      setErr(bookingError(e));
    } finally {
      setBusy(null);
    }
  }

  const startSession = (a: Appointment, specialistId: string) =>
    run(a, async () => {
      // @ts-expect-error RPC added via SQL migration
      const { error } = await supabase.rpc("skincare_set_status", {
        p_id: a.id,
        p_status: "in_session",
        p_specialist_id: specialistId,
      });
      if (error) throw error;
    });

  const finishSession = (a: Appointment) => {
    if (!window.confirm(`إنهاء جلسة ${personName(a)}؟`)) return;
    run(a, async () => {
      // @ts-expect-error RPC added via SQL migration
      const { error } = await supabase.rpc("skincare_set_status", {
        p_id: a.id,
        p_status: "done",
        p_specialist_id: null,
      });
      if (error) throw error;
      setSelectedId(null);
    });
  };

  const waitingAll = list.filter((a) => a.status === "checked_in");
  const runningAll = list.filter((a) => a.status === "in_session");

  const selectedRunning = selected
    ? runningAll.filter((a) => a.specialist_id === selected.id)
    : [];
  const selectedWaiting = selected
    ? waitingAll
        .filter((a) => a.specialist_id === selected.id || !a.specialist_id)
        .sort(
          (x, y) =>
            Number(x.specialist_id !== selected.id) -
              Number(y.specialist_id !== selected.id) ||
            Number(!x.called_at) - Number(!y.called_at) ||
            (x.checked_in_at ?? "").localeCompare(y.checked_in_at ?? "")
        )
    : [];

  const isIdle = !selected;

  return (
    <Stage fluid width={1320} height={880} background={BG} padding="28px 36px" gap={24}>
      <style>{`
        @keyframes skincarePanelIn {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sk-circle-btn:active {
          transform: scale(0.94) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Fatema Beauty" style={{ height: 48 }} />
        <div style={{ flex: "1 1 240px", lineHeight: 1.35 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
            غرفة العناية بالبشرة
          </div>
          <div style={{ fontSize: 14.5, color: C.sub2 }}>
            {selected
              ? `الأخصائية: ${selected.name}`
              : "اضغطي على دائرتكِ للبدء"}
          </div>
        </div>
        {selected && (
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            style={{
              height: 44,
              padding: "0 18px",
              borderRadius: 22,
              border: "none",
              background: "rgba(255,255,255,0.85)",
              color: C.accent,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: SHB,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            عرض جميع الدوائر
          </button>
        )}
        <DatePill />
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Circles — large & screen-filling when idle, compact & docked when a specialist is open */}
          <div
            style={{
              flex: isIdle ? 1 : "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isIdle ? "34px 42px" : "14px 20px",
              flexWrap: "wrap",
              padding: isIdle ? "24px 12px" : "4px 0 8px",
              transition: `all 0.42s ${EASE}`,
            }}
          >
            {specialists.map((sp) => {
              const isSelected = sp.id === selectedId;
              const activeSession = runningAll.find((a) => a.specialist_id === sp.id);
              const waitCount = waitingAll.filter((a) => a.specialist_id === sp.id).length;
              const size = isIdle ? 158 : isSelected ? 88 : 66;

              return (
                <button
                  key={sp.id}
                  type="button"
                  className="sk-circle-btn"
                  onClick={() => setSelectedId(isSelected ? null : sp.id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: isIdle ? 14 : 7,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    opacity: !isIdle && !isSelected ? 0.72 : 1,
                    transform: isSelected ? "translateY(-3px) scale(1.03)" : "scale(1)",
                    transition: `all 0.36s ${EASE}`,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      name={sp.name}
                      photo={sp.photo_url}
                      size={size}
                      active={isSelected}
                      running={!!activeSession}
                    />
                    {activeSession && (
                      <span
                        title="جلسة جارية"
                        style={{
                          position: "absolute",
                          bottom: isIdle ? 8 : 2,
                          right: isIdle ? 8 : 2,
                          width: isIdle ? 22 : 16,
                          height: isIdle ? 22 : 16,
                          borderRadius: "50%",
                          background: "#C8507F",
                          border: "3px solid #fff",
                          boxShadow: "0 4px 10px rgba(200,80,127,0.35)",
                        }}
                      />
                    )}
                    {waitCount > 0 && (
                      <span
                        className="latin"
                        title="عميلات بانتظارك"
                        style={{
                          position: "absolute",
                          top: isIdle ? 4 : -4,
                          left: isIdle ? 4 : -4,
                          minWidth: isIdle ? 32 : 24,
                          height: isIdle ? 32 : 24,
                          borderRadius: 16,
                          padding: "0 7px",
                          background: C.accent,
                          color: C.white,
                          fontSize: isIdle ? 15 : 12,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "3px solid #fff",
                          boxShadow: "0 4px 12px rgba(123,70,135,0.3)",
                        }}
                      >
                        {waitCount}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: isIdle ? 18 : isSelected ? 15.5 : 13,
                      fontWeight: 700,
                      color: isSelected ? C.accent : C.ink,
                      transition: `font-size 0.32s ${EASE}`,
                    }}
                  >
                    {sp.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Workspace for Selected Specialist */}
          {selected && (
            <div
              key={selected.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                padding: "26px 28px",
                borderRadius: 32,
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 20px 50px rgba(123, 70, 135, 0.10)",
                animation: `skincarePanelIn 0.38s ${EASE}`,
              }}
            >
              {/* Running Session */}
              {selectedRunning.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#C8507F" }}>
                    الجلسة الجارية الآن
                  </div>
                  {selectedRunning.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        flexWrap: "wrap",
                        padding: "18px 22px",
                        borderRadius: 24,
                        background: "linear-gradient(145deg, #FFF5F9, #FCEAF1)",
                        boxShadow: "0 8px 24px rgba(200, 80, 127, 0.08)",
                      }}
                    >
                      <div style={{ flex: "1 1 240px", minWidth: 0, lineHeight: 1.5 }}>
                        <div style={{ fontSize: 21, fontWeight: 700, color: C.ink }}>
                          {personName(a)}
                        </div>
                        <div style={{ fontSize: 14.5, color: C.sub2 }}>
                          {isOpenVisit(a)
                            ? "جلسة غير محددة"
                            : `${a.service?.short_name ?? a.service?.name ?? ""}${
                                a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""
                              }`}{" "}
                          · <span className="latin">{a.minutes}</span> د ·{" "}
                          {a.room?.name ?? ""}
                        </div>
                      </div>

                      <SessionTimer a={a} />

                      <button
                        type="button"
                        onClick={() => {
                          setNoteAppt(a);
                          setNoteText(a.note ?? "");
                        }}
                        style={{
                          height: 50,
                          padding: "0 20px",
                          borderRadius: 25,
                          border: "none",
                          background: C.white,
                          color: C.accent,
                          fontSize: 14.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: SHB,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Icon name="edit" size={16} color={C.accent} />
                        ملاحظة الجلسة
                      </button>

                      <button
                        type="button"
                        disabled={busy === a.id}
                        onClick={() => finishSession(a)}
                        style={{
                          height: 54,
                          padding: "0 26px",
                          borderRadius: 27,
                          border: "none",
                          background: "linear-gradient(145deg, #D45B8B, #B83D6D)",
                          color: C.white,
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 12px 26px rgba(200,80,127,0.30)",
                          opacity: busy === a.id ? 0.6 : 1,
                        }}
                      >
                        إنهاء الجلسة
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Waiting Clients */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: C.accent }}>
                  العميلات المنتظرات ({selectedWaiting.length})
                </div>
                {selectedWaiting.length === 0 ? (
                  <div style={{ padding: "20px 0", fontSize: 14.5, color: C.sub2 }}>
                    لا توجد عميلات منتظرات حالياً.
                  </div>
                ) : (
                  selectedWaiting.map((a) => {
                    const paid = isPaid(a) && !isOpenVisit(a);
                    return (
                      <div
                        key={a.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                          padding: "14px 16px",
                          borderRadius: 20,
                          background: "#FAF6FC",
                        }}
                      >
                        <span
                          className="latin"
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 18,
                            flexShrink: 0,
                            background: a.called_at ? C.accent : ICON_FILL,
                            color: a.called_at ? C.white : C.accent,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: 700,
                          }}
                        >
                          {a.queue_no ?? "—"}
                        </span>
                        <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.45 }}>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>
                            {personName(a)}
                            {!a.specialist_id && (
                              <span
                                style={{
                                  marginInlineStart: 8,
                                  fontSize: 12.5,
                                  color: C.sub2,
                                  fontWeight: 600,
                                }}
                              >
                                (بدون أخصائية محددة)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 14, color: C.sub2 }}>
                            {isOpenVisit(a)
                              ? "جلسة غير محددة"
                              : `${a.service?.short_name ?? a.service?.name ?? ""}${
                                  a.level && a.level.level > 1 ? ` · ${a.level.name}` : ""
                                }`}{" "}
                            · <span className="latin">{a.minutes}</span> د ·{" "}
                            {a.room?.name ?? ""}
                            {a.called_at ? (
                              <>
                                {" "}
                                · نُوديت <span className="latin">{clock(a.called_at)}</span>
                              </>
                            ) : (
                              <>
                                {" "}
                                · تنتظر منذ{" "}
                                <span className="latin">{mins(a.checked_in_at)}</span> د
                              </>
                            )}
                          </div>
                        </div>
                        {paid ? (
                          <button
                            type="button"
                            disabled={busy === a.id || selectedRunning.length > 0}
                            onClick={() => startSession(a, selected.id)}
                            style={{
                              height: 52,
                              padding: "0 24px",
                              borderRadius: 26,
                              border: "none",
                              background: "linear-gradient(145deg, #8B5498, #6C3A78)",
                              color: C.white,
                              fontSize: 15.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 12px 24px rgba(123,70,135,0.28)",
                              opacity:
                                busy === a.id || selectedRunning.length > 0 ? 0.5 : 1,
                            }}
                          >
                            بدء الجلسة
                          </button>
                        ) : (
                          <span
                            style={{
                              height: 44,
                              padding: "0 18px",
                              borderRadius: 22,
                              background: "#FFF3E0",
                              color: "#A3621A",
                              fontSize: 14,
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isOpenVisit(a)
                              ? "تُحدَّد الجلسة في الاستقبال"
                              : "بانتظار الدفع في الاستقبال"}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Session Note Modal */}
      {noteAppt && (
        <Modal
          open
          onClose={() => setNoteAppt(null)}
          title={`ملاحظة الجلسة — ${personName(noteAppt)}`}
          width={480}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتبي ملاحظة سريعة حول الجلسة..."
              style={{
                width: "100%",
                borderRadius: 16,
                border: "1px solid #EADCF0",
                padding: 12,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setNoteAppt(null)}
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 20,
                  border: "1px solid #EADCF0",
                  background: C.white,
                  color: C.sub,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Stage>
  );
}
