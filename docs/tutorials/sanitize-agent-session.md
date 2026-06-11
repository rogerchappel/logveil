# Sanitize an Agent Session

This recipe uses the checked-in fixtures to create a shareable repro bundle and
an audit report without mutating the source log.

## Build

```sh
npm install
npm run build
```

## Redact a fixture log

```sh
node dist/cli.js redact examples/agent-session.log \
  --out repro-safe.md \
  --json-out redaction-evidence.json
```

`redact` writes Markdown for humans and JSON evidence for automation when both
output flags are provided. The source file remains unchanged.

## Audit for a gate

```sh
node dist/cli.js audit examples/agent-session.log --format json --fail-on secret
```

`--fail-on secret` exits with code `2` when secret-severity findings are present.
Use that behavior in a local pre-share check, then inspect the redacted bundle
before publishing it.

## Clean up generated files

```sh
rm -f repro-safe.md redaction-evidence.json
```

