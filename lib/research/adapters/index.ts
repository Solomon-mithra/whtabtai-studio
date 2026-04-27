import type { Adapter, SourceRow } from "../types.ts";
import { rssAdapter } from "./rss.ts";

const adapters: Partial<Record<SourceRow["kind"], Adapter>> = {
  rss: rssAdapter,
};

export function getAdapter(kind: SourceRow["kind"]): Adapter | null {
  return adapters[kind] ?? null;
}
