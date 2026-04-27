"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useStudio } from "@/lib/store";
import {
  useCanvasRef,
  useCanvasScale,
} from "@/components/editor/CanvasRefContext";
import { useGuides } from "@/components/editor/GuideContext";
import { rectFromElement, snapDelta, type Rect } from "@/lib/snap";
import { SIZES } from "@/lib/sizes";
import type { ElementId } from "@/lib/types";

const MOVE_THRESHOLD = 2;

export function Draggable({
  id,
  children,
  style,
  className,
  block = false,
}: {
  id: ElementId;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  block?: boolean;
}) {
  const { offsets, setOffset, beginDrag, endDrag, size } = useStudio();
  const sz = SIZES[size];
  const offset = offsets[id] ?? { x: 0, y: 0 };
  const scale = useCanvasScale();
  const canvasRef = useCanvasRef();
  const { setGuides } = useGuides();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const start = useRef<{
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    moved: boolean;
    initialRect: Rect | null;
  } | null>(null);
  const [active, setActive] = useState(false);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    let initialRect: Rect | null = null;
    const el = wrapperRef.current;
    const canvasEl = canvasRef.current;
    if (el && canvasEl && scale > 0) {
      initialRect = rectFromElement(el, canvasEl, scale);
    }

    start.current = {
      x: e.clientX,
      y: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
      moved: false,
      initialRect,
    };
    setActive(true);
    beginDrag();
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const ddx = e.clientX - s.x;
    const ddy = e.clientY - s.y;
    if (!s.moved && Math.hypot(ddx, ddy) < MOVE_THRESHOLD) return;
    s.moved = true;
    const rawDeltaX = ddx / scale;
    const rawDeltaY = ddy / scale;

    if (s.initialRect && !e.altKey) {
      const { dx, dy, guides } = snapDelta(
        s.initialRect,
        rawDeltaX,
        rawDeltaY,
        sz.w,
        sz.h,
      );
      setOffset(id, { x: s.baseX + dx, y: s.baseY + dy });
      setGuides(guides);
    } else {
      // Alt held — bypass snap (free drag)
      setOffset(id, { x: s.baseX + rawDeltaX, y: s.baseY + rawDeltaY });
      setGuides([]);
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setActive(false);
    setGuides([]);
    endDrag(s.moved);
    start.current = null;
  }

  return (
    <div
      ref={wrapperRef}
      data-draggable={id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`drag-handle ${active ? "drag-active" : ""} ${className ?? ""}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        cursor: active ? "grabbing" : "grab",
        touchAction: "none",
        position: "relative",
        display: block ? "block" : "inline-block",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
