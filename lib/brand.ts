export const BRAND = {
  name: "What About AI?",
  handle: "@whtabtai",
  tagline: "AI news without the noise",
} as const;

export const COLORS = {
  background: "#FFFFFF",
  foreground: "#000000",
  mutedText: "#555555",
  border: "#EAEAEA",
  cardLight: "#F7F7F7",
  cardDark: "#050505",
  accentBlue: "#2563EB",
  accentGreen: "#22C55E",
  accentRed: "#EF4444",
  accentPurple: "#8B5CF6",
} as const;

export type AccentKey = "none" | "blue" | "green" | "red" | "purple";

export const ACCENTS: Record<
  AccentKey,
  { label: string; value: string; short: string }
> = {
  none: { label: "None", value: COLORS.foreground, short: "B&W" },
  blue: { label: "AI Blue", value: COLORS.accentBlue, short: "AI" },
  green: { label: "Signal Green", value: COLORS.accentGreen, short: "TIP" },
  red: { label: "Alert Red", value: COLORS.accentRed, short: "BIG" },
  purple: { label: "Soft Purple", value: COLORS.accentPurple, short: "EXP" },
};
