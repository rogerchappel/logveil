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
  const code = await quietMain(["redact", "examples/agent-session.log", "--out", md, "--json-out", json]);
  assert.equal(code, 0);
  const markdown = await readFile(md, "utf8");
  const parsed = JSON.parse(await readFile(json, "utf8"));
  assert.match(markdown, /REDACTED/);
  assert.equal(parsed.summary.files, 1);
  assert.ok(parsed.summary.findings >= 4);
});

test("CLI returns 2 when fail-on threshold trips", async () => {
  const code = await quietMain(["audit", "examples/agent-session.log", "--fail-on", "secret"]);
  assert.equal(code, 2);
});

async function quietMain(args: string[]): Promise<number> {
  const stdout = process.stdout.write;
  const stderr = process.stderr.write;
  process.stdout.write = (() => true) as typeof process.stdout.write;
  process.stderr.write = (() => true) as typeof process.stderr.write;
  try {
    return await main(args);
  } finally {
    process.stdout.write = stdout;
    process.stderr.write = stderr;
  }
}
