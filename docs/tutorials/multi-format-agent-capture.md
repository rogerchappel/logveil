# Sanitize a multi-format agent capture

Agent evidence often arrives as more than one file: a terminal log, a JSONL
message stream, and a copied chat export. LogVeil can collect those local files
in one run and produce a single repro bundle.

## Inputs

This repository includes three small fixtures:

- `examples/agent-session.log`
- `examples/session.jsonl`
- `examples/chat-export.md`

Each fixture contains token-shaped, path, or email-shaped evidence so the demo
shows masked output without using real private data.

## Run it

```sh
npm install
npm run build
bash demo/multi-format-capture.sh
```

The script writes outputs under `/tmp/logveil-multi-format-demo`:

- `repro-safe.md`: one Markdown bundle for the three input files.
- `evidence.json`: structured redaction evidence for automation.
- `audit.json`: JSON audit output generated with `--fail-on none`.

## Manual command

The core command is:

```sh
node dist/cli.js redact \
  examples/agent-session.log \
  examples/session.jsonl \
  examples/chat-export.md \
  --out /tmp/logveil-multi-format-demo/repro-safe.md \
  --json-out /tmp/logveil-multi-format-demo/evidence.json
```

Run an audit gate separately when you want a workflow to fail on a configured
severity:

```sh
node dist/cli.js audit examples --format json --fail-on secret
```

`--fail-on secret` exits with code `2` when secret-severity findings are present.
Use `--fail-on none` for a non-blocking report.
