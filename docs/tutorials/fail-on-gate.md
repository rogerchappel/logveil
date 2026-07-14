# Fail-On Gate Demo

This recipe shows how `logveil audit` can be used as a local pre-share gate for
fixture logs that contain secret-severity findings.

## Run

```sh
npm install
bash demo/fail-on-gate.sh
```

The script builds the CLI, audits `examples/agent-session.log`, and sets
`--fail-on secret`.

## Expected evidence

- `audit.json` contains the structured findings.
- `gate.stderr` contains the gate failure summary.
- The command exits `2`, which is expected when findings at or above the chosen
  severity are present.

Use this alongside `demo/sanitize-repro-bundle.sh`: sanitize for the shareable
bundle, then use the gate demo to show how automation can stop a risky publish
step before the bundle is reviewed.
