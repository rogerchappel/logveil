import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
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

test("CLI rejects direct and normalized output aliases without changing the input", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-alias-"));
  const input = path.join(dir, "session.log");
  const original = "token=abcdefgh\n";
  await writeFile(input, original);

  for (const destination of [input, path.join(dir, ".", "nested", "..", "session.log")]) {
    const { code, stderr } = await captureStderrMain(["redact", input, "--out", destination]);
    assert.equal(code, 1);
    assert.match(stderr, /--out destination aliases an input file/);
    assert.equal(await readFile(input, "utf8"), original);
  }
});

test("CLI rejects colliding report destinations without changing an existing report", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-collision-"));
  const input = path.join(dir, "session.log");
  const report = path.join(dir, "report.txt");
  await writeFile(input, "token=abcdefgh\n");
  await writeFile(report, "keep me\n");

  const { code, stderr } = await captureStderrMain([
    "redact", input, "--out", report, "--json-out", path.join(dir, ".", "report.txt")
  ]);
  assert.equal(code, 1);
  assert.match(stderr, /--json-out destination collides with --out/);
  assert.equal(await readFile(report, "utf8"), "keep me\n");
});

test("CLI rejects an output directory inside a directory input on first and repeated runs", async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), "logveil-overlap-"));
  const input = path.join(inputDir, "session.log");
  const outDir = path.join(inputDir, "sanitized");
  await writeFile(input, "token=abcdefgh\n");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { code, stderr } = await captureStderrMain([
      "redact", inputDir, "--write", "--out-dir", outDir
    ]);
    assert.equal(code, 1);
    assert.match(stderr, /--out-dir destination must be outside directory input/);
    await assert.rejects(readFile(path.join(outDir, "logveil-write-manifest.json"), "utf8"), /ENOENT/);
  }
});

test("CLI rejects report outputs inside a directory input before they can be re-ingested", async () => {
  const inputDir = await mkdtemp(path.join(tmpdir(), "logveil-report-overlap-"));
  const input = path.join(inputDir, "session.log");
  await writeFile(input, "token=abcdefgh\n");

  for (const [flag, destination] of [
    ["--out", path.join(inputDir, "report.md")],
    ["--json-out", path.join(inputDir, "evidence.json")]
  ] as const) {
    const { code, stderr } = await captureStderrMain(["redact", inputDir, flag, destination]);
    assert.equal(code, 1);
    assert.match(stderr, new RegExp(`${flag} destination must be outside directory input`));
    await assert.rejects(readFile(destination, "utf8"), /ENOENT/);
  }
});

async function quietStderrMain(args: string[]): Promise<number> {
  return (await captureStderrMain(args)).code;
}

async function captureStderrMain(args: string[]): Promise<{ code: number; stderr: string }> {
  const stderr = process.stderr.write;
  let output = "";
  process.stderr.write = ((chunk: string | Uint8Array) => {
    output += chunk.toString();
    return true;
  }) as typeof process.stderr.write;
  try {
    return { code: await main(args), stderr: output };
  } finally {
    process.stderr.write = stderr;
  }
}
