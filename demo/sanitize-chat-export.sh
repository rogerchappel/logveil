#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/logveil-chat-demo"
MARKDOWN_OUT="$OUT_DIR/chat-repro-safe.md"
JSON_OUT="$OUT_DIR/chat-evidence.json"
AUDIT_OUT="$OUT_DIR/chat-audit.json"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build >/dev/null

node dist/cli.js redact examples/chat-export.md examples/session.jsonl \
  --out "$MARKDOWN_OUT" \
  --json-out "$JSON_OUT"

node dist/cli.js audit examples/chat-export.md examples/session.jsonl \
  --format json \
  --fail-on none > "$AUDIT_OUT"

test -s "$MARKDOWN_OUT"
test -s "$JSON_OUT"
test -s "$AUDIT_OUT"
grep -q "chat-export.md" "$MARKDOWN_OUT"
grep -q "session.jsonl" "$MARKDOWN_OUT"
grep -q "REDACTED" "$MARKDOWN_OUT"
grep -q '"files": 2' "$AUDIT_OUT"

echo "demo ok: wrote $MARKDOWN_OUT, $JSON_OUT, and $AUDIT_OUT"
