import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("smoke", () => {
  it("test runner is wired up", () => {
    assert.equal(1 + 1, 2);
  });
});
