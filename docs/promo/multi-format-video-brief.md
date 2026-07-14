# Short video brief: multi-format agent capture

## Angle

Show a maintainer collecting three different evidence formats into one safe
bundle before posting a repro in public.

## Demo beats

1. Show `examples/agent-session.log`, `examples/session.jsonl`, and
   `examples/chat-export.md`.
2. Run `bash demo/multi-format-capture.sh`.
3. Open `/tmp/logveil-multi-format-demo/repro-safe.md` and show that all three
   file sections are present.
4. Open `/tmp/logveil-multi-format-demo/evidence.json` and point to the file
   count and masked findings.
5. Explain `audit --fail-on secret` as the stricter pre-share gate.

## Caption draft

Agent evidence rarely fits one format. LogVeil can turn a log, JSONL transcript,
and chat export into one local redacted repro bundle plus JSON evidence.

## Boundaries

- LogVeil is not a complete DLP system.
- Source files are not mutated.
- Human review is still required before publishing sanitized evidence.
