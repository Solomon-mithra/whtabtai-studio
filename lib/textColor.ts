import { ACCENTS, type AccentKey } from "./brand";

export type TextColorMode =
  | "default"
  | "black"
  | "white"
  | "accent"
  | "custom";

export type TextColorState = {
  mode: TextColorMode;
  custom: string; // hex, e.g. "#FF4A1C"
};

export const TEXT_COLOR_MODES: Record<
  TextColorMode,
  { label: string; sample: string }
> = {
  default: { label: "Default", sample: "auto" },
  black: { label: "Ink", sample: "#000000" },
  white: { label: "Paper", sample: "#FFFFFF" },
  accent: { label: "Accent", sample: "accent" },
  custom: { label: "Custom", sample: "custom" },
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const expanded =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(expanded || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, opacity: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export type ResolvedColors = {
  headline: string;
  subtext: string;
  source: string;
  stripe: string;
};

export function resolveTextColors(
  state: TextColorState,
  accent: AccentKey,
  defaults: ResolvedColors,
): ResolvedColors {
  switch (state.mode) {
    case "default":
      return defaults;
    case "black":
      return {
        headline: "#000000",
        subtext: "#222222",
        source: "#555555",
        stripe: "#000000",
      };
    case "white":
      return {
        headline: "#FFFFFF",
        subtext: "#E5E5E5",
        source: "#9c9c9c",
        stripe: "#FFFFFF",
      };
    case "accent": {
      const c = ACCENTS[accent].value;
      return {
        headline: c,
        subtext: rgba(c, 0.78),
        source: rgba(c, 0.5),
        stripe: c,
      };
    }
    case "custom": {
      const c = state.custom || "#000000";
      return {
        headline: c,
        subtext: rgba(c, 0.7),
        source: rgba(c, 0.45),
        stripe: c,
      };
    }
  }
}
