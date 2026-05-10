import test from "node:test";
import assert from "node:assert/strict";
import { buildBundle, gateFailures, parseFailOn } from "../src/index.js";

test("gateFailures respects severity threshold", () => {
  const bundle = buildBundle([{ path: "a.log", content: "email a@example.com token=supersecret" }]);
  assert.equal(gateFailures(bundle, "secret").length, 1);
  assert.equal(gateFailures(bundle, "warning").length, 2);
  assert.equal(gateFailures(bundle, "none").length, 0);
});

test("parseFailOn rejects unknown values", () => {
  assert.equal(parseFailOn("info"), "info");
  assert.throws(() => parseFailOn("critical"), /Invalid --fail-on/);
});
