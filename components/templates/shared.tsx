"use client";

import {
  useRef,
  type PointerEvent,
} from "react";
import { ACCENTS } from "@/lib/brand";
import { useStudio } from "@/lib/store";
import { SIZES } from "@/lib/sizes";
import { FONT_SYSTEMS } from "@/lib/typography";
import {
  resolveTextColors,
  type ResolvedColors,
} from "@/lib/textColor";
import { useCanvasScale } from "@/components/editor/CanvasRefContext";
import type { ImagePanId } from "@/lib/types";

export function useTemplateContext() {
  const s = useStudio();
  const sz = SIZES[s.size];
  const acc = ACCENTS[s.accent];
  const fs = FONT_SYSTEMS[s.fontSystem];
  return { ...s, sz, acc, fs };
}

export function useTextColors(defaults: ResolvedColors): ResolvedColors {
  const s = useStudio();
  return resolveTextColors(s.textColor, s.accent, defaults);
}

/**
 * Subtle vertical gradient for headline text. Light colors fade to a darker
 * shade at the bottom; dark colors lift slightly at the top. The text fill
 * becomes transparent so the gradient shows through; text-shadow still renders
 * based on the glyph outlines.
 */
export function headlineGradientStyle(color: string): React.CSSProperties {
  const lightText = isLightColor(color);
  const top = lightText
    ? color
    : `color-mix(in srgb, ${color} 78%, #ffffff 22%)`;
  const bottom = lightText
    ? `color-mix(in srgb, ${color} 78%, #000000 22%)`
    : color;
  return {
    background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    WebkitTextFillColor: "transparent",
  };
}

function isLightColor(color: string): boolean {
  const trimmed = color.trim();
  let r = 0;
  let g = 0;
  let b = 0;
  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const h = hexMatch[1];
    const expanded =
      h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(expanded, 16);
    r = (n >> 16) & 255;
    g = (n >> 8) & 255;
    b = n & 255;
  } else {
    const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!rgbMatch) return false;
    r = parseInt(rgbMatch[1], 10);
    g = parseInt(rgbMatch[2], 10);
    b = parseInt(rgbMatch[3], 10);
  }
  // Perceptual luminance approximation.
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55;
}

/**
 * Wordmark used in templates. The logo glyph has been retired —
 * the brand wordmark + handle alone is the editorial mark.
 */
export function LogoBlock({
  fontPx,
  invert = false,
}: {
  size?: number; // kept for API compatibility, no longer used
  fontPx: { name: number; handle: number };
  invert?: boolean;
}) {
  const fg = invert ? "#FFFFFF" : "#000000";
  const handleColor = invert ? "#C8C8C8" : "#888888";
  return (
    <div
      style={{
        lineHeight: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: fontPx.name,
          letterSpacing: -0.4,
          color: fg,
          fontFamily: "var(--font-inter)",
        }}
      >
        What About AI?
      </span>
      <span
        style={{
          fontSize: fontPx.handle,
          color: handleColor,
          fontFamily: "var(--font-inter)",
        }}
      >
        @whtabtai
      </span>
    </div>
  );
}

export function CategoryBadge({
  fontPx,
  invert = false,
}: {
  fontPx: number;
  invert?: boolean;
}) {
  const { category } = useStudio();
  const { fs } = useTemplateContext();
  const fg = invert ? "#fff" : "#000";
  return (
    <span
      style={{
        display: "inline-block",
        padding: `${fontPx * 0.45}px ${fontPx * 0.85}px`,
        border: `1.5px solid ${fg}`,
        borderRadius: 9999,
        fontSize: fontPx,
        fontWeight: fs.badge.weight,
        letterSpacing: `${fs.badge.tracking}em`,
        color: fg,
        fontFamily: fs.badge.var,
        textTransform: "uppercase",
      }}
    >
      {category}
    </span>
  );
}

export function ArrowGlyph({
  size = 56,
  color = "#000",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28" cy="28" r="27" stroke={color} strokeWidth="2" />
      <path
        d="M20 28h16M28 20l8 8-8 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PAN_THRESHOLD = 2;

export type ImagePanBounds = { maxX: number; maxY: number };

/** Compute the maximum |pan| allowed so a cover-fit image always covers its box. */
export function computePanBounds(
  boxW: number,
  boxH: number,
  naturalW: number,
  naturalH: number,
): ImagePanBounds {
  if (
    !Number.isFinite(boxW) ||
    !Number.isFinite(boxH) ||
    !Number.isFinite(naturalW) ||
    !Number.isFinite(naturalH) ||
    boxW <= 0 ||
    boxH <= 0 ||
    naturalW <= 0 ||
    naturalH <= 0
  ) {
    return { maxX: 0, maxY: 0 };
  }
  const imageAR = naturalW / naturalH;
  const boxAR = boxW / boxH;
  let renderedW: number;
  let renderedH: number;
  if (imageAR > boxAR) {
    renderedH = boxH;
    renderedW = boxH * imageAR;
  } else {
    renderedW = boxW;
    renderedH = boxW / imageAR;
  }
  return {
    maxX: Math.max(0, (renderedW - boxW) / 2),
    maxY: Math.max(0, (renderedH - boxH) / 2),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Drag handlers + clamped pan offset for an image.
 * Pan stays inside the box — at max pan, the corresponding image edge
 * sits flush with the box edge (Figma-mask style).
 */
export function useImagePan(id: ImagePanId, bounds: ImagePanBounds | null) {
  const { imagePan, setImagePan, beginDrag, endDrag } = useStudio();
  const scale = useCanvasScale();
  const raw = imagePan[id] ?? { x: 0, y: 0 };
  const pan = bounds
    ? {
        x: clamp(raw.x, -bounds.maxX, bounds.maxX),
        y: clamp(raw.y, -bounds.maxY, bounds.maxY),
      }
    : raw;
  const start = useRef<{
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = {
      x: e.clientX,
      y: e.clientY,
      baseX: pan.x,
      baseY: pan.y,
      moved: false,
    };
    beginDrag();
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const ddx = e.clientX - s.x;
    const ddy = e.clientY - s.y;
    if (!s.moved && Math.hypot(ddx, ddy) < PAN_THRESHOLD) return;
    s.moved = true;
    let nx = s.baseX + ddx / scale;
    let ny = s.baseY + ddy / scale;
    if (bounds) {
      nx = clamp(nx, -bounds.maxX, bounds.maxX);
      ny = clamp(ny, -bounds.maxY, bounds.maxY);
    }
    setImagePan(id, { x: nx, y: ny });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    endDrag(s.moved);
    start.current = null;
  }

  return { pan, onPointerDown, onPointerMove, onPointerUp };
}
