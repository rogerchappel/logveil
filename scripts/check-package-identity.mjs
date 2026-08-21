#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";

const expectedName = "@rogerchappel/logveil";
const expectedRepository = "github.com/rogerchappel/logveil";
const legacyName = "logveil";
const registry = new URL("https://registry.npmjs.org/");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

if (packageJson.name !== expectedName) {
  throw new Error(`package.json name must be ${expectedName}, received ${packageJson.name}`);
}
if (packageJson.publishConfig?.access !== "public") {
  throw new Error("scoped package publishConfig.access must be public");
}
if (!normalizeRepository(packageJson.repository?.url).includes(expectedRepository)) {
  throw new Error(`package repository must resolve to ${expectedRepository}`);
}

const chosen = await registryMetadata(expectedName);
if (chosen && !normalizeRepository(chosen.repository?.url).includes(expectedRepository)) {
  throw new Error(`${expectedName} is already owned by an unrelated registry project`);
}

const legacy = await registryMetadata(legacyName);
if (legacy && normalizeRepository(legacy.repository?.url).includes(expectedRepository)) {
  throw new Error(`${legacyName} unexpectedly points at this repository; review the package rename`);
}

console.log(
  chosen
    ? `${expectedName} is registered to ${expectedRepository}`
    : `${expectedName} is available in the npm registry`,
);
if (legacy) {
  console.log(`${legacyName} resolves to an unrelated registry package and must not appear in install commands`);
}

const unsafeCommands = await findUnsafeInstallCommands(new URL("../", import.meta.url));
if (unsafeCommands.length > 0) {
  throw new Error(`unscoped npm install/npx command(s) found:\n${unsafeCommands.join("\n")}`);
}

const registryCommands = await findRegistryInstallCommands(new URL("../", import.meta.url));
if (!chosen && registryCommands.length > 0) {
  throw new Error(
    `${expectedName} is unpublished but is described as registry-installable:\n${registryCommands.join("\n")}`,
  );
}

async function registryMetadata(name) {
  const response = await fetch(new URL(encodeURIComponent(name), registry), {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`npm registry lookup for ${name} failed with HTTP ${response.status}`);
  }
  return response.json();
}

function normalizeRepository(value = "") {
  return value.toLowerCase().replace(/^git\+/, "").replace(/\.git$/, "");
}

async function findUnsafeInstallCommands(root) {
  const results = [];
  for (const file of await markdownFiles(root)) {
    const content = await readFile(file, "utf8");
    content.split("\n").forEach((line, index) => {
      const command = line.trim();
      const mentionsInstall = /^(npm\s+(?:i|install|exec)|npx)\b/.test(command);
      const installsLocalTarball = /(?:^|\s)(?:\.?\.?\/|\/).*\.tgz(?:\s|$)/.test(command);
      if (mentionsInstall && /\blogveil\b/.test(command) && !command.includes(expectedName) && !installsLocalTarball) {
        results.push(`${file.pathname}:${index + 1}: ${command}`);
      }
    });
  }
  return results;
}

async function findRegistryInstallCommands(root) {
  const results = [];
  for (const file of await markdownFiles(root)) {
    const content = await readFile(file, "utf8");
    content.split("\n").forEach((line, index) => {
      const command = line.trim();
      if (/^(?:npm\s+(?:i|install|exec)|npx)\b/.test(command) && command.includes(expectedName)) {
        results.push(`${file.pathname}:${index + 1}: ${command}`);
      }
    });
  }
  return results;
}

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
    if (entry.isDirectory()) files.push(...await markdownFiles(child));
    else if (entry.name.endsWith(".md")) files.push(child);
  }
  return files;
}
