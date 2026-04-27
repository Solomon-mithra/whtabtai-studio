import type { SourceKind } from "./types.ts";

const KNOWN_LABS = ["anthropic", "openai", "google", "mistral", "huggingface"];

const RULES = [
  /\bbreak(ing)?\b/i,
  /\bbreaking change\b/i,
  /\bdeprecat/i,
  /\bremoved?\b|\bremoval\b/i,
];

export function scoreBreaking(args: {
  title: string;
  summary: string | null;
  content: string | null;
  sourceKind: SourceKind;
  sourceName: string;
  previousVersion: string | null;
  currentVersion: string | null;
}): number {
  const haystack = [args.title, args.summary, args.content]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  let hits = 0;
  for (const r of RULES) {
    if (r.test(haystack)) hits++;
  }
  if (
    args.sourceKind === "github_releases" &&
    args.previousVersion &&
    args.currentVersion &&
    isMajorBump(args.previousVersion, args.currentVersion)
  ) {
    hits++;
  }
  if (
    args.sourceKind === "rss" &&
    KNOWN_LABS.some((lab) => args.sourceName.toLowerCase().includes(lab)) &&
    /\bprice|\bpricing|\bcost\b/i.test(haystack)
  ) {
    hits++;
  }
  return Math.min(hits, 3);
}

function isMajorBump(prev: string, curr: string): boolean {
  const p = prev.match(/v?(\d+)\./);
  const c = curr.match(/v?(\d+)\./);
  if (!p || !c) return false;
  return parseInt(c[1], 10) > parseInt(p[1], 10);
}
