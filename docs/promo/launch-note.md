# LogVeil launch note draft

LogVeil turns agent logs, terminal captures, JSONL transcripts, and chat exports
into local repro bundles that are safer to review or share.

It is designed for post-failure debugging: keep the useful timeline and command
evidence, mask common secrets and private identifiers, and produce deterministic
Markdown and JSON outputs for a PR, issue, or incident note.

## Demo

```sh
npm install
npm run build
bash demo/sanitize-repro-bundle.sh
```

The demo uses committed fixtures under `examples/` and writes sanitized output
under `demo/output/`. The same flow can be adapted to `/tmp/logveil-demo` when
you want a disposable local capture.

## Useful proof points

- Local-first: no telemetry, SaaS calls, or hidden network access.
- Source logs are never mutated.
- Reports use stable timestamps for cleaner diffs.
- Redaction covers common API keys, GitHub tokens, AWS access key IDs,
  secret-looking assignments, emails, home paths, and private IPv4 addresses.
- `audit --fail-on` can turn findings into a CI gate without writing a bundle.

## Limits to say plainly

LogVeil is an MVP sanitizer, not a complete DLP system. Review sanitized
bundles before publishing them, especially when logs may contain proprietary
prompts, screenshots, binary captures, or domain-specific secrets.
