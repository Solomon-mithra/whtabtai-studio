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
  scores: number[],
): Promise<number> {
  if (candidates.length === 0) return 0;
  if (scores.length !== candidates.length) {
    throw new Error("scores length must match candidates length");
  }
  let inserted = 0;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const score = scores[i];
    const res = await sql`
      insert into items (source_id, external_id, title, url, summary, content, published_at, breaking_score)
      values (${source_id}, ${c.external_id}, ${c.title}, ${c.url},
              ${c.summary}, ${c.content}, ${c.published_at}, ${score})
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

export type ItemStatus = "new" | "saved" | "skipped" | "posted";

export type ItemListRow = {
  id: string;
  source_id: string;
  source_name: string;
  source_kind: SourceKind;
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
  fetched_at: string;
  status: ItemStatus;
  breaking_score: number;
  is_trending: boolean;
};

export type ItemFilter = "all" | "new" | "saved" | "trending" | "breaking";
export type ItemSort = "newest" | "trending" | "breaking";

export async function listItems(
  filter: ItemFilter,
  sort: ItemSort,
  source_id: string | null,
): Promise<ItemListRow[]> {
  const conditions: string[] = ["1=1"];
  const params: unknown[] = [];

  if (filter === "new") conditions.push(`i.status = 'new'`);
  else if (filter === "saved") conditions.push(`i.status = 'saved'`);
  else if (filter === "breaking") conditions.push(`i.breaking_score >= 1`);
  else if (filter === "trending")
    conditions.push(`exists (select 1 from clusters c where i.id = any(c.item_ids))`);

  if (source_id) {
    params.push(source_id);
    conditions.push(`i.source_id = $${params.length}::uuid`);
  }

  const orderBy =
    sort === "trending"
      ? "(case when exists (select 1 from clusters c where i.id = any(c.item_ids)) then 0 else 1 end), i.fetched_at desc"
      : sort === "breaking"
        ? "i.breaking_score desc, i.fetched_at desc"
        : "i.fetched_at desc";

  const text = `
    select i.id, i.source_id, s.name as source_name, s.kind as source_kind,
      i.title, i.url, i.summary, i.published_at, i.fetched_at,
      i.status, i.breaking_score,
      exists (select 1 from clusters c where i.id = any(c.item_ids)) as is_trending
    from items i
    join sources s on s.id = i.source_id
    where ${conditions.join(" and ")}
    order by ${orderBy}
    limit 200
  `;
  const rows = await sql.query(text, params);
  return rows as ItemListRow[];
}

export type ItemDetail = ItemListRow & {
  content: string | null;
  notes: string;
  source_url: string;
};

export async function getItemDetail(id: string): Promise<ItemDetail | null> {
  const rows = await sql`
    select i.id, i.source_id, s.name as source_name, s.kind as source_kind,
      i.title, i.url, i.summary, i.content, i.published_at, i.fetched_at,
      i.status, i.notes, i.breaking_score,
      exists (select 1 from clusters c where i.id = any(c.item_ids)) as is_trending,
      s.url as source_url
    from items i
    join sources s on s.id = i.source_id
    where i.id = ${id}::uuid
  `;
  return (rows[0] as ItemDetail) ?? null;
}

export async function setItemStatus(id: string, status: ItemStatus) {
  await sql`update items set status = ${status} where id = ${id}::uuid`;
}

export async function setItemNotes(id: string, notes: string) {
  await sql`update items set notes = ${notes} where id = ${id}::uuid`;
}

// Drop items older than the rolling window. Uses published_at when present
// (so a feed's stated date wins) and falls back to fetched_at otherwise.
// Returns the number of rows deleted.
export async function purgeOldItems(): Promise<number> {
  const result = await sql`
    delete from items
    where coalesce(published_at, fetched_at) < now() - interval '3 days'
    returning id
  `;
  return result.length;
}

export async function addSource(kind: SourceKind, url: string, name: string) {
  const rows = await sql`
    insert into sources (kind, url, name) values (${kind}, ${url}, ${name})
    returning id
  `;
  return rows[0].id as string;
}

export async function deleteSource(id: string) {
  await sql`delete from sources where id = ${id}::uuid`;
}

export async function setSourceEnabled(id: string, enabled: boolean) {
  await sql`update sources set enabled = ${enabled} where id = ${id}::uuid`;
}

export async function renameSource(id: string, name: string) {
  await sql`update sources set name = ${name} where id = ${id}::uuid`;
}
