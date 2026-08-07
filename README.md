# LogVeil

LogVeil turns agent logs, terminal captures, JSONL transcripts, and chat exports into safe repro bundles you can review and share.

It is built for the awkward moment after an agent run fails: the log has useful evidence, but it may also contain home paths, API keys, tokens, emails, prompts, or private infrastructure details. LogVeil keeps the workflow local, deterministic, and scriptable.

## Install

The npm package is scoped to this repository's maintainer. The unscoped
`logveil` name belongs to an unrelated project, so always include the scope:

```bash
npm install --global @rogerchappel/logveil
logveil --help
```

You can also run the CLI without a global installation:

```bash
npx --package @rogerchappel/logveil logveil audit ./session.log --format json
```

## Quick start from source

```bash
npm ci
npm run build
node dist/cli.js redact examples/agent-session.log --out repro-safe.md --json-out evidence.json
node dist/cli.js audit examples/agent-session.log --format json
```

For a fuller fixture-backed walkthrough, see
[docs/tutorials/sanitize-agent-session.md](docs/tutorials/sanitize-agent-session.md).
For a multi-file demo across log, JSONL, and Markdown chat export fixtures, see
[docs/tutorials/multi-format-agent-capture.md](docs/tutorials/multi-format-agent-capture.md).
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

To create sanitized file copies, opt in explicitly with `--write` and choose an
artifact directory outside every directory input. Source files are not modified.

```bash
logveil redact ./logs --write --out-dir sanitized --out repro-safe.md
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
- Before writing, LogVeil resolves input and output paths. Report files and the
  `--out-dir` must be outside every directory input, preventing reports,
  manifests, and previously redacted copies from being collected on a later
  run. LogVeil also rejects outputs that alias a file input or another requested
  output. A rejected command leaves existing files unchanged.
- Sanitized copies require `--write --out-dir` and include a
  `logveil-write-manifest.json` manifest.

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

## Demo and promotion assets

- `bash demo/sanitize-repro-bundle.sh` builds the CLI and writes a single-log
  repro bundle under `/tmp/logveil-demo`.
- `bash demo/multi-format-capture.sh` builds the CLI and writes a combined
  log, JSONL, and chat-export bundle under `/tmp/logveil-multi-format-demo`.
- [Multi-format video brief](docs/promo/multi-format-video-brief.md) outlines a
  grounded short clip using checked-in fixtures.

## Release readiness

Before opening a release PR, run the same checks that CI runs:

```sh
npm run release:check
npm pack --dry-run
```

The package smoke installs the generated `rogerchappel-logveil-<version>.tgz`
tarball into a temporary app, imports `@rogerchappel/logveil`, runs the installed
`logveil` binary, and confirms the packaged examples can produce both Markdown
and JSON evidence before tagging or publishing. The release check also queries
the npm registry to ensure the scoped publish target is available or belongs to
this repository and that install documentation never relies on the unrelated
unscoped package.

Tagged releases run `scripts/release.mjs`, which requires the Git tag to equal
`v<package.json version>`. The driver parses exactly one `npm pack --json`
result, publishes that exact tarball with provenance, and attaches the same
file to the GitHub release only after npm publication succeeds. Pull requests
exercise these artifact and version gates with the driver's non-publishing dry
run.
