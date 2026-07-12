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
Promotion-ready launch notes and short post drafts live under
[`docs/promo/`](docs/promo/).
For a gate-oriented recipe, see
[docs/tutorials/audit-before-sharing.md](docs/tutorials/audit-before-sharing.md).

Runnable demos:

```bash
bash demo/sanitize-repro-bundle.sh
bash demo/sanitize-chat-export.sh
bash demo/sanitize-support-ticket.sh
```

The support-ticket demo uses a synthetic incident fixture and is documented in
[docs/tutorials/sanitize-support-ticket.md](docs/tutorials/sanitize-support-ticket.md).

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

For a fixture-backed gate demo that captures the expected `--fail-on secret`
exit code and evidence files:

```bash
bash demo/fail-on-gate.sh
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
## CLI Help Smoke

Confirm the packaged command starts and prints its help text before relying on a release tarball or downstream automation:

```bash
npm run build
node ./dist/cli.js --help
```

The command should exit successfully, print the available options, and avoid reading project files or contacting external services.

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

## Release readiness

Before opening a release PR, run the same checks that CI runs:

```sh
npm run release:check
npm pack --dry-run
```

The package smoke installs the generated tarball into a temporary app, runs the
installed `logveil` binary, and confirms the packaged examples can produce both
Markdown and JSON evidence before tagging or publishing.
