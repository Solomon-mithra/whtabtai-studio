"use client";

import { Undo2, Redo2, LayoutGrid } from "lucide-react";
import { ACCENTS } from "@/lib/brand";
import { useStudio } from "@/lib/store";
import { SIZES } from "@/lib/sizes";
import { TEMPLATES } from "@/lib/templates";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  const { template, size, accent, category, undo, redo, canUndo, canRedo, resetLayout } =
    useStudio();
  const sz = SIZES[size];
  const tpl = TEMPLATES[template];
  const acc = ACCENTS[accent];

  return (
    <header className="relative z-20 flex h-14 flex-none items-center justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-ink)] px-4 text-[color:var(--color-warm)]">
      <div className="flex items-center gap-3">
        <SidebarTrigger
          aria-label="Toggle navigation"
          title="Toggle navigation · ⌘B"
          className="text-[color:var(--color-warm)] hover:bg-[color:var(--color-rule-soft)] hover:text-[color:var(--color-signal)]"
        />
        <span className="h-4 w-px bg-[color:var(--color-rule-soft)]" />
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            What About AI
          </span>
          <span className="text-[color:var(--color-warm-dim)]">·</span>
          <span className="font-display text-[22px] uppercase leading-none">
            Studio
          </span>
          <span className="ml-3 hidden font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)] sm:inline">
            v0.1 · internal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <Stat label="Template" value={`${tpl.key} · ${tpl.label}`} />
        <Divider />
        <Stat label="Format" value={`${sz.short} · ${sz.hint}`} />
        <Divider />
        <Stat label="Category" value={category} />
        <Divider />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            Accent
          </span>
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: acc.value,
              outline:
                accent === "none"
                  ? "1px solid rgba(244,241,234,0.35)"
                  : "none",
              outlineOffset: 1,
            }}
          />
          <span className="font-mono text-[11px] text-[color:var(--color-warm)]">
            {acc.short}
          </span>
        </div>
        <Divider />
        <div className="flex items-center gap-1">
          <IconButton
            label="Undo"
            shortcut="⌘Z"
            disabled={!canUndo}
            onClick={undo}
          >
            <Undo2 size={15} />
          </IconButton>
          <IconButton
            label="Redo"
            shortcut="⇧⌘Z"
            disabled={!canRedo}
            onClick={redo}
          >
            <Redo2 size={15} />
          </IconButton>
          <IconButton label="Reset positions" onClick={resetLayout}>
            <LayoutGrid size={14} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden md:flex items-baseline gap-2">
      <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        {label}
      </span>
      <span className="font-mono text-[11px] text-[color:var(--color-warm)]">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span className="hidden md:inline h-3 w-px bg-[color:var(--color-rule-soft)]" />
  );
}

function IconButton({
  label,
  shortcut,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} · ${shortcut}` : label}
      aria-label={label}
      className={`group flex h-8 w-8 items-center justify-center border border-transparent transition ${
        disabled
          ? "text-[color:var(--color-warm-dim)] opacity-40"
          : "text-[color:var(--color-warm)] hover:border-[color:var(--color-rule-soft)] hover:text-[color:var(--color-signal)]"
      }`}
    >
      {children}
    </button>
  );
}
