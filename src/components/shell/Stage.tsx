"use client";

import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BG_WIDE, C } from "@/lib/tokens";
import { Blobs } from "./PhoneScreen";

/** Layout mode of the nearest `Stage`: "fixed" = scaled design canvas; "fluid" = reflowed page (portrait tablet / phone). */
export type StageLayout = { fluid: boolean; narrow: boolean };
const StageCtx = createContext<StageLayout>({ fluid: false, narrow: false });
export const useStageLayout = () => useContext(StageCtx);

/**
 * Fixed-size canvas scaled to fit the device: used by the reception tablet (1194×834) and the waiting-room TV (1920×1080),
 * which are dedicated full-screen devices. Inside, lay out exactly as in the design.
 *
 * `fluid` (opt-in, reception tablet): on portrait or narrow screens the canvas is not scaled down; the page renders at
 * its natural size with `data-stage="fluid"` (and `data-narrow` under 600px) so the page can reflow with CSS, and it
 * scrolls vertically. On landscape screens the canvas is stretched to the viewport's aspect ratio (no empty bands).
 */
export function Stage({ width, height, children, background = BG_WIDE, padding, direction = "column", gap = 18, style, fluid = false }: {
  width: number; height: number; children: ReactNode; background?: string; padding?: string;
  direction?: "row" | "column"; gap?: number; style?: CSSProperties; fluid?: boolean;
}) {
  const [vp, setVp] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const fit = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const vw = vp?.w ?? width, vh = vp?.h ?? height;
  const isFluid = fluid && (vw < vh || vw < 900);
  const narrow = isFluid && vw < 600;

  if (isFluid) {
    return (
      <StageCtx.Provider value={{ fluid: true, narrow }}>
        <div style={{ position: "fixed", inset: 0, background, overflowX: "hidden", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div dir="rtl" data-stage="fluid" data-narrow={narrow ? "" : undefined} style={{
            position: "relative", minHeight: "100%", width: "100%", boxSizing: "border-box", color: C.ink,
            isolation: "isolate", overflow: "hidden", display: "flex", flexDirection: "column", gap: narrow ? 14 : Math.min(gap, 20),
            padding: narrow ? "16px 16px 28px" : "24px 24px 32px", ...style,
          }}>
            <Blobs width={Math.min(vw, 900)} />
            {children}
          </div>
        </div>
      </StageCtx.Provider>
    );
  }

  const scale = Math.min(vw / width, vh / height);
  // fluid pages stretch the canvas to the screen's aspect ratio instead of leaving empty bands
  const cw = fluid ? Math.max(width, vw / scale) : width, ch = fluid ? Math.max(height, vh / scale) : height;
  return (
    <StageCtx.Provider value={{ fluid: false, narrow: false }}>
      <div style={{ position: "fixed", inset: 0, background: "#E9DDEE", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", visibility: vp ? "visible" : "hidden" }}>
        <div dir="ltr" style={{ width: cw * scale, height: ch * scale, flexShrink: 0, position: "relative" }}>
          <div dir="rtl" style={{
            position: "absolute", left: 0, top: 0,
            width: cw, height: ch, transform: `scale(${scale})`, transformOrigin: "top left", background, color: C.ink,
            isolation: "isolate", overflow: "hidden", display: "flex", flexDirection: direction, gap,
            padding, ...style,
          }}>
            <Blobs width={Math.min(cw, 900)} />
            {children}
          </div>
        </div>
      </div>
    </StageCtx.Provider>
  );
}
