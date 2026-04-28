import type { Adapter, ItemCandidate, SourceRow } from "../types.ts";
import { stripHtml } from "../sanitize.ts";

type RedditChild = {
  kind: string;
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    selftext: string;
    created_utc: number;
  };
};

type RedditListing = {
  data: {
    children: RedditChild[];
  };
};

export function parseReddit(json: RedditListing): ItemCandidate[] {
  return json.data.children.map((child) => {
    const d = child.data;
    const cleanSelf = d.selftext
      ? stripHtml(d.selftext).slice(0, 500)
      : null;
    return {
      external_id: d.id,
      title: d.title,
      url: `https://reddit.com${d.permalink}`,
      summary: cleanSelf,
      content: cleanSelf,
      published_at: new Date(d.created_utc * 1000),
    };
  });
}

export const redditAdapter: Adapter = async (source: SourceRow) => {
  const url = `https://www.reddit.com/r/${source.url}/new.json?limit=50`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "whtabtai-research/0.1 by Solomon",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching reddit r/${source.url}`);
  }
  const json = (await res.json()) as RedditListing;
  return parseReddit(json);
};
