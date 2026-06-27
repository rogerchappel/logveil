#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/demo/output"
MARKDOWN_OUT="$OUT_DIR/repro-safe.md"
JSON_OUT="$OUT_DIR/evidence.json"
AUDIT_OUT="$OUT_DIR/audit.json"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null

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

echo "demo ok: wrote $MARKDOWN_OUT, $JSON_OUT, and $AUDIT_OUT"
