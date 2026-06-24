# Launch Note Draft

LogVeil turns agent logs, terminal captures, JSONL transcripts, and chat exports
into safer repro bundles that can be reviewed before sharing.

It is built for local incident and support workflows where the source log may
contain useful evidence alongside paths, emails, tokens, private IPs, or
secret-looking key/value pairs.

## Demo

```sh
bash demo/sanitize-repro-bundle.sh
```

The demo builds the CLI, redacts `examples/agent-session.log`, writes a Markdown
bundle, writes JSON evidence, and runs an audit report under `/tmp/logveil-demo`.

## Positioning

LogVeil is useful when maintainers need to share enough failure context for a
repro without publishing the raw session log.

## Limitations

LogVeil is an MVP redaction aid, not a complete DLP system. Review sanitized
bundles before publishing them, and keep original logs private.
