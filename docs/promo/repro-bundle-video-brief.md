# Short Video Brief: Sanitized Repro Bundle

## Angle

Show the handoff moment after an agent run fails: the log has useful evidence,
but it also contains paths, email addresses, or token-shaped strings.

## Demo beats

1. Open `examples/agent-session.log` and point out that it is a local fixture.
2. Run `bash demo/sanitize-repro-bundle.sh`.
3. Open `/tmp/logveil-demo/repro-safe.md` and show masked values.
4. Open `/tmp/logveil-demo/audit.json` to show automation-friendly findings.
5. Run `bash demo/sanitize-chat-export.sh` to show Markdown and JSONL inputs combined into one bundle.
6. Mention that source files are never mutated.

## What to say plainly

LogVeil is a local deterministic sanitizer for reviewable repro bundles. It is
not a complete DLP system, so sanitized output still deserves human review
before publishing.

## Caption draft

Agent failure logs can be useful and sensitive at the same time. LogVeil turns a
local session log into a masked repro bundle plus JSON evidence.
