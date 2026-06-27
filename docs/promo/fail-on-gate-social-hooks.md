# LogVeil Fail-On Gate Social Hooks

## Short posts

1. Sanitizing a log is useful. Failing a local gate before a risky share is even
   better. LogVeil's `--fail-on secret` path exits `2` and still leaves JSON
   evidence to inspect.

2. Agent repro bundles need two audiences: humans reading Markdown and scripts
   checking risk. LogVeil can produce both from a local fixture log without
   mutating the source.

3. The new LogVeil gate demo captures stdout JSON, stderr gate text, and the
   expected exit code so a PR can show exactly why a pre-share check failed.

## Grounded demo command

```sh
bash demo/fail-on-gate.sh
```

Do not describe LogVeil as complete DLP. It is a deterministic local sanitizer
and audit helper; reviewed output still matters before publishing.
