import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { collectInputs, validateOutputDestinations } from "../src/io.js";

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
