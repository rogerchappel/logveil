#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { collectInputs, writeIfRequested } from "./io.js";
import { buildBundle } from "./scan.js";
import { gateFailures, parseFailOn } from "./gates.js";
import { renderJson, renderMarkdown } from "./render.js";
import type { OutputFormat } from "./types.js";

interface CliOptions {
  command: "redact" | "audit" | "help" | "version";
  inputs: string[];
  out?: string;
  jsonOut?: string;
  format: OutputFormat;
  redact: boolean;
  failOn?: string;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const options = parseArgs(argv);
    if (options.command === "help") {
      process.stdout.write(helpText());
      return 0;
    }
    if (options.command === "version") {
      process.stdout.write("logveil 0.1.0\n");
      return 0;
    }
    if (options.inputs.length === 0) throw new Error("At least one input file or directory is required.");

    const inputs = await collectInputs(options.inputs);
    if (inputs.length === 0) throw new Error("No supported input files found.");
    const bundle = buildBundle(inputs, { redact: options.redact });
    const output = options.format === "json" ? renderJson(bundle) : renderMarkdown(bundle);

    await writeIfRequested(options.out, output);
    if (options.jsonOut) await writeIfRequested(options.jsonOut, renderJson(bundle));
    if (!options.out) process.stdout.write(output);

    const failures = gateFailures(bundle, parseFailOn(options.failOn));
    if (failures.length > 0) {
      process.stderr.write(`logveil gate failed (${failures.length} findings at or above --fail-on ${options.failOn}):\n`);
      process.stderr.write(failures.map((failure) => `- ${failure}`).join("\n") + "\n");
      return 2;
    }
    return 0;
  } catch (error) {
    process.stderr.write(`logveil: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

function parseArgs(argv: string[]): CliOptions {
  const [commandRaw, ...rest] = argv;
  const normalizedCommand = commandRaw === "--help" || commandRaw === "-h"
    ? "help"
    : commandRaw === "--version" || commandRaw === "-v"
      ? "version"
      : commandRaw;
  const command = (normalizedCommand ?? "help") as CliOptions["command"];
  if (!["redact", "audit", "help", "version"].includes(command)) throw new Error(`Unknown command: ${commandRaw}`);
  const options: CliOptions = { command, inputs: [], format: command === "audit" ? "json" : "markdown", redact: true };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--out") options.out = requireValue(rest, ++i, arg);
    else if (arg === "--json-out") options.jsonOut = requireValue(rest, ++i, arg);
    else if (arg === "--format") options.format = parseFormat(requireValue(rest, ++i, arg));
    else if (arg === "--fail-on") options.failOn = requireValue(rest, ++i, arg);
    else if (arg === "--no-redact") options.redact = false;
    else if (arg === "--redact") options.redact = true;
    else if (arg === "--help" || arg === "-h") options.command = "help";
    else if (arg.startsWith("-")) throw new Error(`Unknown flag: ${arg}`);
    else options.inputs.push(arg);
  }
  return options;
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}

function parseFormat(value: string): OutputFormat {
  if (value === "markdown" || value === "json") return value;
  throw new Error(`Invalid --format value: ${value}. Expected markdown or json.`);
}

function helpText(): string {
  return `LogVeil - sanitize agent logs into safe repro bundles\n\nUsage:\n  logveil redact <file|dir...> [--out repro-safe.md] [--json-out evidence.json] [--fail-on secret]\n  logveil audit <file|dir...> [--format json|markdown] [--fail-on warning]\n\nDefaults:\n  --redact is enabled by default. Outputs are deterministic and local-only.\n  --fail-on accepts none, info, warning, secret.\n`;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
