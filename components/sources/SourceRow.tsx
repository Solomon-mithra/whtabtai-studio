"use client";
import { useEffect, useState, useTransition } from "react";
import type { SourceRow as Row } from "@/lib/db/queries";
import { Switch } from "@/components/ui/switch";
import {
  setEnabledAction,
  deleteSourceAction,
  renameAction,
} from "@/app/sources/actions";

export function SourceRow({ source }: { source: Row }) {
  const [enabled, setEnabled] = useState(source.enabled);
  const [name, setName] = useState(source.name);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  // Re-sync local state when the page revalidates and a fresh prop arrives.
  // Without these, an action failure leaves the UI showing the optimistic
  // value forever, silently disagreeing with the DB.
  useEffect(() => {
    setEnabled(source.enabled);
  }, [source.enabled]);
  useEffect(() => {
    if (!editing) setName(source.name);
  }, [source.name, editing]);

  function commitToggle(v: boolean) {
    const previous = enabled;
    setEnabled(v);
    setError(null);
    start(async () => {
      try {
        await setEnabledAction(source.id, v);
      } catch (e) {
        setEnabled(previous);
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  function commitRename() {
    if (!editing) return;
    setEditing(false);
    const trimmed = name.trim();
    if (!trimmed || trimmed === source.name) {
      setName(source.name);
      return;
    }
    setName(trimmed);
    setError(null);
    start(async () => {
      try {
        await renameAction(source.id, trimmed);
      } catch (e) {
        setName(source.name);
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete source "${source.name}"? This will also delete its items.`)) return;
    setError(null);
    start(async () => {
      try {
        await deleteSourceAction(source.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  return (
    <tr className="border-b border-[color:var(--color-rule-paper)] last:border-b-0">
      <td className="px-4 py-2 font-medium">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setName(source.name);
                setEditing(false);
              }
            }}
            className="w-full rounded border border-[color:var(--color-rule-paper)] bg-transparent px-1 text-sm"
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)} className="cursor-text" title="Double-click to rename">
            {name}
          </span>
        )}
        {error && (
          <div className="mt-1 font-mono text-[10px] text-red-600" title={error}>
            {error.length > 60 ? error.slice(0, 60) + "…" : error}
          </div>
        )}
      </td>
      <td className="px-4 py-2 font-mono text-xs">{source.kind}</td>
      <td className="px-4 py-2 truncate max-w-[420px] text-xs text-[color:var(--color-ink)]/70">
        {source.url}
      </td>
      <td className="px-4 py-2">
        <Switch checked={enabled} onCheckedChange={commitToggle} />
      </td>
      <td className="px-4 py-2 text-xs text-[color:var(--color-ink)]/70">
        {source.last_fetched_at ? new Date(source.last_fetched_at).toLocaleString() : "—"}
      </td>
      <td className="px-4 py-2 font-mono text-xs">{source.item_count}</td>
      <td className="px-4 py-2 text-right">
        <button
          onClick={handleDelete}
          className="font-mono text-[10px] uppercase tracking-mono text-[color:var(--color-warm-dim)] hover:text-red-600"
          title="Delete source"
        >
          delete
        </button>
      </td>
    </tr>
  );
}
