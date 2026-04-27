import type { Adapter, ItemCandidate, SourceRow } from "../types.ts";
import { stripHtml } from "../sanitize.ts";

type Hit = {
  objectID: string;
  title: string;
  url: string | null;
  story_text: string | null;
  created_at: string;
};

type AlgoliaResponse = {
  hits: Hit[];
};

export function parseHn(json: AlgoliaResponse): ItemCandidate[] {
  return json.hits.map((hit) => {
    const cleanText = hit.story_text
      ? stripHtml(hit.story_text).slice(0, 500)
      : null;
    return {
      external_id: hit.objectID,
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      summary: cleanText,
      content: cleanText,
      published_at: new Date(hit.created_at),
    };
  });
}

// Algolia's `tags=front_page&query=<keywords>` returns 0 hits in practice —
// the front-page tag is an AND filter, not an OR, so it intersects with the
// keyword query against a tiny corpus. Drop the keyword filter; the HN front
// page is AI-heavy enough on its own for an AI-builder brand.
export const hnAdapter: Adapter = async (_source: SourceRow) => {
  const url = "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=50";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "whtabtai-research/0.1 (+https://whtabtai.local)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching HN front page`);
  }
  const json = (await res.json()) as AlgoliaResponse;
  return parseHn(json);
};
