import type { Adapter, SourceRow } from "../types.ts";
import { rssAdapter } from "./rss.ts";
import { githubReleasesAdapter } from "./githubReleases.ts";
import { hnAdapter } from "./hn.ts";

const adapters: Partial<Record<SourceRow["kind"], Adapter>> = {
  rss: rssAdapter,
  github_releases: githubReleasesAdapter,
  hn: hnAdapter,
};

export function getAdapter(kind: SourceRow["kind"]): Adapter | null {
  return adapters[kind] ?? null;
}
