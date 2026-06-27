# Sanitize a Chat Export and JSONL Session

This recipe turns two checked-in transcript fixtures into a single redacted repro bundle. It is useful when a handoff needs both the chat context and the structured tool transcript.

## Run it

```sh
npm install
npm run build
bash demo/sanitize-chat-export.sh
```

The script writes a temporary demo folder with:

- `chat-repro-safe.md` for human review
- `chat-evidence.json` for structured redaction evidence
- `chat-audit.json` for automation and gate checks

## What it scans

The demo reads:

- `examples/chat-export.md`, a Markdown chat export with email, home path, and password-shaped content
- `examples/session.jsonl`, a transcript line with a local token-shaped value and a home path

The source fixtures are never mutated.

## Gate without blocking the demo

```sh
node dist/cli.js audit examples/chat-export.md examples/session.jsonl --format json --fail-on none
```

Use `--fail-on secret` when you want a pre-share gate to return exit code `2` for secret-severity findings.
