import type { Adapter, SourceRow } from "../types.ts";
import { rssAdapter } from "./rss.ts";
import { githubReleasesAdapter } from "./githubReleases.ts";
import { hnAdapter } from "./hn.ts";
import { arxivAdapter } from "./arxiv.ts";
import { redditAdapter } from "./reddit.ts";

const adapters: Partial<Record<SourceRow["kind"], Adapter>> = {
  rss: rssAdapter,
  github_releases: githubReleasesAdapter,
  hn: hnAdapter,
  arxiv: arxivAdapter,
  reddit: redditAdapter,
};

export function getAdapter(kind: SourceRow["kind"]): Adapter | null {
  return adapters[kind] ?? null;
}
