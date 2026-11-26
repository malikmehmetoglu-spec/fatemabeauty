"use client";

import { useEffect, useMemo, useState } from "react";
import { Stage } from "@/components/shell";
import { ErrorNote, Icon, Loading, Modal } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listSpecialists } from "@/lib/db/catalog";
import {
  bookingError,
  isOpenVisit,
  listRange,
  personName,
  setStatus,
  useLiveAppointments,
  type Appointment,
} from "@/lib/db/appointments";
import { isPaid } from "@/lib/db/levels";
import { clock, dayKey } from "@/lib/format";
import { initials } from "@/lib/data";
import { BG, C, ICON_FILL, LOGO, SH, SHB } from "@/lib/tokens";
import { DatePill } from "../kiosk/kiosk";
import { SessionTimer } from "../admin/queue/session-ui";

const mins = (iso: string | null) =>
  iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0;

function Avatar({
  name,
  photo,
  size,
  active,
}: {
  name: string;
  photo?: string | null;
  size: number;
  active?: boolean;
}) {
  const border = active ? `3px solid ${C.accent}` : "3px solid #FFFFFF";
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        objectFit: "cover",
        border,
        boxShadow: SHB,
        transition: "all 0.25s ease",
      }}
    />
  ) : (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: active
          ? "linear-gradient(145deg, #7B4687, #A86BB6)"
          : "linear-gradient(145deg, #EEDBF2, #DABBE1)",
        border,
        boxShadow: SHB,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 700,
        color: active ? C.white : C.accent,
        transition: "all 0.25s ease",
      }}
    >
      {initials(name)}
    </span>
  );
}

