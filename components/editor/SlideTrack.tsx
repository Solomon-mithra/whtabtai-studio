"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useStudio } from "@/lib/store";
import { SlideThumb } from "./SlideThumb";

// Tiny invisible strip right at the bottom edge — reveals the track only when
// the cursor truly touches the bottom of the canvas.
const TRIGGER_ZONE_HEIGHT = 10;
const HIDE_DELAY_MS = 240;

export function SlideTrack() {
  // Avoid SSR/hydration drift from dnd-kit's id counter — render client-only.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <SlideTrackInner />;
}

function SlideTrackInner() {
  const {
    slides,
    activeId,
    setActiveSlide,
    addSlideAfter,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
  } = useStudio();

  const [show, setShow] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = slides.findIndex((s) => s.id === active.id);
    const to = slides.findIndex((s) => s.id === over.id);
    if (from < 0 || to < 0) return;
    reorderSlides(from, to);
  };

  // Cancel pending hide when re-entering, and reveal.
  function reveal() {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShow(true);
  }

  function scheduleHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShow(false);
      hideTimer.current = null;
    }, HIDE_DELAY_MS);
  }

  // Keep the active slide thumbnail in view when it changes externally.
  useEffect(() => {
    if (!show) return;
    const el = trackRef.current?.querySelector<HTMLElement>(
      `[data-slide-id="${activeId}"]`,
    );
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, [activeId, show]);

  return (
    <>
      {/* Reveal zone — 10px invisible strip flush against the canvas bottom.
          The track stays hidden until the cursor truly touches this edge. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-20"
        style={{
          height: TRIGGER_ZONE_HEIGHT,
          pointerEvents: show ? "none" : "auto",
        }}
        onPointerEnter={reveal}
      />

      {/* Hint — tells the user how to summon the track.
          Sits in the bottom-right gutter, fades out once the track is open. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 z-20 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-ink)] transition-opacity duration-200"
        style={{ bottom: 10, opacity: show ? 0 : 0.35 }}
      >
        <span>{slides.length} {slides.length === 1 ? "slide" : "slides"}</span>
        <span aria-hidden>·</span>
        <span>hover edge</span>
        <span aria-hidden className="text-[10px] leading-none">↓</span>
      </div>

      {/* Slide track. Stays in place at the bottom; reveals via opacity + a
          tiny upward nudge — no big slide-up so nothing visually "jumps". */}
      <div
        ref={trackRef}
        onPointerEnter={reveal}
        onPointerLeave={scheduleHide}
        className="absolute inset-x-0 bottom-0 z-30 border-t border-[color:var(--color-rule)] bg-[color:var(--color-ink)] text-[color:var(--color-warm)] shadow-[0_-12px_40px_-16px_rgba(10,9,8,0.5)]"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(6px)",
          transition:
            "opacity 180ms ease, transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          pointerEvents: show ? "auto" : "none",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            Carousel · {slides.length} {slides.length === 1 ? "slide" : "slides"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            drag to reorder
          </span>
        </div>

        <div className="track-scroll flex items-center gap-2 overflow-x-auto overflow-y-hidden px-5 pt-2 pb-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              {slides.map((s, i) => (
                <div key={s.id} data-slide-id={s.id} className="flex-none">
                  <SlideThumb
                    slide={s}
                    index={i}
                    active={s.id === activeId}
                    canDelete={slides.length > 1}
                    onActivate={() => setActiveSlide(s.id)}
                    onDuplicate={() => duplicateSlide(s.id)}
                    onDelete={() => deleteSlide(s.id)}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={() => addSlideAfter()}
            title="Add slide"
            aria-label="Add slide"
            className="flex h-[78px] w-[78px] flex-none flex-col items-center justify-center gap-1 border border-dashed border-[color:var(--color-rule-soft)] text-[color:var(--color-warm-dim)] transition hover:border-[color:var(--color-signal)] hover:text-[color:var(--color-signal)]"
          >
            <Plus size={18} strokeWidth={1.5} />
            <span className="font-mono text-[9px] uppercase tracking-mono">
              Add
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
