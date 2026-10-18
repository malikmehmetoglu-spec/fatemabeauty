"use client";

/** Small shared bits for the patient screens of the marketing / consult domain. */
import type { CSSProperties } from "react";
import { Avatar } from "@/components/ui";
import { initials } from "@/lib/data";
import { C } from "@/lib/tokens";

export function toggleChip(on: boolean, extra: CSSProperties = {}): CSSProperties {
  return {
    height: 38, padding: "0 14px", borderRadius: 19, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: `1px solid ${on ? "#FFFFFF" : "#EADCF0"}`, background: on ? "linear-gradient(160deg,#F1E3F6,#D9BCE5)" : "#FFFFFF",
    color: on ? C.accent : C.sub2, boxShadow: on ? "0 8px 18px rgba(150,100,170,0.28)" : "0 3px 10px rgba(123,70,135,0.05)", ...extra,
  };
}

export const fieldStyle: CSSProperties = {
  width: "100%", height: 50, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, padding: "0 14px",
  fontSize: 14, color: C.ink, outline: "none", boxShadow: "inset 0 2px 6px rgba(123,70,135,0.05)",
};

/** Staff photo when available, otherwise initials. */
export function StaffAvatar({ name, photo, size = 48, style }: { name: string; photo?: string | null; size?: number; style?: CSSProperties }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flexShrink: 0, ...style }} />;
  }
  return <Avatar initials={initials(name)} size={size} />;
}
