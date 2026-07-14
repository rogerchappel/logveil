# Audit Before Sharing

This recipe shows how to use LogVeil when you want a quick publish/no-publish
check before attaching a repro bundle to an issue or pull request.

## Run the audit

```sh
npm run build
node dist/cli.js audit examples/agent-session.log --format json --fail-on none > /tmp/logveil-audit.json
```

Use `--fail-on none` when you want evidence without failing the command. Use a
stricter gate when automation should stop on sensitive findings:

```sh
node dist/cli.js audit examples/agent-session.log --format json --fail-on secret
```

Exit code `2` means the selected severity threshold was reached.

## Create the shareable bundle

```sh
node dist/cli.js redact examples/agent-session.log --out /tmp/repro-safe.md --json-out /tmp/repro-evidence.json
```

Review the Markdown bundle, confirm sensitive values are masked, and keep the
raw source log private.
