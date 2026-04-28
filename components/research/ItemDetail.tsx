"use client";
import { useEffect, useRef, useState } from "react";
import type { ItemDetail, ItemStatus } from "@/lib/db/queries";
import { BreakingBadge, TrendingBadge } from "./Badges";

const STATUSES: ItemStatus[] = ["new", "saved", "skipped", "posted"];

export function ItemDetailView({
  item,
  onStatus,
  onNotes,
  onSendToStudio,
}: {
  item: ItemDetail;
  onStatus: (s: ItemStatus) => void;
  onNotes: (notes: string) => Promise<void>;
  onSendToStudio: () => void;
}) {
  const [notes, setNotes] = useState(item.notes);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync the textarea when the user picks a different item, and cancel any
  // pending debounced save so it can't fire after the item changed (which
  // would silently drop the prior item's most-recent edit).
  useEffect(() => {
    setNotes(item.notes);
    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
        debounce.current = null;
      }
    };
  }, [item.id, item.notes]);

  function handleNotesChange(v: string) {
    setNotes(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      void onNotes(v);
    }, 500);
  }

  return (
    <article className="flex flex-col gap-4 pb-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {item.breaking_score >= 1 && <BreakingBadge />}
          {item.is_trending && <TrendingBadge />}
          <span className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
            {item.source_name} · {item.source_kind}
          </span>
        </div>
        <h1 className="font-display text-[40px] uppercase leading-tight">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[color:var(--color-rule-paper)] underline-offset-4 hover:decoration-[color:var(--color-signal)]"
          >
            {item.title} <span className="font-mono text-[14px]">↗</span>
          </a>
        </h1>
        <div className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[color:var(--color-signal)]"
            title="Open original in new tab"
          >
            {item.url}
          </a>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
          {item.published_at ? new Date(item.published_at).toLocaleString() : "no pub date"}
          {" · fetched "}
          {new Date(item.fetched_at).toLocaleString()}
        </div>
      </header>

      {item.summary && (
        <p className="text-[15px] leading-relaxed text-[color:var(--color-ink)]/80 whitespace-pre-wrap">
          {item.summary}
        </p>
      )}

      {item.content && item.content !== item.summary && (
        // content is plain text (HTML stripped at adapter time via stripHtml).
        // Render as a React text child so React auto-escapes — never raw HTML.
        <div className="text-[14px] leading-relaxed text-[color:var(--color-ink)]/80 whitespace-pre-wrap">
          {item.content}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)]">
          Notes / draft angle
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={6}
          className="w-full rounded border border-[color:var(--color-rule-paper)] bg-transparent p-3 text-[14px]"
          placeholder="What's the @whtabtai angle on this?"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => onStatus(s)}
              className={
                "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-mono " +
                (item.status === s
                  ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                  : "border-[color:var(--color-rule-paper)] text-[color:var(--color-ink)]/70")
              }
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={onSendToStudio}
          className="ml-auto rounded bg-[color:var(--color-signal)] px-4 py-2 font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-paper)]"
        >
          Send to Studio
        </button>
      </div>
    </article>
  );
}
