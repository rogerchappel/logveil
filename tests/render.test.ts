import test from "node:test";
import assert from "node:assert/strict";
import { buildBundle, renderJson, renderMarkdown } from "../src/index.js";

test("renderJson emits stable parseable output", () => {
  const bundle = buildBundle([{ path: "a.log", content: "sk-abcdefghijklmnopqrstuvwxyz123456" }]);
  const parsed = JSON.parse(renderJson(bundle));
  assert.equal(parsed.files[0].findings[0].type, "api_key");
  assert.equal(parsed.files[0].sanitized, "[REDACTED:API_KEY_1]");
});

test("renderMarkdown includes evidence and sanitized body", () => {
  const bundle = buildBundle([{ path: "a.log", content: "roger@example.com" }]);
  const markdown = renderMarkdown(bundle);
  assert.match(markdown, /# LogVeil Repro Bundle/);
  assert.match(markdown, /Redaction evidence/);
  assert.match(markdown, /\[REDACTED:EMAIL_1\]/);
  assert.doesNotMatch(markdown, /roger@example.com/);
});