export default function SkincareScreen() {
  useLiveAppointments("skincare-screen");
  const team = useQuery(["catalog", "specialists-all"], () => listSpecialists());
  const today = dayKey();
  const q = useQuery(["appointments", "day", today], () => listRange(today));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [noteAppt, setNoteAppt] = useState<Appointment | null>(null);
  const [noteText, setNoteText] = useState("");
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => q.data ?? [], [q.data]);
  const specialists = useMemo(() => team.data ?? [], [team.data]);

  const selected = specialists.find((s) => s.id === selectedId) ?? null;

  async function run(a: Appointment, f: () => Promise<unknown>) {
    setBusy(a.id);
    setErr("");
    try {
      await f();
    } catch (e) {
      setErr(bookingError(e));
    } finally {
      setBusy(null);
    }
  }

  const startSession = (a: Appointment, specialistId: string) =>
    run(a, () => setStatus(a.id, "in_session", { specialist_id: specialistId }));

  const finishSession = (a: Appointment) => {
    if (!window.confirm(`إنهاء جلسة ${personName(a)}؟`)) return;
    run(a, async () => {
      await setStatus(a.id, "done");
      // Shrink circle back and line up with the rest
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

  return (
    <Stage fluid width={1280} height={860} background={BG} padding="26px 32px" gap={20}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Fatema Beauty" style={{ height: 46 }} />
        <div style={{ flex: "1 1 220px", lineHeight: 1.3 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>
            غرفة العناية بالبشرة
          </div>
          <div style={{ fontSize: 14, color: C.sub2 }}>
            {selected
              ? `الأخصائية: ${selected.name} — اضغطي على الدائرة للتصغير`
              : "اختاري دائرتكِ لبدء الجلسة أو متابعة العميلات"}
          </div>
        </div>
        <DatePill />
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}

      {q.loading || team.loading ? (
        <Loading />
      ) : (
        <>
          {/* Circles Row — compact when idle/finished, highlighted when active */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              flexWrap: "wrap",
              padding: "14px 18px",
              borderRadius: 28,
              background: "rgba(255,255,255,0.65)",
              border: "1px solid #EFE3F3",
              boxShadow: SH,
            }}
          >
            {specialists.map((sp) => {
              const isSelected = sp.id === selectedId;
              const activeSession = runningAll.find((a) => a.specialist_id === sp.id);
              const waitCount = waitingAll.filter((a) => a.specialist_id === sp.id).length;
              const size = isSelected ? 96 : 72;

              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : sp.id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: isSelected ? "12px 18px" : "8px 12px",
                    borderRadius: 24,
                    border: isSelected ? `2px solid ${C.accent}` : "2px solid transparent",
                    background: isSelected ? C.white : "transparent",
                    boxShadow: isSelected ? SHB : "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      name={sp.name}
                      photo={sp.photo_url}
                      size={size}
                      active={isSelected || !!activeSession}
                    />
                    {activeSession && (
                      <span
                        title="جلسة جارية"
                        style={{
                          position: "absolute",
                          bottom: 2,
                          right: 2,
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          background: "#C8507F",
                          border: "2px solid #fff",
                        }}
                      />
                    )}
                    {waitCount > 0 && (
                      <span
                        className="latin"
                        title="عميلات بانتظارك"
                        style={{
                          position: "absolute",
                          top: -4,
                          left: -4,
                          minWidth: 24,
                          height: 24,
                          borderRadius: 12,
                          padding: "0 6px",
                          background: C.accent,
                          color: C.white,
                          fontSize: 12,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        {waitCount}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: isSelected ? 16 : 13.5,
                      fontWeight: 700,
                      color: isSelected ? C.accent : C.ink,
                    }}
                  >
                    {sp.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded Workspace for Selected Specialist */}
          {selected && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "22px 24px",
                borderRadius: 28,
                background: C.white,
                border: "1px solid #F0E6F3",
                boxShadow: SHB,
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
                        gap: 16,
                        flexWrap: "wrap",
                        padding: "16px 18px",
                        borderRadius: 22,
                        background: "#FDF1F6",
                        border: "1px solid #F2CADB",
                      }}
                    >
                      <div style={{ flex: "1 1 240px", minWidth: 0, lineHeight: 1.5 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.ink }}>
                          {personName(a)}
                        </div>
                        <div style={{ fontSize: 14, color: C.sub2 }}>
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
                          height: 48,
                          padding: "0 18px",
                          borderRadius: 24,
                          border: `1px solid ${C.accent}`,
                          background: C.white,
                          color: C.accent,
                          fontSize: 14.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
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
                          height: 52,
                          padding: "0 24px",
                          borderRadius: 26,
                          border: "none",
                          background: "#C8507F",
                          color: C.white,
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 10px 22px rgba(200,80,127,0.28)",
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>
                  العميلات المنتظرات ({selectedWaiting.length})
                </div>
                {selectedWaiting.length === 0 ? (
                  <div style={{ padding: "18px 0", fontSize: 14, color: C.sub2 }}>
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
                          gap: 14,
                          flexWrap: "wrap",
                          padding: "12px 0",
                          borderTop: "1px solid #EDE2F1",
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
                          <div style={{ fontSize: 17.5, fontWeight: 700 }}>
                            {personName(a)}
                            {!a.specialist_id && (
                              <span
                                style={{
                                  marginInlineStart: 8,
                                  fontSize: 12,
                                  color: C.sub2,
                                  fontWeight: 600,
                                }}
                              >
                                (بدون أخصائية محددة)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13.5, color: C.sub2 }}>
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
                              height: 50,
                              padding: "0 22px",
                              borderRadius: 25,
                              border: "none",
                              background: C.accent,
                              color: C.white,
                              fontSize: 15.5,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 10px 22px rgba(123,70,135,0.28)",
                              opacity:
                                busy === a.id || selectedRunning.length > 0 ? 0.5 : 1,
                            }}
                          >
                            بدء الجلسة
                          </button>
                        ) : (
                          <span
                            style={{
                              height: 42,
                              padding: "0 16px",
                              borderRadius: 21,
                              background: "#FFF3E0",
                              color: "#A3621A",
                              border: "1px solid #F6DDB9",
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
