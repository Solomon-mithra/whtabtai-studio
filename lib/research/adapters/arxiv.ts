import Parser from "rss-parser";
import type { Adapter, ItemCandidate, SourceRow } from "../types.ts";
import { stripHtml } from "../sanitize.ts";

const parser = new Parser();

function extractArxivId(idUrl: string): string {
  const idx = idUrl.indexOf("/abs/");
  if (idx === -1) return idUrl;
  return idUrl.slice(idx + "/abs/".length);
}

export async function parseArxiv(xml: string): Promise<ItemCandidate[]> {
  const feed = await parser.parseString(xml);
  return feed.items.map((it) => {
    // rss-parser surfaces Atom <id> as it.guid (and it.id-style fields).
    // Fall back to it.link if guid is missing.
    const idUrl =
      (it as { id?: string }).id ?? it.guid ?? it.link ?? "";
    const externalId = extractArxivId(idUrl);
    const rawTitle = it.title ?? "(untitled)";
    const cleanTitle = rawTitle.replace(/\s+/g, " ").trim();
    const published = it.isoDate ?? it.pubDate;
    const rawSummary =
      (it as { summary?: string }).summary ??
      it.contentSnippet ??
      it.content ??
      "";
    const cleanSummary = stripHtml(rawSummary);
    return {
      external_id: externalId,
      title: cleanTitle,
      url: it.link ?? "",
      summary: cleanSummary,
      content: cleanSummary,
      published_at: published ? new Date(published) : null,
    };
  });
}

export const arxivAdapter: Adapter = async (source: SourceRow) => {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(source.url)}&sortBy=submittedDate&sortOrder=descending&max_results=50`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "whtabtai-research/0.1 (+https://whtabtai.local)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching arXiv ${source.url}`);
  }
  const xml = await res.text();
  return parseArxiv(xml);
};
