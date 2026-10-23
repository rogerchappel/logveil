import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { collectInputs, planSanitizedDestinations, validateOutputDestinations, writeSanitizedCopies } from "../src/io.js";
import type { ReproBundle } from "../src/types.js";

let root: string;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "logveil-io-"));
});
afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

async function makeDirectorySymlink(target: string, link: string): Promise<boolean> {
  try {
    await fs.symlink(target, link, "dir");
    return true;
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP", "EINVAL"].includes((error as NodeJS.ErrnoException).code ?? "")) return false;
    throw error;
  }
}

function bundleWithPaths(...paths: string[]): ReproBundle {
  return {
    generatedBy: "test", schemaVersion: 1, createdAt: "2026-01-01T00:00:00Z", redactionEnabled: true,
    summary: { files: paths.length, findings: 0, secrets: 0, warnings: 0, info: 0 },
    files: paths.map((filePath) => ({ path: filePath, originalBytes: 4, sanitizedBytes: 4, sha256: "test", sanitized: "safe", findings: [] }))
  };
}

test("sanitized copy planning and writing keep every destination inside outDir", async () => {
  const outDir = path.join(root, "output");
  const filePaths = ["nested/record.log", "../outside.log", "../../../../escape.txt", "/absolute/record.json", ".."];
  const bundle = bundleWithPaths(...filePaths);
  const planned = planSanitizedDestinations(bundle, outDir);
  const writes = await writeSanitizedCopies(bundle, outDir);
  const rootPath = path.resolve(outDir);

  assert.equal(planned.length, filePaths.length + 1);
  for (const item of [...planned, ...writes.map((write) => ({ path: path.resolve(write.destination) }))]) {
    const destination = path.resolve(item.path);
    const relative = path.relative(rootPath, destination);
    assert.notEqual(destination, rootPath);
    assert.ok(relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), `${destination} escaped ${rootPath}`);
  }
  assert.equal(await fs.readFile(path.join(outDir, "outside.redacted.log"), "utf8"), "safe");
  await assert.rejects(fs.access(path.join(root, "outside.redacted.log")));
});

test("collectInputs follows a symlink supplied as the root input", async (t) => {
  const actual = path.join(root, "actual");
  await fs.mkdir(actual);
  await fs.writeFile(path.join(actual, "record.log"), "root link content");
  const linked = path.join(root, "linked");
  if (!(await makeDirectorySymlink(actual, linked))) return t.skip("directory symlink creation unavailable");

  const inputs = await collectInputs([linked]);
  assert.equal(inputs.length, 1);
  assert.equal(inputs[0].content, "root link content");
  assert.equal(path.basename(inputs[0].path), "record.log");
});

test("collectInputs does not recurse into symlinked directories found while walking", async (t) => {
  const input = path.join(root, "input");
  const outside = path.join(root, "outside");
  await fs.mkdir(input);
  await fs.mkdir(outside);
  await fs.writeFile(path.join(outside, "hidden.log"), "not collected");
  const linked = path.join(input, "linked");
  if (!(await makeDirectorySymlink(outside, linked))) return t.skip("directory symlink creation unavailable");

  assert.deepEqual(await collectInputs([input]), []);
});

test("validateOutputDestinations rejects outputs through linked input paths", async (t) => {
  const input = path.join(root, "input");
  const actual = path.join(root, "actual");
  await fs.mkdir(input);
  await fs.mkdir(actual);
  const linked = path.join(root, "linked-input");
  if (!(await makeDirectorySymlink(input, linked))) return t.skip("directory symlink creation unavailable");

  await assert.rejects(
    validateOutputDestinations([linked], [{ flag: "--out", path: path.join(input, "result.log") }]),
    /destination must be outside directory input/
  );
  await assert.rejects(
    validateOutputDestinations([input], [{ flag: "--out", path: path.join(linked, "result.log") }]),
    /destination must be outside directory input/
  );
  await validateOutputDestinations([input], [{ flag: "--out", path: path.join(actual, "result.log") }]);
});
