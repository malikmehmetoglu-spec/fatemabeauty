"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { BG_WIDE, C } from "@/lib/tokens";
import { Blobs } from "./PhoneScreen";

/**
 * Fixed-size canvas scaled to fit the device: used by the reception tablet (1194×834) and the waiting-room TV (1920×1080),
 * which are dedicated full-screen devices. Inside, lay out exactly as in the design.
 */
export function Stage({ width, height, children, background = BG_WIDE, padding, direction = "column", gap = 18, style }: {
  width: number; height: number; children: ReactNode; background?: string; padding?: string;
  direction?: "row" | "column"; gap?: number; style?: CSSProperties;
}) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width, height]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#E9DDEE", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div dir="ltr" style={{ width: width * scale, height: height * scale, flexShrink: 0, position: "relative" }}>
        <div dir="rtl" style={{
          position: "absolute", left: 0, top: 0,
          width, height, transform: `scale(${scale})`, transformOrigin: "top left", background, color: C.ink,
          isolation: "isolate", overflow: "hidden", display: "flex", flexDirection: direction, gap,
          padding, ...style,
        }}>
          <Blobs width={Math.min(width, 900)} />
          {children}
        </div>
      </div>
    </div>
  );
}
