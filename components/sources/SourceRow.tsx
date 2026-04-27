import type { SourceRow as Row } from "@/lib/db/queries";

export function SourceRow({ source }: { source: Row }) {
  return (
    <tr className="border-b border-[color:var(--color-rule-paper)] last:border-b-0">
      <td className="px-4 py-2 font-medium">{source.name}</td>
      <td className="px-4 py-2 font-mono text-xs">{source.kind}</td>
      <td className="px-4 py-2 truncate max-w-[420px] text-xs text-[color:var(--color-ink)]/70">
        {source.url}
      </td>
      <td className="px-4 py-2">
        <span className={source.enabled ? "text-green-600" : "text-[color:var(--color-warm-dim)]"}>
          {source.enabled ? "on" : "off"}
        </span>
      </td>
      <td className="px-4 py-2 text-xs text-[color:var(--color-ink)]/70">
        {source.last_fetched_at ? new Date(source.last_fetched_at).toLocaleString() : "—"}
      </td>
      <td className="px-4 py-2 font-mono text-xs">{source.item_count}</td>
    </tr>
  );
}
