"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { StudioSlideOverride, useStudio } from "@/lib/store";
import { SIZES } from "@/lib/sizes";
import { TemplateA } from "@/components/templates/TemplateA";
import { TemplateB } from "@/components/templates/TemplateB";
import { TemplateC } from "@/components/templates/TemplateC";
import { TemplateD } from "@/components/templates/TemplateD";
import { useCanvasRef, useCanvasSetScale } from "./CanvasRefContext";
import { GuideOverlay } from "./GuideOverlay";
import { SlideTrack } from "./SlideTrack";
import type { SlideState } from "@/lib/types";

const SLIDE_GAP = 64;

function renderTemplate(key: SlideState["template"]) {
  switch (key) {
    case "A":
      return <TemplateA />;
    case "B":
      return <TemplateB />;
    case "C":
      return <TemplateC />;
    case "D":
      return <TemplateD />;
  }
}

export function Canvas() {
  const s = useStudio();
  const sz = SIZES[s.size];
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useCanvasRef();
  const setCanvasScale = useCanvasSetScale();
  const [scale, setScale] = useState(0.5);

  // Compute scale so a single slide fits comfortably; multi-slide layouts overflow
  // horizontally and pan via the scroll container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const padding = 96;
      const w = el.clientWidth - padding;
      const h = el.clientHeight - padding;
      const next = Math.min(w / sz.w, h / sz.h, 1);
      const v = next > 0 ? next : 0.5;
      setScale(v);
      setCanvasScale(v);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sz.w, sz.h, setCanvasScale]);

  // Center the active slide whenever it changes (or new slides are added).
  // Use bounding rects so we measure the visible card width (after CSS transforms)
  // and a position relative to the scroll container — not relative to a nested
  // `position: relative` ancestor.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const target = sc.querySelector<HTMLElement>(
      `[data-slide-card="${s.activeId}"]`,
    );
    if (!target) return;
    const sRect = sc.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const targetLeftInScroll = tRect.left - sRect.left + sc.scrollLeft;
    const offset = targetLeftInScroll - (sc.clientWidth - tRect.width) / 2;
    sc.scrollTo({ left: offset, behavior: "smooth" });
  }, [s.activeId, s.slides.length, scale]);

  return (
    <main
      ref={containerRef}
      className="paper-grain paper-vignette relative flex h-full flex-1 items-center justify-center overflow-hidden"
    >
      {/* Insert buttons — top-left = insert before, top-right = insert after. */}
      <CornerInsert
        position="top-left"
        title="Add slide before"
        onClick={() => s.addSlideBefore()}
      />
      <CornerInsert
        position="top-right"
        title="Add slide after"
        onClick={() => s.addSlideAfter()}
      />

      <div
        className="absolute left-1/2 top-6 -translate-x-1/2 z-10 font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-ink)] opacity-60"
      >
        {sz.label} · {sz.hint} · slide {s.activeIndex + 1}/{s.slides.length}
      </div>

      <div
        ref={scrollRef}
        className="paper-scroll relative flex h-full w-full items-center overflow-x-auto overflow-y-hidden"
        style={{
          paddingLeft: "max(96px, calc((100% - " + sz.w * scale + "px) / 2))",
          paddingRight: "max(96px, calc((100% - " + sz.w * scale + "px) / 2))",
          gap: SLIDE_GAP,
        }}
      >
        {s.slides.map((slide) => {
          const isActive = slide.id === s.activeId;
          return (
            <SlideStage
              key={slide.id}
              slide={slide}
              isActive={isActive}
              size={s.size}
              fontSystem={s.fontSystem}
              scale={scale}
              stageRef={isActive ? stageRef : undefined}
              onActivate={() => !isActive && s.setActiveSlide(slide.id)}
            />
          );
        })}
      </div>

      <div
        className="absolute right-6 top-1/2 z-10 -translate-y-1/2 rotate-90 origin-right font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-ink)] opacity-40"
      >
        drag · alt to free · ⌘Z undo
      </div>

      <SlideTrack />
    </main>
  );
}

function SlideStage({
  slide,
  isActive,
  size,
  fontSystem,
  scale,
  stageRef,
  onActivate,
}: {
  slide: SlideState;
  isActive: boolean;
  size: ReturnType<typeof useStudio>["size"];
  fontSystem: ReturnType<typeof useStudio>["fontSystem"];
  scale: number;
  stageRef?: React.RefObject<HTMLDivElement | null>;
  onActivate: () => void;
}) {
  const sz = SIZES[size];

  const stage = (
    <div
      ref={stageRef}
      data-slide-stage={slide.id}
      className="origin-top-left bg-white font-brand"
      style={{
        width: sz.w,
        height: sz.h,
        transform: `scale(${scale})`,
        position: "relative",
      }}
    >
      {renderTemplate(slide.template)}
      <GuideOverlay w={sz.w} h={sz.h} />
    </div>
  );

  // Inactive slides are click-to-activate; active slide is the live editing
  // surface (draggable elements inside). Using a button wrapper would force
  // `text-align: center` onto everything inside.
  const inactiveProps = isActive
    ? {}
    : {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": "Activate slide",
        onClick: onActivate,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate();
          }
        },
      };

  return (
    <div
      data-slide-card={slide.id}
      className={`lift-in relative z-[1] flex-none text-left transition ${
        isActive ? "" : "cursor-pointer"
      }`}
      style={{
        width: sz.w * scale,
        height: sz.h * scale,
        boxShadow: isActive
          ? "0 30px 80px -28px rgba(10, 9, 8, 0.42), 0 8px 24px -10px rgba(10, 9, 8, 0.22), 0 0 0 2px var(--color-signal)"
          : "0 12px 32px -16px rgba(10, 9, 8, 0.25), 0 4px 12px -6px rgba(10, 9, 8, 0.15)",
        opacity: isActive ? 1 : 0.7,
        background: "white",
      }}
      {...inactiveProps}
    >
      <div
        style={{
          pointerEvents: isActive ? "auto" : "none",
          width: "100%",
          height: "100%",
        }}
      >
        {isActive ? (
          stage
        ) : (
          <StudioSlideOverride
            slide={slide}
            size={size}
            fontSystem={fontSystem}
          >
            {stage}
          </StudioSlideOverride>
        )}
      </div>
    </div>
  );
}

function CornerInsert({
  position,
  title,
  onClick,
}: {
  position: "top-left" | "top-right";
  title: string;
  onClick: () => void;
}) {
  const pos = {
    "top-left": "left-6 top-6",
    "top-right": "right-6 top-6",
  }[position];
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`absolute z-30 flex h-9 w-9 items-center justify-center border border-[color:var(--color-ink)]/20 bg-[color:var(--color-paper)] text-[color:var(--color-ink)] transition hover:border-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)] ${pos}`}
    >
      <Plus size={16} strokeWidth={1.5} />
    </button>
  );
}
