"use client";
import { useState, useTransition } from "react";
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
  const [, start] = useTransition();

  function commitToggle(v: boolean) {
    setEnabled(v);
    start(() => setEnabledAction(source.id, v));
  }

  function commitRename() {
    setEditing(false);
    if (name.trim() && name !== source.name) {
      start(() => renameAction(source.id, name.trim()));
    } else {
      setName(source.name);
    }
  }

  function handleDelete() {
    if (!confirm(`Delete source "${source.name}"? This will also delete its items.`)) return;
    start(() => deleteSourceAction(source.id));
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
              if (e.key === "Escape") { setName(source.name); setEditing(false); }
            }}
            className="w-full rounded border border-[color:var(--color-rule-paper)] bg-transparent px-1 text-sm"
          />
        ) : (
          <span onDoubleClick={() => setEditing(true)} className="cursor-text" title="Double-click to rename">
            {name}
          </span>
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
