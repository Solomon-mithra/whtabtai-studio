"use client";

import { useGuides } from "./GuideContext";

export function GuideOverlay({ w, h }: { w: number; h: number }) {
  const { guides } = useGuides();
  if (guides.length === 0) return null;

  return (
    <div
      className="studio-only pointer-events-none absolute inset-0 z-30"
      style={{ width: w, height: h }}
      aria-hidden
    >
      {guides.map((g, i) => {
        const isVertical = g.axis === "x";
        const isCenter = g.kind === "center";
        const lineColor = isCenter
          ? "rgba(255, 74, 28, 0.92)"
          : "rgba(255, 74, 28, 0.62)";
        const glow = isCenter
          ? "0 0 0 1px rgba(255, 74, 28, 0.18)"
          : "0 0 0 1px rgba(255, 74, 28, 0.10)";
        const lineWidth = 2; // canvas px so it's crisp post-scale

        return (
          <div
            key={`${g.axis}-${g.coord}-${i}`}
            style={{
              position: "absolute",
              ...(isVertical
                ? {
                    left: g.coord - lineWidth / 2,
                    top: 0,
                    bottom: 0,
                    width: lineWidth,
                  }
                : {
                    top: g.coord - lineWidth / 2,
                    left: 0,
                    right: 0,
                    height: lineWidth,
                  }),
              background: lineColor,
              boxShadow: glow,
            }}
          />
        );
      })}
    </div>
  );
}
