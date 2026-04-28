import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseGithubReleases } from "../../lib/research/adapters/githubReleases.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(here, "..", "fixtures", "github-releases.json"), "utf8"),
);

describe("parseGithubReleases", () => {
  it("normalizes a basic release", () => {
    const items = parseGithubReleases(fixture, "example/lib");
    assert.equal(items.length, 2);
    const it0 = items[0];
    assert.equal(it0.external_id, "100001");
    assert.equal(it0.title, "lib v0.42.0");
    assert.equal(it0.url, "https://github.com/example/lib/releases/tag/v0.42.0");
    assert.ok(it0.published_at instanceof Date);
    assert.ok(it0.summary?.includes("A thing"));
    assert.ok(!it0.summary?.includes("<p>"));
  });

  it("handles null body and null published_at", () => {
    const items = parseGithubReleases(fixture, "example/lib");
    const it1 = items[1];
    assert.equal(it1.summary, "");
    assert.equal(it1.content, "");
    assert.equal(it1.published_at, null);
  });

  it("title falls back to tag when name is null", () => {
    const items = parseGithubReleases(fixture, "example/lib");
    assert.equal(items[1].title, "lib v0.43.0");
  });
});
