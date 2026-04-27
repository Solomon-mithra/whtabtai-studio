import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreBreaking } from "../lib/research/breakingScore.ts";

describe("scoreBreaking", () => {
  it("scores 0 for benign content", () => {
    assert.equal(
      scoreBreaking({
        title: "We added a new export option",
        summary: "small ergonomics improvement",
        content: null,
        sourceKind: "rss",
        sourceName: "Anthropic",
        previousVersion: null,
        currentVersion: null,
      }),
      0,
    );
  });

  it("matches 'breaking change' phrase", () => {
    assert.ok(
      scoreBreaking({
        title: "BREAKING: tool_use payload format changed",
        summary: "",
        content: null,
        sourceKind: "rss",
        sourceName: "Anthropic",
        previousVersion: null,
        currentVersion: null,
      }) >= 1,
    );
  });

  it("matches 'deprecated'", () => {
    assert.ok(
      scoreBreaking({
        title: "v0.42 release",
        summary: "The legacy completion endpoint is deprecated.",
        content: null,
        sourceKind: "github_releases",
        sourceName: "anthropic-sdk-python",
        previousVersion: "v0.41.0",
        currentVersion: "v0.42.0",
      }) >= 1,
    );
  });

  it("scores semver major bump only for github_releases", () => {
    const args = {
      title: "v3.0.0",
      summary: "",
      content: null,
      previousVersion: "v2.7.1",
      currentVersion: "v3.0.0",
    } as const;
    assert.ok(
      scoreBreaking({ ...args, sourceKind: "github_releases", sourceName: "vllm" }) >= 1,
    );
    assert.equal(
      scoreBreaking({ ...args, sourceKind: "rss", sourceName: "vllm" }),
      0,
    );
  });

  it("matches pricing terms only for known-lab RSS", () => {
    const args = {
      title: "New pricing for Claude",
      summary: "",
      content: null,
      previousVersion: null,
      currentVersion: null,
    } as const;
    assert.ok(
      scoreBreaking({ ...args, sourceKind: "rss", sourceName: "Anthropic" }) >= 1,
    );
    assert.equal(
      scoreBreaking({ ...args, sourceKind: "reddit", sourceName: "r/LocalLLaMA" }),
      0,
    );
  });

  it("caps score at 3", () => {
    assert.ok(
      scoreBreaking({
        title: "BREAKING: deprecated, removed, breaking change",
        summary: "all the keywords",
        content: null,
        sourceKind: "rss",
        sourceName: "Anthropic",
        previousVersion: null,
        currentVersion: null,
      }) <= 3,
    );
  });
});
