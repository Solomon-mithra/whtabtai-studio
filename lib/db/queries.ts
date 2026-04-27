import { sql } from "./client.ts";
export { sql };
// Query helpers will be added in later tasks.

export type SourceKind = "rss" | "github_releases" | "hn" | "arxiv" | "reddit";

export type SourceRow = {
  id: string;
  kind: SourceKind;
  url: string;
  name: string;
  enabled: boolean;
  last_fetched_at: string | null;
  item_count: number;
};

export async function listSources(): Promise<SourceRow[]> {
  const rows = await sql`
    select s.id, s.kind, s.url, s.name, s.enabled, s.last_fetched_at,
      coalesce((select count(*)::int from items i where i.source_id = s.id), 0) as item_count
    from sources s
    order by s.name asc
  `;
  return rows as SourceRow[];
}

import type { ItemCandidate } from "../research/types.ts";

export async function listEnabledSources(): Promise<SourceRow[]> {
  const rows = await sql`
    select id, kind, url, name, enabled, last_fetched_at,
      0 as item_count
    from sources
    where enabled = true
    order by name asc
  `;
  return rows as SourceRow[];
}

export async function insertItems(
  source_id: string,
  candidates: ItemCandidate[],
): Promise<number> {
  if (candidates.length === 0) return 0;
  let inserted = 0;
  for (const c of candidates) {
    const res = await sql`
      insert into items (source_id, external_id, title, url, summary, content, published_at)
      values (${source_id}, ${c.external_id}, ${c.title}, ${c.url},
              ${c.summary}, ${c.content}, ${c.published_at})
      on conflict (source_id, external_id) do nothing
      returning id
    `;
    inserted += res.length;
  }
  return inserted;
}

export async function markSourceFetched(source_id: string): Promise<void> {
  await sql`update sources set last_fetched_at = now() where id = ${source_id}`;
}
