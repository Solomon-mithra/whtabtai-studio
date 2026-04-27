import { getAdapter } from "./adapters/index.ts";
import { scoreBreaking } from "./breakingScore.ts";
import type { AdapterError, RefreshSummary } from "./types.ts";
import {
  insertItems,
  listEnabledSources,
  markSourceFetched,
} from "../db/queries.ts";

export async function runRefresh(): Promise<RefreshSummary> {
  const sources = await listEnabledSources();
  const errors: AdapterError[] = [];
  let total_fetched = 0;
  let new_items = 0;
  let breaking_count = 0;

  await Promise.all(
    sources.map(async (s) => {
      const adapter = getAdapter(s.kind);
      if (!adapter) return;
      try {
        const candidates = await adapter(s);
        const scores = candidates.map((c, i) => {
          // For github_releases, walk pairs newest-first: each item's
          // "previous version" is the next item's tag. The github adapter
          // formats title as `${repoName} ${tag_name}`.
          let previousVersion: string | null = null;
          let currentVersion: string | null = null;
          if (s.kind === "github_releases") {
            const parts = c.title.split(" ");
            currentVersion = parts.length > 1 ? parts[parts.length - 1] : null;
            const next = candidates[i + 1];
            if (next) {
              const nextParts = next.title.split(" ");
              previousVersion =
                nextParts.length > 1 ? nextParts[nextParts.length - 1] : null;
            }
          }
          return scoreBreaking({
            title: c.title,
            summary: c.summary,
            content: c.content,
            sourceKind: s.kind,
            sourceName: s.name,
            previousVersion,
            currentVersion,
          });
        });
        total_fetched += candidates.length;
        breaking_count += scores.filter((sc) => sc >= 1).length;
        const insertedCount = await insertItems(s.id, candidates, scores);
        new_items += insertedCount;
        await markSourceFetched(s.id);
      } catch (err) {
        errors.push({
          source_id: s.id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  return {
    total_fetched,
    new_items,
    breaking_count,
    trending_count: 0, // wired up in Task 13
    errors,
  };
}
