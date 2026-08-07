import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

async function runRelease(options: { pack?: string; publishFails?: boolean; tag?: string; dryRun?: boolean } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "logveil-release-test-"));
  const bin = path.join(dir, "bin");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(bin));
  const log = path.join(dir, "commands.log");
  const npm = `#!/bin/sh
printf 'npm %s\\n' "$*" >> "$COMMAND_LOG"
if [ "$1" = pack ]; then printf '%s\\n' "$PACK_OUTPUT"; fi
if [ "$1" = publish ] && [ "$PUBLISH_FAILS" = 1 ]; then exit 23; fi
`;
  const gh = `#!/bin/sh
printf 'gh %s\\n' "$*" >> "$COMMAND_LOG"
`;
  const releasebox = path.join(dir, "releasebox.mjs");
  await writeFile(path.join(bin, "npm"), npm);
  await writeFile(path.join(bin, "gh"), gh);
  await chmod(path.join(bin, "npm"), 0o755);
  await chmod(path.join(bin, "gh"), 0o755);
  await writeFile(releasebox, `console.log("notes")`);
  const result = spawnSync(process.execPath, ["scripts/release.mjs", ...(options.dryRun ? ["--dry-run"] : [])], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      COMMAND_LOG: log,
      PACK_OUTPUT: options.pack ?? '[{"filename":"rogerchappel-logveil-0.1.0.tgz"}]',
      PUBLISH_FAILS: options.publishFails ? "1" : "0",
      RELEASE_TAG: options.tag ?? "v0.1.0",
      RELEASEBOX_CLI: releasebox,
    },
  });
  const commands = await readFile(log, "utf8").catch(() => "");
  return { ...result, commands };
}

test("packs once, publishes the exact artifact, then creates the release", async () => {
  const result = await runRelease();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.commands.trim().split("\n"), [
    "npm pack --json",
    "npm publish rogerchappel-logveil-0.1.0.tgz --provenance --access public",
    "gh release create v0.1.0 --notes-file RELEASE_NOTES.md rogerchappel-logveil-0.1.0.tgz",
  ]);
});

test("rejects a tag that differs from the package version before packing", async () => {
  const result = await runRelease({ tag: "v9.9.9" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not match package version v0\.1\.0/);
  assert.equal(result.commands, "");
});

for (const pack of ["not json", "[]", '[{"name":"missing filename"}]', '[{"filename":"a.tgz"},{"filename":"b.tgz"}]']) {
  test(`rejects invalid pack output: ${pack}`, async () => {
    const result = await runRelease({ pack });
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.commands, /publish|gh release/);
  });
}

test("does not create a GitHub release when npm publication fails", async () => {
  const result = await runRelease({ publishFails: true });
  assert.notEqual(result.status, 0);
  assert.match(result.commands, /npm publish .*\.tgz/);
  assert.doesNotMatch(result.commands, /gh release/);
});

test("dry run validates and packs without publishing or creating a release", async () => {
  const result = await runRelease({ dryRun: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.commands, "npm pack --json\n");
});
