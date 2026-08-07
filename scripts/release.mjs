#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const tag = process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME;
const releasebox = process.env.RELEASEBOX_CLI ?? "/tmp/releasebox/bin/releasebox.js";

function run(command, commandArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
    });
    let stdout = "";
    child.stdout?.on("data", (chunk) => (stdout += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${commandArgs.join(" ")} exited with code ${code}`));
    });
  });
}

function parseTarball(output) {
  let result;
  try {
    result = JSON.parse(output);
  } catch {
    throw new Error("npm pack --json returned malformed JSON");
  }
  if (!Array.isArray(result) || result.length !== 1 || typeof result[0]?.filename !== "string" || !result[0].filename) {
    throw new Error("npm pack --json must return exactly one tarball filename");
  }
  return result[0].filename;
}

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const expectedTag = `v${pkg.version}`;
if (tag !== expectedTag) {
  throw new Error(`release tag ${JSON.stringify(tag)} does not match package version ${expectedTag}`);
}

const tarball = parseTarball(await run("npm", ["pack", "--json"], { capture: true }));
console.log(`Release artifact: ${tarball}`);

if (dryRun) {
  console.log(`Dry run: would publish and release ${tarball} as ${tag}`);
  process.exit(0);
}

await run("npm", ["publish", tarball, "--provenance", "--access", "public"]);
const notes = await run(process.execPath, [releasebox, "notes", "."], { capture: true });
await writeFile("RELEASE_NOTES.md", notes);
await run("gh", ["release", "create", tag, "--notes-file", "RELEASE_NOTES.md", tarball]);
