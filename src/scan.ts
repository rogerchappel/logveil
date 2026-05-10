import { createHash } from "node:crypto";
import type { BundleFile, Finding, InputDocument, RedactionRule, ReproBundle } from "./types.js";
import { defaultRules } from "./rules.js";

export const STABLE_CREATED_AT = "1970-01-01T00:00:00.000Z";

export interface ScanOptions {
  redact?: boolean;
  rules?: RedactionRule[];
  createdAt?: string;
}

interface LocatedMatch {
  rule: RedactionRule;
  match: string;
  index: number;
  matchOrdinal: number;
}

export function lineColumnFor(content: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset; i += 1) {
    if (content[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

export function maskEvidence(value: string): string {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 3)}…${value.slice(-3)}`;
}

export function scanDocument(input: InputDocument, options: ScanOptions = {}): BundleFile {
  const rules = options.rules ?? defaultRules;
  const redact = options.redact ?? true;
  const matches: LocatedMatch[] = [];

  for (const rule of rules) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags.includes("g") ? rule.pattern.flags : `${rule.pattern.flags}g`);
    let ordinal = 1;
    for (const match of input.content.matchAll(pattern)) {
      if (match.index === undefined) continue;
      matches.push({ rule, match: match[0], index: match.index, matchOrdinal: ordinal });
      ordinal += 1;
    }
  }

  matches.sort((a, b) => a.index - b.index || b.match.length - a.match.length || a.rule.id.localeCompare(b.rule.id));
  const accepted: LocatedMatch[] = [];
  let lastEnd = -1;
  for (const item of matches) {
    if (item.index >= lastEnd) {
      accepted.push(item);
      lastEnd = item.index + item.match.length;
    }
  }

  let sanitized = "";
  let cursor = 0;
  const findings: Finding[] = [];
  accepted.forEach((item, idx) => {
    const { line, column } = lineColumnFor(input.content, item.index);
    const replacement = item.rule.replacement(item.match, item.matchOrdinal);
    findings.push({
      id: `${input.path}:${idx + 1}:${item.rule.id}`,
      type: item.rule.type,
      severity: item.rule.severity,
      line,
      column,
      length: item.match.length,
      evidence: maskEvidence(item.match),
      replacement,
      description: item.rule.description
    });
    sanitized += input.content.slice(cursor, item.index);
    sanitized += redact ? replacement : item.match;
    cursor = item.index + item.match.length;
  });
  sanitized += input.content.slice(cursor);

  return {
    path: input.path,
    originalBytes: Buffer.byteLength(input.content),
    sanitizedBytes: Buffer.byteLength(sanitized),
    sha256: createHash("sha256").update(sanitized).digest("hex"),
    sanitized,
    findings
  };
}

export function buildBundle(inputs: InputDocument[], options: ScanOptions = {}): ReproBundle {
  const files = inputs.map((input) => scanDocument(input, options));
  const all = files.flatMap((file) => file.findings);
  return {
    generatedBy: "logveil@0.1.0",
    schemaVersion: 1,
    createdAt: options.createdAt ?? STABLE_CREATED_AT,
    redactionEnabled: options.redact ?? true,
    summary: {
      files: files.length,
      findings: all.length,
      secrets: all.filter((finding) => finding.severity === "secret").length,
      warnings: all.filter((finding) => finding.severity === "warning").length,
      info: all.filter((finding) => finding.severity === "info").length
    },
    files
  };
}
