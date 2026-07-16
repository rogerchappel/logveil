# LogVeil Agent Skill

Use this skill when an agent needs to share run logs, terminal captures, chat
exports, or release evidence without leaking obvious secrets or local account
details.

## Required Inputs

- One or more local `.log`, `.txt`, `.md`, `.json`, `.jsonl`, `.out`, or `.ansi`
  files, or a directory containing those files.
- A destination path for reports when the output should be kept as an artifact.
- An explicit `--write --out-dir <dir>` pair before creating sanitized file
  copies.

## Tools

- Run `npm install` and `npm run build` from this repository before using the
  checkout directly.
- Use `node dist/cli.js` from a checkout, or `logveil` after package install.

## Workflow

1. Audit first with JSON when the result will drive automation:
   `logveil audit ./logs --format json --fail-on secret`.
2. Produce a reviewable Markdown bundle:
   `logveil redact ./logs --out logveil-report.md --json-out logveil-report.json`.
3. If sanitized copies are needed, write them to a new artifact directory:
   `logveil redact ./logs --write --out-dir sanitized --out logveil-report.md`.
4. Review the report before pasting or publishing any sanitized output.

## Side-Effect Boundaries

- Default commands read inputs and write only explicit report paths.
- `--write` never mutates source files; it creates sanitized copies under the
  requested output directory and writes `logveil-write-manifest.json`.
- The tool makes no network calls and performs no telemetry.

## Approval Requirements

Ask for human approval before sharing generated reports outside the local
workspace, attaching sanitized artifacts to public issues, or using `--no-redact`.

## Validation

Run these checks before recommending a release-candidate PR:

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Examples

```bash
logveil audit examples/agent-session.log --format json --fail-on secret
logveil redact examples/agent-session.log --out /tmp/logveil-report.md
logveil redact examples/agent-session.log --write --out-dir /tmp/logveil-sanitized --out /tmp/logveil-report.md
```
