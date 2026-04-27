import type { Adapter, ItemCandidate, SourceRow } from "../types.ts";
import { stripHtml } from "../sanitize.ts";

type Release = {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  body: string | null;
  published_at: string | null;
};

export function parseGithubReleases(
  releases: Release[],
  repoSlug: string,
): ItemCandidate[] {
  const repoName = repoSlug.split("/")[1] ?? repoSlug;
  return releases.map((r) => {
    const cleanBody = stripHtml(r.body ?? "");
    return {
      external_id: String(r.id),
      title: `${repoName} ${r.tag_name}`,
      url: r.html_url,
      summary: cleanBody.slice(0, 500),
      content: cleanBody,
      published_at: r.published_at ? new Date(r.published_at) : null,
    };
  });
}

export const githubReleasesAdapter: Adapter = async (source: SourceRow) => {
  const res = await fetch(
    `https://api.github.com/repos/${source.url}/releases?per_page=50`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "whtabtai-research/0.1 (+https://whtabtai.local)",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching releases for ${source.url}`);
  }
  const releases = (await res.json()) as Release[];
  return parseGithubReleases(releases, source.url);
};
