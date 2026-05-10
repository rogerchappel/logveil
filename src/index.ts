export { buildBundle, scanDocument, lineColumnFor, maskEvidence } from "./scan.js";
export { renderJson, renderMarkdown } from "./render.js";
export { gateFailures, parseFailOn } from "./gates.js";
export { defaultRules } from "./rules.js";
export type { AuditSummary, BundleFile, FailOn, Finding, InputDocument, OutputFormat, ReproBundle, Severity } from "./types.js";
