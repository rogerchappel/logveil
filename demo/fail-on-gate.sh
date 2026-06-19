#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/logveil-fail-on-gate"
AUDIT_JSON="$OUT_DIR/audit.json"
GATE_STDERR="$OUT_DIR/gate.stderr"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build

set +e
node dist/cli.js audit examples/agent-session.log \
  --format json \
  --fail-on secret > "$AUDIT_JSON" 2> "$GATE_STDERR"
gate_status=$?
set -e

test "$gate_status" -eq 2
test -s "$AUDIT_JSON"
test -s "$GATE_STDERR"
grep -q '"findings"' "$AUDIT_JSON"
grep -q "logveil gate failed" "$GATE_STDERR"

echo "Audit JSON: $AUDIT_JSON"
echo "Gate stderr: $GATE_STDERR"
echo "Expected gate exit: $gate_status"
