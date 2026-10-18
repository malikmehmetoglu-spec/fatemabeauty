import { ICONS, type IconName } from "./icons";
import { C } from "@/lib/tokens";

type Props = {
  name: IconName | (string & {});
  color?: string;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
};

/** Outline icon. `name` is a key of ICONS, or a raw SVG path string. */
export function Icon({ name, color = C.accentMid, size = 19, stroke = 1.8, style }: Props) {
  const d = (ICONS as Record<string, string>)[name] ?? name;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, ...style }}>
      <path d={d} />
    </svg>
  );
}
