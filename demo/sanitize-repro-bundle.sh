#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/logveil-demo"
MARKDOWN_OUT="$OUT_DIR/repro-safe.md"
JSON_OUT="$OUT_DIR/evidence.json"
AUDIT_OUT="$OUT_DIR/audit.json"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

node dist/cli.js redact examples/agent-session.log \
  --out "$MARKDOWN_OUT" \
  --json-out "$JSON_OUT"

node dist/cli.js audit examples/agent-session.log \
  --format json \
  --fail-on none > "$AUDIT_OUT"

test -s "$MARKDOWN_OUT"
test -s "$JSON_OUT"
test -s "$AUDIT_OUT"
grep -q "REDACTED" "$MARKDOWN_OUT"
grep -q "findings" "$AUDIT_OUT"

echo "Markdown repro bundle: $MARKDOWN_OUT"
echo "JSON evidence: $JSON_OUT"
echo "Audit report: $AUDIT_OUT"
