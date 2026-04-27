"use client";
import { useState, useTransition, useEffect } from "react";
import type {
  ItemDetail,
  ItemFilter,
  ItemListRow,
  ItemSort,
  ItemStatus,
} from "@/lib/db/queries";
import { ItemList } from "@/components/research/ItemList";
import { FilterChips } from "@/components/research/FilterChips";
import { SortMenu } from "@/components/research/SortMenu";
import { ItemDetailView } from "@/components/research/ItemDetail";
import { fetchItems, fetchItemDetail, updateNotes, updateStatus } from "./actions";
import { useRouter } from "next/navigation";

export function ResearchClient({ initialItems }: { initialItems: ItemListRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [sort, setSort] = useState<ItemSort>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [, start] = useTransition();
  const router = useRouter();

  // Refetch the list when filter/sort change. Guard against out-of-order
  // responses: if the user toggles filters faster than the network resolves,
  // ignore stale results so we never overwrite a fresh list with a late one.
  useEffect(() => {
    let ignored = false;
    start(async () => {
      const next = await fetchItems(filter, sort);
      if (!ignored) setItems(next);
    });
    return () => {
      ignored = true;
    };
  }, [filter, sort]);

  // Same race guard for the detail fetch.
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let ignored = false;
    void fetchItemDetail(selectedId).then((d) => {
      if (!ignored) setDetail(d);
    });
    return () => {
      ignored = true;
    };
  }, [selectedId]);

  async function handleStatus(s: ItemStatus) {
    if (!detail) return;
    await updateStatus(detail.id, s);
    setDetail({ ...detail, status: s });
  }

  function handleSendToStudio() {
    if (!detail) return;
    router.push(`/studio?from=research&itemId=${detail.id}`);
  }

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
        {detail ? (
          <ItemDetailView
            item={detail}
            onStatus={handleStatus}
            onNotes={(notes) => updateNotes(detail.id, notes)}
            onSendToStudio={handleSendToStudio}
          />
        ) : (
          <div className="text-[color:var(--color-warm-dim)]">Select an item.</div>
        )}
      </main>
    </div>
  );
}
