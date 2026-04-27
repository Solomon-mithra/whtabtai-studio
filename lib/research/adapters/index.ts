import type { Adapter, SourceRow } from "../types.ts";
import { rssAdapter } from "./rss.ts";
import { githubReleasesAdapter } from "./githubReleases.ts";

const adapters: Partial<Record<SourceRow["kind"], Adapter>> = {
  rss: rssAdapter,
  github_releases: githubReleasesAdapter,
};

export function getAdapter(kind: SourceRow["kind"]): Adapter | null {
  return adapters[kind] ?? null;
}
