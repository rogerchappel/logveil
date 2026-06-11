# Social Hooks

Grounded facts for short posts about LogVeil:

- Local-first sanitizer for agent logs, terminal captures, JSONL transcripts,
  and chat exports.
- Redaction is enabled by default.
- `redact` can produce Markdown and JSON evidence in one run.
- `audit --fail-on secret` returns exit code `2` when the configured threshold
  is met.
- Source files are read-only; LogVeil writes only requested outputs.

## Hooks

1. "Agent logs are useful evidence and risky copy-paste material. LogVeil turns them into local redacted repro bundles before you share."
2. "`logveil redact ./session.log --out repro-safe.md --json-out evidence.json` gives reviewers the story and automation the facts."
3. "Use `logveil audit --fail-on secret` as a pre-share gate for terminal captures and agent transcripts."

## Demo Clip Outline

1. Show `examples/agent-session.log`.
2. Run `node dist/cli.js redact examples/agent-session.log --out repro-safe.md --json-out redaction-evidence.json`.
3. Open the Markdown bundle and point out masked evidence.
4. Run `node dist/cli.js audit examples/agent-session.log --format json --fail-on secret`.
5. Explain that an exit code of `2` means the configured finding threshold was met.

