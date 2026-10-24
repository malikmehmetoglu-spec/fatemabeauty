"use client";

/** Record a short voice note with MediaRecorder (max 3 minutes). Shared by the written-consult inbox and «يوم فاطمة». */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { C } from "@/lib/tokens";

export const recorderSupported = () => typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

export function useRecorder(maxSec = 180) {
  const [rec, setRec] = useState(false);
  const [sec, setSec] = useState(0);
  const [err, setErr] = useState("");
  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const done = useRef<(b: Blob) => void>(() => {});
  useEffect(() => {
    if (!rec) return;
    const t = setInterval(() => setSec((s) => { if (s + 1 >= maxSec) mr.current?.stop(); return s + 1; }), 1000);
    return () => clearInterval(t);
  }, [rec, maxSec]);
  useEffect(() => () => { mr.current?.stream.getTracks().forEach((t) => t.stop()); }, []);
  async function start(onDone: (b: Blob) => void) {
    setErr("");
    if (!recorderSupported()) { setErr("هذا المتصفح لا يدعم التسجيل الصوتي."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      chunks.current = []; done.current = onDone;
      m.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      m.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setRec(false); done.current(new Blob(chunks.current, { type: m.mimeType || "audio/webm" })); };
      mr.current = m; m.start(); setSec(0); setRec(true);
    } catch { setErr("لم يُسمح باستخدام الميكروفون. فعّليه من إعدادات المتصفح."); }
  }
  const stop = () => mr.current?.state === "recording" && mr.current.stop();
  return { rec, sec, err, start, stop };
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function VoiceRecorder({ blob, onChange }: { blob: Blob | null; onChange: (b: Blob | null) => void }) {
  const r = useRecorder();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { if (!blob) { setUrl(null); return; } const u = URL.createObjectURL(blob); setUrl(u); return () => URL.revokeObjectURL(u); }, [blob]);
  const btn = { height: 44, padding: "0 18px", borderRadius: 22, fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" as const };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {r.rec ? (
          <button type="button" onClick={r.stop} style={{ ...btn, border: "none", background: "#B03D6A", color: "#fff" }}>
            <Icon name="pause" size={17} color="#fff" />إيقاف التسجيل <span className="latin">{mmss(r.sec)}</span>
          </button>
        ) : (
          <button type="button" onClick={() => r.start(onChange)} style={{ ...btn, border: "1px solid #EADCF0", background: C.white, color: C.accent }}>
            <Icon name="mic" size={17} color={C.accent} />{blob ? "إعادة التسجيل" : "تسجيل رسالة صوتية"}
          </button>
        )}
        {blob && !r.rec && <button type="button" onClick={() => onChange(null)} style={{ ...btn, border: "1px solid #EADCF0", background: C.white, color: "#B03D6A" }}>إزالة التسجيل</button>}
      </div>
      {url && !r.rec && <audio controls src={url} style={{ width: "100%" }} aria-label="معاينة التسجيل" />}
      {r.err && <div style={{ fontSize: 13, color: "#B03D6A" }}>{r.err}</div>}
    </div>
  );
}
