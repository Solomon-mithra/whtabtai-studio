import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseReddit } from "../../lib/research/adapters/reddit.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(here, "..", "fixtures", "reddit.json"), "utf8"),
);

describe("parseReddit", () => {
  it("normalizes a link post", () => {
    const items = parseReddit(fixture);
    assert.equal(items.length, 2);
    const it0 = items[0];
    assert.equal(it0.external_id, "1abcd23");
    assert.equal(it0.title, "Local Llama 3.3 70B running on 2x 3090s — benchmarks");
    assert.equal(
      it0.url,
      "https://reddit.com/r/LocalLLaMA/comments/1abcd23/local_llama_33_70b_running_on_2x_3090s_benchmarks/",
    );
    assert.ok(it0.published_at instanceof Date);
    assert.equal(it0.summary, null);
  });

  it("strips HTML from selftext on a self post", () => {
    const items = parseReddit(fixture);
    const it1 = items[1];
    assert.ok(it1.summary?.includes("function-calling"));
    assert.ok(!it1.summary?.includes("<a"));
    assert.ok(!it1.summary?.includes("href"));
  });

  it("converts created_utc seconds to a Date", () => {
    const items = parseReddit(fixture);
    // 1745870400 == 2025-04-28T19:20:00Z
    assert.equal(items[0].published_at?.getTime(), 1745870400 * 1000);
  });
});
