import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { promisify } from "node:util";

const run = promisify(execFile);

test("README local-tarball recipe installs the artifact packed by LogVeil", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const section = readme.match(
    /To test the installable package[\s\S]*?```bash\n([\s\S]*?)\n```/,
  );

  assert.ok(section, "local-tarball recipe is present");
  const recipe = section[1];
  assert.ok(
    recipe.indexOf("package_version=") < recipe.indexOf('cd "$consumer_dir"'),
    "package version is captured before entering the consumer project",
  );

  const { stdout } = await run("bash", ["-euo", "pipefail", "-c", recipe], {
    cwd: new URL("..", import.meta.url),
  });
  assert.match(stdout, /Usage:\s+logveil/);
});
