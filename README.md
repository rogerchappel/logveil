# LogVeil

LogVeil turns agent logs, terminal captures, JSONL transcripts, and chat exports into safe repro bundles you can review and share.

It is built for the awkward moment after an agent run fails: the log has useful evidence, but it may also contain home paths, API keys, tokens, emails, prompts, or private infrastructure details. LogVeil keeps the workflow local, deterministic, and scriptable.

## Quick start

```bash
npm install
npm run build
node dist/cli.js redact examples/agent-session.log --out repro-safe.md --json-out evidence.json
node dist/cli.js audit examples/agent-session.log --format json
```

For a fuller fixture-backed walkthrough, see
[docs/tutorials/sanitize-agent-session.md](docs/tutorials/sanitize-agent-session.md).

Runnable demos:

```bash
bash demo/sanitize-repro-bundle.sh
bash demo/sanitize-chat-export.sh
```

After package installation, use the binary directly:

```bash
logveil redact ./session.log --out repro-safe.md
logveil audit ./session.log --format json --fail-on secret
```

## Commands

### `redact`

Produces a Markdown repro bundle by default.

```bash
logveil redact ./session.log --out repro-safe.md
logveil redact ./logs --out repro-safe.md --json-out redaction-evidence.json
```

### `audit`

Produces JSON by default for automation.

```bash
logveil audit ./session.log --format json
logveil audit ./session.log --format markdown
```

## Gates

`--fail-on` exits with code `2` when findings at or above the selected severity exist.

```bash
logveil audit ./session.log --format json --fail-on secret
logveil audit ./session.log --format json --fail-on warning
```

Accepted values: `none`, `info`, `warning`, `secret`.

## Safety model

- Offline by default: no telemetry, SaaS calls, or hidden network access.
- Redaction is enabled by default.
- Outputs are deterministic, including a stable `createdAt` timestamp.
- Raw evidence is masked in reports.
- Source files are never mutated; LogVeil only writes when `--out` or `--json-out` is provided.

## Current redaction coverage

LogVeil detects common high-signal patterns:

- OpenAI-style `sk-...` API keys
- GitHub `ghp_...` and related tokens
- AWS access key IDs
- secret-looking key/value assignments
- email addresses
- Unix home-directory paths
- private IPv4 addresses

## Limitations

This is an MVP, not a complete DLP system. Review sanitized bundles before publishing them. Add project-specific checks around especially sensitive logs, binary captures, screenshots, or proprietary prompt content.

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
bash demo/sanitize-repro-bundle.sh
bash demo/sanitize-chat-export.sh
bash scripts/validate.sh
```

The smoke script uses checked-in fixtures under `examples/`.
