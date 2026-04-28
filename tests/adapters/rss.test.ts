import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseRssXml } from "../../lib/research/adapters/rss.ts";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Anthropic</title>
    <item>
      <title>Claude 4.7 launches</title>
      <link>https://www.anthropic.com/news/claude-4-7</link>
      <guid>https://www.anthropic.com/news/claude-4-7</guid>
      <description>A summary of the launch.</description>
      <pubDate>Mon, 27 Apr 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

describe("parseRssXml", () => {
  it("normalizes a basic RSS item", async () => {
    const items = await parseRssXml(SAMPLE);
    assert.equal(items.length, 1);
    const it0 = items[0];
    assert.equal(it0.title, "Claude 4.7 launches");
    assert.equal(it0.url, "https://www.anthropic.com/news/claude-4-7");
    assert.equal(it0.external_id, "https://www.anthropic.com/news/claude-4-7");
    assert.ok(it0.summary?.includes("summary of the launch"));
    assert.ok(it0.published_at instanceof Date);
  });

  it("uses link as external_id when guid is missing", async () => {
    const xml = SAMPLE.replace(/<guid>.*<\/guid>/, "");
    const items = await parseRssXml(xml);
    assert.equal(items[0].external_id, items[0].url);
  });

  it("handles items with no pubDate", async () => {
    const xml = SAMPLE.replace(/<pubDate>.*<\/pubDate>/, "");
    const items = await parseRssXml(xml);
    assert.equal(items[0].published_at, null);
  });

  it("strips HTML from summary and content", async () => {
    const xml = SAMPLE.replace(
      "<description>A summary of the launch.</description>",
      "<description>&lt;p&gt;A &lt;b&gt;summary&lt;/b&gt; of the launch.&lt;/p&gt;</description>",
    );
    const items = await parseRssXml(xml);
    assert.equal(items[0].summary, "A summary of the launch.");
  });
});
