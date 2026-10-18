/**
 * Design tokens — Fatema Beauty mauve identity (design-system.md §3 & §6).
 * Use these constants in inline styles so every screen shares one source of truth.
 */
import type { CSSProperties } from "react";

export const C = {
  accent: "#7B4687",      // primary mauve: buttons, dark card, logo
  accentDeep: "#5E3369",  // gradient ends, pressed
  accentMid: "#A877B6",   // icons, highlights
  danger: "#B03D6A",      // cancel / destructive text only
  dangerSoft: "#C45C86",
  ink: "#35213D",         // main text
  sub: "#76607E",         // secondary text
  sub2: "#866F8D",        // labels
  muted: "#A595AC",       // muted / times
  line: "#EDE2F1",        // dividers
  border: "#E9DCEE",      // card borders
  borderSoft: "#F0E6F3",
  tint: "#F3EAF6",        // light lilac fill
  tint2: "#F7F0F9",
  gold: "#C9A24B",
  gold2: "#D9B869",
  ok: "#3FA46A",
  okDeep: "#2E7D50",
  white: "#FFFFFF",
  onDark: "#ECDBF0",      // secondary text on the mauve card
  navText: "#634C68",
  navIcon: "#957D9A",
} as const;

export const SH = "0 12px 30px rgba(123,70,135,0.10), 0 2px 6px rgba(123,70,135,0.05)";
export const SH_SOFT = "0 8px 20px rgba(123,70,135,0.06)";
export const SHB = "0 6px 18px rgba(123,70,135,0.12), inset 0 1px 0 rgba(255,255,255,0.9)";
export const DEEP_SHADOW = "0 16px 34px rgba(123,70,135,0.32), inset 0 1px 0 rgba(255,255,255,0.25)";
export const SHEEN = "linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.20) 100%)";

export const GLASS: CSSProperties = {
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.75)",
};

/** The one dark mauve hero element per screen (and the primary button). */
export const DARK: CSSProperties = {
  backgroundColor: C.accent,
  backgroundImage: SHEEN,
  boxShadow: DEEP_SHADOW,
  color: C.white,
};

/** Selected chip / day / option. */
export const SELECTED: CSSProperties = {
  background: "linear-gradient(160deg,#F1E3F6,#D9BCE5)",
  border: "1px solid #FFFFFF",
  boxShadow: "0 10px 22px rgba(150,100,170,0.30)",
  color: C.accent,
};

export const DONE_GRAD: CSSProperties = {
  background: "linear-gradient(145deg,#C9A2D8,#7B4687)",
  boxShadow: "0 6px 12px rgba(123,70,135,0.30)",
};

export const ICON_FILL = "linear-gradient(145deg, #F6EEF9, #E6D3EE)";

export const SOFT_PANEL: CSSProperties = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(243,234,246,0.8))",
  border: "1px solid #FFFFFF",
  boxShadow: SH_SOFT,
};

export const CARD: CSSProperties = {
  background: C.white,
  border: `1px solid ${C.borderSoft}`,
  boxShadow: SH,
};

export const BG = "linear-gradient(170deg, #ECDDF2 0%, #F2E8F5 40%, #F9F5FB 100%)";
export const BG_WIDE = "linear-gradient(160deg, #ECDDF2 0%, #F2E8F5 35%, #F9F5FB 100%)";

export const FATEMA_PHOTO = "/images/fatema.jpg";
export const LOGO = "/brand/fatema-logo.svg";
export const LOGO_LIGHT = "/brand/fatema-logo-light.svg";
export const LOGO_ALT = "Fatema Beauty — Skin Care Center";
