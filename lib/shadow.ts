import { ACCENTS, type AccentKey } from "./brand";

export type ShadowColor = "black" | "white" | "accent";

export type ShadowState = {
  color: ShadowColor;
  blur: number; // 0..100 — soft fall-off radius
  spread: number; // 0..100 — solid halo extent (stacked layers)
  opacity: number; // 0..100 — per-layer alpha
};

export const SHADOW_COLORS: Record<ShadowColor, { label: string; hex: string }> =
  {
    black: { label: "Black", hex: "#050505" },
    white: { label: "White", hex: "#FFFFFF" },
    accent: { label: "Accent", hex: "#2563EB" },
  };

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Builds a stacked text-shadow string.
 *
 * `blur` and `spread` scale proportionally to the text's fontSize so the same
 * settings feel consistent on a 100px headline and a 25px subtext.
 *
 * The "spread" effect is created by stacking shadows at increasing radii.
 * Stacking N rgba layers compounds opacity (1 - (1 - α)^N), which means a
 * generous spread+opacity combo creates a near-solid halo that fully obscures
 * whatever is behind the text — the obscure-the-background look you'd get
 * from a hand-tuned poster shadow.
 */
export function shadowCSS(
  shadow: ShadowState,
  accent: AccentKey,
  fontSize: number,
): string {
  const opacity = shadow.opacity / 100;
  if (opacity <= 0) return "none";
  if (shadow.blur <= 0 && shadow.spread <= 0) return "none";

  const colorHex =
    shadow.color === "accent"
      ? ACCENTS[accent].value
      : SHADOW_COLORS[shadow.color].hex;
  const [r, g, b] = hexToRgb(colorHex);
  const rgba = `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(3)})`;

  // Map slider values (0..100) to canvas-pixel radii proportional to text size.
  const blurPx = (shadow.blur / 100) * fontSize * 1.0;
  const spreadPx = (shadow.spread / 100) * fontSize * 0.6;

  // Layer count grows with spread so the halo fills cleanly.
  const N = Math.max(2, 1 + Math.ceil(spreadPx / 4));
  const layers: string[] = [];
  for (let i = 0; i < N; i++) {
    const ratio = N > 1 ? i / (N - 1) : 0;
    const radius = blurPx + spreadPx * ratio;
    layers.push(`0 0 ${radius.toFixed(1)}px ${rgba}`);
  }
  return layers.join(", ");
}
