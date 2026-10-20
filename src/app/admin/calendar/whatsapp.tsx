"use client";

/** WhatsApp buttons shared by «طلبات الحجز», the calendar dialog and the patients list/record. */
import type { CSSProperties, ReactNode } from "react";
import { C } from "@/lib/tokens";
import { greetText, waLink } from "@/lib/db/bookingRequests";

export const WA_GREEN = "#1F9D57";

/** Outline WhatsApp glyph (bubble + handset) drawn in the app's stroke style. */
export function WaIcon({ size = 18, color = WA_GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3.6 20.4l1.2-4.1A8.6 8.6 0 1 1 8 19.3z" />
      <path d="M9.1 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.6.4-1.5.5-2.3.2a8 8 0 0 1-4.7-4.7c-.3-.8-.2-1.7.2-2.3z" />
    </svg>
  );
}

/** Big green action (after confirming). Opens wa.me in a new tab and calls onSent. */
export function WaButton({ phone, text, children, onSent, style }: { phone?: string | null; text: string; children: ReactNode; onSent?: () => void; style?: CSSProperties }) {
  const href = waLink(phone, text);
  const base: CSSProperties = {
    height: 46, borderRadius: 23, padding: "0 18px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none",
    background: href ? "linear-gradient(145deg, #2BB36B, #1F9D57)" : "#E9E4EB", color: href ? "#fff" : C.muted,
    boxShadow: href ? "0 12px 26px rgba(31,157,87,0.28), inset 0 1px 0 rgba(255,255,255,0.25)" : "none", ...style,
  };
  if (!href) return <span style={base} title="لا يوجد رقم هاتف لهذه المراجِعة"><WaIcon color={C.muted} />{children}</span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onSent?.()} style={base}><WaIcon color="#fff" />{children}</a>;
}

/** Round icon button «مراسلة على واتساب» for table rows / record header. Disabled with a tooltip when there is no phone. */
export function WaIconLink({ phone, name, size = 36 }: { phone?: string | null; name?: string | null; size?: number }) {
  const href = waLink(phone, greetText(name));
  const box: CSSProperties = { width: size, height: size, borderRadius: size / 2, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #D6EEDF", background: "#F1FBF5" };
  if (!href) return <span role="img" aria-label="لا يوجد رقم هاتف" title="لا يوجد رقم هاتف" style={{ ...box, opacity: 0.45, border: "1px solid #ECE4EE", background: "#F7F4F8", cursor: "not-allowed" }}><WaIcon color={C.muted} /></span>;
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label="مراسلة على واتساب" title="مراسلة على واتساب" style={box}><WaIcon /></a>;
}
