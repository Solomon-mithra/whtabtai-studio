import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseArxiv } from "../../lib/research/adapters/arxiv.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(
  join(here, "..", "fixtures", "arxiv.xml"),
  "utf8",
);

describe("parseArxiv", () => {
  it("normalizes a basic Atom entry", async () => {
    const items = await parseArxiv(fixture);
    assert.equal(items.length, 2);
    const it0 = items[0];
    assert.equal(it0.external_id, "2604.12345v1");
    assert.equal(it0.url, "http://arxiv.org/abs/2604.12345v1");
    assert.ok(it0.published_at instanceof Date);
  });

  it("collapses internal whitespace in the title", async () => {
    const items = await parseArxiv(fixture);
    assert.equal(
      items[0].title,
      "Scaling Laws for Sparse Mixture-of-Experts Language Models",
    );
  });

  it("strips HTML from the summary", async () => {
    const items = await parseArxiv(fixture);
    const it0 = items[0];
    assert.ok(it0.summary?.includes("routing efficiency"));
    assert.ok(!it0.summary?.includes("<b>"));
  });
});
