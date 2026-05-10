# LogVeil Tasks

## MVP

- [x] Scaffold an `oss-cli` TypeScript package.
- [x] Add deterministic input collection for files and directories.
- [x] Detect common API keys, tokens, key/value secrets, emails, paths, and private IPs.
- [x] Redact by default while preserving reviewable evidence.
- [x] Render Markdown repro bundles and JSON audit reports.
- [x] Support `redact` and `audit` commands.
- [x] Support `--out`, `--json-out`, `--format`, `--redact`, `--no-redact`, and `--fail-on`.
- [x] Add checked-in unsafe fixtures under `examples/`.
- [x] Add unit and CLI tests.
- [x] Add smoke and validation scripts.

## Follow-up

- [ ] Add configurable rule packs.
- [ ] Add SARIF export for code scanning integrations.
- [ ] Add Windows-path and cloud-provider specific rules.
- [ ] Add snapshot fixtures for renderer regression review.
- [ ] Add package release automation once the API settles.
