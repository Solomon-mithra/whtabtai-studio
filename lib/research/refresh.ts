import { getAdapter } from "./adapters/index.ts";
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

  await Promise.all(
    sources.map(async (s) => {
      const adapter = getAdapter(s.kind);
      if (!adapter) return;
      try {
        const candidates = await adapter(s);
        total_fetched += candidates.length;
        const insertedCount = await insertItems(s.id, candidates);
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
    breaking_count: 0, // wired up in Task 12
    trending_count: 0, // wired up in Task 13
    errors,
  };
}
