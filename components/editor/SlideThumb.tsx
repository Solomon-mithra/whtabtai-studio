"use client";

import { Copy, GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ACCENTS } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import type { SlideState } from "@/lib/types";

type Props = {
  slide: SlideState;
  index: number;
  active: boolean;
  canDelete: boolean;
  onActivate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function SlideThumb({
  slide,
  index,
  active,
  canDelete,
  onActivate,
  onDuplicate,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  const tpl = TEMPLATES[slide.template];
  const acc = ACCENTS[slide.accent];

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group relative flex h-[78px] w-[112px] flex-none flex-col border bg-[color:var(--color-ink-2)] transition ${
        active
          ? "border-[color:var(--color-signal)] shadow-[0_0_0_1px_var(--color-signal)]"
          : "border-[color:var(--color-rule-soft)] hover:border-[color:var(--color-warm-dim)]"
      }`}
    >
      <button
        type="button"
        onClick={onActivate}
        className="flex flex-1 flex-col items-start justify-between px-2 pt-1.5 pb-1 text-left"
        aria-pressed={active}
        aria-label={`Slide ${index + 1}`}
      >
        <div className="flex w-full items-center justify-between">
          <span
            className={`font-mono text-[9px] uppercase tracking-mono ${
              active
                ? "text-[color:var(--color-signal)]"
                : "text-[color:var(--color-warm-dim)]"
            }`}
          >
            {String(index + 1).padStart(2, "0")} · {tpl.key}
          </span>
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: acc.value,
              outline:
                slide.accent === "none"
                  ? "1px solid rgba(244,241,234,0.35)"
                  : "none",
              outlineOffset: 1,
            }}
          />
        </div>
        <span
          className="line-clamp-2 font-display text-[11px] italic leading-tight text-[color:var(--color-warm)]"
          style={{ wordBreak: "break-word" }}
        >
          {slide.headline || "Untitled"}
        </span>
      </button>

      {/* Drag handle (visible on hover, top-right) */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        aria-label="Drag to reorder"
        className="absolute right-0.5 top-0.5 flex h-5 w-5 cursor-grab items-center justify-center text-[color:var(--color-warm-dim)] opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical size={12} />
      </button>

      {/* Hover actions: duplicate + delete (bottom-right) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-0.5 px-1 pb-0.5 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        <ThumbAction label="Duplicate" onClick={onDuplicate}>
          <Copy size={11} />
        </ThumbAction>
        <ThumbAction label="Delete" disabled={!canDelete} onClick={onDelete}>
          <Trash2 size={11} />
        </ThumbAction>
      </div>
    </div>
  );
}

function ThumbAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-5 w-5 items-center justify-center border border-[color:var(--color-rule-soft)] bg-[color:var(--color-ink)] transition ${
        disabled
          ? "opacity-30"
          : "text-[color:var(--color-warm-dim)] hover:border-[color:var(--color-signal)] hover:text-[color:var(--color-signal)]"
      }`}
    >
      {children}
    </button>
  );
}
