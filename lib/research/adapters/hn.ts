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

const HN_QUERY =
  '(GPT OR Claude OR LLM OR "AI agent" OR Anthropic OR OpenAI OR transformer OR diffusion OR fine-tuning)';

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

export const hnAdapter: Adapter = async (_source: SourceRow) => {
  const url = `https://hn.algolia.com/api/v1/search?tags=front_page&query=${encodeURIComponent(HN_QUERY)}`;
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
