import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripHtml } from "../lib/research/sanitize.ts";

describe("stripHtml", () => {
  it("removes tags", () => {
    assert.equal(stripHtml("<p>Hello <b>world</b></p>"), "Hello world");
  });
  it("decodes common entities", () => {
    assert.equal(
      stripHtml("Tom &amp; Jerry &lt;3 &quot;Cheese&quot;"),
      'Tom & Jerry <3 "Cheese"',
    );
  });
  it("collapses whitespace", () => {
    assert.equal(stripHtml("foo  \n\n  bar"), "foo bar");
  });
  it("handles null and empty", () => {
    assert.equal(stripHtml(null), "");
    assert.equal(stripHtml(""), "");
  });
  it("removes script and style content", () => {
    assert.equal(stripHtml("<script>alert(1)</script>safe"), "safe");
    assert.equal(stripHtml("<style>.x{}</style>safe"), "safe");
  });
});
