import Parser from "rss-parser";
import type { Adapter, ItemCandidate, SourceRow } from "../types.ts";
import { stripHtml } from "../sanitize.ts";

const parser = new Parser();

export async function parseRssXml(xml: string): Promise<ItemCandidate[]> {
  const feed = await parser.parseString(xml);
  return feed.items.map((it) => {
    const url = it.link ?? "";
    const externalId = it.guid ?? url;
    const published = it.isoDate ?? it.pubDate;
    const rawSummary = it.contentSnippet ?? it.content ?? null;
    const rawContent = it["content:encoded"] ?? it.content ?? null;
    return {
      external_id: externalId,
      title: it.title ?? "(untitled)",
      url,
      summary: rawSummary ? stripHtml(rawSummary) : null,
      content: rawContent ? stripHtml(rawContent) : null,
      published_at: published ? new Date(published) : null,
    };
  });
}

export const rssAdapter: Adapter = async (source: SourceRow) => {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "whtabtai-research/0.1 (+https://whtabtai.local)" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${source.url}`);
  }
  const xml = await res.text();
  return parseRssXml(xml);
};
