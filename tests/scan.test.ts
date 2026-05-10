import test from "node:test";
import assert from "node:assert/strict";
import { buildBundle, scanDocument } from "../src/index.js";

const content = "email alice@example.com token=supersecretvalue path /Users/alice/project\n";

test("scanDocument redacts obvious secrets and evidence", () => {
  const file = scanDocument({ path: "sample.log", content });
  assert.equal(file.findings.length, 3);
  assert.match(file.sanitized, /\[REDACTED:EMAIL_1\]/);
  assert.match(file.sanitized, /\[REDACTED:SECRET_ASSIGNMENT\]/);
  assert.match(file.sanitized, /\[REDACTED:LOCAL_PATH_1\]/);
  assert.doesNotMatch(file.sanitized, /supersecretvalue/);
  assert.equal(file.findings[0].line, 1);
});

test("buildBundle summaries are deterministic", () => {
  const bundle = buildBundle([{ path: "sample.log", content }]);
  assert.equal(bundle.createdAt, "1970-01-01T00:00:00.000Z");
  assert.equal(bundle.summary.files, 1);
  assert.equal(bundle.summary.findings, 3);
  assert.equal(bundle.summary.secrets, 1);
  assert.equal(bundle.summary.warnings, 2);
});
