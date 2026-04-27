"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { refreshAll } from "./actions";
import type { RefreshSummary } from "@/lib/research/types";

export function SourcesToolbar() {
  const [pending, start] = useTransition();
  const [summary, setSummary] = useState<RefreshSummary | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        disabled={pending}
        onClick={() => {
          start(async () => {
            const s = await refreshAll();
            setSummary(s);
          });
        }}
      >
        {pending ? "Refreshing…" : "Refresh all"}
      </Button>
      {summary && (
        <span className="font-mono text-[11px] text-[color:var(--color-ink)]/70">
          fetched {summary.total_fetched} · new {summary.new_items} · errors {summary.errors.length}
        </span>
      )}
    </div>
  );
}
