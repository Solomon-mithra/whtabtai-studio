"use client";

import { useMemo } from "react";
import { generateDots, type HalftoneState } from "@/lib/halftone";

export function HalftoneBg({
  width,
  height,
  state,
  defaultColor,
}: {
  width: number;
  height: number;
  state: HalftoneState;
  /** Color used when state.color is empty — lets dark templates default to white. */
  defaultColor?: string;
}) {
  const dots = useMemo(
    () => (state.enabled ? generateDots(width, height, state) : []),
    [width, height, state],
  );

  if (!state.enabled || dots.length === 0) return null;

  const color = state.color || defaultColor || "#000000";

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: state.opacity,
        zIndex: -1,
      }}
    >
      <g>
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={color} />
        ))}
      </g>
    </svg>
  );
}
