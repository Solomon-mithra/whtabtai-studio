export const HALFTONE_STYLES = ["wave", "blob", "scatter", "edge"] as const;
export type HalftoneStyle = (typeof HALFTONE_STYLES)[number];

export type HalftoneState = {
  enabled: boolean;
  style: HalftoneStyle;
  seed: number;
  /** Pixels between dot centers in the canvas grid. Lower = denser grid. */
  cell: number;
  /** 0..1 — threshold below which dots vanish; higher density = more dots. */
  density: number;
  /** Degrees, applied to the whole pattern. */
  rotation: number;
  /** 0..1 alpha multiplier on the SVG layer. */
  opacity: number;
  /** Hex color of the dots. */
  color: string;
};

export const DEFAULT_HALFTONE: HalftoneState = {
  enabled: true,
  style: "wave",
  seed: 1,
  cell: 22,
  density: 0.55,
  rotation: -18,
  opacity: 0.08,
  color: "#000000",
};

/** Stable, low-amplitude pseudo-random based on the seed; not for security. */
function rand(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301.17 + salt * 49297.31) * 43758.5453;
  return x - Math.floor(x);
}

/** Smooth value-noise-ish field built from layered sines. Output ~ [-1, 1]. */
function field(
  x: number,
  y: number,
  seed: number,
  style: HalftoneStyle,
): number {
  const s = seed * 0.6180339887;
  const a =
    Math.sin(x * 5.4 + s * 0.9 + Math.cos(y * 4.1 + s * 1.3) * 1.6);
  const b = Math.cos((x * 3.1 - y * 4.6) * 1.3 + s * 2.1);
  const c = Math.sin((x + y) * 6.1 + s * 3.7);
  const base = (a * 0.55 + b * 0.3 + c * 0.25) / 1.1;

  if (style === "wave") {
    // Curved diagonal band — band center y shifts smoothly with x.
    const bandY = 0.5 + 0.28 * Math.sin(x * 3.2 + s * 1.7);
    const bandWidth = 0.22 + 0.08 * Math.cos(x * 2.4 + s);
    const dist = Math.abs(y - bandY) / bandWidth;
    const fall = Math.max(0, 1 - dist * dist);
    return fall * 1.4 + base * 0.25 - 0.2;
  }
  if (style === "blob") {
    // Two soft blobs whose positions depend on seed.
    const bx1 = 0.32 + rand(seed, 1) * 0.18;
    const by1 = 0.34 + rand(seed, 2) * 0.18;
    const bx2 = 0.62 + rand(seed, 3) * 0.18;
    const by2 = 0.66 + rand(seed, 4) * 0.18;
    const r1 = Math.hypot(x - bx1, y - by1);
    const r2 = Math.hypot(x - bx2, y - by2);
    const blob = Math.max(0, 1 - r1 / 0.42) + Math.max(0, 1 - r2 / 0.42);
    return blob * 0.95 + base * 0.18 - 0.15;
  }
  if (style === "edge") {
    // Heavy on one edge, fading across — angle picked from seed.
    const ang = rand(seed, 7) * Math.PI * 2;
    const u = Math.cos(ang) * (x - 0.5) + Math.sin(ang) * (y - 0.5);
    return -u * 2.2 + base * 0.35;
  }
  // scatter: pure organic field
  return base * 1.2;
}

export type HalftoneDot = { cx: number; cy: number; r: number };

/**
 * Walk a rotated grid across the canvas and emit a dot per cell, with radius
 * driven by the noise field. Points outside the threshold are skipped.
 */
export function generateDots(
  width: number,
  height: number,
  state: HalftoneState,
): HalftoneDot[] {
  const cell = Math.max(6, state.cell);
  const dots: HalftoneDot[] = [];

  // Rotate the grid by sampling in a rotated coordinate frame, but emit
  // un-rotated dot centers (we apply the rotation at the SVG <g> level).
  const cos = Math.cos((state.rotation * Math.PI) / 180);
  const sin = Math.sin((state.rotation * Math.PI) / 180);

  // Oversize the grid so rotation never reveals empty corners.
  const diag = Math.hypot(width, height);
  const cols = Math.ceil(diag / cell) + 2;
  const rows = Math.ceil(diag / cell) + 2;
  const startX = width / 2 - (cols * cell) / 2;
  const startY = height / 2 - (rows * cell) / 2;

  // density: 0 → very sparse, 1 → all dots filled
  // remap so default 0.55 lands near a pleasant midpoint
  const cutoff = 1 - state.density * 1.6; // ~ -0.6 .. 1.0

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = startX + i * cell + cell / 2;
      const cy = startY + j * cell + cell / 2;

      // Sample field in normalized rotated frame so the pattern visually
      // tilts with the rotation control.
      const dx = (cx - width / 2) / Math.max(width, height);
      const dy = (cy - height / 2) / Math.max(width, height);
      const rx = dx * cos + dy * sin + 0.5;
      const ry = -dx * sin + dy * cos + 0.5;

      const n = field(rx, ry, state.seed, state.style);
      const t = (n - cutoff) / Math.max(0.0001, 1 - cutoff);
      if (t <= 0) continue;
      const r = Math.min(1, t) * (cell * 0.5);
      if (r < 0.4) continue;
      // Round to 3 decimals so server-side Node and the browser engine produce
      // identical SVG attributes — IEEE-754 transcendentals (sin/cos) aren't
      // guaranteed to be bit-identical across runtimes, and the smallest drift
      // is enough to break React hydration on large halftone grids.
      dots.push({
        cx: Math.round(cx * 1000) / 1000,
        cy: Math.round(cy * 1000) / 1000,
        r: Math.round(r * 1000) / 1000,
      });
    }
  }
  return dots;
}

/**
 * Reshuffle seed, rotation, density, cell — keeps the current style so the
 * user can lock into a look (wave / blob / etc) and just spin variations.
 */
export function randomizeHalftone(prev: HalftoneState): HalftoneState {
  return {
    ...prev,
    enabled: true,
    seed: Math.floor(Math.random() * 100000) + 1,
    rotation: Math.round((Math.random() * 90 - 45) * 10) / 10,
    density: Math.round((0.4 + Math.random() * 0.35) * 100) / 100,
    cell: Math.round(16 + Math.random() * 18),
  };
}
