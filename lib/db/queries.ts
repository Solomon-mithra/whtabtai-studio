import { sql } from "./client";
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
