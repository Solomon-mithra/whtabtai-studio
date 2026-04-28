import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseHn } from "../../lib/research/adapters/hn.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(here, "..", "fixtures", "hn.json"), "utf8"),
);

describe("parseHn", () => {
  it("normalizes a hit with a url", () => {
    const items = parseHn(fixture);
    assert.equal(items.length, 3);
    const it0 = items[0];
    assert.equal(it0.external_id, "39912345");
    assert.equal(it0.title, "Show HN: A new LLM agent framework");
    assert.equal(it0.url, "https://example.com/agent-framework");
    assert.ok(it0.published_at instanceof Date);
    assert.equal(it0.summary, null);
  });

  it("falls back to the HN item URL when hit.url is null", () => {
    const items = parseHn(fixture);
    const it1 = items[1];
    assert.equal(it1.url, "https://news.ycombinator.com/item?id=39912346");
  });

  it("strips HTML from story_text", () => {
    const items = parseHn(fixture);
    const it1 = items[1];
    assert.ok(it1.summary?.includes("QLoRA"));
    assert.ok(!it1.summary?.includes("<b>"));
    assert.ok(!it1.summary?.includes("<p>"));
  });
});
