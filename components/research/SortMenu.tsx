"use client";
import type { ItemSort } from "@/lib/db/queries";

export function SortMenu({
  value,
  onChange,
}: {
  value: ItemSort;
  onChange: (v: ItemSort) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ItemSort)}
      className="rounded border border-[color:var(--color-rule-paper)] bg-transparent px-2 py-1 font-mono text-[10px] uppercase tracking-mono"
    >
      <option value="newest">Newest</option>
      <option value="trending">Trending first</option>
      <option value="breaking">Breaking first</option>
    </select>
  );
}
