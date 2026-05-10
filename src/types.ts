export type Severity = "info" | "warning" | "secret";

export interface Finding {
  id: string;
  type: string;
  severity: Severity;
  line: number;
  column: number;
  length: number;
  evidence: string;
  replacement: string;
  description: string;
}

export interface RedactionRule {
  id: string;
  type: string;
  severity: Severity;
  description: string;
  pattern: RegExp;
  replacement: (match: string, index: number) => string;
}

export interface InputDocument {
  path: string;
  content: string;
}

export interface BundleFile {
  path: string;
  originalBytes: number;
  sanitizedBytes: number;
  sha256: string;
  sanitized: string;
  findings: Finding[];
}

export interface AuditSummary {
  files: number;
  findings: number;
  secrets: number;
  warnings: number;
  info: number;
}

export interface ReproBundle {
  generatedBy: string;
  schemaVersion: 1;
  createdAt: string;
  redactionEnabled: boolean;
  summary: AuditSummary;
  files: BundleFile[];
}

export type OutputFormat = "markdown" | "json";
export type FailOn = "none" | Severity;
