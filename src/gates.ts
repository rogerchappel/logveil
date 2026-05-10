import type { FailOn, ReproBundle, Severity } from "./types.js";

const rank: Record<Severity, number> = { info: 1, warning: 2, secret: 3 };

export function gateFailures(bundle: ReproBundle, failOn: FailOn): string[] {
  if (failOn === "none") return [];
  const threshold = rank[failOn];
  return bundle.files.flatMap((file) =>
    file.findings
      .filter((finding) => rank[finding.severity] >= threshold)
      .map((finding) => `${file.path}:${finding.line}:${finding.column} ${finding.severity}/${finding.type}`)
  );
}

export function parseFailOn(value: string | undefined): FailOn {
  if (!value) return "none";
  if (["none", "info", "warning", "secret"].includes(value)) return value as FailOn;
  throw new Error(`Invalid --fail-on value: ${value}. Expected none, info, warning, or secret.`);
}
