import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { main } from "../src/cli.js";

test("CLI writes markdown and json outputs", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-test-"));
  const md = path.join(dir, "bundle.md");
  const json = path.join(dir, "bundle.json");
  const code = await main(["redact", "examples/agent-session.log", "--out", md, "--json-out", json]);
  assert.equal(code, 0);
  const markdown = await readFile(md, "utf8");
  const parsed = JSON.parse(await readFile(json, "utf8"));
  assert.match(markdown, /REDACTED/);
  assert.equal(parsed.summary.files, 1);
  assert.ok(parsed.summary.findings >= 4);
});

test("CLI returns 2 when fail-on threshold trips", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-test-"));
  const out = path.join(dir, "audit.json");
  const code = await quietStderrMain(["audit", "examples/agent-session.log", "--out", out, "--fail-on", "secret"]);
  assert.equal(code, 2);
});

test("CLI writes sanitized copies only with explicit write flag and out dir", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-write-"));
  const code = await main(["redact", "examples/agent-session.log", "--write", "--out-dir", dir, "--out", path.join(dir, "report.md")]);
  assert.equal(code, 0);

  const sanitized = await readFile(path.join(dir, "examples", "agent-session.redacted.log"), "utf8");
  const manifest = JSON.parse(await readFile(path.join(dir, "logveil-write-manifest.json"), "utf8"));
  assert.match(sanitized, /REDACTED/);
  assert.equal(manifest.files[0].source, "examples/agent-session.log");
});

test("CLI rejects write mode without an explicit output directory", async () => {
  const code = await quietStderrMain(["redact", "examples/agent-session.log", "--write"]);
  assert.equal(code, 1);
});

async function quietStderrMain(args: string[]): Promise<number> {
  const stderr = process.stderr.write;
  process.stderr.write = (() => true) as typeof process.stderr.write;
  try {
    return await main(args);
  } finally {
    process.stderr.write = stderr;
  }
}
