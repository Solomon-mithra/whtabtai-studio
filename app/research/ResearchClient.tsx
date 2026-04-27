"use client";
import { useState, useTransition, useEffect } from "react";
import type { ItemFilter, ItemListRow, ItemSort } from "@/lib/db/queries";
import { ItemList } from "@/components/research/ItemList";
import { FilterChips } from "@/components/research/FilterChips";
import { SortMenu } from "@/components/research/SortMenu";
import { fetchItems } from "./actions";

export function ResearchClient({ initialItems }: { initialItems: ItemListRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [sort, setSort] = useState<ItemSort>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => {
    start(async () => {
      const next = await fetchItems(filter, sort);
      setItems(next);
    });
  }, [filter, sort]);

  return (
    <div className="grid h-full grid-cols-[360px_1fr]">
      <aside className="flex h-full flex-col border-r border-[color:var(--color-rule-paper)]">
        <div className="flex flex-col gap-3 border-b border-[color:var(--color-rule-paper)] px-4 py-3">
          <FilterChips value={filter} onChange={setFilter} />
          <SortMenu value={sort} onChange={setSort} />
        </div>
        <div className="flex-1 overflow-auto">
          <ItemList items={items} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </aside>
      <main className="overflow-auto px-8 py-6">
        {selectedId ? (
          <div className="text-[color:var(--color-warm-dim)]">
            Detail pane coming in Task 8.
          </div>
        ) : (
          <div className="text-[color:var(--color-warm-dim)]">
            Select an item.
          </div>
        )}
      </main>
    </div>
  );
}
