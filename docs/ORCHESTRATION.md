# LogVeil Orchestration

LogVeil is intentionally local-first. Agents and CI jobs should run it as a normal CLI, inspect deterministic artifacts, and fail builds only through explicit gates.

## Recommended agent flow

1. Capture a log, transcript, JSONL session, or terminal output into a local file.
2. Run `logveil redact <input> --out repro-safe.md --json-out evidence.json`.
3. Review `evidence.json` for redaction counts and finding locations.
4. Share only the sanitized Markdown bundle.
5. In CI, add `--fail-on warning` or `--fail-on secret` depending on policy.

## Determinism contract

- No telemetry or network calls.
- Stable `createdAt` value in generated bundles.
- Stable input ordering for directory traversal.
- Stable JSON key order from the typed bundle object.
- Evidence masks raw values and records replacement labels.

## Exit codes

- `0`: command completed and gates passed.
- `1`: usage or runtime error.
- `2`: `--fail-on` threshold matched one or more findings.
