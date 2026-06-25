# Sanitize a Repro Bundle

This tutorial shows the smallest local workflow for turning an agent session log
into shareable Markdown plus machine-readable evidence.

## Run it

```sh
bash demo/sanitize-repro-bundle.sh
```

The script builds the CLI, redacts `examples/agent-session.log`, writes a
Markdown repro bundle, writes JSON evidence, and runs an audit report with
`--fail-on none`.

## Outputs

The generated files are written under `/tmp/logveil-demo`:

- `repro-safe.md`: Markdown bundle with masked evidence.
- `evidence.json`: structured redaction evidence.
- `audit.json`: audit report for automation.

## Review checklist

Before publishing a repro bundle, check that the Markdown output has the
expected context, verify that sensitive values are masked, and keep the original
log private.

For a multi-input chat transcript example, see [Sanitize a Chat Export and JSONL Session](sanitize-chat-export.md).
