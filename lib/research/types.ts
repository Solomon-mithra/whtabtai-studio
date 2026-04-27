import type { SourceKind, SourceRow } from "../db/queries.ts";

export type ItemCandidate = {
  external_id: string;
  title: string;
  url: string;
  summary: string | null;
  content: string | null;
  published_at: Date | null;
};

export type Adapter = (source: SourceRow) => Promise<ItemCandidate[]>;

export type AdapterError = { source_id: string; message: string };

export type RefreshSummary = {
  total_fetched: number;
  new_items: number;
  breaking_count: number;
  trending_count: number;
  purged_count: number;
  errors: AdapterError[];
};

export type { SourceKind, SourceRow };
