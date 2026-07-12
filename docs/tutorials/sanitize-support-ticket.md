# Sanitize a Support Ticket

This tutorial shows how to turn a synthetic support-ticket log into a shareable
Markdown repro bundle plus JSON evidence.

## Run it

```sh
npm install
bash demo/sanitize-support-ticket.sh
```

The script builds LogVeil, redacts `examples/support-ticket.log`, and writes
outputs under `${TMPDIR:-/tmp}/logveil-support-ticket`.

Generated files:

- `support-ticket-safe.md` for the shareable repro bundle.
- `support-ticket-evidence.json` for structured redaction evidence.
- `support-ticket-audit.json` for automation or issue triage.

## What the demo verifies

- Secret-shaped values are masked.
- Email and local home path evidence are not exposed in the Markdown bundle.
- The audit report is still generated with `--fail-on none`.
- The source fixture remains untouched.

Use this workflow when a bug report contains useful operational context but
needs to be scrubbed before it can be copied into a public issue or PR.
