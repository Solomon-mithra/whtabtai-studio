"use client";
import { useState, useTransition, useEffect, useRef } from "react";
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

const LEFT_WIDTH_KEY = "whtabtai-research:leftWidth";
const LEFT_WIDTH_DEFAULT = 360;
const LEFT_WIDTH_MIN = 240;
const LEFT_WIDTH_MAX = 720;

export function ResearchClient({ initialItems }: { initialItems: ItemListRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<ItemFilter>("all");
  const [sort, setSort] = useState<ItemSort>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [leftWidth, setLeftWidth] = useState(LEFT_WIDTH_DEFAULT);
  const widthRef = useRef(LEFT_WIDTH_DEFAULT);
  const [, start] = useTransition();
  const router = useRouter();

  // Hydrate the saved width once on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEFT_WIDTH_KEY);
      if (!stored) return;
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n) && n >= LEFT_WIDTH_MIN && n <= LEFT_WIDTH_MAX) {
        widthRef.current = n;
        setLeftWidth(n);
      }
    } catch {}
  }, []);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(LEFT_WIDTH_MIN, Math.min(LEFT_WIDTH_MAX, ev.clientX));
      widthRef.current = w;
      setLeftWidth(w);
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(LEFT_WIDTH_KEY, String(widthRef.current));
      } catch {}
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

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
    <div className="flex h-full overflow-hidden">
      <aside
        className="flex h-full flex-shrink-0 flex-col border-r border-[color:var(--color-rule-paper)]"
        style={{ width: leftWidth }}
      >
        <div className="flex flex-col gap-3 border-b border-[color:var(--color-rule-paper)] px-4 py-3">
          <FilterChips value={filter} onChange={setFilter} />
          <SortMenu value={sort} onChange={setSort} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ItemList items={items} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </aside>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={startResize}
        onDoubleClick={() => {
          widthRef.current = LEFT_WIDTH_DEFAULT;
          setLeftWidth(LEFT_WIDTH_DEFAULT);
          try {
            localStorage.setItem(LEFT_WIDTH_KEY, String(LEFT_WIDTH_DEFAULT));
          } catch {}
        }}
        title="Drag to resize · double-click to reset"
        className="group h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-[color:var(--color-signal)]/40 active:bg-[color:var(--color-signal)]"
      />
      <main className="h-full min-w-0 flex-1 overflow-y-auto px-8 py-6">
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
