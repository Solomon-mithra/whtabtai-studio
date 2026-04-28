export function BreakingBadge() {
  return (
    <span className="inline-flex items-center rounded bg-[color:var(--color-signal)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-paper)]">
      Breaking
    </span>
  );
}

export function TrendingBadge() {
  return (
    <span className="inline-flex items-center rounded border border-[color:var(--color-ink)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-mono text-[color:var(--color-ink)]">
      Trending
    </span>
  );
}
