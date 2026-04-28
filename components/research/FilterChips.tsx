"use client";
import type { ItemFilter } from "@/lib/db/queries";

const FILTERS: { value: ItemFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "saved", label: "Saved" },
  { value: "trending", label: "Trending" },
  { value: "breaking", label: "Breaking" },
];

export function FilterChips({
  value,
  onChange,
}: {
  value: ItemFilter;
  onChange: (v: ItemFilter) => void;
}) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={
            "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-mono " +
            (value === f.value
              ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
              : "border-[color:var(--color-rule-paper)] text-[color:var(--color-ink)]/70")
          }
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
