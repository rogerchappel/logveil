import { promises as fs } from "node:fs";
import path from "node:path";
import type { InputDocument, ReproBundle } from "./types.js";

const SUPPORTED = new Set([".txt", ".log", ".md", ".json", ".jsonl", ".out", ".ansi"]);

export async function collectInputs(paths: string[]): Promise<InputDocument[]> {
  const results: InputDocument[] = [];
  for (const requestedPath of paths) {
    const absolute = path.resolve(requestedPath);
    const stat = await fs.stat(absolute);
    if (stat.isDirectory()) {
      results.push(...(await collectDirectory(absolute)));
    } else if (stat.isFile()) {
      results.push(await readInput(absolute));
    }
  }
  return results.sort((a, b) => a.path.localeCompare(b.path));
}

async function collectDirectory(directory: string): Promise<InputDocument[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results: InputDocument[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await collectDirectory(absolute)));
    if (entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase())) results.push(await readInput(absolute));
  }
  return results;
}

async function readInput(absolute: string): Promise<InputDocument> {
  return { path: path.relative(process.cwd(), absolute) || path.basename(absolute), content: await fs.readFile(absolute, "utf8") };
}

export async function writeIfRequested(destination: string | undefined, content: string): Promise<void> {
  if (!destination) return;
  await fs.mkdir(path.dirname(path.resolve(destination)), { recursive: true });
  await fs.writeFile(destination, content, "utf8");
}

export interface SanitizedWrite {
  source: string;
  destination: string;
  findings: number;
  sha256: string;
}

export async function writeSanitizedCopies(bundle: ReproBundle, outDir: string): Promise<SanitizedWrite[]> {
  const root = path.resolve(outDir);
  const writes: SanitizedWrite[] = [];

  for (const file of bundle.files) {
    const destination = path.join(root, redactedPath(file.path));
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.sanitized, "utf8");
    writes.push({
      source: file.path,
      destination: path.relative(process.cwd(), destination),
      findings: file.findings.length,
      sha256: file.sha256
    });
  }

  await fs.writeFile(
    path.join(root, "logveil-write-manifest.json"),
    `${JSON.stringify({ generatedBy: bundle.generatedBy, files: writes }, null, 2)}\n`,
    "utf8"
  );
  return writes;
}

function redactedPath(inputPath: string): string {
  const normalized = inputPath.split(path.sep).filter((part) => part && part !== "..");
  const basename = normalized.pop() ?? "input.txt";
  const extension = path.extname(basename);
  const stem = extension ? basename.slice(0, -extension.length) : basename;
  return path.join(...normalized, `${stem}.redacted${extension || ".txt"}`);
}
