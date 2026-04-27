"use client";
import type { ItemListRow } from "@/lib/db/queries";
import { BreakingBadge, TrendingBadge } from "./Badges";

export function ItemList({
  items,
  selectedId,
  onSelect,
}: {
  items: ItemListRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center font-mono text-[11px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
        No items. Try a refresh.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-[color:var(--color-rule-paper)]">
      {items.map((it) => (
        <li
          key={it.id}
          onClick={() => onSelect(it.id)}
          className={
            "cursor-pointer px-4 py-3 hover:bg-[color:var(--color-rule-paper)] " +
            (selectedId === it.id ? "bg-[color:var(--color-rule-paper)]" : "")
          }
        >
          <div className="flex items-center gap-2">
            {it.breaking_score >= 1 && <BreakingBadge />}
            {it.is_trending && <TrendingBadge />}
            <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
              {it.source_name}
            </span>
            <span className="font-mono text-[10px] text-[color:var(--color-warm-dim)]">
              · {new Date(it.fetched_at).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1 text-[14px] leading-snug">{it.title}</div>
        </li>
      ))}
    </ul>
  );
}
